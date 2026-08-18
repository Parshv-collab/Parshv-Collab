import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { PortfolioContent } from "../shared/portfolio";
import { passwordAdminProcedure, publicProcedure, router } from "./_core/trpc";
import { createAdminSession, getAdminSessionToken, revokeAdminSession, verifyAdminPassword, verifyAdminSession } from "./adminPassword";
import { getInquiries, getPortfolioContent, markInquiryRead, saveInquiry, savePortfolioContent } from "./portfolio";
import { storagePut } from "./storage";
import { getGithubActivity } from "./github";
import { getMongoDb } from "./mongo";

const urlOrEmpty = z.union([z.string().url(), z.literal("")]);
const skillSchema = z.object({ id: z.string().min(1).max(100), name: z.string().min(1).max(100), level: z.enum(["Working knowledge", "Strong", "Expert"]) });
const contentSchema = z.object({
  site: z.object({
    name: z.string().min(1).max(100), role: z.string().min(1).max(180), pitch: z.string().min(1).max(500), bio: z.string().min(1).max(5000), location: z.string().min(1).max(160), email: z.string().email().max(320), resumeUrl: urlOrEmpty, heroImage: urlOrEmpty, profileImage: urlOrEmpty, accent: z.string().regex(/^#[0-9a-fA-F]{6}$/), githubUrl: urlOrEmpty, githubUsername: z.string().max(100), linkedinUrl: urlOrEmpty, availability: z.enum(["Open to new work", "Currently booked", "Open to select conversations"]),
  }),
  skills: z.array(z.object({ id: z.string().min(1).max(100), title: z.string().min(1).max(100), items: z.array(skillSchema).max(24) })).max(12),
  projects: z.array(z.object({ id: z.string().min(1).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160), title: z.string().min(1).max(180), category: z.enum(["Design", "Frontend", "Full-stack", "Open source"]), summary: z.string().min(1).max(500), description: z.string().min(1).max(5000), role: z.string().min(1).max(250), tech: z.array(z.string().min(1).max(80)).max(30), liveUrl: urlOrEmpty, codeUrl: urlOrEmpty, images: z.array(urlOrEmpty).max(10), timeframe: z.string().max(120), problem: z.string().max(5000), approach: z.string().max(5000), solution: z.string().max(5000), outcome: z.string().max(5000) })).max(24),
  services: z.array(z.object({ id: z.string().min(1).max(100), eyebrow: z.string().min(1).max(30), title: z.string().min(1).max(150), description: z.string().min(1).max(800) })).max(12),
  testimonials: z.array(z.object({ id: z.string().min(1).max(100), quote: z.string().min(1).max(1200), name: z.string().min(1).max(120), role: z.string().max(180), avatarUrl: urlOrEmpty })).max(20),
  posts: z.array(z.object({ id: z.string().min(1).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160), title: z.string().min(1).max(180), excerpt: z.string().min(1).max(600), body: z.string().min(1).max(20000), tags: z.array(z.string().min(1).max(60)).max(10), publishedAt: z.string().datetime() })).max(100),
});

export const appRouter = router({
  admin: router({
    login: publicProcedure.input(z.object({ password: z.string().min(1).max(256) })).mutation(async ({ input }) => {
      if (!verifyAdminPassword(input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password." });
      return { sessionToken: await createAdminSession() };
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await revokeAdminSession(getAdminSessionToken(ctx.req.headers));
      return { success: true } as const;
    }),
    status: publicProcedure.query(async ({ ctx }) => ({ editing: await verifyAdminSession(getAdminSessionToken(ctx.req.headers)) })),
    mongoStatus: passwordAdminProcedure.query(async () => {
      const checkedAt = new Date().toISOString();
      try {
        const db = await getMongoDb();
        await db.command({ ping: 1 });
        return { connected: true, checkedAt } as const;
      } catch {
        return { connected: false, checkedAt } as const;
      }
    }),
  }),

  portfolio: router({
    content: publicProcedure.query(() => getPortfolioContent()),
    githubActivity: publicProcedure.query(async () => {
      const content = await getPortfolioContent();
      return getGithubActivity(content.site.githubUsername);
    }),
    saveContent: passwordAdminProcedure.input(contentSchema).mutation(async ({ input }) => {
      await savePortfolioContent(input as PortfolioContent);
      return { success: true } as const;
    }),
    inquiries: passwordAdminProcedure.query(() => getInquiries()),
    markInquiryRead: passwordAdminProcedure.input(z.object({ id: z.string().min(1), read: z.boolean() })).mutation(async ({ input }) => {
      await markInquiryRead(input.id, input.read);
      return { success: true } as const;
    }),
    submitInquiry: publicProcedure
      .input(z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(320), message: z.string().trim().min(20).max(4000) }))
      .mutation(async ({ input }) => {
        await saveInquiry(input);
        return { success: true } as const;
      }),
    uploadMedia: passwordAdminProcedure
      .input(z.object({ filename: z.string().trim().regex(/^[a-zA-Z0-9._-]+$/).max(180), contentType: z.string().regex(/^(image\/(png|jpeg|webp|avif)|application\/pdf)$/), dataBase64: z.string().min(20).max(7_000_000) }))
      .mutation(async ({ input }) => {
        const encoded = input.dataBase64.includes(",") ? input.dataBase64.split(",").pop() : input.dataBase64;
        if (!encoded) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload data is invalid." });
        const buffer = Buffer.from(encoded, "base64");
        if (buffer.length > 5_000_000) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Files must be 5 MB or smaller." });
        return storagePut(`portfolio/admin-content/${input.filename}`, buffer, input.contentType);
      }),
  }),
});

export type AppRouter = typeof appRouter;

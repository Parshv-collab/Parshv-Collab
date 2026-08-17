import crypto from "node:crypto";
import { parse } from "cookie";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getPortfolioContent, savePortfolioContent, saveContactMessage, type PortfolioContent } from "./db";
import { storagePut } from "./storage";

const ADMIN_COOKIE = "parshv_admin_session";
const serializeAdminCookie = (value: string, maxAge: number) => `${ADMIN_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
const adminToken = () => crypto.createHmac("sha256", process.env.JWT_SECRET || "portfolio-secret").update(process.env.ADMIN_PASSWORD || "AdminPass123!").digest("hex");
const isAdmin = (cookieHeader?: string) => !!cookieHeader && parse(cookieHeader)[ADMIN_COOKIE] === adminToken();
const contentSchema = z.object({ hero: z.object({ eyebrow: z.string(), headline: z.string(), bio: z.string(), githubUrl: z.string(), location: z.string(), profilePhoto: z.string().optional(), techStack: z.array(z.string()) }), projects: z.array(z.object({ id: z.string(), title: z.string(), description: z.string(), tech: z.array(z.string()), demoUrl: z.string(), repoUrl: z.string(), imageUrl: z.string().optional() })), skills: z.array(z.object({ id: z.string(), name: z.string(), level: z.number().min(0).max(100), category: z.string() })), posts: z.array(z.object({ id: z.string(), title: z.string(), excerpt: z.string(), date: z.string(), body: z.string(), coverUrl: z.string().optional() })), openSource: z.array(z.object({ id: z.string(), name: z.string(), description: z.string(), url: z.string(), stars: z.string().optional(), language: z.string().optional() })) });
const adminOnly = publicProcedure.use(({ ctx, next }) => { if (!isAdmin(ctx.req.headers.cookie)) throw new Error("Admin session required"); return next(); });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  portfolio: router({
    get: publicProcedure.query(() => getPortfolioContent()),
    contact: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), message: z.string().min(5) })).mutation(({ input }) => saveContactMessage(input)),
  }),
  admin: router({
    login: publicProcedure.input(z.object({ password: z.string() })).mutation(({ input, ctx }) => { if (input.password !== (process.env.ADMIN_PASSWORD || "AdminPass123!")) throw new Error("Invalid password"); if (ctx.res.setHeader) ctx.res.setHeader("Set-Cookie", serializeAdminCookie(adminToken(), 60 * 60 * 24 * 7)); return { success: true as const }; }),
    session: publicProcedure.query(({ ctx }) => ({ authenticated: isAdmin(ctx.req.headers.cookie) })),
    save: adminOnly.input(contentSchema).mutation(({ input }) => savePortfolioContent(input as PortfolioContent)),
    uploadImage: adminOnly.input(z.object({ filename: z.string(), contentType: z.string(), data: z.string() })).mutation(async ({ input }) => { const result = await storagePut(`portfolio/${input.filename}`, Buffer.from(input.data, "base64"), input.contentType); return result; }),
    logout: publicProcedure.mutation(({ ctx }) => { if (ctx.res.setHeader) ctx.res.setHeader("Set-Cookie", serializeAdminCookie("", 0)); return { success: true as const }; }),
  }),
});

export type AppRouter = typeof appRouter;

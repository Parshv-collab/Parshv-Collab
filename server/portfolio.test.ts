import { describe, expect, it, vi } from "vitest";

const { sample } = vi.hoisted(() => ({ sample: { hero: { eyebrow: "x", headline: "h", bio: "b", githubUrl: "https://github.com", location: "x", techStack: ["React"] }, projects: [], skills: [], posts: [], openSource: [] } }));
vi.mock("./db", () => ({ getPortfolioContent: vi.fn().mockResolvedValue(sample), savePortfolioContent: vi.fn().mockImplementation(async (value: unknown) => value), saveContactMessage: vi.fn().mockResolvedValue({ id: "message-1", success: true }) }));
vi.mock("./storage", () => ({ storagePut: vi.fn().mockResolvedValue({ key: "portfolio/test.png", url: "/manus-storage/portfolio/test.png" }) }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (cookie?: string, setHeader?: (name: string, value: string) => void): TrpcContext => ({ user: null, req: { headers: { cookie } } as TrpcContext["req"], res: { setHeader, clearCookie: vi.fn() } as unknown as TrpcContext["res"] });

describe("portfolio content procedures", () => {
  it("reads public content", async () => { expect(await appRouter.createCaller(context()).portfolio.get()).toEqual(sample); });
  it("stores a validated contact message", async () => { expect(await appRouter.createCaller(context()).portfolio.contact({ name: "Parshv", email: "hello@example.com", message: "Hello there" })).toMatchObject({ success: true }); });
  it("rejects admin save without the password session", async () => { await expect(appRouter.createCaller(context()).admin.save(sample)).rejects.toThrow("Admin session required"); });
  it("allows admin save after password login", async () => { let cookie = ""; const loginResult = await appRouter.createCaller(context(undefined, (_name, value) => { cookie = value.split(";")[0]; })).admin.login({ password: "AdminPass123!" }); expect(loginResult.success).toBe(true); expect(await appRouter.createCaller(context(cookie)).admin.save(sample)).toEqual(sample); });
  it("rejects upload without the password session", async () => { await expect(appRouter.createCaller(context()).admin.uploadImage({ filename: "x.png", contentType: "image/png", data: "AA==" })).rejects.toThrow("Admin session required"); });
});

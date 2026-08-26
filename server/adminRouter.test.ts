import { describe, expect, it } from "vitest";
import { createDraftProject, defaultPortfolioContent } from "../shared/portfolio";
import { createAdminSession } from "./adminPassword";
import { appRouter, contentSchema, normalizeOptionalWebUrl } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(sessionToken?: string): TrpcContext {
  return { req: { headers: sessionToken ? { "x-admin-session": sessionToken } : {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("password-protected portfolio routes", () => {
  it("rejects direct content writes without a server-verified admin session", async () => {
    await expect(appRouter.createCaller(context()).portfolio.saveContent(defaultPortfolioContent)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("accepts a password-issued session on the server", async () => {
    const sessionToken = await createAdminSession();
    await expect(appRouter.createCaller(context(sessionToken)).admin.status()).resolves.toEqual({ editing: true });
  });

  it("requires each saved project to declare whether it is visible", () => {
    expect(contentSchema.parse(defaultPortfolioContent).projects[0]?.visible).toBe(true);
    const withoutVisibility = structuredClone(defaultPortfolioContent);
    delete (withoutVisibility.projects[0] as Partial<typeof withoutVisibility.projects[number]>).visible;
    expect(() => contentSchema.parse(withoutVisibility)).toThrow();
  });

  it("accepts blank URLs and normalizes a repository address without a protocol", () => {
    const content = structuredClone(defaultPortfolioContent);
    const project = createDraftProject("new-project");
    project.liveUrl = "   ";
    project.codeUrl = "github.com/Parshv-collab/signal-atelier";
    project.images = ["/api/media/6a89116f45be2a99ff20bfd0"];
    content.projects = [project];

    const parsed = contentSchema.parse(content);
    expect(parsed.projects[0]?.liveUrl).toBe("");
    expect(parsed.projects[0]?.codeUrl).toBe("https://github.com/Parshv-collab/signal-atelier");
    expect(parsed.projects[0]?.images).toEqual(["/api/media/6a89116f45be2a99ff20bfd0"]);
    expect(normalizeOptionalWebUrl(" //example.com/project ")).toBe("https://example.com/project");
    expect(normalizeOptionalWebUrl("/api/media/6a89116f45be2a99ff20bfd0")).toBe("/api/media/6a89116f45be2a99ff20bfd0");
  });

  it("accepts only the five owner-approved palette identifiers", () => {
    expect(contentSchema.parse(defaultPortfolioContent).site.palette).toBe("luxurious");
    const unsupportedPalette = structuredClone(defaultPortfolioContent);
    (unsupportedPalette.site as { palette: string }).palette = "neon-green";
    expect(() => contentSchema.parse(unsupportedPalette)).toThrow();
  });
});

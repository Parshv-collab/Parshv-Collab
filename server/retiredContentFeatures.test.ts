import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sharedSource = readFileSync(resolve(import.meta.dirname, "../shared/portfolio.ts"), "utf8");
const routerSource = readFileSync(resolve(import.meta.dirname, "./routers.ts"), "utf8");
const appSource = readFileSync(resolve(import.meta.dirname, "../client/src/App.tsx"), "utf8");
const adminSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Admin.tsx"), "utf8");

describe("retired content features", () => {
  it("removes testimonials and writing from the content contract, public routes, and Content Studio", () => {
    expect(sharedSource).not.toContain("Testimonial");
    expect(sharedSource).not.toContain("WritingPost");
    expect(routerSource).not.toContain("testimonials:");
    expect(routerSource).not.toContain("posts:");
    expect(appSource).not.toContain('path={"/writing"}');
    expect(adminSource).not.toContain("Verified client quotes");
    expect(adminSource).not.toContain("Writing posts");
  });
});

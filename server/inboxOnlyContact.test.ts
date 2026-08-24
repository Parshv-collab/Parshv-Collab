import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(resolve(import.meta.dirname, "./routers.ts"), "utf8");
const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

describe("inbox-only contact flow", () => {
  it("persists enquiries without invoking an email provider and confirms Content Studio review", () => {
    expect(routerSource).toContain("await saveInquiry(input)");
    expect(routerSource).not.toContain("sendContactEmail");
    expect(routerSource).not.toContain("emailDelivered");
    expect(homeSource).toContain("owner can review it in Content Studio");
    expect(homeSource).not.toContain("emailDelivered");
  });
});

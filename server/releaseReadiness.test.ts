import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");
const adminSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Admin.tsx"), "utf8");

describe("release readiness interaction contract", () => {
  it("retains the essential public, mobile dialog, contact, and owner-entry affordances", () => {
    expect(homeSource).toContain('aria-label="Main navigation"');
    expect(homeSource).toContain('aria-label="Toggle navigation"');
    expect(homeSource).toContain("Inquiry saved. The owner can review it in Content Studio.");
    expect(homeSource).toContain("owner can now review your message privately in Content Studio");
    expect(homeSource).toContain("Swipe down to close project details");
    expect(homeSource).toContain('aria-label={`Close ${project.title} details`}');
    expect(adminSource).toContain("Enter editing mode");
    expect(adminSource).toContain("Content Studio");
  });
});

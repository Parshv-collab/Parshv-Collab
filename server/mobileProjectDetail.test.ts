import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

describe("compact mobile project details", () => {
  it("keeps mobile previews compact and opens full project details in an accessible dialog", () => {
    expect(homeSource).toContain("function MobileProjectPreview");
    expect(homeSource).toContain("md:hidden");
    expect(homeSource).toContain("<MobileProjectDialog");
    expect(homeSource).toContain("<DialogTitle");
    expect(homeSource).toContain("View details for ${project.title}");
    expect(homeSource).toContain("slide-in-from-bottom-4");
    expect(homeSource).toContain("Close ${project.title} details");
    expect(homeSource).toContain(">Close</DialogClose>");
    expect(homeSource).toContain('drag={shouldReduceMotion ? false : "y"}');
    expect(homeSource).toContain("onDragEnd={closeOnSwipe}");
    expect(homeSource).toContain("shouldDismissProjectDialog(info)");
  });
});

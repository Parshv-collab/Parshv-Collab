import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("featured project presentation", () => {
  it("shows every featured project without category or technology filter bars", () => {
    const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(homeSource).toContain("const visibleProjects = publishedProjects;");
    expect(homeSource).not.toContain("work-filter-strip");
    expect(homeSource).not.toContain("setFilter(");
    expect(homeSource).not.toContain("onTechnologySelect");
  });
});

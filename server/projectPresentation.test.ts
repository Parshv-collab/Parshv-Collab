import { defaultPortfolioContent } from "../shared/portfolio";
import { getProjectSignal } from "../shared/projectPresentation";
import { describe, expect, it } from "vitest";

describe("project hover signal", () => {
  it("preserves the project summary and uses a singular or plural implementation metric", () => {
    const project = defaultPortfolioContent.projects[0]!;
    expect(getProjectSignal(project)).toEqual({
      summary: project.summary,
      metric: `${project.tech.length} implementation tools`,
    });
    expect(getProjectSignal({ summary: "Focused build.", tech: ["React"] })).toEqual({
      summary: "Focused build.",
      metric: "1 implementation tool",
    });
    expect(getProjectSignal({ summary: "Research-first build.", tech: [] })).toEqual({
      summary: "Research-first build.",
      metric: "0 implementation tools",
    });
  });
});

import { describe, expect, it } from "vitest";
import { defaultPortfolioContent } from "../shared/portfolio";

describe("personalized portfolio defaults", () => {
  it("uses Parshv Chandaria’s supplied identity and selected work rather than starter content", () => {
    expect(defaultPortfolioContent.site.name).toBe("Parshv Chandaria");
    expect(defaultPortfolioContent.site.email).toBe("chandariaparshv@gmail.com");
    expect(defaultPortfolioContent.site.githubUsername).toBe("Parshv-collab");
    expect(defaultPortfolioContent.projects[0]).toMatchObject({
      title: "Jarvis",
      category: "Open source",
      codeUrl: "https://github.com/Parshv-collab/Jarvis-Voice-Assistant",
    });
    expect(defaultPortfolioContent.projects).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "sample-pulseboard", title: "Sample — Pulseboard" }),
      expect.objectContaining({ id: "sample-circuit-lab", title: "Sample — Circuit Lab" }),
    ]));
    expect(defaultPortfolioContent.projects).toHaveLength(3);
    expect(defaultPortfolioContent).not.toHaveProperty("posts");
    expect(defaultPortfolioContent).not.toHaveProperty("testimonials");
  });
});

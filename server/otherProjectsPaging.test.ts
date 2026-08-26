import { getOtherProjectsPage, OTHER_PROJECTS_PAGE_SIZE } from "../shared/otherProjects";
import { describe, expect, it } from "vitest";

describe("Other Projects progressive paging", () => {
  it("reveals a multi-project compact list in deterministic three-item increments until every item is shown", () => {
    const projects = Array.from({ length: 7 }, (_, index) => ({ id: `other-${index + 1}` }));

    const first = getOtherProjectsPage(projects, OTHER_PROJECTS_PAGE_SIZE);
    expect(first.shownProjects.map(project => project.id)).toEqual(["other-1", "other-2", "other-3"]);
    expect(first.remainingCount).toBe(4);
    expect(first.nextShownCount).toBe(6);

    const second = getOtherProjectsPage(projects, first.nextShownCount);
    expect(second.shownProjects).toHaveLength(6);
    expect(second.remainingCount).toBe(1);
    expect(second.nextShownCount).toBe(7);

    const complete = getOtherProjectsPage(projects, second.nextShownCount);
    expect(complete.shownProjects).toHaveLength(7);
    expect(complete.remainingCount).toBe(0);
    expect(complete.nextShownCount).toBe(7);
  });
});

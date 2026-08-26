export const OTHER_PROJECTS_PAGE_SIZE = 3;

export function getOtherProjectsPage<T>(projects: T[], shownCount: number, pageSize = OTHER_PROJECTS_PAGE_SIZE) {
  const safeShownCount = Math.max(0, Math.min(shownCount, projects.length));
  const shownProjects = projects.slice(0, safeShownCount);
  const remainingCount = Math.max(0, projects.length - shownProjects.length);
  const nextShownCount = Math.min(safeShownCount + pageSize, projects.length);
  return { shownProjects, remainingCount, nextShownCount };
}

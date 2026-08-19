import type { Project } from "./portfolio";

export function getProjectSignal(project: Pick<Project, "summary" | "tech">) {
  const toolCount = project.tech.length;
  return {
    summary: project.summary,
    metric: `${toolCount} implementation ${toolCount === 1 ? "tool" : "tools"}`,
  };
}

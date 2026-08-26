import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const adminSource = readFileSync(resolve(process.cwd(), "client/src/pages/Admin.tsx"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("compact Other Projects presentation", () => {
  it("separates projects excluded from Selected Work and renders them in a denser public list", () => {
    const projects = [
      { id: "featured", visible: true, hidden: false },
      { id: "other", visible: false, hidden: false },
      { id: "hidden", visible: false, hidden: true },
    ];
    const publicProjects = projects.filter(project => !project.hidden);
    expect(publicProjects.filter(project => project.visible).map(project => project.id)).toEqual(["featured"]);
    expect(publicProjects.filter(project => !project.visible).map(project => project.id)).toEqual(["other"]);
    expect(homeSource).toContain("const publicProjects = useMemo(() => content.projects.filter(project => !project.hidden)");
    expect(homeSource).toContain("const otherProjects = useMemo(() => publicProjects.filter(project => !project.visible)");
    expect(homeSource).toContain("<OtherProjects projects={otherProjects} />");
    expect(homeSource).toContain("OTHER PROJECTS");
    expect(homeSource).toContain("More work, in brief.");
    expect(homeSource).toContain("sm:min-h-[88px] sm:p-3");
    expect(homeSource).toContain("h-12 w-12 shrink-0");
    expect(homeSource).toContain("hidden line-clamp-1 text-xs text-white/48 sm:block");
    expect(adminSource).toContain("Feature in Selected Work");
    expect(adminSource).toContain("Show publicly");
    expect(routerSource).toContain("hidden: z.boolean().default(false)");
  });

  it("keeps long lists progressive and exposes a reduced-motion-aware thumbnail preview on pointer and keyboard interaction", () => {
    expect(homeSource).toContain('new URLSearchParams(window.location.search).get("qaOtherProjects") === "7"');
    expect(homeSource).toContain("isLoading={contentQuery.isLoading && !hasDevelopmentOtherProjectsFixture}");
    expect(homeSource).toContain("const [shownCount, setShownCount] = useState(3)");
    expect(homeSource).toContain("const { shownProjects, remainingCount, nextShownCount } = getOtherProjectsPage(projects, shownCount)");
    expect(homeSource).toContain("setShownCount(nextShownCount)");
    expect(homeSource).toContain("Load {Math.min(OTHER_PROJECTS_PAGE_SIZE, remainingCount)} more project");
    expect(homeSource).toContain("onMouseEnter={() => setPreviewProject(project)}");
    expect(homeSource).toContain("onFocus={() => setPreviewProject(project)}");
    expect(homeSource).toContain("Hover or focus a project");
    expect(homeSource).toContain("const shouldReduceMotion = useReducedMotion()");
    expect(homeSource).toContain("motion-reduce:transition-none");
  });
});

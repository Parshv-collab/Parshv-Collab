import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createDraftProject, defaultPortfolioContent, type PortfolioContent, type Project } from "@shared/portfolio";
import { ArrowUpRight, Check, FileUp, LockKeyhole, LogOut, Plus, Save, UploadCloud } from "lucide-react";
import { ChangeEvent, type CSSProperties, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function cloneContent(content: PortfolioContent) {
  return JSON.parse(JSON.stringify(content)) as PortfolioContent;
}

export default function Admin() {
  const utils = trpc.useUtils();
  const status = trpc.admin.status.useQuery();
  const [password, setPassword] = useState("");
  const login = trpc.admin.login.useMutation({
    onSuccess: async result => {
      sessionStorage.setItem("signal-atelier-admin-session", result.sessionToken);
      setPassword("");
      await utils.admin.status.invalidate();
    },
  });
  const logout = trpc.admin.logout.useMutation({
    onSettled: async () => {
      sessionStorage.removeItem("signal-atelier-admin-session");
      await utils.admin.status.invalidate();
    },
  });

  if (status.isLoading) return <div className="min-h-screen bg-[#09090b]" />;
  if (!status.data?.editing) {
    return <main className="grid min-h-screen place-items-center bg-[#09090b] px-6 text-[#f5f5f5]"><form onSubmit={event => { event.preventDefault(); login.mutate({ password }); }} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.025] p-7 text-center"><LockKeyhole className="mx-auto mb-6 h-7 w-7 text-[#b8ff5c]" /><p className="eyebrow">OWNER EDITING MODE</p><h1 className="mt-4 text-4xl font-black tracking-[-0.06em]">Unlock Content Studio.</h1><p className="mt-5 leading-7 text-white/55">Enter the editing password to manage portfolio content, media, and inquiries.</p><label className="form-label mt-7 text-left">Editing password<Input value={password} onChange={event => setPassword(event.target.value)} type="password" autoFocus className="form-input h-11" autoComplete="current-password" /></label>{login.error && <p role="alert" className="mt-3 text-left text-sm text-[#ff9e7a]">{login.error.message}</p>}<Button type="submit" disabled={login.isPending || !password} className="mt-6 w-full bg-[#b8ff5c] text-black hover:bg-[#d0ff87]">{login.isPending ? "Verifying…" : "Enter editing mode"}</Button></form></main>;
  }

  return <AdminStudio onExit={() => logout.mutate()} />;
}

function AdminStudio({ onExit }: { onExit: () => void }) {
  const utils = trpc.useUtils();
  const contentQuery = trpc.portfolio.content.useQuery();
  const [draft, setDraft] = useState<PortfolioContent>(cloneContent(defaultPortfolioContent));
  const [skillsText, setSkillsText] = useState("");
  const [projectsText, setProjectsText] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [testimonialsText, setTestimonialsText] = useState("");
  const [postsText, setPostsText] = useState("");
  const [lastUploaded, setLastUploaded] = useState("");
  const [mediaTarget, setMediaTarget] = useState<"heroImage" | "profileImage" | "resumeUrl" | "project">("heroImage");
  const [projectTargetId, setProjectTargetId] = useState("");

  useEffect(() => {
    if (!contentQuery.data) return;
    const next = cloneContent(contentQuery.data);
    setDraft(next);
    setSkillsText(JSON.stringify(next.skills, null, 2));
    setProjectsText(JSON.stringify(next.projects, null, 2));
    setServicesText(JSON.stringify(next.services, null, 2));
    setTestimonialsText(JSON.stringify(next.testimonials, null, 2));
    setPostsText(JSON.stringify(next.posts, null, 2));
    setProjectTargetId(next.projects[0]?.id ?? "");
  }, [contentQuery.data]);

  const saveContent = trpc.portfolio.saveContent.useMutation({
    onMutate: async next => {
      await utils.portfolio.content.cancel();
      const previous = utils.portfolio.content.getData();
      utils.portfolio.content.setData(undefined, next as PortfolioContent);
      return { previous };
    },
    onSuccess: () => {
      toast.success("Project and portfolio changes are now live.");
    },
    onError: (error, _next, context) => {
      if (context?.previous) utils.portfolio.content.setData(undefined, context.previous);
      toast.error(error.message);
    },
    onSettled: () => utils.portfolio.content.invalidate(),
  });

  const uploadMedia = trpc.portfolio.uploadMedia.useMutation({
    onSuccess: result => {
      setLastUploaded(result.url);
      navigator.clipboard?.writeText(result.url);
      if (mediaTarget === "project") {
        setDraft(current => {
          const projects = current.projects.map((project, index) => project.id === (projectTargetId || current.projects[index]?.id) ? { ...project, images: Array.from(new Set([...project.images, result.url])) } : project);
          setProjectsText(JSON.stringify(projects, null, 2));
          return { ...current, projects };
        });
      } else {
        setDraft(current => ({ ...current, site: { ...current.site, [mediaTarget]: result.url } }));
      }
      toast.success("Media uploaded — the URL has been copied.");
    },
    onError: error => toast.error(error.message),
  });

  const inquiries = trpc.portfolio.inquiries.useQuery(undefined, { enabled: true });
  const markInquiryRead = trpc.portfolio.markInquiryRead.useMutation({ onSuccess: () => utils.portfolio.inquiries.invalidate() });
  const mongoStatus = trpc.admin.mongoStatus.useQuery(undefined, { refetchInterval: 30_000, retry: false });

  const setSite = (key: keyof PortfolioContent["site"], value: string) => {
    setDraft(current => ({ ...current, site: { ...current.site, [key]: value } }));
  };

  const setProjectVisibility = (id: string, visible: boolean) => {
    setDraft(current => {
      const projects = current.projects.map(project => project.id === id ? { ...project, visible } : project);
      setProjectsText(JSON.stringify(projects, null, 2));
      const project = projects.find(item => item.id === id);
      toast.success(`${project?.title ?? "Project"} will be ${visible ? "visible" : "hidden"} after you save changes.`);
      return { ...current, projects };
    });
  };

  const updateProject = (id: string, changes: Partial<Project>) => {
    setDraft(current => {
      const projects = current.projects.map(project => project.id === id ? { ...project, ...changes } : project);
      setProjectsText(JSON.stringify(projects, null, 2));
      return { ...current, projects };
    });
  };

  const addProject = () => {
    const project = createDraftProject(`project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
    setDraft(current => {
      const projects = [...current.projects, project];
      setProjectsText(JSON.stringify(projects, null, 2));
      return { ...current, projects };
    });
    setProjectTargetId(project.id);
    setMediaTarget("project");
    toast.success("New project added. Complete the direct fields, then save changes.");
  };

  const applyJsonEditors = () => {
    try {
      const next = {
        ...draft,
        skills: JSON.parse(skillsText),
        projects: JSON.parse(projectsText),
        services: JSON.parse(servicesText),
        testimonials: JSON.parse(testimonialsText),
        posts: JSON.parse(postsText),
      } as PortfolioContent;
      setDraft(next);
      toast.success("Structured content applied to the live preview.");
      return next;
    } catch {
      toast.error("One of the structured content panels contains invalid JSON.");
      return null;
    }
  };

  const handleSave = () => {
    const next = applyJsonEditors();
    if (next) saveContent.mutate(next);
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error("Please select a file smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => uploadMedia.mutate({ filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "-"), contentType: file.type, dataBase64: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const siteFields = useMemo(() => [
    ["name", "Portfolio name"], ["role", "Role / signal line"], ["location", "Location"], ["email", "Contact email"], ["resumeUrl", "Résumé file URL"], ["heroImage", "Hero image URL"], ["profileImage", "Profile image URL"], ["githubUrl", "GitHub URL"], ["githubUsername", "GitHub username"], ["linkedinUrl", "LinkedIn URL"],
  ] as const, []);

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-5 text-[#f5f5f5] md:px-8">
      <div className="admin-shell mx-auto max-w-7xl space-y-8 pb-12">
        <header className="admin-header">
          <div>
            <p className="eyebrow">CONTENT STUDIO</p>
            <h1>Direct the whole experience.</h1>
            <p>Changes are validated, saved to the database, and immediately reflected on the public portfolio after publishing.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-white/15 text-white hover:bg-white/10"><a href="/" target="_blank" rel="noreferrer">Open site <ArrowUpRight className="ml-2 h-4 w-4" /></a></Button>
            <Button onClick={onExit} variant="outline" className="border-white/15 text-white hover:bg-white/10"><LogOut className="mr-2 h-4 w-4" />Exit editing mode</Button>
            <Button onClick={handleSave} disabled={saveContent.isPending} className="bg-[#b8ff5c] text-black hover:bg-[#d0ff87]"><Save className="mr-2 h-4 w-4" />{saveContent.isPending ? "Saving" : "Save changes"}</Button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <div className="space-y-6">
            <section className="admin-card">
              <div className="admin-card-title"><span>01</span><h2>Core narrative</h2></div>
              <div className="grid gap-4 sm:grid-cols-2">
                {siteFields.map(([key, label]) => <label key={key} className="form-label">{label}<Input value={draft.site[key]} onChange={e => setSite(key, e.target.value)} className="form-input" /></label>)}
                <label className="form-label">Availability<select value={draft.site.availability} onChange={event => setDraft(current => ({ ...current, site: { ...current.site, availability: event.target.value as PortfolioContent["site"]["availability"] } }))} className="form-input h-10 rounded-md px-3"><option>Open to new work</option><option>Currently booked</option><option>Open to select conversations</option></select></label>
                <label className="form-label">Signature color<Input value={draft.site.accent} onChange={e => setSite("accent", e.target.value)} pattern="^#[0-9A-Fa-f]{6}$" className="form-input" /></label>
              </div>
              <label className="form-label mt-4">Hero pitch<Textarea value={draft.site.pitch} onChange={e => setSite("pitch", e.target.value)} className="form-input min-h-24" /></label>
              <label className="form-label mt-4">Bio<Textarea value={draft.site.bio} onChange={e => setSite("bio", e.target.value)} className="form-input min-h-36" /></label>
            </section>

            <StructuredEditor title="02 / Skill groups" value={skillsText} onChange={setSkillsText} onApply={applyJsonEditors} hint="Edit category titles, skills, and levels. Keep the existing object structure." />
            <section className="admin-card"><div className="admin-card-title flex-wrap justify-between gap-3"><div className="flex items-center gap-2"><span>PROJECTS</span><h2>Project cards</h2></div><Button type="button" onClick={addProject} className="bg-[#b8ff5c] text-black hover:bg-[#d0ff87]"><Plus className="mr-2 h-4 w-4" />Add project</Button></div><p className="mb-5 text-sm leading-6 text-white/50">Create and edit every public card here. Live and GitHub links are optional—paste a complete URL or a domain such as <span className="font-mono text-white/70">github.com/your-repo</span>; blank fields are accepted.</p><div className="space-y-4">{draft.projects.map(project => <ProjectEditorCard key={project.id} project={project} onChange={changes => updateProject(project.id, changes)} onVisibilityChange={visible => setProjectVisibility(project.id, visible)} />)}</div></section>
            <StructuredEditor title="03 / Advanced project JSON" value={projectsText} onChange={setProjectsText} onApply={applyJsonEditors} hint="Use this only for bulk changes. Optional Live and GitHub URLs may be blank or may omit https://; Content Studio will normalize valid web addresses when saved." />
            <StructuredEditor title="04 / Expertise" value={servicesText} onChange={setServicesText} onApply={applyJsonEditors} hint="Shape the three service cards or add the distinct practices you offer." />
            <StructuredEditor title="05 / Verified client quotes" value={testimonialsText} onChange={setTestimonialsText} onApply={applyJsonEditors} hint="Only add testimonials that you have received permission to publish." />
            <StructuredEditor title="06 / Writing posts" value={postsText} onChange={setPostsText} onApply={applyJsonEditors} hint="Edit post title, slug, excerpt, body, tags, and ISO publishedAt date. Reading time is calculated automatically." />
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="admin-card">
              <div className="admin-card-title"><span>SYSTEM</span><h2>Database status</h2></div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${mongoStatus.isLoading ? "bg-amber-400" : mongoStatus.data?.connected ? "bg-emerald-400" : "bg-rose-400"}`} /><div><p className="text-sm font-medium">{mongoStatus.isLoading ? "Checking MongoDB…" : mongoStatus.data?.connected ? "MongoDB connected" : "MongoDB not connected"}</p><p className="mt-1 text-xs text-white/45">{mongoStatus.data?.checkedAt ? `Checked ${new Date(mongoStatus.data.checkedAt).toLocaleTimeString()}` : "No connection check completed yet."}</p></div></div><Button type="button" size="sm" variant="outline" onClick={() => mongoStatus.refetch()} disabled={mongoStatus.isFetching} className="border-white/15 text-white hover:bg-white/10">{mongoStatus.isFetching ? "Checking" : "Refresh"}</Button></div>
              {!mongoStatus.isLoading && !mongoStatus.data?.connected && <p role="status" className="mt-3 text-xs leading-5 text-rose-200">Your portfolio remains configured for MongoDB/GridFS, but this runtime cannot currently reach Atlas. Check the cluster, URI, and network access in this environment.</p>}
            </section>
            <section className="admin-card">
              <div className="admin-card-title"><span>LIVE</span><h2>Visual preview</h2></div>
              <div className="preview-card" style={{ "--preview-accent": draft.site.accent } as CSSProperties}>
                <p className="text-xs font-mono tracking-[0.18em] text-white/50">{draft.site.role}</p>
                <h3>{draft.site.name}</h3>
                <p>{draft.site.pitch}</p>
                <div className="mt-5 flex flex-wrap gap-2">{draft.projects.slice(0, 3).map(project => <span key={project.id}>{project.category}</span>)}</div>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-title"><span>MEDIA</span><h2>Upload a file</h2></div>
              <p className="mb-4 text-sm leading-6 text-white/50">Upload an image or PDF, choose its destination, and the field is wired into this draft immediately. Files are limited to 5 MB.</p>
              <label className="form-label mb-3">Assign uploaded file to<select value={mediaTarget} onChange={event => setMediaTarget(event.target.value as typeof mediaTarget)} className="form-input h-10 rounded-md px-3"><option value="heroImage">Hero visual</option><option value="profileImage">Profile image</option><option value="resumeUrl">Résumé download</option><option value="project">First selected project</option></select></label>
              {mediaTarget === "project" && <label className="form-label mb-3">Target project<select value={projectTargetId} onChange={event => setProjectTargetId(event.target.value)} className="form-input h-10 rounded-md px-3">{draft.projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>}
              <label className="upload-dropzone"><UploadCloud className="h-5 w-5" /><span>{uploadMedia.isPending ? "Uploading…" : "Choose image or PDF"}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/avif,application/pdf" onChange={onUpload} className="sr-only" /></label>
              {lastUploaded && <div className="mt-4 rounded-lg border border-[#b8ff5c]/20 bg-[#b8ff5c]/5 p-3 text-xs text-[#d7ff9f]"><Check className="mr-2 inline h-3.5 w-3.5" />Copied: <span className="break-all">{lastUploaded}</span></div>}
            </section>

            <section className="admin-card">
              <div className="admin-card-title"><span>INBOX</span><h2>Recent inquiries{inquiries.data?.filter(item => !item.read).length ? <b className="ml-2 rounded-full bg-[#b8ff5c] px-2 py-0.5 text-[10px] text-black">{inquiries.data.filter(item => !item.read).length}</b> : null}</h2></div>
              <div className="space-y-3">{inquiries.data?.length ? inquiries.data.slice(0, 6).map(inquiry => <div key={inquiry.id} className={`rounded-xl border p-3 ${inquiry.read ? "border-white/8 bg-white/[0.025]" : "border-[#b8ff5c]/30 bg-[#b8ff5c]/[.04]"}`}><div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{inquiry.name}</p><button onClick={() => markInquiryRead.mutate({ id: inquiry.id, read: !inquiry.read })} className="focus-ring text-[10px] text-[#b8ff5c]">{inquiry.read ? "Mark unread" : "Mark read"}</button></div><p className="mt-1 truncate text-xs text-[#b8ff5c]">{inquiry.email}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{inquiry.message}</p></div>) : <p className="text-sm leading-6 text-white/45">No inquiries yet. New messages are stored here in MongoDB for later review.</p>}</div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProjectEditorCard({ project, onChange, onVisibilityChange }: { project: Project; onChange: (changes: Partial<Project>) => void; onVisibilityChange: (visible: boolean) => void }) {
  return <article className="overflow-hidden rounded-xl border border-white/10 bg-white/[.025]"><div className="grid gap-4 p-4 lg:grid-cols-[11rem_1fr]"><div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-black/30">{project.images[0] ? <img src={project.images[0]} alt={`${project.title} draft preview`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center px-3 text-center font-mono text-[10px] uppercase tracking-[.13em] text-white/35">Select this project in Media to upload a visual</div>}</div><div className="grid gap-4"><div className="grid gap-4 sm:grid-cols-[1fr_12rem]"><label className="form-label">Project title<Input value={project.title} onChange={event => onChange({ title: event.target.value })} className="form-input h-11" /></label><label className="form-label">Category<select value={project.category} onChange={event => onChange({ category: event.target.value as Project["category"] })} className="form-input h-11 rounded-md px-3"><option>Design</option><option>Frontend</option><option>Full-stack</option><option>Open source</option></select></label></div><label className="form-label">Concise project summary<Textarea value={project.summary} onChange={event => onChange({ summary: event.target.value })} className="form-input min-h-24" /></label><label className="form-label">Technologies <span className="normal-case tracking-normal text-white/40">(comma-separated)</span><Input value={project.tech.join(", ")} onChange={event => onChange({ tech: event.target.value.split(",").map(item => item.trim()).filter(Boolean) })} placeholder="React, TypeScript, MongoDB" className="form-input h-11" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="form-label">Live URL <span className="normal-case tracking-normal text-white/40">(optional)</span><Input value={project.liveUrl} onChange={event => onChange({ liveUrl: event.target.value })} inputMode="url" autoCapitalize="none" autoCorrect="off" placeholder="your-project.com" className="form-input h-11" /></label><label className="form-label">GitHub URL <span className="normal-case tracking-normal text-white/40">(optional)</span><Input value={project.codeUrl} onChange={event => onChange({ codeUrl: event.target.value })} inputMode="url" autoCapitalize="none" autoCorrect="off" placeholder="github.com/your/repository" className="form-input h-11" /></label></div><div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2"><span className="text-sm text-white/70">Visible on live site</span><Switch checked={project.visible} onCheckedChange={onVisibilityChange} aria-label={`Set ${project.title} visibility`} className="data-[state=checked]:bg-[#b8ff5c] data-[state=unchecked]:bg-white/20" /></div></div></div></article>;
}

function StructuredEditor({ title, value, onChange, onApply, hint }: { title: string; value: string; onChange: (value: string) => void; onApply: () => void; hint: string }) {
  return <section className="admin-card"><div className="admin-card-title"><span>{title.split(" / ")[0]}</span><h2>{title.split(" / ")[1]}</h2></div><p className="mb-4 text-sm leading-6 text-white/50">{hint}</p><Textarea value={value} onChange={e => onChange(e.target.value)} className="form-input min-h-64 font-mono text-xs leading-5" /><Button type="button" onClick={onApply} variant="outline" className="mt-4 border-white/15 text-white hover:bg-white/10">Apply to preview</Button></section>;
}

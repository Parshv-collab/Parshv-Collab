import type { PortfolioContent } from "@shared/portfolio";
import { Command, Copy, FileText, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type PaletteItem = { label: string; hint: string; action: () => void };

export function CommandPalette({ content }: { content: PortfolioContent }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const items = useMemo<PaletteItem[]>(() => [
    ...[["About", "about"], ["Work", "work"], ["Expertise", "expertise"], ["Contact", "contact"]].map(([label, id]) => ({ label: `Jump to ${label}`, hint: "Section", action: () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }) })),
    ...content.projects.map(project => ({ label: project.title, hint: "Case study", action: () => setLocation(`/work/${project.slug}`) })),
    { label: "Copy email", hint: content.site.email, action: () => navigator.clipboard?.writeText(content.site.email) },
    ...(content.site.resumeUrl ? [{ label: "Open résumé", hint: "PDF", action: () => window.open(content.site.resumeUrl, "_blank", "noopener,noreferrer") }] : []),
  ], [content, setLocation]);
  const visible = items.filter(item => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return <><button onClick={() => setOpen(true)} className="focus-ring hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-white/55 hover:border-[var(--portfolio-accent)] hover:text-white lg:inline-flex"><Command className="h-3.5 w-3.5" />Command <kbd className="rounded border border-white/15 px-1 text-[9px]">⌘K</kbd></button>{open && <div className="fixed inset-0 z-[60] grid place-items-start bg-black/65 px-4 pt-[16vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette"><div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#121216] shadow-2xl"><div className="flex items-center gap-3 border-b border-white/10 px-4"><Search className="h-4 w-4 text-[var(--portfolio-accent)]" /><input value={query} onChange={event => setQuery(event.target.value)} autoFocus placeholder="Jump anywhere…" className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-white/35" /><button onClick={() => setOpen(false)} className="focus-ring text-white/55"><X className="h-4 w-4" /></button></div><div className="max-h-[55vh] overflow-y-auto p-2">{visible.length ? visible.map(item => <button key={`${item.label}-${item.hint}`} onClick={() => { item.action(); setOpen(false); setQuery(""); }} className="focus-ring flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-white/[.06]"><span className="text-sm text-white/85">{item.label}</span><span className="font-mono text-[10px] uppercase tracking-[.1em] text-white/40">{item.hint}</span></button>) : <p className="px-3 py-8 text-center text-sm text-white/45">No matching commands.</p>}</div></div></div>}</>;
}

import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

function readingTime(body: string) { return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220)); }

export function WritingIndex() {
  const content = trpc.portfolio.content.useQuery();
  const [tag, setTag] = useState("All");
  const tags = useMemo(() => ["All", ...Array.from(new Set((content.data?.posts ?? []).flatMap(post => post.tags)))], [content.data]);
  const posts = (content.data?.posts ?? []).filter(post => tag === "All" || post.tags.includes(tag));
  useEffect(() => { document.title = "Writing — Signal Atelier"; }, []);
  return <main className="min-h-screen bg-[#09090b] px-6 py-10 text-[#f5f5f5] md:px-10"><div className="mx-auto max-w-5xl"><Link href="/" className="focus-ring inline-flex items-center gap-2 font-mono text-xs text-white/55 hover:text-[var(--portfolio-accent)]"><ArrowLeft className="h-4 w-4" />Signal Atelier</Link><p className="eyebrow mt-14">WRITING / NOTES</p><h1 className="mt-5 text-6xl font-black tracking-[-.08em]">Thoughts in progress.</h1>{content.isError ? <div role="alert" className="mt-12 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-8 text-amber-100">Writing is temporarily unavailable. Please refresh in a moment.</div> : <><div className="mt-10 flex flex-wrap gap-2">{tags.map(item => <button key={item} onClick={() => setTag(item)} className={`focus-ring rounded-full border px-3 py-1.5 text-xs ${tag === item ? "border-[var(--portfolio-accent)] bg-[var(--portfolio-accent)] text-black" : "border-white/15 text-white/55"}`}>{item}</button>)}</div>{content.isLoading ? <div className="mt-12 grid gap-4">{[1, 2, 3].map(item => <div key={item} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[.03]" />)}</div> : posts.length ? <div className="mt-12 divide-y divide-white/10">{posts.map(post => <Link key={post.id} href={`/writing/${post.slug}`} className="focus-ring group flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[var(--portfolio-accent)]">{new Date(post.publishedAt).toLocaleDateString()} · {readingTime(post.body)} min read</p><h2 className="mt-3 text-3xl font-bold tracking-[-.055em] group-hover:text-[var(--portfolio-accent)]">{post.title}</h2><p className="mt-3 max-w-2xl leading-7 text-white/55">{post.excerpt}</p></div><ArrowRight className="h-5 w-5 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-[var(--portfolio-accent)]" /></Link>)}</div> : <div className="mt-12 rounded-2xl border border-white/10 bg-white/[.025] p-8 text-white/50">No writing has been published yet. Add a post in Content Studio when you are ready.</div>}</>}</div></main>;
}

export function WritingArticle() {
  const [, params] = useRoute("/writing/:slug");
  const content = trpc.portfolio.content.useQuery();
  const post = content.data?.posts.find(item => item.slug === params?.slug);
  useEffect(() => { if (post) document.title = `${post.title} — Signal Atelier`; }, [post]);
  if (content.isLoading) return <main className="min-h-screen bg-[#09090b] px-6 py-32 text-white/45">Loading note…</main>;
  if (content.isError) return <main className="grid min-h-screen place-items-center bg-[#09090b] px-6 text-white"><div className="text-center"><p className="eyebrow">TEMPORARILY UNAVAILABLE</p><h1 className="mt-4 text-4xl font-black">Writing could not load.</h1><Link href="/" className="mt-8 inline-flex text-[var(--portfolio-accent)]">Return home</Link></div></main>;
  if (!post) return <main className="grid min-h-screen place-items-center bg-[#09090b] px-6 text-white"><div className="text-center"><p className="eyebrow">NOT FOUND</p><h1 className="mt-4 text-4xl font-black">Note unavailable.</h1><Link href="/writing" className="mt-8 inline-flex text-[var(--portfolio-accent)]">Return to writing</Link></div></main>;
  return <main className="min-h-screen bg-[#09090b] px-6 py-10 text-[#f5f5f5] md:px-10"><article className="mx-auto max-w-3xl"><Link href="/writing" className="focus-ring inline-flex items-center gap-2 font-mono text-xs text-white/55 hover:text-[var(--portfolio-accent)]"><ArrowLeft className="h-4 w-4" />Writing</Link><p className="eyebrow mt-14">{new Date(post.publishedAt).toLocaleDateString()} · {readingTime(post.body)} MIN READ</p><h1 className="mt-5 text-5xl font-black tracking-[-.08em] sm:text-6xl">{post.title}</h1><p className="mt-6 text-xl leading-8 text-white/60">{post.excerpt}</p><div className="mt-8 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] text-white/55">{tag}</span>)}</div><div className="mt-14 whitespace-pre-wrap text-lg leading-9 text-white/78">{post.body}</div></article></main>;
}

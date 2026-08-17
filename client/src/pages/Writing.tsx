import { ArrowLeft, Calendar, Github } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Writing() {
  const [, params] = useRoute("/writing/:id");
  const { data, isLoading } = trpc.portfolio.get.useQuery();
  const post = data?.posts.find(item => item.id === params?.id);
  if (isLoading || !data) return <div className="min-h-screen grid place-items-center bg-[#070908] font-mono text-[#39FF14]">loading_article_</div>;
  if (!post) return <div className="min-h-screen bg-[#070908] px-6 py-20 text-white"><Link href="/" className="text-sm text-[#39FF14]">← back home</Link><h1 className="mt-10 text-4xl">Article not found.</h1></div>;
  return <div className="min-h-screen bg-[#070908] text-white"><header className="border-b border-white/5"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><Link href="/" className="font-mono text-sm text-[#39FF14]">PC/DEV</Link><a href={data.hero.githubUrl} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#39FF14]"><Github className="h-4 w-4" /></a></div></header><main className="mx-auto max-w-3xl px-6 py-24"><Link href="/" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-[#39FF14]"><ArrowLeft className="h-4 w-4" /> all writing</Link><p className="mt-16 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#39FF14]"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>{post.coverUrl && <img src={post.coverUrl} alt="" className="mt-10 h-64 w-full rounded-2xl object-cover opacity-80" />}<h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-.06em] md:text-7xl">{post.title}</h1><p className="mt-8 text-xl leading-8 text-white/45">{post.excerpt}</p><div className="my-12 h-px bg-white/10" /><div className="whitespace-pre-wrap text-base leading-8 text-white/65">{post.body}</div></main></div>;
}

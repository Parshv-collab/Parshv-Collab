import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { sectionTransitionEvent } from "@/lib/sectionTransition";

const sectionLabels: Record<string, string> = { about: "About", work: "Selected work", expertise: "Expertise", contact: "Contact" };

export function SectionTransitionIndicator() {
  const [destination, setDestination] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = (id: string) => {
      if (shouldReduceMotion || !sectionLabels[id]) return;
      window.clearTimeout(timeoutRef.current);
      setDestination(id);
      timeoutRef.current = window.setTimeout(() => setDestination(""), 460);
    };
    const onSignal = (event: Event) => start((event as CustomEvent<{ id?: string }>).detail?.id ?? "");
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = anchor?.getAttribute("href")?.slice(1) ?? "";
      start(id);
    };
    window.addEventListener(sectionTransitionEvent, onSignal);
    document.addEventListener("click", onAnchorClick);
    return () => {
      window.clearTimeout(timeoutRef.current);
      window.removeEventListener(sectionTransitionEvent, onSignal);
      document.removeEventListener("click", onAnchorClick);
    };
  }, [shouldReduceMotion]);

  return <AnimatePresence>{destination && <motion.div role="status" aria-live="polite" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .16, ease: [0.23, 1, 0.32, 1] }} className="pointer-events-none fixed inset-x-0 top-[calc(68px+env(safe-area-inset-top))] z-50 border-b border-[var(--portfolio-accent)]/20 bg-[#09090b]/85 px-4 py-2 backdrop-blur-md"><div className="mx-auto flex max-w-[1400px] items-center gap-3"><span className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[var(--portfolio-accent)]">Loading {sectionLabels[destination]}</span><div className="h-px flex-1 overflow-hidden bg-white/10"><motion.span className="block h-full origin-left bg-[var(--portfolio-accent)]" initial={{ scaleX: .08 }} animate={{ scaleX: 1 }} transition={{ duration: .42, ease: [0.23, 1, 0.32, 1] }} /></div></div></motion.div>}</AnimatePresence>;
}

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function BackToTop({ threshold = 560 }: { threshold?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > threshold);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [threshold]);

  const returnToTop = () => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });

  return <AnimatePresence>{isVisible && <motion.button type="button" onClick={returnToTop} aria-label="Back to top" title="Back to top" initial={{ opacity: 0, y: 14, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .97 }} transition={{ duration: .2, ease: [0.23, 1, 0.32, 1] }} className="focus-ring fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--portfolio-accent)]/45 bg-[#101014]/92 px-3.5 text-xs font-bold text-[var(--portfolio-accent)] shadow-[0_12px_28px_rgba(0,0,0,.34)] backdrop-blur-md transition-colors hover:bg-[var(--portfolio-accent)] hover:text-black active:scale-[.97] sm:right-6"><ArrowUp className="h-4 w-4" /><span className="hidden sm:inline">Top</span><span className="sr-only sm:hidden">Back to top</span></motion.button>}</AnimatePresence>;
}

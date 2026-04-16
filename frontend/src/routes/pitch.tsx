import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/pitch")({
  component: Pitch,
});

function Pitch() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState<Set<number>>(
    new Set([0]),
  );
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = slideRefs.current.indexOf(
            entry.target as HTMLDivElement,
          );
          if (idx === -1) return;
          if (entry.isIntersecting) {
            setVisibleSlides((prev) => new Set(prev).add(idx));
            setActiveSlide(idx);
          }
        });
      },
      { threshold: 0.4 },
    );
    slideRefs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
        const next = Math.min(activeSlide + 1, 1);
        slideRefs.current[next]?.scrollIntoView({ behavior: "smooth" });
      }
      if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        const prev = Math.max(activeSlide - 1, 0);
        slideRefs.current[prev]?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlide]);

  const goTo = useCallback((i: number) => {
    slideRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const vis0 = visibleSlides.has(0);
  const vis1 = visibleSlides.has(1);

  return (
    <div className="h-[calc(100dvh-2.75rem)] overflow-y-auto snap-y snap-mandatory">
      {/* ════════════════════════════════════════════
          SLIDE 1 — PROBLEM
          ════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[0] = el;
        }}
        className="h-[calc(100dvh-2.75rem)] snap-start snap-always flex items-center justify-center px-6 relative"
      >
        <div
          className={`text-center max-w-4xl w-full transition-all duration-[900ms] ease-out ${
            vis0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-6">
            The problem
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            The best people are harder to reach than ever
          </h2>

          {/* ── Three numbers ── */}
          <div className="grid grid-cols-3 gap-8 mt-14 mb-14">
            {/* 10x */}
            <div className="flex flex-col items-center">
              <span className="text-[90px] md:text-[120px] font-extrabold leading-none tracking-tight text-gray-900">
                10x
              </span>
              <span className="text-base font-semibold text-gray-500 mt-4">
                more outreach <span className="font-bold">noise</span>
              </span>
              <span className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
                Instantly 2026
              </span>
            </div>

            {/* 69% */}
            <div className="flex flex-col items-center">
              <span className="text-[90px] md:text-[120px] font-extrabold leading-none tracking-tight text-gray-900">
                69%
              </span>
              <span className="text-base font-semibold text-gray-500 mt-4">
                judge on <span className="font-bold">first impression</span>
              </span>
              <span className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
                Smartlead Stats
              </span>
            </div>

            {/* 100% */}
            <div className="flex flex-col items-center">
              <span className="text-[90px] md:text-[120px] font-extrabold leading-none tracking-tight text-gray-900">
                100<span className="text-[60px] md:text-[80px]">%</span>
              </span>
              <span className="text-base font-semibold text-gray-500 mt-4">
                test <span className="font-bold">after</span> sending
              </span>
              <span className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
                Instantly 2026
              </span>
            </div>
          </div>

          <div className="mx-auto h-px w-20 bg-gray-200 mb-7" />

          <p className="text-base text-gray-400 leading-relaxed max-w-lg mx-auto">
            Outreach tools got better. Inboxes got louder.
            <br />
            And you're still gambling your best leads on gut feeling.
          </p>
        </div>

        {/* Scroll hint */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-1000 ${
            activeSlide === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-medium">
            Scroll
          </span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-gray-300 to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SLIDE 2 — SOLUTION
          ════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[1] = el;
        }}
        className="h-[calc(100dvh-2.75rem)] snap-start snap-always flex items-center justify-center px-6 relative"
      >
        <div
          className={`text-center max-w-4xl w-full transition-all duration-[900ms] ease-out ${
            vis1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-emerald-500 mb-6">
            The solution
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Simulate the brain before you hit send
          </h2>

          {/* ── Three numbers ── */}
          <div className="grid grid-cols-3 gap-8 mt-14 mb-14">
            {/* 5s */}
            <div className="flex flex-col items-center">
              <span className="text-[90px] md:text-[120px] font-extrabold leading-none tracking-tight text-emerald-600">
                5s
              </span>
              <span className="text-base font-semibold text-gray-500 mt-4">
                not 5 days
              </span>
            </div>

            {/* 3x */}
            <div className="flex flex-col items-center">
              <span className="text-[90px] md:text-[120px] font-extrabold leading-none tracking-tight text-emerald-600">
                3x
              </span>
              <span className="text-base font-semibold text-gray-500 mt-4">
                engagement
              </span>
              <span className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
                Backlinko · Woodpecker
              </span>
            </div>

            {/* ∞ */}
            <div className="flex flex-col items-center">
              <span className="text-[90px] md:text-[120px] font-extrabold leading-none tracking-tight text-emerald-600">
                ∞
              </span>
              <span className="text-base font-semibold text-gray-500 mt-4">
                compounding learning
              </span>
            </div>
          </div>

          <div className="mx-auto h-px w-20 bg-emerald-200 mb-7" />

          <p className="text-base text-gray-400 font-medium">
            Don't spray and pray.{" "}
            <span className="font-bold text-gray-800">Spray and Clay.</span>
          </p>
        </div>
      </section>

      {/* ── Dot navigation ── */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-50">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              activeSlide === i
                ? "h-2.5 w-2.5 bg-gray-900"
                : "h-1.5 w-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </nav>
    </div>
  );
}

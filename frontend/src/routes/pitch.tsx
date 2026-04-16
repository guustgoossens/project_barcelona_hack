import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/pitch")({
  component: Pitch,
});

/* ─────────────────────────────────────────────
   Architecture SVG — transformer-paper style
   ───────────────────────────────────────────── */
function ArchitectureDiagram() {
  const b = "#E5E7EB"; // border
  const bd = "#D1D5DB"; // border dark
  const f1 = "#FFFFFF"; // fill level 1
  const f2 = "#FAFAFA"; // fill level 2
  const f3 = "#F5F5F5"; // fill level 3
  const f4 = "#F0F0F0"; // fill level 4
  const t1 = "#111827"; // text primary
  const t2 = "#6B7280"; // text secondary
  const t3 = "#9CA3AF"; // text muted
  const ar = "#D1D5DB"; // arrows

  return (
    <svg
      viewBox="0 0 960 320"
      className="w-full mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`text { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }`}</style>

      {/* ── CLAY ── */}
      <text x="80" y="16" textAnchor="middle" fontSize="9" fill="#F97316" fontWeight="600" letterSpacing="0.15em">
        CLAY
      </text>
      <rect x="0" y="26" width="160" height="280" rx="12" fill={f1} stroke={b} strokeWidth="1" />
      <rect x="12" y="50" width="136" height="232" rx="8" fill={f2} stroke={b} strokeWidth="1" />
      <text x="80" y="130" textAnchor="middle" fontSize="14" fill={t1} fontWeight="700">
        Lead Profiles
      </text>
      <line x1="48" y1="146" x2="112" y2="146" stroke={b} strokeWidth="1" />
      <text x="80" y="170" textAnchor="middle" fontSize="10" fill={t3}>
        OCEAN Traits
      </text>
      <text x="80" y="188" textAnchor="middle" fontSize="10" fill={t3}>
        Big Five Personality
      </text>
      <text x="80" y="206" textAnchor="middle" fontSize="10" fill={t3}>
        Role &amp; Company
      </text>

      {/* ── Arrow 1 ── */}
      <line x1="164" y1="166" x2="196" y2="166" stroke={ar} strokeWidth="1.5" />
      <polygon points="196,162 204,166 196,170" fill={ar} />

      {/* ── CONVEX ── */}
      <text x="310" y="16" textAnchor="middle" fontSize="9" fill="#6366F1" fontWeight="600" letterSpacing="0.15em">
        CONVEX
      </text>
      <rect x="200" y="26" width="220" height="280" rx="12" fill={f1} stroke={b} strokeWidth="1" />

      {/* Agent sub-box */}
      <rect x="212" y="50" width="196" height="115" rx="8" fill={f2} stroke={b} strokeWidth="1" />
      <text x="310" y="80" textAnchor="middle" fontSize="13" fill={t1} fontWeight="700">
        Claude Agent
      </text>
      <line x1="270" y1="92" x2="350" y2="92" stroke={b} strokeWidth="1" />
      <text x="310" y="112" textAnchor="middle" fontSize="10" fill={t3}>
        Sonnet 4.6 · Tool Calling
      </text>
      <text x="310" y="130" textAnchor="middle" fontSize="10" fill={t3}>
        Variant Generation
      </text>
      <text x="310" y="148" textAnchor="middle" fontSize="10" fill={t3}>
        Learning Loop
      </text>

      {/* DB sub-box */}
      <rect x="212" y="180" width="196" height="108" rx="8" fill={f2} stroke={b} strokeWidth="1" />
      <text x="310" y="210" textAnchor="middle" fontSize="13" fill={t1} fontWeight="700">
        Realtime Backend
      </text>
      <line x1="264" y1="222" x2="356" y2="222" stroke={b} strokeWidth="1" />
      <text x="310" y="242" textAnchor="middle" fontSize="10" fill={t3}>
        Database · File Storage
      </text>
      <text x="310" y="260" textAnchor="middle" fontSize="10" fill={t3}>
        Streaming · Actions
      </text>

      {/* ── Arrow 2 ── */}
      <line x1="424" y1="166" x2="456" y2="166" stroke={ar} strokeWidth="1.5" />
      <polygon points="456,162 464,166 456,170" fill={ar} />

      {/* ── GPU INFERENCE (nested containers) ── */}
      <text x="605" y="16" textAnchor="middle" fontSize="9" fill={t2} fontWeight="600" letterSpacing="0.15em">
        GPU INFERENCE
      </text>

      {/* Level 1 — FastAPI */}
      <rect x="460" y="26" width="290" height="280" rx="12" fill={f1} stroke={b} strokeWidth="1" />
      <text x="605" y="46" textAnchor="middle" fontSize="8" fill={t3} fontWeight="500" letterSpacing="0.12em">
        FASTAPI
      </text>

      {/* Level 2 — Northflank */}
      <rect x="472" y="54" width="266" height="240" rx="10" fill={f2} stroke={b} strokeWidth="1" />
      <text x="605" y="72" textAnchor="middle" fontSize="8" fill={t3} fontWeight="500" letterSpacing="0.12em">
        NORTHFLANK
      </text>

      {/* Level 3 — CoreWeave */}
      <rect x="484" y="80" width="242" height="202" rx="8" fill={f3} stroke={b} strokeWidth="1" />
      <text x="605" y="98" textAnchor="middle" fontSize="8" fill={t3} fontWeight="500" letterSpacing="0.12em">
        COREWEAVE
      </text>

      {/* Level 4 — B200 + TRIBE v2 */}
      <rect x="496" y="106" width="218" height="164" rx="8" fill={f4} stroke={bd} strokeWidth="1" />
      <text x="605" y="152" textAnchor="middle" fontSize="16" fill={t1} fontWeight="800">
        TRIBE v2
      </text>
      <text x="605" y="172" textAnchor="middle" fontSize="10" fill={t2}>
        Meta
      </text>
      <line x1="565" y1="186" x2="645" y2="186" stroke={bd} strokeWidth="1" />
      <text x="605" y="208" textAnchor="middle" fontSize="11" fill={t3}>
        NVIDIA B200
      </text>
      <text x="605" y="228" textAnchor="middle" fontSize="10" fill={t3}>
        180 GB VRAM
      </text>
      <text x="605" y="248" textAnchor="middle" fontSize="10" fill={t3}>
        20,484 vertices
      </text>

      {/* ── Arrow 3 ── */}
      <line x1="754" y1="166" x2="786" y2="166" stroke={ar} strokeWidth="1.5" />
      <polygon points="786,162 794,166 786,170" fill={ar} />

      {/* ── FRONTEND ── */}
      <text x="877" y="16" textAnchor="middle" fontSize="9" fill="#10B981" fontWeight="600" letterSpacing="0.15em">
        FRONTEND
      </text>
      <rect x="790" y="26" width="170" height="280" rx="12" fill={f1} stroke={b} strokeWidth="1" />
      <rect x="802" y="50" width="146" height="232" rx="8" fill={f2} stroke={b} strokeWidth="1" />
      <text x="875" y="120" textAnchor="middle" fontSize="14" fill={t1} fontWeight="700">
        Brain Viz
      </text>
      <text x="875" y="140" textAnchor="middle" fontSize="10" fill={t3}>
        3D Cortical Mesh
      </text>
      <line x1="838" y1="156" x2="912" y2="156" stroke={b} strokeWidth="1" />
      <text x="875" y="178" textAnchor="middle" fontSize="10" fill={t3}>
        Score Bars
      </text>
      <text x="875" y="196" textAnchor="middle" fontSize="10" fill={t3}>
        Variant Tree
      </text>
      <text x="875" y="214" textAnchor="middle" fontSize="10" fill={t3}>
        Timeline
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Pitch deck
   ───────────────────────────────────────────── */
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
        const next = Math.min(activeSlide + 1, 2);
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
  const vis2 = visibleSlides.has(2);

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

      {/* ════════════════════════════════════════════
          SLIDE 3 — ARCHITECTURE
          ════════════════════════════════════════════ */}
      <section
        ref={(el) => {
          slideRefs.current[2] = el;
        }}
        className="h-[calc(100dvh-2.75rem)] snap-start snap-always flex items-center justify-center px-10 md:px-16 relative"
      >
        <div
          className={`text-center w-full transition-all duration-[900ms] ease-out ${
            vis2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-6">
            How it works
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-10">
            From lead to brain score in 5 seconds
          </h2>

          <ArchitectureDiagram />

          <div className="flex items-center justify-center gap-3 mt-10 text-[11px] text-gray-400 uppercase tracking-widest">
            <span>Meta TRIBE v2</span>
            <span className="text-gray-200">&middot;</span>
            <span>Claude Sonnet 4.6</span>
            <span className="text-gray-200">&middot;</span>
            <span>NVIDIA B200</span>
            <span className="text-gray-200">&middot;</span>
            <span>Convex</span>
            <span className="text-gray-200">&middot;</span>
            <span className="text-orange-400">Clay</span>
          </div>
        </div>
      </section>

      {/* ── Dot navigation ── */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-50">
        {[0, 1, 2].map((i) => (
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

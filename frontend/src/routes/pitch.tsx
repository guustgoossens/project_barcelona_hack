import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  component: Pitch,
});

const SLIDES = [
  // SLIDE 1: PROBLEM
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16 max-w-5xl mx-auto">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">
          The Problem
        </p>
        <h1 className="text-5xl font-extrabold text-gray-900 text-center leading-tight">
          The best people are harder<br />to reach than ever
        </h1>

        <div className="grid grid-cols-3 gap-10 mt-14 w-full">
          {/* 1 */}
          <div className="text-center">
            <div className="text-5xl font-extrabold text-rose-500 font-mono">10x</div>
            <div className="text-sm font-semibold text-gray-900 mt-2">more outreach</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Clay, Instantly, Apollo democratized personalized outbound. Top talent gets 10+ tailored pitches/week. The bar to stand out has never been higher.
            </p>
          </div>
          {/* 2 */}
          <div className="text-center">
            <div className="text-5xl font-extrabold text-rose-500 font-mono">69%</div>
            <div className="text-sm font-semibold text-gray-900 mt-2">judge on first impression</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Recipients decide in seconds: spam or read. One bad email = lead burned forever. No second chance with a VP or a senior creative.
            </p>
          </div>
          {/* 3 */}
          <div className="text-center">
            <div className="text-5xl font-extrabold text-rose-500 font-mono">100%</div>
            <div className="text-sm font-semibold text-gray-900 mt-2">test in production</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              You find out your email doesn't work AFTER sending it to the lead you can't afford to lose. Zero simulation. Every send is a live experiment.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-400 italic mt-12 max-w-2xl text-center">
          "Outreach tools got better. Inboxes got louder. And you're still gambling your best leads on gut feeling."
        </p>
      </div>
    ),
  },

  // SLIDE 2: SOLUTION
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16 max-w-5xl mx-auto">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">
          The Solution
        </p>
        <h1 className="text-5xl font-extrabold text-gray-900 text-center leading-tight">
          Simulate the brain<br />before you hit send
        </h1>

        <div className="grid grid-cols-3 gap-10 mt-14 w-full">
          {/* 1 */}
          <div className="text-center">
            <div className="text-5xl font-extrabold text-emerald-500 font-mono">5s</div>
            <div className="text-sm font-semibold text-gray-900 mt-2">not 5 days</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Simulate your lead's brain response BEFORE sending. No more live experiments on people you can't afford to lose.
            </p>
          </div>
          {/* 2 */}
          <div className="text-center">
            <div className="text-5xl font-extrabold text-emerald-500 font-mono">x3</div>
            <div className="text-sm font-semibold text-gray-900 mt-2">engagement</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Hyper-personalized emails achieve 15-18% reply vs 5% generic. BrainReach personalizes at the neurological level + Big Five personality.
            </p>
          </div>
          {/* 3 */}
          <div className="text-center">
            <div className="text-5xl font-extrabold text-emerald-500 font-mono">&infin;</div>
            <div className="text-sm font-semibold text-gray-900 mt-2">compound learning</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Every simulation makes the next one smarter. AI + human lessons compound. You never burn a lead to learn.
            </p>
          </div>
        </div>

        <p className="text-base font-semibold text-gray-900 mt-12">
          Don't spray and pray. <span className="text-orange-500">Spray and Clay.</span>
        </p>
      </div>
    ),
  },

  // SLIDE 3: ARCHITECTURE
  {
    bg: "bg-white",
    content: (
      <div className="flex flex-col items-center justify-center h-full px-12 max-w-6xl mx-auto">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">
          How It Works
        </p>
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          BrainReach Architecture
        </h1>

        {/* Pipeline */}
        <div className="flex items-center gap-3 w-full justify-center">
          <ArchBlock color="orange" label="Clay" sub="Leads + OCEAN profiles" />
          <Arrow />
          <ArchBlock color="indigo" label="Claude Sonnet 4.6" sub="Generate variants" />
          <Arrow />
          <ArchBlock color="rose" label="TRIBE v2" sub="Brain scoring (B200 GPU)" />
          <Arrow />
          <ArchBlock color="emerald" label="BrainReach" sub="Visualize + iterate" />
        </div>

        {/* Learning loop */}
        <div className="mt-10 flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-gray-700">Human edits & teaches</span>
          </div>
          <span className="text-gray-300 text-lg">+</span>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-gray-700">AI extracts lessons</span>
          </div>
          <span className="text-gray-300 text-lg">=</span>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">Compound learning loop</span>
          </div>
        </div>

        {/* Tech badges */}
        <div className="mt-10 flex items-center gap-6 text-[10px] text-gray-400 uppercase tracking-widest">
          <span>Meta TRIBE v2</span>
          <span className="text-gray-200">|</span>
          <span>Anthropic Claude</span>
          <span className="text-gray-200">|</span>
          <span>NVIDIA B200 · 180GB VRAM</span>
          <span className="text-gray-200">|</span>
          <span>Convex Realtime</span>
          <span className="text-gray-200">|</span>
          <span className="text-orange-400">Clay</span>
        </div>

        {/* Sources */}
        <div className="mt-8 text-[9px] text-gray-300 text-center leading-relaxed max-w-2xl">
          Sources: Smartlead 27 Cold Email Stats · Instantly Benchmark 2026 · Backlinko 12M Email Study · Woodpecker 20M Emails · SHRM 2025 Talent Trends
        </div>
      </div>
    ),
  },
];

function ArchBlock({ color, label, sub }: { color: string; label: string; sub: string }) {
  const colors: Record<string, string> = {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={`px-5 py-4 rounded-xl border ${colors[color]} text-center min-w-[150px]`}>
      <div className="text-sm font-bold">{label}</div>
      <div className="text-[10px] mt-1 opacity-70">{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center text-gray-300">
      <div className="w-8 h-px bg-gray-300" />
      <ChevronRight className="w-4 h-4 -ml-1" />
    </div>
  );
}

function Pitch() {
  const [slide, setSlide] = useState(0);

  function prev() {
    setSlide((s) => Math.max(0, s - 1));
  }
  function next() {
    setSlide((s) => Math.min(SLIDES.length - 1, s + 1));
  }

  // Keyboard navigation
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
  }

  const current = SLIDES[slide];

  return (
    <div className={`h-[calc(100dvh-2.75rem)] ${current.bg} relative select-none`}>
      {current.content}

      {/* Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prev}
          disabled={slide === 0}
          className="p-2 rounded-full text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === slide ? "w-6 bg-gray-900" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={slide === SLIDES.length - 1}
          className="p-2 rounded-full text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-6 text-xs text-gray-300 font-mono">
        {slide + 1}/{SLIDES.length}
      </div>
    </div>
  );
}

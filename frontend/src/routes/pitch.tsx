import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  component: Pitch,
});

const SLIDES = [
  // SLIDE 1: PROBLEM
  {
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-8">
          The Problem
        </p>
        <h1 className="text-6xl font-extrabold text-gray-900 text-center leading-[1.1]">
          The best people are harder<br />to reach than ever
        </h1>

        <div className="grid grid-cols-3 gap-16 mt-16">
          <div className="text-center">
            <div className="text-6xl font-extrabold text-rose-500 font-mono">10x</div>
            <div className="text-base font-semibold text-gray-900 mt-3">more outreach in inboxes</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-extrabold text-rose-500 font-mono">69%</div>
            <div className="text-base font-semibold text-gray-900 mt-3">judge on first impression</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-extrabold text-rose-500 font-mono">0</div>
            <div className="text-base font-semibold text-gray-900 mt-3">simulate before sending</div>
          </div>
        </div>
      </div>
    ),
  },

  // SLIDE 2: SOLUTION
  {
    content: (
      <div className="flex flex-col items-center justify-center h-full px-16">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-8">
          The Solution
        </p>
        <h1 className="text-6xl font-extrabold text-gray-900 text-center leading-[1.1]">
          Simulate the brain<br />before you hit send
        </h1>

        <div className="grid grid-cols-3 gap-16 mt-16">
          <div className="text-center">
            <div className="text-6xl font-extrabold text-emerald-500 font-mono">5s</div>
            <div className="text-base font-semibold text-gray-900 mt-3">brain score per email</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-extrabold text-emerald-500 font-mono">x3</div>
            <div className="text-base font-semibold text-gray-900 mt-3">engagement rate</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-extrabold text-emerald-500 font-mono">&infin;</div>
            <div className="text-base font-semibold text-gray-900 mt-3">compound learning</div>
          </div>
        </div>

        <p className="text-xl font-semibold text-gray-900 mt-16">
          Don't spray and pray. <span className="text-orange-500">Spray and Clay.</span>
        </p>
      </div>
    ),
  },

  // SLIDE 3: ARCHITECTURE
  {
    content: (
      <div className="flex flex-col items-center justify-center h-full px-12">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-8">
          How It Works
        </p>

        {/* Pipeline */}
        <div className="flex items-center gap-4">
          <ArchBlock color="orange" label="Clay" sub="Leads + OCEAN" />
          <Arrow />
          <ArchBlock color="indigo" label="Claude" sub="Variants" />
          <Arrow />
          <ArchBlock color="rose" label="TRIBE v2" sub="Brain scoring" />
          <Arrow />
          <ArchBlock color="emerald" label="BrainReach" sub="Iterate" />
        </div>

        {/* Learning loop */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-gray-700">Human teaches</span>
          </div>
          <span className="text-gray-300 text-2xl">+</span>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <span className="text-sm font-semibold text-gray-700">AI learns</span>
          </div>
          <span className="text-gray-300 text-2xl">=</span>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">Compound loop</span>
          </div>
        </div>

        {/* Tech badges */}
        <div className="mt-12 flex items-center gap-6 text-[11px] text-gray-400 uppercase tracking-widest">
          <span>Meta TRIBE v2</span>
          <span className="text-gray-200">|</span>
          <span>Anthropic Claude</span>
          <span className="text-gray-200">|</span>
          <span>NVIDIA B200</span>
          <span className="text-gray-200">|</span>
          <span>Convex</span>
          <span className="text-gray-200">|</span>
          <span className="text-orange-400">Clay</span>
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
    <div className={`px-6 py-5 rounded-xl border ${colors[color]} text-center min-w-[140px]`}>
      <div className="text-base font-bold">{label}</div>
      <div className="text-xs mt-1 opacity-60">{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center text-gray-300">
      <div className="w-10 h-px bg-gray-300" />
      <ChevronRight className="w-5 h-5 -ml-1" />
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

  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
  }

  const current = SLIDES[slide];

  return (
    <div className="h-[calc(100dvh-2.75rem)] bg-white relative select-none">
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
    </div>
  );
}

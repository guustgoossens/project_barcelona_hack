import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-lg px-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-2.5">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="relative h-3 w-3">
            <div className="absolute inset-0 rounded-full bg-emerald-400 blur-[6px] opacity-60" />
            <div className="relative h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-sm font-semibold text-neutral-100 tracking-tight">
            NeuralReach
          </span>
        </Link>
        <span className="text-[11px] text-neutral-500 tracking-wide uppercase">
          Brain-scored outreach
        </span>
      </nav>
    </header>
  )
}

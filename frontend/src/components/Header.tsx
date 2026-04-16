import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-5">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-2.5">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            NeuralReach
          </span>
        </Link>
        <span className="text-[11px] text-gray-400 tracking-wider uppercase">
          Brain-scored outreach
        </span>
      </nav>
    </header>
  )
}

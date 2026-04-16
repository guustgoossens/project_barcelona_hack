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
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400 tracking-wider uppercase">
            Brain-scored outreach
          </span>
          <span className="text-[10px] text-gray-300">|</span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
            Powered by
            <svg className="h-3" viewBox="0 0 600 138" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M76.8 0H61.2C27.4 0 0 27.4 0 61.2v15.6C0 110.6 27.4 138 61.2 138h15.6c33.8 0 61.2-27.4 61.2-61.2V61.2C138 27.4 110.6 0 76.8 0z" fill="#F97316"/>
              <path d="M69 36c-18.2 0-33 14.8-33 33s14.8 33 33 33 33-14.8 33-33-14.8-33-33-33zm0 49.5c-9.1 0-16.5-7.4-16.5-16.5S59.9 52.5 69 52.5 85.5 59.9 85.5 69 78.1 85.5 69 85.5z" fill="white"/>
              <path d="M190 42h-22.5c-3.3 0-6 2.7-6 6v42c0 3.3 2.7 6 6 6H190c16.6 0 30-13.4 30-30s-13.4-24-30-24zm0 40.5h-15V55.5h15c8.3 0 15 6.7 15 13.5S198.3 82.5 190 82.5z" fill="#333"/>
              <text x="230" y="92" fontFamily="system-ui" fontSize="56" fontWeight="700" fill="#333">Clay</text>
            </svg>
          </span>
        </div>
      </nav>
    </header>
  )
}

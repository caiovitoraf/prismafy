import LogoWhite from '../assets/LogoWhite.svg'
import { GlassPanel } from './GlassPanel'

const navItems = [
  { key: 'home', label: 'Home' },
]

export function Header({ activePage = 'home', onNavigate = () => {} }) {
  return (
    <header className="sticky top-6 z-50">
      <GlassPanel variant="clear" className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <a
          href="#"
          className="flex items-center gap-3 text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 font-display"
        >
          <img src={LogoWhite} alt="Prismafy logomark" className="h-7 w-7 -translate-y-[2px] transform" />
          <span className="text-[1.85rem] leading-none font-medium tracking-[0.04em]">Prismafy</span>
        </a>

        <nav className="flex items-center gap-7 font-display text-[1.3rem]">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`nav-link relative bg-transparent font-medium tracking-[0.05em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 font-display ${
                activePage === key ? 'text-white' : 'text-neutral-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </GlassPanel>
    </header>
  )
}

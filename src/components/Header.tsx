import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onStartProject: () => void;
}

const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Motion', href: '#motion' },
  { label: '3D Stage', href: '#lab' },
  { label: 'Practice', href: '#practice' },
  { label: 'Writing', href: '#writing' },
];

export function Header({ onStartProject }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#120922]/96 border-b border-[#3D2C5E]/80">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-xl font-bold tracking-tight text-[#F7F3EA] hover:text-[#E5C158] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] rounded-sm"
        >
          Ahsan Shoaib
        </a>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#D6CCE8]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#F7F3EA] border-b border-transparent hover:border-[#D4AF37] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onStartProject();
            }}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#130A24] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            Start a Project
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#F7F3EA] hover:bg-[#22153B] rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#3D2C5E]/80 bg-[#120922] px-6 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="block py-2.5 text-base font-medium text-[#F7F3EA] hover:text-[#E5C158] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onStartProject();
              }}
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#09080D] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors cursor-pointer"
            >
              Start a Project
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

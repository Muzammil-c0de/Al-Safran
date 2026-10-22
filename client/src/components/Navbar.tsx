import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Logo from './Logo';
import { navLinks, site } from '@/data/site';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  // Desktop: transparent over the home banner; liquid glass once scrolled or on other pages.
  const solid = scrolled || !isHome;

  useEffect(() => setOpen(false), [pathname]);

  // Phones: is the toggle sitting over a banner or any dark/blue section (marked data-banner / data-dark)?
  const [overBanner, setOverBanner] = useState(false);
  useEffect(() => {
    const check = () => {
      const y = 40; // vertical centre of the toggle
      const dark = Array.from(document.querySelectorAll('[data-banner], [data-dark]')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom >= y;
      });
      setOverBanner(dark);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/*
        Phones: no background — the logo sits at the top of the page and scrolls away; only the toggle (below) stays fixed.
        Desktop: fixed over the home banner / sticky elsewhere, turning to liquid glass once scrolled.
      */}
      <header
        className={`absolute inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300 ${
          isHome ? 'lg:fixed' : 'lg:sticky'
        } ${
          solid
            ? // Liquid glass (desktop only): see-through white, heavy blur + colour boost, bright edges, soft shadow
              'lg:border-white/50 lg:bg-gradient-to-b lg:from-white/70 lg:to-white/45 lg:shadow-[0_8px_32px_rgba(14,21,70,0.12),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.35)] lg:backdrop-blur-2xl lg:backdrop-saturate-[1.8]'
            : ''
        }`}
      >
        <nav className="container-x flex h-20 items-center justify-between gap-4" aria-label="Main">
          {/* White on phones (over the banners), dark on desktop */}
          <Logo variant="mobile-light" />

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 text-[15px] font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      isActive ? 'text-brand-600' : 'text-navy-800 hover:text-brand-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-500 transition-transform duration-300 ${
                          isActive ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <Link to="/contact" className="btn btn-primary">
              Get a Free Quote
            </Link>
          </div>

        </nav>
      </header>

      {/* Phones: the toggle stays fixed top-right while scrolling — white over the banner, navy over white content */}
      <div className="fixed top-[25px] right-4 z-[70] sm:right-6 lg:hidden">
        <div>
          {/* Animated toggle: three bars fold into an X and the button rotates */}
          <button
            type="button"
            className={`menu-toggle transition-colors ${
              overBanner && !open ? 'text-white drop-shadow-[0_1px_3px_rgba(14,21,70,0.5)]' : 'text-navy-900'
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="bars bar1" />
            <span className="bars bar2" />
            <span className="bars bar3" />
          </button>
        </div>
      </div>

      {/* Mobile menu — slides in from the left */}
      {/* Visibility transitions too, so the panel stays visible until it has fully slid out */}
      <div
        className={`fixed inset-0 z-[60] transition-[visibility] duration-500 lg:hidden ${open ? 'visible' : 'invisible'}`}
      >
        <div
          className={`absolute inset-0 bg-navy-950/50 transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <aside
          id="mobile-menu"
          className={`absolute inset-0 flex flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Mobile menu"
        >
          {/* Menu header: logo on the left, the fixed toggle sits on the right */}
          <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-4 sm:px-6">
            <Logo onClick={() => setOpen(false)} />
          </div>

          <ul className="flex flex-col gap-1 overflow-y-auto p-4">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3.5 text-[17px] font-semibold transition ${
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-navy-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-3 border-t border-slate-100 p-5">
            {/* Mobile number (same as WhatsApp) */}
            <a href={site.mobiles[0].href} className="flex items-center gap-3 text-sm font-semibold text-navy-900">
              <Phone className="size-4 text-brand-500" /> {site.mobiles[0].label}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-sm font-semibold break-all text-navy-900">
              <Mail className="size-4 shrink-0 text-brand-500" /> {site.email}
            </a>
            <Link to="/contact" className="btn btn-primary mt-2 w-full">
              Get a Free Quote
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

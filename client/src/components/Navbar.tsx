import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Mail, Menu, Phone, X } from 'lucide-react';
import Logo from './Logo';
import { navLinks, site } from '@/data/site';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  // Transparent over the home banner (phones and desktop); solid white once scrolled or on other pages.
  const solid = scrolled || !isHome;

  useEffect(() => setOpen(false), [pathname]);

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
      <header
        className={`top-0 z-50 border-b transition-all duration-300 ${isHome ? 'fixed inset-x-0' : 'sticky'} ${
          solid
            ? // Liquid glass: see-through white, heavy blur + colour boost, bright top edge and soft shadow
              'border-white/50 bg-gradient-to-b from-white/70 to-white/45 shadow-[0_8px_32px_rgba(14,21,70,0.12),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl backdrop-saturate-[1.8]'
            : 'border-transparent bg-transparent'
        }`}
      >
        <nav className="container-x flex h-20 items-center justify-between gap-4" aria-label="Main">
          <Logo variant={solid ? 'dark' : 'mobile-light'} />

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

          <button
            type="button"
            className={`grid size-11 shrink-0 place-items-center rounded-xl border transition lg:hidden ${
              solid ? 'border-slate-200 text-navy-900' : 'border-white/40 bg-white/10 text-white backdrop-blur'
            }`}
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </nav>
      </header>

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
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-4 sm:px-6">
            <Logo onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-navy-900"
            >
              <X className="size-5" />
            </button>
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
            <a href={site.phoneHref} className="flex items-center gap-3 text-sm font-semibold text-navy-900">
              <Phone className="size-4 text-brand-500" /> {site.phone}
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

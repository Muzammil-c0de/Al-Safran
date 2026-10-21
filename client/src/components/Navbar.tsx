import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, Phone, X } from 'lucide-react';
import Logo from './Logo';
import { navLinks, site } from '@/data/site';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  // Transparent over the home banner; solid white once scrolled, on other pages, or with the mobile menu open.
  const solid = scrolled || !isHome || open;

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
          solid ? 'border-slate-200 bg-white/90 shadow-sm backdrop-blur-lg' : 'border-transparent bg-transparent'
        }`}
      >
        <nav className="container-x flex h-20 items-center justify-between gap-6" aria-label="Main">
          <Logo />

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
            className="grid size-11 place-items-center rounded-xl border border-slate-200 text-navy-900 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className={`fixed inset-x-0 top-20 bottom-0 bg-white transition-all duration-300 lg:hidden ${
            open ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        >
          <div className="container-x flex h-full flex-col overflow-y-auto pt-4 pb-8">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3.5 text-lg font-semibold ${
                        isActive ? 'bg-brand-50 text-brand-600' : 'text-navy-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-3 pt-8">
              <Link to="/contact" className="btn btn-primary w-full">
                Get a Free Quote
              </Link>
              <a href={site.phoneHref} className="btn btn-outline w-full">
                <Phone className="size-4" /> {site.phone}
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Mail, MapPin, Smartphone } from 'lucide-react';
import Logo from './Logo';
import { navLinks, site } from '@/data/site';
import { services } from '@/data/services';

// Brand icons (simple-icons paths, 24×24)
const socials = [
  {
    label: 'WhatsApp',
    href: site.whatsapp ? `https://wa.me/${site.whatsapp}` : '',
    hover: 'hover:bg-[#25D366]',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z',
  },
  {
    label: 'Instagram',
    href: site.social.instagram,
    hover: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
  {
    label: 'Facebook',
    href: site.social.facebook,
    hover: 'hover:bg-[#1877F2]',
    path: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z',
  },
].filter((s) => s.href);

export default function Footer() {
  return (
    <footer data-dark className="relative overflow-hidden bg-navy-950 text-navy-200">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo variant="light" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-navy-300">{site.description}</p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/services#${s.slug}`} className="transition hover:text-brand-400">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Get in touch</h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <span>
                {site.mobiles.map((m, i) => (
                  <span key={m.href}>
                    {i > 0 && ' / '}
                    <a href={m.href} className="transition hover:text-white">
                      {m.label}
                    </a>
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <a href={`mailto:${site.email}`} className="break-all transition hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <span>{site.address}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <span>{site.hours}</span>
            </li>
          </ul>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300"
          >
            Request a site visit <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-navy-300 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex items-center gap-3" aria-label="Social media">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={`grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:-translate-y-0.5 hover:border-transparent ${s.hover}`}
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

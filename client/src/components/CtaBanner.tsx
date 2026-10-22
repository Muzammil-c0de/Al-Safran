import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { site } from '@/data/site';
import ToolDecor from './ToolDecor';

export default function CtaBanner() {
  return (
    <section className="section pt-0">
      <div className="container-x">
        <div data-dark className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-500 to-brand-700 px-6 py-14 sm:px-12 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/15 blur-2xl" />
          <ToolDecor variant="c" light />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-[2.1rem] text-white sm:text-5xl">Planning a new home or office project?</h2>
              <p className="mt-4 text-lg text-brand-50">
                Tell us what you need — we'll inspect the site and send a clear, no-obligation quotation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn bg-navy-900 text-white hover:-translate-y-0.5 hover:bg-navy-950">
                Get a Free Quote <ArrowRight className="size-4" />
              </Link>
              <a href={site.phoneHref} className="btn btn-outline-light">
                <Phone className="size-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

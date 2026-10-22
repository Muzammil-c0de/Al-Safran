import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ToolDecor from './ToolDecor';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section data-banner className="relative overflow-hidden bg-navy-900">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-navy-500/30 blur-3xl" />
      <ToolDecor variant="b" light />

      <div className="container-x relative pt-28 pb-20 lg:py-28">
        <nav className="flex items-center gap-1.5 text-sm text-navy-300" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-brand-400">{eyebrow}</span>
        </nav>
        <h1 className="mt-5 max-w-3xl animate-fade-up text-4xl text-white sm:text-5xl lg:text-6xl">{title}</h1>
        <p
          className="mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-navy-200"
          style={{ animationDelay: '120ms' }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}

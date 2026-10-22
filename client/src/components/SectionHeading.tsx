import type { ReactNode } from 'react';
import { Wrench } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', light }: SectionHeadingProps) {
  const center = align === 'center';
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <span className={`eyebrow ${light ? 'text-ice-300' : ''}`}>
        {/* Spanner badge */}
        <span
          className={`grid size-7 place-items-center rounded-lg ${
            light ? 'bg-white/15 text-ice-300' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <Wrench className="size-4 -rotate-45" strokeWidth={2.4} />
        </span>
        {eyebrow}
      </span>
      <h2
        className={`mt-4 text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem] ${light ? 'text-white' : ''}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-navy-100' : 'text-slate-600'}`}>{subtitle}</p>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';

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
      <span className={`eyebrow ${center ? 'justify-center' : ''}`}>{eyebrow}</span>
      <h2 className={`mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-tight ${light ? 'text-white' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-navy-200' : 'text-slate-600'}`}>{subtitle}</p>
      )}
    </div>
  );
}

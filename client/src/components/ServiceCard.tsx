import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types';

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  return (
    <Link
      to={`/services#${service.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-navy-900/5"
    >
      <span className="absolute top-6 right-7 text-5xl font-extrabold text-slate-100 transition group-hover:text-brand-50">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="relative grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition duration-300 group-hover:bg-brand-500 group-hover:text-white">
        <Icon className="size-7" strokeWidth={1.8} />
      </span>
      <h3 className="relative mt-6 text-xl">{service.title}</h3>
      <p className="relative mt-3 flex-1 text-[15px] leading-relaxed">{service.short}</p>
      <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition group-hover:text-brand-600">
        Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

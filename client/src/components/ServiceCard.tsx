import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types';

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  return (
    <Link
      to={`/services#${service.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-navy-900/10"
    >
      {service.image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 grid size-10 place-items-center rounded-xl bg-white/95 text-brand-600 shadow-md backdrop-blur">
            <Icon className="size-5" strokeWidth={2} />
          </span>
          <span className="absolute top-4 right-4 rounded-full bg-navy-900/60 px-2.5 py-1 text-xs font-bold tracking-wider text-white backdrop-blur-md">
            {String(index + 1).padStart(2, '0')}
          </span>
          {service.badge && (
            <span className="absolute bottom-3 left-4 rounded-md bg-brand-500/95 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              {service.badge}
            </span>
          )}
        </div>
      ) : (
        <div className="p-7 pb-0">
          <span className="absolute top-6 right-7 text-5xl font-extrabold text-slate-100 transition group-hover:text-brand-50">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="relative grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition duration-300 group-hover:bg-brand-500 group-hover:text-white">
            <Icon className="size-7" strokeWidth={1.8} />
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl leading-snug transition-colors group-hover:text-brand-600">{service.title}</h3>
        <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-slate-600">{service.short}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition group-hover:text-brand-600">
          Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

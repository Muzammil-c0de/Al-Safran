import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types';

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  return (
    <Link
      to={`/services#${service.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-navy-900/5"
    >
      {/* Top visual: photo if the service has one, otherwise a blue icon panel of the same size */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-grid" />
            <div className="absolute inset-0 grid place-items-center">
              <Icon className="size-14 text-brand-400" strokeWidth={1.4} />
            </div>
          </>
        )}
        <span className="absolute top-4 right-4 rounded-full bg-navy-950/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl transition-colors group-hover:text-brand-600">{service.title}</h3>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed">{service.short}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition group-hover:text-brand-600">
          Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

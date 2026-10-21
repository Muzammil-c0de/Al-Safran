import { AirVent, Droplets, Fan, MapPin, Sparkles, Wind, Wrench, Zap, type LucideIcon } from 'lucide-react';
import type { Project } from '@/types';

const categoryIcon: Record<string, LucideIcon> = {
  'HVAC & Chilled Water': Fan,
  Ducting: Wind,
  'Duct Cleaning': Sparkles,
  Electrical: Zap,
  'AC Works': AirVent,
  Plumbing: Droplets,
};

export default function ProjectCard({ project }: { project: Project }) {
  const Icon = categoryIcon[project.category] ?? Wrench;
  const year = project.completed_on ? new Date(project.completed_on).getFullYear() : null;

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="relative grid size-full place-items-center bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
            <div className="absolute inset-0 bg-grid" />
            <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-brand-500/20 blur-2xl" />
            <Icon className="relative size-16 text-brand-400/90" strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy-900 shadow-sm backdrop-blur">
          {project.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg leading-snug">{project.title}</h3>
        {project.description && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed">{project.description}</p>}
        {(project.location || year) && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
            {project.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-brand-500" /> {project.location}
              </span>
            )}
            {year && <span>{year}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

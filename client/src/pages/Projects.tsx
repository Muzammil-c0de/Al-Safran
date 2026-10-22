import { useMemo, useState } from 'react';
import PageHero from '@/components/PageHero';
import ProjectCard from '@/components/ProjectCard';
import Reveal from '@/components/Reveal';
import CtaBanner from '@/components/CtaBanner';
import Gallery from '@/components/Gallery';
import { projectCategories } from '@/data/site';
import { useProjects } from '@/hooks/useProjects';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Projects() {
  useDocumentTitle('Projects');
  const { projects, loading } = useProjects();
  const [filter, setFilter] = useState<string>('All');

  const categories = useMemo(() => {
    const used = new Set(projects.map((p) => p.category));
    const ordered = projectCategories.filter((c) => used.has(c));
    const extra = [...used].filter((c) => !(projectCategories as readonly string[]).includes(c));
    return ['All', ...ordered, ...extra];
  }, [projects]);

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Projects Built to Perform"
        subtitle="Air-conditioning, ducting and MEP works delivered across the U.A.E. — on time and to standard."
        image="/project banner.png"
      />

      <section className="section">
        <div className="container-x">
          <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter projects">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  filter === c
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'border border-slate-200 bg-white text-navy-800 hover:border-brand-500 hover:text-brand-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                    <div className="space-y-3 p-6">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))
              : visible.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 80}>
                    <ProjectCard project={p} />
                  </Reveal>
                ))}
          </div>

          {!loading && visible.length === 0 && (
            <p className="mt-12 text-center text-slate-500">No projects in this category yet.</p>
          )}
        </div>
      </section>

      {/* Images & videos uploaded from the admin panel (hidden until something is uploaded) */}
      <Gallery />

      <CtaBanner />
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FolderKanban, Images } from 'lucide-react';
import PageHero from '@/components/PageHero';
import ProjectCard from '@/components/ProjectCard';
import Reveal from '@/components/Reveal';
import CtaBanner from '@/components/CtaBanner';
import Gallery from '@/components/Gallery';
import { projectCategories } from '@/data/site';
import { useProjects } from '@/hooks/useProjects';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type View = 'projects' | 'gallery';

export default function Projects() {
  useDocumentTitle('Projects');
  const { projects, loading } = useProjects();
  const [filter, setFilter] = useState<string>('All');
  const { hash } = useLocation();
  const navigate = useNavigate();

  // /projects#gallery opens the Gallery directly
  const view: View = hash === '#gallery' ? 'gallery' : 'projects';
  const setView = (v: View) => navigate({ hash: v === 'gallery' ? 'gallery' : '' }, { replace: true });

  // Switching views keeps you at the top of the content, not wherever the last view was scrolled to
  useEffect(() => {
    if (hash === '#gallery') document.getElementById('projects-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

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
        image="/project banner.webp"
      />

      <section id="projects-content" className="section scroll-mt-4">
        <div className="container-x">
          {/* Projects / Gallery switch */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1.5 shadow-sm" role="tablist" aria-label="Projects or gallery">
              {(
                [
                  ['projects', 'Projects', FolderKanban],
                  ['gallery', 'Gallery', Images],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={view === key}
                  onClick={() => setView(key)}
                  className={`flex items-center gap-2 rounded-full px-6 py-2.5 font-display text-base font-bold tracking-wide uppercase transition ${
                    view === key ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'text-navy-800 hover:text-brand-600'
                  }`}
                >
                  <Icon className="size-5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {view === 'gallery' ? (
            <div className="mt-12">
              {/* All images & videos added in Admin → Media library */}
              <Gallery embedded />
            </div>
          ) : (
            <>
              <div
                className={`mt-8 flex flex-wrap justify-center gap-2 ${!loading && projects.length === 0 ? 'hidden' : ''}`}
                role="tablist"
                aria-label="Filter projects"
              >
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

              {!loading && projects.length === 0 && (
                <div className="mx-auto max-w-md text-center">
                  <p className="font-display text-2xl font-bold text-navy-900">Projects coming soon</p>
                  <p className="mt-2 text-slate-500">
                    We're adding our recent work. Meanwhile, see photos and videos in the{' '}
                    <button onClick={() => setView('gallery')} className="font-semibold text-brand-600 hover:underline">
                      Gallery
                    </button>
                    .
                  </p>
                </div>
              )}
              {!loading && projects.length > 0 && visible.length === 0 && (
                <p className="mt-12 text-center text-slate-500">No projects in this category yet.</p>
              )}
            </>
          )}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

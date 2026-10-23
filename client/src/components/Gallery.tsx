import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, Play, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { MediaItem } from '@/types';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

/**
 * Public gallery of images and videos uploaded in Admin → Media library.
 * `embedded` = shown as the Projects page's Gallery tab (no section heading, shows a message when empty).
 */
export default function Gallery({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    api
      .getMedia()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Keyboard: Esc closes, arrows move
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, items.length]);

  if (embedded && loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return embedded ? (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Images className="size-7" />
        </span>
        <p className="mt-4 font-display text-2xl font-bold text-navy-900">Gallery coming soon</p>
        <p className="mt-2 text-slate-500">Photos and videos of our work will appear here.</p>
      </div>
    ) : null;
  }
  const current = open !== null ? items[open] : null;

  const grid = (
        <div className={`${embedded ? '' : 'mt-12'} grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4`}>
          {items.map((m, i) => (
            <Reveal key={m.id} delay={(i % 4) * 60} className={i % 7 === 0 ? 'col-span-2 row-span-2' : ''}>
              <button
                onClick={() => setOpen(i)}
                className="group relative block aspect-square size-full overflow-hidden rounded-2xl bg-navy-900"
                aria-label={`Open ${m.title || (m.kind === 'video' ? 'video' : 'image')}`}
              >
                {m.kind === 'image' ? (
                  <img src={m.url} alt={m.title ?? ''} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <video src={`${m.url}#t=0.5`} muted playsInline preload="metadata" className="size-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-navy-950/30">
                      <span className="grid size-14 place-items-center rounded-full bg-white/90 text-navy-900 shadow-lg transition group-hover:scale-110">
                        <Play className="ml-1 size-6" fill="currentColor" />
                      </span>
                    </span>
                  </>
                )}
                {m.title && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent px-4 pt-8 pb-3 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {m.title}
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
  );

  const lightbox = current && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-950/90 p-4 backdrop-blur-sm" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <button onClick={() => setOpen(null)} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
            <X className="size-6" />
          </button>
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
                }}
                className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i + 1) % items.length));
                }}
                className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {current.kind === 'image' ? (
              <img src={current.url} alt={current.title ?? ''} className="max-h-[80vh] rounded-xl object-contain" />
            ) : (
              <video key={current.id} src={current.url} controls autoPlay playsInline className="max-h-[80vh] rounded-xl" />
            )}
            {current.title && <figcaption className="mt-3 text-center font-display text-lg font-semibold text-white">{current.title}</figcaption>}
          </figure>
        </div>
  );

  if (embedded) {
    return (
      <>
        {grid}
        {lightbox}
      </>
    );
  }

  return (
    <section className="section bg-slate-50">
      <div className="container-x">
        <SectionHeading eyebrow="Gallery" title="Our work in pictures & video" subtitle="A look at our team on site — installations, ducting, maintenance and more." />
        {grid}
      </div>
      {lightbox}
    </section>
  );
}

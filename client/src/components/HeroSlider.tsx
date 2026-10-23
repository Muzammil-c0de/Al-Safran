import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { site } from '@/data/site';
import type { Banner } from '@/types';
import ToolDecor from './ToolDecor';

interface Slide {
  key: number;
  image: string;
  /** Portrait version used on phones and tablets (below 1024px); falls back to the desktop image */
  mobileImage: string;
  eyebrow: string | null;
  title: { text: string; highlight?: boolean }[];
  text: string | null;
  button: { to: string; label: string } | null;
}

/** "Cooling built to *perform*" → [{text:'Cooling built to '}, {text:'perform', highlight:true}] */
function parseTitle(title: string) {
  return title
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) => (part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), highlight: true } : { text: part }));
}

const toSlide = (b: Banner): Slide => ({
  key: b.id,
  image: b.desktop_url,
  mobileImage: b.mobile_url || b.desktop_url,
  eyebrow: b.eyebrow,
  title: parseTitle(b.title),
  text: b.subtitle,
  button: b.button_label && b.button_link ? { to: b.button_link, label: b.button_label } : null,
});

const INTERVAL = 5000;

/** Home page slider — banners are managed in Admin → Home banners. */
export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[] | null>(null);

  useEffect(() => {
    api
      .getBanners()
      .then(setBanners)
      .catch(() => setBanners([]));
  }, []);

  const slides = useMemo(() => (banners ?? []).map(toSlide), [banners]);

  // Loading: keep the space so the page doesn't jump
  if (banners === null) {
    return <section data-banner className="h-[100svh] min-h-[560px] bg-gradient-to-br from-sky-100 via-brand-50 to-white lg:aspect-[5/2] lg:h-auto" />;
  }
  if (slides.length === 0) return <FallbackHero />;
  return <Slider slides={slides} />;
}

function Slider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const go = (i: number) => setCurrent((i + count) % count);

  // Auto-scroll; the timer restarts whenever the slide changes (including manual clicks).
  useEffect(() => {
    if (count < 2) return;
    const t = window.setTimeout(() => setCurrent((c) => (c + 1) % count), INTERVAL);
    return () => window.clearTimeout(t);
  }, [current, count]);

  return (
    <section data-banner className="relative overflow-hidden bg-white" aria-roledescription="carousel" aria-label="Highlights">
      {/* Sliding track */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, idx) => {
          const active = idx === current;
          const Heading = idx === 0 ? 'h1' : 'h2';
          const external = s.button?.to.startsWith('http');
          const btnClass =
            'btn border border-white/70 text-white hover:bg-white hover:text-navy-900 lg:border-navy-200 lg:bg-white/80 lg:text-navy-900 lg:hover:bg-navy-900 lg:hover:text-white';
          return (
            <div
              key={s.key}
              className="relative flex h-[100svh] min-h-[560px] w-full shrink-0 lg:aspect-[5/2] lg:h-auto lg:min-h-[560px]"
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${count}`}
            >
              {/* Phone image (9:16) below 1024px, desktop image (5:2) above */}
              <picture>
                <source media="(min-width: 1024px)" srcSet={s.image} />
                <img
                  src={s.mobileImage}
                  alt=""
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  className="absolute inset-0 size-full object-cover object-bottom lg:object-center"
                />
              </picture>
              {/* Mobile only: dark fade at the top so the white text is readable */}
              <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-navy-950/85 via-navy-950/45 to-transparent lg:hidden" />

              <div className="container-x relative flex items-start pt-28 pb-16 sm:pt-32 lg:items-center lg:pt-24">
                <div className={`max-w-[32rem] ${active ? 'animate-fade-up' : 'opacity-0'}`}>
                  {/* Tag — desktop position (above the heading) */}
                  {s.eyebrow && (
                    <span className="glass-tag mb-6 px-4 py-1.5 text-xs text-navy-900 max-lg:hidden">
                      <span className="relative size-2 animate-pulse rounded-full bg-brand-500" />
                      {s.eyebrow}
                    </span>
                  )}
                  <Heading className="text-[1.9rem] leading-[1.15] text-white sm:text-[2.5rem] lg:text-[2.9rem] lg:text-navy-950">
                    {s.title.map((part, i) => (
                      <span key={i} className={part.highlight ? 'text-brand-300 lg:text-brand-500' : undefined}>
                        {part.text}
                      </span>
                    ))}
                  </Heading>
                  {s.text && (
                    <p className="mt-4 max-w-md text-[15px] leading-[1.7] font-medium text-white/90 lg:mt-6 lg:text-base lg:font-semibold lg:text-navy-950">
                      {s.text}
                    </p>
                  )}
                  {/* Buttons on desktop only */}
                  <div className="mt-10 hidden flex-wrap gap-4 lg:flex">
                    <Link to="/contact" className="btn btn-primary" tabIndex={active ? 0 : -1}>
                      Get a Free Quote <ArrowRight className="size-4" />
                    </Link>
                    {s.button &&
                      (external ? (
                        <a href={s.button.to} target="_blank" rel="noopener noreferrer" className={btnClass} tabIndex={active ? 0 : -1}>
                          {s.button.label}
                        </a>
                      ) : (
                        <Link to={s.button.to} className={btnClass} tabIndex={active ? 0 : -1}>
                          {s.button.label}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>

              {/* Tag — mobile position (bottom of the banner, just above the slide dots) */}
              {s.eyebrow && (
                <div className="absolute inset-x-0 bottom-12 flex justify-center lg:hidden">
                  <span
                    className={`glass-tag px-5 py-2 text-sm text-white [text-shadow:0_1px_6px_rgb(14_21_70/0.45)] ${
                      active ? 'animate-fade-up' : 'opacity-0'
                    }`}
                  >
                    <span className="relative size-2 animate-pulse rounded-full bg-ice-300 shadow-[0_0_8px_rgb(127_232_245)]" />
                    {s.eyebrow}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots — centred at the bottom */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === current}
              className={`h-2.5 rounded-full shadow-sm transition-all duration-500 ${
                idx === current ? 'w-10 bg-brand-500' : 'w-2.5 bg-white/90 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Shown until the first banner is added in the admin panel. */
function FallbackHero() {
  return (
    <section data-banner className="relative flex h-[100svh] min-h-[560px] items-center overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 lg:aspect-[5/2] lg:h-auto">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <ToolDecor variant="a" light />
      <div className="container-x relative pt-20">
        <div className="max-w-2xl animate-fade-up">
          <span className="glass-tag px-4 py-1.5 text-xs text-white">
            <span className="relative size-2 animate-pulse rounded-full bg-ice-300" />
            {site.slogan}
          </span>
          <h1 className="mt-6 text-[2.2rem] leading-[1.12] text-white sm:text-5xl lg:text-6xl">
            Cooling systems built to <span className="text-ice-300">perform</span>, maintained to{' '}
            <span className="text-ice-300">last</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-navy-100">{site.description}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/contact" className="btn bg-white text-navy-900 shadow-lg hover:-translate-y-0.5 hover:bg-brand-50">
              Get a Free Quote <ArrowRight className="size-4" />
            </Link>
            <Link to="/services" className="btn btn-outline-light">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

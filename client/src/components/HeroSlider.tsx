import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { site } from '@/data/site';

interface Slide {
  image: string;
  alt: string;
  eyebrow: string;
  title: { text: string; highlight?: boolean }[];
  text: string;
  secondary: { to: string; label: string };
}

const slides: Slide[] = [
  {
    image: '/banner1.png',
    alt: 'Al Safran technicians servicing rooftop chilled water and HVAC equipment',
    eyebrow: site.slogan,
    title: [
      { text: 'Cooling systems built to ' },
      { text: 'perform', highlight: true },
      { text: ', maintained to ' },
      { text: 'last', highlight: true },
    ],
    text: 'Chilled water FCU/AHU, GI & PI ductwork, duct cleaning, AC, electrical and plumbing works for new homes and offices.',
    secondary: { to: '/services', label: 'Explore Services' },
  },
  {
    image: '/banner2.png',
    alt: 'Al Safran team installing GI ductwork and ceiling diffusers',
    eyebrow: 'Ducting Specialists',
    title: [
      { text: 'Precision ' },
      { text: 'ductwork', highlight: true },
      { text: ' for cleaner, ' },
      { text: 'healthier air', highlight: true },
    ],
    text: 'GI & pre-insulated duct fabrication, installation and professional duct & diffuser cleaning — done neatly and on time.',
    secondary: { to: '/services#ducting', label: 'Ducting Services' },
  },
];

const INTERVAL = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const count = slides.length;

  const go = (i: number) => setCurrent((i + count) % count);

  // Auto-scroll; the timer restarts whenever the slide changes (including manual clicks).
  useEffect(() => {
    const t = window.setTimeout(() => setCurrent((c) => (c + 1) % count), INTERVAL);
    return () => window.clearTimeout(t);
  }, [current, count]);

  return (
    <section className="relative overflow-hidden bg-white" aria-roledescription="carousel" aria-label="Highlights">
      {/* Sliding track */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, idx) => {
          const active = idx === current;
          const Heading = idx === 0 ? 'h1' : 'h2';
          return (
            <div
              key={s.image}
              className="relative flex w-full shrink-0 lg:aspect-[5/2] lg:min-h-[560px]"
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${count}`}
            >
              {/* Banner images are 5:2 — on wide screens the banner uses the same ratio so the full image shows */}
              <img
                src={s.image}
                alt={s.alt}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                className="absolute inset-0 size-full object-cover object-[70%_center] lg:object-center"
              />

              <div className="container-x relative flex min-h-[600px] items-center pt-24 pb-16 lg:min-h-0">
                <div className={`max-w-[32rem] ${active ? 'animate-fade-up' : 'opacity-0'}`}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wide text-brand-600 shadow-sm ring-1 ring-brand-100">
                    <span className="size-2 animate-pulse rounded-full bg-brand-500" />
                    {s.eyebrow}
                  </span>
                  <Heading className="mt-6 text-[2.1rem] leading-[1.15] text-navy-950 sm:text-[2.5rem] lg:text-[2.9rem]">
                    {s.title.map((part, i) => (
                      <span key={i} className={part.highlight ? 'text-brand-500' : undefined}>
                        {part.text}
                      </span>
                    ))}
                  </Heading>
                  <p className="mt-6 max-w-md text-base leading-[1.75] font-semibold text-navy-950">{s.text}</p>
                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link to="/contact" className="btn btn-primary" tabIndex={active ? 0 : -1}>
                      Get a Free Quote <ArrowRight className="size-4" />
                    </Link>
                    <Link to={s.secondary.to} className="btn btn-outline bg-white/80" tabIndex={active ? 0 : -1}>
                      {s.secondary.label}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots — centred at the bottom */}
      <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.image}
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
    </section>
  );
}

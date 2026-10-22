import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { site } from '@/data/site';

interface Slide {
  image: string;
  /** Portrait version used on phones and tablets (below 1024px) */
  mobileImage: string;
  alt: string;
  eyebrow: string;
  title: { text: string; highlight?: boolean }[];
  text: string;
  secondary: { to: string; label: string };
}

const slides: Slide[] = [
  {
    image: '/banner1.png',
    mobileImage: '/banner1mobile.png',
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
    mobileImage: '/banner2mobile.png',
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
    <section data-banner className="relative overflow-hidden bg-white" aria-roledescription="carousel" aria-label="Highlights">
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
              className="relative flex h-[100svh] min-h-[560px] w-full shrink-0 lg:aspect-[5/2] lg:h-auto lg:min-h-[560px]"
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${count}`}
            >
              {/* Portrait image on phones/tablets, wide 5:2 image on desktop — each slide uses its image's own ratio */}
              <picture>
                <source media="(min-width: 1024px)" srcSet={s.image} />
                <img
                  src={s.mobileImage}
                  alt={s.alt}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  className="absolute inset-0 size-full object-cover object-bottom lg:object-center"
                />
              </picture>
              {/* Mobile only: dark fade at the top so the white text is readable */}
              <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-navy-950/85 via-navy-950/45 to-transparent lg:hidden" />

              <div className="container-x relative flex items-start pt-28 pb-16 sm:pt-32 lg:items-center lg:pt-24">
                <div className={`max-w-[32rem] ${active ? 'animate-fade-up' : 'opacity-0'}`}>
                  {/* Tag — desktop position (above the heading) */}
                  <span className="glass-tag px-4 py-1.5 text-xs text-navy-900 max-lg:hidden">
                    <span className="relative size-2 animate-pulse rounded-full bg-brand-500" />
                    {s.eyebrow}
                  </span>
                  <Heading className="text-[1.9rem] leading-[1.15] text-white sm:text-[2.5rem] lg:mt-6 lg:text-[2.9rem] lg:text-navy-950">
                    {s.title.map((part, i) => (
                      <span key={i} className={part.highlight ? 'text-brand-300 lg:text-brand-500' : undefined}>
                        {part.text}
                      </span>
                    ))}
                  </Heading>
                  <p className="mt-4 max-w-md text-[15px] leading-[1.7] font-medium text-white/90 lg:mt-6 lg:text-base lg:font-semibold lg:text-navy-950">
                    {s.text}
                  </p>
                  {/* Buttons on desktop only */}
                  <div className="mt-10 hidden flex-wrap gap-4 lg:flex">
                    <Link to="/contact" className="btn btn-primary" tabIndex={active ? 0 : -1}>
                      Get a Free Quote <ArrowRight className="size-4" />
                    </Link>
                    <Link to={s.secondary.to} className="btn border border-white/70 text-white hover:bg-white hover:text-navy-900 lg:border-navy-200 lg:bg-white/80 lg:text-navy-900 lg:hover:bg-navy-900 lg:hover:text-white" tabIndex={active ? 0 : -1}>
                      {s.secondary.label}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tag — mobile position (bottom of the banner, just above the slide dots) */}
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

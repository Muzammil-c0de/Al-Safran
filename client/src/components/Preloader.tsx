import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import { api } from '@/lib/api';
import { smallBanner } from './PageHero';

const MIN_TIME = 2200; // keep the intro on screen at least this long (ms)
const MAX_TIME = 8000; // never keep visitors waiting longer than this, even on a slow connection
const FADE_TIME = 700;

/** Inner-page banners (desktop files; phones use the small "-sm" copies). */
const PAGE_BANNERS = ['/ourservice banner.webp', '/about us banner.webp', '/project banner.webp', '/contact banner.webp'];

/** Downloads + decodes one image; resolves either way (a broken image must not block the site). */
function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => resolve()) : resolve());
    img.onerror = () => resolve();
    img.src = src;
  });
}

/** Every banner the visitor may see: home slider banners (from the admin panel) + inner-page banners. */
async function loadAllBanners() {
  const isPhone = window.matchMedia('(max-width: 1023px)').matches;
  const pages = PAGE_BANNERS.map((p) => encodeURI(isPhone ? smallBanner(p) : p));
  const home = await api
    .getBanners()
    .then((list) => list.map((b) => (isPhone ? b.mobile_url || b.desktop_url : b.desktop_url)))
    .catch(() => [] as string[]);
  // Home slides first — they're on screen the moment the intro fades
  await Promise.all([...home, ...pages].map(preload));
}

/**
 * Opening screen: a sleek wall AC in swing mode, "Cooling up…". It stays while the banner images
 * download (at least MIN_TIME, at most MAX_TIME), then fades into a fully-loaded site.
 */
export default function Preloader() {
  const [phase, setPhase] = useState<'show' | 'leaving' | 'done'>('show');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const start = performance.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_TIME - (performance.now() - start));
      window.setTimeout(() => {
        setPhase('leaving');
        document.body.style.overflow = '';
        window.setTimeout(() => setPhase('done'), FADE_TIME);
      }, wait);
    };

    const pageLoaded = new Promise<void>((resolve) =>
      document.readyState === 'complete' ? resolve() : window.addEventListener('load', () => resolve(), { once: true })
    );
    Promise.all([pageLoaded, loadAllBanners()]).then(finish);
    const safety = window.setTimeout(finish, MAX_TIME);

    return () => {
      window.clearTimeout(safety);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-white transition-all duration-700 ${
        phase === 'leaving' ? 'pointer-events-none scale-105 opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-label={`Loading ${site.name}`}
    >
      <div className="flex animate-fade-up flex-col items-center px-6">
        <AcUnit />
        <p className="mt-6 font-display text-sm font-bold tracking-[0.45em] text-navy-900/70 uppercase">
          Cooling up<span className="cooling-dots" />
        </p>
      </div>
    </div>
  );
}

/** Line-drawing of a wall AC: outlines draw themselves in, the flap swings, thin air lines drift down. */
function AcUnit() {
  return (
    <svg viewBox="0 0 200 120" className="w-44 sm:w-52" fill="none" stroke="#1739a8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Body */}
      <path className="ac-draw" pathLength={1} strokeWidth={2.4} d="M22 10 h156 a14 14 0 0 1 14 14 v22 a14 14 0 0 1 -14 14 h-156 a14 14 0 0 1 -14 -14 v-22 a14 14 0 0 1 14 -14 z" />
      {/* Panel seam */}
      <path className="ac-draw [animation-delay:0.25s]" pathLength={1} strokeWidth={1.4} strokeOpacity={0.5} d="M14 36 H186" />
      {/* Display */}
      <path className="ac-draw [animation-delay:0.4s]" pathLength={1} strokeWidth={1.6} d="M146 19 h24 a4 4 0 0 1 4 4 v2 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 v-2 a4 4 0 0 1 4 -4 z" />
      <circle cx="136" cy="24" r="2" fill="#3fd8ee" stroke="none" className="ac-light" />
      {/* Vent */}
      <path className="ac-draw [animation-delay:0.55s]" pathLength={1} strokeWidth={1.6} d="M28 50 H172" />
      {/* Swinging flap */}
      <g className="ac-flap">
        <path strokeWidth={1.8} fill="#eef6ff" d="M30 54 H170 L165 61 H35 Z" />
      </g>

      {/* Air: thin lines drifting down from the vent */}
      <g className="ac-air" stroke="#3fd8ee" strokeWidth={1.4}>
        {[48, 72, 96, 120, 144].map((x, i) => (
          <line key={x} x1={x} y1={68} x2={x} y2={84} className="ac-breeze" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
        {[60, 84, 108, 132].map((x, i) => (
          <line key={x} x1={x} y1={74} x2={x} y2={86} className="ac-breeze" style={{ animationDelay: `${0.45 + i * 0.18}s` }} />
        ))}
      </g>
    </svg>
  );
}

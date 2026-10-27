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
      <div className="flex flex-col items-center px-6">
        {/* Logo — appears first */}
        <div className="relative grid size-36 animate-fade-up place-items-center sm:size-40">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-200/50 [animation-duration:2.2s]" />
          <span className="absolute -inset-3 rounded-full border-2 border-dashed border-brand-500/25 animate-spin-slow" />
          <img
            src="/logo.png"
            alt={site.name}
            className="relative size-full rounded-full bg-white object-contain shadow-[0_12px_40px_rgba(29,116,224,0.25)] ring-1 ring-brand-100"
          />
        </div>

        {/* Loading tag — appears just after the logo */}
        <div className="mt-10 flex animate-fade-up flex-col items-center [animation-delay:350ms]">
          <span className="glass-tag px-5 py-2 text-xs text-navy-900 ring-1 ring-brand-100">
            <span className="relative size-2 animate-pulse rounded-full bg-brand-500" />
            Loading<span className="cooling-dots" />
          </span>
          <span className="mt-5 block h-1 w-40 overflow-hidden rounded-full bg-brand-100">
            <span className="loader-bar block h-full w-1/3 rounded-full bg-gradient-to-r from-ice-400 to-brand-500" />
          </span>
        </div>
      </div>
    </div>
  );
}

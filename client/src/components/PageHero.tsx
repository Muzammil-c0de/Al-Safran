import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Banner photo from /public (2048×768, 8:3). */
  image: string;
  /** Where the photo has a clear area for text: the sky at top-left, or the white wave at bottom-left. */
  textPosition?: 'top-left' | 'bottom-left';
  /** Labels placed on the photo (desktop) — x/y are % positions of each label's top-centre. */
  labels?: { x: number; y: number; text: string; href?: string }[];
}

function Heading({ eyebrow, title, subtitle, onPhoto }: Pick<PageHeroProps, 'eyebrow' | 'title' | 'subtitle'> & { onPhoto?: boolean }) {
  return (
    <>
      <nav
        className={`flex items-center gap-1.5 text-sm font-medium ${onPhoto ? 'text-navy-800' : 'text-navy-200'}`}
        aria-label="Breadcrumb"
      >
        <Link to="/" className={onPhoto ? 'hover:text-brand-600' : 'hover:text-white'}>
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className={onPhoto ? 'font-bold text-brand-600' : 'font-bold text-ice-300'}>{eyebrow}</span>
      </nav>
      <h1
        className={`mt-3 animate-fade-up ${
          onPhoto ? 'text-4xl text-navy-950 xl:text-[3.4rem]' : 'text-4xl text-white sm:text-5xl'
        }`}
      >
        {title}
      </h1>
      <p
        className={`mt-3 animate-fade-up leading-relaxed ${
          // On the photo: subtitle only on large desktops, where the banner is tall enough below the navbar
          onPhoto ? 'hidden max-w-md text-base font-semibold text-navy-900 xl:block xl:text-lg' : 'max-w-2xl text-lg text-navy-100'
        }`}
        style={{ animationDelay: '120ms' }}
      >
        {subtitle}
      </p>
    </>
  );
}

/**
 * Inner-page banner.
 * - Desktop: the full banner photo (nothing cropped) with the page heading on the left, in the photo's clear area.
 * - Phones: a taller banner the logo + menu float over (like the home page), heading below the logo.
 */
/** Banners already shown once this visit — shown instantly (no fade) when you come back to that page. */
const shownBanners = new Set<string>();

/** "/about us banner.webp" → phone-sized copy "/about us banner-sm.webp" (828px wide). */
export const smallBanner = (image: string) => image.replace(/\.webp$/, '-sm.webp');

const PHONE_QUERY = '(max-width: 1023px)';

/** True on phones/tablets (below the desktop layout). */
function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const onChange = () => setIsPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isPhone;
}

/**
 * Banner photo — exactly one file per page: the small copy on phones, the full one on desktop (the same
 * file that was preloaded, so it shows straight from the cache). Fades in only the first time.
 */
function BannerImage({ file }: { file: string }) {
  const src = encodeURI(file);
  const [loaded, setLoaded] = useState(() => shownBanners.has(src));
  const done = () => {
    shownBanners.add(src);
    setLoaded(true);
  };
  return (
    <img
      key={src}
      src={src}
      alt=""
      fetchPriority="high"
      decoding="async"
      ref={(el) => {
        // Already in the browser cache (e.g. preloaded) → show immediately
        if (el?.complete && el.naturalWidth && !loaded) done();
      }}
      onLoad={done}
      className={`absolute inset-0 size-full object-cover ${loaded ? 'opacity-100' : 'opacity-0 transition-opacity duration-300'}`}
    />
  );
}

export default function PageHero({ eyebrow, title, subtitle, image, textPosition = 'top-left', labels }: PageHeroProps) {
  const isPhone = useIsPhone();
  return (
    <section className="relative overflow-hidden bg-white">
      {/* ---- Phones / tablets: no navbar background — the logo floats over the banner ---- */}
      <div className="lg:hidden">
        {/* Natural 8:3 shape — the whole photo shows, nothing cropped (e.g. all 7 icons on the Services banner) */}
        <div data-banner className="relative aspect-[8/3] w-full bg-gradient-to-br from-sky-100 via-brand-50 to-white">
          {isPhone && <BannerImage file={smallBanner(image)} />}
          {/* Gentle shade at the top-right so the white menu toggle stays visible on the bright sky */}
          <div className="pointer-events-none absolute top-0 right-0 h-20 w-32 bg-gradient-to-bl from-navy-950/40 via-navy-950/10 to-transparent" />

          {/* Small heading on the photo — below the logo, or in the bottom wave for Contact */}
          <div
            className={`absolute inset-0 flex px-4 sm:px-6 ${
              textPosition === 'top-left' ? 'items-start pt-[5%]' : 'items-end pb-[3%]'
            }`}
          >
            <h1
              className={`animate-fade-up text-[clamp(17px,5vw,32px)] leading-[1.1] text-navy-950 ${
                textPosition === 'top-left' ? 'max-w-[55%]' : 'max-w-[80%]'
              }`}
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Phones: the label names scroll sideways in a strip under the banner */}
        {labels && labels.length > 0 && (
          <div className="relative overflow-hidden border-y border-brand-100 bg-brand-50 py-3" aria-label="Services">
            {/* Soft fade at both edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-brand-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-brand-50 to-transparent" />
            {/* The list is repeated twice so the loop is seamless */}
            <div className="marquee flex w-max">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                  {labels.map((l) => (
                    <li key={l.text} className="flex items-center">
                      <a
                        href={l.href}
                        tabIndex={copy === 1 ? -1 : undefined}
                        className="px-4 font-display text-sm font-bold whitespace-nowrap text-navy-900"
                      >
                        {l.text}
                      </a>
                      <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- Desktop: photo with heading on the left ---- */}
      <div className="relative hidden aspect-[8/3] w-full bg-gradient-to-br from-sky-100 via-brand-50 to-white lg:block">
        {!isPhone && <BannerImage file={image} />}

        {/* Labels on the photo (e.g. service names under the icons) — sized with the banner width */}
        {labels?.map((l) => {
          const cls =
            'absolute z-10 w-[12%] -translate-x-1/2 text-center font-display text-[clamp(12px,1.05vw,19px)] leading-tight font-bold text-navy-900 transition-colors';
          const style = { left: `${l.x}%`, top: `${l.y}%` };
          return l.href ? (
            <a key={l.text} href={l.href} className={`${cls} hover:text-brand-600`} style={style}>
              {l.text}
            </a>
          ) : (
            <span key={l.text} className={cls} style={style}>
              {l.text}
            </span>
          );
        })}

        <div
          className={`container-x relative flex h-full ${
            textPosition === 'top-left' ? 'items-start pt-24 xl:pt-28' : 'items-end pb-[3.5%]'
          }`}
        >
          {textPosition === 'top-left' ? (
            <div className="max-w-[min(36rem,38%)]">
              <Heading eyebrow={eyebrow} title={title} subtitle={subtitle} onPhoto />
            </div>
          ) : (
            // The bottom white wave is short: breadcrumb + one-line title only
            <div className="max-w-[60%] [&_p]:hidden">
              <Heading eyebrow={eyebrow} title={title} subtitle={subtitle} onPhoto />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

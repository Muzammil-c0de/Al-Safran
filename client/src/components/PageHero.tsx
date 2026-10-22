import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ToolDecor from './ToolDecor';

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
          onPhoto ? 'max-w-md text-base font-semibold text-navy-900 xl:text-lg' : 'max-w-2xl text-lg text-navy-100'
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
 * - Phones: heading on the blue band (room for the logo + menu), with the full photo underneath.
 */
export default function PageHero({ eyebrow, title, subtitle, image, textPosition = 'top-left', labels }: PageHeroProps) {
  const src = encodeURI(image);
  return (
    <section data-banner className="relative overflow-hidden bg-navy-900">
      {/* ---- Phones / tablets ---- */}
      <div className="lg:hidden">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-grid" />
          <ToolDecor variant="b" light />
          <div className="container-x relative pt-28 pb-10">
            <Heading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          </div>
        </div>
        <img src={src} alt="" className="block aspect-[8/3] w-full object-cover" fetchPriority="high" />
      </div>

      {/* ---- Desktop: photo with heading on the left ---- */}
      <div className="relative hidden aspect-[8/3] w-full lg:block">
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" fetchPriority="high" />

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
            textPosition === 'top-left' ? 'items-start pt-[4%]' : 'items-end pb-[3.5%]'
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

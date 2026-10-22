import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  text: string;
}

const PIPE = 40; // pipe thickness (px)
const WALL = 3; // outline thickness (px)
const BEND = 30; // elbow radius (px)
const SECTION_BG = '#1739a8'; // navy-900 — used to hollow out the pipe outline
// Solid water colour (a solid colour, not a gradient — gradients vanish on perfectly straight pipes)
const WATER = '#3fa9ec';

const clamp = (n: number) => Math.min(1, Math.max(0, n));

interface Pipe {
  d: string;
  fill: number;
}
interface Flange {
  x: number;
  y: number;
  /** true when the pipe runs left↔right (flange stands upright) */
  across?: boolean;
}

/**
 * The "How We Work" steps joined by a water pipeline.
 * - Desktop: cards in a row; the section locks in place while scrolling pumps water through the inlet,
 *   each card and the pipes between them, out of the end pipe — then the page carries on.
 * - Phones: cards stacked; water follows the scroll down through the pipes and out of the bottom pipe.
 * Scrolling up drains it back in both layouts.
 */
export default function ProcessFlow({ steps, heading }: { steps: Step[]; heading: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? (
    <HorizontalFlow steps={steps} heading={heading} />
  ) : (
    <>
      {/* Extra side padding keeps the heading clear of the pipe coming down the left edge */}
      <div className="relative z-10 px-6">{heading}</div>
      <VerticalFlow steps={steps} />
    </>
  );
}

/**
 * Smoothly eases a value toward its target every animation frame, so the water glides instead of
 * jumping with each scroll event. `epsilon` = how close counts as "arrived".
 */
function useSmooth(target: number, epsilon: number, ease = 0.12) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const frame = useRef(0);
  useEffect(() => {
    const step = () => {
      const diff = target - current.current;
      if (Math.abs(diff) <= epsilon) {
        current.current = target;
        setValue(target);
        frame.current = 0;
        return;
      }
      current.current += diff * ease;
      setValue(current.current);
      frame.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, epsilon, ease]);
  return value;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* ------------------------------------------------------------------ */
/* Desktop: cards in a row, section pinned while the water flows        */
/* ------------------------------------------------------------------ */

interface RowGeometry {
  width: number;
  top: number; // distance from the row up to the top of the pinned screen (positive)
  bottom: number; // distance from the row top down to the bottom of the pinned screen
  cards: { left: number; right: number; top: number; bottom: number }[];
}

function HorizontalFlow({ steps, heading }: { steps: Step[]; heading: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<RowGeometry | null>(null);
  const [rawProgress, setProgress] = useState(0); // 0 → 1 through the pinned scroll
  const progress = useSmooth(rawProgress, 0.0005);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const sticky = stickyRef.current;
    if (!row || !sticky) return;
    const measure = () => {
      const r = row.getBoundingClientRect();
      const s = sticky.getBoundingClientRect();
      setGeo({
        width: r.width,
        top: r.top - s.top,
        bottom: s.bottom - r.top,
        cards: cardRefs.current.map((c) => {
          const b = c!.getBoundingClientRect();
          return { left: b.left - r.left, right: b.right - r.left, top: b.top - r.top, bottom: b.bottom - r.top };
        }),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    ro.observe(sticky);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const outer = outerRef.current;
      if (!outer) return;
      const r = outer.getBoundingClientRect();
      const distance = r.height - window.innerHeight;
      setProgress(distance > 0 ? clamp(-r.top / distance) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Water runs through, in order: inlet, card 1, pipe, card 2, …, last card, outlet.
  const n = steps.length;
  const units = 2 * n + 1;
  const t = clamp(progress / 0.92) * units; // finish slightly before the pin releases
  const stage = (k: number) => clamp(t - k);
  const cardFill = (i: number) => stage(1 + i * 2);

  const pipes: Pipe[] = [];
  const flanges: Flange[] = [];
  if (geo && geo.cards.length === n) {
    const { cards, top, bottom } = geo;
    const first = cards[0];
    const last = cards[n - 1];

    // Inlet: straight down from the top of the screen into card 1
    const xIn = first.left + (first.right - first.left) * 0.3;
    pipes.push({ d: `M ${xIn} ${-top} V ${first.top + 8}`, fill: stage(0) });
    flanges.push({ x: xIn, y: -top + 60 }, { x: xIn, y: first.top - 14 });

    // Pipes between neighbouring cards, at mid-height
    for (let i = 0; i < n - 1; i++) {
      const a = cards[i];
      const b = cards[i + 1];
      const y = (a.top + a.bottom) / 2;
      pipes.push({ d: `M ${a.right - 8} ${y} H ${b.left + 8}`, fill: stage(2 + i * 2) });
      flanges.push({ x: a.right + 4, y, across: true }, { x: b.left - 16, y, across: true });
    }

    // Outlet: down from the last card to the bottom of the screen
    const xOut = last.left + (last.right - last.left) * 0.7;
    pipes.push({ d: `M ${xOut} ${last.bottom - 8} V ${bottom}`, fill: stage(units - 1) });
    flanges.push({ x: xOut, y: last.bottom + 4 }, { x: xOut, y: bottom - 60 });
  }

  return (
    // Tall wrapper = the extra scroll distance used to run the water while the content stays pinned
    <div ref={outerRef} style={{ height: `calc(100vh + ${n * 55}vh)` }}>
      <div ref={stickyRef} className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-16">
        <div className="relative z-10">{heading}</div>

        <div ref={rowRef} className="relative mt-24">
          {geo && <PipeLayer pipes={pipes} flanges={flanges} width={geo.width} />}
          <ol className="relative grid grid-cols-4 gap-16 xl:gap-20">
            {steps.map((s, i) => (
              <li key={s.title}>
                <StepCard
                  step={s}
                  index={i}
                  fill={cardFill(i)}
                  compact
                  cardRef={(el) => {
                    cardRefs.current[i] = el;
                  }}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phones/tablets: cards stacked, water follows the scroll position     */
/* ------------------------------------------------------------------ */

/** Where on screen the "water line" sits — everything above it is filled. */
const WATER_LINE = 0.65;
/** Horizontal position (fraction of width) where each pipe meets the cards — zig-zags left/right. */
const PIPE_X = [0.2, 0.74, 0.2, 0.74, 0.2, 0.74, 0.2];

interface ColumnGeometry {
  width: number;
  sectionTop: number; // wrapper top → section top (positive)
  sectionLeft: number; // wrapper left → section left edge (positive)
  sectionBottom: number; // wrapper top → section bottom
  cards: { top: number; bottom: number }[];
}

function VerticalFlow({ steps }: { steps: Step[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<ColumnGeometry | null>(null);
  const [rawLineY, setLineY] = useState(0);
  const lineY = useSmooth(rawLineY, 0.5);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const section = wrap.closest('section');
    const measure = () => {
      const w = wrap.getBoundingClientRect();
      const s = section?.getBoundingClientRect() ?? w;
      setGeo({
        width: w.width,
        sectionTop: w.top - s.top,
        sectionLeft: w.left - s.left,
        sectionBottom: s.bottom - w.top,
        cards: cardRefs.current.map((c) => {
          const r = c!.getBoundingClientRect();
          return { top: r.top - w.top, bottom: r.bottom - w.top };
        }),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    if (section) ro.observe(section);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      if (wrap) setLineY(window.innerHeight * WATER_LINE - wrap.getBoundingClientRect().top);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const pipes: Pipe[] = [];
  const flanges: Flange[] = [];
  let valve: { x: number; y: number } | null = null;

  if (geo && geo.cards.length) {
    const { width, sectionTop, sectionLeft, sectionBottom, cards } = geo;
    const top = -sectionTop;
    const xIn = -sectionLeft + 18 + PIPE / 2; // down the left edge of the blue section
    const x0 = PIPE_X[0] * width;
    const runY = cards[0].top - 56;

    // Inlet: down from the section top, elbow, across, elbow, down into card 1
    pipes.push({
      d: `M ${xIn} ${top} V ${runY - BEND} Q ${xIn} ${runY} ${xIn + BEND} ${runY} H ${x0 - BEND} Q ${x0} ${runY} ${x0} ${
        runY + BEND
      } V ${cards[0].top + 8}`,
      fill: clamp((lineY - top) / (cards[0].top - top)),
    });
    flanges.push({ x: xIn, y: top + 70 }, { x: x0, y: cards[0].top - 14 });
    valve = { x: (xIn + x0) / 2, y: runY };

    // Card-to-card pipes
    for (let i = 1; i < cards.length; i++) {
      const x = PIPE_X[i] * width;
      const y1 = cards[i - 1].bottom;
      const y2 = cards[i].top;
      pipes.push({ d: `M ${x} ${y1 - 8} V ${y2 + 8}`, fill: clamp((lineY - y1) / (y2 - y1)) });
      flanges.push({ x, y: y1 + 4 }, { x, y: y2 - 14 });
    }

    // Outlet: from the bottom of the last card down to the bottom of the section
    const last = cards[cards.length - 1];
    const xOut = PIPE_X[cards.length] * width;
    pipes.push({
      d: `M ${xOut} ${last.bottom - 8} V ${sectionBottom}`,
      fill: clamp((lineY - last.bottom) / (sectionBottom - last.bottom)),
    });
    flanges.push({ x: xOut, y: last.bottom + 4 });
  }

  const cardFill = (i: number) => {
    const c = geo?.cards[i];
    return c ? clamp((lineY - c.top) / (c.bottom - c.top)) : 0;
  };

  return (
    <div ref={wrapRef} className="relative mx-auto mt-28 max-w-3xl">
      {geo && <PipeLayer pipes={pipes} flanges={flanges} valve={valve} width={geo.width} />}
      <ol className="relative space-y-24">
        {steps.map((s, i) => (
          <li key={s.title}>
            <StepCard
              step={s}
              index={i}
              fill={cardFill(i)}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                        */
/* ------------------------------------------------------------------ */

function PipeLayer({
  pipes,
  flanges,
  valve,
  width,
}: {
  pipes: Pipe[];
  flanges: Flange[];
  valve?: { x: number; y: number } | null;
  width: number;
}) {
  return (
    <svg className="pointer-events-none absolute top-0 left-0 overflow-visible" width={width} height={1} aria-hidden="true">
      {/* Masks: each pipe's water only shows up to its current fill level */}
      <defs>
        {pipes.map((p, i) => (
          <mask key={i} id={`pipe-mask-${i}`} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={10000} height={10000}>
            <path
              d={p.d}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={PIPE}
              strokeDasharray="1 1"
              strokeDashoffset={1 - p.fill}
              className="pipe-fill"
            />
          </mask>
        ))}
      </defs>

      {pipes.map((p, i) => (
        <g key={i} fill="none" strokeLinejoin="round">
          {/* Line-art pipe (matches the outlined tool icons): white outline, hollow inside */}
          <path d={p.d} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={PIPE} />
          <path d={p.d} stroke={SECTION_BG} strokeWidth={PIPE - WALL * 2} />
          {/* Water, revealed up to the fill level — same colour in every pipe as in the cards */}
          <g mask={`url(#pipe-mask-${i})`}>
            <path d={p.d} stroke={WATER} strokeWidth={PIPE - WALL * 2 - 4} />
          </g>
        </g>
      ))}

      {/* Flange joints — outlined, like the pipe */}
      {flanges.map((f, i) =>
        f.across ? (
          <rect key={i} x={f.x} y={f.y - PIPE / 2 - 8} width={12} height={PIPE + 16} rx={4} fill={SECTION_BG} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={2} />
        ) : (
          <rect key={i} x={f.x - PIPE / 2 - 8} y={f.y - 1} width={PIPE + 16} height={12} rx={4} fill={SECTION_BG} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={2} />
        )
      )}

      {/* Valve wheel — outlined */}
      {valve && (
        <g transform={`translate(${valve.x} ${valve.y - PIPE / 2 - 18})`} fill="none" stroke="#ffffff" strokeOpacity={0.6}>
          <path d="M 0 14 V 18" strokeWidth={3} />
          <g className="valve-wheel">
            <circle r={13} strokeWidth={2.5} />
            <path d="M -13 0 H 13 M 0 -13 V 13" strokeWidth={2} />
            <circle r={3} fill="#ffffff" fillOpacity={0.6} stroke="none" />
          </g>
        </g>
      )}
    </svg>
  );
}

function StepCard({
  step,
  index,
  fill,
  compact,
  cardRef,
}: {
  step: Step;
  index: number;
  fill: number;
  compact?: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const Icon = step.icon;
  const full = fill >= 0.98;
  return (
    <div
      ref={cardRef}
      className={`relative h-full overflow-hidden rounded-2xl border-2 bg-navy-950/70 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-colors duration-500 ${
        compact ? 'p-6' : 'p-6 lg:p-8'
      } ${fill > 0 ? 'border-ice-300/70' : 'border-white/15'}`}
    >
      {/* Water */}
      {/* Water — a full-size layer slid up from the bottom (smoother than animating height) */}
      <div
        className="card-water absolute inset-0"
        style={{ transform: `translate3d(0, ${(1 - fill) * 100}%, 0)`, opacity: fill > 0.001 ? 1 : 0 }}
        aria-hidden="true"
      />

      <div className={`relative flex gap-4 ${compact ? 'flex-col' : 'items-start'}`}>
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-xl bg-white text-navy-900 transition-shadow duration-500 ${
            full ? 'shadow-[0_0_24px_rgba(63,169,236,0.8)]' : ''
          }`}
        >
          <Icon className="size-6" strokeWidth={2.2} />
        </span>
        <div>
          <span className="font-display text-xs font-bold tracking-[0.25em] text-ice-300 uppercase">Step 0{index + 1}</span>
          <h3 className="mt-1 text-xl text-white lg:text-2xl">{step.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-navy-50">{step.text}</p>
        </div>
      </div>
    </div>
  );
}

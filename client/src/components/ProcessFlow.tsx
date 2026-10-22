import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  text: string;
}

/** Where on screen the "water line" sits — everything above it is filled. 0.65 = 65% down the viewport. */
const WATER_LINE = 0.65;
/** Horizontal position (fraction of width) where the pipe enters each card — zig-zags left/right. */
const PIPE_X = [0.2, 0.74, 0.2, 0.74, 0.2, 0.74];
const PIPE = 40; // pipe thickness (px)
const WALL = 3; // outline thickness (px)
const BEND = 30; // elbow radius (px)
const SECTION_BG = '#1739a8'; // navy-900 — used to hollow out the pipe outline
// Solid water colour (a solid colour, not a gradient — gradients vanish on perfectly straight pipes)
const WATER = '#3fa9ec';

const clamp = (n: number) => Math.min(1, Math.max(0, n));

interface Geometry {
  width: number;
  sectionTop: number; // distance from wrapper top up to the section top (positive)
  sectionLeft: number; // distance from wrapper left to the section left edge (positive)
  cards: { top: number; bottom: number }[]; // relative to wrapper
}

/**
 * Process steps joined by a real pipeline: it enters from the top of the blue section, bends into card 1,
 * and a pipe runs from each card's bottom into the next card's top. Scrolling pumps water through the pipes
 * and fills each card in turn; scrolling up drains it back.
 */
export default function ProcessFlow({ steps }: { steps: Step[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [lineY, setLineY] = useState(-1e6); // water line, in wrapper coordinates

  // Measure the layout (cards, section edges) — on mount and whenever sizes change.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const w = wrap.getBoundingClientRect();
      const section = wrap.closest('section')?.getBoundingClientRect() ?? w;
      setGeo({
        width: w.width,
        sectionTop: w.top - section.top,
        sectionLeft: w.left - section.left,
        cards: cardRefs.current.map((c) => {
          const r = c!.getBoundingClientRect();
          return { top: r.top - w.top, bottom: r.bottom - w.top };
        }),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Track the water line as the page scrolls.
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

  // ---- Build the pipe paths from the measured layout ----
  const pipes: { d: string; fill: number }[] = [];
  const flanges: { x: number; y: number }[] = [];
  let valve: { x: number; y: number } | null = null;

  if (geo && geo.cards.length) {
    const { width, sectionTop, sectionLeft, cards } = geo;
    const top = -sectionTop; // section top edge (wrapper coords)
    const xIn = -sectionLeft + 18 + PIPE / 2; // down the left edge of the blue section
    const x0 = PIPE_X[0] * width;
    const runY = cards[0].top - 56; // horizontal run above card 1

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
      const x = PIPE_X[i % PIPE_X.length] * width;
      const y1 = cards[i - 1].bottom;
      const y2 = cards[i].top;
      pipes.push({ d: `M ${x} ${y1 - 8} V ${y2 + 8}`, fill: clamp((lineY - y1) / (y2 - y1)) });
      flanges.push({ x, y: y1 + 4 }, { x, y: y2 - 14 });
    }
  }

  const cardFill = (i: number) => {
    const c = geo?.cards[i];
    return c ? clamp((lineY - c.top) / (c.bottom - c.top)) : 0;
  };

  return (
    <div ref={wrapRef} className="relative mx-auto mt-28 max-w-3xl">
      {/* Pipeline (behind the cards) */}
      {geo && (
        <svg
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
          width={geo.width}
          height={1}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7fe8f5" />
              <stop offset="1" stopColor="#1d74e0" />
            </linearGradient>
            <linearGradient id="flange-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7d8bab" />
              <stop offset="0.45" stopColor="#f4f7fc" />
              <stop offset="1" stopColor="#7d8bab" />
            </linearGradient>
          </defs>

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
          {flanges.map((f, i) => (
            <rect
              key={i}
              x={f.x - PIPE / 2 - 8}
              y={f.y - 1}
              width={PIPE + 16}
              height={12}
              rx={4}
              fill={SECTION_BG}
              stroke="#ffffff"
              strokeOpacity={0.55}
              strokeWidth={2}
            />
          ))}

          {/* Valve wheel on the inlet run — outlined */}
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
      )}

      {/* Step cards */}
      <ol className="relative space-y-24">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const fill = cardFill(i);
          const full = fill >= 0.98;
          return (
            <li key={s.title}>
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`relative overflow-hidden rounded-2xl border-2 bg-navy-950/70 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-colors duration-500 lg:p-8 ${
                  fill > 0 ? 'border-ice-300/70' : 'border-white/15'
                }`}
              >
                {/* Water */}
                <div className="card-water absolute inset-x-0 bottom-0" style={{ height: `${fill * 100}%` }} aria-hidden="true" />

                <div className="relative flex items-start gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl transition-all duration-500 ${
                      full ? 'bg-white text-navy-900 shadow-[0_0_24px_rgba(63,169,236,0.8)]' : 'bg-white text-navy-900'
                    }`}
                  >
                    <Icon className="size-6" strokeWidth={2.2} />
                  </span>
                  <div>
                    <span className="font-display text-xs font-bold tracking-[0.25em] text-ice-300 uppercase">Step 0{i + 1}</span>
                    <h3 className="mt-1 text-xl text-white lg:text-2xl">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-navy-50">{s.text}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { site } from '@/data/site';

const MIN_TIME = 2200; // keep the intro on screen at least this long (ms)
const FADE_TIME = 700;

/** Opening screen: a sleek wall AC in swing mode, "Cooling up…", then fades into the site. */
export default function Preloader() {
  const [phase, setPhase] = useState<'show' | 'leaving' | 'done'>('show');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const start = performance.now();

    const finish = () => {
      const wait = Math.max(0, MIN_TIME - (performance.now() - start));
      window.setTimeout(() => {
        setPhase('leaving');
        document.body.style.overflow = '';
        window.setTimeout(() => setPhase('done'), FADE_TIME);
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    return () => {
      window.removeEventListener('load', finish);
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
      {/* Brand */}
      <text x="26" y="28" fontSize="8" fontWeight="700" fill="#1739a8" fillOpacity="0.55" stroke="none" fontFamily="Tinos, serif" letterSpacing="2">
        AL SAFRAN
      </text>
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

import { Cog, Gauge, HardHat, Hammer, Ruler, Settings, Thermometer, Wrench, type LucideIcon } from 'lucide-react';

/**
 * Faint technician tools (spanners, gears, gauges…) scattered in a section's background.
 * Place inside a `relative overflow-hidden` section. Purely decorative.
 */

interface Tool {
  icon: LucideIcon;
  className: string;
  spin?: 'slow' | 'reverse';
}

const layouts: Record<'a' | 'b' | 'c', Tool[]> = {
  a: [
    { icon: Settings, className: 'top-8 -left-10 size-40', spin: 'slow' },
    { icon: Wrench, className: 'top-1/3 right-6 size-24 rotate-[30deg]' },
    { icon: Cog, className: '-bottom-12 right-1/4 size-36', spin: 'reverse' },
    { icon: Hammer, className: 'bottom-16 left-[8%] size-16 -rotate-12 max-md:hidden' },
  ],
  b: [
    { icon: Cog, className: '-top-10 right-[6%] size-44', spin: 'reverse' },
    { icon: Gauge, className: 'bottom-10 left-6 size-24 -rotate-6' },
    { icon: Wrench, className: 'top-1/2 left-[42%] size-16 -rotate-[60deg] max-md:hidden' },
    { icon: Ruler, className: 'bottom-1/4 right-10 size-20 rotate-45 max-md:hidden' },
  ],
  c: [
    { icon: HardHat, className: 'top-10 right-[8%] size-24 rotate-6' },
    { icon: Settings, className: '-bottom-14 -left-10 size-48', spin: 'slow' },
    { icon: Thermometer, className: 'top-1/3 left-[6%] size-16 -rotate-12 max-md:hidden' },
    { icon: Wrench, className: 'bottom-12 right-[30%] size-20 rotate-[120deg] max-md:hidden' },
  ],
};

export default function ToolDecor({
  variant = 'a',
  light = false,
}: {
  variant?: keyof typeof layouts;
  /** true on blue backgrounds (white tools), false on white backgrounds (blue tools) */
  light?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {layouts[variant].map(({ icon: Icon, className, spin }, i) => (
        <Icon
          key={i}
          strokeWidth={1.2}
          className={`absolute ${className} ${light ? 'text-white/[0.08]' : 'text-brand-500/[0.07]'} ${
            spin === 'slow' ? 'animate-spin-slow' : spin === 'reverse' ? 'animate-spin-slow-reverse' : ''
          }`}
        />
      ))}
    </div>
  );
}

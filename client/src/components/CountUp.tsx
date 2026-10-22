import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** e.g. "1985", "41+" — the leading number animates, anything after it (like "+") is kept as-is */
  value: string;
  duration?: number;
  className?: string;
}

/** Counts from 0 up to the number once it scrolls into view. */
export default function CountUp({ value, duration = 1800, className }: CountUpProps) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const isNumeric = Boolean(match);

  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isNumeric) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(target);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out: fast start, gentle finish
          setCurrent(Math.round(target * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration, isNumeric]);

  // Non-numeric values (e.g. "24/7") are shown as-is.
  if (!match) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} className={className} aria-label={value}>
      {current}
      {suffix}
    </span>
  );
}

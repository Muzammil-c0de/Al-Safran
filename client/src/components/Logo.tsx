import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '@/data/site';

interface LogoProps {
  variant?: 'dark' | 'light';
  onClick?: () => void;
}

/** Shows /logo.png from the public folder, with a text mark fallback until it's added. */
export default function Logo({ variant = 'dark', onClick }: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const light = variant === 'light';

  return (
    <Link to="/" onClick={onClick} className="flex shrink-0 items-center gap-3" aria-label={`${site.name} — Home`}>
      {imgFailed ? (
        <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-base font-extrabold text-white shadow-md shadow-brand-500/30">
          AS
        </span>
      ) : (
        <img
          src="/logo.png"
          alt={site.name}
          className="size-12 rounded-full bg-white object-contain ring-1 ring-black/5"
          onError={() => setImgFailed(true)}
        />
      )}
      {(site.showNameNextToLogo || imgFailed) && (
        <span
          className={`font-brand text-[1.05rem] leading-none font-bold tracking-[0.08em] uppercase ${
            light ? 'text-white' : 'text-[#111]'
          }`}
        >
          {site.name}
        </span>
      )}
    </Link>
  );
}

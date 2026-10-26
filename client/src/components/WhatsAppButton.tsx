import type { ReactNode } from 'react';
import { site } from '@/data/site';

const message = `Hello ${site.name}, I would like to enquire about your services.`;

/** One round floating button with a label that slides out on hover (desktop). */
function FloatButton({
  href,
  label,
  className,
  pulse,
  children,
}: {
  href: string;
  label: string;
  className: string;
  pulse?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="group flex items-center justify-end gap-2">
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-white px-4 py-2 font-display text-sm font-bold whitespace-nowrap text-navy-900 opacity-0 shadow-lg transition group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        {label}
      </span>
      <span className={`relative grid shrink-0 place-items-center rounded-full text-white shadow-xl shadow-black/20 transition group-hover:scale-110 ${className}`}>
        {pulse && <span className={`absolute inset-0 animate-ping rounded-full opacity-30 [animation-duration:2.5s] ${pulse}`} />}
        {children}
      </span>
    </a>
  );
}

/** Floating Instagram + WhatsApp buttons, bottom-right on every page. */
export default function WhatsAppButton() {
  const instagram = site.social?.instagram;
  if (!site.whatsapp && !instagram) return null;
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {instagram && (
        <FloatButton
          href={instagram}
          label="Follow us on Instagram"
          className="size-12 bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]"
        >
          {/* Instagram logo */}
          <svg viewBox="0 0 24 24" className="relative size-6" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
        </FloatButton>
      )}

      {site.whatsapp && (
        <FloatButton
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`}
          label="Chat with us"
          className="size-14 bg-[#25D366]"
          pulse="bg-[#25D366]"
        >
          {/* WhatsApp logo */}
          <svg viewBox="0 0 32 32" className="relative size-8" fill="currentColor" aria-hidden="true">
            <path d="M16.004 3C8.832 3 3 8.83 3 15.998c0 2.293.6 4.53 1.74 6.504L3 29l6.68-1.75a12.96 12.96 0 0 0 6.32 1.62h.005C23.175 28.87 29 23.04 29 15.872 29 8.704 23.176 3 16.004 3Zm0 23.68h-.004a10.76 10.76 0 0 1-5.48-1.5l-.393-.233-3.964 1.04 1.058-3.865-.256-.397a10.7 10.7 0 0 1-1.65-5.726c0-5.94 4.835-10.773 10.79-10.773 5.947 0 10.68 4.705 10.68 10.645 0 5.94-4.83 10.81-10.78 10.81Zm5.91-8.06c-.323-.162-1.915-.945-2.212-1.053-.297-.108-.513-.162-.729.162-.216.324-.837 1.053-1.026 1.27-.19.216-.378.243-.702.081-.324-.162-1.368-.504-2.605-1.607-.963-.858-1.613-1.918-1.802-2.242-.19-.324-.02-.5.142-.66.146-.145.324-.379.486-.568.162-.19.216-.324.324-.54.108-.216.054-.405-.027-.567-.081-.162-.729-1.756-.999-2.404-.263-.632-.53-.546-.729-.556l-.62-.011a1.19 1.19 0 0 0-.864.405c-.297.324-1.134 1.108-1.134 2.702 0 1.594 1.161 3.134 1.323 3.35.162.216 2.285 3.488 5.535 4.89.773.334 1.377.533 1.848.683.776.247 1.483.212 2.041.129.623-.093 1.915-.783 2.185-1.54.27-.756.27-1.404.19-1.54-.082-.135-.298-.216-.622-.378Z" />
          </svg>
        </FloatButton>
      )}
    </div>
  );
}

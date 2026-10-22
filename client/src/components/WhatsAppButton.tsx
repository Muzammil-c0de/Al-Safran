import { site } from '@/data/site';

const message = `Hello ${site.name}, I would like to enquire about your services.`;

/** Floating WhatsApp button, bottom-right on every page. */
export default function WhatsAppButton() {
  if (!site.whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 sm:right-6 sm:bottom-6"
    >
      {/* Label appears on hover (desktop) */}
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-navy-900 opacity-0 shadow-lg transition group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Chat with us
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition group-hover:scale-110">
        {/* Soft pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.5s]" />
        {/* WhatsApp logo */}
        <svg viewBox="0 0 32 32" className="relative size-8" fill="currentColor" aria-hidden="true">
          <path d="M16.004 3C8.832 3 3 8.83 3 15.998c0 2.293.6 4.53 1.74 6.504L3 29l6.68-1.75a12.96 12.96 0 0 0 6.32 1.62h.005C23.175 28.87 29 23.04 29 15.872 29 8.704 23.176 3 16.004 3Zm0 23.68h-.004a10.76 10.76 0 0 1-5.48-1.5l-.393-.233-3.964 1.04 1.058-3.865-.256-.397a10.7 10.7 0 0 1-1.65-5.726c0-5.94 4.835-10.773 10.79-10.773 5.947 0 10.68 4.705 10.68 10.645 0 5.94-4.83 10.81-10.78 10.81Zm5.91-8.06c-.323-.162-1.915-.945-2.212-1.053-.297-.108-.513-.162-.729.162-.216.324-.837 1.053-1.026 1.27-.19.216-.378.243-.702.081-.324-.162-1.368-.504-2.605-1.607-.963-.858-1.613-1.918-1.802-2.242-.19-.324-.02-.5.142-.66.146-.145.324-.379.486-.568.162-.19.216-.324.324-.54.108-.216.054-.405-.027-.567-.081-.162-.729-1.756-.999-2.404-.263-.632-.53-.546-.729-.556l-.62-.011a1.19 1.19 0 0 0-.864.405c-.297.324-1.134 1.108-1.134 2.702 0 1.594 1.161 3.134 1.323 3.35.162.216 2.285 3.488 5.535 4.89.773.334 1.377.533 1.848.683.776.247 1.483.212 2.041.129.623-.093 1.915-.783 2.185-1.54.27-.756.27-1.404.19-1.54-.082-.135-.298-.216-.622-.378Z" />
        </svg>
      </span>
    </a>
  );
}

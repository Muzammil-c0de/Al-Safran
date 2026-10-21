import { MessageCircle } from 'lucide-react';
import { site } from '@/data/site';

export default function WhatsAppButton() {
  if (!site.whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${site.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition hover:scale-110"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import WhatsAppButton from './WhatsAppButton';
import Preloader from './Preloader';
import { smallBanner } from './PageHero';

/** Banners of the inner pages — downloaded quietly after the first page has loaded, so page changes are instant. */
const PAGE_BANNERS = ['/ourservice banner.webp', '/about us banner.webp', '/project banner.webp', '/contact banner.webp'];

export default function Layout() {
  useEffect(() => {
    const isPhone = window.matchMedia('(max-width: 1023px)').matches;
    const run = () => {
      // Skip on data-saver connections
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (conn?.saveData) return;
      // Phones get the small banner copies (and the phone version of the 2nd home slide)
      const files = isPhone
        ? [...PAGE_BANNERS.map(smallBanner), '/banner2mobile.webp']
        : [...PAGE_BANNERS, '/banner2.webp'];
      files.forEach((p) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = encodeURI(p);
        // Decode ahead too, so showing it later doesn't stutter
        img.decode?.().catch(() => {});
      });
    };
    const start = () => {
      // Phones: start right away (the small files are tiny); desktop: when the browser is idle
      if (isPhone) setTimeout(run, 200);
      else if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 2000 });
      else setTimeout(run, 1000); // Safari has no requestIdleCallback
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Preloader />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

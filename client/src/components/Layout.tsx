import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import WhatsAppButton from './WhatsAppButton';
import Preloader from './Preloader';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Opening screen — also downloads every banner image, so the whole site is ready when it fades */}
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

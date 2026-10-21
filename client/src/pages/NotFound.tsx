import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="section">
      <div className="container-x py-10 text-center">
        <p className="text-8xl font-extrabold text-brand-500">404</p>
        <h1 className="mt-4 text-3xl">Page not found</h1>
        <p className="mt-3">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-dark mt-8">
          <ArrowLeft className="size-4" /> Back to Home
        </Link>
      </div>
    </section>
  );
}

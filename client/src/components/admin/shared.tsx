import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api';

/** Props every admin section receives. */
export interface SectionProps {
  token: string;
  /** Call with any caught error — logs out on an expired session, otherwise returns a readable message. */
  onError: (err: unknown) => string;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  return err instanceof ApiError ? err.message : fallback;
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`size-6 animate-spin text-brand-500 ${className}`} />;
}

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-4 py-3 text-sm ${
        tone === 'error' ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-green-200 bg-green-50 text-green-700'
      }`}
    >
      {children}
    </p>
  );
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="card grid place-items-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
      <h3 className="mt-4 text-xl">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
    </div>
  );
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatBytes = (n?: number) => {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

import { useEffect, useState } from 'react';
import { FolderKanban, Image as ImageIcon, Inbox, Mail, Upload, Video } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminStats, ContactMessage } from '@/types';
import { Alert, PageTitle, Spinner, formatDate, type SectionProps } from './shared';
import type { AdminTab } from './tabs';

export default function Dashboard({ token, onError, username, go }: SectionProps & { username: string; go: (tab: AdminTab) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<ContactMessage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.admin.stats(token), api.admin.messages(token)])
      .then(([s, m]) => {
        setStats(s);
        setRecent(m.slice(0, 5));
      })
      .catch((err) => setError(onError(err)));
  }, [token, onError]);

  const cards = stats
    ? [
        { label: 'Unread messages', value: stats.unread, sub: `${stats.messages} total`, icon: Inbox, tab: 'messages' as const, accent: 'bg-amber-50 text-amber-600' },
        { label: 'Projects', value: stats.projects, sub: 'Published', icon: FolderKanban, tab: 'projects' as const, accent: 'bg-brand-50 text-brand-600' },
        { label: 'Images', value: stats.images, sub: 'In media library', icon: ImageIcon, tab: 'media' as const, accent: 'bg-sky-50 text-sky-600' },
        { label: 'Videos', value: stats.videos, sub: 'In media library', icon: Video, tab: 'media' as const, accent: 'bg-violet-50 text-violet-600' },
      ]
    : [];

  return (
    <>
      <PageTitle title={`Welcome, ${username}`} subtitle="Here's what's happening on your website." />
      {error && <Alert>{error}</Alert>}
      {!stats && !error && <Spinner />}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.label}
                  onClick={() => go(c.tab)}
                  className="card flex items-center gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${c.accent}`}>
                    <Icon className="size-6" />
                  </span>
                  <span>
                    <span className="block font-display text-3xl font-bold text-navy-900">{c.value}</span>
                    <span className="block text-sm font-semibold text-navy-900">{c.label}</span>
                    <span className="block text-xs text-slate-500">{c.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Recent messages */}
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">Recent messages</h2>
                <button onClick={() => go('messages')} className="text-sm font-semibold text-brand-600 hover:underline">
                  View all
                </button>
              </div>
              {recent.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No messages yet. They'll appear here when someone uses the contact form.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {recent.map((m) => (
                    <li key={m.id} className="flex items-start gap-3 py-3">
                      <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${m.is_read ? 'bg-slate-200' : 'bg-brand-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className={`truncate ${m.is_read ? 'font-medium' : 'font-bold'} text-navy-900`}>{m.name}</span>
                          <span className="text-xs text-slate-400">{formatDate(m.created_at)}</span>
                        </p>
                        <p className="truncate text-sm text-slate-500">{m.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick actions */}
            <div className="card p-6">
              <h2 className="text-xl">Quick actions</h2>
              <div className="mt-4 space-y-3">
                <button onClick={() => go('media')} className="btn btn-primary w-full">
                  <Upload className="size-4" /> Upload images / videos
                </button>
                <button onClick={() => go('projects')} className="btn btn-outline w-full">
                  <FolderKanban className="size-4" /> Add a project
                </button>
                <button onClick={() => go('messages')} className="btn btn-outline w-full">
                  <Mail className="size-4" /> Read messages
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

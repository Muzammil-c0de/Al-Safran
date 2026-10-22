import { useEffect, useMemo, useState } from 'react';
import { Inbox, Mail, MailOpen, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { ContactMessage } from '@/types';
import { Alert, EmptyState, PageTitle, Spinner, formatDate, type SectionProps } from './shared';

type Filter = 'all' | 'unread';

export default function Messages({ token, onError, onChanged }: SectionProps & { onChanged: () => void }) {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .messages(token)
      .then(setMessages)
      .catch((err) => setError(onError(err)));
  }, [token, onError]);

  const list = useMemo(
    () => (messages ?? []).filter((m) => (filter === 'unread' ? !m.is_read : true)),
    [messages, filter]
  );
  const unread = (messages ?? []).filter((m) => !m.is_read).length;

  const setRead = async (m: ContactMessage, isRead: boolean) => {
    setMessages((all) => all?.map((x) => (x.id === m.id ? { ...x, is_read: isRead } : x)) ?? null);
    try {
      await api.admin.markMessage(token, m.id, isRead);
      onChanged();
    } catch (err) {
      setError(onError(err));
    }
  };

  const open = (m: ContactMessage) => {
    setOpenId((id) => (id === m.id ? null : m.id));
    if (!m.is_read) void setRead(m, true);
  };

  const remove = async (m: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
    try {
      await api.admin.deleteMessage(token, m.id);
      setMessages((all) => all?.filter((x) => x.id !== m.id) ?? null);
      onChanged();
    } catch (err) {
      setError(onError(err));
    }
  };

  const whatsappLink = (phone: string) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = `971${digits.slice(1)}`; // local UAE number → international
    return `https://wa.me/${digits}`;
  };

  return (
    <>
      <PageTitle title="Messages" subtitle="Enquiries sent from the website's contact form." />

      <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-white p-1">
        {(
          [
            ['all', `All (${messages?.length ?? 0})`],
            ['unread', `Unread (${unread})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === key ? 'bg-navy-900 text-white' : 'text-navy-800 hover:text-brand-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {!messages && !error && <Spinner />}

      {messages && list.length === 0 && (
        <EmptyState
          icon={<Inbox className="size-7" />}
          title={filter === 'unread' ? 'All caught up' : 'No messages yet'}
          text={filter === 'unread' ? 'You have read every message.' : 'Messages from the contact form will appear here.'}
        />
      )}

      <ul className="space-y-3">
        {list.map((m) => {
          const isOpen = openId === m.id;
          return (
            <li key={m.id} className={`card overflow-hidden transition ${m.is_read ? '' : 'border-l-4 border-l-brand-500'}`}>
              <button onClick={() => open(m)} className="flex w-full items-start gap-4 p-5 text-left" aria-expanded={isOpen}>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-lg font-bold text-brand-600 uppercase">
                  {m.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className={`text-navy-900 ${m.is_read ? 'font-semibold' : 'font-bold'}`}>{m.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(m.created_at)}</span>
                  </span>
                  {m.service && (
                    <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                      {m.service}
                    </span>
                  )}
                  <span className={`mt-1 block text-sm text-slate-600 ${isOpen ? 'whitespace-pre-line' : 'truncate'}`}>{m.message}</span>
                </span>
              </button>

              {isOpen && (
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Your enquiry to Al Safran')}`} className="btn btn-primary !px-4 !py-2 !text-sm">
                    <Mail className="size-4" /> Reply by email
                  </a>
                  {m.phone && (
                    <>
                      <a href={whatsappLink(m.phone)} target="_blank" rel="noopener noreferrer" className="btn !bg-[#25D366] !px-4 !py-2 !text-sm text-white">
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                      <a href={`tel:${m.phone}`} className="btn btn-outline !px-4 !py-2 !text-sm">
                        <Phone className="size-4" /> {m.phone}
                      </a>
                    </>
                  )}
                  <span className="text-xs break-all text-slate-500">{m.email}</span>
                  <span className="ml-auto flex gap-1">
                    <button
                      onClick={() => setRead(m, !m.is_read)}
                      className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-brand-600"
                      title={m.is_read ? 'Mark as unread' : 'Mark as read'}
                      aria-label={m.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {m.is_read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                    </button>
                    <button
                      onClick={() => remove(m)}
                      className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                      aria-label="Delete message"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

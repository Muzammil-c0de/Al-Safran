import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Inbox, Loader2, LogOut, Plus, Trash2, FolderKanban } from 'lucide-react';
import Logo from '@/components/Logo';
import { api, ApiError } from '@/lib/api';
import { projectCategories } from '@/data/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { ContactMessage, Project } from '@/types';

const TOKEN_KEY = 'alsafran-admin-token';

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export default function Admin() {
  useDocumentTitle('Admin');
  const [token, setToken] = useState(readToken);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.admin
      .verify(token)
      .then(() => setAuthed(true))
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
      });
  }, [token]);

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={setToken} checking={Boolean(token)} />;
  return <Dashboard token={token} onLogout={logout} />;
}

function Login({ onLogin, checking }: { onLogin: (t: string) => void; checking: boolean }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.admin.verify(value);
      sessionStorage.setItem(TOKEN_KEY, value);
      onLogin(value);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="card p-8">
          <h1 className="text-2xl">Admin login</h1>
          <p className="mt-1 text-sm">Enter the admin token configured on the server.</p>
          <label htmlFor="token" className="label mt-6">
            Admin token
          </label>
          <input
            id="token"
            type="password"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button className="btn btn-primary mt-6 w-full" disabled={busy || checking || !value}>
            {busy || checking ? <Loader2 className="size-4 animate-spin" /> : null} Log in
          </button>
          <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium hover:text-brand-600">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<'projects' | 'messages'>('projects');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-x flex h-20 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-outline hidden sm:inline-flex">
              View site
            </Link>
            <button onClick={onLogout} className="btn btn-dark">
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="container-x py-10">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {(
            [
              ['projects', 'Projects', FolderKanban],
              ['messages', 'Messages', Inbox],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === key ? 'bg-navy-900 text-white' : 'text-navy-800 hover:text-brand-600'
              }`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-8">{tab === 'projects' ? <ProjectsAdmin token={token} /> : <MessagesAdmin token={token} />}</div>
      </div>
    </div>
  );
}

const emptyForm = { title: '', category: projectCategories[0] as string, location: '', completed_on: '', description: '' };

function ProjectsAdmin({ token }: { token: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await api.getProjects());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!file) return setPreview('');
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await api.admin.createProject(token, fd);
      setForm(emptyForm);
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Project) => {
    if (!window.confirm(`Delete "${p.title}"? This also removes its image.`)) return;
    try {
      await api.admin.deleteProject(token, p.id);
      setProjects((list) => list.filter((x) => x.id !== p.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form onSubmit={submit} className="card h-fit p-6 lg:col-span-5">
        <h2 className="flex items-center gap-2 text-xl">
          <Plus className="size-5 text-brand-500" /> Add project
        </h2>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="title">
              Title *
            </label>
            <input id="title" name="title" className="input" value={form.title} onChange={onChange} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">
                Category *
              </label>
              <select id="category" name="category" className="input" value={form.category} onChange={onChange}>
                {projectCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="completed_on">
                Completed on
              </label>
              <input
                id="completed_on"
                name="completed_on"
                type="date"
                className="input"
                value={form.completed_on}
                onChange={onChange}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="location">
              Location / client type
            </label>
            <input id="location" name="location" className="input" value={form.location} onChange={onChange} />
          </div>
          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="input"
              value={form.description}
              onChange={onChange}
            />
          </div>
          <div>
            <span className="label">Image</span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 transition hover:border-brand-400">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <ImagePlus className="size-8 text-slate-400" />
                  JPG, PNG, WEBP or AVIF — max 8 MB
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn btn-primary mt-6 w-full" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} {saving ? 'Uploading…' : 'Save project'}
        </button>
      </form>

      <div className="lg:col-span-7">
        <h2 className="text-xl">Published projects ({projects.length})</h2>
        {loading ? (
          <Loader2 className="mt-6 size-6 animate-spin text-brand-500" />
        ) : projects.length === 0 ? (
          <p className="card mt-4 p-8 text-center text-sm">
            No projects yet. Until you add one, the website shows sample placeholder projects.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {projects.map((p) => (
              <li key={p.id} className="card flex items-center gap-4 p-3">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-navy-900">
                  {p.image_url && <img src={p.image_url} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-900">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    {p.category}
                    {p.location ? ` • ${p.location}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => remove(p)}
                  className="grid size-10 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MessagesAdmin({ token }: { token: string }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .messages(token)
      .then(setMessages)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load messages.'))
      .finally(() => setLoading(false));
  }, [token]);

  const remove = async (m: ContactMessage) => {
    if (!window.confirm(`Delete message from ${m.name}?`)) return;
    try {
      await api.admin.deleteMessage(token, m.id);
      setMessages((list) => list.filter((x) => x.id !== m.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  if (loading) return <Loader2 className="size-6 animate-spin text-brand-500" />;

  return (
    <div>
      <h2 className="text-xl">Contact messages ({messages.length})</h2>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {messages.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-sm">No messages yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-900">{m.name}</p>
                  <p className="mt-0.5 text-sm">
                    <a href={`mailto:${m.email}`} className="text-brand-600 hover:underline">
                      {m.email}
                    </a>
                    {m.phone && (
                      <>
                        {' • '}
                        <a href={`tel:${m.phone}`} className="hover:underline">
                          {m.phone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {m.service && (
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {m.service}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</span>
                  <button
                    onClick={() => remove(m)}
                    className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete message"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-navy-800">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FolderKanban,
  Images,
  GalleryHorizontalEnd,
  Inbox,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  X,
  ExternalLink,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { api, ApiError } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Dashboard from '@/components/admin/Dashboard';
import Messages from '@/components/admin/Messages';
import Banners from '@/components/admin/Banners';
import Projects from '@/components/admin/Projects';
import Media from '@/components/admin/Media';
import Settings from '@/components/admin/Settings';
import { errorMessage } from '@/components/admin/shared';
import type { AdminTab } from '@/components/admin/tabs';

const TOKEN_KEY = 'alsafran-admin-session';

const storage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? '';
    } catch {
      return '';
    }
  },
  set: (v: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, v);
    } catch {
      /* storage blocked — session lasts until the tab closes */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export default function Admin() {
  useDocumentTitle('Admin');
  const [token, setToken] = useState(storage.get);
  const [username, setUsername] = useState<string | null>(null);
  const [fixed, setFixed] = useState(true);
  const [checking, setChecking] = useState(Boolean(token));

  // Validate the session (on load and after logging in)
  useEffect(() => {
    if (!token) return;
    api.admin
      .me(token)
      .then((me) => {
        setUsername(me.username);
        setFixed(me.fixed);
      })
      .catch(() => {
        storage.clear();
        setToken('');
      })
      .finally(() => setChecking(false));
  }, [token]);

  const logout = useCallback(() => {
    storage.clear();
    setToken('');
    setUsername(null);
  }, []);

  const login = (t: string, user: string) => {
    storage.set(t);
    setToken(t);
    setUsername(user);
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-brand-500" />
      </div>
    );
  }
  if (!token || !username) return <Login onLogin={login} />;
  return <Panel token={token} username={username} fixedLogin={fixed} onLogout={logout} />;
}

/* ---------------- Login ---------------- */

function Login({ onLogin }: { onLogin: (token: string, username: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.admin.login(username.trim(), password);
      onLogin(res.token, res.username);
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 0 ? err.message : 'Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <span className="rounded-full bg-white/95 px-5 py-3 shadow-lg">
            <Logo />
          </span>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-8 shadow-2xl">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <LockKeyhole className="size-6" />
          </span>
          <h1 className="mt-4 text-3xl">Admin login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage messages, projects, images and videos.</p>

          <label htmlFor="username" className="label mt-6">Username</label>
          <input
            id="username"
            className="input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />

          <label htmlFor="password" className="label mt-4">Password</label>
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              className="input pr-12"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-navy-900"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button className="btn btn-primary mt-6 w-full" disabled={busy || !username || !password}>
            {busy && <Loader2 className="size-4 animate-spin" />} Log in
          </button>
          <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Panel ---------------- */

const NAV: { tab: AdminTab; label: string; icon: typeof Inbox }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'messages', label: 'Messages', icon: Inbox },
  { tab: 'banners', label: 'Home banners', icon: GalleryHorizontalEnd },
  { tab: 'projects', label: 'Projects', icon: FolderKanban },
  { tab: 'media', label: 'Media library', icon: Images },
  { tab: 'settings', label: 'Settings', icon: SettingsIcon },
];

function Panel({
  token,
  username,
  fixedLogin,
  onLogout,
}: {
  token: string;
  username: string;
  fixedLogin: boolean;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Expired/invalid session → back to login; otherwise turn the error into a message
  const onError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onLogout();
      return errorMessage(err);
    },
    [onLogout]
  );

  const refreshCounts = useCallback(() => {
    api.admin
      .stats(token)
      .then((s) => setUnread(s.unread))
      .catch(() => {});
  }, [token]);

  useEffect(refreshCounts, [refreshCounts]);

  // Is the server connected to the database (Neon) and file storage (R2)?
  const [health, setHealth] = useState<{ database: boolean; storage: boolean } | null>(null);
  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch(() => setHealth({ database: false, storage: false }));
  }, []);

  const go = (t: AdminTab) => {
    setTab(t);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const props = { token, onError };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo />
        <button onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-navy-900" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </header>

      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-navy-950/50 transition-opacity lg:hidden ${menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-950 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Logo variant="light" />
          <button onClick={() => setMenuOpen(false)} className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <p className="px-6 font-display text-xs font-bold tracking-[0.25em] text-ice-300 uppercase">Admin panel</p>

        <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Admin">
          {NAV.map(({ tab: t, label, icon: Icon }) => (
            <button
              key={t}
              onClick={() => go(t)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-ice-400 ${
                tab === t ? 'bg-white text-navy-900 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              aria-current={tab === t ? 'page' : undefined}
            >
              <Icon className="size-5" />
              <span className="flex-1">{label}</span>
              {t === 'messages' && unread > 0 && (
                <span className="rounded-full bg-ice-400 px-2 py-0.5 text-xs font-bold text-navy-950">{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
            <ExternalLink className="size-5" /> View website
          </a>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
            <LogOut className="size-5" /> Log out
          </button>
          <p className="px-4 pt-2 text-xs text-white/50">Signed in as {username}</p>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        {health && (!health.database || !health.storage) && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-display text-lg font-bold">Setup needed</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {!health.database && (
                <li>
                  <b>Database not connected</b> — Messages, Projects and Media need it. Put your Neon connection string in{' '}
                  <code className="rounded bg-white px-1">DATABASE_URL</code> in <code className="rounded bg-white px-1">server/.env</code>, run{' '}
                  <code className="rounded bg-white px-1">npm run db:init</code>, then restart <code className="rounded bg-white px-1">npm run dev</code>.
                </li>
              )}
              {!health.storage && (
                <li>
                  <b>File storage not connected</b> — uploading images and videos needs Cloudflare R2. Fill in the{' '}
                  <code className="rounded bg-white px-1">R2_…</code> values in <code className="rounded bg-white px-1">server/.env</code> and restart.
                </li>
              )}
            </ul>
          </div>
        )}
        {tab === 'dashboard' && <Dashboard {...props} username={username} go={go} />}
        {tab === 'messages' && <Messages {...props} onChanged={refreshCounts} />}
        {tab === 'banners' && <Banners {...props} />}
        {tab === 'projects' && <Projects {...props} onChanged={refreshCounts} />}
        {tab === 'media' && <Media {...props} onChanged={refreshCounts} />}
        {tab === 'settings' && <Settings {...props} username={username} fixedLogin={fixedLogin} />}
      </main>
    </div>
  );
}

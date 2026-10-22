import { useState, type FormEvent } from 'react';
import { KeyRound, Loader2, UserRound } from 'lucide-react';
import { api } from '@/lib/api';
import { Alert, PageTitle, type SectionProps } from './shared';

export default function Settings({ token, onError, username, fixedLogin }: SectionProps & { username: string; fixedLogin: boolean }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (next.length < 8) return setError('New password must be at least 8 characters.');
    if (next !== confirm) return setError("The new passwords don't match.");
    setSaving(true);
    try {
      await api.admin.changePassword(token, current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setSuccess('Password changed. Use the new password next time you log in.');
    } catch (err) {
      setError(onError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle title="Settings" subtitle="Manage your admin account." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card h-fit p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <UserRound className="size-5 text-brand-500" /> Account
          </h2>
          <dl className="mt-4 text-sm">
            <dt className="text-slate-500">Username</dt>
            <dd className="mt-1 font-semibold text-navy-900">{username}</dd>
          </dl>
          <p className="mt-4 text-sm text-slate-500">You stay logged in on this device for 7 days, or until you log out.</p>
        </div>

        {fixedLogin ? (
          <div className="card h-fit p-6">
            <h2 className="flex items-center gap-2 text-xl">
              <KeyRound className="size-5 text-brand-500" /> Password
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              The admin login is fixed in the server settings. To change the username or password, edit{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_USERNAME</code> and{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code> in{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">server/.env</code> and restart the server.
            </p>
          </div>
        ) : (
        <form onSubmit={submit} className="card p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <KeyRound className="size-5 text-brand-500" /> Change password
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="current" className="label">Current password</label>
              <input id="current" type="password" autoComplete="current-password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="next" className="label">New password</label>
              <input id="next" type="password" autoComplete="new-password" minLength={8} className="input" value={next} onChange={(e) => setNext(e.target.value)} required />
              <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm" className="label">Confirm new password</label>
              <input id="confirm" type="password" autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {error && <Alert>{error}</Alert>}
            {success && <Alert tone="success">{success}</Alert>}
          </div>
          <button className="btn btn-primary mt-6 w-full" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Update password
          </button>
        </form>
        )}
      </div>
    </>
  );
}

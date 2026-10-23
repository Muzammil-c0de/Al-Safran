import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { FolderKanban, ImagePlus, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { projectCategories } from '@/data/site';
import type { Project } from '@/types';
import { Alert, EmptyState, PageTitle, Spinner, type SectionProps } from './shared';

const emptyForm = { title: '', category: projectCategories[0] as string, location: '', completed_on: '', description: '' };

export default function Projects({ token, onError, onChanged }: SectionProps & { onChanged: () => void }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setProjects(await api.getProjects());
    } catch (err) {
      setError(onError(err));
    }
  }, [onError]);

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
    setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await api.admin.createProject(token, fd);
      setForm(emptyForm);
      setFile(null);
      setSuccess('Project published.');
      await load();
      onChanged();
    } catch (err) {
      setError(onError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Project) => {
    if (!window.confirm(`Delete "${p.title}"? This also removes its image.`)) return;
    try {
      await api.admin.deleteProject(token, p.id);
      setProjects((list) => list?.filter((x) => x.id !== p.id) ?? null);
      onChanged();
    } catch (err) {
      setError(onError(err));
    }
  };

  return (
    <>
      <PageTitle title="Projects" subtitle="Projects shown on the website's Projects page." />

      <div className="grid gap-8 xl:grid-cols-12">
        <form onSubmit={submit} className="card h-fit p-6 xl:col-span-5">
          <h2 className="flex items-center gap-2 text-xl">
            <Plus className="size-5 text-brand-500" /> Add project
          </h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="title">Title *</label>
              <input id="title" name="title" className="input" value={form.title} onChange={onChange} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="category">Category *</label>
                <select id="category" name="category" className="input" value={form.category} onChange={onChange}>
                  {projectCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="completed_on">Completed on</label>
                <input id="completed_on" name="completed_on" type="date" className="input" value={form.completed_on} onChange={onChange} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="location">Location / client type</label>
              <input id="location" name="location" className="input" value={form.location} onChange={onChange} />
            </div>
            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={4} className="input" value={form.description} onChange={onChange} />
            </div>
            <div>
              <span className="label">Photo</span>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 transition hover:border-brand-400">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <ImagePlus className="size-8 text-slate-400" />
                    JPG, PNG, WEBP or AVIF — up to 10 MB
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {error && <Alert>{error}</Alert>}
            {success && <Alert tone="success">{success}</Alert>}
          </div>
          <button className="btn btn-primary mt-6 w-full" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} {saving ? 'Saving…' : 'Publish project'}
          </button>
        </form>

        <div className="xl:col-span-7">
          <h2 className="text-xl">Published ({projects?.length ?? 0})</h2>
          {!projects ? (
            error ? null : <Spinner className="mt-6" />
          ) : projects.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<FolderKanban className="size-7" />}
                title="No projects yet"
                text="Projects you add here appear on the website's Projects page and in Recent Projects on the home page."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {projects.map((p) => (
                <li key={p.id} className="card flex items-center gap-4 p-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-navy-900">
                    {p.image_url && <img src={p.image_url} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy-900">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.category}</p>
                    {p.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="size-3" /> {p.location}
                      </p>
                    )}
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
    </>
  );
}

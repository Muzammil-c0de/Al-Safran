import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Check, Copy, Image as ImageIcon, ImagePlus, Play, Trash2, UploadCloud, Video } from 'lucide-react';
import { api } from '@/lib/api';
import type { MediaItem } from '@/types';
import { Alert, EmptyState, PageTitle, Spinner, formatBytes, formatDate, type SectionProps } from './shared';

type Filter = 'all' | 'image' | 'video';

interface UploadJob {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime';
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;

/** "site-visit_photo-02.jpg" → "Site visit photo 02" */
const titleFromName = (name: string) => {
  const base = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export default function Media({ token, onError, onChanged }: SectionProps & { onChanged: () => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.admin
      .media(token)
      .then(setItems)
      .catch((err) => setError(onError(err)));
  }, [token, onError]);

  const shown = useMemo(() => (items ?? []).filter((m) => filter === 'all' || m.kind === filter), [items, filter]);
  const counts = {
    all: items?.length ?? 0,
    image: items?.filter((m) => m.kind === 'image').length ?? 0,
    video: items?.filter((m) => m.kind === 'video').length ?? 0,
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setError('');
    for (const file of Array.from(files)) {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      const isVideo = file.type.startsWith('video/');
      const tooBig = file.size > (isVideo ? MAX_VIDEO : MAX_IMAGE);
      if (!ACCEPT.split(',').includes(file.type)) {
        setJobs((j) => [...j, { id, name: file.name, progress: 0, error: 'File type not allowed' }]);
        continue;
      }
      if (tooBig) {
        setJobs((j) => [...j, { id, name: file.name, progress: 0, error: isVideo ? 'Videos must be under 100 MB' : 'Images must be under 10 MB' }]);
        continue;
      }

      setJobs((j) => [...j, { id, name: file.name, progress: 0 }]);
      const fd = new FormData();
      fd.append('title', titleFromName(file.name));
      fd.append('file', file);
      try {
        const item = await api.admin.uploadMedia(token, fd, (p) =>
          setJobs((j) => j.map((x) => (x.id === id ? { ...x, progress: p } : x)))
        );
        setItems((list) => [item, ...(list ?? [])]);
        setJobs((j) => j.filter((x) => x.id !== id));
        onChanged();
      } catch (err) {
        const msg = onError(err);
        setJobs((j) => j.map((x) => (x.id === id ? { ...x, error: msg } : x)));
      }
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
  };

  const rename = async (m: MediaItem, title: string) => {
    if ((m.title ?? '') === title.trim()) return;
    try {
      const updated = await api.admin.renameMedia(token, m.id, title);
      setItems((list) => list?.map((x) => (x.id === m.id ? updated : x)) ?? null);
    } catch (err) {
      setError(onError(err));
    }
  };

  const remove = async (m: MediaItem) => {
    if (!window.confirm(`Delete "${m.title || 'this file'}"? It will be removed from the website.`)) return;
    try {
      await api.admin.deleteMedia(token, m.id);
      setItems((list) => list?.filter((x) => x.id !== m.id) ?? null);
      onChanged();
    } catch (err) {
      setError(onError(err));
    }
  };

  const copyUrl = async (m: MediaItem) => {
    try {
      await navigator.clipboard.writeText(m.url);
      setCopied(m.id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <>
      <PageTitle title="Media library" subtitle="Images and videos shown in the gallery on the website's Projects page." />

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'
        }`}
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <UploadCloud className="size-7" />
        </span>
        <p className="mt-3 font-display text-lg font-bold text-navy-900">Drop images or videos here, or click to choose</p>
        <p className="mt-1 text-sm text-slate-500">Images: JPG, PNG, WEBP, AVIF up to 10 MB · Videos: MP4, WEBM, MOV up to 100 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Upload progress */}
      {jobs.length > 0 && (
        <ul className="mt-4 space-y-2">
          {jobs.map((j) => (
            <li key={j.id} className="card flex items-center gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium text-navy-900">{j.name}</span>
              {j.error ? (
                <>
                  <span className="text-red-600">{j.error}</span>
                  <button onClick={() => setJobs((all) => all.filter((x) => x.id !== j.id))} className="text-xs font-semibold text-slate-500 hover:text-navy-900">
                    Dismiss
                  </button>
                </>
              ) : (
                <>
                  <span className="h-2 w-32 overflow-hidden rounded-full bg-slate-100 sm:w-48">
                    <span className="block h-full rounded-full bg-brand-500 transition-all" style={{ width: `${j.progress}%` }} />
                  </span>
                  <span className="w-10 text-right text-xs text-slate-500 tabular-nums">{j.progress}%</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <div className="mt-4"><Alert>{error}</Alert></div>}

      {/* Filter */}
      <div className="mt-8 mb-5 inline-flex rounded-full border border-slate-200 bg-white p-1">
        {(
          [
            ['all', `All (${counts.all})`, null],
            ['image', `Images (${counts.image})`, ImageIcon],
            ['video', `Videos (${counts.video})`, Video],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === key ? 'bg-navy-900 text-white' : 'text-navy-800 hover:text-brand-600'
            }`}
          >
            {Icon && <Icon className="size-4" />} {label}
          </button>
        ))}
      </div>

      {!items && !error && <Spinner />}
      {items && shown.length === 0 && (
        <EmptyState icon={<ImagePlus className="size-7" />} title="Nothing here yet" text="Upload images or videos above — they'll appear in the website gallery." />
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((m) => (
          <figure key={m.id} className="card overflow-hidden">
            <div className="relative aspect-video bg-navy-950">
              {m.kind === 'image' ? (
                <img src={m.url} alt={m.title ?? ''} loading="lazy" className="size-full object-cover" />
              ) : (
                <video src={m.url} controls preload="metadata" className="size-full object-cover" />
              )}
              <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy-900 shadow">
                {m.kind === 'image' ? <ImageIcon className="size-3.5" /> : <Play className="size-3.5" />}
                {m.kind === 'image' ? 'Image' : 'Video'}
              </span>
            </div>
            <figcaption className="p-4">
              <input
                defaultValue={m.title ?? ''}
                placeholder="Add a title"
                onBlur={(e) => rename(m, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                className="w-full rounded-lg border border-transparent px-2 py-1 font-semibold text-navy-900 transition outline-none hover:border-slate-200 focus:border-brand-500"
                aria-label="Title"
              />
              <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate-500">
                <span>
                  {formatDate(m.created_at)}
                  {m.size_bytes ? ` · ${formatBytes(m.size_bytes)}` : ''}
                </span>
                <span className="flex gap-1">
                  <button
                    onClick={() => copyUrl(m)}
                    className="grid size-8 place-items-center rounded-lg transition hover:bg-slate-100 hover:text-brand-600"
                    title="Copy link"
                    aria-label="Copy link"
                  >
                    {copied === m.id ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    className="grid size-8 place-items-center rounded-lg transition hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

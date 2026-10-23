import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, GalleryHorizontalEnd, ImagePlus, Loader2, Monitor, Pencil, Plus, Smartphone, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Banner } from '@/types';
import { Alert, EmptyState, PageTitle, Spinner, type SectionProps } from './shared';

/** Recommended sizes shown to the admin */
const SIZES = {
  desktop: { w: 1920, h: 768, ratio: 1920 / 768, label: '1920 × 768 px', shape: '5:2 wide (landscape)' },
  mobile: { w: 1080, h: 1920, ratio: 1080 / 1920, label: '1080 × 1920 px', shape: '9:16 tall (portrait)' },
} as const;

type Kind = keyof typeof SIZES;

interface Picked {
  file: File;
  preview: string;
  width: number;
  height: number;
}

const emptyForm = { eyebrow: '', title: '', subtitle: '', button_label: '', button_link: '', is_active: true };

/** Ready-made banner text based on Al Safran's services — click to fill the form. */
const SUGGESTIONS = [
  {
    eyebrow: 'Be Cool with Al Safran',
    title: 'Cooling systems built to *perform*, maintained to *last*',
    subtitle: 'Air-conditioning contracting, installation and maintenance across the U.A.E. since 1985.',
    button_label: 'Explore Services',
    button_link: '/services',
  },
  {
    eyebrow: 'Ducting Specialists',
    title: 'Precision *GI & PI ductwork* for cleaner, healthier air',
    subtitle: 'Duct design, fabrication and installation — sized to your A/C capacity and finished neatly on site.',
    button_label: 'Ducting Services',
    button_link: '/services#gi-pi-duct',
  },
  {
    eyebrow: 'Chilled Water Experts',
    title: 'Chilled water *FCU & AHU* systems, installed right',
    subtitle: 'Supply, installation, commissioning and maintenance of fan coil units and air handling units.',
    button_label: 'FCU & AHU Works',
    button_link: '/services#chilled-water-fcu-ahu',
  },
  {
    eyebrow: 'Healthier Indoor Air',
    title: 'Professional *duct & diffuser cleaning*',
    subtitle: 'Remove dust and build-up from your ductwork to restore airflow and keep indoor air fresh.',
    button_label: 'Duct Cleaning',
    button_link: '/services#duct-cleaning',
  },
  {
    eyebrow: 'Since 1985',
    title: 'One team for your *AC, electrical & plumbing* works',
    subtitle: 'Complete MEP works for new homes and offices — with reliable after-sales service year-round.',
    button_label: 'Get in Touch',
    button_link: '/contact',
  },
];

/** Reads an image file's pixel size for the shape check. */
function readImage(file: File): Promise<Picked> {
  return new Promise((resolve, reject) => {
    const preview = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ file, preview, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not read this image.'));
    img.src = preview;
  });
}

/** Warns when the picked image's shape is far from the recommended one. */
function shapeWarning(kind: Kind, p: Picked) {
  const s = SIZES[kind];
  const ratio = p.width / p.height;
  const off = Math.abs(ratio - s.ratio) / s.ratio;
  if (off > 0.12) {
    return `This image is ${p.width} × ${p.height} px — a different shape from ${s.shape}. It will be cropped to fit; for best results use ${s.label}.`;
  }
  if (p.width < s.w * 0.6) {
    return `This image is only ${p.width} px wide, so it may look blurry. Recommended: ${s.label}.`;
  }
  return '';
}

export default function Banners({ token, onError }: SectionProps) {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [desktop, setDesktop] = useState<Picked | null>(null);
  const [mobile, setMobile] = useState<Picked | null>(null);
  const [removeMobile, setRemoveMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    try {
      setBanners(await api.admin.banners(token));
    } catch (err) {
      setError(onError(err));
    }
  }, [token, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setDesktop(null);
    setMobile(null);
    setRemoveMobile(false);
    setEditing(null);
    setProgress(0);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
    setSuccess('');
    setError('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const openEdit = (b: Banner) => {
    resetForm();
    setEditing(b);
    setForm({
      eyebrow: b.eyebrow ?? '',
      title: b.title,
      subtitle: b.subtitle ?? '',
      button_label: b.button_label ?? '',
      button_link: b.button_link ?? '',
      is_active: b.is_active !== false,
    });
    setShowForm(true);
    setSuccess('');
    setError('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const pick = async (kind: Kind, file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setError('Banner images must be under 10 MB.');
    try {
      const p = await readImage(file);
      if (kind === 'desktop') setDesktop(p);
      else {
        setMobile(p);
        setRemoveMobile(false);
      }
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim()) return setError('Add a heading for the banner.');
    if (!editing && !desktop) return setError('Choose the desktop banner image.');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (desktop) fd.append('desktop', desktop.file);
    if (mobile) fd.append('mobile', mobile.file);
    if (editing && removeMobile) fd.append('remove_mobile', 'true');

    setSaving(true);
    try {
      if (editing) await api.admin.updateBanner(token, editing.id, fd, setProgress);
      else await api.admin.createBanner(token, fd, setProgress);
      setSuccess(editing ? 'Banner updated.' : 'Banner added — it now shows in the home page slider.');
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(onError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    const fd = new FormData();
    fd.append('is_active', String(b.is_active === false));
    try {
      await api.admin.updateBanner(token, b.id, fd);
      await load();
    } catch (err) {
      setError(onError(err));
    }
  };

  const move = async (b: Banner, direction: 'up' | 'down') => {
    try {
      setBanners(await api.admin.moveBanner(token, b.id, direction));
    } catch (err) {
      setError(onError(err));
    }
  };

  const remove = async (b: Banner) => {
    if (!window.confirm(`Delete the banner "${b.title.replace(/\*/g, '')}"? Its images are removed too.`)) return;
    try {
      await api.admin.deleteBanner(token, b.id);
      setBanners((list) => list?.filter((x) => x.id !== b.id) ?? null);
      if (editing?.id === b.id) {
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      setError(onError(err));
    }
  };

  const set = (k: keyof typeof emptyForm) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageTitle
        title="Home banners"
        subtitle="The slides at the top of the home page. Each banner has a desktop image and an optional phone image."
        action={
          !showForm && (
            <button onClick={openNew} className="btn btn-primary">
              <Plus className="size-4" /> Add banner
            </button>
          )
        }
      />

      <div className="mb-6 space-y-2">
        {error && <Alert>{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}
      </div>

      {/* ---------- Add / edit form ---------- */}
      {showForm && (
        <form ref={formRef} onSubmit={submit} className="card mb-10 scroll-mt-6 p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl">{editing ? 'Edit banner' : 'New banner'}</h2>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-900"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Images */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <ImagePicker
              kind="desktop"
              picked={desktop}
              current={editing?.desktop_url ?? null}
              required={!editing}
              onPick={(f) => pick('desktop', f)}
            />
            <ImagePicker
              kind="mobile"
              picked={mobile}
              current={removeMobile ? null : editing?.mobile_url ?? null}
              onPick={(f) => pick('mobile', f)}
              onRemove={
                mobile || (editing?.mobile_url && !removeMobile)
                  ? () => {
                      setMobile(null);
                      if (editing?.mobile_url) setRemoveMobile(true);
                    }
                  : undefined
              }
            />
          </div>

          {/* Text */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="b-title">Heading *</label>
              <input id="b-title" className="input" value={form.title} onChange={set('title')} maxLength={160} required />
              <p className="mt-1 text-xs text-slate-500">
                Put <b>*stars*</b> around words to highlight them in blue — e.g. <code>Cooling systems built to *perform*</code>
              </p>

              {/* Suggestions */}
              <div className="mt-3">
                <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Suggestions — click to use</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => {
                    const selected = form.title === s.title;
                    return (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, ...s }))}
                        title={`${s.eyebrow} — ${s.subtitle}`}
                        className={`rounded-full border px-3.5 py-1.5 text-left text-sm transition ${
                          selected
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-slate-200 bg-white text-navy-800 hover:border-brand-400 hover:bg-brand-50'
                        }`}
                      >
                        {s.title.split(/(\*[^*]+\*)/g).map((part, i) =>
                          part.startsWith('*') ? (
                            <b key={i} className={selected ? 'text-white' : 'text-brand-600'}>
                              {part.slice(1, -1)}
                            </b>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">Fills in the heading, tag, description and button — edit anything afterwards.</p>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="b-eyebrow">Small tag (optional)</label>
              <input id="b-eyebrow" className="input" value={form.eyebrow} onChange={set('eyebrow')} maxLength={80} placeholder="Be Cool with Al Safran" />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy-900">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="size-4 accent-brand-500"
                />
                Show this banner on the website
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="b-subtitle">Description (optional)</label>
              <textarea id="b-subtitle" rows={2} className="input" value={form.subtitle} onChange={set('subtitle')} maxLength={300} />
            </div>
            <div>
              <label className="label" htmlFor="b-btn">Button text (optional)</label>
              <input id="b-btn" className="input" value={form.button_label} onChange={set('button_label')} maxLength={40} placeholder="Explore Services" />
            </div>
            <div>
              <label className="label" htmlFor="b-link">Button link (optional)</label>
              <input id="b-link" className="input" value={form.button_link} onChange={set('button_link')} maxLength={300} placeholder="/services" />
              <p className="mt-1 text-xs text-slate-500">A page on the site (e.g. /services, /contact) or a full https:// link.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? `Uploading… ${progress}%` : editing ? 'Save changes' : 'Add banner'}
            </button>
            {saving && (
              <span className="h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
              </span>
            )}
          </div>
        </form>
      )}

      {/* ---------- Banner list ---------- */}
      {!banners && !error && <Spinner />}
      {banners && banners.length === 0 && !showForm && (
        <EmptyState
          icon={<GalleryHorizontalEnd className="size-7" />}
          title="No banners yet"
          text="Add your first banner — it will appear in the slider at the top of the home page."
        />
      )}

      {banners && banners.length > 0 && (
        <ul className="space-y-4">
          {banners.map((b, i) => (
            <li key={b.id} className={`card flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${b.is_active === false ? 'opacity-60' : ''}`}>
              <div className="flex shrink-0 gap-2">
                <img src={b.desktop_url} alt="" className="aspect-[5/2] w-48 rounded-lg bg-slate-100 object-cover" />
                {b.mobile_url ? (
                  <img src={b.mobile_url} alt="" className="aspect-[9/16] w-11 rounded-md bg-slate-100 object-cover" />
                ) : (
                  <span className="grid aspect-[9/16] w-11 place-items-center rounded-md border border-dashed border-slate-300 text-slate-300" title="No phone image">
                    <Smartphone className="size-4" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Slide {i + 1} {b.is_active === false && '· Hidden'}
                </p>
                <p className="truncate font-display text-lg font-bold text-navy-900">{b.title.replace(/\*/g, '')}</p>
                {b.eyebrow && <p className="truncate text-sm text-slate-500">{b.eyebrow}</p>}
              </div>
              <div className="flex flex-wrap gap-1">
                <IconBtn label="Move up" onClick={() => move(b, 'up')} disabled={i === 0}>
                  <ArrowUp className="size-4" />
                </IconBtn>
                <IconBtn label="Move down" onClick={() => move(b, 'down')} disabled={i === banners.length - 1}>
                  <ArrowDown className="size-4" />
                </IconBtn>
                <IconBtn label={b.is_active === false ? 'Show on website' : 'Hide from website'} onClick={() => toggleActive(b)}>
                  {b.is_active === false ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </IconBtn>
                <IconBtn label="Edit" onClick={() => openEdit(b)}>
                  <Pencil className="size-4" />
                </IconBtn>
                <IconBtn label="Delete" onClick={() => remove(b)} danger>
                  <Trash2 className="size-4" />
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid size-9 place-items-center rounded-lg text-slate-500 transition disabled:opacity-30 ${
        danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-slate-100 hover:text-brand-600'
      }`}
    >
      {children}
    </button>
  );
}

/** Upload box shaped like the banner (5:2 or 9:16), with the recommended size and a shape check. */
function ImagePicker({
  kind,
  picked,
  current,
  required,
  onPick,
  onRemove,
}: {
  kind: Kind;
  picked: Picked | null;
  current: string | null;
  required?: boolean;
  onPick: (f: File | undefined) => void;
  onRemove?: () => void;
}) {
  const s = SIZES[kind];
  const Icon = kind === 'desktop' ? Monitor : Smartphone;
  const shown = picked?.preview ?? current;
  const warning = picked ? shapeWarning(kind, picked) : '';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="label mb-0 flex items-center gap-2">
          <Icon className="size-4 text-brand-500" /> {kind === 'desktop' ? 'Desktop image' : 'Phone image'} {required && '*'}
        </span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs font-semibold text-red-600 hover:underline">
            Remove
          </button>
        )}
      </div>

      {/* Recommended size */}
      <p className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
        Recommended size: <b>{s.label}</b> — {s.shape}. JPG, PNG or WEBP, up to 10 MB.
        {kind === 'mobile' && ' Optional: without it, phones show the desktop image cropped.'}
      </p>

      <label
        className={`relative mx-auto flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 transition hover:border-brand-400 ${
          kind === 'desktop' ? 'aspect-[5/2] w-full' : 'aspect-[9/16] w-full max-w-[220px]'
        }`}
      >
        {shown ? (
          <img src={shown} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 p-4">
            <ImagePlus className="size-8 text-slate-400" />
            Click to choose
            <span className="text-xs text-slate-400">{s.label}</span>
          </span>
        )}
        {shown && (
          <span className="absolute right-2 bottom-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy-900 shadow">Change</span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
      </label>

      {picked && (
        <p className={`mt-2 text-xs ${warning ? 'text-amber-700' : 'text-green-700'}`}>
          {warning || `✓ ${picked.width} × ${picked.height} px — good size.`}
        </p>
      )}
    </div>
  );
}

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send, Smartphone } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { api, ApiError } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { ContactPayload } from '@/types';

type Errors = Partial<Record<keyof ContactPayload, string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: ContactPayload): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.message.trim().length < 10) e.message = 'Please tell us a little more (at least 10 characters).';
  return e;
}

export default function Contact() {
  useDocumentTitle('Contact');
  const [params] = useSearchParams();
  const preselected = params.get('service') ?? '';

  const [values, setValues] = useState<ContactPayload>({
    name: '',
    email: '',
    phone: '',
    service: services.some((s) => s.title === preselected) ? preselected : '',
    message: '',
    company_website: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name as keyof ContactPayload]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus('sending');
    setServerError('');
    try {
      await api.sendContact(values);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors as Errors);
      setServerError(
        err instanceof ApiError && err.status < 500 && err.status !== 503
          ? err.message
          : `We couldn't send your message right now. Please call us on ${site.call.label} or email ${site.email}.`
      );
    }
  };

  const contactItems: { icon: typeof Phone; label: string; value: string; href?: string }[] = [
    // Mobile numbers (055-890 8664 at the top)
    ...site.mobiles.map((m) => ({ icon: Smartphone, label: 'Mobile', value: m.label, href: m.href })),
    { icon: Mail, label: 'Email us', value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: 'Address', value: site.address },
    { icon: Clock, label: 'Service', value: site.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk About Your Project"
        subtitle="Request a quotation, book a site inspection or ask about maintenance — we usually reply within one working day."
        image="/contact banner.webp"
        textPosition="bottom-left"
      />

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          {/* Info */}
          <aside className="space-y-4 lg:col-span-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </span>
                    <span className="mt-1 block font-semibold break-words text-navy-900">{item.value}</span>
                  </span>
                </>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="group card flex items-center gap-4 p-5 transition hover:border-brand-300">
                  {content}
                </a>
              ) : (
                <div key={item.label} className="group card flex items-center gap-4 p-5">
                  {content}
                </div>
              );
            })}

            <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-white">
              <div className="absolute inset-0 bg-grid" />
              <div className="relative">
                <h3 className="text-lg text-white">Free site inspection</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">
                  Not sure what you need? We'll visit, assess the job and recommend the right solution — at no cost.
                </p>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="card p-6 sm:p-10">
              {status === 'sent' ? (
                <div className="py-12 text-center">
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-green-50 text-green-600">
                    <CheckCircle2 className="size-10" />
                  </span>
                  <h2 className="mt-6 text-2xl">Thank you, {values.name.split(' ')[0]}!</h2>
                  <p className="mx-auto mt-3 max-w-md">
                    Your message has been received. Our team will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline mt-8"
                    onClick={() => {
                      setValues({ name: '', email: '', phone: '', service: '', message: '', company_website: '' });
                      setStatus('idle');
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <h2 className="text-2xl sm:text-3xl">Send us a message</h2>
                  <p className="mt-2">Fill in the form and we'll contact you with a quotation.</p>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" name="name" error={errors.name} required>
                      <input
                        id="name"
                        name="name"
                        className="input"
                        value={values.name}
                        onChange={onChange}
                        autoComplete="name"
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Email address" name="email" error={errors.email} required>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="input"
                        value={values.email}
                        onChange={onChange}
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field label="Phone number" name="phone">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="input"
                        value={values.phone}
                        onChange={onChange}
                        autoComplete="tel"
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Service needed" name="service">
                      <select id="service" name="service" className="input" value={values.service} onChange={onChange}>
                        <option value="">Select a service</option>
                        {services.map((s) => (
                          <option key={s.slug} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Other">Other / Not sure</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Project details" name="message" error={errors.message} required>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          className="input resize-y"
                          value={values.message}
                          onChange={onChange}
                          placeholder="Tell us about your project — location, size, timeline…"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Honeypot (hidden from users) */}
                  <input
                    type="text"
                    name="company_website"
                    value={values.company_website}
                    onChange={onChange}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {serverError && (
                    <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                      {serverError}
                    </p>
                  )}

                  <button type="submit" className="btn btn-primary mt-8 w-full sm:w-auto" disabled={status === 'sending'}>
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Send Message <Send className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {site.mapEmbedUrl && (
          <div className="container-x mt-12">
            <iframe
              title={`${site.name} location`}
              src={site.mapEmbedUrl}
              className="h-96 w-full rounded-2xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </section>
    </>
  );
}

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-brand-600">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

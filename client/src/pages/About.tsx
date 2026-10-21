import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, HeartHandshake, ShieldCheck, Target, Users, Wrench } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import CtaBanner from '@/components/CtaBanner';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const pillars = [
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To deliver dependable HVAC and MEP installations and maintenance that keep homes and workplaces comfortable, safe and efficient.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    text: 'To be the first-choice technical services partner for clients who value quality workmanship and honest service.',
  },
  {
    icon: HeartHandshake,
    title: 'Our Promise',
    text: 'Clear communication, fair pricing and a job finished properly — backed by responsive after-sales support.',
  },
];

const values = [
  { icon: ShieldCheck, title: 'Safety', text: 'Safe work practices on every site, for our team and yours.' },
  { icon: Wrench, title: 'Workmanship', text: 'Neat, durable installations using proper materials.' },
  { icon: Users, title: 'Teamwork', text: 'Coordinated trades working as one accountable team.' },
  { icon: HeartHandshake, title: 'Integrity', text: 'Honest advice and transparent quotations.' },
];

export default function About() {
  useDocumentTitle('About Us');

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Building comfort, one project at a time"
        subtitle={`${site.name} is a technical services company specialising in HVAC, ducting, electrical, AC and plumbing works for residential and commercial projects.`}
      />

      {/* Story */}
      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-brand-100" />
              <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-8 sm:p-10">
                <div className="absolute inset-0 bg-grid" />
                <div className="absolute -top-20 -right-20 size-72 rounded-full bg-brand-500/25 blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  {site.stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                      <p className="text-3xl font-extrabold text-white sm:text-4xl">{s.value}</p>
                      <p className="mt-1 text-sm text-navy-200">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="relative mt-6 rounded-2xl bg-brand-500 p-5 text-sm font-medium text-white">
                  “Our goal is simple: install it right, maintain it well, and be there when our clients need us.”
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title="Your trusted partner for building services"
            />
            <div className="mt-6 space-y-4 text-lg leading-relaxed">
              <p>
                At {site.name}, we bring together experienced HVAC technicians, duct fabricators, electricians and
                plumbers under one roof. That means one point of contact, better coordination on site and fewer delays
                for you.
              </p>
              <p>
                Whether it's a new villa, an office fit-out or the ongoing maintenance of chilled water systems, we
                approach every job with the same attention to detail and commitment to quality.
              </p>
            </div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug} className="flex items-start gap-2.5 text-[15px] font-medium text-navy-800">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-500" /> {s.title}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision / Promise */}
      <section className="section bg-slate-50">
        <div className="container-x">
          <SectionHeading eyebrow="What Drives Us" title="Mission, vision & promise" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 100}>
                  <div className="card h-full p-8 text-center">
                    <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
                      <Icon className="size-8" />
                    </span>
                    <h3 className="mt-6 text-xl">{p.title}</h3>
                    <p className="mt-3 leading-relaxed">{p.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              align="left"
              eyebrow="Our Values"
              title="The way we work"
              subtitle="These values guide every site visit, installation and maintenance call we make."
            />
            <Link to="/contact" className="btn btn-primary mt-8">
              Work With Us <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="flex h-full gap-4 rounded-2xl border border-slate-200 p-6">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <h3 className="text-lg">{v.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

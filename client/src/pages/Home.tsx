import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  HardHat,
  Search,
  ShieldCheck,
  Timer,
  Wrench,
} from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import CountUp from '@/components/CountUp';
import ToolDecor from '@/components/ToolDecor';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import CtaBanner from '@/components/CtaBanner';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { useProjects } from '@/hooks/useProjects';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const reasons = [
  {
    icon: HardHat,
    title: 'Since 1985',
    text: 'Decades of air-conditioning and ducting experience across the U.A.E. — residential and commercial.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality materials',
    text: 'High-quality products, specially selected for each purpose, for long life and trouble-free operation.',
  },
  {
    icon: Timer,
    title: 'Completed on time',
    text: 'Small or large, we complete projects on time — which is why our clients keep coming back.',
  },
  {
    icon: BadgeCheck,
    title: 'Reliable after-sales service',
    text: 'Maintenance contracts and per-call repairs year-round from our dedicated Service department.',
  },
];

const steps = [
  { icon: Search, title: 'Site Inspection', text: 'We visit, understand your requirements and take measurements.' },
  { icon: ClipboardList, title: 'Quotation & Plan', text: 'You receive a clear scope, timeline and fixed quotation.' },
  { icon: Wrench, title: 'Execution', text: 'Our team installs with quality materials and minimal disruption.' },
  { icon: CalendarCheck, title: 'Handover & Support', text: 'Testing, commissioning, handover and ongoing maintenance.' },
];

export default function Home() {
  useDocumentTitle();
  const { projects } = useProjects();

  return (
    <>
      {/* HERO SLIDER */}
      <HeroSlider />

      {/* Stats — below the banner, centred */}
      <section className="border-b border-slate-200 bg-white">
        <dl className="container-x mx-auto grid max-w-5xl grid-cols-4 divide-x divide-slate-200 py-8 text-center md:py-12">
          {site.stats.map((s) => (
            <div key={s.label} className="px-1 sm:px-4">
              <dt className="text-2xl font-extrabold text-brand-600 tabular-nums sm:text-4xl md:text-5xl">
                <CountUp value={s.value} />
              </dt>
              <dd className="mt-1 text-[11px] leading-tight font-semibold text-navy-900 sm:text-xs md:mt-2 md:text-sm">
                <span className="md:hidden">{s.short}</span>
                <span className="hidden md:inline">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* SERVICES */}
      {/* overflow-clip (not hidden) so the sticky cards still work */}
      <section className="section relative overflow-clip bg-slate-50">
        <ToolDecor variant="a" />
        <div className="container-x relative">
          <SectionHeading
            eyebrow="Our Services"
            title="Complete technical services under one roof"
            subtitle="Seven specialist services covering the full building services package for new homes, offices and fit-outs."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Phones: stacked-card scroll — each card sticks under the navbar and the next one slides up over it */}
            {services.map((s, i) => (
              <div key={s.slug} className="max-sm:sticky" style={{ top: `calc(6rem + ${i * 12}px)` }}>
                <Reveal delay={(i % 4) * 80} className="h-full">
                  <div className="h-full rounded-2xl max-sm:shadow-[0_-8px_30px_rgba(14,21,70,0.12)]">
                    <ServiceCard service={s} index={i} />
                  </div>
                </Reveal>
              </div>
            ))}
            <div className="max-sm:sticky" style={{ top: `calc(6rem + ${services.length * 12}px)` }}>
            <Reveal delay={240} className="h-full">
              <Link
                to="/contact"
                className="group flex h-full flex-col justify-between rounded-2xl bg-navy-900 p-7 text-white transition hover:-translate-y-1 hover:bg-navy-800"
              >
                <div>
                  <h3 className="text-xl text-white">Need something else?</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-navy-200">
                    Tell us about your project and we'll put together the right team and solution.
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400">
                  Talk to us <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section relative overflow-hidden">
        <ToolDecor variant="c" />
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Why Al Safran"
              title="One of the leading air-conditioning contractors in the U.A.E."
              subtitle="Professional advice, appropriate design, quality workmanship and reliable after-sales service — delivered by skilled technicians working as one company and one team."
            />
            <Link to="/about" className="btn btn-dark mt-8">
              More About Us <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {reasons.map((r, i) => {
              const Icon = r.icon;
              return (
                <Reveal key={r.title} delay={i * 90}>
                  <div className="card h-full p-6">
                    <span className="grid size-12 place-items-center rounded-xl bg-navy-900 text-brand-400">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-5 text-lg">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{r.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section relative overflow-hidden bg-navy-900">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <ToolDecor variant="b" light />
        <div className="container-x relative">
          <SectionHeading
            light
            eyebrow="How We Work"
            title="A simple, transparent process"
            subtitle="Four clear steps from your first call to a fully working system."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 100}>
                  <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                    <span className="absolute top-6 right-6 text-sm font-bold text-navy-400">0{i + 1}</span>
                    <span className="grid size-12 place-items-center rounded-xl bg-white text-navy-900">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-lg text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-200">{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section relative overflow-hidden">
        <ToolDecor variant="a" />
        <div className="container-x relative">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Recent Projects"
              title="Work we're proud of"
              subtitle="A selection of recent installation and maintenance projects."
            />
            <Link to="/projects" className="btn btn-outline shrink-0">
              View All Projects <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

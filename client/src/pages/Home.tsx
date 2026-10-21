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
    title: 'Skilled, experienced team',
    text: 'Trained technicians for HVAC, ducting, electrical and plumbing — one team for the whole job.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & quality first',
    text: 'Work done to site standards, with proper materials, testing and a clean handover.',
  },
  {
    icon: Timer,
    title: 'On-time delivery',
    text: 'Clear schedules and daily coordination so your project finishes when promised.',
  },
  {
    icon: BadgeCheck,
    title: 'Transparent pricing',
    text: 'Detailed quotations with no hidden costs — you know exactly what you are paying for.',
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
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        {/* Banner image */}
        <img
          src="/FMU%20installation%20banner1.png"
          alt="Al Safran technicians servicing rooftop chilled water and HVAC equipment"
          className="absolute inset-0 size-full object-cover object-[70%_center]"
          fetchPriority="high"
        />
        <div className="container-x relative flex min-h-[600px] items-center pt-28 pb-14 lg:min-h-[640px]">
          <div className="max-w-[34rem]">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wide text-brand-600 shadow-sm">
              <span className="size-2 animate-pulse rounded-full bg-brand-500" />
              {site.slogan}
            </span>
            <h1
              className="mt-5 animate-fade-up text-[2.1rem] leading-[1.12] text-navy-950 sm:text-[2.6rem] lg:text-5xl"
              style={{ animationDelay: '80ms' }}
            >
              Cooling systems built to <span className="text-brand-500">perform</span>, maintained to{' '}
              <span className="text-brand-500">last</span>
            </h1>
            <p
              className="mt-5 max-w-md animate-fade-up text-base leading-relaxed font-semibold text-navy-950"
              style={{ animationDelay: '160ms' }}
            >
              Chilled water FCU/AHU, GI &amp; PI ductwork, duct cleaning, AC, electrical and plumbing works for new homes
              and offices.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
              <Link to="/contact" className="btn btn-primary">
                Get a Free Quote <ArrowRight className="size-4" />
              </Link>
              <Link to="/services" className="btn btn-outline bg-white/80">
                Explore Services
              </Link>
            </div>

            {/* Stats inside the banner */}
            <dl className="mt-10 grid animate-fade-up grid-cols-4 gap-4 sm:gap-8" style={{ animationDelay: '320ms' }}>
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-extrabold text-brand-600 sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug font-semibold text-navy-950 sm:text-sm">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section bg-slate-50">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our Services"
            title="Complete technical services under one roof"
            subtitle="Seven specialist services covering the full building services package for new homes, offices and fit-outs."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 80}>
                <ServiceCard service={s} index={i} />
              </Reveal>
            ))}
            <Reveal delay={240}>
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
      </section>

      {/* WHY US */}
      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Why Al Safran"
              title="Work done properly — the first time"
              subtitle="We combine HVAC, ducting, electrical and plumbing expertise in a single accountable team, so your project runs smoothly from inspection to handover."
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

      {/* ON-SITE MECHANICS & FIELD SERVICES SHOWCASE */}
      <section className="section bg-gradient-to-b from-slate-50 to-white">
        <div className="container-x">
          <SectionHeading
            eyebrow="On-Site Expertise"
            title="Certified mechanics & comprehensive site technical services"
            subtitle="Equipped with thermal diagnostic cameras, digital manifolds, and advanced tools, our teams handle everything from complex plant rooms to precision AC installations."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Primary Site Service Highlight */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="group relative overflow-hidden rounded-3xl border border-navy-900/10 bg-navy-900 shadow-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src="/images/site/site-team.jpg"
                      alt="Al Safran on-site MEP technical supervision and HVAC mechanics"
                      className="size-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

                    <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/20 bg-navy-900/85 px-3 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-md">
                        On-Site Technical Supervision
                      </span>
                      <span className="rounded-full border border-brand-400/30 bg-brand-500/90 px-3 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-md">
                        Active Job Site
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                      <h3 className="text-xl font-bold sm:text-2xl text-white">Full-Package MEP Site Engineering & Execution</h3>
                      <p className="mt-2 text-sm text-navy-200 line-clamp-2 sm:line-clamp-none">
                        Our senior site engineers and certified trade mechanics coordinate drawings, measurements, and physical installations together for seamless handover.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Secondary Mechanic Focus Cards */}
            <div className="space-y-4 lg:col-span-5">
              <Reveal delay={100}>
                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-navy-900">
                    <img
                      src="/images/site/site-inspection.jpg"
                      alt="AC Mechanic thermal camera site inspection"
                      className="size-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div>
                    <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-brand-700">
                      AC MECHANICS & DIAGNOSTICS
                    </span>
                    <h4 className="mt-1 text-base font-bold text-navy-900">Infrared & Thermal Airflow Checks</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Identifying thermal leaks, blocked coils, and duct air velocity before commissioning.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-navy-900">
                    <img
                      src="/images/site/ac-mechanic.jpg"
                      alt="AC Mechanic outdoor condenser servicing"
                      className="size-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div>
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-blue-700">
                      REFRIGERATION & CHILLERS
                    </span>
                    <h4 className="mt-1 text-base font-bold text-navy-900">Precision Condenser & Gas Servicing</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      R410A / R32 manifold diagnostics, vacuum evacuation, and compressor load analysis.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-navy-900">
                    <img
                      src="/images/services/fcu-ahu.jpg"
                      alt="AHU and FCU Chilled Water mechanic"
                      className="size-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div>
                    <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700">
                      CENTRAL PLANT ROOMS
                    </span>
                    <h4 className="mt-1 text-base font-bold text-navy-900">AHU & Chilled Water Commissioning</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Motor alignment, valve balancing, filter replacements, and acoustic dampening.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section">
        <div className="container-x">
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

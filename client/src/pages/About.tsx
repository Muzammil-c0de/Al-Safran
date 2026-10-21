import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  HeartHandshake,
  Home,
  PackageCheck,
  Settings,
  Wind,
  Wrench,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import CtaBanner from '@/components/CtaBanner';
import { site } from '@/data/site';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const years = new Date().getFullYear() - site.since;

const pillars = [
  {
    icon: Eye,
    title: 'Our Vision',
    text: 'To become the number one air-conditioning contractor in the U.A.E. and overseas markets — through motivation, professionalism and a commitment to quality, working as one company and one team.',
  },
  {
    icon: HeartHandshake,
    title: 'Our Commitment',
    text: 'Every client receives professional advice, appropriate design, quality workmanship and reliable after-sales service.',
  },
  {
    icon: PackageCheck,
    title: 'Our Quality Policy',
    text: 'All materials and products we use are high quality and specially selected for their purpose — for long life and trouble-free operation.',
  },
];

const divisions = [
  {
    icon: Settings,
    title: 'Mechanical Division',
    text: 'Installation of mechanical and air-conditioning equipment for new construction, renovation and modification projects.',
  },
  {
    icon: Wind,
    title: 'Ducting Division',
    text: 'Complete ducting works for HVAC systems — duct design, G.I. and pre-insulated duct manufacturing, installation, repair and diffusers.',
  },
];

const departments = [
  {
    icon: Building2,
    title: 'Commercial',
    text: 'Installing mechanical equipment for commercial projects across the U.A.E. since the 1990s — including original installations in Dubai, subcontract works and renovations.',
  },
  {
    icon: Home,
    title: 'Residential',
    text: 'Dedicated to the best total indoor-comfort solution for families, with systems designed for custom home builders and a specialist estimator for retrofit installations.',
  },
  {
    icon: Wrench,
    title: 'Service',
    text: 'Full service for residential and commercial equipment — maintenance contracts plus daily repairs on a per-call basis, year-round.',
  },
];

export default function About() {
  useDocumentTitle('About Us');

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={`Keeping the U.A.E. cool since ${site.since}`}
        subtitle={`${site.legalName} is one of the leading air-conditioning contractors in the U.A.E. — contracting, installation and maintenance of air-conditioning systems for over ${years} years.`}
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
                      <p className="mt-1 text-sm text-navy-100">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="relative mt-6 rounded-2xl bg-white p-5 text-sm font-semibold text-navy-900">
                  “Professional advice, appropriate design, quality workmanship and reliable after-sales service — for
                  every client.”
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <SectionHeading align="left" eyebrow="Who We Are" title={`${site.legalName}`} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed">
              <p>
                {site.name} has been in business since {site.since} and has proudly served the U.A.E. ever since,
                providing HVAC solutions in a wide variety of residential and commercial settings.
              </p>
              <p>
                Our technical team is experienced in all types of air-conditioning as well as pre-insulated and G.I.
                duct works. Our clients recognise our ability to complete projects on time and to their full
                satisfaction — which shows in the recurring orders we receive from our valued customers.
              </p>
              <p>
                Whether it is a small air-conditioning job or a large project, {site.name} has built its goodwill in
                the U.A.E. market by taking projects on and completing them on time.
              </p>
            </div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                'All types of air-conditioning',
                'G.I. & pre-insulated ductwork',
                'Commercial & residential projects',
                'Maintenance contracts & repairs',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] font-medium text-navy-800">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-500" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Vision / Commitment / Quality */}
      <section className="section bg-slate-50">
        <div className="container-x">
          <SectionHeading eyebrow="What Drives Us" title="Vision, commitment & quality" />
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

      {/* Divisions & departments */}
      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="How We're Organised"
            title="Two divisions, three departments"
            subtitle="Al Safran has a Mechanical division and a Ducting division. Each one includes a Commercial, Residential and Service department."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {divisions.map((d, i) => {
              const Icon = d.icon;
              return (
                <Reveal key={d.title} delay={i * 100}>
                  <div className="relative h-full overflow-hidden rounded-2xl bg-navy-900 p-8 text-white">
                    <div className="absolute inset-0 bg-grid" />
                    <div className="relative flex gap-5">
                      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-navy-900">
                        <Icon className="size-7" />
                      </span>
                      <div>
                        <h3 className="text-xl text-white">{d.title}</h3>
                        <p className="mt-2 leading-relaxed text-navy-100">{d.text}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {departments.map((d, i) => {
              const Icon = d.icon;
              return (
                <Reveal key={d.title} delay={i * 80}>
                  <div className="card h-full p-7">
                    <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-5 text-lg">{d.title} Department</h3>
                    <p className="mt-2 text-[15px] leading-relaxed">{d.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-800">
              <Clock className="size-4 text-brand-500" /> Our Residential and Commercial departments handle new
              construction as well as renovation and modification installations.
            </p>
            <Link to="/contact" className="btn btn-primary">
              Work With Us <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

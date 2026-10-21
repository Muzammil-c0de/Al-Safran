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
              <div className="relative overflow-hidden rounded-3xl border border-navy-900/10 bg-navy-900 shadow-2xl">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src="/images/site/site-team.jpg"
                    alt="Al Safran MEP site service engineers and mechanics"
                    className="size-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                  
                  {/* Floating Inset Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-navy-900/80 px-3.5 py-1.5 backdrop-blur-md">
                    <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-white">Active On-Site Teams</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {site.stats.map((s) => (
                      <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                        <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                        <p className="mt-1 text-xs text-navy-200">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 rounded-xl border border-brand-400/20 bg-brand-500/10 p-4 text-sm font-medium text-brand-300">
                    “Our goal is simple: install it right, maintain it well, and be there whenever our clients need us.”
                  </p>
                </div>
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

      {/* On-Site Mechanics & Trades */}
      <section className="section bg-slate-50">
        <div className="container-x">
          <SectionHeading
            eyebrow="Specialist Workforce"
            title="Skilled mechanics for every MEP trade"
            subtitle="Our multidisciplinary teams of certified AC mechanics, duct fitters, electricians, and plumbers bring specialized field skills directly to your project."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'AC Mechanics & Diagnostics',
                desc: 'Troubleshooting refrigeration circuits, compressor overhauls, refrigerant charging, and digital gauge diagnostics.',
                img: '/images/site/ac-mechanic.jpg',
                badge: 'AC Mechanics',
              },
              {
                title: 'Chilled Water & AHU Technicians',
                desc: 'Heavy-duty commissioning of chillers, fan coil units, chilled water valving, and air handlers.',
                img: '/images/services/fcu-ahu.jpg',
                badge: 'HVAC Plant Specialist',
              },
              {
                title: 'GI & PI Duct Fabricators',
                desc: 'On-site precision measurement, cutting, insulation wrapping, and suspended ducting installation.',
                img: '/images/services/ducting.jpg',
                badge: 'Duct Installation',
              },
              {
                title: 'Licensed Electrical Mechanics',
                desc: 'Industrial and commercial distribution boards, DB dressing, cable trunking, and circuit balancing.',
                img: '/images/services/electrical.jpg',
                badge: 'Electrical Trades',
              },
              {
                title: 'Master Plumbing & Piping Mechanics',
                desc: 'High-pressure PPR and copper manifolds, drainage lines, pump stations, and valve manifold setups.',
                img: '/images/services/plumbing.jpg',
                badge: 'Mechanical Piping',
              },
              {
                title: 'Duct & Diffuser Hygiene Specialists',
                desc: 'Motorized rotary brush equipment and HEPA filtration vacs for certified indoor air decontamination.',
                img: '/images/services/duct-cleaning.jpg',
                badge: 'HEPA Sanitization',
              },
            ].map((m, i) => (
              <Reveal key={m.title} delay={i * 80}>
                <div className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
                    <img
                      src={m.img}
                      alt={m.title}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-md bg-brand-500/95 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                      {m.badge}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-navy-900">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
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

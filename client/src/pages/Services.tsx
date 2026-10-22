import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import CtaBanner from '@/components/CtaBanner';
import { services } from '@/data/services';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Services() {
  useDocumentTitle('Services');

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Complete HVAC & MEP Solutions"
        subtitle="Chilled water FCU/AHU, GI & PI ducting, duct cleaning, AC, electrical and plumbing — delivered by one dependable team."
        image="/ourservice banner.png"
        // Service names under the 7 icons in the banner image (positions match the icons)
        labels={[
          { x: 11.65, y: 88.5, text: 'AC Installation & Maintenance', href: '#ac-works' },
          { x: 24.65, y: 88.5, text: 'GI & PI Ducting Works', href: '#gi-pi-duct' },
          { x: 37.4, y: 88.5, text: 'Duct & Diffuser Cleaning', href: '#duct-cleaning' },
          { x: 50, y: 88.5, text: 'FCU & AHU Systems', href: '#chilled-water-fcu-ahu' },
          { x: 62.65, y: 88.5, text: 'HVAC Maintenance', href: '#ducting' },
          { x: 75.35, y: 88.5, text: 'Electrical Works', href: '#electrical' },
          { x: 88.25, y: 88.5, text: 'Plumbing Works', href: '#plumbing' },
        ]}
      />


      <section className="section">
        <div className="container-x space-y-20 lg:space-y-28">
          {services.map((s, i) => {
            const Icon = s.icon;
            const reversed = i % 2 === 1;
            return (
              <article key={s.slug} id={s.slug} className="scroll-mt-40">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  {/* Visual */}
                  <Reveal className={reversed ? 'lg:order-2' : ''}>
                    <div className="relative">
                      <div
                        className={`absolute -inset-3 rounded-3xl bg-brand-100 ${reversed ? '-rotate-2' : 'rotate-2'}`}
                      />
                      {s.image ? (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-900 shadow-xl">
                          <img src={s.image} alt={s.title} loading="lazy" className="size-full object-cover" />
                        </div>
                      ) : (
                      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
                        <div className="absolute inset-0 bg-grid" />
                        <div className="absolute -right-16 -bottom-16 size-72 rounded-full bg-brand-500/25 blur-3xl" />
                        <div className="relative grid size-32 place-items-center rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur">
                          <Icon className="size-16 text-brand-400" strokeWidth={1.4} />
                        </div>
                        <span className="absolute top-6 left-6 text-7xl font-extrabold text-white/5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      )}
                    </div>
                  </Reveal>

                  {/* Content */}
                  <Reveal delay={100}>
                    <span className="eyebrow">Service {String(i + 1).padStart(2, '0')}</span>
                    <h2 className="mt-4 text-3xl sm:text-4xl">{s.title}</h2>
                    <p className="mt-5 text-lg leading-relaxed">{s.description}</p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[15px] font-medium text-navy-800">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/contact?service=${encodeURIComponent(s.title)}`}
                      className="btn btn-primary mt-9"
                    >
                      Request this service <ArrowRight className="size-4" />
                    </Link>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CtaBanner />
    </>
    
    
  );
}

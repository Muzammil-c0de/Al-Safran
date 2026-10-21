import { AirVent, Droplets, Fan, Layers, Sparkles, Wind, Zap } from 'lucide-react';
import type { Service } from '@/types';

export const services: Service[] = [
  {
    slug: 'chilled-water-fcu-ahu',
    title: 'Chilled Water FCU / AHU',
    short: 'Installation and maintenance of all chilled water type FCUs and AHUs.',
    description:
      'Complete installation, commissioning and maintenance of chilled water Fan Coil Units and Air Handling Units — keeping your building cool, efficient and quiet all year round.',
    icon: Fan,
    image: '/images/services/fcu-ahu.jpg',
    badge: 'HVAC Specialist',
    features: [
      'Supply & installation of FCUs and AHUs',
      'Chilled water piping, valves & insulation',
      'Testing, balancing & commissioning',
      'Preventive & breakdown maintenance',
      'Coil cleaning, filter & motor servicing',
    ],
  },
  {
    slug: 'ducting',
    title: 'Ducting Installation & Maintenance',
    short: 'All types of ducting installation and maintenance works.',
    description:
      'From new installations to modifications during fit-outs, we design, install and maintain ductwork that moves air efficiently and meets site standards.',
    icon: Wind,
    image: '/images/services/ducting.jpg',
    badge: 'Site Duct Mechanics',
    features: [
      'Supply, return, fresh air & exhaust ducts',
      'Kitchen exhaust & ventilation ducts',
      'Duct modification & re-routing for fit-outs',
      'Leak sealing & insulation repair',
      'Dampers, grilles & diffusers fixing',
    ],
  },
  {
    slug: 'gi-pi-duct',
    title: 'GI Duct & PI Duct Works',
    short: 'Galvanized iron (GI) and pre-insulated (PI) duct fabrication and installation.',
    description:
      'Fabrication and installation of durable galvanized iron ducts and lightweight pre-insulated panel ducts, built to the right gauge and sealed for long-term performance.',
    icon: Layers,
    image: '/images/services/gi-pi-duct.jpg',
    badge: 'GI & PI Fabrication',
    features: [
      'GI duct fabrication & installation',
      'Pre-insulated (PI) panel ducts',
      'Thermal & acoustic insulation',
      'Hangers, supports & proper sealing',
      'Site measurement & shop drawings',
    ],
  },
  {
    slug: 'duct-cleaning',
    title: 'Duct & Diffuser Cleaning',
    short: 'Professional cleaning of ducts and diffusers for healthier indoor air.',
    description:
      'Dust, mould and bacteria build up inside ductwork over time. Our cleaning service restores airflow and indoor air quality with minimal disruption to your home or office.',
    icon: Sparkles,
    image: '/images/services/duct-cleaning.jpg',
    badge: 'HEPA Sanitization',
    features: [
      'Mechanical brushing & HEPA vacuuming',
      'Diffuser & grille removal and washing',
      'Sanitizing & anti-bacterial treatment',
      'Before / after photo report',
      'Flexible scheduling, minimal disruption',
    ],
  },
  {
    slug: 'electrical',
    title: 'Electrical Works',
    short: 'Electrical works for new office and home projects.',
    description:
      'Safe, neat and code-compliant electrical installations for new homes and offices — from conduiting and wiring through to final testing and handover.',
    icon: Zap,
    image: '/images/services/electrical.jpg',
    badge: 'Electrical Mechanics',
    features: [
      'Conduiting & wiring for new projects',
      'Distribution boards, breakers & panels',
      'Lighting, power points & switches',
      'Earthing & safety testing',
      'Fault finding & repairs',
    ],
  },
  {
    slug: 'ac-works',
    title: 'AC Works',
    short: 'AC works for new home and office projects.',
    description:
      'Selection, installation and servicing of air-conditioning systems sized correctly for your space — so you get comfort without wasting energy.',
    icon: AirVent,
    image: '/images/services/ac-works.jpg',
    badge: 'Certified AC Mechanics',
    features: [
      'Split, ducted split & package units',
      'Copper piping & condensate drain lines',
      'Gas charging & leak repair',
      'Routine servicing & AMC contracts',
      'Load calculation & unit sizing',
    ],
  },
  {
    slug: 'plumbing',
    title: 'Plumbing Works',
    short: 'Plumbing works for new home and office projects.',
    description:
      'Reliable water supply and drainage systems for new builds and renovations, installed cleanly and pressure-tested before handover.',
    icon: Droplets,
    image: '/images/services/plumbing.jpg',
    badge: 'Plumbing & Pipe Mechanics',
    features: [
      'Water supply piping (PPR / CPVC)',
      'Drainage & sewage lines',
      'Sanitary fixtures & water heaters',
      'Pumps & water tanks',
      'Leak detection & repairs',
    ],
  },
];

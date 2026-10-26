import { AirVent, Droplets, Fan, Layers, Sparkles, Zap } from 'lucide-react';
import type { Service } from '@/types';

export const services: Service[] = [
  {
    slug: 'ac-works',
    title: 'HVAC Installation & Maintenance',
    short: 'HVAC installation and maintenance for new home and office projects.',
    description:
      'Our technical team is experienced in all types of air-conditioning. We install systems for new construction, renovation and modification projects, and our Service department maintains residential and commercial equipment year-round.',
    icon: AirVent,
    image: '/images/ac%20work.webp',
    features: [
      'All types of air-conditioning systems',
      'New construction & renovation installations',
      'Residential & commercial maintenance contracts',
      'Daily repairs on a per-call basis, year-round',
      'Professional advice & appropriate design',
    ],
  },
  {
    slug: 'electrical',
    title: 'Electrical Works',
    short: 'Electrical works for new office and home projects.',
    description:
      'Safe, neat and code-compliant electrical installations for new homes and offices — from conduiting and wiring through to final testing and handover.',
    icon: Zap,
    image: '/images/electrical%20work.webp',
    features: [
      'Conduiting & wiring for new projects',
      'Distribution boards, breakers & panels',
      'Lighting, power points & switches',
      'Earthing & safety testing',
      'Fault finding & repairs',
    ],
  },
  {
    slug: 'plumbing',
    title: 'Plumbing Works',
    short: 'Plumbing works for new home and office projects.',
    description:
      'Reliable water supply and drainage systems for new builds and renovations, installed cleanly and pressure-tested before handover.',
    icon: Droplets,
    image: '/images/plumbing.webp',
    features: [
      'Water supply piping (PPR / CPVC)',
      'Drainage & sewage lines',
      'Sanitary fixtures & water heaters',
      'Pumps & water tanks',
      'Leak detection & repairs',
    ],
  },
  {
    slug: 'chilled-water-fcu-ahu',
    title: 'Chilled Water FCU / AHU',
    short: 'Installation and maintenance of all chilled water type FCUs and AHUs.',
    description:
      'Complete installation, commissioning and maintenance of chilled water Fan Coil Units and Air Handling Units — keeping your building cool, efficient and quiet all year round.',
    icon: Fan,
    image: '/images/FCU.webp',
    features: [
      'Supply & installation of FCUs and AHUs',
      'Chilled water piping, valves & insulation',
      'Testing, balancing & commissioning',
      'Preventive & breakdown maintenance',
      'Coil cleaning, filter & motor servicing',
    ],
  },
  {
    slug: 'gi-pi-duct',
    title: 'GI & PI Duct Installation & Maintenance',
    short: 'Galvanized iron (GI) and pre-insulated (PI) duct fabrication, installation and maintenance.',
    description:
      'Complete ducting works for HVAC systems — we design, fabricate and install G.I. and pre-insulated ducts sized to your A/C capacity, and maintain and repair existing ducts to rectify air leakage problems.',
    icon: Layers,
    image: '/images/duct.webp',
    features: [
      'Duct sizes designed to suit A/C unit capacity',
      'G.I. ducts in different sheet thicknesses & insulation',
      'Pre-insulated ducts from 20 mm panels',
      'Repair of existing ducts to fix air leakage',
      'Locally made diffusers in all sizes',
    ],
  },
  {
    slug: 'duct-cleaning',
    title: 'Duct & Diffuser Cleaning',
    short: 'Professional cleaning of ducts and diffusers for healthier indoor air.',
    description:
      'Dust, mould and bacteria build up inside ductwork over time. Our cleaning service restores airflow and indoor air quality with minimal disruption to your home or office.',
    icon: Sparkles,
    image: '/images/duct%20and%20defuser%20cleaning.webp',
    features: [
      'Mechanical brushing & HEPA vacuuming',
      'Diffuser & grille removal and washing',
      'Sanitizing & anti-bacterial treatment',
      'Before / after photo report',
      'Flexible scheduling, minimal disruption',
    ],
  },
];

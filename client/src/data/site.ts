/** Company details used across the whole website. */
export const site = {
  name: 'Al Safran',
  legalName: 'Al Safran Technical Services',
  tagline: 'Air-Conditioning',
  slogan: 'Be Cool with Al Safran',
  since: 1985,
  description:
    'Al Safran Technical Services — contracting, installation and maintenance of air-conditioning systems in the U.A.E. since 1985.',

  phone: '04-236 7095',
  phoneHref: 'tel:+97142367095',
  mobiles: [
    { label: '055-890 8664', href: 'tel:+971558908664' },
    { label: '050-676 1036', href: 'tel:+971506761036' },
  ],
  whatsapp: '', // e.g. '971558908664' (digits only) to show a WhatsApp button — leave empty to hide
  email: 'mail2alsafran@gmail.com',
  address: 'P.O. Box 76368, Dubai, U.A.E.',
  hours: 'Service calls attended year-round',

  /** Google Maps "Embed a map" src URL. Leave empty to hide the map. */
  mapEmbedUrl: '',

  /** Set to false if your logo image already contains the company name. */
  showNameNextToLogo: true,

  stats: [
    // `short` is shown on phones, `label` on larger screens
    { value: '1985', short: 'Established', label: 'Established in the U.A.E.' },
    { value: `${new Date().getFullYear() - 1985}+`, short: 'Years', label: 'Years of experience' },
    { value: '2', short: 'Divisions', label: 'Divisions — Mechanical & Ducting' },
    { value: '3', short: 'Departments', label: 'Departments — Commercial, Residential & Service' },
  ],
};

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
] as const;

export const projectCategories = [
  'HVAC & Chilled Water',
  'Ducting',
  'Duct Cleaning',
  'Electrical',
  'AC Works',
  'Plumbing',
] as const;

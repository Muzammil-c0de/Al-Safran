/** Company details used across the whole website. */
export const site = {
  name: 'Al Safran',
  legalName: 'Al Safran Technical Services',
  tagline: 'Air-Conditioning',
  slogan: 'Be Cool with Al Safran',
  since: 1985,
  description:
    'Al Safran Technical Services — contracting, installation and maintenance of air-conditioning systems in the U.A.E. since 1985.',

  /** Number every "Call us" button dials */
  call: { label: '055-890 8664', href: 'tel:+971558908664' },
  mobiles: [
    { label: '052-326 3008', href: 'tel:+971523263008' },
    { label: '055-890 8664', href: 'tel:+971558908664' },
    { label: '054-313 0666', href: 'tel:+971543130666' },
  ],
  whatsapp: '971558908664', // +971 55 890 8664 — digits only; leave empty to hide the WhatsApp button
  email: 'info@alsafran.tech',
  /** Social links shown in the footer — leave a link empty to hide its icon */
  social: {
    instagram: 'https://www.instagram.com/alsafranac/',
    facebook: '', // TODO: add the Facebook page link
  },
  address: 'P.O. Box 76368, Dubai, U.A.E.',
  hours: 'Service calls attended year-round',

  /** Google Maps "Embed a map" src URL. Leave empty to hide the map. */
  mapEmbedUrl: '',

  /** Set to false if your logo image already contains the company name. */
  showNameNextToLogo: true,

  stats: [
    // `short` is shown on phones, `label` on larger screens; `fixed` = shown as-is (no count-up animation)
    { value: '1985', short: 'Since', label: 'Since', fixed: true },
    { value: `${new Date().getFullYear() - 1985}+`, short: 'Years', label: 'Years of experience', fixed: true },
    { value: '1000+', short: 'Clients', label: 'Happy clients' },
    { value: '5000+', short: 'Projects', label: 'Successful projects' },
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

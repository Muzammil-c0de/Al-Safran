/**
 * Company details used across the whole website.
 * TODO: replace the placeholder values below with Al Safran's real details.
 */
export const site = {
  name: 'Al Safran',
  tagline: 'Air-Conditioning',
  slogan: 'Be Cool with Al Safran',
  description:
    'Al Safran delivers chilled water FCU/AHU systems, ducting, duct cleaning, electrical, AC and plumbing works for new homes and offices — installed right, maintained properly.',

  phone: '+000 00 000 0000', // TODO
  phoneHref: 'tel:+00000000000', // TODO
  whatsapp: '', // TODO e.g. '971500000000' (digits only) — leave empty to hide
  email: 'info@example.com', // TODO
  address: 'Office address, City, Country', // TODO
  hours: 'Saturday – Thursday, 8:00 AM – 6:00 PM', // TODO

  /** Google Maps "Embed a map" src URL. Leave empty to hide the map. */
  mapEmbedUrl: '',

  /** Set to false if your logo image already contains the company name. */
  showNameNextToLogo: true,

  /** TODO: replace with your real numbers. */
  stats: [
    { value: '10+', label: 'Years of experience' },
    { value: '250+', label: 'Projects completed' },
    { value: '7', label: 'Core services' },
    { value: '24/7', label: 'Maintenance support' },
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

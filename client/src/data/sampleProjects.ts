import type { Project } from '@/types';

/**
 * Shown only when the database has no projects yet (or the API is offline),
 * so the Projects page never looks empty. Add real projects from /admin —
 * as soon as one exists, these samples are no longer shown.
 */
export const sampleProjects: Project[] = [
  {
    id: 'sample-1',
    title: 'Office Fit-Out — Chilled Water FCU Installation',
    category: 'HVAC & Chilled Water',
    location: 'Commercial office',
    description: 'Supply and installation of chilled water FCUs with piping, insulation and commissioning.',
    image_url: '/images/projects/project-fcu.jpg',
    completed_on: '2025-11-15',
  },
  {
    id: 'sample-2',
    title: 'GI Ductwork for Retail Showroom',
    category: 'Ducting',
    location: 'Retail showroom',
    description: 'Fabrication and installation of GI supply and return ducts with diffusers.',
    image_url: '/images/projects/project-duct.jpg',
    completed_on: '2025-09-20',
  },
  {
    id: 'sample-3',
    title: 'Villa Duct & Diffuser Cleaning',
    category: 'Duct Cleaning',
    location: 'Residential villa',
    description: 'Full duct cleaning, diffuser washing and sanitizing for a family home.',
    image_url: '/images/projects/project-cleaning.jpg',
    completed_on: '2025-12-05',
  },
  {
    id: 'sample-4',
    title: 'New Office Electrical Works',
    category: 'Electrical',
    location: 'Commercial office',
    description: 'Conduiting, wiring, DB installation and lighting for a new office floor.',
    image_url: '/images/projects/project-electrical.jpg',
    completed_on: '2025-08-14',
  },
  {
    id: 'sample-5',
    title: 'Apartment Split AC Installation',
    category: 'AC Works',
    location: 'Residential apartment',
    description: 'Installation of split units with copper piping and drain lines.',
    image_url: '/images/projects/project-ac.jpg',
    completed_on: '2026-01-10',
  },
  {
    id: 'sample-6',
    title: 'Townhouse Plumbing Works',
    category: 'Plumbing',
    location: 'Residential townhouse',
    description: 'Complete water supply and drainage installation with pressure testing.',
    image_url: '/images/projects/project-plumbing.jpg',
    completed_on: '2025-10-28',
  },
];

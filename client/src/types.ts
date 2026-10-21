import type { LucideIcon } from 'lucide-react';

export interface Service {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  /** Optional photo from /public, e.g. '/images/FCU.png' */
  image?: string;
}

export interface Project {
  id: number | string;
  title: string;
  category: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  completed_on: string | null;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  company_website?: string; // honeypot
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  created_at: string;
}

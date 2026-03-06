export interface DesignProject {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  artistStatement?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  sortOrder: number;
}

export type Section = 'portfolio' | 'about' | 'contact';

export interface WorkHistoryItem {
  company: string;
  role: string;
  years: string;
}

export interface EducationItem {
  school: string;
  degree: string;
}

export interface AboutContent {
  profileImageUrl: string;
  name: string;
  tagline: string;
  location: string;
  bioHeadline: string;
  bioParagraphs: string[];
  workHistory: WorkHistoryItem[];
  education: EducationItem[];
  skills: string[];
  philosophy: string;
  linkedinUrl: string;
  linkedinHandle: string;
  websiteUrl: string;
  websiteDisplay: string;
  behanceUrl?: string;
  contactEmail?: string;
  contactHeadline: string;
  contactDescription: string;
}

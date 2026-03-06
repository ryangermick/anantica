
export interface DesignProject {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  artistStatement?: string; // Arbitrary text block about the piece
  year?: string;
  medium?: string;
  dimensions?: string;
  sortOrder: number; // For drag-and-drop ordering
  createdAt?: Date;
}

export type Section = 'portfolio' | 'about' | 'contact' | 'admin';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

// Work history item for About section
export interface WorkHistoryItem {
  company: string;
  role: string;
  years: string;
}

// About section content
export interface AboutContent {
  // Profile
  profileImageUrl: string;
  name: string;
  tagline: string;
  location: string;
  
  // Bio
  bioHeadline: string;
  bioParagraphs: string[];
  
  // Work History
  workHistory: WorkHistoryItem[];
  
  // Education
  school: string;
  degree: string;
  
  // Skills
  skills: string[];
  
  // Philosophy
  philosophy: string;
  
  // Social Links
  linkedinUrl: string;
  linkedinHandle: string;
  websiteUrl: string;
  websiteDisplay: string;
  behanceUrl?: string;
  
  // Contact section
  contactHeadline: string;
  contactDescription: string;
}

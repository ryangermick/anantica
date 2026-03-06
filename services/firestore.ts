import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase.config';
import { DesignProject } from '../types';

const PROJECTS_COLLECTION = 'projects';

// Convert Firestore document to DesignProject
const docToProject = (doc: any): DesignProject => ({
  id: doc.id,
  title: doc.data().title,
  category: doc.data().category,
  imageUrl: doc.data().imageUrl,
  description: doc.data().description,
  artistStatement: doc.data().artistStatement,
  year: doc.data().year,
  medium: doc.data().medium,
  dimensions: doc.data().dimensions,
  sortOrder: doc.data().sortOrder ?? 0,
  createdAt: doc.data().createdAt?.toDate?.() || new Date(),
});

// Get all projects
export const getProjects = async (): Promise<DesignProject[]> => {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('sortOrder', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToProject);
};

// Subscribe to projects (real-time updates)
export const subscribeToProjects = (
  callback: (projects: DesignProject[]) => void
): (() => void) => {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('sortOrder', 'asc'));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const projects = snapshot.docs.map(docToProject);
      callback(projects);
    },
    (error) => {
      console.error('Error subscribing to projects:', error);
      // Return empty array on error to prevent app crash
      callback([]);
    }
  );

  return unsubscribe;
};

// Add a new project
export const addProject = async (
  project: Omit<DesignProject, 'id'>
): Promise<string> => {
  // Get current max sortOrder
  const projects = await getProjects();
  const maxSortOrder = projects.reduce((max, p) => Math.max(max, p.sortOrder || 0), 0);
  
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...project,
    sortOrder: maxSortOrder + 1,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// Update a project
export const updateProject = async (
  id: string,
  updates: Partial<DesignProject>
): Promise<void> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  await updateDoc(projectRef, updates);
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  await deleteDoc(projectRef);
};

// Batch update sort orders (for drag and drop reordering)
export const updateProjectsOrder = async (
  projects: { id: string; sortOrder: number }[]
): Promise<void> => {
  const batch = writeBatch(db);
  
  projects.forEach(({ id, sortOrder }) => {
    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    batch.update(projectRef, { sortOrder });
  });
  
  await batch.commit();
};

// Upload image to Firebase Storage
export const uploadImage = async (
  file: File,
  projectId?: string
): Promise<string> => {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `projects/${projectId || 'new'}_${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  
  return downloadUrl;
};

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - the image might already be deleted or external
  }
};

// Contact form submissions
const CONTACTS_COLLECTION = 'contacts';

import { sendContactNotification } from './email';

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
}

export const submitContact = async (
  contact: Omit<ContactSubmission, 'id' | 'createdAt'>
): Promise<string> => {
  // Save to Firestore
  const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
    ...contact,
    createdAt: Timestamp.now(),
  });

  // Send email notification (don't await - fire and forget)
  sendContactNotification(contact).catch((err) => {
    console.error('Email notification failed:', err);
  });

  return docRef.id;
};

// About content management
import { AboutContent } from '../types';

const SITE_CONFIG_COLLECTION = 'siteConfig';
const ABOUT_DOC_ID = 'about';

// Default about content
export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  profileImageUrl: '',
  name: 'Anantica Singh',
  tagline: 'Product Leader at Google steering AI, Search, and billion-user experiences from San Francisco, CA.',
  location: 'San Francisco, CA',
  bioHeadline: 'With 18+ years at Google and a passion for building products that reach billions, I combine strategic leadership with deep technical intuition to ship experiences that matter.',
  bioParagraphs: [
    'I currently lead AI product velocity across Google Search, driving strategy for next-generation experiences. Previously, I co-founded Google\'s food ordering marketplace across Search, Maps, and Assistant — managing cross-functional teams of PMs, UXD, and Strategy.',
    'Beyond Google, I invest in and advise mission-driven startups, bridging Silicon Valley innovation with global entrepreneurship. I\'m a graduate of Stanford GSB\'s LEAD program, hold degrees in Economics, Political Science, and International Political Economy, and started my career as a photojournalist at The Times of India.',
  ],
  workHistory: [
    { company: 'Google', role: 'GPM, AI Product Velocity, Search', years: '2024 – Present' },
    { company: 'Google', role: 'Product Lead, Integrity Identity & Applied AI', years: '2023 – 2024' },
    { company: 'Various Startups', role: 'Tech Investor, Advisor & Mentor', years: '2021 – 2023' },
    { company: 'Google', role: 'Co-Founder & GPM, Food Ordering', years: '2016 – 2023' },
    { company: 'Google', role: 'PM/Lead: Growth, Core UX & Strategic Features', years: '2011 – 2016' },
    { company: 'Google', role: 'Growth Marketing Lead', years: '2007 – 2011' },
    { company: 'The Times of India', role: 'Photojournalist', years: '2002 – 2005' },
  ],
  school: 'Stanford University GSB',
  degree: 'LEAD — Class of 2025 · Wharton Strategy & Marketing · MSc International Political Economy · BA Triple Honors',
  skills: ['Product Strategy', 'AI/ML Products', 'Team Leadership', 'Growth & Distribution', 'Startup Advisory'],
  philosophy: 'Crafting products that resonate with billions of users, driven by a commitment to strategic leadership, innovation, and user-centric thinking.',
  linkedinUrl: 'https://www.linkedin.com/in/anantica',
  linkedinHandle: '/anantica',
  websiteUrl: '',
  websiteDisplay: '',
  behanceUrl: '',
  contactHeadline: "Let's connect.",
  contactDescription: "Interested in collaborating on product strategy, AI innovation, or startup advisory? I'd love to hear from you.",
};

// Get about content
export const getAboutContent = async (): Promise<AboutContent> => {
  try {
    const docRef = doc(db, SITE_CONFIG_COLLECTION, ABOUT_DOC_ID);
    const docSnap = await getDocs(query(collection(db, SITE_CONFIG_COLLECTION)));
    
    for (const d of docSnap.docs) {
      if (d.id === ABOUT_DOC_ID) {
        return { ...DEFAULT_ABOUT_CONTENT, ...d.data() } as AboutContent;
      }
    }
    return DEFAULT_ABOUT_CONTENT;
  } catch (error) {
    console.error('Error getting about content:', error);
    return DEFAULT_ABOUT_CONTENT;
  }
};

// Subscribe to about content changes
export const subscribeToAboutContent = (
  callback: (content: AboutContent) => void
): (() => void) => {
  const docRef = doc(db, SITE_CONFIG_COLLECTION, ABOUT_DOC_ID);
  
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_ABOUT_CONTENT, ...docSnap.data() } as AboutContent);
      } else {
        callback(DEFAULT_ABOUT_CONTENT);
      }
    },
    (error) => {
      console.error('Error subscribing to about content:', error);
      // Return default content on error to prevent app crash
      callback(DEFAULT_ABOUT_CONTENT);
    }
  );

  return unsubscribe;
};

// Update about content
export const updateAboutContent = async (
  content: Partial<AboutContent>
): Promise<void> => {
  const docRef = doc(db, SITE_CONFIG_COLLECTION, ABOUT_DOC_ID);
  
  // Use setDoc with merge to create or update
  const { setDoc } = await import('firebase/firestore');
  await setDoc(docRef, content, { merge: true });
};

// Upload profile image
export const uploadProfileImage = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `profile/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  
  return downloadUrl;
};


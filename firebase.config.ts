// Firebase configuration for Anantica Singh Portfolio
// TODO: Create Firebase project and update config

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "anantica-site.firebaseapp.com",
  projectId: "anantica-site",
  storageBucket: "anantica-site.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "0:000000000000:web:000000000000",
};

// Allowed admin emails
export const ADMIN_EMAILS = [
  'anantica@gmail.com',
  'rgermick@gmail.com'
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage (for image uploads)
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

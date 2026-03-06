import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAILS } from '../firebase.config';
import { AdminUser } from '../types';

// Check if a user email is an authorized admin
export const isAuthorizedAdmin = (email: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<AdminUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user is authorized
    if (!isAuthorizedAdmin(user.email)) {
      // Sign out unauthorized users
      await firebaseSignOut(auth);
      throw new Error('Unauthorized: This email is not allowed to access the admin panel.');
    }
    
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthState = (
  callback: (user: AdminUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser && isAuthorizedAdmin(firebaseUser.email)) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = (): AdminUser | null => {
  const user = auth.currentUser;
  if (user && isAuthorizedAdmin(user.email)) {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }
  return null;
};


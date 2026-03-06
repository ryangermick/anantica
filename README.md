<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Ali Felski - Design Portfolio

A beautiful React portfolio site with Firebase/Firestore backend for data persistence.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your configuration:
   ```bash
   # Firebase Configuration (get from Firebase Console > Project Settings)
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id

   # Gemini API Key (optional, for logo generation)
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

The app will be available at http://localhost:3000

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database (Cloud Firestore)
4. Go to Project Settings > General > Your apps
5. Add a Web app and copy the configuration values to your `.env.local`

### Firestore Collections

The app uses these collections:
- `projects` - Portfolio projects
- `contacts` - Contact form submissions

## Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Tech Stack

- React 19
- Vite
- TypeScript
- TailwindCSS
- Firebase (Firestore, Hosting)
- Lucide React Icons

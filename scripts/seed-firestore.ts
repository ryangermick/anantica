// Seed script to populate Firestore with initial projects
// Run with: npx tsx scripts/seed-firestore.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCLaaGIKl1Gof16vDYh_7JeMUrKPP6HcV4",
  authDomain: "alifelskidesign.firebaseapp.com",
  projectId: "alifelskidesign",
  storageBucket: "alifelskidesign.firebasestorage.app",
  messagingSenderId: "839780926532",
  appId: "1:839780926532:web:3dd18d93055a37fd242811",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_PROJECTS = [
  {
    title: 'Mariana Tek Brand Scaling',
    category: 'Brand Identity',
    imageUrl: 'https://picsum.photos/seed/marianatek/800/1000',
    description: 'Scaled the design team by 3x and increased customer acquisitions by 20x through improved web presence and product usability.'
  },
  {
    title: 'Sunlight Foundation Identity',
    category: 'Graphic Design',
    imageUrl: 'https://picsum.photos/seed/sunlight/800/600',
    description: 'Developed consistent branding and quirky designs to increase awareness and support the mission of transparency in government.'
  },
  {
    title: 'BILL Platform Design',
    category: 'Product Design',
    imageUrl: 'https://picsum.photos/seed/bill/800/1200',
    description: 'Led the Platform Design Team through complex company mergers, building harmony and refined design processes.'
  },
  {
    title: 'Washington Post Interactive',
    category: 'Digital Design',
    imageUrl: 'https://picsum.photos/seed/wapo/800/1000',
    description: 'Produced interactive microsites for features on washingtonpost.com and Newsweek.com within a fast-paced news cycle.'
  },
  {
    title: 'LivingSocial Merchant Center',
    category: 'UX Design',
    imageUrl: 'https://picsum.photos/seed/livingsocial/800/800',
    description: 'Redesign of the backend Merchant Center for vendors, successfully reducing support tickets by 30%.'
  },
  {
    title: 'Dev Seed UX Strategy',
    category: 'UX Research',
    imageUrl: 'https://picsum.photos/seed/devseed/800/500',
    description: 'Implemented mentorship programs and internal review systems while increasing billable research work by 25%.'
  },
  {
    title: 'Gov-Tech Usability',
    category: 'Consulting',
    imageUrl: 'https://picsum.photos/seed/govtech/800/1100',
    description: 'Advised government officials on making public-facing websites more usable and accessible through workshops.'
  },
  {
    title: 'iStrategyLabs UX Training',
    category: 'Leadership',
    imageUrl: 'https://picsum.photos/seed/isl/800/900',
    description: 'Developed and taught a rigorous 4-month user research training course for employees and stakeholders.'
  },
  {
    title: 'Career Ladder Systems',
    category: 'Design Ops',
    imageUrl: 'https://picsum.photos/seed/ops/800/1300',
    description: 'Created 360 review systems and career ladders to decrease role confusion and empower design teams.'
  },
  {
    title: 'Editorial Visuals',
    category: 'Print Design',
    imageUrl: 'https://picsum.photos/seed/print/800/700',
    description: 'Created print materials and branding for high-profile events at the Washington Post throughout the fiscal year.'
  }
];

async function seedDatabase() {
  console.log('🔥 Testing Firestore connection...\n');

  try {
    // First, check if projects already exist
    const projectsRef = collection(db, 'projects');
    const existingDocs = await getDocs(projectsRef);
    
    if (existingDocs.size > 0) {
      console.log(`✅ Firestore is working! Found ${existingDocs.size} existing projects.\n`);
      console.log('Existing projects:');
      existingDocs.forEach((doc) => {
        console.log(`  - ${doc.data().title}`);
      });
      return;
    }

    console.log('📝 No projects found. Seeding database with initial projects...\n');

    for (const project of INITIAL_PROJECTS) {
      const docRef = await addDoc(projectsRef, {
        ...project,
        createdAt: Timestamp.now(),
      });
      console.log(`  ✓ Added: ${project.title} (${docRef.id})`);
    }

    console.log(`\n✅ Successfully added ${INITIAL_PROJECTS.length} projects to Firestore!`);
    console.log('\n🌐 Refresh your browser at http://localhost:3000 to see the data.');

  } catch (error: any) {
    console.error('❌ Error connecting to Firestore:', error.message);
    console.log('\n💡 Make sure Firestore rules allow read/write access.');
    console.log('   Go to Firebase Console → Firestore → Rules and set:');
    console.log(`
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    `);
  }
}

seedDatabase().then(() => process.exit(0));


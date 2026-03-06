import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminCMS from './components/AdminCMS';
import LoginModal from './components/LoginModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { INITIAL_PROJECTS } from './constants';
import { DesignProject, Section } from './types';
import { subscribeToProjects, addProject, uploadImage } from './services/firestore';

const AppContent: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('portfolio');
  const [projects, setProjects] = useState<DesignProject[]>(INITIAL_PROJECTS);
  const [isScrolled, setIsScrolled] = useState(false);
  const [firestoreReady, setFirestoreReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminCMS, setShowAdminCMS] = useState(false);

  // Update page title based on active section
  useEffect(() => {
    const sectionTitles: Record<Section, string> = {
      portfolio: 'Work',
      about: 'About',
      contact: 'Contact',
    };
    document.title = `Anantica Singh | ${sectionTitles[activeSection]}`;
  }, [activeSection]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Subscribe to Firestore projects
    const unsubscribe = subscribeToProjects((firestoreProjects) => {
      setFirestoreReady(true);
      if (firestoreProjects.length > 0) {
        setProjects(firestoreProjects);
      }
      // If no projects in Firestore yet, keep using INITIAL_PROJECTS
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  // Close login modal when user successfully logs in
  useEffect(() => {
    if (isAdmin && showLoginModal) {
      setShowLoginModal(false);
      setShowAdminCMS(true);
    }
  }, [isAdmin, showLoginModal]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        try {
          // Upload to Firebase Storage first
          const imageUrl = await uploadImage(file);
          
          await addProject({
            title: file.name.split('.')[0],
            category: 'New Upload',
            imageUrl,
            description: 'Newly uploaded project.',
            sortOrder: 0,
          });
        } catch (error) {
          console.error('Error adding project:', error);
        }
      }
      
      setActiveSection('portfolio');
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setShowAdminCMS(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'portfolio':
        return <Portfolio projects={projects} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Portfolio projects={projects} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isScrolled={isScrolled}
      />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        {renderSection()}
      </main>

      <Footer onAdminClick={handleAdminClick} />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Admin CMS */}
      {showAdminCMS && isAdmin && (
        <AdminCMS 
          projects={projects} 
          onClose={() => setShowAdminCMS(false)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

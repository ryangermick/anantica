import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { INITIAL_PROJECTS } from './constants';
import { DesignProject, Section } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('portfolio');
  const [projects] = useState<DesignProject[]>(INITIAL_PROJECTS);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sectionTitles: Record<Section, string> = {
      portfolio: 'Work',
      about: 'About',
      contact: 'Contact',
    };
    document.title = `Anantica Singh | ${sectionTitles[activeSection]}`;
  }, [activeSection]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'portfolio': return <Portfolio projects={projects} />;
      case 'about': return <About />;
      case 'contact': return <Contact />;
      default: return <Portfolio projects={projects} />;
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
      <Footer />
    </div>
  );
};

export default App;

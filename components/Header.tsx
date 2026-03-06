
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Section } from '../types';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, isScrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { label: string; value: Section }[] = [
    { label: 'Work', value: 'portfolio' },
    { label: 'About', value: 'about' },
    { label: 'Contact', value: 'contact' },
  ];

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 transition-all duration-300 ${isMenuOpen ? 'z-[70] bg-white py-8' : isScrolled ? 'z-50 bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'z-50 bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex justify-between items-center">
        <button 
          onClick={() => handleNavClick('portfolio')}
          className="flex items-center space-x-3 group"
        >
          <span className="font-brand text-2xl md:text-3xl font-extrabold tracking-tighter hover:opacity-70 transition-opacity">
            ANANTICA.
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-12">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavClick(item.value)}
              className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 relative py-1
                ${activeSection === item.value ? 'text-black' : 'text-gray-400 hover:text-black'}
              `}
            >
              {item.label}
              {activeSection === item.value && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 text-black relative z-[70]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavClick(item.value)}
              className={`text-3xl font-brand font-bold tracking-tighter transition-all
                ${activeSection === item.value ? 'text-black scale-110' : 'text-gray-300'}
              `}
            >
              {item.label}
            </button>
          ))}
          <div className="absolute bottom-12 flex space-x-6 text-sm tracking-widest uppercase text-gray-400">
            <span>Instagram</span>
            <span>LinkedIn</span>
            <span>Behance</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

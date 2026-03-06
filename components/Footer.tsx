
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Settings } from 'lucide-react';
import { subscribeToAboutContent, DEFAULT_ABOUT_CONTENT } from '../services/firestore';
import { AboutContent } from '../types';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const currentYear = new Date().getFullYear();
  const { isAdmin, logout } = useAuth();
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    const unsubscribe = subscribeToAboutContent((aboutContent) => {
      setContent(aboutContent);
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <footer className="mt-auto py-12 px-4 md:px-8 lg:px-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <span className="font-brand font-black text-xl tracking-tighter uppercase">{content.name}.</span>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            © {currentYear} {content.name} Design / All Rights Reserved.
          </p>
        </div>

        <div className="flex space-x-12">
          {content.linkedinUrl && (
            <a href={content.linkedinUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">LinkedIn</a>
          )}
          {content.websiteUrl && (
            <a href={content.websiteUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">Portfolio</a>
          )}
          {content.behanceUrl && (
            <a href={content.behanceUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">Behance</a>
          )}
        </div>

        <div className="hidden lg:block">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300">
            User Centric by Design.
          </p>
        </div>
      </div>

      {/* Extremely subtle admin link at the very bottom */}
      <div className="mt-12 pt-6 border-t border-gray-50">
        <div className="max-w-7xl mx-auto flex justify-center items-center space-x-6">
          {isAdmin ? (
            <>
              <button
                onClick={onAdminClick}
                className="flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors"
              >
                <Settings size={10} />
                <span>Manage</span>
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors"
              >
                <LogOut size={10} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-[9px] uppercase tracking-[0.2em] text-gray-200 hover:text-gray-400 transition-colors"
            >
              admin
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

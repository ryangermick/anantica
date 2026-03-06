import React from 'react';
import { DEFAULT_ABOUT_CONTENT } from '../constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const content = DEFAULT_ABOUT_CONTENT;

  return (
    <footer className="mt-auto py-12 px-4 md:px-8 lg:px-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <span className="font-brand font-black text-xl tracking-tighter uppercase">{content.name}.</span>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            © {currentYear} {content.name} / All Rights Reserved.
          </p>
        </div>
        <div className="flex space-x-12">
          {content.linkedinUrl && (
            <a href={content.linkedinUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">LinkedIn</a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DesignProject } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioProps {
  projects: DesignProject[];
}

const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const selectedProject = selectedIndex !== null ? projects[selectedIndex] : null;

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < projects.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, projects.length]);

  const goToPrev = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToNext, goToPrev, closeModal]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left - go next
        goToNext();
      } else {
        // Swiped right - go prev
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const openProject = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="fade-in">
      <div className="mb-12">
        <h1 className="font-brand text-5xl md:text-7xl font-extrabold mb-4 tracking-tighter">
          Selected Works<span className="text-gray-300">.</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg leading-relaxed">
          Handmade ceramics — wheel-thrown and hand-built vessels, bowls, and planters exploring form, glaze, and texture.
        </p>
      </div>

      <div className="masonry">
        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className="masonry-item group relative overflow-hidden rounded-sm cursor-pointer bg-gray-100"
            onClick={() => openProject(index)}
          >
            <img 
              src={project.imageUrl} 
              alt={project.title}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{project.category}</p>
              <h3 className="text-white font-brand text-xl font-bold tracking-tight">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProject && selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-white fade-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle close button */}
          <button 
            onClick={closeModal}
            className="absolute top-6 right-6 z-[110] text-gray-300 hover:text-gray-600 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Subtle page indicator */}
          <div className="absolute top-6 left-6 z-[110]">
            <span className="text-xs text-gray-300 tracking-widest">
              {selectedIndex + 1} / {projects.length}
            </span>
          </div>

          {/* Side navigation arrows - very subtle, only on desktop */}
          <button 
            onClick={goToPrev}
            disabled={selectedIndex === 0}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-[110] text-gray-200 hover:text-gray-500 transition-colors disabled:opacity-0 p-2"
            aria-label="Previous project"
          >
            <ChevronLeft size={24} strokeWidth={1} />
          </button>
          <button 
            onClick={goToNext}
            disabled={selectedIndex === projects.length - 1}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-[110] text-gray-200 hover:text-gray-500 transition-colors disabled:opacity-0 p-2"
            aria-label="Next project"
          >
            <ChevronRight size={24} strokeWidth={1} />
          </button>
          
          {/* Content area - hide scrollbar */}
          <div className="h-full overflow-y-auto px-6 py-16 md:py-12 md:px-16 scrollbar-hide">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start min-h-full">
              <div className="flex items-center">
                <img 
                  src={selectedProject.imageUrl} 
                  alt={selectedProject.title}
                  className="w-full h-auto rounded-sm shadow-lg"
                />
              </div>
              <div className="space-y-6 flex flex-col justify-center">
                <div>
                  <p className="text-gray-400 uppercase tracking-[0.2em] text-xs font-semibold mb-2">{selectedProject.category}</p>
                  <h2 className="font-brand text-3xl md:text-4xl font-extrabold tracking-tighter mb-4">{selectedProject.title}</h2>
                  <div className="h-0.5 w-16 bg-black mb-6" />
                  <p className="text-gray-500 leading-relaxed">
                    {selectedProject.description || "Project details exploring the synthesis of form, function, and aesthetic narrative."}
                  </p>
                </div>

                {/* Artist Statement / Notes */}
                {selectedProject.artistStatement && (
                  <div className="py-4 border-t border-gray-100">
                    <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Artist Notes</h4>
                    <p className="text-gray-600 leading-relaxed italic text-sm">
                      "{selectedProject.artistStatement}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 py-4 border-t border-gray-100 text-sm">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-1">Year</h4>
                    <p className="font-medium">{selectedProject.year || '2024'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                      {selectedProject.medium ? 'Medium' : 'Client'}
                    </h4>
                    <p className="font-medium">{selectedProject.medium || 'Internal Project'}</p>
                  </div>
                  {selectedProject.dimensions && (
                    <div className="col-span-2">
                      <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-1">Dimensions</h4>
                      <p className="font-medium">{selectedProject.dimensions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

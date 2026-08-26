import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MediaLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Synchroniser l'index si l'index initial change à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Gestion de la navigation au clavier (Accessibilité Pro)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* 🌌 BACKDROP IMMERSIF : Fond sombre opaque pour focaliser l'attention sur le média */}
      <div 
        className="fixed inset-0 bg-slate-950/90 z-[10000] h-screen transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* 📦 CONTENEUR DE LA LIGHTBOX */}
      <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-2 sm:p-10 pointer-events-none">
        
        {/* BOUTON FERMER (Top Right Flottant) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer pointer-events-auto"
          aria-label="Close lightbox"
        >
          <X size={22} />
        </button>

        {/* 🖼️ ZONE CENTRALE : Affichage de l'image & Flèches de navigation */}
        <div className="relative w-full max-w-4xl h-[85vh] flex items-center justify-center pointer-events-auto">
          
          {/* Flèche Gauche */}
          <button
            onClick={handlePrev}
            className="absolute left-1 sm:-left-12 p-2 sm:p-3 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          {/* Cadre d'image principal (Fidèle à l'arrondi et au centrage du sketch) */}
          <div className="w-full h-full rounded-lg sm:rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl flex items-center justify-center select-none animate-in fade-in zoom-in-95 duration-200">
            <img
              src={images[currentIndex]}
              alt={`Property gallery view ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Flèche Droite */}
          <button
            onClick={handleNext}
            className="absolute right-1 sm:-right-12 p-2 sm:p-3 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Next image"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 📑 INDICATEURS À PUCES (Dots inférieurs - Calqué sur l'image de référence) */}
        <div className="mt-6 flex items-center gap-2 pointer-events-auto bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'w-6 bg-white' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Index textuel discret */}
        <span className="mt-2 text-xs font-medium text-white/50 tracking-wider">
          {currentIndex + 1} / {images.length}
        </span>

      </div>
    </>
  );
};
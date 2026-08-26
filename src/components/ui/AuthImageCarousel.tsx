import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselSlide {
  image: string;
  title: string;
  description: string;
}

const slides: CarouselSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    title: 'Manage Properties Efficiently',
    description: 'Easily track rent payments, maintenance requests, and tenant communications in one place.',
  },
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    title: 'Find Your Dream Home',
    description: 'Browse through our curated selection of premium properties across Rwanda.',
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    title: 'Sell With Confidence',
    description: 'List your property and reach thousands of potential buyers with our platform.',
  },
];

export const AuthImageCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: 'right' | 'left') => {
    if (index === current) return;
    setDirection(dir);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    const nextIdx = (current + 1) % slides.length;
    goTo(nextIdx, 'right');
  }, [current, goTo]);

  const prev = useCallback(() => {
    const prevIdx = (current - 1 + slides.length) % slides.length;
    goTo(prevIdx, 'left');
  }, [current, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection('right');
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleDotClick = (index: number) => {
    if (index !== current) {
      const dir = index > current ? 'right' : 'left';
      goTo(index, dir);
      resetTimer();
    }
  };

  const handlePrev = () => {
    prev();
    resetTimer();
  };

  const handleNext = () => {
    next();
    resetTimer();
  };

  const slide = slides[current];

  const slideVariants = {
    enter: (dir: 'right' | 'left') => ({
      x: dir === 'right' ? '30%' : '-30%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'right' | 'left') => ({
      x: dir === 'right' ? '-30%' : '30%',
      opacity: 0,
    }),
  };

  const textVariants = {
    enter: (dir: 'right' | 'left') => ({
      x: dir === 'right' ? '50%' : '-50%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'right' | 'left') => ({
      x: dir === 'right' ? '-40%' : '40%',
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-sm select-none group bg-brand-primary">
      
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: 'spring' as const, stiffness: 60, damping: 18 }, opacity: { duration: 0.5 } }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />

          <motion.div
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring' as const, stiffness: 70, damping: 16 }, opacity: { duration: 0.4 } }}
            className="absolute bottom-10 left-10 right-24 flex flex-col gap-3 z-20"
          >
            <motion.h2
              className="text-3xl font-semibold text-white tracking-tight leading-tight max-w-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {slide.title}
            </motion.h2>

            <motion.p
              className="text-sm font-normal text-white/80 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      <div className="absolute bottom-10 right-10 flex items-center gap-1.5 z-40">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-1 bg-white' : 'w-3 h-1 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container } from '@/components/ui/Container';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { testimonials } from '@/data/testimonials';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import q1Image from '@/assets/q1.png';

const AUTOPLAY_INTERVAL_MS = 4500;

// Variants for smooth slide transitions (left/right direction)
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
  }),
};

export const TestimonialsSection: React.FC = () => {
  const [[currentIndex, direction], setPage] = useState([0, 1]);
  const [isHovered, setIsHovered] = useState(false);
  const count = testimonials.length;

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevIndex]) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = count - 1;
      if (nextIndex >= count) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  }, [count]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(() => {
      paginate(1);
    }, AUTOPLAY_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, paginate]);

  const activeTestimonial = testimonials[currentIndex];

  return (
    <section 
      id="testimonials" 
      className="py-12 lg:py-20 bg-gradient-to-b from-slate-50/90 via-[#54B5BB]/8 to-white dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Section Header at the Top above Image & Testimonials */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Column: Client Image (q1.png) with bottom gradient fade */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <img
                src={q1Image}
                alt="Client"
                className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain select-none pointer-events-none"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)'
                }}
              />
            </div>

            {/* Right Column: Auto-Swapping Testimonial Cards */}
            <div className="lg:col-span-7 flex flex-col justify-center max-w-[420px] mx-auto lg:mx-0 w-full">
              {/* Testimonial Card Container */}
              <div className="relative min-h-[240px] sm:min-h-[220px] flex flex-col justify-center w-full">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={`testimonial-${activeTestimonial.id}-${currentIndex}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="w-full"
                  >
                    <TestimonialCard testimonial={activeTestimonial} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Subtle Progress Dots for Swapping */}
              <div className="flex items-center gap-2 mt-4">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage([i, i > currentIndex ? 1 : -1])}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIndex 
                        ? 'w-7 bg-brand-primary' 
                        : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

            </div>

          </div>
        </div>
      </Container>
    </section>
  );
};



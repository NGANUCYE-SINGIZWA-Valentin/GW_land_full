import React from 'react';
import { Star, Quote, ShieldCheck } from 'lucide-react';
import { Testimonial } from '@/data/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  // Infer customer verified badge
  const isSeller = testimonial.role.toLowerCase().includes('seller');
  const isTenant = testimonial.role.toLowerCase().includes('tenant');
  const verifiedBadge = isSeller ? 'Verified Seller' : isTenant ? 'Verified Tenant' : 'Verified Buyer';

  // Format role with bullet instead of comma
  const formattedRole = testimonial.role.replace(', ', ' • ');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between transition-colors duration-200">
      <div>
        {/* Top Header Row: Quote Icon, Star Rating & Verified Badge */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Quote className="w-7 h-7 text-slate-300 dark:text-slate-700 shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={
                    i < testimonial.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700'
                  }
                />
              ))}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80 shrink-0">
            <ShieldCheck size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{verifiedBadge}</span>
          </span>
        </div>

        {/* Testimonial Quote Text */}
        <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-normal mb-6">
          "{testimonial.feedback}"
        </p>
      </div>

      {/* Author Footer Profile */}
      <div className="flex items-center gap-4 pt-5 border-t border-slate-100 dark:border-slate-800/80">
        <img
          src={testimonial.avatarUrl}
          alt={testimonial.name}
          loading="lazy"
          className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
            {testimonial.name}
          </h4>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {formattedRole}
          </p>
        </div>
      </div>
    </div>
  );
};



import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { BlogPost } from '@/data/blog';

interface BlogCardProps {
  post: BlogPost;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <article className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 hover:border-brand-secondary/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
      <div>
        {/* Image & Badge */}
        <div className="relative h-56 bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0">
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <span className="absolute top-4 left-4 text-[9px] tracking-wider font-extrabold uppercase px-3 py-1.5 rounded-md bg-brand-primary text-white shadow-sm z-10">
            {post.category}
          </span>
          {post.readTime && (
            <span className="absolute top-4 right-4 text-[9px] font-bold px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white shadow-sm z-10">
              {post.readTime}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-brand-secondary" />
              <span>{formatDate(post.date)}</span>
            </div>
            {post.author && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">By {post.author.name}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-snug mb-3 line-clamp-2 group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors">
            {post.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Read Article Action */}
      <div className="px-6 pb-6 pt-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary dark:text-brand-secondary group-hover:text-brand-accent transition-colors">
          Read Article
          <ArrowRight size={14} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
        </span>
      </div>
    </article>
  );
};


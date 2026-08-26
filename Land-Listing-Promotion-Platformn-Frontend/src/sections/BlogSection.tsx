import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { BlogCard } from '@/components/ui/BlogCard';
import { blogPosts } from '@/data/blog';
import { ArrowRight } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section id="blog" className="pt-10 pb-28 sm:pb-36 bg-gradient-to-b from-white via-slate-50 to-[#54B5BB]/10 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Container>
        <div className="relative z-10 text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Latest News &amp; Insights</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-lg mx-auto">Tips, market trends, and expert real estate guides for buyers and sellers across Rwanda.</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* View More Articles Button */}
        <div className="relative z-10 flex justify-center mt-10 mb-2">
          <Link to="/blog">
            <button className="group flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer">
              View More Articles
              <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </Container>
    </section>
  );
};

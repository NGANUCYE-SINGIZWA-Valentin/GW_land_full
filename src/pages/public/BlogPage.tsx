import React, { useState, useMemo } from 'react';
import { Container } from '@/components/ui/Container';
import { BlogCard } from '@/components/ui/BlogCard';
import { blogPosts, BlogPost } from '@/data/blog';
import { SEO } from '@/components/seo/SEO';
import { Search, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import blogHeroImage from '@/assets/blog.jpg';

const CATEGORIES = [
  'All Articles',
  'Buying Guide',
  'Market Insights',
  'Selling Tips',
  'Property Investment',
  'Legal & Permits',
  'Architecture & Design',
];

export const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Articles');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const featuredPost = useMemo(() => {
    return blogPosts.find((p) => p.featured) || blogPosts[0];
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All Articles' || post.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-24">
      <SEO pageKey="blog" />

      {/* Hero Header Section */}
      <section className="relative pt-12 pb-14 text-white overflow-hidden">
        {/* Background Hero Image - Crisp & Normally Visible */}
        <img
          src={blogHeroImage}
          alt="GW Homes Real Estate Journal"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-slate-950/70" />

        <Container className="relative z-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight mb-2 drop-shadow-md">
            GW Homes Real Estate Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 max-w-lg mx-auto font-medium leading-relaxed mb-6 drop-shadow-sm">
            Market trends and property guides across Kigali &amp; Rwanda.
          </p>

          {/* Search Input Box */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by topic, keyword, or guide..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-semibold shadow-xl border border-white/30 focus:outline-none focus:ring-4 focus:ring-brand-secondary/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container className="pt-12">
        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-10">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured Story Banner (Only shown when no search query is active) */}
        {!searchQuery && selectedCategory === 'All Articles' && featuredPost && (
          <div className="mb-14 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 group">
            <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden">
              <img
                src={featuredPost.imageUrl}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-brand-primary text-white shadow-md">
                Featured Story
              </span>
            </div>
            <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-3">
                  <span className="text-brand-secondary font-bold uppercase tracking-wider">{featuredPost.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={13} /> {featuredPost.date}
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
              </div>

              {featuredPost.author && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{featuredPost.author.name}</p>
                    <p className="text-[11px] text-slate-400">{featuredPost.author.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Articles Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8">
            <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No articles found</h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
              We couldn't find any articles matching your search query. Try searching with different keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Articles');
              }}
              className="text-xs font-bold text-brand-primary dark:text-brand-secondary hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  readTime?: string;
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '5 Crucial Verification Steps Before Buying Land in Rwanda',
    excerpt: 'From title deed verification at RLA to zoning master plan permits in Kigali, here is what every land buyer must check before signing a contract.',
    category: 'Buying Guide',
    date: 'June 18, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    featured: true,
    author: {
      name: 'Eric Nkurunziza',
      role: 'Senior Legal & Land Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: '2',
    title: 'Kigali Real Estate Market Analysis: H2 2026 Growth Trends',
    excerpt: 'A comprehensive review of residential and commercial property valuation shifts across Nyarutarama, Kiyovu, Kicukiro, and Gacuriro.',
    category: 'Market Insights',
    date: 'June 10, 2026',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=900&q=80',
    featured: false,
    author: {
      name: 'Marie Claire Uwineza',
      role: 'Head of Market Research',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: '3',
    title: 'Staging & Photography Tips to Sell Your Property Faster',
    excerpt: 'High-impact presentation strategies, professional photo angles, and pricing models that attract serious international and local buyers.',
    category: 'Selling Tips',
    date: 'May 28, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    featured: false,
    author: {
      name: 'David Kayitare',
      role: 'Real Estate Marketing Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: '4',
    title: 'Investing in Commercial Spaces in Kigali’s CBD',
    excerpt: 'Why high-grade commercial and retail developments in central Kigali are yielding strong annual rental returns for property investors.',
    category: 'Property Investment',
    date: 'May 15, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    featured: false,
    author: {
      name: 'Alain Nshuti',
      role: 'Investment Portfolio Manager',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: '5',
    title: 'Understanding Kigali City Master Plan 2050 Zoning Rules',
    excerpt: 'How building density guidelines, eco-friendly construction mandates, and commercial zoning laws impact current and future landowners.',
    category: 'Legal & Permits',
    date: 'April 30, 2026',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    featured: false,
    author: {
      name: 'Eric Nkurunziza',
      role: 'Senior Legal & Land Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: '6',
    title: 'Modern Villa Architecture Trends in Rwanda’s Urban Hills',
    excerpt: 'Sustainable materials, solar integration, and panoramic hill glass walls are reshaping luxury residential architecture in Kigali.',
    category: 'Architecture & Design',
    date: 'April 14, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    featured: false,
    author: {
      name: 'Marie Claire Uwineza',
      role: 'Head of Market Research',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
  },
];

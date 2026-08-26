export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  feedback: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alice Uwimana',
    role: 'Homeowner, Kiyovu',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    feedback: 'GW Homes made buying our first home in Kigali effortless. The agent was responsive, the listing was accurate, and we closed within weeks.',
  },
  {
    id: '2',
    name: 'David Mugisha',
    role: 'Investor, Nyarutarama',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    feedback: 'I have purchased three plots through this platform. Every transaction was transparent, and the team always answered my questions quickly.',
  },
  {
    id: '3',
    name: 'Grace Ingabire',
    role: 'Seller, Remera',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    feedback: 'Listing my apartment was simple and the wizard walked me through every step. I had serious inquiries within days of publishing.',
  },
  {
    id: '4',
    name: 'Patrick Nkurunziza',
    role: 'Tenant, Kimihurura',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    feedback: 'The interactive map and detailed filters helped me find a place near my office in under an hour of browsing. Highly recommend.',
  },
];

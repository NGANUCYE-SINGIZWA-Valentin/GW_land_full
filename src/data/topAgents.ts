export interface TopAgent {
    id: string;
    name: string;
    avatar: string;
    email: string;
    phone: string;
    totalListings: number;
    totalViews: string;
    totalInquiries: number;
    revenue: string;
    badge: 'Top Seller' | 'Expert' | 'Rising Star' | 'Active';
    badgeStyle: string;
    joinDate: string;
    location: string;
}

export const TOP_AGENTS: TopAgent[] = [
    {
        id: '1',
        name: 'Diana Clark',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        email: 'diana.clark@example.com',
        phone: '+250 788 123 456',
        totalListings: 120,
        totalViews: '45,230',
        totalInquiries: 342,
        revenue: '$2,450,000',
        badge: 'Top Seller',
        badgeStyle: 'bg-orange-50 text-orange-600',
        joinDate: '2022-03-15',
        location: 'Kigali, Rwanda'
    },
    {
        id: '2',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        email: 'john.doe@example.com',
        phone: '+250 722 987 654',
        totalListings: 98,
        totalViews: '38,450',
        totalInquiries: 256,
        revenue: '$1,890,000',
        badge: 'Expert',
        badgeStyle: 'bg-blue-50 text-blue-600',
        joinDate: '2022-06-20',
        location: 'Kigali, Rwanda'
    },
    {
        id: '3',
        name: 'Sarah Smith',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        email: 'sarah.smith@example.com',
        phone: '+250 733 456 789',
        totalListings: 75,
        totalViews: '28,900',
        totalInquiries: 189,
        revenue: '$1,245,000',
        badge: 'Rising Star',
        badgeStyle: 'bg-cyan-50 text-cyan-600',
        joinDate: '2023-01-10',
        location: 'Kigali, Rwanda'
    },
    {
        id: '4',
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        email: 'mike.johnson@example.com',
        phone: '+250 744 321 098',
        totalListings: 62,
        totalViews: '22,100',
        totalInquiries: 145,
        revenue: '$980,000',
        badge: 'Active',
        badgeStyle: 'bg-slate-50 text-slate-600',
        joinDate: '2023-05-05',
        location: 'Kigali, Rwanda'
    },
    {
        id: '5',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        email: 'emma.wilson@example.com',
        phone: '+250 755 789 012',
        totalListings: 54,
        totalViews: '19,800',
        totalInquiries: 128,
        revenue: '$850,000',
        badge: 'Active',
        badgeStyle: 'bg-slate-50 text-slate-600',
        joinDate: '2023-07-22',
        location: 'Kigali, Rwanda'
    },
    {
        id: '6',
        name: 'James Brown',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
        email: 'james.brown@example.com',
        phone: '+250 766 234 567',
        totalListings: 48,
        totalViews: '16,500',
        totalInquiries: 112,
        revenue: '$720,000',
        badge: 'Rising Star',
        badgeStyle: 'bg-cyan-50 text-cyan-600',
        joinDate: '2023-09-14',
        location: 'Kigali, Rwanda'
    },
    {
        id: '7',
        name: 'Lisa Anderson',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=100&q=80',
        email: 'lisa.anderson@example.com',
        phone: '+250 777 890 123',
        totalListings: 41,
        totalViews: '14,200',
        totalInquiries: 98,
        revenue: '$640,000',
        badge: 'Active',
        badgeStyle: 'bg-slate-50 text-slate-600',
        joinDate: '2023-11-30',
        location: 'Kigali, Rwanda'
    },
    {
        id: '8',
        name: 'Robert Taylor',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f15?auto=format&fit=crop&w=100&q=80',
        email: 'robert.taylor@example.com',
        phone: '+250 788 567 890',
        totalListings: 36,
        totalViews: '11,800',
        totalInquiries: 85,
        revenue: '$520,000',
        badge: 'Active',
        badgeStyle: 'bg-slate-50 text-slate-600',
        joinDate: '2024-01-18',
        location: 'Kigali, Rwanda'
    }
];

export const getTopAgentById = (id: string): TopAgent | undefined => {
    return TOP_AGENTS.find(agent => agent.id === id);
};
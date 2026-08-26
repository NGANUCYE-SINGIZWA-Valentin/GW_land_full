// Shared data source for dashboard properties
// Used by AdminDashboard, SubAdminDashboard, PropertyManagement, SellerPropertyManagement, etc.

export interface DashboardProperty {
    id: string;
    name: string;
    image: string;
    location: string;
    cost: string;
    land: string;
    type: 'Residential' | 'Villa' | 'Commercial' | 'Apartment';
    units: number;
    activeListings: number;
    views: string;
    status: 'Active' | 'Pending' | 'Sold';
    featured: boolean;
}

export const DASHBOARD_PROPERTIES: DashboardProperty[] = [
    {
        id: '1',
        name: 'Oceanview Apartments',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&q=80',
        location: 'Miami, FL',
        cost: '$2,450,000',
        land: '24 sqft',
        type: 'Residential',
        units: 24,
        activeListings: 8,
        views: '1,234',
        status: 'Active',
        featured: false
    },
    {
        id: '2',
        name: 'Sunset Villas',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&q=80',
        location: 'Lincoln, CA',
        cost: '$3,100,000',
        land: '12 sqft',
        type: 'Villa',
        units: 12,
        activeListings: 4,
        views: '856',
        status: 'Pending',
        featured: false
    },
    {
        id: '3',
        name: 'Greenwood Estate',
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=150&q=80',
        location: 'Austin, TX',
        cost: '$1,250,000',
        land: '10 sqft',
        type: 'Residential',
        units: 1,
        activeListings: 0,
        views: '423',
        status: 'Active',
        featured: true
    },
    {
        id: '4',
        name: 'Downtown Office Tower',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&q=80',
        location: 'New York, NY',
        cost: '$8,750,000',
        land: '36 sqft',
        type: 'Commercial',
        units: 36,
        activeListings: 6,
        views: '2,345',
        status: 'Active',
        featured: false
    }
];

export const getDashboardPropertyById = (id: string): DashboardProperty | undefined => {
    return DASHBOARD_PROPERTIES.find(p => p.id === id);
};
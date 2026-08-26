export interface Agent {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
}

export const agents: Agent[] = [
  {
    id: '1',
    name: 'Jean Pierre Habimana',
    role: 'CEO & Founder',
    avatarUrl: '/assets/images/Person1.jpg',
    phone: '+250 788 123 456',
    whatsapp: '+250 788 123 456',
    email: 'jeanpierre@gwland.rw',
  },
  {
    id: '2',
    name: 'Eric Nshimiyimana',
    role: 'Senior Agent',
    avatarUrl: '/assets/images/Person2.jpg',
    phone: '+250 733 456 789',
    whatsapp: '+250 733 456 789',
    email: 'eric@gwland.rw',
  },
  {
    id: '3',
    name: 'Marie Claire Uwase',
    role: 'Head of Sales',
    avatarUrl: '/assets/images/Person3.jpg',
    phone: '+250 722 987 654',
    whatsapp: '+250 722 987 654',
    email: 'marieclaire@gwland.rw',
  },
];

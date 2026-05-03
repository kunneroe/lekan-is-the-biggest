export const MOCK_USER = {
  name: 'John Doe',
  phone: '+234 812 345 6789',
  email: 'john.doe@example.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
};

export const MOCK_SAVED_ADDRESSES = [
  {
    id: 'addr-home',
    label: 'Home',
    line: 'Plot 12, Lekki Phase 1, Lagos State, Nigeria',
  },
  {
    id: 'addr-office',
    label: 'Office',
    line: '15 Admiralty Way, Lekki, Lagos State, Nigeria',
  },
  {
    id: 'addr-other',
    label: 'Parents',
    line: '8 Allen Avenue, Ikeja, Lagos State, Nigeria',
  },
] as const;

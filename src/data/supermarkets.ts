export type Supermarket = {
  id: string;
  name: string;
  rating: number;
  area: string;
  etaMin: number;
  etaMax: number;
  deliveryFee: number;
  image: string;
};

export const SUPERMARKETS: Supermarket[] = [
  {
    id: '1',
    name: 'Shoprite Ikeja City Mall',
    rating: 4.5,
    area: 'Ikeja',
    etaMin: 25,
    etaMax: 35,
    deliveryFee: 500,
    image:
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  },
  {
    id: '2',
    name: 'Spar Lekki',
    rating: 4.2,
    area: 'Lekki',
    etaMin: 15,
    etaMax: 20,
    deliveryFee: 300,
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
  {
    id: '3',
    name: 'Market Square Ikoyi',
    rating: 4.7,
    area: 'Ikoyi',
    etaMin: 30,
    etaMax: 40,
    deliveryFee: 600,
    image:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d31?w=800&q=80',
  },
  {
    id: '4',
    name: 'Justrite Egbeda',
    rating: 4.0,
    area: 'Egbeda',
    etaMin: 20,
    etaMax: 30,
    deliveryFee: 400,
    image:
      'https://images.unsplash.com/photo-1588964895597-cfccd6a2dc9b?w=800&q=80',
  },
  {
    id: '5',
    name: 'Prince Ebeano Supermarket',
    rating: 4.8,
    area: 'Lekki',
    etaMin: 10,
    etaMax: 15,
    deliveryFee: 200,
    image:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80',
  },
  {
    id: '6',
    name: 'FoodCo Ibadan',
    rating: 4.3,
    area: 'Ibadan',
    etaMin: 45,
    etaMax: 60,
    deliveryFee: 1000,
    image:
      'https://images.unsplash.com/photo-1610832958506-aa5636816cf9?w=800&q=80',
  },
];

export const CATEGORY_ITEMS = [
  { id: 'groceries', label: 'Groceries', icon: 'basket-outline' as const },
  { id: 'drinks', label: 'Drinks', icon: 'wine-outline' as const },
  { id: 'snacks', label: 'Snacks', icon: 'fast-food-outline' as const },
  { id: 'toiletries', label: 'Toiletries', icon: 'color-filter-outline' as const },
  { id: 'household', label: 'Household', icon: 'home-outline' as const },
  { id: 'frozen', label: 'Frozen', icon: 'snow-outline' as const },
  { id: 'baby', label: 'Baby', icon: 'balloon-outline' as const },
  { id: 'cleaning', label: 'Cleaning', icon: 'brush-outline' as const },
] as const;

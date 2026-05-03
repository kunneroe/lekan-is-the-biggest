import type { Supermarket } from './supermarkets';

export type CategoryId = string;

export type Product = {
  id: string;
  storeId: string;
  name: string;
  price: number;
  categoryId: CategoryId;
  unit: string;
  image: string | null;
  description: string;
};

const PLACEHOLDER = null;

const mk = (
  id: string,
  storeId: string,
  name: string,
  price: number,
  categoryId: CategoryId,
  unit: string,
  image: string | null,
  description: string,
): Product => ({
  id,
  storeId,
  name,
  price,
  categoryId,
  unit,
  image,
  description,
});

/** Unique products per supermarket (mock inventory). */
const CATALOG: Product[] = [
  // Shoprite 1
  mk('p1-1', '1', "Kellogg's Corn Flakes (500g)", 3500, 'groceries', '500g', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&q=80', 'Crispy breakfast cereal.'),
  mk('p1-2', '1', 'Fresh Gala Apples', 2400, 'groceries', '1kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', 'Crisp red apples.'),
  mk('p1-3', '1', 'Coca-Cola Classic', 250, 'drinks', '50cl', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80', 'Chilled soft drink.'),
  mk('p1-4', '1', 'Full Cream Milk', 1200, 'groceries', '1L', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', 'Fresh dairy milk.'),
  mk('p1-5', '1', 'Baby Diapers Pack', 4500, 'baby', 'Medium', PLACEHOLDER, 'Hypoallergenic diapers.'),
  mk('p1-6', '1', 'Dish Soap', 800, 'cleaning', '750ml', PLACEHOLDER, 'Cuts grease fast.'),
  // Spar 2
  mk('p2-1', '2', 'Plantain Chips', 450, 'snacks', '150g', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80', 'Crunchy plantain snack.'),
  mk('p2-2', '2', 'Bottled Water', 200, 'drinks', '75cl', PLACEHOLDER, 'Pure table water.'),
  mk('p2-3', '2', 'Toothpaste', 1200, 'toiletries', '100g', PLACEHOLDER, 'Fluoride protection.'),
  mk('p2-4', '2', 'Frozen Chicken', 5200, 'frozen', '1kg', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80', 'IQF chicken portions.'),
  mk('p2-5', '2', 'Paper Towels', 1800, 'household', '6 rolls', PLACEHOLDER, 'Absorbent kitchen rolls.'),
  mk('p2-6', '2', 'Tomatoes (5kg)', 4500, 'groceries', '5kg', 'https://images.unsplash.com/photo-1546470427-e262649bba83?w=400&q=80', 'Vine-ripened tomatoes.'),
  // Market Square 3
  mk('p3-1', '3', 'Basmati Rice', 8500, 'groceries', '5kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 'Long grain rice.'),
  mk('p3-2', '3', 'Orange Juice', 1500, 'drinks', '1L', PLACEHOLDER, 'No added sugar.'),
  mk('p3-3', '3', 'Shower Gel', 2200, 'toiletries', '500ml', PLACEHOLDER, 'Refreshing citrus.'),
  mk('p3-4', '3', 'Ice Cream Vanilla', 2800, 'frozen', '1L', PLACEHOLDER, 'Creamy vanilla tub.'),
  mk('p3-5', '3', 'Baby Formula', 12000, 'baby', '800g', PLACEHOLDER, 'Stage 1 infant formula.'),
  mk('p3-6', '3', 'Bleach', 900, 'cleaning', '1L', PLACEHOLDER, 'Household disinfectant.'),
  // Justrite 4
  mk('p4-1', '4', 'Yam Tubers', 3200, 'groceries', '2 pieces', 'https://images.unsplash.com/photo-1590165482129-1a175a851bc6?w=400&q=80', 'Fresh yams.'),
  mk('p4-2', '4', 'Energy Drink', 350, 'drinks', '25cl', PLACEHOLDER, 'Boost energy.'),
  mk('p4-3', '4', 'Soap Bar', 400, 'toiletries', '3 pack', PLACEHOLDER, 'Antibacterial.'),
  mk('p4-4', '4', 'Frozen Peas', 1100, 'frozen', '400g', PLACEHOLDER, 'Garden peas.'),
  mk('p4-5', '4', 'Trash Bags', 1500, 'household', '30 pcs', PLACEHOLDER, 'Heavy duty.'),
  mk('p4-6', '4', 'Potato Chips', 600, 'snacks', '150g', PLACEHOLDER, 'Salted crisps.'),
  // Ebeano 5
  mk('p5-1', '5', 'Fresh Spinach', 1250, 'groceries', '250g', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', 'Organic baby spinach.'),
  mk('p5-2', '5', 'Malt Drink', 400, 'drinks', '33cl', PLACEHOLDER, 'Non-alcoholic malt.'),
  mk('p5-3', '5', 'Deodorant', 1800, 'toiletries', '150ml', PLACEHOLDER, '48h protection.'),
  mk('p5-4', '5', 'Fish Fingers', 2200, 'frozen', '300g', PLACEHOLDER, 'Breaded cod.'),
  mk('p5-5', '5', 'Baby Wipes', 900, 'baby', '80 pcs', PLACEHOLDER, 'Sensitive skin.'),
  mk('p5-6', '5', 'Floor Cleaner', 1300, 'cleaning', '1L', PLACEHOLDER, 'Citrus fresh.'),
  // FoodCo 6
  mk('p6-1', '6', 'Garri (2kg)', 2800, 'groceries', '2kg', PLACEHOLDER, 'White garri Ijebu.'),
  mk('p6-2', '6', 'Zobo Drink', 500, 'drinks', '50cl', PLACEHOLDER, 'Hibiscus refreshment.'),
  mk('p6-3', '6', 'Body Lotion', 2500, 'toiletries', '400ml', PLACEHOLDER, 'Shea butter blend.'),
  mk('p6-4', '6', 'Mixed Vegetables', 1600, 'frozen', '1kg', PLACEHOLDER, 'Stir-fry mix.'),
  mk('p6-5', '6', 'Air Freshener', 1400, 'household', '300ml', PLACEHOLDER, 'Linen scent.'),
  mk('p6-6', '6', 'Chin Chin', 800, 'snacks', '200g', PLACEHOLDER, 'Crunchy snack.'),
];

export function getProductsForStore(storeId: string): Product[] {
  return CATALOG.filter((p) => p.storeId === storeId);
}

export function getProduct(storeId: string, productId: string): Product | undefined {
  return CATALOG.find((p) => p.storeId === storeId && p.id === productId);
}

export function getProductById(productId: string): Product | undefined {
  return CATALOG.find((p) => p.id === productId);
}

export function getCategoryLabel(categoryId: string): string {
  const map: Record<string, string> = {
    groceries: 'Groceries',
    drinks: 'Drinks',
    snacks: 'Snacks',
    toiletries: 'Toiletries',
    household: 'Household',
    frozen: 'Frozen',
    baby: 'Baby',
    cleaning: 'Cleaning',
  };
  return map[categoryId] ?? categoryId;
}

export const POPULAR_CATEGORY_IDS = ['groceries', 'drinks', 'snacks'] as const;

export function getStoreDeliveryFee(store: Supermarket): number {
  return store.deliveryFee;
}

import type { Ionicons } from '@expo/vector-icons';

/** Backend PaymentMethod enum values used at checkout. */
export type BackendPaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'PAY_ON_DELIVERY';

export type ApiSupermarket = {
  id: string;
  name: string;
  imageUrl?: string | null;
  image?: string | null;
  etaMinMinutes?: number | null;
  etaMaxMinutes?: number | null;
  etaMin?: number | null;
  etaMax?: number | null;
  deliveryFee?: number | string | null;
  rating?: number | string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
};

export type ApiProduct = {
  id: string;
  name: string;
  price?: number | string | null;
  unit?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; slug?: string } | null;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type ApiCartItem = {
  id: string;
  quantity: number;
  unitPrice?: number | string | null;
  lineTotal?: number | string | null;
  product?: ApiProduct | null;
};

const CATEGORY_ICON_BY_SLUG: Record<string, keyof typeof Ionicons.glyphMap> = {
  groceries: 'basket-outline',
  drinks: 'wine-outline',
  snacks: 'fast-food-outline',
  toiletries: 'color-filter-outline',
  household: 'home-outline',
  'frozen-foods': 'snow-outline',
  frozen: 'snow-outline',
  'baby-products': 'balloon-outline',
  baby: 'balloon-outline',
  'cleaning-items': 'brush-outline',
  cleaning: 'brush-outline',
  'personal-care': 'heart-outline',
};

const PAYMENT_METHOD_MAP: Record<string, BackendPaymentMethod> = {
  card: 'CARD',
  transfer: 'BANK_TRANSFER',
  pod: 'PAY_ON_DELIVERY',
};

export function mapPaymentMethodToBackend(uiId: string): BackendPaymentMethod {
  return PAYMENT_METHOD_MAP[uiId] ?? 'CARD';
}

export function getSupermarketImageUrl(store: ApiSupermarket | null | undefined): string | null {
  if (!store) return null;
  return store.imageUrl ?? store.image ?? null;
}

export function getSupermarketEta(store: ApiSupermarket | null | undefined): {
  min: number;
  max: number;
} {
  const min = Number(store?.etaMinMinutes ?? store?.etaMin ?? 15);
  const max = Number(store?.etaMaxMinutes ?? store?.etaMax ?? 30);
  return { min, max };
}

export function getProductImageUrl(product: ApiProduct | null | undefined): string | null {
  if (!product) return null;
  return product.imageUrl ?? product.image ?? null;
}

export function getProductCategoryId(product: ApiProduct): string | null {
  return product.category?.id ?? product.categoryId ?? null;
}

export function getProductCategoryName(product: ApiProduct): string {
  return product.category?.name ?? 'General';
}

export function getCartItemImageUrl(item: ApiCartItem): string | null {
  return getProductImageUrl(item.product ?? undefined);
}

export function getCartUnitPrice(item: ApiCartItem): number {
  if (item.unitPrice != null) return Number(item.unitPrice);
  return Number(item.product?.price ?? 0);
}

export function getCartLineTotal(item: ApiCartItem): number {
  if (item.lineTotal != null) return Number(item.lineTotal);
  return getCartUnitPrice(item) * Number(item.quantity ?? 0);
}

export function parseCategoriesResponse(data: unknown): ApiCategory[] {
  if (!data || typeof data !== 'object') return [];
  const root = data as Record<string, unknown>;
  const categories = root.categories;

  if (Array.isArray(categories)) return categories as ApiCategory[];

  if (categories && typeof categories === 'object') {
    const nested = categories as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as ApiCategory[];
  }

  if (Array.isArray(root.data)) return root.data as ApiCategory[];

  return [];
}

export function getCategoryIcon(
  slug: string,
): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICON_BY_SLUG[slug.toLowerCase()] ?? 'grid-outline';
}

export function toCategoryGridItems(categories: ApiCategory[]) {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: getCategoryIcon(cat.slug),
  }));
}

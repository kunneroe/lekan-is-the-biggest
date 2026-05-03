import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import type { Product } from '../data/products';
import { getProduct, getStoreDeliveryFee } from '../data/products';
import { MOCK_SAVED_ADDRESSES, MOCK_USER } from '../data/mockUser';
import { SUPERMARKETS, type Supermarket } from '../data/supermarkets';
import { showToast } from './ToastContext';

export type CartLine = {
  lineId: string;
  productId: string;
  storeId: string;
  qty: number;
  product: Product;
};

export type OrderStatus =
  | 'active'
  | 'delivered'
  | 'cancelled';

export type MockOrder = {
  id: string;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  /** 0..5 matching tracking steps */
  stepIndex: number;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  addressLabel: string;
  addressLine: string;
  deliveryNote: string;
  paymentMethod: string;
  createdAt: string;
  etaMins: number;
  rider: {
    name: string;
    vehicle: string;
    plate: string;
    rating: number;
  };
};

const SERVICE_FEE_RATE = 0.04;

const TRACKING_STEPS = [
  'Confirmed',
  'Preparing',
  'Rider Assigned',
  'Picked Up',
  'On the Way',
  'Delivered',
] as const;

type DemoContextValue = {
  user: typeof MOCK_USER;
  savedAddresses: typeof MOCK_SAVED_ADDRESSES;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  cartLines: CartLine[];
  cartStoreId: string | null;
  cartItemCount: number;
  addToCart: (storeId: string, product: Product, qty?: number) => void;
  updateLineQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartServiceFee: number;
  cartTotal: number;
  getSupermarket: (id: string) => Supermarket | undefined;
  orders: MockOrder[];
  placeOrder: (input: {
    storeId: string;
    addressLabel: string;
    addressLine: string;
    deliveryNote: string;
    paymentMethod: string;
  }) => string;
  advanceOrderStep: (orderId: string) => void;
  favoriteIds: Set<string>;
  toggleFavorite: (productId: string) => void;
  trackingSteps: readonly string[];
};

const DemoContext = createContext<DemoContextValue | null>(null);

function genId() {
  return `GS-${Date.now().toString(36).toUpperCase()}`;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    MOCK_SAVED_ADDRESSES[0].id,
  );
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartStoreId, setCartStoreId] = useState<string | null>(null);
  const [orders, setOrders] = useState<MockOrder[]>(() => [
    {
      id: 'GS-DEMO-PAST',
      storeId: '2',
      storeName: 'Spar Lekki',
      status: 'delivered',
      stepIndex: 5,
      lines: [],
      subtotal: 8200,
      deliveryFee: 300,
      serviceFee: 150,
      total: 8650,
      addressLabel: 'Home',
      addressLine: MOCK_SAVED_ADDRESSES[0].line,
      deliveryNote: 'Leave at reception',
      paymentMethod: 'Debit/Credit Card',
      createdAt: 'Nov 24, 2023',
      etaMins: 0,
      rider: {
        name: 'Emeka',
        vehicle: 'Bike',
        plate: 'LAG-001-AA',
        rating: 4.8,
      },
    },
  ]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(['p1-1', 'p5-1', 'p2-6']),
  );

  const getSupermarket = useCallback((id: string) => {
    return SUPERMARKETS.find((s) => s.id === id);
  }, []);

  const cartSubtotal = useMemo(
    () => cartLines.reduce((s, l) => s + l.product.price * l.qty, 0),
    [cartLines],
  );

  const cartDeliveryFee = useMemo(() => {
    if (!cartStoreId || cartLines.length === 0) return 0;
    const store = getSupermarket(cartStoreId);
    return store ? getStoreDeliveryFee(store) : 0;
  }, [cartStoreId, cartLines.length, getSupermarket]);

  const cartServiceFee = useMemo(
    () => Math.round(cartSubtotal * SERVICE_FEE_RATE),
    [cartSubtotal],
  );

  const cartTotal = useMemo(
    () => cartSubtotal + cartDeliveryFee + cartServiceFee,
    [cartSubtotal, cartDeliveryFee, cartServiceFee],
  );

  const cartItemCount = useMemo(
    () => cartLines.reduce((n, l) => n + l.qty, 0),
    [cartLines],
  );

  const addToCart = useCallback(
    (storeId: string, product: Product, qty: number = 1) => {
      if (cartStoreId && cartStoreId !== storeId && cartLines.length > 0) {
        Alert.alert(
          'Different supermarket',
          'Your cart has items from another store. Clear the cart to add items from this store?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear & add',
              onPress: () => {
                setCartLines([
                  {
                    lineId: `${product.id}-${Date.now()}`,
                    productId: product.id,
                    storeId,
                    qty,
                    product,
                  },
                ]);
                setCartStoreId(storeId);
                showToast(
                  qty > 1
                    ? `Switched store · ${qty}× ${product.name} added`
                    : `Switched store · ${product.name} added`,
                );
              },
            },
          ],
        );
        return;
      }
      setCartStoreId(storeId);
      setCartLines((prev) => {
        const idx = prev.findIndex(
          (l) => l.productId === product.id && l.storeId === storeId,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [
          ...prev,
          {
            lineId: `${product.id}-${Date.now()}`,
            productId: product.id,
            storeId,
            qty,
            product,
          },
        ];
      });
      showToast(
        qty > 1
          ? `Added ${qty}× ${product.name} to cart`
          : `${product.name} added to cart`,
      );
    },
    [cartStoreId, cartLines.length],
  );

  const updateLineQty = useCallback((lineId: string, qty: number) => {
    if (qty < 1) return;
    setCartLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, qty } : l)),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setCartLines((prev) => {
      const removed = prev.find((l) => l.lineId === lineId);
      const next = prev.filter((l) => l.lineId !== lineId);
      if (next.length === 0) setCartStoreId(null);
      if (removed) {
        queueMicrotask(() =>
          showToast(`${removed.product.name} removed from cart`),
        );
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartLines([]);
    setCartStoreId(null);
  }, []);

  const placeOrder = useCallback(
    (input: {
      storeId: string;
      addressLabel: string;
      addressLine: string;
      deliveryNote: string;
      paymentMethod: string;
    }) => {
      const store = getSupermarket(input.storeId);
      if (!store || cartLines.length === 0) {
        Alert.alert('Cart empty', 'Add items before checkout.');
        return '';
      }
      const id = genId();
      const subtotal = cartLines.reduce(
        (s, l) => s + l.product.price * l.qty,
        0,
      );
      const deliveryFee = getStoreDeliveryFee(store);
      const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
      const total = subtotal + deliveryFee + serviceFee;
      const linesSnapshot = cartLines.map((l) => ({ ...l }));
      const order: MockOrder = {
        id,
        storeId: input.storeId,
        storeName: store.name,
        status: 'active',
        stepIndex: 3,
        lines: linesSnapshot,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        addressLabel: input.addressLabel,
        addressLine: input.addressLine,
        deliveryNote: input.deliveryNote,
        paymentMethod: input.paymentMethod,
        createdAt: new Date().toLocaleString('en-NG', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        etaMins: Math.round((store.etaMin + store.etaMax) / 2),
        rider: {
          name: 'Ibrahim',
          vehicle: 'Honda CB125',
          plate: 'ABC-123-XY',
          rating: 4.9,
        },
      };
      setOrders((o) => [order, ...o]);
      clearCart();
      return id;
    },
    [cartLines, clearCart, getSupermarket],
  );

  const advanceOrderStep = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = Math.min(o.stepIndex + 1, TRACKING_STEPS.length - 1);
        return {
          ...o,
          stepIndex: next,
          status: next >= 5 ? 'delivered' : 'active',
        };
      }),
    );
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const value = useMemo(
    (): DemoContextValue => ({
      user: MOCK_USER,
      savedAddresses: MOCK_SAVED_ADDRESSES,
      selectedAddressId,
      setSelectedAddressId,
      cartLines,
      cartStoreId,
      cartItemCount,
      addToCart,
      updateLineQty,
      removeLine,
      clearCart,
      cartSubtotal,
      cartDeliveryFee,
      cartServiceFee,
      cartTotal,
      getSupermarket,
      orders,
      placeOrder,
      advanceOrderStep,
      favoriteIds,
      toggleFavorite,
      trackingSteps: TRACKING_STEPS,
    }),
    [
      selectedAddressId,
      cartLines,
      cartStoreId,
      cartItemCount,
      addToCart,
      updateLineQty,
      removeLine,
      clearCart,
      cartSubtotal,
      cartDeliveryFee,
      cartServiceFee,
      cartTotal,
      getSupermarket,
      orders,
      placeOrder,
      advanceOrderStep,
      favoriteIds,
      toggleFavorite,
    ],
  );

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be inside DemoProvider');
  return ctx;
}

export function useOptionalProduct(storeId: string, productId: string) {
  return useMemo(
    () => getProduct(storeId, productId),
    [storeId, productId],
  );
}

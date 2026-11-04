import { useEffect, useState } from 'react';
import { cartService } from '../services/cartService';

/** Total quantity in the cart; refreshes whenever the cart changes. */
export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const fetchCount = async () => {
      try {
        const res = await cartService.getCart();
        const items = res.cart?.items || res.items || [];
        const n = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        if (alive) setCount(n);
      } catch {
        if (alive) setCount(0);
      }
    };
    fetchCount();
    const unsubscribe = cartService.subscribe(fetchCount);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return count;
}

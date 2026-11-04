import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from './AuthContext';

import { appAlert } from './DialogContext';
type FavoriteProduct = {
  id: string;
  name: string;
  price?: number | string | null;
  imageUrl?: string | null;
  image?: string | null;
  unit?: string | null;
  supermarketId?: string | null;
  supermarket?: { id: string; name: string } | null;
};

type Favorite = {
  id: string;
  productId: string;
  createdAt: string;
  product: FavoriteProduct;
};

type FavoriteContextValue = {
  favorites: Favorite[];
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
};

const FavoriteContext = createContext<FavoriteContextValue | null>(null);

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!isSignedIn) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const res = await favoriteService.getFavorites();
      const list: Favorite[] = res.data?.favorites ?? [];
      setFavorites(list);
      setFavoriteIds(new Set(list.map((f) => f.productId)));
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const wasAlreadyFavorited = favoriteIds.has(productId);

      // Optimistic update — flip immediately
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasAlreadyFavorited) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        if (wasAlreadyFavorited) {
          await favoriteService.removeFavorite(productId);
          setFavorites((prev) => prev.filter((f) => f.productId !== productId));
        } else {
          const res = await favoriteService.addFavorite(productId);
          const newFav: Favorite | undefined = res.data?.favorite;
          if (newFav) {
            setFavorites((prev) => [newFav, ...prev]);
          }
        }
      } catch (error) {
        // Revert optimistic update on failure
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasAlreadyFavorited) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
        appAlert('Error', 'Could not update favorites. Please try again.');
      }
    },
    [favoriteIds],
  );

  const value = useMemo(
    (): FavoriteContextValue => ({
      favorites,
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
      refreshFavorites,
    }),
    [favorites, favoriteIds, loading, isFavorite, toggleFavorite, refreshFavorites],
  );

  return (
    <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoriteContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoriteProvider');
  }
  return ctx;
}

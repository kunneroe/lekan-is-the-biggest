import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { addressService } from '../services/addressService';
import type { Address } from '../types/address';
import { pickDefaultAddressId } from '../utils/addressFormat';
import { parseApiError } from '../utils/parseApiError';
import { useAuth } from './AuthContext';

type AddressContextValue = {
  addresses: Address[];
  selectedAddressId: string | null;
  selectedAddress: Address | null;
  loading: boolean;
  setSelectedAddressId: (id: string | null) => void;
  refreshAddresses: () => Promise<void>;
  selectAddressAsDefault: (id: string) => Promise<void>;
};

const AddressContext = createContext<AddressContextValue | null>(null);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshAddresses = useCallback(async () => {
    if (!isSignedIn) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    setLoading(true);
    try {
      const res = await addressService.getAddresses();
      const list: Address[] = res.addresses ?? [];
      setAddresses(list);
      setSelectedAddressId((prev) => {
        if (prev && list.some((a) => a.id === prev)) return prev;
        return pickDefaultAddressId(list);
      });
    } catch (error) {
      console.error('Failed to load addresses:', parseApiError(error));
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refreshAddresses();
  }, [refreshAddresses]);

  const selectAddressAsDefault = useCallback(
    async (id: string) => {
      await addressService.setDefaultAddress(id);
      setSelectedAddressId(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
    },
    [],
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const value = useMemo(
    (): AddressContextValue => ({
      addresses,
      selectedAddressId,
      selectedAddress,
      loading,
      setSelectedAddressId,
      refreshAddresses,
      selectAddressAsDefault,
    }),
    [
      addresses,
      selectedAddressId,
      selectedAddress,
      loading,
      refreshAddresses,
      selectAddressAsDefault,
    ],
  );

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) {
    throw new Error('useAddresses must be used within AddressProvider');
  }
  return ctx;
}

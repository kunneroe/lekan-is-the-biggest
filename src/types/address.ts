/** Matches backend AddressLabel enum (Grocr_Backend/prisma/schema.prisma). */
export type AddressLabel = 'HOME' | 'OFFICE' | 'SCHOOL' | 'OTHER';

export type Address = {
  id: string;
  label: AddressLabel;
  labelOther?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country?: string;
  postalCode?: string | null;
  isDefault: boolean;
};

export type CreateAddressPayload = {
  label: AddressLabel;
  labelOther?: string;
  line1: string;
  city: string;
  state: string;
};

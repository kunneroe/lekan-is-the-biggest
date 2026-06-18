import type { Address, AddressLabel, CreateAddressPayload } from '../types/address';

const LABEL_DISPLAY: Record<AddressLabel, string> = {
  HOME: 'Home',
  OFFICE: 'Work',
  SCHOOL: 'School',
  OTHER: 'Other',
};

/** User-friendly label for HOME / Work (OFFICE) / OTHER / etc. */
export function formatAddressLabel(address: {
  label: string;
  labelOther?: string | null;
}): string {
  const key = address.label?.toUpperCase() as AddressLabel;
  if (key === 'OTHER') {
    return address.labelOther?.trim() || LABEL_DISPLAY.OTHER;
  }
  return LABEL_DISPLAY[key] ?? address.labelOther?.trim() ?? address.label;
}

export function formatAddressLine(address: {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string;
}): string {
  const parts = [address.line1.trim()];
  if (address.line2?.trim()) parts.push(address.line2.trim());
  const locality = [address.city.trim(), address.state?.trim()].filter(Boolean).join(', ');
  if (locality) parts.push(locality);
  return parts.join(', ');
}

/** Short line for home header, e.g. "Home, 123 Main St". */
export function formatAddressShortLine(address: Address): string {
  const street = address.line1.split(',')[0]?.trim() || address.line1;
  return `${formatAddressLabel(address)}, ${street}`;
}

/** Map free-text or preset title to backend create payload fields. */
export function buildCreateAddressPayload(
  title: string,
  street: string,
  city: string,
  state = 'Lagos',
): CreateAddressPayload {
  const trimmedTitle = title.trim();
  const normalized = trimmedTitle.toUpperCase();

  if (normalized === 'HOME') {
    return { label: 'HOME', line1: street.trim(), city: city.trim(), state: state.trim() };
  }
  if (normalized === 'WORK' || normalized === 'OFFICE') {
    return { label: 'OFFICE', line1: street.trim(), city: city.trim(), state: state.trim() };
  }
  if (normalized === 'SCHOOL') {
    return { label: 'SCHOOL', line1: street.trim(), city: city.trim(), state: state.trim() };
  }
  if (normalized === 'OTHER') {
    return { label: 'OTHER', line1: street.trim(), city: city.trim(), state: state.trim() };
  }

  return {
    label: 'OTHER',
    labelOther: trimmedTitle,
    line1: street.trim(),
    city: city.trim(),
    state: state.trim(),
  };
}

export function pickDefaultAddressId(addresses: Address[]): string | null {
  if (addresses.length === 0) return null;
  return addresses.find((a) => a.isDefault)?.id ?? addresses[0].id;
}

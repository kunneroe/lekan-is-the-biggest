export const colors = {
  background: '#FAF8F3',
  surface: '#FFFFFF',
  primary: '#006847',
  primaryDark: '#004D40',
  mint: '#E8F5E9',
  mintStrong: '#C8E6C9',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#9B9B9B',
  border: '#E0E8E3',
  open: '#2E7D32',
  star: '#C9A227',
  accentOrange: '#FF8C42',
  bannerOrange: '#FF9F43',
  danger: '#E53935',
  overlayWhite: 'rgba(255,255,255,0.92)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  greeting: { fontSize: 14, fontWeight: '400' as const },
  deliveryBold: { fontSize: 15, fontWeight: '700' as const },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const },
  link: { fontSize: 14, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  bannerTitle: { fontSize: 18, fontWeight: '700' as const },
  bannerSubtitle: { fontSize: 13, fontWeight: '400' as const },
  categoryLabel: { fontSize: 12, fontWeight: '500' as const },
  storeName: { fontSize: 16, fontWeight: '700' as const },
  meta: { fontSize: 13, fontWeight: '400' as const },
  deliveryFee: { fontSize: 13, fontWeight: '600' as const },
  tabLabel: { fontSize: 11, fontWeight: '600' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

export const categoryColors = {
  groceries:        { bg: '#E3F2E1', icon: '#2F6B3A' },
  drinks:           { bg: '#FDECD8', icon: '#C6742B' },
  snacks:           { bg: '#FDEBD3', icon: '#C77A1E' },
  toiletries:       { bg: '#FBE7EC', icon: '#B4436C' },
  household:        { bg: '#E3EEF7', icon: '#2C6E9E' },
  frozen:           { bg: '#E5F3F7', icon: '#2A7C93' },
  'frozen-foods':   { bg: '#E5F3F7', icon: '#2A7C93' },
  baby:             { bg: '#EFE7F7', icon: '#6A4A96' },
  'baby-products':  { bg: '#EFE7F7', icon: '#6A4A96' },
  cleaning:         { bg: '#F5E1DA', icon: '#B4552D' },
  'cleaning-items': { bg: '#F5E1DA', icon: '#B4552D' },
  'personal-care':  { bg: '#FBE7EC', icon: '#B4436C' },
  default:          { bg: '#EFEFEF', icon: '#666666' },
} as const;

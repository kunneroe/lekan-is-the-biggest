/**
 * Grabit design tokens.
 * Older keys (mint, bannerOrange, …) are kept so every screen keeps working —
 * they now point at Grabit brand colors.
 */
export const brand = {
  basil: '#0E7C4A',
  deepBasil: '#0A5C37',
  forest: '#0A2E1F',
  tomato: '#FF5A36',
  lime: '#C4F042',
  oat: '#FFF6E6',
  sand: '#F3EBDD',
} as const;

export const colors = {
  background: brand.oat,
  surface: '#FFFFFF',
  surfaceAlt: '#FBF7EF',
  primary: brand.basil,
  primaryDark: brand.deepBasil,
  forest: brand.forest,
  tomato: brand.tomato,
  tomatoTint: '#FFE8E1',
  lime: brand.lime,
  sand: brand.sand,
  mint: '#E7F3EA',
  mintStrong: '#CFE6D6',
  text: brand.forest,
  textSecondary: '#4A6357',
  textMuted: '#7F9087',
  textOnDark: brand.oat,
  border: '#EADFCB',
  open: brand.basil,
  star: '#F5A524',
  accentOrange: brand.tomato,
  bannerOrange: brand.tomato,
  danger: '#D93A1E',
  overlayWhite: 'rgba(255,255,255,0.94)',
  scrim: 'rgba(10,46,31,0.45)',
} as const;

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  black: 'DMSans_800ExtraBold',
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
  sm: 12,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const typography = {
  hero: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.8, lineHeight: 34 },
  title: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.5 },
  greeting: { fontFamily: fonts.medium, fontSize: 14 },
  deliveryBold: { fontFamily: fonts.bold, fontSize: 15 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4 },
  link: { fontFamily: fonts.bold, fontSize: 14 },
  body: { fontFamily: fonts.regular, fontSize: 15 },
  caption: { fontFamily: fonts.medium, fontSize: 12 },
  bannerTitle: { fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.4, lineHeight: 24 },
  bannerSubtitle: { fontFamily: fonts.regular, fontSize: 13 },
  categoryLabel: { fontFamily: fonts.semibold, fontSize: 12 },
  storeName: { fontFamily: fonts.display, fontSize: 18, letterSpacing: -0.3 },
  meta: { fontFamily: fonts.regular, fontSize: 13 },
  deliveryFee: { fontFamily: fonts.bold, fontSize: 13 },
  tabLabel: { fontFamily: fonts.bold, fontSize: 11 },
  price: { fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.2 },
  button: { fontFamily: fonts.bold, fontSize: 16 },
} as const;

export const shadows = {
  card: {
    shadowColor: brand.forest,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: brand.forest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lifted: {
    shadowColor: brand.forest,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** Motion: DROP → GRAB → SETTLE. */
export const motion = {
  duration: { micro: 120, quick: 200, standard: 320, hero: 1800 },
  spring: {
    snap: { friction: 5, tension: 160 },
    settle: { friction: 8, tension: 90 },
  },
} as const;

export const categoryColors = {
  groceries:        { bg: '#E3F2E1', icon: '#1F6B3A' },
  drinks:           { bg: '#FDECD8', icon: '#A85A16' },
  snacks:           { bg: '#FFF1CC', icon: '#946200' },
  toiletries:       { bg: '#FBE7EC', icon: '#A33A62' },
  household:        { bg: '#E3EEF7', icon: '#245E88' },
  frozen:           { bg: '#E2F2F6', icon: '#1F6C80' },
  'frozen-foods':   { bg: '#E2F2F6', icon: '#1F6C80' },
  baby:             { bg: '#EFE7F7', icon: '#5E3F8A' },
  'baby-products':  { bg: '#EFE7F7', icon: '#5E3F8A' },
  cleaning:         { bg: '#FFE8E1', icon: '#B23E1E' },
  'cleaning-items': { bg: '#FFE8E1', icon: '#B23E1E' },
  'personal-care':  { bg: '#FBE7EC', icon: '#A33A62' },
  default:          { bg: '#F3EBDD', icon: '#4A6357' },
} as const;

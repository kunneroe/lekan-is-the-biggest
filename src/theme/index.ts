/**
 * Grabit design tokens — the Grab Bag logo in the signature green.
 * Green is the brand surface and the button colour; butter, sprout and a tomato
 * pop are the accents; forest ink is the text colour.
 */
export const brand = {
  /** signature green: headers, splash, app icon, buttons (white text passes contrast) */
  green: '#0E7C4A',
  /** a touch deeper, for text links and icons on light backgrounds */
  greenDeep: '#0B6B3F',
  /** pressed states and back layers */
  greenDark: '#0A5C37',
  /** text and dark surfaces */
  ink: '#17261E',
  /** accent: badges, highlights, the bag handle on dark */
  butter: '#FFC94D',
  /** the leaf, fresh highlights on green or ink */
  sprout: '#B9E83A',
  /** the tomato peeking out of the bag; warm pops */
  tomato: '#FF5A36',
  /** success / open / free */
  leaf: '#2E8B3E',
  /** app background */
  cream: '#FFF6EA',
  /** placeholders, tracks, quiet fills */
  sand: '#F4EBDD',
} as const;

export const colors = {
  background: brand.cream,
  surface: '#FFFFFF',
  surfaceAlt: '#FCF8F1',
  primary: brand.green,
  primaryDark: brand.greenDark,
  green: brand.green,
  ink: brand.ink,
  butter: brand.butter,
  sprout: brand.sprout,
  tomato: brand.tomato,
  leaf: brand.leaf,
  sand: brand.sand,
  /** soft green tint behind green icons and selected rows */
  tint: '#E7F3EA',
  tintStrong: '#CFE6D6',
  /** soft red tint for errors / cancelled states */
  redTint: '#FFE3DA',
  leafTint: '#E5F3E2',
  butterTint: '#FFF1CC',
  text: brand.ink,
  textSecondary: '#55605A',
  textMuted: '#8A928C',
  textOnBrand: '#FFFFFF',
  border: '#EADFCB',
  open: brand.leaf,
  star: '#F5A524',
  danger: '#B42318',
  overlayWhite: 'rgba(255,255,255,0.94)',
  scrim: 'rgba(23,38,30,0.5)',
} as const;

export const fonts = {
  display: 'Fredoka_700Bold',
  displayBold: 'Fredoka_600SemiBold',
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
  hero: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.3, lineHeight: 34 },
  title: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.2 },
  greeting: { fontFamily: fonts.medium, fontSize: 14 },
  deliveryBold: { fontFamily: fonts.bold, fontSize: 15 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.1 },
  link: { fontFamily: fonts.bold, fontSize: 14 },
  body: { fontFamily: fonts.regular, fontSize: 15 },
  caption: { fontFamily: fonts.medium, fontSize: 12 },
  bannerTitle: { fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.1, lineHeight: 24 },
  bannerSubtitle: { fontFamily: fonts.regular, fontSize: 13 },
  categoryLabel: { fontFamily: fonts.semibold, fontSize: 12 },
  storeName: { fontFamily: fonts.display, fontSize: 18, letterSpacing: -0.1 },
  meta: { fontFamily: fonts.regular, fontSize: 13 },
  deliveryFee: { fontFamily: fonts.bold, fontSize: 13 },
  tabLabel: { fontFamily: fonts.bold, fontSize: 11 },
  price: { fontFamily: fonts.display, fontSize: 17 },
  button: { fontFamily: fonts.bold, fontSize: 16 },
} as const;

export const shadows = {
  card: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lifted: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** Motion: DROP → BOUNCE → SPILL → SETTLE. */
export const motion = {
  duration: { micro: 120, quick: 200, standard: 320, hero: 1800 },
  spring: {
    snap: { friction: 5, tension: 160 },
    settle: { friction: 8, tension: 90 },
  },
} as const;

export const categoryColors = {
  default: { bg: brand.sand, icon: '#5F574E' },
} as const;

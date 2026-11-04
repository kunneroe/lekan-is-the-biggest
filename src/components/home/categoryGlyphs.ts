import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type Glyph = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * Category artwork: a modern filled glyph and a soft tint, matched from the
 * category's slug or name so new backend categories still get a sensible icon.
 * Order matters: the first rule whose keyword appears wins.
 */
const RULES: { words: string[]; glyph: Glyph; bg: string; fg: string }[] = [
  { words: ['baby', 'infant', 'kid'], glyph: 'baby-bottle', bg: '#EFE7F7', fg: '#5E3F8A' },
  { words: ['frozen', 'ice'], glyph: 'snowflake', bg: '#E2F2F6', fg: '#1F6C80' },
  { words: ['drink', 'beverage', 'juice', 'water', 'soda'], glyph: 'bottle-soda-classic', bg: '#FDECD8', fg: '#A85A16' },
  { words: ['wine', 'beer', 'spirit', 'alcohol'], glyph: 'glass-cocktail', bg: '#FCE4E4', fg: '#9B2C2C' },
  { words: ['snack', 'sweet', 'candy', 'biscuit', 'chocolate'], glyph: 'cookie', bg: '#FFF1CC', fg: '#946200' },
  { words: ['clean', 'detergent', 'laundry'], glyph: 'spray-bottle', bg: '#E3F1FB', fg: '#1F5F8B' },
  { words: ['toilet', 'tissue', 'hygiene'], glyph: 'paper-roll', bg: '#F1ECFA', fg: '#57458A' },
  { words: ['personal', 'beauty', 'care', 'cosmetic', 'skin'], glyph: 'lotion', bg: '#FBE7EC', fg: '#A33A62' },
  { words: ['household', 'home', 'kitchen'], glyph: 'home-variant', bg: '#E3EEF7', fg: '#245E88' },
  { words: ['bakery', 'bread', 'pastry'], glyph: 'baguette', bg: '#F8EBDA', fg: '#8A5A1F' },
  { words: ['dairy', 'milk', 'cheese', 'egg'], glyph: 'cheese', bg: '#FFF5D1', fg: '#8C6D00' },
  { words: ['meat', 'poultry', 'chicken', 'beef'], glyph: 'food-steak', bg: '#FDE5E0', fg: '#A63A24' },
  { words: ['fish', 'sea'], glyph: 'fish', bg: '#E0F1F4', fg: '#1E6A78' },
  { words: ['fruit', 'vegetable', 'veg', 'produce', 'fresh'], glyph: 'food-apple', bg: '#E3F2E1', fg: '#1F6B3A' },
  { words: ['grain', 'rice', 'cereal', 'pasta'], glyph: 'grain', bg: '#F6EEDB', fg: '#7A5B12' },
  { words: ['pet', 'dog', 'cat'], glyph: 'paw', bg: '#EEE8E2', fg: '#6B4F3A' },
  { words: ['health', 'pharm', 'medic'], glyph: 'pill', bg: '#E5F4EE', fg: '#17694A' },
  { words: ['spice', 'seasoning', 'condiment'], glyph: 'shaker-outline', bg: '#FBEADF', fg: '#9A4A16' },
  { words: ['grocer', 'pantry', 'food'], glyph: 'basket', bg: '#E3F2E1', fg: '#1F6B3A' },
];

const FALLBACK = { glyph: 'storefront-outline' as Glyph, bg: '#F3EBDD', fg: '#4A6357' };

export function categoryArt(slug?: string, name?: string) {
  const hay = `${slug ?? ''} ${name ?? ''}`.toLowerCase();
  const hit = RULES.find((r) => r.words.some((w) => hay.includes(w)));
  return hit ? { glyph: hit.glyph, bg: hit.bg, fg: hit.fg } : FALLBACK;
}

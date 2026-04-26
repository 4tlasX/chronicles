/**
 * Background texture images — black & white mix-in textures
 */

export interface BackgroundOption {
  value: string;
  thumb: string;
  label: string;
  bw?: boolean; // true = high-contrast B&W (lower opacity), false/undefined = grayscale (higher opacity)
  light?: boolean; // true = light-colored pattern (needs higher opacity to be visible)
  hidden?: boolean; // true = kept in the list but not shown in the picker
}

export const BACKGROUND_IMAGES: BackgroundOption[] = [
  { value: '', thumb: '', label: 'None' },

  // Wallpaper patterns
  { value: '/backgrounds/starburst-geo.png', thumb: '/backgrounds/thumbs/starburst-geo.png', label: 'Starburst Geo' },
  { value: '/backgrounds/willow-branches.png', thumb: '/backgrounds/thumbs/willow-branches.png', label: 'Willow Branches' },
  { value: '/backgrounds/teardrop-geo.jpg', thumb: '/backgrounds/thumbs/teardrop-geo.jpg', label: 'Teardrop Geo', light: true },
  { value: '/backgrounds/nouveau-fronds.jpg', thumb: '/backgrounds/thumbs/nouveau-fronds.jpg', label: 'Nouveau Fronds', light: true },
  { value: '/backgrounds/swallow-waves.jpg', thumb: '/backgrounds/thumbs/swallow-waves.jpg', label: 'Swallow Waves', light: true },
  { value: '/backgrounds/seigaiha-waves.jpg', thumb: '/backgrounds/thumbs/seigaiha-waves.jpg', label: 'Seigaiha Waves', light: true },

  // Patterns (high-contrast B&W)
  { value: '/backgrounds/stripes.png', thumb: '/backgrounds/stripes.png', label: 'Stripes', bw: true, hidden: true },
  { value: '/backgrounds/dots.png', thumb: '/backgrounds/dots.png', label: 'Dots', bw: true, hidden: true },
  { value: '/backgrounds/black-spots.png', thumb: '/backgrounds/black-spots.png', label: 'Black Spots', bw: true, hidden: true },
  { value: '/backgrounds/daisies.png', thumb: '/backgrounds/daisies.png', label: 'Daisies', bw: true, hidden: true },
  { value: '/backgrounds/flowers-2.png', thumb: '/backgrounds/flowers-2.png', label: 'Flowers', bw: true, hidden: true },
  { value: '/backgrounds/swans.png', thumb: '/backgrounds/swans.png', label: 'Swans', bw: true, hidden: true },
  { value: '/backgrounds/swifts.png', thumb: '/backgrounds/swifts.png', label: 'Swifts', bw: true, hidden: true },

  // Chronicles custom backgrounds
  { value: '/backgrounds/chronicles-bg-6.png', thumb: '/backgrounds/chronicles-bg-6.png', label: 'Chronicles VI', hidden: true },

  // Photography (grayscale)
  { value: '/backgrounds/birmingham-museums-trust-Bin0C2RtQpI-unsplash.jpg', thumb: '/backgrounds/thumbs/birmingham-museums-trust-Bin0C2RtQpI-unsplash.jpg', label: 'Birmingham Museums' },
  { value: '/backgrounds/hammam-fuad-0Kn_nFFPFVo-unsplash.jpg', thumb: '/backgrounds/thumbs/hammam-fuad-0Kn_nFFPFVo-unsplash.jpg', label: 'Hammam Fuad', hidden: true },

];

/**
 * Background texture images — black & white mix-in textures
 */

export interface BackgroundOption {
  value: string;
  thumb: string;
  label: string;
  bw?: boolean; // true = high-contrast B&W (lower opacity), false/undefined = grayscale (higher opacity)
  hidden?: boolean; // true = kept in the list but not shown in the picker
}

export const BACKGROUND_IMAGES: BackgroundOption[] = [
  { value: '', thumb: '', label: 'None' },

  // Patterns (high-contrast B&W)
  { value: '/backgrounds/stripes.png', thumb: '/backgrounds/stripes.png', label: 'Stripes', bw: true, hidden: true },
  { value: '/backgrounds/vertical-stripes.png', thumb: '/backgrounds/vertical-stripes.png', label: 'Vertical Stripes', bw: true },
  { value: '/backgrounds/dots.png', thumb: '/backgrounds/dots.png', label: 'Dots', bw: true, hidden: true },
  { value: '/backgrounds/dots-vertical-stripes.png', thumb: '/backgrounds/dots-vertical-stripes.png', label: 'Dots & Stripes', bw: true },
  { value: '/backgrounds/black-spots.png', thumb: '/backgrounds/black-spots.png', label: 'Black Spots', bw: true, hidden: true },
  { value: '/backgrounds/daisies.png', thumb: '/backgrounds/daisies.png', label: 'Daisies', bw: true, hidden: true },
  { value: '/backgrounds/flowers-2.png', thumb: '/backgrounds/flowers-2.png', label: 'Flowers', bw: true, hidden: true },
  { value: '/backgrounds/swans.png', thumb: '/backgrounds/swans.png', label: 'Swans', bw: true, hidden: true },
  { value: '/backgrounds/swifts.png', thumb: '/backgrounds/swifts.png', label: 'Swifts', bw: true, hidden: true },

  // Chronicles custom backgrounds
  { value: '/backgrounds/chronicles-bg-3.png', thumb: '/backgrounds/chronicles-bg-3.png', label: 'Chronicles III' },
  { value: '/backgrounds/chronicles-bg-6.png', thumb: '/backgrounds/chronicles-bg-6.png', label: 'Chronicles VI', hidden: true },
  { value: '/backgrounds/chronicles-bg-6a.png', thumb: '/backgrounds/chronicles-bg-6a.png', label: 'Chronicles VIa' },
  { value: '/backgrounds/chronicles-bg-6b.png', thumb: '/backgrounds/chronicles-bg-6b.png', label: 'Chronicles VIb' },
  { value: '/backgrounds/chrinicles-bg-7.png', thumb: '/backgrounds/chrinicles-bg-7.png', label: 'Chronicles VII' },

  // Photography (grayscale)
  { value: '/backgrounds/abhay-sachan-I_ZjiAbA_d8-unsplash.jpg', thumb: '/backgrounds/thumbs/abhay-sachan-I_ZjiAbA_d8-unsplash.jpg', label: 'Abhay Sachan' },
  { value: '/backgrounds/alexandra_koch-cherries-6294165.jpg', thumb: '/backgrounds/thumbs/alexandra_koch-cherries-6294165.jpg', label: 'Alexandra Koch' },
  { value: '/backgrounds/annie-spratt-UaIpNXaJORg-unsplash.jpg', thumb: '/backgrounds/thumbs/annie-spratt-UaIpNXaJORg-unsplash.jpg', label: 'Annie Spratt' },
  { value: '/backgrounds/annie-spratt-Y74OXLFiBYI-unsplash.jpg', thumb: '/backgrounds/thumbs/annie-spratt-Y74OXLFiBYI-unsplash.jpg', label: 'Annie Spratt II' },
  { value: '/backgrounds/birmingham-museums-trust-Bin0C2RtQpI-unsplash.jpg', thumb: '/backgrounds/thumbs/birmingham-museums-trust-Bin0C2RtQpI-unsplash.jpg', label: 'Birmingham Museums' },
  { value: '/backgrounds/deep-Ts9_sclEn5k-unsplash.jpg', thumb: '/backgrounds/thumbs/deep-Ts9_sclEn5k-unsplash.jpg', label: 'Deep' },
  { value: '/backgrounds/grazi-con-2VopZerN9jE-unsplash.jpg', thumb: '/backgrounds/thumbs/grazi-con-2VopZerN9jE-unsplash.jpg', label: 'Grazi Con' },
  { value: '/backgrounds/hammam-fuad-0Kn_nFFPFVo-unsplash.jpg', thumb: '/backgrounds/thumbs/hammam-fuad-0Kn_nFFPFVo-unsplash.jpg', label: 'Hammam Fuad', hidden: true },
  { value: '/backgrounds/omar-flores-lQT_bOWtysE-unsplash.jpg', thumb: '/backgrounds/thumbs/omar-flores-lQT_bOWtysE-unsplash.jpg', label: 'Omar Flores' },
  { value: '/backgrounds/slimane-kadi-f3tqjx1AW-A-unsplash.jpg', thumb: '/backgrounds/thumbs/slimane-kadi-f3tqjx1AW-A-unsplash.jpg', label: 'Slimane Kadi' },
  { value: '/backgrounds/tasha-kostyuk-5Pb0JuMOqbY-unsplash.jpg', thumb: '/backgrounds/thumbs/tasha-kostyuk-5Pb0JuMOqbY-unsplash.jpg', label: 'Tasha Kostyuk' },
  { value: '/backgrounds/vojtech-bruzek-mCjA1I8SlS8-unsplash.jpg', thumb: '/backgrounds/thumbs/vojtech-bruzek-mCjA1I8SlS8-unsplash.jpg', label: 'Vojtech Bruzek' },

  // Illustrations (grayscale)
  { value: '/backgrounds/jennydai-background-6650672.jpg', thumb: '/backgrounds/thumbs/jennydai-background-6650672.jpg', label: 'Jenny Dai' },
  { value: '/backgrounds/madebytin-lemon-8293725.jpg', thumb: '/backgrounds/thumbs/madebytin-lemon-8293725.jpg', label: 'Madebytin Lemon' },
  { value: '/backgrounds/sugeysima-art-6709653.jpg', thumb: '/backgrounds/thumbs/sugeysima-art-6709653.jpg', label: 'Sugeysima Art' },
  { value: '/backgrounds/handdrawn-1.jpg', thumb: '/backgrounds/thumbs/handdrawn-1.jpg', label: 'Hand Drawn' },
  { value: '/backgrounds/2768815-background-1462855_1920.jpg', thumb: '/backgrounds/thumbs/2768815-background-1462855_1920.jpg', label: 'Background' },
];

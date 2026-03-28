/**
 * Background image options from Unsplash
 */

export interface BackgroundOption {
  value: string;
  thumb: string;
  label: string;
  artist: string | null;
  artistUrl: string | null;
}

function bg(filename: string, label: string, artist: string, artistUrl: string): BackgroundOption {
  return {
    value: `/backgrounds/${filename}`,
    thumb: `/backgrounds/thumbs/${filename}`,
    label,
    artist,
    artistUrl,
  };
}

export const BACKGROUND_IMAGES: BackgroundOption[] = [
  { value: '', thumb: '', label: 'None', artist: null, artistUrl: null },
  bg('adam-kool-ndN00KmbJ1c-unsplash.jpg', 'Waterfall', 'Adam Kool', 'https://unsplash.com/@adamkool'),
  bg('austin-distel-vC_Q127x8Kg-unsplash.jpg', 'Plants', 'Austin Distel', 'https://unsplash.com/@austindistel'),
  bg('clem-onojeghuo-zlABb6Gke24-unsplash.jpg', 'Abstract', 'Clem Onojeghuo', 'https://unsplash.com/@clemono'),
  bg('daniel-olah-6KQETG8J-zI-unsplash.jpg', 'Ocean', 'Daniel Olah', 'https://unsplash.com/@danesduet'),
  bg('daniela-cuevas-t7YycgAoVSw-unsplash.jpg', 'Desert', 'Daniela Cuevas', 'https://unsplash.com/@danielacuevas'),
  bg('emma-francis-vpHCfunwDrQ-unsplash.jpg', 'Blush', 'Emma Francis', 'https://unsplash.com/@emmafrancis'),
  bg('fiona-murray-degraaff-F6_mI0aGdZU-unsplash.jpg', 'Texture', 'Fiona Murray-DeGraaff', 'https://unsplash.com/@fionamurraydegraaff'),
  bg('frank-mckenna-4V8JxijgZ_c-unsplash.jpg', 'Waves', 'Frank McKenna', 'https://unsplash.com/@frankiefoto'),
  bg('haris-khan-kD9SRoloQCA-unsplash.jpg', 'Gradient', 'Haris Khan', 'https://unsplash.com/@hariskhan'),
  bg('joshua-sortino-71vAb1FXB6g-unsplash.jpg', 'Lights', 'Joshua Sortino', 'https://unsplash.com/@sortino'),
  bg('kace-rodriguez-p3OzJuT_Dks-unsplash.jpg', 'Mountain', 'Kace Rodriguez', 'https://unsplash.com/@kace'),
  bg('kier-in-sight-archives-O7srvV2piu0-unsplash.jpg', 'Vintage', 'Kier in Sight Archives', 'https://unsplash.com/@kierinsightarchives'),
  bg('krakograff-textures-uPIsSnY2vtA-unsplash.jpg', 'Paper', 'Krakograff Textures', 'https://unsplash.com/@krakograff'),
  bg('liana-s-9duuU4kMI6s-unsplash.jpg', 'Marble', 'Liana S', 'https://unsplash.com/@lianas'),
  bg('luca-bravo-zAjdgNXsMeg-unsplash.jpg', 'Forest', 'Luca Bravo', 'https://unsplash.com/@lucabravo'),
  bg('matheo-jbt-lvi9xKSyCiE-unsplash.jpg', 'Soft', 'Matheo JBT', 'https://unsplash.com/@matheo_jbt'),
  bg('mehrab-sium-a7O0Tsd8dE8-unsplash.jpg', 'Colorful', 'Mehrab Sium', 'https://unsplash.com/@mehrabsium'),
  bg('moritz-lange-Rq2XVvWZvDc-unsplash.jpg', 'Warm', 'Moritz Lange', 'https://unsplash.com/@moritzlange'),
  bg('nasa-rTZW4f02zY8-unsplash.jpg', 'Earth', 'NASA', 'https://unsplash.com/@nasa'),
  bg('olga-thelavart-HZm2XR0whdw-unsplash.jpg', 'Floral', 'Olga Thelavart', 'https://unsplash.com/@thelavart'),
  bg('paul-talbot-pQDBGxtiDEo-unsplash.jpg', 'Minimalist', 'Paul Talbot', 'https://unsplash.com/@paultalbot'),
  bg('petr-vysohlid-9fqwGqGLUxc-unsplash.jpg', 'Aurora', 'Petr Vysohlid', 'https://unsplash.com/@petrvysohlid'),
  bg('sandra-seitamaa-OHLgIjctfrg-unsplash.jpg', 'Lake', 'Sandra Seitamaa', 'https://unsplash.com/@seitamaaphotography'),
  bg('sandra-seitamaa-SrFL-O4qXfA-unsplash.jpg', 'Nordic', 'Sandra Seitamaa', 'https://unsplash.com/@seitamaaphotography'),
  bg('sandra-seitamaa-a7e71c0jSgQ-unsplash.jpg', 'Winter', 'Sandra Seitamaa', 'https://unsplash.com/@seitamaaphotography'),
  bg('scott-webb-sk59I1qRfEM-unsplash.jpg', 'Concrete', 'Scott Webb', 'https://unsplash.com/@scottwebb'),
  bg('stephanie-sarlos-Q9q6UGkU96s-unsplash.jpg', 'Pastel', 'Stephanie Sarlos', 'https://unsplash.com/@stephaniesarlos'),
  bg('yevhenii-deshko-ieY_9lJnLNs-unsplash.jpg', 'Pink', 'Yevhenii Deshko', 'https://unsplash.com/@yevheniideshko'),
];

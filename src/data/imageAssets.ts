/**
 * EcoCrisis Command - Curated Environmental & Operational Image Assets
 * All imagery adheres to Unsplash API & attribution guidelines with local gradient fallbacks.
 */

export interface ImageAsset {
  url: string;
  fallbackGradient: string;
  alt: string;
  attribution: {
    photographer: string;
    source: string;
    sourceUrl: string;
  };
}

export const imageAssets = {
  hero: {
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2400&q=90',
    fallbackGradient: 'linear-gradient(135deg, #070b12 0%, #172554 50%, #030712 100%)',
    alt: 'Dense evergreen forest with atmospheric mist and light',
    attribution: {
      photographer: 'Rich Hay',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/1473448912268-2022ce9509d8',
    },
  },
  login: {
    url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2400&q=90',
    fallbackGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    alt: 'Mountain range at twilight under dramatic sky',
    attribution: {
      photographer: 'Kalen Emsley',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/1500534623283-312aade485b7',
    },
  },
  wildfireValley: {
    url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=2400&q=90',
    fallbackGradient: 'linear-gradient(135deg, #451a03 0%, #7c2d12 50%, #0f172a 100%)',
    alt: 'Atmospheric ridge landscape with smoke haze',
    attribution: {
      photographer: 'Bailey Zindel',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/1504198453319-5ce911bafcde',
    },
  },
  agriculture: {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    alt: 'Aerial view of agricultural valley and farmland pastures',
    attribution: {
      photographer: 'Karsten Würth',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/1500382017468-9049fed747ef',
    },
  },
  wildlife: {
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)',
    alt: 'Old-growth forest sanctuary habitat',
    attribution: {
      photographer: 'Vincent van Zalinge',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/1534188753412-3e26d0d618d6',
    },
  },
  cutOffCommunity: {
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient: 'linear-gradient(135deg, #083344 0%, #0c4a6e 100%)',
    alt: 'River bend cutting through mountainous terrain',
    attribution: {
      photographer: 'Kelly Sikkema',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/1547683905-f686c993aae5',
    },
  },
};

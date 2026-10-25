import { PortfolioItem } from '../utils/portfolioLogic';

export const PORTFOLIO_ITEMS: PortfolioItem[] = [];

export const ARTIST_INFO = {
  brandName: 'Sree Guru Arts',
  artistName: 'THORLAKONDA GURAVAIAH',
  designation: 'Master Temple Artist & Architectural Sculptor',
  experienceYears: '25+ Years of Sacred Craftsmanship',
  phone: '+91 9704926504',
  phoneClean: '919704926504',
  email: 'sreeguruarts@gmail.com',
  whatsappUrl: 'https://wa.me/919704926504',
  location: 'Andhra Pradesh & Telangana, India (Undertaking commissions nationwide & globally)',
  headline: 'Preserving Sacred Traditions Through Divine Art & Temple Architecture',
  subheadline: 'Led by master artist THORLAKONDA GURAVAIAH, Sree Guru Arts crafts sacred temple sculptures, monumental gopurams, sanctum vimanas, exquisite gold leaf murals, and bespoke devotional art in true harmony with ancient Shilpa Shastras.',
};

export const CORE_SERVICES = [
  {
    id: 'temple-sculptures',
    title: 'Temple Sculptures & Idols',
    iconClass: 'fa-solid fa-gem',
    shortDesc: 'Stone, Cement, Plaster & Panchaloha work carved to ancient Agama iconometry.',
    fullDesc: 'Custom carving and casting of presiding deities (Moola Virat), Utsava murtis, Parivara devatas, and intricate relief statues using traditional Krishna Shila stone, reinforced cement mortar, and architectural marble.',
    features: [
      'Strict Shilpa Shastra & Tala-mana proportions',
      'Long-lasting weather and abhishekham-resistant materials',
      'Intricate ornamentation of crowns, jewellery & weapons',
      'Custom sizing for sanctums from 2 ft up to 25+ ft',
    ],
  },
  {
    id: 'gopuram-vimana',
    title: 'Temple Interior & Vimana / Gopuram',
    iconClass: 'fa-solid fa-place-of-worship',
    shortDesc: 'Majestic Gopuram architecture, Vimana towers, ornate pillars & ceiling mandalas.',
    fullDesc: 'End-to-end architectural artistry for Raja Gopurams, Vimana superstructures, sanctum ceilings, ornamental bracket figures (Madanikas), and majestic entrance portals in Dravidian and Nagara traditions.',
    features: [
      'Multi-tiered Gopuram devata sculptures and motifs',
      'Sacred Vastu-aligned vimana geometry and Kalasam placement',
      'Ornate pillared mandapams and Yali colonnades',
      'Structural weatherproofing and structural integrity',
    ],
  },
  {
    id: 'temple-murals',
    title: 'Sacred Wall Murals & 24K Gold Leaf',
    iconClass: 'fa-solid fa-paintbrush',
    shortDesc: 'Fresco-secco wall murals, Tanjore style relief panels & authentic gold leaf embellishments.',
    fullDesc: 'Monumental devotional frescoes depicting timeless Puranic episodes, Dasavatara series, Ashta Lakshmi panels, and sanctum murals layered with genuine 24-karat gold foil and natural mineral pigments.',
    features: [
      'Authentic 24K pure gold leaf gilding and embossed relief work',
      'Devotional narrative sequences (Ramayana, Bhagavata, Gita)',
      'Rich mineral colors with fade-resistant UV protection',
      'Harmonious color palettes tailored to sanctum sanctity',
    ],
  },
  {
    id: 'custom-commissions',
    title: 'Custom Fine Art & Decorative Commissions',
    iconClass: 'fa-solid fa-palette',
    shortDesc: 'Bespoke canvas paintings, 3D relief panels, and luxury puja room sacred decor.',
    fullDesc: 'Personalized sacred artworks for private prayer halls, luxury residences, ashrams, and cultural institutions. From large-scale canvas oil paintings to intricate marble dust bas-reliefs.',
    features: [
      'Tailored sizes to fit exact residential and puja room spaces',
      'Personalized consultation on auspicious deity aspects & Vastu',
      'Museum-grade archival canvases, teak frames & pure gold foil',
      'Secure doorstep delivery and white-glove installation guidance',
    ],
  },
];

export const TRUST_POINTS = [
  {
    iconClass: 'fa-solid fa-scroll',
    title: 'Authentic Traditional Technique',
    desc: 'Strict adherence to ancient Shilpa Shastras, Agamas, and traditional iconography passed down through generations of temple artisans.',
  },
  {
    iconClass: 'fa-solid fa-compass',
    title: 'Vastu & Sacred Alignment',
    desc: 'Every idol posture, mudra, gaze direction, and architectural feature is harmonized with Vastu Vidya for auspicious spiritual resonance.',
  },
  {
    iconClass: 'fa-solid fa-shield-halved',
    title: 'High-Grade Durable Materials',
    desc: 'We select certified Krishna Shila, high-tensile cement stucco, weather-resistant pigments, and 24K gold foil engineered to endure for centuries.',
  },
  {
    iconClass: 'fa-solid fa-hand-holding-heart',
    title: 'Customized Bespoke Service',
    desc: 'Direct consultation with master artist THORLAKONDA GURAVAIAH from concept sketches to on-site temple consecration (Prana Pratishtha).',
  },
];

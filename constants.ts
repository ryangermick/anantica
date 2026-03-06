import { DesignProject } from './types';

// EmailJS Configuration
export const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
  recipientEmail: 'anantica@gmail.com',
};

export const INITIAL_PROJECTS: DesignProject[] = [
  {
    id: '1',
    title: 'AI Product Velocity, Search',
    category: 'Product Leadership',
    imageUrl: 'https://picsum.photos/seed/ai-velocity/800/1000',
    description: 'Leading AI product velocity initiatives across Google Search, driving strategy for next-generation search experiences powered by applied AI.',
    sortOrder: 0,
  },
  {
    id: '2',
    title: 'Food Ordering on Google',
    category: 'Co-Founder / GPM',
    imageUrl: 'https://picsum.photos/seed/food-ordering/800/600',
    description: 'Co-founded Google\'s marketplace for food ordering across Search, Maps & Assistant. Managed 6-8 PMs, owned B2B & B2C experience. General Manager for India pilot.',
    sortOrder: 1,
  },
  {
    id: '3',
    title: 'Google Search Redesign',
    category: 'Product Lead',
    imageUrl: 'https://picsum.photos/seed/search-redesign/800/1200',
    description: 'Led major evolutions of Google Search globally — launching the new Google logo across all products, modernizing results from links to cards, introducing Material Design and media carousels.',
    sortOrder: 2,
  },
  {
    id: '4',
    title: 'Integrity Identity & Applied AI',
    category: 'Product Lead',
    imageUrl: 'https://picsum.photos/seed/integrity-ai/800/1000',
    description: 'Steered integrity and identity products across Search, applying AI to modern creator and format experiences that resonate with billions of users.',
    sortOrder: 3,
  },
  {
    id: '5',
    title: 'Search Growth',
    category: 'Growth & Distribution',
    imageUrl: 'https://picsum.photos/seed/search-growth/800/800',
    description: 'Led Search growth delivering significant query increases. Launched distribution deals with hardware companies, Windows 8 Search App, Chrome Search App, and new entry points.',
    sortOrder: 4,
  },
  {
    id: '6',
    title: 'SafeSearch & Find My Phone',
    category: 'Strategic Products',
    imageUrl: 'https://picsum.photos/seed/safesearch/800/500',
    description: 'PM lead on high-impact strategic products: SafeSearch, SafeSearch Kids, Find My Phone — protecting and empowering billions of users.',
    sortOrder: 5,
  },
  {
    id: '7',
    title: 'Google Wallet & Offers',
    category: 'FinTech',
    imageUrl: 'https://picsum.photos/seed/google-wallet/800/1100',
    description: 'Growth Marketing Lead for Google Wallet and Google Offers. Awarded Google\'s "OC Award" — highest recognition for outstanding Search growth impact.',
    sortOrder: 6,
  },
  {
    id: '8',
    title: 'Startup Advisory',
    category: 'Angel Investing',
    imageUrl: 'https://picsum.photos/seed/startup-advise/800/900',
    description: 'Tech investor, advisor & mentor helping bridge Silicon Valley and mission-driven entrepreneurs. Guided startups on growth trajectories and product-market fit.',
    sortOrder: 7,
  },
  {
    id: '9',
    title: 'Times of India',
    category: 'Photojournalism',
    imageUrl: 'https://picsum.photos/seed/times-india/800/1300',
    description: 'Visual storytelling as a photojournalist at Mumbai Times — one of India\'s largest English-language newspapers. Where the journey began.',
    sortOrder: 8,
  },
];

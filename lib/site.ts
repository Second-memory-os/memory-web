export const SITE = {
  name: 'MemoryOS',
  tagline: 'Your personal memory for the AI era',
  supportEmail: 'support@memoryos.ai',
  company: 'MemoryOS',
  address: 'United States',
  privacyUpdated: 'August 23, 2026',
  termsUpdated: 'August 23, 2026',
} as const;

export const NAV_LINKS = [
  { href: '/#how-it-helps', label: 'How it helps' },
  { href: '/#what-we-provide', label: 'Product' },
  { href: '/#privacy', label: 'Privacy' },
  { href: '/pricing', label: 'Pricing' },
] as const;

export const FOOTER_LINKS = [
  { href: '/privacy-policy', label: 'Privacy policy' },
  { href: '/terms-of-service', label: 'Terms of service' },
  { href: '/return-policy', label: 'Return policy' },
  { href: '/limited-use-disclosure', label: 'Disclosure' },
  { href: '/contact', label: 'Contact us' },
] as const;

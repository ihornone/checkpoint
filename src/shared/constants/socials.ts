export interface SocialItem {
  id: 'instagram' | 'telegram' | 'threads' | 'facebook' | 'viber' | 'whatsapp';
  name: string;
  href: string;
}

export const SOCIAL_LINKS: readonly SocialItem[] = [
  { id: 'instagram', name: 'Instagram', href: 'https://www.instagram.com/' },
  { id: 'telegram', name: 'Telegram', href: 'https://t.me/' },
  { id: 'threads', name: 'Threads', href: 'https://www.threads.net/' },
  { id: 'facebook', name: 'Facebook', href: 'https://www.facebook.com/' },
  { id: 'viber', name: 'Viber', href: 'viber://chat?number=%2B380631234567' },
  { id: 'whatsapp', name: 'WhatsApp', href: 'https://wa.me/380631234567' },
] as const;

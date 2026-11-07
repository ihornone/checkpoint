export interface Contacts {
  name: string;
  phone: string;
  phoneRaw: string;
  phoneTel: string;
  address: string;
  workingHours: string;
  workingHoursMultiline: string;
  email: string;
  googleMapsUrl: string;
}

export interface PricingRules {
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  extendedDeliveryThreshold: number;
  extendedDeliveryFee: number;
  currencyCodeUah: number;
  onlineDiscountPercent: number;
}

export interface SocialItem {
  id: string;
  name: string;
  href: string;
}

export interface SiteSettings {
  contacts: Contacts;
  pricing: PricingRules;
  socials: SocialItem[];
}

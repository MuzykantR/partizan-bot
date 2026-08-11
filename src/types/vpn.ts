export interface ServerLocation {
  id: string;
  country: string;
  city: string;
  flag: string;
  protocol: 'VLESS-XHTTP';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  durationMonths: number;
  priceRub: number;
  priceStars: number;
  priceUsdt: number;
  popularBadge?: boolean;
  discountPercentage?: number;
  features: string[];
}

export interface UserSubscription {
  hasSubscription: boolean;
  status: 'inactive' | 'active' | 'expired' | 'trial';
  expireDate: string;
  daysRemaining: number;
  subscriptionUrl: string; // Marzban subscription URL for Happ ending in /v2ray-json
  isTrafficUnlimited: boolean; // Main VPN traffic is UNLIMITED!
  whitelistUsedBytes: number; // Whitelist mode traffic (20 GB limit)
  whitelistTotalBytes: number;
  usedBytes: number;
  totalBytes: number;
  activeDevicesCount: number;
  maxDevicesCount: number;
  availableLocations: ServerLocation[];
}

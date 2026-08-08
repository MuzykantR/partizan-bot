export interface ServerLocation {
  id: string;
  country: string;
  city: string;
  flag: string;
  latencyMs: number;
  protocol: 'VLESS-XHTTP' | 'VLESS-Reality' | 'AmneziaWG';
  isRecommended?: boolean;
  loadPercentage: number;
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
  status: 'active' | 'expired' | 'trial';
  expireDate: string;
  daysRemaining: number;
  vlessLink: string;
  usedBytes: number;
  totalBytes: number;
  activeDevicesCount: number;
  maxDevicesCount: number;
  serverLocation: ServerLocation;
}

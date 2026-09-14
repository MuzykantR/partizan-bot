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

export interface UserDevice {
  key: string;            // "HWID:918965bb8db98228" | "PVID:a1b2..." | "DEV:pc1"
  type: 'hwid' | 'pvid' | 'lease' | 'cli';
  os: string;             // "Android", "iOS", "Windows", etc.
  model: string;          // "Samsung Galaxy S23", "Happ Desktop", etc.
  user_agent: string;
  first_seen: string;
  last_seen: string;
  last_ip: string;
  is_current?: boolean;
}

export interface CdnQuotaInfo {
  used_bytes: number;          // Download + Upload суммарно
  download_bytes: number;
  upload_bytes: number;
  soft_limit_bytes: number;    // 20 GiB (21 474 836 480 bytes)
  hard_limit_bytes: number;    // 25 GiB (26 843 545 600 bytes)
  status: 'normal' | 'throttled' | 'blocked';
  throttle_speed: string;      // "512 кбит/с"
  resets_at: string;           // "1-е число следующего месяца"
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

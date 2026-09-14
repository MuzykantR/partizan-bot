import { UserSubscription, UserDevice, CdnQuotaInfo } from '../types/vpn';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://axisforge.tech/twa-api';

export interface ReferralStats {
  recruits_count: number;
  earned_bonus_days: number;
  referral_code: string;
  referral_url: string;
}

export interface UserProfileResponse {
  telegram_id: number;
  first_name: string;
  username?: string;
  has_used_trial: boolean;
  subscription: UserSubscription;
  referrals: ReferralStats;
}

export function getInitData(): string {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  return '';
}

export async function fetchUserProfile(): Promise<UserProfileResponse | null> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend API connection failed:', error);
  }
  return null;
}

export async function activateTrial(): Promise<{ success: boolean; message: string; subscription?: UserSubscription }> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/activate-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to activate trial:', error);
  }
  return { success: false, message: 'Не удалось связаться с сервером Marzban' };
}

export async function validatePromoCode(code: string): Promise<{ valid: boolean; message: string; discount_percent?: number; bonus_days?: number; target_plan_id?: string }> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/validate-promo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to validate promo code:', error);
  }
  return { valid: false, message: ' Ошибка связи с сервером при проверке промокода.' };
}

export async function processPayment(planId: string, promoCode?: string): Promise<{ success: boolean; message: string; subscription?: UserSubscription }> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
      body: JSON.stringify({ plan_id: planId, promo_code: promoCode }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to process payment:', error);
  }
  return { success: false, message: 'Ошибка при обработке заказа на сервере.' };
}

export async function fetchUserDevices(): Promise<{ activeDevicesCount: number; maxDevicesCount: number; devices: UserDevice[] }> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch devices:', error);
  }
  return { activeDevicesCount: 0, maxDevicesCount: 3, devices: [] };
}

export async function revokeUserDevice(deviceKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/devices/${encodeURIComponent(deviceKey)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to revoke device:', error);
  }
  return { success: false, message: 'Не удалось отвязать устройство' };
}

export async function fetchCdnQuota(): Promise<CdnQuotaInfo | null> {
  try {
    const initData = getInitData();
    const response = await fetch(`${API_BASE_URL}/v1/user/cdn-quota`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch CDN quota:', error);
  }
  return null;
}

export async function generateSubscriptionLink(dev?: string): Promise<string> {
  try {
    const initData = getInitData();
    const query = dev ? `?dev=${encodeURIComponent(dev)}` : '';
    const response = await fetch(`${API_BASE_URL}/v1/user/subscription-link${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.subscriptionUrl || '';
    }
  } catch (error) {
    console.warn('Failed to generate subscription link:', error);
  }
  return '';
}

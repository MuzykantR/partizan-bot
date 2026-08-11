import { UserSubscription } from '../types/vpn';

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

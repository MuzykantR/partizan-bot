import { useEffect, useState } from 'react';
import { TelegramUser, TelegramWebApp } from '../types/telegram';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  const triggerHaptic = {
    light: () => webApp?.HapticFeedback?.impactOccurred('light'),
    medium: () => webApp?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => webApp?.HapticFeedback?.impactOccurred('heavy'),
    success: () => webApp?.HapticFeedback?.notificationOccurred('success'),
    warning: () => webApp?.HapticFeedback?.notificationOccurred('warning'),
    error: () => webApp?.HapticFeedback?.notificationOccurred('error'),
    selection: () => webApp?.HapticFeedback?.selectionChanged(),
  };

  const openLink = (url: string) => {
    triggerHaptic.light();
    if (webApp?.openLink) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return {
    webApp,
    user,
    initData: webApp?.initData || '',
    platform: webApp?.platform || 'unknown',
    isExpanded: webApp?.isExpanded || false,
    triggerHaptic,
    openLink,
  };
}

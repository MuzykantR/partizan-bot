import { useEffect, useState } from 'react';
import { TelegramUser, TelegramWebApp } from '../types/telegram';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [safeArea, setSafeArea] = useState<{ top: number; bottom: number; left: number; right: number }>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      try {
        tg.setHeaderColor?.('#121212');
        tg.setBackgroundColor?.('#121212');
      } catch {
        // Fallback for older Telegram clients
      }

      setWebApp(tg);
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      const updateInsets = () => {
        const insets = tg.contentSafeAreaInset || tg.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 };
        setSafeArea(insets);
      };

      updateInsets();
      tg.onEvent?.('safeAreaChanged', updateInsets);
      tg.onEvent?.('contentSafeAreaChanged', updateInsets);

      return () => {
        tg.offEvent?.('safeAreaChanged', updateInsets);
        tg.offEvent?.('contentSafeAreaChanged', updateInsets);
      };
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
    safeArea,
    triggerHaptic,
    openLink,
  };
}

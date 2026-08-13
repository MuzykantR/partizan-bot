import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { TabType, Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SubscriptionShop } from './components/SubscriptionShop';
import { KeyManager } from './components/KeyManager';
import { ProfileSettings } from './components/ProfileSettings';
import { UserSubscription } from './types/vpn';
import { fetchUserProfile, activateTrial, getInitData } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isTelegramApp, setIsTelegramApp] = useState<boolean>(true);

  // Default state for new users without subscription
  const [subscription, setSubscription] = useState<UserSubscription>({
    hasSubscription: false,
    status: 'inactive',
    expireDate: '',
    daysRemaining: 0,
    subscriptionUrl: '',
    isTrafficUnlimited: true,
    whitelistUsedBytes: 0,
    whitelistTotalBytes: 20 * 1024 * 1024 * 1024,
    usedBytes: 0,
    totalBytes: 0,
    activeDevicesCount: 0,
    maxDevicesCount: 5,
    availableLocations: [
      { id: 'de-aeza', country: 'Германия', city: 'Франкфурт (Aeza 9950X)', flag: '🇩🇪', protocol: 'VLESS-XHTTP' },
    ],
  });

  useEffect(() => {
    const initData = getInitData();
    const isDev = window.location.search.includes('dev=true');
    
    // Restrict access if opened outside Telegram Mini App
    if (!initData && !isDev) {
      setIsTelegramApp(false);
      return;
    }

    loadBackendProfile();
  }, []);

  const loadBackendProfile = async () => {
    const profile = await fetchUserProfile();
    if (profile && profile.subscription) {
      setSubscription(profile.subscription);
    }
  };

  const handleActivateTrial = async () => {
    const res = await activateTrial();
    if (res.success) {
      await loadBackendProfile();
    } else {
      alert(res.message || 'Ошибка активации пробного периода');
    }
  };

  if (!isTelegramApp) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F4F0EA] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-sm w-full bg-[#1A1A1C] border border-[#3A3A3D] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#C8372D]/10 border-2 border-[#C8372D]/40 flex items-center justify-center text-[#C8372D] shadow-lg shadow-[#C8372D]/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-wide uppercase font-mono text-[#F4F0EA]">
              Доступ Ограничен
            </h2>
            <p className="text-xs text-[#9E9B97] leading-relaxed">
              Приложение <strong className="text-[#F4F0EA]">ПАРТИЗАН VPN</strong> доступно исключительно через официального Telegram-бота.
            </p>
          </div>
          <a
            href="https://t.me/partizanVPNbot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full pv-button-primary py-4 text-xs font-bold font-mono tracking-wider uppercase flex items-center justify-center gap-2"
          >
            <span>Открыть ПАРТИЗАН в Telegram</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F4F0EA] relative">
      <div className="max-w-md mx-auto min-h-screen px-4 py-2 flex flex-col justify-between">
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              subscription={subscription}
              onNavigateToShop={() => setActiveTab('shop')}
              onActivateTrial={handleActivateTrial}
            />
          )}

          {activeTab === 'shop' && <SubscriptionShop onSubscriptionUpdate={loadBackendProfile} />}

          {activeTab === 'keys' && (
            <KeyManager
              subscription={subscription}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'profile' && <ProfileSettings subscription={subscription} />}
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;

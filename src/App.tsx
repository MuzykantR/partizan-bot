import React, { useState, useEffect } from 'react';
import { TabType, Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SubscriptionShop } from './components/SubscriptionShop';
import { KeyManager } from './components/KeyManager';
import { SetupGuide } from './components/SetupGuide';
import { ProfileSettings } from './components/ProfileSettings';
import { UserSubscription } from './types/vpn';
import { fetchUserProfile } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Subscription state populated with Marzban VLESS-XHTTP specs and /v2ray-json endpoint
  const [subscription, setSubscription] = useState<UserSubscription>({
    status: 'active',
    expireDate: '2026-12-31',
    daysRemaining: 145,
    subscriptionUrl: 'https://axisforge.tech/274ba6b74d0c6820/9e8b7c6a5d4e3f2a1b0c/v2ray-json',
    isTrafficUnlimited: true, // Main VPN traffic is UNLIMITED!
    whitelistUsedBytes: 4.2 * 1024 * 1024 * 1024, // 4.2 GB used of 20 GB Whitelist limit
    whitelistTotalBytes: 20 * 1024 * 1024 * 1024,
    usedBytes: 34.8 * 1024 * 1024 * 1024,
    totalBytes: 100 * 1024 * 1024 * 1024,
    activeDevicesCount: 2,
    maxDevicesCount: 5,
    availableLocations: [
      { id: 'de-aeza', country: 'Германия', city: 'Франкфурт (Aeza 9950X)', flag: '🇩🇪', protocol: 'VLESS-XHTTP' },
      { id: 'nl-ams', country: 'Нидерланды', city: 'Амстердам', flag: '🇳🇱', protocol: 'VLESS-XHTTP' },
      { id: 'fi-hel', country: 'Финляндия', city: 'Хельсинки', flag: '🇫🇮', protocol: 'VLESS-XHTTP' },
      { id: 'us-nyc', country: 'США', city: 'Нью-Йорк', flag: '🇺🇸', protocol: 'VLESS-XHTTP' },
    ],
  });

  useEffect(() => {
    async function loadBackendProfile() {
      const profile = await fetchUserProfile();
      if (profile && profile.subscription) {
        setSubscription(profile.subscription);
      }
    }
    loadBackendProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F4F0EA] relative">
      <div className="max-w-md mx-auto min-h-screen px-4 py-2 flex flex-col justify-between">
        {/* Render Tab Pages */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              subscription={subscription}
              onNavigateToShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'shop' && <SubscriptionShop />}

          {activeTab === 'keys' && <KeyManager subscription={subscription} />}

          {activeTab === 'guide' && <SetupGuide />}

          {activeTab === 'profile' && <ProfileSettings subscription={subscription} />}
        </main>

        {/* Bottom Tab Bar Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;

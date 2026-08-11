import React, { useState, useEffect } from 'react';
import { TabType, Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SubscriptionShop } from './components/SubscriptionShop';
import { KeyManager } from './components/KeyManager';
import { ProfileSettings } from './components/ProfileSettings';
import { UserSubscription } from './types/vpn';
import { fetchUserProfile, activateTrial } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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

  const loadBackendProfile = async () => {
    const profile = await fetchUserProfile();
    if (profile && profile.subscription) {
      setSubscription(profile.subscription);
    }
  };

  useEffect(() => {
    loadBackendProfile();
  }, []);

  const handleActivateTrial = async () => {
    const res = await activateTrial();
    if (res.success) {
      await loadBackendProfile();
    } else {
      alert(res.message || 'Ошибка активации пробного периода');
    }
  };

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

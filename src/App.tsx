import React, { useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { TabType, Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SubscriptionShop } from './components/SubscriptionShop';
import { KeyManager } from './components/KeyManager';
import { SetupGuide } from './components/SetupGuide';
import { ProfileSettings } from './components/ProfileSettings';
import { UserSubscription } from './types/vpn';

export const App: React.FC = () => {
  const { user } = useTelegram();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Mock subscription populated with production VLESS-XHTTP link from Axisforge specs
  const [subscription] = useState<UserSubscription>({
    status: 'active',
    expireDate: '2026-12-31',
    daysRemaining: 145,
    vlessLink: 'vless://2271b50cf51a5e3297f5fb406a5aa524@axisforge.tech:443?type=xhttp&path=%2F2271b50cf51a5e3297f5fb406a5aa524&security=tls&fp=firefox&alpn=h2#Axisforge-DE-Aeza',
    usedBytes: 34.8 * 1024 * 1024 * 1024,
    totalBytes: 100 * 1024 * 1024 * 1024,
    activeDevicesCount: 2,
    maxDevicesCount: 5,
    serverLocation: {
      id: 'de-aeza',
      country: 'Германия',
      city: 'Франкфурт (Aeza)',
      flag: '🇩🇪',
      latencyMs: 34,
      protocol: 'VLESS-XHTTP',
      isRecommended: true,
      loadPercentage: 24,
    },
  });

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text relative">
      <div className="max-w-md mx-auto min-h-screen px-4 py-2 flex flex-col justify-between">
        {/* Render Tab Pages */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              subscription={subscription}
              onNavigateToShop={() => setActiveTab('shop')}
              onNavigateToKeys={() => setActiveTab('keys')}
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

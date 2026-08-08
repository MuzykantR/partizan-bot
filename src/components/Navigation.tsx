import React from 'react';
import { Home, Wallet, Key, BookOpen, User } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

export type TabType = 'dashboard' | 'shop' | 'keys' | 'guide' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { triggerHaptic } = useTelegram();

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Главная', icon: Home },
    { id: 'shop' as TabType, label: 'Тарифы', icon: Wallet },
    { id: 'keys' as TabType, label: 'Ключи', icon: Key },
    { id: 'guide' as TabType, label: 'Инструкция', icon: BookOpen },
    { id: 'profile' as TabType, label: 'Профиль', icon: User },
  ];

  const handleTabChange = (tabId: TabType) => {
    triggerHaptic.selection();
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E0E10]/95 backdrop-blur-md border-t border-[#252528] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#C8372D] font-bold scale-105'
                  : 'text-[#9E9B97] hover:text-[#F4F0EA]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'stroke-[2.5px] text-[#C8372D]' : 'stroke-[1.75px]'}`} />
              <span className="text-[11px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

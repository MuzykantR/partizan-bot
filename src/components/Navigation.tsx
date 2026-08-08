import React from 'react';
import { Shield, CreditCard, Key, HelpCircle, User } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

export type TabType = 'dashboard' | 'shop' | 'keys' | 'guide' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { triggerHaptic } = useTelegram();

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Главная', icon: Shield },
    { id: 'shop' as TabType, label: 'Тарифы', icon: CreditCard },
    { id: 'keys' as TabType, label: 'Ключи', icon: Key },
    { id: 'guide' as TabType, label: 'Инструкция', icon: HelpCircle },
    { id: 'profile' as TabType, label: 'Профиль', icon: User },
  ];

  const handleTabChange = (tabId: TabType) => {
    triggerHaptic.selection();
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
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
                  ? 'text-indigo-400 bg-indigo-500/10 scale-105 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

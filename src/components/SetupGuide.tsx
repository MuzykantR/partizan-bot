import React, { useState } from 'react';
import { Smartphone, Monitor, Apple, Download, Key, Shield, Power } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

type OsType = 'ios' | 'android' | 'desktop';

export const SetupGuide: React.FC = () => {
  const { triggerHaptic, openLink } = useTelegram();
  const [activeOs, setActiveOs] = useState<OsType>('ios');

  const osTabs = [
    { id: 'ios' as OsType, label: 'iOS (iPhone)', icon: Apple },
    { id: 'android' as OsType, label: 'Android', icon: Smartphone },
    { id: 'desktop' as OsType, label: 'ПК (Win/Mac)', icon: Monitor },
  ];

  const handleOsChange = (os: OsType) => {
    triggerHaptic.selection();
    setActiveOs(os);
  };

  const handleOpenHapp = () => {
    triggerHaptic.medium();
    openLink('https://apps.apple.com/app/happ-proxy-utility/id6504287905');
  };

  const handleContactSupport = () => {
    triggerHaptic.light();
    openLink('https://t.me/axisforge_support_bot');
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* Header matching partizan_mvp_instructions.jpg */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#F4F0EA] tracking-tight">
          Настройка Happ VPN
        </h1>
      </div>

      {/* OS Selector Tabs matching partizan_mvp_instructions.jpg */}
      <div className="grid grid-cols-3 gap-1 bg-[#1F1616] rounded-2xl p-1 border border-[#3D2524]">
        {osTabs.map((tab) => {
          const isActive = activeOs === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleOsChange(tab.id)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#C8372D] text-[#F4F0EA] shadow-md shadow-[#C8372D]/40'
                  : 'text-[#9E9B97] hover:text-[#F4F0EA]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Steps Card matching partizan_mvp_instructions.jpg */}
      <div className="pv-card p-5 space-y-4">
        <h3 className="text-base font-bold text-[#F4F0EA] text-center mb-2">
          Шаги подключения
        </h3>

        <div className="space-y-3.5">
          <div className="flex items-center gap-3 bg-[#0E0E10] border border-[#2D2D30] rounded-2xl p-3">
            <div className="w-10 h-10 rounded-xl bg-[#251B1B] text-[#C8372D] border border-[#4A2927] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-[#C8372D]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#F4F0EA]">
                1 <span className="ml-2 font-normal">Установите приложение Happ</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#0E0E10] border border-[#2D2D30] rounded-2xl p-3">
            <div className="w-10 h-10 rounded-xl bg-[#251B1B] text-[#C8372D] border border-[#4A2927] flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-[#C8372D]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#F4F0EA]">
                2 <span className="ml-2 font-normal">Добавьте подписку</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#0E0E10] border border-[#2D2D30] rounded-2xl p-3">
            <div className="w-10 h-10 rounded-xl bg-[#251B1B] text-[#C8372D] border border-[#4A2927] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#C8372D]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#F4F0EA]">
                3 <span className="ml-2 font-normal">Авто-загрузка серверов</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#0E0E10] border border-[#2D2D30] rounded-2xl p-3">
            <div className="w-10 h-10 rounded-xl bg-[#251B1B] text-[#C8372D] border border-[#4A2927] flex items-center justify-center shrink-0">
              <Power className="w-5 h-5 text-[#C8372D]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#F4F0EA]">
                4 <span className="ml-2 font-normal">Включите защищенный туннель</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Red Action Button */}
        <button
          onClick={handleOpenHapp}
          className="w-full pv-button-primary py-3.5 text-sm font-bold mt-4"
        >
          Открыть Happ VPN
        </button>

        {/* Text link matching mockup */}
        <div className="text-center pt-1">
          <button
            onClick={handleContactSupport}
            className="text-xs font-semibold text-[#F4F0EA] underline hover:text-[#C8372D] transition-colors"
          >
            Проблемы с подключением?
          </button>
        </div>
      </div>
    </div>
  );
};

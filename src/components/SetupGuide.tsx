import React, { useState } from 'react';
import { Smartphone, Monitor, Apple, Download, ShieldAlert } from 'lucide-react';
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

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-mono text-[#F4F0EA] tracking-tight uppercase">НАСТРОЙКА HAPP VPN</h1>
        <p className="text-xs text-[#9E9B97] mt-1">Инструкция по подключению через официальный клиент Happ</p>
      </div>

      {/* OS Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#121212] rounded-2xl border border-[#3A3A3D]">
        {osTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeOs === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleOsChange(tab.id)}
              className={`py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#C8372D] text-[#F4F0EA] shadow-lg shadow-[#C8372D]/30'
                  : 'text-[#9E9B97] hover:text-[#F4F0EA]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step by Step content for Happ */}
      <div className="pv-card p-5 space-y-4 border border-[#3A3A3D]">
        {activeOs === 'ios' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-[#F4F0EA] flex items-center gap-2 uppercase">
              <Apple className="w-5 h-5 text-[#C8372D]" />
              Подключение Happ на iPhone / iPad (iOS)
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите приложение Happ"
                description={
                  <span>Официальное бесплатное приложение <strong className="text-[#F4F0EA]">Happ</strong> в App Store для VLESS-XHTTP.</span>
                }
                action={
                  <button
                    onClick={() => openLink('https://apps.apple.com/app/happ-proxy-utility/id6504287905')}
                    className="bg-[#C8372D]/20 text-[#F4F0EA] border border-[#C8372D]/40 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-[#C8372D]/30 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    App Store
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Добавьте подписку"
                description={
                  <span>Нажмите кнопку <strong className="text-[#F4F0EA]">«Добавить подписку в Happ»</strong> на главном экране нашего бота или скопируйте ссылку подписки.</span>
                }
              />

              <StepCard
                step={3}
                title="Авто-загрузка серверов"
                description={
                  <span>Приложение <strong className="text-[#F4F0EA]">Happ</strong> автоматически подтянет все доступные серверы (Германия Aeza, Нидерланды, Финляндия, США).</span>
                }
              />

              <StepCard
                step={4}
                title="Включите защищенный туннель"
                description={
                  <span>Выберите нужную локацию в <strong className="text-[#F4F0EA]">Happ</strong> и нажмите главную кнопку включения VPN.</span>
                }
              />
            </div>
          </div>
        )}

        {activeOs === 'android' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-[#F4F0EA] flex items-center gap-2 uppercase">
              <Smartphone className="w-5 h-5 text-[#2A9D8F]" />
              Подключение Happ на Android
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите Happ for Android"
                description={
                  <span>Скачайте официальный <strong className="text-[#F4F0EA]">Happ</strong> из Google Play или установите прямо через APK.</span>
                }
                action={
                  <button
                    onClick={() => openLink('https://play.google.com/store/apps/details?id=com.happ.proxy')}
                    className="bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Google Play
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Импортируйте ссылку подписки"
                description={
                  <span>Нажмите <strong className="text-[#F4F0EA]">«Добавить подписку в Happ»</strong> во вкладке «Главная» или «Ключи».</span>
                }
              />

              <StepCard
                step={3}
                title="Переключайте сервера в Happ"
                description={
                  <span>Выбирайте наиболее быстрый сервер прямо в интерфейсе <strong className="text-[#F4F0EA]">Happ</strong> и наслаждайтесь скоростью 1 Гбит/с.</span>
                }
              />
            </div>
          </div>
        )}

        {activeOs === 'desktop' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-[#F4F0EA] flex items-center gap-2 uppercase">
              <Monitor className="w-5 h-5 text-[#E07A5F]" />
              Подключение Happ на Windows / macOS
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите Happ Desktop Client"
                description={
                  <span>Официальная версия <strong className="text-[#F4F0EA]">Happ</strong> для десктопа с фоновым системным туннелем.</span>
                }
                action={
                  <button
                    onClick={() => openLink('https://github.com/happ-proxy/happ/releases')}
                    className="bg-[#E07A5F]/20 text-[#E07A5F] border border-[#E07A5F]/40 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Скачать Happ
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Добавьте URL подписки"
                description={
                  <span>Откройте <strong className="text-[#F4F0EA]">Happ</strong> на компьютере → Нажмите «Add Subscription» → Вставьте ссылку подписки из бота.</span>
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Troubleshooting box */}
      <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-[#E07A5F] shrink-0 mt-0.5" />
        <div className="text-xs text-[#F4F0EA] space-y-1">
          <div className="font-bold font-mono text-[#E07A5F]">Нужна помощь с приложением Happ?</div>
          <div>Наша техподдержка ответит на любые вопросы и поможет запустить подписку.</div>
        </div>
      </div>
    </div>
  );
};

interface StepCardProps {
  step: number;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, action }) => (
  <div className="bg-[#121212] border border-[#3A3A3D] rounded-2xl p-3.5 flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-[#C8372D]/30 text-[#F4F0EA] border border-[#C8372D]/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
      {step}
    </div>
    <div className="flex-1">
      <div className="text-sm font-bold font-mono text-[#F4F0EA] flex items-center justify-between">
        <span>{title}</span>
        {action}
      </div>
      <div className="text-xs text-[#9E9B97] mt-1">{description}</div>
    </div>
  </div>
);

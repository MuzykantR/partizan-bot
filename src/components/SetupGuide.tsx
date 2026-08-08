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
        <h1 className="text-2xl font-black text-white tracking-tight">Настройка Happ VPN</h1>
        <p className="text-xs text-slate-400 mt-1">Инструкция по подключению через официальный клиент Happ</p>
      </div>

      {/* OS Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        {osTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeOs === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleOsChange(tab.id)}
              className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step by Step content for Happ */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 border border-white/10">
        {activeOs === 'ios' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Apple className="w-5 h-5 text-indigo-400" />
              Подключение Happ на iPhone / iPad (iOS)
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите приложение Happ"
                description="Бесплатное официальное приложение Happ в App Store для VLESS-XHTTP."
                action={
                  <button
                    onClick={() => openLink('https://apps.apple.com/app/happ-proxy-utility/id6504287905')}
                    className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-indigo-600/30 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    App Store
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Добавьте подписку"
                description="Нажмите кнопку «Добавить подписку в Happ» на главном экране нашего бота или скопируйте ссылку подписки."
              />

              <StepCard
                step={3}
                title="Авто-загрузка серверов"
                description="Приложение Happ автоматически подтянет все доступные серверы (Германия Aeza, Нидерланды, Финляндия, США)."
              />

              <StepCard
                step={4}
                title="Включите защищенный туннель"
                description="Выберите нужную локацию в Happ и нажмите главную кнопку включения VPN."
              />
            </div>
          </div>
        )}

        {activeOs === 'android' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Подключение Happ на Android
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите Happ for Android"
                description="Скачайте официальный Happ из Google Play или установите прямо через APK."
                action={
                  <button
                    onClick={() => openLink('https://play.google.com/store/apps/details?id=com.happ.proxy')}
                    className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Google Play
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Импортируйте ссылку подписки"
                description="Нажмите «Добавить подписку в Happ» во вкладке «Дашборд» или «Ключи»."
              />

              <StepCard
                step={3}
                title="Переключайте сервера в Happ"
                description="Выбирайте наиболее быстрый сервер прямо в интерфейсе Happ и наслаждайтесь скоростью 1 Гбит/с."
              />
            </div>
          </div>
        )}

        {activeOs === 'desktop' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-sky-400" />
              Подключение Happ на Windows / macOS
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите Happ Desktop Client"
                description="Официальная версия Happ для десктопа с фоновым системным туннелем."
                action={
                  <button
                    onClick={() => openLink('https://github.com/happ-proxy/happ/releases')}
                    className="bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Скачать Happ
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Добавьте URL подписки"
                description="Откройте Happ на компьютере → Нажмите «Add Subscription» → Вставьте ссылку подписки из бота."
              />
            </div>
          </div>
        )}
      </div>

      {/* Troubleshooting box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 space-y-1">
          <div className="font-bold text-amber-300">Нужна помощь с приложным Happ?</div>
          <div>Наша техподдержка ответит на любые вопросы и поможет запустить подписку.</div>
        </div>
      </div>
    </div>
  );
};

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, action }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
      {step}
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-white flex items-center justify-between">
        <span>{title}</span>
        {action}
      </div>
      <div className="text-xs text-slate-400 mt-1">{description}</div>
    </div>
  </div>
);

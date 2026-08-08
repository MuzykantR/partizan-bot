import React, { useState } from 'react';
import { Smartphone, Monitor, Apple, CheckCircle2, Download, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

type OsType = 'ios' | 'android' | 'windows' | 'mac';

export const SetupGuide: React.FC = () => {
  const { triggerHaptic, openLink } = useTelegram();
  const [activeOs, setActiveOs] = useState<OsType>('ios');

  const osTabs = [
    { id: 'ios' as OsType, label: 'iOS', icon: Apple },
    { id: 'android' as OsType, label: 'Android', icon: Smartphone },
    { id: 'windows' as OsType, label: 'Windows', icon: Monitor },
    { id: 'mac' as OsType, label: 'macOS', icon: Apple },
  ];

  const handleOsChange = (os: OsType) => {
    triggerHaptic.selection();
    setActiveOs(os);
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Инструкция по настройке</h1>
        <p className="text-xs text-slate-400 mt-1">Подключение за 1 минуту на любом устройстве</p>
      </div>

      {/* OS Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        {osTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeOs === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleOsChange(tab.id)}
              className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
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

      {/* Step by Step content based on active OS */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 border border-white/10">
        {activeOs === 'ios' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Apple className="w-5 h-5 text-indigo-400" />
              Настройка на iPhone / iPad (iOS)
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите приложение Happ"
                description="Официальный бесплатный клиент с поддержкой VLESS-XHTTP в App Store."
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
                title="Скопируйте вашу ссылку подписки"
                description="Перейдите во вкладку «Ключи» в этом боте и нажмите «Скопировать ссылку»."
              />

              <StepCard
                step={3}
                title="Вставьте подписку в Happ"
                description="Откройте Happ, нажмите «+» в правом верхнем углу → «Импорт из буфера обмена»."
              />

              <StepCard
                step={4}
                title="Включите туннель"
                description="Нажмите главную кнопку подключения в Happ и разрешите добавление VPN-конфигурации в iOS."
              />
            </div>
          </div>
        )}

        {activeOs === 'android' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Настройка на Android
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите Happ или v2rayNG"
                description="Выберите наиболее удобный клиент из Google Play или с нашего зеркала."
                action={
                  <div className="flex gap-2">
                    <button
                      onClick={() => openLink('https://play.google.com/store/apps/details?id=com.v2ray.ang')}
                      className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Google Play
                    </button>
                  </div>
                }
              />

              <StepCard
                step={2}
                title="Скопируйте ключ VLESS"
                description="Нажмите кнопку скопировать во вкладке «Ключи»."
              />

              <StepCard
                step={3}
                title="Импортируйте профиль"
                description="Откройте v2rayNG → Нажмите «+» → «Импортировать профиль из буфера обмена»."
              />

              <StepCard
                step={4}
                title="Подключитесь"
                description="Нажмите на круглую кнопку подключения в правом нижнем углу v2rayNG."
              />
            </div>
          </div>
        )}

        {activeOs === 'windows' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-sky-400" />
              Настройка на Windows
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Скачайте v2rayN или Sing-Box"
                description="Быстрый настольный клиент с автоподключением."
                action={
                  <button
                    onClick={() => openLink('https://github.com/2dust/v2rayN/releases')}
                    className="bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    GitHub Releases
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Скопируйте ключ подписки"
                description="Скопируйте VLESS-XHTTP ключ в разделе «Ключи»."
              />

              <StepCard
                step={3}
                title="Добавьте сервер"
                description="В v2rayN нажмите Ctrl+V для быстрой вставки из буфера обмена."
              />

              <StepCard
                step={4}
                title="Включите системный прокси"
                description="Установите галочку «Системный прокси» в нижней панели v2rayN."
              />
            </div>
          </div>
        )}

        {activeOs === 'mac' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Apple className="w-5 h-5 text-purple-400" />
              Настройка на macOS
            </h3>

            <div className="space-y-3">
              <StepCard
                step={1}
                title="Установите Happ for Mac или FoXray"
                description="Клиент из Mac App Store с поддержкой чипов M1/M2/M3/M4."
                action={
                  <button
                    onClick={() => openLink('https://apps.apple.com/app/foxray/id6448898384')}
                    className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Mac App Store
                  </button>
                }
              />

              <StepCard
                step={2}
                title="Вставьте ключ VLESS"
                description="Скопируйте ключ из бота и нажмите «Импорт из буфера» в приложении."
              />
            </div>
          </div>
        )}
      </div>

      {/* Troubleshooting box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 space-y-1">
          <div className="font-bold text-amber-300">Возникли сложности с настройкой?</div>
          <div>Наша техподдержка работает 24/7 и поможет вам настроить соединение за пару минут.</div>
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

import React from 'react';
import { ShieldCheck, Headset, Smartphone, Award, Sparkles, ExternalLink } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface ProfileSettingsProps {
  subscription: UserSubscription;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ subscription }) => {
  const { user, triggerHaptic, openLink } = useTelegram();

  const handleContactSupport = () => {
    triggerHaptic.light();
    openLink('https://t.me/axisforge_support_bot');
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Профиль пользователя</h1>
        <p className="text-xs text-slate-400 mt-1">Информация об аккаунте и статистике сессий</p>
      </div>

      {/* User Card */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 flex items-center gap-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/20 shrink-0">
          {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white leading-tight">
              {user?.first_name || 'Пользователь'} {user?.last_name || ''}
            </h2>
            {user?.is_premium && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {user?.username ? `@${user.username}` : `ID: ${user?.id || '1379063170'}`}
          </p>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Подписка активирована
          </div>
        </div>
      </div>

      {/* Account Info Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            Устройства
          </div>
          <div className="text-xl font-extrabold text-white">
            {subscription.activeDevicesCount} <span className="text-xs font-normal text-slate-400">из {subscription.maxDevicesCount}</span>
          </div>
          <div className="text-[10px] text-slate-400">Активных лимитов</div>
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Award className="w-4 h-4 text-amber-400" />
            Статус аккаунта
          </div>
          <div className="text-xl font-extrabold text-amber-300">PRO</div>
          <div className="text-[10px] text-slate-400">Без ограничений по скорости</div>
        </div>
      </div>

      {/* Support Card */}
      <button
        onClick={handleContactSupport}
        className="w-full glass-card hover:bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-indigo-500/30 transition-all group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Headset className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Служба поддержки</div>
            <div className="text-xs text-slate-400">Задать вопрос или сообщить о проблеме</div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* App Version Footer */}
      <div className="text-center text-[11px] text-slate-500 space-y-1 pt-4">
        <div>Axisforge TWA Core v2.4.0 • VLESS-XHTTP Engine</div>
        <div>Telegram Bot API v7.10 Compatible</div>
      </div>
    </div>
  );
};

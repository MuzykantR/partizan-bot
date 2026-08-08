import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, Share2, Check, Copy } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface ProfileSettingsProps {
  subscription: UserSubscription;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ subscription }) => {
  const { user, triggerHaptic, openLink } = useTelegram();
  const [referralCopied, setReferralCopied] = useState<boolean>(false);

  const referralLink = `https://www.referral.com/${user?.id || '1379063170'}`;

  const handleCopyReferral = () => {
    triggerHaptic.success();
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleShareReferral = () => {
    triggerHaptic.light();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🔥 Присоединяйся к ПАРТИЗАН VPN! Получи +3 дня бесплатного VLESS-XHTTP доступа в обход всех блокировок!')}`;
    openLink(shareUrl);
  };

  const handleContactSupport = () => {
    triggerHaptic.light();
    openLink('https://t.me/axisforge_support_bot');
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* Header matching partizan_mvp_profile.jpg */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <img src="/logo.png" alt="ПАРТИЗАН" className="w-7 h-7 object-contain rounded-full border border-[#C8372D]/50" />
        <h1 className="text-xl font-extrabold font-mono text-[#F4F0EA] uppercase tracking-wider">
          ПАРТИЗАН
        </h1>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-[#F4F0EA] tracking-tight text-center">
          Профиль пользователя
        </h2>
      </div>

      {/* User Avatar Card matching partizan_mvp_profile.jpg */}
      <div className="pv-card p-6 flex flex-col items-center justify-center text-center">
        {/* Red rounded box avatar with stencil eyes */}
        <div className="w-24 h-24 rounded-3xl bg-[#C8372D] overflow-hidden p-1 shadow-xl border border-[#F4F0EA]/20 flex items-center justify-center">
          <img src="/logo.png" alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-xl font-bold text-[#F4F0EA]">
            {user?.first_name || 'Пользователь'} {user?.last_name || ''}
          </div>
          <div className="text-sm font-mono text-[#F4F0EA]">
            ID: {user?.id || '1379063170'}
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#0E0E10] border border-[#2D2D30] px-3 py-1 rounded-full text-xs font-bold text-[#F4F0EA]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8372D]" />
            <span>Подписка активирована</span>
          </div>
        </div>
      </div>

      {/* Account Info Stats Grid 2x2 matching partizan_mvp_profile.jpg */}
      <div className="grid grid-cols-2 gap-3">
        <div className="pv-card p-4 text-center space-y-1">
          <div className="text-xs text-[#9E9B97] font-medium">Устройства</div>
          <div className="text-xl font-bold text-[#F4F0EA]">
            {subscription.activeDevicesCount} из {subscription.maxDevicesCount}
          </div>
        </div>

        <div className="pv-card p-4 text-center space-y-1">
          <div className="text-xs text-[#9E9B97] font-medium">Статус</div>
          <div className="text-xl font-bold text-[#F4F0EA]">PRO</div>
        </div>
      </div>

      {/* Referral Card matching partizan_mvp_profile.jpg */}
      <div className="pv-card-glow p-5 space-y-3">
        <div className="text-base font-bold text-[#F4F0EA]">
          Пригласить друга (+7 дней подписки)
        </div>

        <div className="text-xs text-[#9E9B97] font-mono truncate bg-[#0E0E10] border border-[#2D2D30] rounded-xl p-2.5">
          {referralLink}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyReferral}
            className="pv-button-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            {referralCopied ? <Check className="w-3.5 h-3.5 text-[#C8372D]" /> : <Copy className="w-3.5 h-3.5 text-[#C8372D]" />}
            {referralCopied ? 'Скопировано' : 'Скопировать'}
          </button>

          <button
            onClick={handleShareReferral}
            className="pv-button-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            Поделиться
          </button>
        </div>
      </div>

      {/* Support Card matching partizan_mvp_profile.jpg */}
      <button
        onClick={handleContactSupport}
        className="w-full pv-card p-4 flex items-center gap-3 transition-all hover:bg-[#251B1B]/40 active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-full bg-[#251B1B] border border-[#4A2927] text-[#C8372D] flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="text-base font-bold text-[#F4F0EA]">
          Служба поддержки
        </div>
      </button>
    </div>
  );
};

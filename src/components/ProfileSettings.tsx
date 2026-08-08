import React, { useState } from 'react';
import { ShieldCheck, Headset, Smartphone, Award, Sparkles, ExternalLink, Users, Copy, Check, Share2 } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface ProfileSettingsProps {
  subscription: UserSubscription;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ subscription }) => {
  const { user, triggerHaptic, openLink } = useTelegram();
  const [referralCopied, setReferralCopied] = useState<boolean>(false);

  const referralLink = `https://t.me/partizan_vpn_bot?start=ref_${user?.id || '1379063170'}`;

  const handleCopyReferral = () => {
    triggerHaptic.success();
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleShareReferral = () => {
    triggerHaptic.light();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🔥 Держи ссылку на PARTIZAN VPN! Переходи по моей ссылке и получи +3 дня бесплатного VLESS-XHTTP доступа в обход всех блокировок!')}`;
    openLink(shareUrl);
  };

  const handleContactSupport = () => {
    triggerHaptic.light();
    openLink('https://t.me/axisforge_support_bot');
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-mono text-[#F4F0EA] tracking-tight uppercase flex items-center gap-2">
          ПАРТИЗАНСКИЙ ОТРЯД 🛡️
        </h1>
        <p className="text-xs text-[#9E9B97] mt-1">Информация об аккаунте и приглашение друзей</p>
      </div>

      {/* User Profile Card */}
      <div className="pv-card p-5 flex items-center gap-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#C8372D] to-rose-600 flex items-center justify-center text-[#F4F0EA] font-extrabold font-mono text-2xl shadow-xl shadow-[#C8372D]/30 shrink-0 border border-[#F4F0EA]/20">
          {user?.first_name ? user.first_name[0].toUpperCase() : 'P'}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-mono text-[#F4F0EA] leading-tight">
              {user?.first_name || 'Партизан'} {user?.last_name || ''}
            </h2>
            {user?.is_premium && (
              <span className="bg-[#E07A5F]/20 text-[#E07A5F] text-[10px] px-2 py-0.5 rounded-full border border-[#E07A5F]/30 flex items-center gap-0.5 font-mono">
                <Sparkles className="w-3 h-3" />
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-xs text-[#9E9B97] font-mono">
            {user?.username ? `@${user.username}` : `ID: ${user?.id || '1379063170'}`}
          </p>
          <div className="text-[11px] text-[#2A9D8F] flex items-center gap-1 font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            ПОДПИСКА АКТИВНА
          </div>
        </div>
      </div>

      {/* Referral Program Card ("Партизанский Отряд") */}
      <div className="pv-card p-5 space-y-3.5 border border-[#C8372D]/40 bg-[#C8372D]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#F4F0EA] uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#C8372D]" />
            Пригласи друга (+7 дней подписки)
          </div>
          <span className="pv-badge-stencil">БОНУС</span>
        </div>

        <p className="text-xs text-[#9E9B97] leading-relaxed">
          Делитесь вашей ссылкой с друзьями: друг получит <strong className="text-[#F4F0EA]">+3 дня триала</strong>, а вы — <strong className="text-[#F4F0EA]">+7 дней подписки</strong> за каждого приведённого Партизана!
        </p>

        {/* Referral Link & Actions */}
        <div className="bg-[#121212] border border-[#3A3A3D] rounded-2xl p-2.5 font-mono text-xs text-[#F4F0EA] truncate flex items-center justify-between">
          <span className="truncate">{referralLink}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleCopyReferral}
            className={`py-3 px-3 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 border ${
              referralCopied
                ? 'bg-[#2A9D8F] text-[#F4F0EA] border-[#2A9D8F]'
                : 'bg-[#121212] hover:bg-[#1E1E20] text-[#F4F0EA] border-[#3A3A3D]'
            }`}
          >
            {referralCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#C8372D]" />}
            {referralCopied ? 'СКОПИРОВАНО' : 'СКОПИРОВАТЬ'}
          </button>

          <button
            onClick={handleShareReferral}
            className="pv-button-primary py-3 px-3 text-xs flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            ОТПРАВИТЬ В ЧАТ
          </button>
        </div>
      </div>

      {/* Account Info Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="pv-card p-4 space-y-1">
          <div className="text-xs text-[#9E9B97] font-mono flex items-center gap-1.5 uppercase font-bold">
            <Smartphone className="w-4 h-4 text-[#C8372D]" />
            Устройства
          </div>
          <div className="text-xl font-extrabold font-mono text-[#F4F0EA]">
            {subscription.activeDevicesCount} <span className="text-xs font-normal text-[#9E9B97]">из {subscription.maxDevicesCount}</span>
          </div>
          <div className="text-[10px] text-[#9E9B97]">Активных подключений</div>
        </div>

        <div className="pv-card p-4 space-y-1">
          <div className="text-xs text-[#9E9B97] font-mono flex items-center gap-1.5 uppercase font-bold">
            <Award className="w-4 h-4 text-[#E07A5F]" />
            Ранг
          </div>
          <div className="text-xl font-extrabold font-mono text-[#E07A5F]">КОМАНДИР</div>
          <div className="text-[10px] text-[#9E9B97]">Без ограничений по скорости</div>
        </div>
      </div>

      {/* Support Card */}
      <button
        onClick={handleContactSupport}
        className="w-full pv-card hover:bg-[#1E1E20]/80 p-4 flex items-center justify-between border border-[#3A3A3D] transition-all group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C8372D]/20 text-[#C8372D] flex items-center justify-center border border-[#C8372D]/30">
            <Headset className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold font-mono text-[#F4F0EA] group-hover:text-[#C8372D] transition-colors uppercase">Служба поддержки</div>
            <div className="text-xs text-[#9E9B97]">Задать вопрос или сообщить о проблеме 24/7</div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-[#9E9B97] group-hover:text-[#F4F0EA] transition-colors" />
      </button>

      {/* App Version Footer */}
      <div className="text-center text-[11px] font-mono text-[#9E9B97] space-y-1 pt-4">
        <div>PARTIZAN VPN Core v2.4.0 • VLESS-XHTTP Engine</div>
        <div>Telegram Bot API v7.10 Compatible</div>
      </div>
    </div>
  );
};

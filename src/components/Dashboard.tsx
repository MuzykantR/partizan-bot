import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Copy, Check, QrCode, HardDrive, Globe, Smartphone, RefreshCw, Infinity as InfinityIcon } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';
import { QRCodeSVG } from 'qrcode.react';

interface DashboardProps {
  subscription: UserSubscription;
  onNavigateToShop: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscription, onNavigateToShop }) => {
  const { triggerHaptic } = useTelegram();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const handleCopySubscription = () => {
    triggerHaptic.success();
    navigator.clipboard.writeText(subscription.subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenHapp = () => {
    triggerHaptic.medium();
    const happDeepLink = `happ://add/${encodeURIComponent(subscription.subscriptionUrl)}`;
    window.location.href = happDeepLink;
  };

  const whitelistUsedGb = (subscription.whitelistUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const whitelistTotalGb = (subscription.whitelistTotalBytes / (1024 * 1024 * 1024)).toFixed(0);
  const whitelistPercent = Math.min(100, Math.round((subscription.whitelistUsedBytes / subscription.whitelistTotalBytes) * 100));

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header Info with PARTIZAN Logo */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PARTIZAN Logo" className="w-10 h-10 object-contain rounded-full border border-[#C8372D]/50 shadow-md shadow-[#C8372D]/20" />
          <div>
            <h1 className="text-xl font-black font-mono tracking-wider text-[#F4F0EA] uppercase flex items-center gap-2">
              PARTIZAN <span className="text-[10px] px-2 py-0.5 rounded bg-[#C8372D] text-[#F4F0EA] font-mono font-bold tracking-widest uppercase">XHTTP 2.0</span>
            </h1>
            <p className="text-[11px] text-[#9E9B97]">Невидимый доступ. Свободный интернет.</p>
          </div>
        </div>
        <div className="pv-badge-mint flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>АКТИВЕН</span>
        </div>
      </div>

      {/* Main Subscription Card */}
      <div className="pv-card p-6 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#C8372D]/20 blur-3xl" />

        {/* Status Icon */}
        <div className="relative my-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#C8372D] to-rose-600 text-[#F4F0EA] flex items-center justify-center shadow-2xl border-4 border-[#F4F0EA]/20 animate-pulse-red">
            <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
          </div>
        </div>

        {/* Status Title */}
        <div className="mt-3 space-y-1">
          <h2 className="text-xl font-extrabold font-mono text-[#F4F0EA] uppercase tracking-wide">ПОДПИСКА В HAPP ГОТОВА</h2>
          <p className="text-xs text-[#9E9B97] max-w-xs leading-relaxed">
            Добавьте ссылку подписки в клиент <strong className="text-[#F4F0EA] font-bold">Happ</strong> для автоматической загрузки всех серверов
          </p>
        </div>

        {/* Primary CTA: Add to Happ */}
        <div className="w-full mt-5 space-y-2.5">
          <button
            onClick={handleOpenHapp}
            className="w-full pv-button-primary py-4 text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Smartphone className="w-4 h-4" />
            ДОБАВИТЬ ПОДПИСКУ В HAPP
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopySubscription}
              className={`py-2.5 px-3 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 border ${
                copied
                  ? 'bg-[#2A9D8F] text-[#F4F0EA] border-[#2A9D8F]'
                  : 'bg-[#121212] hover:bg-[#1E1E20] text-[#F4F0EA] border-[#3A3A3D]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#C8372D]" />}
              {copied ? 'СКОПИРОВАНО' : 'СКОПИРОВАТЬ ССЫЛКУ'}
            </button>

            <button
              onClick={() => {
                triggerHaptic.light();
                setShowQrModal(true);
              }}
              className="bg-[#121212] hover:bg-[#1E1E20] border border-[#3A3A3D] text-[#F4F0EA] font-mono font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-[#E07A5F]" />
              QR-КОД HAPP
            </button>
          </div>
        </div>
      </div>

      {/* Traffic & Expiry Info Card */}
      <div className="pv-card p-4 space-y-4">
        {/* Main Unlimited Traffic Badge */}
        <div className="flex items-center justify-between border-b border-[#3A3A3D] pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#C8372D]" />
            <span className="text-xs font-bold font-mono uppercase text-[#F4F0EA]">ОСНОВНОЙ ТРАФИК VPN</span>
          </div>
          <span className="pv-badge-mint flex items-center gap-1">
            <InfinityIcon className="w-3.5 h-3.5 text-[#2A9D8F]" />
            БЕЗЛИМИТНЫЙ
          </span>
        </div>

        {/* Whitelist Traffic Quota Card */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#9E9B97] flex items-center gap-1">
              <span>Режим «Белые списки»:</span>
            </span>
            <span className="text-[#F4F0EA] font-mono font-bold">{whitelistUsedGb} ГБ / {whitelistTotalGb} ГБ</span>
          </div>
          <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden border border-[#3A3A3D]">
            <div
              className="bg-[#C8372D] h-full rounded-full transition-all duration-500"
              style={{ width: `${whitelistPercent}%` }}
            />
          </div>
        </div>

        {/* Expiry Status */}
        <div className="flex items-center justify-between pt-2 border-t border-[#3A3A3D]">
          <div>
            <div className="text-xs text-[#9E9B97] font-mono uppercase">Срок действия:</div>
            <div className="text-lg font-black font-mono text-[#F4F0EA]">
              {subscription.daysRemaining} <span className="text-xs font-normal text-[#9E9B97]">дней (до {subscription.expireDate})</span>
            </div>
          </div>
          <button
            onClick={() => { triggerHaptic.light(); onNavigateToShop(); }}
            className="pv-button-primary px-3.5 py-2 text-xs flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ПРОДЛИТЬ
          </button>
        </div>
      </div>

      {/* Available Servers in Subscription */}
      <div className="pv-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#F4F0EA] uppercase tracking-wider">
            <Globe className="w-4 h-4 text-[#C8372D]" />
            Локации в вашей подписке
          </div>
          <span className="text-[10px] text-[#9E9B97] font-mono flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-[#2A9D8F]" />
            Авто-обновление в Happ
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {subscription.availableLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-[#121212] border border-[#3A3A3D] rounded-xl p-2.5 flex items-center gap-2.5"
            >
              <span className="text-xl">{loc.flag}</span>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#F4F0EA] truncate">{loc.country}</div>
                <div className="text-[10px] text-[#9E9B97] truncate">{loc.city}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#9E9B97] bg-[#121212] p-2.5 rounded-xl border border-[#3A3A3D] leading-normal">
          💡 <strong className="text-[#F4F0EA]">Как переключать локации:</strong> После добавления ссылки в <strong className="text-[#F4F0EA]">Happ</strong>, вы сможете выбирать и менять любую из этих локаций прямо внутри приложения Happ.
        </p>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1E20] border border-[#3A3A3D] w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3D] pb-3">
              <h3 className="text-base font-bold font-mono text-[#F4F0EA] flex items-center gap-2 uppercase">
                <QrCode className="w-5 h-5 text-[#E07A5F]" />
                QR-код подписки Happ
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-[#9E9B97] hover:text-[#F4F0EA] text-xs bg-[#121212] px-2.5 py-1 rounded-full border border-[#3A3A3D]"
              >
                Закрыть
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl my-2">
              <QRCodeSVG value={subscription.subscriptionUrl} size={200} level="M" />
            </div>

            <p className="text-xs text-[#9E9B97] leading-relaxed">
              Откройте сканер в приложении <strong className="text-[#F4F0EA]">Happ</strong> и наведите на этот QR-код для моментального подключения.
            </p>

            <button
              onClick={handleCopySubscription}
              className="w-full pv-button-primary py-3 text-xs"
            >
              {copied ? 'СКОПИРОВАНО!' : 'СКОПИРОВАТЬ ССЫЛКУ ПОДПИСКИ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

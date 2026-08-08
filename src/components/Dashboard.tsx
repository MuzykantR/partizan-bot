import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone, Infinity as InfinityIcon } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';
import { QRCodeSVG } from 'qrcode.react';

interface DashboardProps {
  subscription: UserSubscription;
  onNavigateToShop: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscription }) => {
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
    <div className="space-y-4 pb-24 pt-1">
      {/* Top Header matching mockup */}
      <div className="flex items-center justify-between px-2 py-1">
        <h1 className="text-xl font-extrabold font-mono text-[#F4F0EA] tracking-wider uppercase">
          ПАРТИЗАН
        </h1>
        <div className="bg-[#1F1616] border border-[#C8372D]/50 px-3 py-1 rounded-full text-xs font-bold text-[#F4F0EA] flex items-center gap-1.5 shadow-md shadow-[#C8372D]/20">
          <span className="w-2 h-2 rounded-full bg-[#C8372D] animate-pulse" />
          <span>Активен</span>
        </div>
      </div>

      {/* Main Hero Card matching partizan_mvp_main.jpg */}
      <div className="pv-card-glow p-6 flex flex-col items-center justify-center text-center">
        {/* Centered Stencil Eyes Avatar */}
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#F4F0EA]/30 my-2 shadow-2xl bg-black">
          <img src="/logo.png" alt="ПАРТИЗАН" className="w-full h-full object-cover" />
        </div>

        {/* Title matching mockup (No tagline, no XHTTP badge) */}
        <h2 className="text-2xl font-extrabold text-[#F4F0EA] mt-2 tracking-wide">
          Подписка готова
        </h2>
      </div>

      {/* Action Buttons Block matching partizan_mvp_main.jpg */}
      <div className="space-y-2.5">
        <button
          onClick={handleOpenHapp}
          className="w-full pv-button-primary py-4 text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Smartphone className="w-5 h-5" />
          Добавить подписку в Happ
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopySubscription}
            className={`pv-button-secondary py-3 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              copied ? 'border-[#C8372D] text-[#C8372D]' : ''
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-[#C8372D]" /> : <Copy className="w-4 h-4 text-[#C8372D]" />}
            {copied ? 'Скопировано' : 'Скопировать ссылку'}
          </button>

          <button
            onClick={() => {
              triggerHaptic.light();
              setShowQrModal(true);
            }}
            className="pv-button-secondary py-3 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <QrCode className="w-4 h-4 text-[#E07A5F]" />
            QR-код
          </button>
        </div>
      </div>

      {/* Subscription Expiry & Traffic Card matching partizan_mvp_main.jpg */}
      <div className="pv-card-glow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-[#F4F0EA]">
            Срок действия подписки: {subscription.daysRemaining} дней
          </div>
          <span className="text-[10px] font-mono text-[#E07A5F] border border-[#E07A5F]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <InfinityIcon className="w-3 h-3 text-[#E07A5F]" />
            БЕЗЛИМИТ VPN
          </span>
        </div>

        {/* Progress bar for Whitelist mode (20 GB) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#9E9B97]">
            <span>Режим «Белые списки»:</span>
            <span className="text-[#F4F0EA] font-mono font-bold">{whitelistUsedGb} ГБ / {whitelistTotalGb} ГБ</span>
          </div>
          <div className="w-full bg-[#121212] rounded-full h-3.5 overflow-hidden border border-[#2D2D30] p-0.5">
            <div
              className="bg-[#C8372D] h-full rounded-full transition-all duration-500 shadow-lg shadow-[#C8372D]/50"
              style={{ width: `${whitelistPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Locations 2x2 Grid matching partizan_mvp_main.jpg */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="pv-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F4F0EA]">Франкфурт,</div>
            <div className="text-xs font-bold text-[#F4F0EA]">Германия</div>
          </div>
          <span className="text-2xl">🇩🇪</span>
        </div>

        <div className="pv-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F4F0EA]">Амстердам,</div>
            <div className="text-xs font-bold text-[#F4F0EA]">Нидерланды</div>
          </div>
          <span className="text-2xl">🇳🇱</span>
        </div>

        <div className="pv-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F4F0EA]">Хельсинки,</div>
            <div className="text-xs font-bold text-[#F4F0EA]">Финляндия</div>
          </div>
          <span className="text-2xl">🇫🇮</span>
        </div>

        <div className="pv-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F4F0EA]">Вашингтон,</div>
            <div className="text-xs font-bold text-[#F4F0EA]">США</div>
          </div>
          <span className="text-2xl">🇺🇸</span>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A1A1C] border border-[#3A3A3D] w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3D] pb-3">
              <h3 className="text-base font-bold text-[#F4F0EA] flex items-center gap-2">
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
              Откройте сканер в приложении <strong className="text-[#F4F0EA]">Happ</strong> и наведите на этот QR-код.
            </p>

            <button
              onClick={handleCopySubscription}
              className="w-full pv-button-primary py-3 text-xs font-bold"
            >
              {copied ? 'Скопировано!' : 'Скопировать ссылку подписки'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

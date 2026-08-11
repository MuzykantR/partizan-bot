import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone, Infinity as InfinityIcon, Zap, ShieldCheck } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';
import { QRCodeSVG } from 'qrcode.react';

interface DashboardProps {
  subscription: UserSubscription;
  onNavigateToShop: () => void;
  onActivateTrial?: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscription, onNavigateToShop: _onNavigateToShop, onActivateTrial }) => {
  const { triggerHaptic } = useTelegram();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  const handleCopySubscription = () => {
    triggerHaptic.success();
    navigator.clipboard.writeText(subscription.subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenHapp = () => {
    triggerHaptic.medium();
    const rawUrl = subscription.subscriptionUrl;
    const happUrl = `happ://add/${rawUrl}`;
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = happUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    } catch {
      // fallback
    }

    setTimeout(() => {
      window.location.href = happUrl;
    }, 150);
  };

  const handleActivateClick = async () => {
    triggerHaptic.heavy();
    if (onActivateTrial) {
      setIsActivating(true);
      try {
        await onActivateTrial();
      } finally {
        setIsActivating(false);
      }
    }
  };

  const hasSub = subscription.hasSubscription && subscription.status !== 'inactive';
  const whitelistUsedGb = (subscription.whitelistUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const whitelistTotalGb = (subscription.whitelistTotalBytes / (1024 * 1024 * 1024)).toFixed(0);
  const whitelistPercent = Math.min(100, Math.round((subscription.whitelistUsedBytes / subscription.whitelistTotalBytes) * 100));

  // Format expiration date with 00:00 time
  const getFormattedExpireDate = (): string => {
    if (subscription.expireDate) {
      try {
        const dt = new Date(subscription.expireDate);
        const day = String(dt.getDate()).padStart(2, '0');
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const year = dt.getFullYear();
        return `${day}.${month}.${year} 00:00`;
      } catch {
        // fallback
      }
    }
    const target = new Date();
    target.setDate(target.getDate() + (subscription.daysRemaining || 3));
    const day = String(target.getDate()).padStart(2, '0');
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const year = target.getFullYear();
    return `${day}.${month}.${year} 00:00`;
  };

  return (
    <div className="space-y-4 pb-24 pt-1">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 py-1">
        <h1 className="text-xl font-extrabold font-mono text-[#F4F0EA] tracking-wider uppercase flex items-center gap-2">
          ПАРТИЗАН
        </h1>
        {hasSub ? (
          <div className="bg-[#1F1616] border border-[#C8372D]/50 px-3 py-1 rounded-full text-xs font-bold text-[#F4F0EA] flex items-center gap-1.5 shadow-md shadow-[#C8372D]/20">
            <span className="w-2 h-2 rounded-full bg-[#C8372D] animate-pulse" />
            <span>Активен</span>
          </div>
        ) : (
          <div className="bg-[#1E1E20] border border-[#3A3A3D] px-3 py-1 rounded-full text-xs font-bold text-[#9E9B97] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span>Неактивен</span>
          </div>
        )}
      </div>

      {/* Main Hero Card */}
      <div className="pv-card-glow p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#F4F0EA]/30 my-1 shadow-2xl bg-black">
          <img src="./logo.png" alt="ПАРТИЗАН" className="w-full h-full object-cover" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#F4F0EA] tracking-wide">
            {hasSub ? 'Подписка готова' : 'Подписка не активирована'}
          </h2>
        </div>
      </div>

      {/* Primary Action Button */}
      {!hasSub ? (
        <div className="pv-card p-5 space-y-4 text-center border-l-4 border-[#C8372D]">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#F4F0EA]">
            <ShieldCheck className="w-5 h-5 text-[#C8372D]" />
            <span>Пробный период</span>
          </div>
          <button
            onClick={handleActivateClick}
            disabled={isActivating}
            className="w-full pv-button-primary py-4 text-base font-extrabold flex items-center justify-center text-center active:scale-[0.98] shadow-xl shadow-[#C8372D]/30 px-4"
          >
            <Zap className="w-5 h-5 fill-current animate-bounce shrink-0 mr-1.5" />
            <span>{isActivating ? 'Создание подписки...' : 'Активировать 3 дня бесплатно'}</span>
          </button>
        </div>
      ) : (
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
      )}

      {/* Subscription Status & Traffic Card */}
      {hasSub && (
        <div className="pv-card-glow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#F4F0EA]">
              Дата окончания подписки: <span className="font-mono text-[#C8372D]">{getFormattedExpireDate()}</span>
            </div>
            <span className="text-[10px] font-mono text-[#E07A5F] border border-[#E07A5F]/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <InfinityIcon className="w-3 h-3 text-[#E07A5F]" />
              БЕЗЛИМИТ VPN
            </span>
          </div>

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
      )}

      {/* Server Locations Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="pv-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F4F0EA]">Германия</div>
            <div className="text-[11px] text-[#9E9B97]">Основной сервер</div>
          </div>
          <span className="text-2xl">🇩🇪</span>
        </div>

        <div className="pv-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F4F0EA]">Белые списки</div>
            <div className="text-[11px] text-[#9E9B97]">[Германия]</div>
          </div>
          <span className="text-2xl">🇩🇪</span>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && hasSub && (
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

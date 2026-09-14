import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone, Infinity as InfinityIcon, Zap, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';
import { QRCodeSVG } from 'qrcode.react';
import { OfferModal } from './OfferModal';

interface DashboardProps {
  subscription: UserSubscription;
  onNavigateToShop: () => void;
  onActivateTrial?: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscription, onNavigateToShop: _onNavigateToShop, onActivateTrial }) => {
  const { triggerHaptic } = useTelegram();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
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
  const whitelistUsedBytes = subscription.whitelistUsedBytes || 0;
  const whitelistTotalBytes = subscription.whitelistTotalBytes || (20 * 1024 * 1024 * 1024);
  const whitelistUsedGb = (whitelistUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const whitelistTotalGb = (whitelistTotalBytes / (1024 * 1024 * 1024)).toFixed(0);
  const whitelistPercent = Math.min(100, Math.round((whitelistUsedBytes / whitelistTotalBytes) * 100));

  // Two-way CDN traffic accounting (85% DL, 15% UL)
  const downloadGb = (whitelistUsedBytes * 0.85 / (1024 * 1024 * 1024)).toFixed(2);
  const uploadGb = (whitelistUsedBytes * 0.15 / (1024 * 1024 * 1024)).toFixed(2);

  const isThrottled = whitelistUsedBytes >= 20 * 1024 * 1024 * 1024 && whitelistUsedBytes < 25 * 1024 * 1024 * 1024;
  const isBlocked = whitelistUsedBytes >= 25 * 1024 * 1024 * 1024;

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
    <div className="space-y-4 pb-28 pt-1">
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

          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9E9B97] font-medium">Квота «Белые списки» (CDN):</span>
              <span className="text-[#F4F0EA] font-mono font-bold">{whitelistUsedGb} ГБ / {whitelistTotalGb} ГБ</span>
            </div>

            <div className="w-full bg-[#121212] rounded-full h-3.5 overflow-hidden border border-[#2D2D30] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-md ${
                  isBlocked
                    ? 'bg-red-600 shadow-red-600/50 animate-pulse'
                    : isThrottled
                    ? 'bg-amber-500 shadow-amber-500/50'
                    : whitelistPercent >= 80
                    ? 'bg-yellow-500 shadow-yellow-500/50'
                    : 'bg-emerald-500 shadow-emerald-500/50'
                }`}
                style={{ width: `${whitelistPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#9E9B97] font-mono pt-0.5">
              <span>⬇ Входящий: {downloadGb} ГБ</span>
              <span>⬆ Исходящий: {uploadGb} ГБ</span>
            </div>

            {/* Quota Status Notice */}
            <div className={`text-[11px] rounded-xl px-3 py-1.5 flex items-center gap-1.5 border font-mono ${
              isBlocked
                ? 'bg-red-950/40 border-red-800/60 text-red-300'
                : isThrottled
                ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
            }`}>
              {isBlocked ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" />
                  <span>Лимит 25 ГБ исчерпан. Трафик CDN приостановлен до 1-го числа.</span>
                </>
              ) : isThrottled ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Троттлинг 512 кбит/с: Мессенджеры и звонки активны.</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>Скорость 1 Гбит/с: Полный доступ без ограничений.</span>
                </>
              )}
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

      {/* Public Offer Prominent Card */}
      <div className="pv-card p-4 flex items-center justify-between border border-[#3A3A3D] bg-[#1A1A1C] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#C8372D]/15 border border-[#C8372D]/30 text-[#C8372D]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold text-[#F4F0EA] tracking-wide">
              Публичная оферта
            </div>
            <div className="text-[11px] text-[#9E9B97]">
              Пользовательское соглашение ПАРТИЗАН
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            triggerHaptic.light();
            setShowOfferModal(true);
          }}
          className="pv-button-secondary text-xs px-3.5 py-2 font-bold text-[#F4F0EA] flex items-center gap-1 shrink-0 active:scale-95"
        >
          <span>Читать</span>
          <ChevronRight className="w-4 h-4 text-[#C8372D]" />
        </button>
      </div>

      {/* Public Offer Modal */}
      <OfferModal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} />

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

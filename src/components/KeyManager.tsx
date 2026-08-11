import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, Smartphone, Apple, AlertTriangle } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface KeyManagerProps {
  subscription: UserSubscription;
  onNavigateToDashboard?: () => void;
}

export const KeyManager: React.FC<KeyManagerProps> = ({ subscription, onNavigateToDashboard }) => {
  const { triggerHaptic, openLink } = useTelegram();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const hasSub = subscription.hasSubscription && subscription.status !== 'inactive';

  const handleCopySubscription = () => {
    if (!hasSub) return;
    triggerHaptic.success();
    navigator.clipboard.writeText(subscription.subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenHapp = () => {
    if (!hasSub) return;
    triggerHaptic.medium();
    window.location.href = `happ://add/${encodeURIComponent(subscription.subscriptionUrl)}`;
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F4F0EA] tracking-tight">
          Управление подпиской
        </h1>
      </div>

      {!hasSub ? (
        <div className="pv-card p-6 text-center space-y-4 border-l-4 border-[#C8372D]">
          <div className="w-12 h-12 rounded-full bg-[#251B1B] border border-[#4A2927] text-[#C8372D] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F4F0EA]">Подписка еще не создана</h3>
            <p className="text-xs text-[#9E9B97] mt-1 leading-relaxed">
              Активируйте 3 дня бесплатного доступа на Главном экране, чтобы получить персональную ссылку подписки VLESS-XHTTP.
            </p>
          </div>
          {onNavigateToDashboard && (
            <button
              onClick={() => {
                triggerHaptic.light();
                onNavigateToDashboard();
              }}
              className="w-full pv-button-primary py-3 text-xs font-bold"
            >
              Перейти к активации триала
            </button>
          )}
        </div>
      ) : (
        <div className="pv-card p-5 space-y-4">
          <div className="text-xs font-bold text-[#F4F0EA] uppercase tracking-wider">
            ПЕРСОНАЛЬНАЯ ССЫЛКА ПОДПИСКИ HAPP VLESS-XHTTP
          </div>

          <div className="bg-[#0E0E10] border border-[#2D2D30] rounded-2xl p-3 text-xs text-[#F4F0EA] font-mono flex items-center justify-between gap-2">
            <span className="truncate">{subscription.subscriptionUrl}</span>
            <button onClick={handleCopySubscription} className="text-[#9E9B97] hover:text-[#F4F0EA] shrink-0">
              {copied ? <Check className="w-4 h-4 text-[#C8372D]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleOpenHapp}
            className="w-full pv-button-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Smartphone className="w-4 h-4" />
            Импортировать подписку в Happ
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
              Показать QR-код
            </button>
          </div>
        </div>
      )}

      {/* Download Happ App Card */}
      <div className="pv-card p-5 space-y-3">
        <div className="text-xs font-bold text-[#F4F0EA] uppercase tracking-wider">
          СКАЧАТЬ КЛИЕНТ HAPP
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openLink('https://apps.apple.com/app/happ-proxy-utility/id6504287905')}
            className="pv-button-secondary p-3.5 text-left transition-all flex items-center gap-3"
          >
            <Apple className="w-6 h-6 text-[#F4F0EA] shrink-0" />
            <div>
              <div className="text-xs text-[#9E9B97]">iOS</div>
              <div className="text-sm font-bold text-[#F4F0EA]">App Store</div>
            </div>
          </button>

          <button
            onClick={() => openLink('https://play.google.com/store/apps/details?id=com.happ.proxy')}
            className="pv-button-secondary p-3.5 text-left transition-all flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F4F0EA] text-[#121212] flex items-center justify-center font-bold text-xs shrink-0">
              ▶
            </div>
            <div>
              <div className="text-xs text-[#9E9B97]">Android</div>
              <div className="text-sm font-bold text-[#F4F0EA]">Play Store</div>
            </div>
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && hasSub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A1A1C] border border-[#2D2D30] w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D30] pb-3">
              <h3 className="text-base font-bold text-[#F4F0EA] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#E07A5F]" />
                QR-код подписки Happ
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-[#9E9B97] hover:text-[#F4F0EA] text-xs bg-[#0E0E10] px-2.5 py-1 rounded-full border border-[#2D2D30]"
              >
                Закрыть
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl my-2">
              <QRCodeSVG value={subscription.subscriptionUrl} size={200} level="M" />
            </div>

            <p className="text-xs text-[#9E9B97] leading-relaxed">
              Откройте сканер в приложении <strong className="text-[#F4F0EA]">Happ</strong> и наведите на данный QR-код.
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

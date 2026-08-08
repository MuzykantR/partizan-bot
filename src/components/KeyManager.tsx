import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, ExternalLink, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface KeyManagerProps {
  subscription: UserSubscription;
}

export const KeyManager: React.FC<KeyManagerProps> = ({ subscription }) => {
  const { triggerHaptic, openLink } = useTelegram();
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
    window.location.href = `happ://add/${encodeURIComponent(subscription.subscriptionUrl)}`;
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-mono text-[#F4F0EA] tracking-tight uppercase flex items-center gap-2">
          УПРАВЛЕНИЕ КЛЮЧОМ <ShieldCheck className="w-6 h-6 text-[#2A9D8F]" />
        </h1>
        <p className="text-xs text-[#9E9B97] mt-1">Скопируйте ссылку подписки или отсканируйте QR-код в Happ</p>
      </div>

      {/* Copy Subscription Card */}
      <div className="pv-card p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold font-mono uppercase tracking-wider text-[#F4F0EA]">
            Персональная ссылка подписки Happ
          </div>
          <span className="pv-badge-mint">
            VLESS-XHTTP
          </span>
        </div>

        {/* Truncated Link Box */}
        <div className="bg-[#121212] border border-[#3A3A3D] rounded-2xl p-3 font-mono text-xs text-[#F4F0EA] break-all flex items-center justify-between gap-2">
          <span className="truncate">{subscription.subscriptionUrl}</span>
        </div>

        {/* Primary CTA: Open Happ */}
        <button
          onClick={handleOpenHapp}
          className="w-full pv-button-primary py-3.5 text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Smartphone className="w-4 h-4" />
          ИМПОРТИРОВАТЬ ПОДПИСКУ В HAPP
        </button>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopySubscription}
            className={`py-3 px-4 rounded-2xl font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 border ${
              copied
                ? 'bg-[#2A9D8F] text-[#F4F0EA] border-[#2A9D8F]'
                : 'bg-[#121212] hover:bg-[#1E1E20] text-[#F4F0EA] border-[#3A3A3D]'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-[#C8372D]" />}
            {copied ? 'СКОПИРОВАНО!' : 'СКОПИРОВАТЬ ССЫЛКУ'}
          </button>

          <button
            onClick={() => {
              triggerHaptic.light();
              setShowQrModal(true);
            }}
            className="bg-[#121212] hover:bg-[#1E1E20] border border-[#3A3A3D] text-[#F4F0EA] font-mono font-bold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <QrCode className="w-4 h-4 text-[#E07A5F]" />
            ПОКАЗАТЬ QR-КОД
          </button>
        </div>
      </div>

      {/* Download Happ App Downloads */}
      <div className="pv-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#F4F0EA] uppercase tracking-wider">
          <Download className="w-4 h-4 text-[#C8372D]" />
          Скачать клиент Happ
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openLink('https://apps.apple.com/app/happ-proxy-utility/id6504287905')}
            className="bg-[#121212] hover:bg-[#1E1E20] border border-[#3A3A3D] rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold font-mono text-[#F4F0EA] flex items-center justify-between">
              Happ for iOS
              <ExternalLink className="w-3.5 h-3.5 text-[#9E9B97] group-hover:text-[#C8372D]" />
            </div>
            <div className="text-[10px] text-[#9E9B97] mt-0.5">App Store</div>
          </button>

          <button
            onClick={() => openLink('https://play.google.com/store/apps/details?id=com.happ.proxy')}
            className="bg-[#121212] hover:bg-[#1E1E20] border border-[#3A3A3D] rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold font-mono text-[#F4F0EA] flex items-center justify-between">
              Happ for Android
              <ExternalLink className="w-3.5 h-3.5 text-[#9E9B97] group-hover:text-[#C8372D]" />
            </div>
            <div className="text-[10px] text-[#9E9B97] mt-0.5">Google Play / APK</div>
          </button>
        </div>
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
              Откройте сканер в приложении <strong className="text-[#F4F0EA]">Happ</strong> и наведите на данный QR-код.
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

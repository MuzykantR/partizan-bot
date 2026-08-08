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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Управление подпиской <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">Скопируйте ссылку подписки или отсканируйте QR-код в Happ</p>
      </div>

      {/* Copy Subscription Card */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Персональная ссылка подписки Happ</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
            VLESS-XHTTP
          </span>
        </div>

        {/* Truncated Link Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-300 break-all flex items-center justify-between gap-2">
          <span className="truncate">{subscription.subscriptionUrl}</span>
        </div>

        {/* Primary CTA: Open Happ */}
        <button
          onClick={handleOpenHapp}
          className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Импортировать подписку в Happ
        </button>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopySubscription}
            className={`py-3 px-4 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            {copied ? 'Скопировано!' : 'Скопировать ссылку'}
          </button>

          <button
            onClick={() => {
              triggerHaptic.light();
              setShowQrModal(true);
            }}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-3 px-4 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            Показать QR-код
          </button>
        </div>
      </div>

      {/* Download Happ App Downloads */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Download className="w-4 h-4 text-indigo-400" />
          Скачать клиент Happ
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openLink('https://apps.apple.com/app/happ-proxy-utility/id6504287905')}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              Happ for iOS
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">App Store</div>
          </button>

          <button
            onClick={() => openLink('https://play.google.com/store/apps/details?id=com.happ.proxy')}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              Happ for Android
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Google Play / APK</div>
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                QR-код подписки Happ
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-full"
              >
                Закрыть
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl my-2">
              <QRCodeSVG value={subscription.subscriptionUrl} size={200} level="M" />
            </div>

            <p className="text-xs text-slate-400">
              Откройте сканер в приложении **Happ** и наведите на данный QR-код.
            </p>

            <button
              onClick={handleCopySubscription}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition-all"
            >
              {copied ? 'Скопировано!' : 'Скопировать ссылку подписки'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

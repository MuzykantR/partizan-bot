import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, ExternalLink, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface KeyManagerProps {
  subscription: UserSubscription;
}

export const KeyManager: React.FC<KeyManagerProps> = ({ subscription }) => {
  const { triggerHaptic } = useTelegram();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const handleCopyLink = () => {
    triggerHaptic.success();
    navigator.clipboard.writeText(subscription.vlessLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenClientApp = (appScheme: string) => {
    triggerHaptic.light();
    window.location.href = `${appScheme}${encodeURIComponent(subscription.vlessLink)}`;
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Управление ключом <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">Скопируйте ссылку или отсканируйте QR-код в вашем клиенте</p>
      </div>

      {/* Copy Key Card */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Персональная VLESS-XHTTP ссылка</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
            TLS 1.3 + Firefox Fingerprint
          </span>
        </div>

        {/* Truncated Key Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-300 break-all flex items-center justify-between gap-2">
          <span className="truncate">{subscription.vlessLink}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopyLink}
            className={`py-3 px-4 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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

      {/* Quick App Connection Links */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          Быстрое импортирование в клиент
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleOpenClientApp('happ://import/')}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              Happ Client
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">iOS & Android (Рекомендуется)</div>
          </button>

          <button
            onClick={() => handleOpenClientApp('streisand://import/')}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              Streisand
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">iOS WebKit Native</div>
          </button>

          <button
            onClick={() => handleOpenClientApp('v2rayng://install-config?url=')}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              v2rayNG
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Android Client</div>
          </button>

          <button
            onClick={() => handleOpenClientApp('sing-box://import-remote-profile?url=')}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              Sing-Box
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Universal Cross-Platform</div>
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                QR-код подписки
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-full"
              >
                Закрыть
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl my-2">
              <QRCodeSVG value={subscription.vlessLink} size={200} level="M" />
            </div>

            <p className="text-xs text-slate-400">
              Откройте камеру в приложении Happ / Streisand / v2rayNG и наведите на данный QR-код.
            </p>

            <button
              onClick={handleCopyLink}
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

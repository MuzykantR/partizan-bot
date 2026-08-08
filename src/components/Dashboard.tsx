import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Copy, Check, QrCode, HardDrive, Clock, Globe, Smartphone, RefreshCw } from 'lucide-react';
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
    // Open Happ with subscription URL deep link or copy
    const happDeepLink = `happ://add/${encodeURIComponent(subscription.subscriptionUrl)}`;
    window.location.href = happDeepLink;
  };

  const usedGb = (subscription.usedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGb = (subscription.totalBytes / (1024 * 1024 * 1024)).toFixed(0);
  const progressPercent = Math.min(100, Math.round((subscription.usedBytes / subscription.totalBytes) * 100));

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Axisforge <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">VLESS-XHTTP</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Управление подпиской Happ VPN</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs text-emerald-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Активна</span>
        </div>
      </div>

      {/* Main Subscription Card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl border border-white/10">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Status Icon */}
        <div className="relative my-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-2xl border-4 border-emerald-300/40 active-pulse">
            <ShieldCheck className="w-12 h-12" />
          </div>
        </div>

        {/* Status Title */}
        <div className="mt-3 space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Подписка в Happ готова</h2>
          <p className="text-xs text-slate-400 max-w-xs">
            Добавьте ссылку подписки в клиент **Happ** для мгновенного доступа ко всем серверам
          </p>
        </div>

        {/* Primary CTA: Add to Happ */}
        <div className="w-full mt-5 space-y-2.5">
          <button
            onClick={handleOpenHapp}
            className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Добавить подписку в Happ
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopySubscription}
              className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </button>

            <button
              onClick={() => {
                triggerHaptic.light();
                setShowQrModal(true);
              }}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              QR-код Happ
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Expiry & Traffic Card */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-indigo-400" />
            Срок действия подписки
          </div>
          <button
            onClick={() => { triggerHaptic.light(); onNavigateToShop(); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Продлить
          </button>
        </div>

        <div className="pt-1">
          <div className="text-2xl font-black text-white tracking-tight">
            {subscription.daysRemaining} <span className="text-sm font-normal text-slate-400">дней осталось</span>
          </div>
          <div className="text-xs text-slate-400">Действует до {subscription.expireDate}</div>
        </div>

        {/* Traffic Progress */}
        <div className="pt-2 space-y-1.5 border-t border-white/5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              Использовано трафика
            </span>
            <span className="text-slate-200">{usedGb} ГБ / {totalGb} ГБ</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Available Servers in Subscription */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Globe className="w-4 h-4 text-emerald-400" />
            Локации в вашей подписке
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            Авто-обновление в Happ
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {subscription.availableLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5"
            >
              <span className="text-xl">{loc.flag}</span>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{loc.country}</div>
                <div className="text-[10px] text-slate-400 truncate">{loc.city}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-xl border border-slate-800/60">
          💡 **Как переключать локации**: После добавления ссылки в **Happ**, вы сможете выбирать и менять любую из этих локаций прямо внутри приложения Happ.
        </p>
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
              Откройте сканер в приложении **Happ** и наведите на этот QR-код для моментального подключения.
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

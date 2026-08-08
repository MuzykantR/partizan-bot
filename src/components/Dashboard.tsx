import React, { useState } from 'react';
import { Power, Globe, Zap, ShieldCheck, ChevronRight, HardDrive, Clock, Sparkles } from 'lucide-react';
import { ServerLocation, UserSubscription } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

interface DashboardProps {
  subscription: UserSubscription;
  onNavigateToShop: () => void;
  onNavigateToKeys: () => void;
}

const AVAILABLE_SERVERS: ServerLocation[] = [
  { id: 'de-aeza', country: 'Германия', city: 'Франкфурт (Aeza)', flag: '🇩🇪', latencyMs: 34, protocol: 'VLESS-XHTTP', isRecommended: true, loadPercentage: 24 },
  { id: 'nl-ams', country: 'Нидерланды', city: 'Амстердам', flag: '🇳🇱', latencyMs: 42, protocol: 'VLESS-XHTTP', loadPercentage: 45 },
  { id: 'fi-hel', country: 'Финляндия', city: 'Хельсинки', flag: '🇫🇮', latencyMs: 28, protocol: 'VLESS-XHTTP', loadPercentage: 18 },
  { id: 'us-nyc', country: 'США', city: 'Нью-Йорк', flag: '🇺🇸', latencyMs: 110, protocol: 'VLESS-XHTTP', loadPercentage: 62 },
];

export const Dashboard: React.FC<DashboardProps> = ({ subscription, onNavigateToShop, onNavigateToKeys }) => {
  const { triggerHaptic } = useTelegram();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [selectedServer, setSelectedServer] = useState<ServerLocation>(subscription.serverLocation);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const toggleConnection = () => {
    triggerHaptic.medium();
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected((prev) => {
        if (!prev) triggerHaptic.success();
        else triggerHaptic.light();
        return !prev;
      });
    }, 900);
  };

  const handleSelectServer = (server: ServerLocation) => {
    triggerHaptic.selection();
    setSelectedServer(server);
    setShowLocationModal(false);
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
            Axisforge <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">XHTTP 2.0</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Безопасный премиум туннель без блокировок</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 text-xs text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{selectedServer.latencyMs} мс</span>
        </div>
      </div>

      {/* Main Status & Toggle Card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-xl border border-white/10">
        {/* Background glow effects */}
        <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl transition-opacity duration-700 ${
          isConnected ? 'bg-emerald-500/20' : 'bg-rose-500/10'
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl transition-opacity duration-700 ${
          isConnected ? 'bg-indigo-500/20' : 'bg-slate-500/10'
        }`} />

        {/* Connection Toggle Button */}
        <div className="relative my-4">
          <button
            onClick={toggleConnection}
            disabled={isConnecting}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none ${
              isConnecting
                ? 'bg-slate-800 border-4 border-amber-500/50 animate-spin-slow'
                : isConnected
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white active-pulse border-4 border-emerald-300/40 shadow-emerald-500/30'
                : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-400 border-4 border-slate-600/40 hover:border-indigo-500/50'
            }`}
          >
            <Power className={`w-14 h-14 transition-transform duration-300 ${isConnected ? 'scale-110' : 'scale-100'}`} />
          </button>
        </div>

        {/* Connection Label */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isConnecting ? 'bg-amber-400 animate-ping' : isConnected ? 'bg-emerald-400' : 'bg-slate-500'
            }`} />
            <span className="text-lg font-bold text-white tracking-wide">
              {isConnecting ? 'Подключение...' : isConnected ? 'Защищено и подключено' : 'Отключено'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {isConnected ? `Трафик зашифрован через ${selectedServer.protocol}` : 'Нажмите кнопку для активации туннеля'}
          </p>
        </div>

        {/* Location Selector Button */}
        <button
          onClick={() => { triggerHaptic.light(); setShowLocationModal(true); }}
          className="mt-5 w-full bg-slate-800/80 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedServer.flag}</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                {selectedServer.country} — {selectedServer.city}
              </div>
              <div className="text-[11px] text-slate-400">Нагрузка: {selectedServer.loadPercentage}% • {selectedServer.protocol}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
            Сменить
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Subscription Status Card */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-indigo-400" />
            Статус подписки
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Активна
          </span>
        </div>

        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {subscription.daysRemaining} <span className="text-sm font-normal text-slate-400">дней осталось</span>
            </div>
            <div className="text-xs text-slate-400">Действует до {subscription.expireDate}</div>
          </div>
          <button
            onClick={() => { triggerHaptic.light(); onNavigateToShop(); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Продлить
          </button>
        </div>

        {/* Traffic Progress */}
        <div className="pt-2 space-y-1.5">
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

      {/* Quick Action Button for Key Management */}
      <button
        onClick={() => { triggerHaptic.light(); onNavigateToKeys(); }}
        className="w-full glass-card hover:bg-white/5 p-3.5 rounded-2xl flex items-center justify-between transition-all group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">Ссылка для подключения (VLESS)</div>
            <div className="text-xs text-slate-400">Скопировать ключ или показать QR-код</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
      </button>

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Выберите сервер
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-full"
              >
                Закрыть
              </button>
            </div>

            <div className="space-y-2">
              {AVAILABLE_SERVERS.map((server) => {
                const isSelected = selectedServer.id === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleSelectServer(server)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-800/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{server.flag}</span>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {server.country} — {server.city}
                          {server.isRecommended && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30">
                              Топ скор
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {server.protocol} • Загрузка {server.loadPercentage}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-emerald-400">{server.latencyMs} мс</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

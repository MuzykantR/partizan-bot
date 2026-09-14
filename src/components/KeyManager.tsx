import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, Smartphone, Apple, AlertTriangle, Monitor, Trash2, RefreshCw, Cpu, ExternalLink } from 'lucide-react';
import { UserSubscription, UserDevice } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';
import { fetchUserDevices, revokeUserDevice, generateSubscriptionLink } from '../services/api';

interface KeyManagerProps {
  subscription: UserSubscription;
  onNavigateToDashboard?: () => void;
}

export const KeyManager: React.FC<KeyManagerProps> = ({ subscription, onNavigateToDashboard }) => {
  const { triggerHaptic, openLink } = useTelegram();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Device Management State
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [maxDevices, setMaxDevices] = useState<number>(3);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);
  const [revokingKey, setRevokingKey] = useState<string | null>(null);

  // Custom dev link generator state
  const [customDevName, setCustomDevName] = useState<string>('');
  const [customSubUrl, setCustomSubUrl] = useState<string>('');
  const [copiedCustom, setCopiedCustom] = useState<boolean>(false);
  const [isGeneratingDev, setIsGeneratingDev] = useState<boolean>(false);

  const hasSub = subscription.hasSubscription && subscription.status !== 'inactive';

  const loadDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const data = await fetchUserDevices();
      setDevices(data.devices || []);
      setMaxDevices(data.maxDevicesCount || 3);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (hasSub) {
      loadDevices();
    }
  }, [hasSub]);

  const handleRevokeDevice = async (key: string) => {
    triggerHaptic.warning();
    if (!window.confirm('Вы действительно хотите отвязать это устройство? Освободившийся слот станет доступен для нового подключения.')) {
      return;
    }
    setRevokingKey(key);
    try {
      const res = await revokeUserDevice(key);
      if (res.success) {
        triggerHaptic.success();
        await loadDevices();
      } else {
        alert(res.message);
      }
    } finally {
      setRevokingKey(null);
    }
  };

  const handleGenerateCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic.light();
    const cleanDev = customDevName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanDev) return;

    setIsGeneratingDev(true);
    try {
      const url = await generateSubscriptionLink(cleanDev);
      setCustomSubUrl(url);
      triggerHaptic.success();
    } finally {
      setIsGeneratingDev(false);
    }
  };

  const handleCopyCustomLink = () => {
    if (!customSubUrl) return;
    triggerHaptic.success();
    navigator.clipboard.writeText(customSubUrl);
    setCopiedCustom(true);
    setTimeout(() => setCopiedCustom(false), 2000);
  };

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
              Активируйте 3 дня бесплатного доступа на Главном экране, чтобы получить персональную ссылку подписки.
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
            ПЕРСОНАЛЬНАЯ ССЫЛКА ПОДПИСКИ HAPP
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

      {/* Active Devices Management (HWID / Slots) */}
      {hasSub && (
        <div className="pv-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#C8372D]" />
              <span className="text-xs font-bold text-[#F4F0EA] uppercase tracking-wider">
                МОИ УСТРОЙСТВА ({devices.length} из {maxDevices})
              </span>
            </div>
            <button
              onClick={() => {
                triggerHaptic.light();
                loadDevices();
              }}
              disabled={isLoadingDevices}
              className="text-[#9E9B97] hover:text-[#F4F0EA] transition-colors p-1"
              title="Обновить список"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDevices ? 'animate-spin text-[#E07A5F]' : ''}`} />
            </button>
          </div>

          {isLoadingDevices && devices.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#9E9B97] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C8372D]" />
              Загрузка подключенных устройств...
            </div>
          ) : devices.length === 0 ? (
            <div className="p-4 bg-[#0E0E10] border border-[#2D2D30] rounded-2xl text-center space-y-1">
              <p className="text-xs text-[#F4F0EA] font-semibold">Нет активных устройств</p>
              <p className="text-[11px] text-[#9E9B97]">
                Импортируйте подписку в Happ на телефоне или ПК — устройство привяжется автоматически.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {devices.map((device) => {
                const isIos = /ios|iphone|ipad|mac/i.test(device.os || '') || /cfnetwork|darwin/i.test(device.user_agent || '');
                const isAndroid = /android/i.test(device.os || '') || /okhttp|happ-android/i.test(device.user_agent || '');

                const formatDate = (isoStr: string) => {
                  try {
                    const d = new Date(isoStr);
                    if (isNaN(d.getTime())) return isoStr;
                    return d.toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  } catch {
                    return isoStr;
                  }
                };

                return (
                  <div
                    key={device.key}
                    className="p-3 bg-[#0E0E10] border border-[#2D2D30] rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#1A1A1C] border border-[#2D2D30] flex items-center justify-center shrink-0">
                        {isIos ? (
                          <Apple className="w-4 h-4 text-[#F4F0EA]" />
                        ) : isAndroid ? (
                          <Smartphone className="w-4 h-4 text-[#E07A5F]" />
                        ) : (
                          <Monitor className="w-4 h-4 text-[#9E9B97]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#F4F0EA] truncate">
                            {device.model || device.os || device.key}
                          </span>
                          {device.is_current && (
                            <span className="text-[10px] bg-[#C8372D]/20 text-[#C8372D] px-1.5 py-0.5 rounded font-mono font-bold">
                              текущее
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#9E9B97] truncate">
                          {device.last_ip ? `IP: ${device.last_ip} • ` : ''}
                          Активность: {formatDate(device.last_seen)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevokeDevice(device.key)}
                      disabled={revokingKey === device.key}
                      className="p-2 text-[#9E9B97] hover:text-[#C8372D] hover:bg-[#C8372D]/10 rounded-xl transition-all shrink-0"
                      title="Отвязать устройство"
                    >
                      {revokingKey === device.key ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C8372D]" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-[11px] text-[#9E9B97] leading-relaxed bg-[#1A1A1C] p-3 rounded-xl border border-[#2D2D30]">
            💡 Допустимо до <strong className="text-[#F4F0EA]">{maxDevices} устройств</strong> на одну подписку. При смене телефона отвяжите старое устройство кнопкой корзины.
          </div>
        </div>
      )}

      {/* Dev-specific Link Generator Card */}
      {hasSub && (
        <div className="pv-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-[#E07A5F]" />
            <span className="text-xs font-bold text-[#F4F0EA] uppercase tracking-wider">
              ССЫЛКА ДЛЯ КОНКРЕТНОГО УСТРОЙСТВА
            </span>
          </div>

          <p className="text-xs text-[#9E9B97] leading-relaxed">
            Если вы настраиваете Happ на втором телефоне или ПК (например, «iPhone_Alex» или «Home_Mac»), создайте именную ссылку для независимой телеметрии устройства.
          </p>

          <form onSubmit={handleGenerateCustomLink} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customDevName}
                onChange={(e) => setCustomDevName(e.target.value)}
                placeholder="Имя: iphone, macbook, tv..."
                maxLength={32}
                className="flex-1 bg-[#0E0E10] border border-[#2D2D30] rounded-xl px-3 py-2.5 text-xs text-[#F4F0EA] placeholder-[#666] focus:outline-none focus:border-[#C8372D] transition-colors"
              />
              <button
                type="submit"
                disabled={!customDevName.trim() || isGeneratingDev}
                className="pv-button-primary px-4 py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isGeneratingDev ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Создать'
                )}
              </button>
            </div>
          </form>

          {customSubUrl && (
            <div className="space-y-2 pt-2 border-t border-[#2D2D30]">
              <div className="text-[11px] text-[#9E9B97] font-semibold">Именная ссылка для {customDevName}:</div>
              <div className="bg-[#0E0E10] border border-[#2D2D30] rounded-xl p-2.5 text-xs text-[#F4F0EA] font-mono flex items-center justify-between gap-2">
                <span className="truncate">{customSubUrl}</span>
                <button
                  onClick={handleCopyCustomLink}
                  className="text-[#9E9B97] hover:text-[#F4F0EA] shrink-0"
                >
                  {copiedCustom ? <Check className="w-4 h-4 text-[#C8372D]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleCopyCustomLink}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all border ${
                  copiedCustom
                    ? 'bg-[#C8372D]/20 border-[#C8372D] text-[#C8372D]'
                    : 'bg-[#1A1A1C] border-[#2D2D30] text-[#F4F0EA] hover:border-[#9E9B97]'
                }`}
              >
                {copiedCustom ? 'Ссылка скопирована!' : 'Скопировать именную ссылку'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Download Happ App Card */}
      <div className="pv-card p-5 space-y-3">
        <div className="text-xs font-bold text-[#F4F0EA] uppercase tracking-wider">
          СКАЧАТЬ КЛИЕНТ HAPP
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openLink('https://apps.apple.com/us/app/happ-proxy-utility/id6504287215')}
            className="pv-button-secondary p-3.5 text-left transition-all flex items-center gap-3"
          >
            <Apple className="w-6 h-6 text-[#F4F0EA] shrink-0" />
            <div>
              <div className="text-xs text-[#9E9B97]">iOS</div>
              <div className="text-sm font-bold text-[#F4F0EA]">App Store</div>
            </div>
          </button>

          <button
            onClick={() => openLink('https://play.google.com/store/apps/details?id=com.happproxy')}
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

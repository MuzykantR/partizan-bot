import React, { useState } from 'react';
import { CreditCard, Check, Tag, Zap, Info } from 'lucide-react';
import { SubscriptionPlan } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1m',
    name: '1 Месяц',
    durationMonths: 1,
    priceRub: 149,
    priceStars: 100,
    priceUsdt: 1.6,
    features: ['Протокол VLESS-XHTTP', 'Безлимитный VPN трафик', '20 ГБ для «Белых списков»', 'До 5 устройств одновременно'],
  },
  {
    id: 'plan-3m',
    name: '3 Месяца',
    durationMonths: 3,
    priceRub: 399,
    priceStars: 260,
    priceUsdt: 4.2,
    popularBadge: true,
    discountPercentage: 12,
    features: ['Всё, что в 1 месяце', 'Скидка 12%', 'Приоритетные серверы Aeza', 'Выделенный саппорт 24/7'],
  },
  {
    id: 'plan-12m',
    name: '1 Год',
    durationMonths: 12,
    priceRub: 1190,
    priceStars: 790,
    priceUsdt: 12.5,
    discountPercentage: 33,
    features: ['Максимальная выгода 33%', 'Фиксированная цена на год', 'Резервный VLESS-Reality ключ', 'До 10 устройств'],
  },
];

export const SubscriptionShop: React.FC = () => {
  const { triggerHaptic } = useTelegram();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(PLANS[1]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic.light();
    if (promoCode.trim().toUpperCase() === 'VIBEVIP' || promoCode.trim().toUpperCase() === 'TELEGRAM' || promoCode.trim().toUpperCase() === 'PARTIZAN') {
      setPromoApplied(true);
      setPromoError('');
      triggerHaptic.success();
    } else {
      setPromoError('Неверный промокод');
      triggerHaptic.error();
    }
  };

  const handlePayRubles = () => {
    triggerHaptic.medium();
    const finalPrice = promoApplied ? Math.round(selectedPlan.priceRub * 0.9) : selectedPlan.priceRub;
    
    /* 
    ========================================================================
    ОРИГИНАЛЬНАЯ ЛОГИКА ОПЛАТЫ (ЗАКОММЕНТИРОВАНА ПО ТРЕБОВАНИЮ ПОЛЬЗОВАТЕЛЯ):
    ------------------------------------------------------------------------
    // API запрос на генерацию счета/эквайринга (СБП / ЮMoney / Telegram Stars)
    // const paymentUrl = await createPaymentInvoice(selectedPlan.id, finalPrice);
    // window.Telegram.WebApp.openInvoice(paymentUrl);
    ========================================================================
    */

    // Демонстрационный режим:
    setPaymentSuccessMessage(`Демонстрационный режим: Тариф «${selectedPlan.name}» (${finalPrice} ₽) отображен. Оплата пока не списывается.`);
    setShowPaymentModal(false);
    triggerHaptic.success();
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#F4F0EA] tracking-tight">
          Тарифные планы
        </h1>
      </div>

      {paymentSuccessMessage && (
        <div className="bg-[#1F1616] border border-[#C8372D] rounded-2xl p-4 text-[#F4F0EA] text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#C8372D] shrink-0" />
            <span className="text-xs leading-relaxed">{paymentSuccessMessage}</span>
          </div>
          <button onClick={() => setPaymentSuccessMessage('')} className="text-xs text-[#C8372D] font-bold underline shrink-0">OK</button>
        </div>
      )}

      {/* Tariff Cards */}
      <div className="space-y-3.5">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const discountedPrice = promoApplied ? Math.round(plan.priceRub * 0.9) : plan.priceRub;

          return (
            <div
              key={plan.id}
              onClick={() => {
                triggerHaptic.selection();
                setSelectedPlan(plan);
              }}
              className={`pv-card p-5 relative border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#C8372D] bg-[#1A1A1C] ring-1 ring-[#C8372D]/60 shadow-xl'
                  : 'border-[#2D2D30] hover:border-[#F4F0EA]/20'
              }`}
            >
              {plan.popularBadge && (
                <div className="absolute -top-3 right-6 pv-badge-amber">
                  ХИТ ПРОДАЖ
                </div>
              )}

              {plan.discountPercentage && !plan.popularBadge && (
                <div className="absolute -top-3 right-6 pv-badge-red">
                  СКИДКА {plan.discountPercentage}%
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#C8372D] bg-[#C8372D]' : 'border-[#9E9B97]'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="flex-1">
                  <div className="text-lg font-bold text-[#F4F0EA]">
                    {plan.name} - {discountedPrice} ₽ <span className="text-xs font-normal text-[#9E9B97]">/ {plan.durationMonths} мес</span>
                  </div>

                  <p className="text-xs text-[#9E9B97] mt-1 leading-relaxed">
                    Надёжный VLESS-XHTTP туннель, высокая скорость и обход всех блокировок.
                  </p>
                </div>
              </div>

              {isSelected && (
                <ul className="mt-4 pt-3 border-t border-[#2D2D30] space-y-1.5 pl-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-[#F4F0EA] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C8372D] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Promo Code Form */}
      <form onSubmit={handleApplyPromo} className="flex gap-2">
        <div className="flex-1 bg-[#1A1A1C] border border-[#2D2D30] rounded-2xl px-4 py-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#C8372D] shrink-0" />
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Введите промокод"
            className="bg-transparent text-sm text-[#F4F0EA] placeholder-[#9E9B97] focus:outline-none w-full"
          />
        </div>
        <button
          type="submit"
          className="pv-button-primary px-5 text-sm font-bold shrink-0"
        >
          {promoApplied ? 'Применён' : 'Применить'}
        </button>
      </form>
      {promoError && <p className="text-xs text-[#C8372D] px-1 font-bold">{promoError}</p>}

      {/* Pay CTA Button */}
      <button
        onClick={() => {
          triggerHaptic.medium();
          setShowPaymentModal(true);
        }}
        className="w-full pv-button-primary py-4 text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Zap className="w-5 h-5 fill-current" />
        Оплатить подписку «{selectedPlan.name}»
      </button>

      {/* Payment Selector Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1A1A1C] border border-[#2D2D30] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2D30] pb-3">
              <h3 className="text-base font-bold text-[#F4F0EA]">Способ оплаты</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#9E9B97] hover:text-[#F4F0EA] text-xs bg-[#0E0E10] px-2.5 py-1 rounded-full border border-[#2D2D30]"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handlePayRubles}
                className="w-full bg-[#0E0E10] hover:bg-[#251B1B] border border-[#C8372D]/50 p-4 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8372D]/20 text-[#C8372D] flex items-center justify-center border border-[#C8372D]/30">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-[#F4F0EA]">Демонстрационная оплата</div>
                    <div className="text-xs text-[#9E9B97]">МИР, СБП, СберПэй, T-Pay (без списания)</div>
                  </div>
                </div>
                <div className="text-base font-bold text-[#F4F0EA]">
                  {promoApplied ? Math.round(selectedPlan.priceRub * 0.9) : selectedPlan.priceRub} ₽
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

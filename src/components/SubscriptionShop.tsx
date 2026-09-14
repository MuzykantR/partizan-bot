import React, { useState } from 'react';
import { CreditCard, Check, Tag, Zap, Info, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '../types/vpn';
import { useTelegram } from '../hooks/useTelegram';
import { validatePromoCode, processPayment } from '../services/api';

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

interface SubscriptionShopProps {
  onSubscriptionUpdate?: () => void;
}

export const SubscriptionShop: React.FC<SubscriptionShopProps> = ({ onSubscriptionUpdate }) => {
  const { triggerHaptic } = useTelegram();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(PLANS[1]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedCode, setAppliedCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string>('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic.light();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setIsValidatingPromo(true);
    try {
      const res = await validatePromoCode(code);
      if (res.valid) {
        setAppliedCode(code);
        setPromoError('');
        setPromoSuccessMsg(res.message);
        triggerHaptic.success();
        setSelectedPlan(PLANS[0]);
      } else {
        setAppliedCode('');
        setPromoError(res.message || 'Неверный промокод');
        setPromoSuccessMsg('');
        triggerHaptic.error();
      }
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (appliedCode === 'ПЕРМЬ' || appliedCode === 'PERM') {
      if (plan.id === 'plan-1m') return 0;
    }
    return plan.priceRub;
  };

  const handlePayClick = async () => {
    triggerHaptic.medium();
    const finalPrice = getPlanPrice(selectedPlan);

    // 0 RUB promo activation flow (no modal!)
    if (finalPrice === 0) {
      setIsProcessing(true);
      try {
        const res = await processPayment(selectedPlan.id, appliedCode);
        if (res.success) {
          triggerHaptic.success();
          setPaymentSuccessMessage(res.message);
          if (onSubscriptionUpdate) {
            onSubscriptionUpdate();
          }
        } else {
          triggerHaptic.error();
          setPaymentSuccessMessage(res.message || 'Ошибка активации подписки');
        }
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For paid plans, open demo payment choice modal
    setShowPaymentModal(true);
  };

  const handlePayRublesModal = () => {
    triggerHaptic.medium();
    const finalPrice = getPlanPrice(selectedPlan);
    
    /* 
    ========================================================================
    ОРИГИНАЛЬНАЯ ЛОГИКА ОПЛАТЫ (ЗАКОММЕНТИРОВАНА ПО ТРЕБОВАНИЮ ПОЛЬЗОВАТЕЛЯ):
    ------------------------------------------------------------------------
    // API запрос на генерацию счета/эквайринга (СБП / ЮMoney / Telegram Stars)
    // const paymentUrl = await createPaymentInvoice(selectedPlan.id, finalPrice);
    // window.Telegram.WebApp.openInvoice(paymentUrl);
    ========================================================================
    */

    setPaymentSuccessMessage(`Демонстрационный режим: Заказ на тариф «${selectedPlan.name}» (${finalPrice} ₽) оформлен. Оплата пока не списывается.`);
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

      {/* Tariff Cards */}
      <div className="space-y-3.5">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const discountedPrice = getPlanPrice(plan);

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
                    {plan.name} - <span className={discountedPrice === 0 ? 'text-[#C8372D]' : ''}>{discountedPrice} ₽</span> <span className="text-xs font-normal text-[#9E9B97]">/ {plan.durationMonths} мес</span>
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
            placeholder="ПРОМОКОД"
            className="bg-transparent text-sm text-[#F4F0EA] placeholder-[#9E9B97] focus:outline-none w-full uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={isValidatingPromo}
          className="pv-button-primary px-5 text-sm font-bold shrink-0 flex items-center gap-1"
        >
          {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : (appliedCode ? 'Применён' : 'Применить')}
        </button>
      </form>

      {appliedCode && (
        <p className="text-xs text-emerald-400 px-1 font-bold">
          {promoSuccessMsg || `Промокод «${appliedCode}» успешно применён! Тариф 1 месяц за 0 ₽`}
        </p>
      )}
      {promoError && <p className="text-xs text-[#C8372D] px-1 font-bold">{promoError}</p>}

      {/* Payment Result Notice (Between Promo and Pay Button) */}
      {paymentSuccessMessage && (
        <div className="bg-[#1F1616] border border-[#C8372D] rounded-2xl p-4 text-[#F4F0EA] text-sm flex items-center justify-between shadow-xl my-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#C8372D] shrink-0" />
            <span className="text-xs leading-relaxed">{paymentSuccessMessage}</span>
          </div>
          <button onClick={() => setPaymentSuccessMessage('')} className="text-xs text-[#C8372D] font-bold underline shrink-0">OK</button>
        </div>
      )}

      {/* Pay CTA Button (Strictly "Оплатить") */}
      <button
        onClick={handlePayClick}
        disabled={isProcessing}
        className="w-full pv-button-primary py-4 text-base font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl shadow-[#C8372D]/30"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Обработка...</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 fill-current" />
            <span>Оплатить ({getPlanPrice(selectedPlan)} ₽)</span>
          </>
        )}
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
                onClick={handlePayRublesModal}
                className="w-full bg-[#0E0E10] hover:bg-[#251B1B] border border-[#C8372D]/50 p-4 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8372D]/20 text-[#C8372D] flex items-center justify-center border border-[#C8372D]/30">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-[#F4F0EA]">Демонстрационная оплата</div>
                    <div className="text-xs text-[#9E9B97]">МИР, СБП, СберПэй, T-Pay</div>
                  </div>
                </div>
                <div className="text-base font-bold text-[#F4F0EA]">
                  {getPlanPrice(selectedPlan)} ₽
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

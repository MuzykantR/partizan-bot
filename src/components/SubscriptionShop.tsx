import React, { useState } from 'react';
import { CreditCard, Star, Coins, Check, Tag, ShieldCheck, Zap } from 'lucide-react';
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
  const { triggerHaptic, webApp } = useTelegram();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(PLANS[1]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string>('');

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

  const handlePayStars = () => {
    triggerHaptic.medium();
    if (webApp?.openInvoice) {
      webApp.openInvoice('https://t.me/$invoice_demo_hash', (status) => {
        if (status === 'paid') {
          triggerHaptic.success();
          setPaymentSuccessMessage('Оплата Telegram Stars успешно завершена!');
          setShowPaymentModal(false);
        }
      });
    } else {
      alert(`Оплата ${selectedPlan.priceStars} Telegram Stars инициирована`);
      setShowPaymentModal(false);
    }
  };

  const handlePayCrypto = () => {
    triggerHaptic.medium();
    alert(`Переход к оплате через Crypto Pay (${selectedPlan.priceUsdt} USDT)...`);
    setShowPaymentModal(false);
  };

  const handlePayCard = () => {
    triggerHaptic.medium();
    setPaymentSuccessMessage(`Заказ на сумму ${selectedPlan.priceRub} ₽ оформлен!`);
    setShowPaymentModal(false);
    triggerHaptic.success();
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-mono text-[#F4F0EA] tracking-tight uppercase flex items-center gap-2">
          КАССА И ТАРИФЫ 🔥
        </h1>
        <p className="text-xs text-[#9E9B97] mt-1">Выберите подходящий период подписки PARTIZAN VPN</p>
      </div>

      {paymentSuccessMessage && (
        <div className="bg-[#2A9D8F]/20 border border-[#2A9D8F]/40 rounded-2xl p-4 text-[#F4F0EA] text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2A9D8F]" />
            <span>{paymentSuccessMessage}</span>
          </div>
          <button onClick={() => setPaymentSuccessMessage('')} className="text-xs text-[#2A9D8F] underline">OK</button>
        </div>
      )}

      {/* Plan Cards */}
      <div className="space-y-3">
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
                  ? 'border-[#C8372D] bg-[#C8372D]/10 ring-1 ring-[#C8372D]/40 shadow-xl'
                  : 'border-[#3A3A3D] hover:border-[#F4F0EA]/30'
              }`}
            >
              {plan.popularBadge && (
                <div className="absolute -top-3 right-6 pv-badge-stencil shadow-lg">
                  ХИТ ПРОДАЖ 🔥
                </div>
              )}

              {plan.discountPercentage && !plan.popularBadge && (
                <div className="absolute -top-3 right-6 pv-badge-mint">
                  СКИДКА {plan.discountPercentage}%
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold font-mono text-[#F4F0EA] uppercase">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black font-mono text-[#F4F0EA] tracking-tight">{discountedPrice} ₽</span>
                    {promoApplied && (
                      <span className="text-xs text-[#9E9B97] line-through">{plan.priceRub} ₽</span>
                    )}
                    <span className="text-xs text-[#9E9B97]">/ {plan.durationMonths} мес</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#E07A5F]/10 border border-[#E07A5F]/30 text-[#E07A5F] text-xs px-2.5 py-1 rounded-xl font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#E07A5F]" />
                  <span>{plan.priceStars}</span>
                </div>
              </div>

              {/* Features list */}
              <ul className="mt-4 pt-3 border-t border-[#3A3A3D] space-y-1.5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="text-xs text-[#F4F0EA] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Promo Code Form */}
      <form onSubmit={handleApplyPromo} className="pv-card p-3.5 flex gap-2 items-center">
        <Tag className="w-4 h-4 text-[#C8372D] shrink-0 ml-1" />
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Промокод (например PARTIZAN)"
          className="bg-transparent text-xs text-[#F4F0EA] placeholder-[#9E9B97] focus:outline-none flex-1 font-mono uppercase"
        />
        <button
          type="submit"
          className="bg-[#121212] hover:bg-[#1E1E20] text-[#F4F0EA] font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-[#3A3A3D] transition-colors"
        >
          {promoApplied ? 'ПРИМЕНЁН (-10%)' : 'ПРИМЕНИТЬ'}
        </button>
      </form>
      {promoError && <p className="text-xs text-[#C8372D] px-1 font-bold font-mono">{promoError}</p>}

      {/* Pay CTA Button */}
      <button
        onClick={() => {
          triggerHaptic.medium();
          setShowPaymentModal(true);
        }}
        className="w-full pv-button-primary py-4 text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Zap className="w-4 h-4 fill-current" />
        ОПЛАТИТЬ ПОДПИСКУ «{selectedPlan.name.toUpperCase()}»
      </button>

      {/* Payment Selector Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1E1E20] border border-[#3A3A3D] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3D] pb-3">
              <h3 className="text-base font-bold font-mono text-[#F4F0EA] uppercase">Способ оплаты</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#9E9B97] hover:text-[#F4F0EA] text-xs bg-[#121212] px-2.5 py-1 rounded-full border border-[#3A3A3D]"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Telegram Stars */}
              <button
                onClick={handlePayStars}
                className="w-full bg-[#121212] hover:bg-[#1E1E20] border border-[#E07A5F]/40 p-3.5 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center border border-[#E07A5F]/30">
                    <Star className="w-5 h-5 fill-[#E07A5F]" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono text-[#F4F0EA]">Telegram Stars</div>
                    <div className="text-xs text-[#9E9B97]">Покупка звёздами внутри Telegram</div>
                  </div>
                </div>
                <div className="text-sm font-bold font-mono text-[#E07A5F]">{selectedPlan.priceStars} Stars</div>
              </button>

              {/* Crypto Pay */}
              <button
                onClick={handlePayCrypto}
                className="w-full bg-[#121212] hover:bg-[#1E1E20] border border-[#3A3A3D] p-3.5 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2A9D8F]/20 text-[#2A9D8F] flex items-center justify-center border border-[#2A9D8F]/30">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono text-[#F4F0EA]">Crypto Bot (USDT / TON)</div>
                    <div className="text-xs text-[#9E9B97]">Оплата криптовалютой</div>
                  </div>
                </div>
                <div className="text-sm font-bold font-mono text-[#2A9D8F]">{selectedPlan.priceUsdt} USDT</div>
              </button>

              {/* Bank Cards / SBP */}
              <button
                onClick={handlePayCard}
                className="w-full bg-[#121212] hover:bg-[#1E1E20] border border-[#3A3A3D] p-3.5 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C8372D]/20 text-[#C8372D] flex items-center justify-center border border-[#C8372D]/30">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono text-[#F4F0EA]">Банковская карта / СБП</div>
                    <div className="text-xs text-[#9E9B97]">МИР, Visa, MasterCard</div>
                  </div>
                </div>
                <div className="text-sm font-bold font-mono text-[#F4F0EA]">
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

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
    features: ['VLESS-XHTTP протокол', 'Безлимит по скорости (1 Гбит/с)', 'До 5 устройств одновременно', 'Доступ ко всем локациям'],
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
    if (promoCode.trim().toUpperCase() === 'VIBEVIP' || promoCode.trim().toUpperCase() === 'TELEGRAM') {
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
      // In production: server generates invoice URL via Bot API createInvoiceLink
      // Demo invoice link format trigger
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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Тарифные планы <SparklesIcon />
        </h1>
        <p className="text-xs text-slate-400 mt-1">Выберите подходящую подписку для вашей защиты</p>
      </div>

      {paymentSuccessMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{paymentSuccessMessage}</span>
          </div>
          <button onClick={() => setPaymentSuccessMessage('')} className="text-xs text-emerald-400 underline">OK</button>
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
              className={`glass-panel rounded-3xl p-5 relative border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/40 shadow-xl'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popularBadge && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-lg">
                  Хит продаж 🔥
                </div>
              )}

              {plan.discountPercentage && !plan.popularBadge && (
                <div className="absolute -top-3 right-6 bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Скидка {plan.discountPercentage}%
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white tracking-tight">{discountedPrice} ₽</span>
                    {promoApplied && (
                      <span className="text-xs text-slate-400 line-through">{plan.priceRub} ₽</span>
                    )}
                    <span className="text-xs text-slate-400">/ {plan.durationMonths} мес</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-xl font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{plan.priceStars}</span>
                </div>
              </div>

              {/* Features list */}
              <ul className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Promo Code Form */}
      <form onSubmit={handleApplyPromo} className="glass-card rounded-2xl p-3.5 flex gap-2 items-center">
        <Tag className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Промокод (например VIBEVIP)"
          className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 font-medium"
        />
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
        >
          {promoApplied ? 'Применён (-10%)' : 'Применить'}
        </button>
      </form>
      {promoError && <p className="text-xs text-rose-400 px-1 font-medium">{promoError}</p>}

      {/* Pay CTA Button */}
      <button
        onClick={() => {
          triggerHaptic.medium();
          setShowPaymentModal(true);
        }}
        className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-white" />
        Оплатить подписку «{selectedPlan.name}»
      </button>

      {/* Payment Selector Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Способ оплаты</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-full"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Telegram Stars */}
              <button
                onClick={handlePayStars}
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">Telegram Stars</div>
                    <div className="text-xs text-slate-400">Мгновенная покупка внутри Telegram</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-amber-300">{selectedPlan.priceStars} Stars</div>
              </button>

              {/* Crypto Pay */}
              <button
                onClick={handlePayCrypto}
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">Crypto Bot (USDT / TON)</div>
                    <div className="text-xs text-slate-400">Оплата криптовалютой</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-400">{selectedPlan.priceUsdt} USDT</div>
              </button>

              {/* Bank Cards / SBP */}
              <button
                onClick={handlePayCard}
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">Банковская карта / СБП</div>
                    <div className="text-xs text-slate-400">МИР, Visa, MasterCard</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">
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

const SparklesIcon = () => (
  <span className="inline-block animate-pulse text-amber-400 text-lg">✨</span>
);

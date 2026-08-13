import React from 'react';
import { X, FileText, ShieldAlert } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1C] border border-[#3A3A3D] w-full max-w-lg rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A3A3D] bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C8372D]/10 border border-[#C8372D]/30 text-[#C8372D]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#F4F0EA] tracking-wide uppercase font-mono">
                Публичная Оферта
              </h3>
              <p className="text-[11px] text-[#9E9B97]">Пользовательское соглашение ПАРТИЗАН</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#252528] text-[#9E9B97] hover:text-[#F4F0EA] border border-[#3A3A3D] transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-[#D8D4CE] space-y-4 leading-relaxed custom-scrollbar">
          <div className="bg-[#121212] p-3.5 rounded-2xl border border-[#3A3A3D] text-[11px] text-[#9E9B97]">
            <p><strong className="text-[#F4F0EA]">Редакция:</strong> 13 августа 2026 года</p>
            <p><strong className="text-[#F4F0EA]">Сервис:</strong> ПАРТИЗАН (PARTIZAN VPN)</p>
          </div>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              ПРЕАМБУЛА
            </h4>
            <p>
              Настоящий документ представляет собой официальное публичное предложение (Публичную оферту в соответствии со ст. 437 и ст. 438 ГК РФ) Администрации сервиса <strong>ПАРТИЗАН</strong> («Исполнитель») заключить Договор об оказании информационно-технологических (IT) услуг по предоставлению доступа к удаленным вычислительным мощностям и зашифрованному сетевому туннелю.
            </p>
            <p>
              Любое физическое или юридическое лицо («Пользователь»), совершающее акцепт настоящей Оферты посредством оплаты Тарифа или активации авторизационного токена, безоговорочно принимает все условия настоящего Договора.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              1. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[#9E9B97]">
              <li><strong className="text-[#F4F0EA]">Сервис ПАРТИЗАН</strong> — программно-аппаратный комплекс Исполнителя для обеспечения безопасной передачи данных.</li>
              <li><strong className="text-[#F4F0EA]">Авторизационный токен</strong> — уникальная зашифрованная строка данных (QR-код/ссылка) для авторизации устройства по протоколу VLESS/XHTTP.</li>
              <li><strong className="text-[#F4F0EA]">Тариф / Подписка</strong> — размер платы за предоставление доступа к Услугам на определенный период.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              2. ПРЕДМЕТ ДОГОВОРА И ПРАВОВАЯ ПОЗИЦИЯ
            </h4>
            <p>
              Исполнитель предоставляет доступ к вычислительным мощностям удаленного узла для защиты пользовательского трафика в публичных и незащищенных сетях (Wi-Fi, сотовые сети).
            </p>
            <div className="bg-[#1F1616] border border-[#C8372D]/40 p-3 rounded-2xl flex items-start gap-2 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-[#C8372D] shrink-0 mt-0.5" />
              <p className="text-[#F4F0EA]">
                Сервис является инструментальным средством обеспечения конфиденциальности. Сервис НЕ предназначен и НЕ позиционируется для нарушения или обхода законодательства РФ.
              </p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              3. ПОРЯДОК ЗАКЛЮЧЕНИЯ И АКЦЕПТ
            </h4>
            <p>
              Акцептом настоящей Оферты признается: оплата Тарифа, нажатие кнопок «Активировать» / «Старт» в Telegram-боте, либо использование Авторизационного токена.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              4. ПРАВИЛА ДОПУСТИМОГО ИСПОЛЬЗОВАНИЯ (FAIR USE)
            </h4>
            <p className="text-[#9E9B97]">Пользователю категорически запрещается использовать Сервис для:</p>
            <ul className="list-disc pl-4 space-y-1 text-[#9E9B97]">
              <li>Массовых рассылок (СПАМ) и сетевых атак (DDoS).</li>
              <li>Создания и распространения вредоносного ПО и фишинга.</li>
              <li>Совершения любых действий, нарушающих законодательство РФ.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              5. КОНФИДЕНЦИАЛЬНОСТЬ И ПОЛИТИКА NO-LOGS (152-ФЗ)
            </h4>
            <p>
              Исполнитель соблюдает нормы 152-ФЗ. Единственным идентификатором является обезличенный Telegram ID.
            </p>

            <div className="bg-[#121212] p-3 rounded-2xl border border-[#3A3A3D] space-y-1 text-[11px]">
              <p className="font-bold text-[#F4F0EA]">Политика отсутствия логов (No-Logs):</p>
              <p className="text-[#9E9B97]">
                Исполнитель НЕ фиксирует и НЕ хранит историю посещенных сайтов, содержимое сетевого трафика, DNS-запросы и реальные IP-адреса пользователей. Все данные шифруются на устройстве пользователя.
              </p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[#F4F0EA] uppercase font-mono text-[#C8372D]">
              6. РЕКВИЗИТЫ И ПОДДЕРЖКА
            </h4>
            <p className="text-[#9E9B97]">
              Официальная поддержка в Telegram: <span className="text-[#F4F0EA] font-mono">@axisforge_support_bot</span><br />
              Email для правовых вопросов: <span className="text-[#F4F0EA] font-mono">support@axisforge.tech</span>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3A3A3D] bg-[#121212]">
          <button
            onClick={onClose}
            className="w-full pv-button-primary py-3 text-xs font-bold font-mono tracking-wider uppercase"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

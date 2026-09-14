# 🛡️ ПАРТИЗАН VPN — Telegram Mini App (TWA) & Bot Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-yellow.svg?logo=python)](https://www.python.org/)
[![aiogram](https://img.shields.io/badge/aiogram-3.15-2CA5E0.svg?logo=telegram)](https://github.com/aiogram/aiogram)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Production-ready платформа для VPN-сервиса нового поколения: нативный **Telegram Mini App (TWA)** с темной темой, асинхронный **Telegram-бот на aiogram 3.x**, REST API на **FastAPI** и прямая интеграция с ядром управления **Marzban REST API** (VLESS-XHTTP over TLS).

---

## 🌟 Ключевые возможности

### 📱 Frontend: Telegram Mini App (TWA)
* **Нативный мобильный UX:** Поддержка системной палитры Telegram, авто-разворачивание на весь экран (`WebApp.expand()`), тактильный отклик (`HapticFeedback`) на ключевые действия.
* **1-Tap интеграция с клиентом HAPP:** Мгновенный импорт подписки по протоколу `happ://add/<subscription_url>` через безопасный скрытый iframe без браузерных ошибок `ERR_UNKNOWN_URL_SCHEME`.
* **Управление ключами и QR:** Интерактивное отображение QR-кода подписки, копирование ссылки в буфер обмена и ссылки на официальные приложения в App Store и Google Play.
* **Магазин тарифов и промокоды:** Гибкая сетка подписок, валидация промокодов с мгновенным выпуском ключа при стоимости 0 ₽ без модальных окон оплаты.
* **Реферальная система («Партизанский отряд»):** Персональные реферальные ссылки, статистика приглашенных пользователей и автоматическое начисление бонусных дней (+7 дней за друга).
* **Безопасность (Telegram Guard):** Защитный экран, предотвращающий доступ к приложению вне клиента Telegram.

### ⚙️ Backend: Bot & REST API
* **Строгая HMAC-SHA256 валидация:** Проверка криптографической подписи `initData` от Telegram с отклонением неавторизованных запросов (`401 Unauthorized`).
* **Асинхронный клиент Marzban:** Пул соединений `httpx.AsyncClient`, автоматическое переподключение и обновление JWT-токенов администратора, динамическая генерация подписок `/v2ray-json`.
* **Высокопроизводительная БД (SQLite WAL):** Транзакционность, пул соединений, режим Write-Ahead Logging (`PRAGMA journal_mode=WAL;`) и защита от блокировок при параллельных запросах.
* **Двойной режим бота:** Поддержка как классического Polling с авто-переподключением при сбоях сети, так и продакшн Webhook с валидацией секретного токена.

---

## 🏗️ Архитектура системы

```mermaid
graph TD
    User([Пользователь Telegram]) -->|Запуск бота /start| Bot[aiogram 3.x Bot]
    User -->|Открытие Mini App| TWA[React 18 + Vite TWA]
    
    subgraph Frontend [Клиентская часть TWA]
        TWA --> SDK[@telegram-apps/sdk-react]
        TWA --> UIComponents[Экран Dashboard / Тарифы / Ключи / Профиль]
    end
    
    subgraph Backend [Бэкенд-сервисы]
        TWA -->|REST API с initData| FastAPI[FastAPI REST API Server]
        FastAPI --> Auth[HMAC-SHA256 Auth Guard]
        Auth --> Endpoints[/api/v1/user/*]
        Endpoints --> DB[(SQLite Database: WAL mode)]
        Endpoints --> MarzbanClient[Marzban Async Client]
    end
    
    subgraph VPN_Infrastructure [Инфраструктура VPN]
        MarzbanClient -->|JWT REST API| MarzbanAPI[Marzban Control Plane]
        MarzbanAPI --> Xray[Xray Core v26.x / VLESS-XHTTP]
        User -->|1-тап импорт| Happ[HAPP Client iOS / Android]
        Happ -.->|VLESS-XHTTP Tunnel| Xray
    end
```

---

## 📁 Структура проекта

```text
.
├── bot/                       # Python Backend & Telegram Bot
│   ├── api.py                 # FastAPI роутеры и валидация запросов
│   ├── auth.py                # Криптографическая валидация Telegram initData (HMAC-SHA256)
│   ├── config.py              # Pydantic Settings с поддержкой переменных окружения
│   ├── database.py            # Асинхронный менеджер SQLite (aiosqlite, WAL-режим)
│   ├── main.py                # Точка входа aiogram бота и запуск Uvicorn
│   ├── requirements.txt       # Python-зависимости
│   └── services/
│       └── marzban.py         # Асинхронный REST API клиент Marzban (httpx)
├── src/                       # Frontend Telegram Mini App (React + Vite)
│   ├── components/            # Модульные компоненты интерфейса
│   │   ├── Dashboard.tsx      # Главный экран: статус, CTA в HAPP, локации
│   │   ├── SubscriptionShop.tsx # Магазин тарифов, ввод промокода, 0 ₽ оплата
│   │   ├── KeyManager.tsx     # Управление подпиской, QR-код, HAPP deep-link
│   │   ├── ProfileSettings.tsx# Профиль Telegram, реферальная система
│   │   ├── OfferModal.tsx     # Полнотекстовое модальное окно публичной оферты
│   │   ├── ErrorBoundary.tsx  # Отлов и экранирование клиентских ошибок
│   │   └── Navigation.tsx     # Нижняя навигационная панель Telegram
│   ├── hooks/
│   │   └── useTelegram.ts     # Хук интеграции с Telegram WebApp SDK
│   ├── services/
│   │   └── api.ts             # Клиент API с передачей initData заголовков
│   ├── types/                 # Строгие TypeScript типы
│   ├── App.tsx                # Корневой компонент с проверкой Telegram-окружения
│   └── main.tsx               # Инициализация React приложения
├── .env.example               # Образец конфигурации переменных окружения
├── Makefile                   # Серверные команды сборки и обслуживания
├── tailwind.config.js         # Конфигурация темы и стилей
├── tsconfig.json              # Настройки TypeScript
└── vite.config.ts             # Конфигурация сборщика Vite
```

---

## 🚀 Быстрый старт (Local Development)

### 1. Клонирование репозитория
```bash
git clone https://github.com/MuzykantR/partizan-bot.git
cd partizan-bot
```

### 2. Настройка бэкенда
```bash
# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate  # На Windows: .\venv\Scripts\activate

# Установка зависимостей
pip install -r bot/requirements.txt

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env, указав свой BOT_TOKEN и реквизиты Marzban

# Запуск бота и FastAPI сервера
python -m bot.main
```

### 3. Настройка фронтенда (TWA)
```bash
# Установка Node.js зависимостей
npm install

# Запуск локального сервера разработки Vite
npm run dev
```

---

## 🔒 Безопасность и Best Practices

1. **Защита секретов:** Все токены бота, пароли и секретные ключи передаются исключительно через переменные окружения (`.env`) и защищены в `.gitignore`.
2. **Идемпотентность промокодов:** Использование промокодов фиксируется в таблице `user_promocodes` с ограничением `UNIQUE(telegram_id, code)` для предотвращения повторной активации.
3. **Безопасный Sudo:** Все автоматизированные сценарии в Makefile исполняются от непривилегированного пользователя без сохранения паролей в кодовой базе.

---

## 📄 Лицензия

Проект распространяется под лицензией [MIT](LICENSE).

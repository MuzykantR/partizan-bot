import os
import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, MenuButtonWebApp

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger(__name__)

# Environment variables
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://axisforge.tech/twa")

dp = Dispatcher()


@dp.message(CommandStart())
async def command_start_handler(message: types.Message):
    """
    Handles /start command: sends welcome greeting with inline WebApp launch button.
    """
    user_name = message.from_user.first_name if message.from_user else "друг"
    
    welcome_text = (
        f"👋 <b>Привет, {user_name}!</b>\n\n"
        f"Добро пожаловать в <b>Axisforge VPN</b> — сверхскоростной и защищенный VPN сервис на протоколе <b>VLESS-XHTTP</b>.\n\n"
        f"🚀 <b>Преимущества:</b>\n"
        f"• Полный обход блокировок ТСПУ в РФ\n"
        f"• Скорость до 1 Гбит/с без задержек\n"
        f"• До 5 устройств на один аккаунт\n"
        f"• Управление в 1 клик через Telegram Mini App\n\n"
        f"Нажмите кнопку ниже, чтобы открыть приложение:"
    )

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Открыть Axisforge VPN",
                    web_app=WebAppInfo(url=WEB_APP_URL)
                )
            ],
            [
                InlineKeyboardButton(
                    text="💬 Служба поддержки",
                    url="https://t.me/axisforge_support_bot"
                )
            ]
        ]
    )

    await message.answer(welcome_text, parse_mode="HTML", reply_markup=keyboard)


@dp.message(Command("help"))
async def command_help_handler(message: types.Message):
    """
    Handles /help command.
    """
    help_text = (
        "❓ <b>Нужна помощь с настройкой?</b>\n\n"
        "1. Нажмите <b>«Открыть Axisforge VPN»</b> в меню бота.\n"
        "2. Перейдите во вкладку <b>«Ключи»</b> и скопируйте вашу персональную ссылку.\n"
        "3. Перейдите во вкладку <b>«Инструкция»</b> для поэтапной настройки ваших устройств."
    )
    await message.answer(help_text, parse_mode="HTML")


async def main():
    if BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        logger.warning("BOT_TOKEN is not set in environment. Running in dummy configuration mode.")

    bot = Bot(token=BOT_TOKEN if BOT_TOKEN != "YOUR_TELEGRAM_BOT_TOKEN" else "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz")
    
    # Configure Menu Button to open TWA
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="VPN Клиент",
                web_app=WebAppInfo(url=WEB_APP_URL)
            )
        )
        logger.info("Chat menu button configured successfully.")
    except Exception as e:
        logger.error(f"Failed to set menu button: {e}")

    logger.info("Starting Telegram Bot polling...")
    try:
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Polling error: {e}")


if __name__ == "__main__":
    asyncio.run(main())

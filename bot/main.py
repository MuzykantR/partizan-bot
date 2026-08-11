import os
import asyncio
import logging
import uvicorn
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, MenuButtonWebApp

from bot.config import settings
from bot.database import db
from bot.services.marzban import marzban_service
from bot.api import app as fastapi_app

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger(__name__)

dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message):
    """
    Handles /start command including referral deep-links: /start ref_123456
    """
    user_id = message.from_user.id
    user_name = message.from_user.first_name if message.from_user else "партизан"
    username = message.from_user.username

    # Extract deep link parameter if present
    referrer_id = None
    if message.text and len(message.text.split()) > 1:
        param = message.text.split()[1]
        if param.startswith("ref_"):
            try:
                referrer_id = int(param.replace("ref_", ""))
            except ValueError:
                pass

    # Check if user is already registered in DB
    existing_user = await db.get_user(user_id)
    user = await db.create_or_update_user(
        telegram_id=user_id,
        username=username,
        first_name=user_name,
        referrer_id=referrer_id
    )

    # If new user registered with a referrer, reward referrer!
    if not existing_user and referrer_id and referrer_id != user_id:
        try:
            # Grant +7 bonus days to referrer
            await db.add_referral_reward(
                referrer_id=referrer_id,
                referred_id=user_id,
                bonus_days=settings.referral_bonus_days
            )
            # Extend Marzban expiration for referrer
            marzban_user = f"partizan_{referrer_id}"
            await marzban_service.extend_user(marzban_user, settings.referral_bonus_days)

            # Send notification message to referrer
            bot = message.bot
            if bot:
                await bot.send_message(
                    chat_id=referrer_id,
                    text=(
                        f"🎉 <b>Партизанский Отряд пополнен!</b>\n\n"
                        f"По вашей ссылке присоединился <b>{user_name}</b>!\n"
                        f"🎁 Вам автоматически начислено <b>+{settings.referral_bonus_days} дней</b> бессбойного VPN трафика!"
                    ),
                    parse_mode="HTML"
                )
        except Exception as e:
            logger.error(f"Failed to process referral reward for {referrer_id}: {e}")

    welcome_text = (
        f"🛡️ <b>Привет, {user_name}!</b>\n\n"
        f"Добро пожаловать в <b>PARTIZAN VPN</b> — невидимый доступ к свободному интернету на протоколе <b>VLESS-XHTTP</b>.\n\n"
        f"⚡ <b>Преимущества PARTIZAN:</b>\n"
        f"• <b>Безлимитный VPN трафик</b> на максимальной скорости (1 Гбит/с)\n"
        f"• Полная защита от блокировок ТСПУ в РФ\n"
        f"• До 5 устройств одновременно на 1 подписку\n"
        f"• Быстрая настройка в 1 клик через <b>Happ Client</b>\n\n"
        f"Нажмите кнопку ниже, чтобы открыть приложение:"
    )

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Открыть PARTIZAN VPN",
                    web_app=WebAppInfo(url=settings.web_app_url)
                )
            ],
            [
                InlineKeyboardButton(
                    text="💬 Служба поддержки 24/7",
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
        "❓ <b>Помощь по настройке PARTIZAN VPN:</b>\n\n"
        "1. Нажмите <b>«Открыть PARTIZAN VPN»</b> в меню бота.\n"
        "2. Перейдите на главный экран или во вкладку <b>«КЛЮЧИ»</b>.\n"
        "3. Нажмите кнопку <b>«Добавить подписку в Happ»</b>.\n"
        "4. Все серверы автоматически добавятся в клиент Happ!"
    )
    await message.answer(help_text, parse_mode="HTML")


async def run_fastapi():
    """Runs FastAPI web server for TWA Mini App endpoints."""
    config = uvicorn.Config(
        app=fastapi_app,
        host=settings.api_host,
        port=settings.api_port,
        log_level="info"
    )
    server = uvicorn.Server(config)
    await server.serve()


async def main():
    await db.init_db()

    if settings.bot_token == "YOUR_TELEGRAM_BOT_TOKEN":
        logger.warning("BOT_TOKEN is not set in environment. Running in dummy configuration mode.")

    bot = Bot(token=settings.bot_token if settings.bot_token != "YOUR_TELEGRAM_BOT_TOKEN" else "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz")
    
    # Configure Menu Button to open TWA
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="PARTIZAN VPN",
                web_app=WebAppInfo(url=settings.web_app_url)
            )
        )
        logger.info("Chat menu button configured successfully.")
    except Exception as e:
        logger.error(f"Failed to set menu button: {e}")

    logger.info("Starting FastAPI & PARTIZAN Telegram Bot...")
    
    # Run Bot Polling and FastAPI Web Server concurrently
    await asyncio.gather(
        dp.start_polling(bot),
        run_fastapi()
    )


if __name__ == "__main__":
    asyncio.run(main())

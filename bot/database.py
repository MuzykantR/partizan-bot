import os
import aiosqlite
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from bot.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, db_path: str = settings.database_path):
        self.db_path = db_path

    @asynccontextmanager
    async def get_db(self):
        """Async context manager for SQLite connection."""
        conn = await aiosqlite.connect(self.db_path)
        conn.row_factory = aiosqlite.Row
        try:
            yield conn
        finally:
            await conn.close()

    async def init_db(self):
        """Initializes database schema if tables do not exist."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        async with self.get_db() as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    telegram_id INTEGER PRIMARY KEY,
                    username TEXT,
                    first_name TEXT,
                    marzban_username TEXT,
                    referrer_id INTEGER,
                    status TEXT DEFAULT 'inactive',
                    expire_date TEXT,
                    is_pro INTEGER DEFAULT 0,
                    has_used_trial INTEGER DEFAULT 0,
                    created_at TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS referrals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    referrer_id INTEGER NOT NULL,
                    referred_id INTEGER NOT NULL,
                    bonus_days INTEGER NOT NULL,
                    status TEXT DEFAULT 'rewarded',
                    created_at TEXT
                )
            """)
            await db.commit()
            logger.info(f"Database initialized at {self.db_path}")

    async def get_user(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        async with self.get_db() as db:
            async with db.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)) as cursor:
                row = await cursor.fetchone()
                return dict(row) if row else None

    async def create_or_update_user(
        self,
        telegram_id: int,
        username: Optional[str],
        first_name: Optional[str],
        referrer_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Creates user if not exists or updates username/first_name. Sets referrer_id only on first creation."""
        existing = await self.get_user(telegram_id)
        now_str = datetime.utcnow().isoformat()
        
        async with self.get_db() as db:
            if existing:
                await db.execute(
                    "UPDATE users SET username = ?, first_name = ? WHERE telegram_id = ?",
                    (username, first_name, telegram_id)
                )
                await db.commit()
            else:
                valid_referrer = referrer_id if referrer_id and referrer_id != telegram_id else None
                
                await db.execute("""
                    INSERT INTO users (telegram_id, username, first_name, marzban_username, referrer_id, status, expire_date, is_pro, has_used_trial, created_at)
                    VALUES (?, ?, ?, ?, ?, 'inactive', NULL, 0, 0, ?)
                """, (
                    telegram_id,
                    username,
                    first_name,
                    f"partizan_{telegram_id}",
                    valid_referrer,
                    now_str
                ))
                await db.commit()
                logger.info(f"New user registered: {telegram_id} (Referrer: {valid_referrer})")
                
        return await self.get_user(telegram_id)

    async def update_marzban_details(
        self,
        telegram_id: int,
        marzban_username: str,
        expire_date: str,
        status: str = 'active'
    ):
        async with self.get_db() as db:
            await db.execute("""
                UPDATE users
                SET marzban_username = ?, expire_date = ?, status = ?
                WHERE telegram_id = ?
            """, (marzban_username, expire_date, status, telegram_id))
            await db.commit()

    async def mark_trial_used(self, telegram_id: int):
        async with self.get_db() as db:
            await db.execute(
                "UPDATE users SET has_used_trial = 1, status = 'active' WHERE telegram_id = ?",
                (telegram_id,)
            )
            await db.commit()

    async def add_user_days(self, telegram_id: int, days: int) -> str:
        """Extends user expiration date by N days. Returns new ISO expire date."""
        user = await self.get_user(telegram_id)
        current_expire = datetime.utcnow()
        if user and user.get("expire_date"):
            try:
                parsed = datetime.fromisoformat(user["expire_date"])
                if parsed > current_expire:
                    current_expire = parsed
            except Exception:
                pass
        
        new_expire = current_expire + timedelta(days=days)
        new_expire_str = new_expire.isoformat()
        
        async with self.get_db() as db:
            await db.execute(
                "UPDATE users SET expire_date = ?, status = 'active' WHERE telegram_id = ?",
                (new_expire_str, telegram_id)
            )
            await db.commit()
        return new_expire_str

    async def add_referral_reward(self, referrer_id: int, referred_id: int, bonus_days: int):
        """Records referral reward and extends referrer subscription."""
        now_str = datetime.utcnow().isoformat()
        async with self.get_db() as db:
            await db.execute("""
                INSERT INTO referrals (referrer_id, referred_id, bonus_days, status, created_at)
                VALUES (?, ?, ?, 'rewarded', ?)
            """, (referrer_id, referred_id, bonus_days, now_str))
            await db.commit()
        
        await self.add_user_days(referrer_id, bonus_days)

    async def get_referral_stats(self, telegram_id: int) -> Dict[str, Any]:
        async with self.get_db() as db:
            async with db.execute(
                "SELECT COUNT(*) as count, SUM(bonus_days) as total_days FROM referrals WHERE referrer_id = ?",
                (telegram_id,)
            ) as cursor:
                row = await cursor.fetchone()
                count = row["count"] if row else 0
                total_days = row["total_days"] if row and row["total_days"] else 0
                
            return {
                "recruits_count": count,
                "earned_bonus_days": total_days,
                "referral_code": f"ref_{telegram_id}",
                "referral_url": f"https://t.me/partizanVPNbot?start=ref_{telegram_id}"
            }

db = DatabaseManager()

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
        """Async context manager for SQLite connection with WAL mode and resilience pragmas."""
        conn = await aiosqlite.connect(self.db_path, timeout=5.0)
        conn.row_factory = aiosqlite.Row
        await conn.execute("PRAGMA journal_mode=WAL;")
        await conn.execute("PRAGMA busy_timeout=5000;")
        await conn.execute("PRAGMA synchronous=NORMAL;")
        await conn.execute("PRAGMA foreign_keys=ON;")
        try:
            yield conn
        finally:
            await conn.close()

    async def init_db(self):
        """Initializes database schema and performance indexes if tables do not exist."""
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
            await db.execute("""
                CREATE TABLE IF NOT EXISTS promo_codes (
                    code TEXT PRIMARY KEY,
                    discount_percent INTEGER DEFAULT 0,
                    bonus_days INTEGER DEFAULT 0,
                    target_plan_id TEXT,
                    max_uses INTEGER DEFAULT 0,
                    current_uses INTEGER DEFAULT 0,
                    expire_date TEXT,
                    is_active INTEGER DEFAULT 1,
                    created_at TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS user_promocodes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER NOT NULL,
                    code TEXT NOT NULL,
                    applied_at TEXT,
                    UNIQUE(telegram_id, code)
                )
            """)
            
            # Create indexes on foreign keys and frequently queried columns
            await db.execute("CREATE INDEX IF NOT EXISTS idx_users_referrer ON users(referrer_id);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_users_marzban ON users(marzban_username);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_user_promocodes_tid ON user_promocodes(telegram_id);")

            # Seed default promo code ПЕРМЬ
            now_str = datetime.utcnow().isoformat()
            await db.execute("""
                INSERT OR IGNORE INTO promo_codes (code, discount_percent, bonus_days, target_plan_id, max_uses, current_uses, is_active, created_at)
                VALUES ('ПЕРМЬ', 100, 30, 'plan-1m', 0, 0, 1, ?)
            """, (now_str,))
            await db.commit()
            logger.info(f"Database initialized at {self.db_path} in WAL mode")

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
        """Atomically creates user if not exists or updates username/first_name via ON CONFLICT."""
        now_str = datetime.utcnow().isoformat()
        valid_referrer = referrer_id if referrer_id and referrer_id != telegram_id else None
        
        async with self.get_db() as db:
            await db.execute("""
                INSERT INTO users (telegram_id, username, first_name, marzban_username, referrer_id, status, expire_date, is_pro, has_used_trial, created_at)
                VALUES (?, ?, ?, ?, ?, 'inactive', NULL, 0, 0, ?)
                ON CONFLICT(telegram_id) DO UPDATE SET
                    username = excluded.username,
                    first_name = excluded.first_name
            """, (
                telegram_id,
                username,
                first_name,
                f"partizan_{telegram_id}",
                valid_referrer,
                now_str
            ))
            await db.commit()
                
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
        """Extends user expiration date by N days inside an atomic transaction. Returns new ISO expire date."""
        now = datetime.utcnow()
        async with self.get_db() as db:
            async with db.execute("SELECT expire_date FROM users WHERE telegram_id = ?", (telegram_id,)) as cursor:
                row = await cursor.fetchone()
                current_expire = now
                if row and row["expire_date"]:
                    try:
                        parsed = datetime.fromisoformat(row["expire_date"])
                        if parsed > current_expire:
                            current_expire = parsed
                    except Exception:
                        pass
                
                new_expire = current_expire + timedelta(days=days)
                new_expire_str = new_expire.isoformat()
                
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

    async def get_promo_code(self, code: str) -> Optional[Dict[str, Any]]:
        clean_code = code.strip().upper()
        async with self.get_db() as db:
            async with db.execute("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1", (clean_code,)) as cursor:
                row = await cursor.fetchone()
                return dict(row) if row else None

    async def has_user_used_promo(self, telegram_id: int, code: str) -> bool:
        clean_code = code.strip().upper()
        async with self.get_db() as db:
            async with db.execute("SELECT 1 FROM user_promocodes WHERE telegram_id = ? AND code = ?", (telegram_id, clean_code)) as cursor:
                row = await cursor.fetchone()
                return bool(row)

    async def apply_promo_to_user(self, telegram_id: int, code: str) -> bool:
        """Atomically checks and applies promo code in a single protected transaction."""
        clean_code = code.strip().upper()
        now_str = datetime.utcnow().isoformat()
        
        async with self.get_db() as db:
            # Check if user already used this promo
            async with db.execute("SELECT 1 FROM user_promocodes WHERE telegram_id = ? AND code = ?", (telegram_id, clean_code)) as cur:
                if await cur.fetchone():
                    return False
            
            # Check promo code validity and max_uses
            async with db.execute("SELECT max_uses, current_uses FROM promo_codes WHERE code = ? AND is_active = 1", (clean_code,)) as cur:
                promo = await cur.fetchone()
                if not promo:
                    return False
                if promo["max_uses"] > 0 and promo["current_uses"] >= promo["max_uses"]:
                    return False
            
            try:
                await db.execute(
                    "INSERT INTO user_promocodes (telegram_id, code, applied_at) VALUES (?, ?, ?)",
                    (telegram_id, clean_code, now_str)
                )
                await db.execute(
                    "UPDATE promo_codes SET current_uses = current_uses + 1 WHERE code = ?",
                    (clean_code,)
                )
                await db.commit()
                return True
            except Exception as e:
                logger.warning(f"Failed to apply promo {clean_code} to {telegram_id}: {e}")
                await db.rollback()
                return False

db = DatabaseManager()

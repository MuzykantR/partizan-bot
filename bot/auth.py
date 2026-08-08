import hmac
import hashlib
import json
import time
import urllib.parse
from typing import Dict, Any

MAX_AUTH_DATE_AGE_SECONDS = 86400  # 24 hours


def verify_and_parse_init_data(init_data_raw: str, bot_token: str) -> Dict[str, Any]:
    """
    Validates Telegram WebApp initData string using HMAC-SHA256 signature algorithm.
    Returns parsed dictionary if valid, raises ValueError if verification fails or data expired.
    """
    try:
        parsed_params = dict(urllib.parse.parse_qsl(init_data_raw, keep_blank_values=True))
    except Exception:
        raise ValueError("Invalid query string format")

    if "hash" not in parsed_params:
        raise ValueError("Hash field is missing from initData")

    received_hash = parsed_params.pop("hash")

    auth_date = int(parsed_params.get("auth_date", 0))
    if auth_date == 0:
        raise ValueError("auth_date field is missing")

    current_timestamp = int(time.time())
    if current_timestamp - auth_date > MAX_AUTH_DATE_AGE_SECONDS:
        raise ValueError("initData signature has expired")

    data_check_arr = [f"{k}={v}" for k, v in sorted(parsed_params.items())]
    data_check_string = "\n".join(data_check_arr)

    # 1. Compute HMAC secret key: HMAC-SHA256("WebAppData", bot_token)
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).digest()

    # 2. Compute payload hash: HMAC-SHA256(secret_key, data_check_string)
    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

    # 3. Constant time comparison against timing attacks
    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("Cryptographic verification failed: Hash mismatch")

    if "user" in parsed_params:
        parsed_params["user"] = json.loads(parsed_params["user"])

    return parsed_params

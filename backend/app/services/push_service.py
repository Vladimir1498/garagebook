import json
import os
import logging
from pywebpush import webpush, WebPushException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.push_subscription import PushSubscription
from app.core.config import settings

logger = logging.getLogger(__name__)

VAPID_CLAIMS = {"sub": "mailto:admin@garagebook.app"}


def get_vapid_keys() -> dict:
    """Get VAPID keys from config (environment variables)."""
    private_key = settings.VAPID_PRIVATE_KEY
    public_key = settings.VAPID_PUBLIC_KEY

    if private_key and public_key:
        return {"private": private_key, "public": public_key}

    logger.warning("VAPID keys not configured")
    return {"private": "", "public": ""}


def _get_vapid_private_key():
    """Get the raw PEM private key for pywebpush."""
    keys = get_vapid_keys()
    if not keys["private"]:
        raise ValueError("VAPID_PRIVATE_KEY not configured")

    pem = keys["private"].replace("\\n", "\n").strip()

    # Debug: log what we actually received
    logger.error(f"VAPID_KEY_RAW length={len(keys['private'])}, first80={repr(keys['private'][:80])}")
    logger.error(f"VAPID_KEY_PROCESSED length={len(pem)}, first80={repr(pem[:80])}")

    # Validate PEM format
    if not pem.startswith("-----BEGIN"):
        raise ValueError(f"Key does not start with BEGIN. Got: {repr(pem[:100])}")

    return pem


async def save_subscription(user_id, endpoint: str, p256dh: str, auth: str, user_agent: str | None, db: AsyncSession):
    existing = await db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint)
    )
    for sub in existing.scalars().all():
        await db.delete(sub)

    sub = PushSubscription(
        user_id=user_id,
        endpoint=endpoint,
        p256dh=p256dh,
        auth=auth,
        user_agent=user_agent,
    )
    db.add(sub)
    await db.commit()
    return sub


async def remove_subscription(endpoint: str, user_id, db: AsyncSession):
    existing = await db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint, PushSubscription.user_id == user_id)
    )
    for sub in existing.scalars().all():
        await db.delete(sub)
    await db.commit()


async def send_push_to_user(user_id, title: str, body: str, url: str | None, db: AsyncSession):
    result = await db.execute(
        select(PushSubscription).where(PushSubscription.user_id == user_id)
    )
    subscriptions = result.scalars().all()
    if not subscriptions:
        return

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url or "/",
        "icon": "/icons/icon-192.png",
    })

    vapid_private_key = _get_vapid_private_key()

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=VAPID_CLAIMS,
            )
        except WebPushException as e:
            logger.warning(f"Push failed for {sub.endpoint}: {e}")
            if "410" in str(e) or "404" in str(e):
                await db.delete(sub)
    await db.commit()

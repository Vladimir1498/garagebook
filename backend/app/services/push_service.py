import json
import os
import logging
import base64
from pywebpush import webpush, WebPushException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.push_subscription import PushSubscription
from app.core.config import settings

logger = logging.getLogger(__name__)

VAPID_CLAIMS = {"sub": "mailto:admin@garagebook.app"}


def get_vapid_keys() -> dict:
    """Get or generate VAPID key pair. Returns dict with 'private' and 'public' keys."""
    key_dir = settings.UPLOAD_DIR
    os.makedirs(key_dir, exist_ok=True)
    private_path = os.path.join(key_dir, ".vapid_private_key")
    public_path = os.path.join(key_dir, ".vapid_public_key")

    if os.path.exists(private_path) and os.path.exists(public_path):
        with open(private_path, "r") as f:
            private_key = f.read().strip()
        with open(public_path, "r") as f:
            public_key = f.read().strip()
        return {"private": private_key, "public": public_key}

    # Generate new key pair
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption
    from cryptography.hazmat.backends import default_backend

    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(Encoding.PEM, PrivateFormat.PKCS8, NoEncryption()).decode("ascii")
    public_bytes = public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    public_key_b64 = base64.urlsafe_b64encode(public_bytes).rstrip(b"=").decode("ascii")

    with open(private_path, "w") as f:
        f.write(private_pem)
    with open(public_path, "w") as f:
        f.write(public_key_b64)

    return {"private": private_pem, "public": public_key_b64}


def _get_vapid_private_key():
    """Get the raw PEM private key for pywebpush."""
    keys = get_vapid_keys()
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    from cryptography.hazmat.backends import default_backend
    pem = keys["private"].encode() if isinstance(keys["private"], str) else keys["private"]
    return load_pem_private_key(pem, password=None, backend=default_backend())


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


async def remove_subscription(endpoint: str, db: AsyncSession):
    existing = await db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == endpoint)
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

import base64
import re
import io
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

GROQ_API = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS = ["llama-3.2-11b-vision", "meta-llama/llama-4-scout-17b-16e-instruct"]


async def scan_receipt(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """
    Scan a receipt image using Groq Vision (primary) or Tesseract (fallback).
    Returns: {amount, date, vendor, category, raw_text}
    """
    # Try Groq first
    try:
        result = await _scan_with_groq(image_bytes, content_type)
        if result.get("amount"):
            result["source"] = "groq"
            return result
    except Exception as e:
        logger.warning(f"Groq OCR failed: {e}")

    # Fallback to Tesseract
    try:
        result = await _scan_with_tesseract(image_bytes)
        result["source"] = "tesseract"
        return result
    except Exception as e:
        logger.warning(f"Tesseract OCR failed: {e}")

    return {"amount": None, "date": None, "vendor": None, "category": None, "raw_text": "", "source": "none"}


async def _scan_with_groq(image_bytes: bytes, content_type: str) -> dict:
    """Use Groq Vision to scan receipt. Tries models in order."""
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")

    # Resize image if too large
    if len(image_bytes) > 3 * 1024 * 1024:
        try:
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(image_bytes))
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=80)
            image_bytes = buf.getvalue()
            content_type = 'image/jpeg'
        except Exception:
            pass

    b64 = base64.b64encode(image_bytes).decode()
    logger.info(f"Groq OCR: image={len(image_bytes)}b, type={content_type}")

    prompt = (
        "Analyze this receipt. Return ONLY valid JSON, no markdown:\n"
        '{"amount": number, "date": "DD.MM.YYYY", '
        '"vendor": "store_name", "category": "one_of: fuel/maintenance/repair/insurance/parking/fine/wash/tires/other"}\n'
        "If you cannot recognize a field, set it to null."
    )

    last_error = None
    for model in GROQ_MODELS:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    GROQ_API,
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{b64}"}},
                        ]}],
                        "max_tokens": 300,
                        "temperature": 0.1,
                    },
                )

                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    import json
                    json_match = re.search(r'\{[^}]+\}', content, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
                    return {"amount": None, "date": None, "vendor": None, "category": None, "raw_text": content}

                last_error = f"{model}: {resp.status_code} {resp.text[:200]}"
                logger.warning(f"Groq {model} failed: {resp.status_code}")
        except Exception as e:
            last_error = f"{model}: {e}"
            logger.warning(f"Groq {model} error: {e}")

    raise ValueError(f"All Groq models failed: {last_error}")


async def _scan_with_tesseract(image_bytes: bytes) -> dict:
    """Use Tesseract OCR as offline fallback."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise ValueError("pytesseract not installed — run: apt install tesseract-ocr tesseract-ocr-rus")

    # Check if tesseract binary is available
    try:
        pytesseract.get_tesseract_version()
    except Exception:
        raise ValueError("Tesseract binary not found in PATH — run: apt install tesseract-ocr")

    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image, lang="rus+eng")

    # Parse amount — find numbers that look like prices
    amounts = re.findall(r'(\d[\d\s]*[.,]\d{2})\s*(?:₽|р\.?|руб)?', text)
    amount = None
    if amounts:
        # Take the last match (usually total)
        raw = amounts[-1].replace(' ', '').replace(',', '.')
        try:
            amount = float(raw)
        except ValueError:
            pass

    # Parse date
    dates = re.findall(r'(\d{2}[./\-]\d{2}[./\-]\d{2,4})', text)
    date = dates[0] if dates else None
    if date:
        date = date.replace('/', '.').replace('-', '.')

    # Guess category from keywords
    category = "other"
    text_lower = text.lower()
    category_keywords = {
        "fuel": ["бензин", "дт", "топливо", "аи-92", "аи-95", "аи-98", "дизель"],
        "wash": ["мойка", "автомойка", "мойка авто"],
        "parking": ["парковка", "стоянка", "паркинг"],
        "fine": ["штраф", "нарушение", "гибдд"],
        "tires": ["шины", "колёса", "резина", "диск"],
        "repair": ["ремонт", "запчасти", "мастерская"],
        "maintenance": ["обслуживание", "ТО", "замена", "масло", "фильтр"],
    }
    for cat, keywords in category_keywords.items():
        if any(kw in text_lower for kw in keywords):
            category = cat
            break

    return {"amount": amount, "date": date, "vendor": None, "category": category, "raw_text": text}


async def scan_vin(image_bytes: bytes) -> dict:
    """Scan VIN number from image using Groq or Tesseract."""
    api_key = settings.GROQ_API_KEY
    if api_key:
        b64 = base64.b64encode(image_bytes).decode()
        for model in GROQ_MODELS:
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    resp = await client.post(
                        GROQ_API,
                        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                        json={
                            "model": model,
                            "messages": [{"role": "user", "content": [
                                {"type": "text", "text": "Find the VIN number in this image. Return ONLY the 17-character VIN, nothing else."},
                                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                            ]}],
                            "max_tokens": 50,
                        },
                    )
                    if resp.status_code == 200:
                        vin = resp.json()["choices"][0]["message"]["content"].strip()[:17]
                        if len(vin) == 17:
                            return {"vin": vin, "source": "groq"}
            except Exception as e:
                logger.warning(f"Groq VIN scan failed ({model}): {e}")

    # Fallback Tesseract
    try:
        import pytesseract
        from PIL import Image
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        vin_match = re.search(r'[A-HJ-NPR-Z0-9]{17}', text.upper())
        if vin_match:
            return {"vin": vin_match.group(), "source": "tesseract"}
    except Exception as e:
        logger.warning(f"Tesseract VIN scan failed: {e}")

    return {"vin": None, "source": "none"}

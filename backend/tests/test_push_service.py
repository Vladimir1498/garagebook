import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.push_service import _get_vapid_private_key


class PushServiceTests(unittest.TestCase):
    def test_get_vapid_private_key_returns_pem_string(self):
        private_key = "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----"
        with patch("app.services.push_service.settings.VAPID_PRIVATE_KEY", private_key):
            with patch("app.services.push_service.settings.VAPID_PUBLIC_KEY", "public"):
                self.assertEqual(_get_vapid_private_key(), private_key)


if __name__ == "__main__":
    unittest.main()

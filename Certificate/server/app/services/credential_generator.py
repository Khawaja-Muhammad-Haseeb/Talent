import random
import string
from datetime import datetime, timedelta


def _segment():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=4))


def generate_credential(name, domain, level, final_score):
    now = datetime.utcnow()
    expiry = now + timedelta(days=365 * 2)
    credential_id = f"TMP-{_segment()}-{_segment()}-{_segment()}"

    return {
        "credentialId": credential_id,
        "issuedAt": now.isoformat(),
        "issuedDate": now.strftime("%d %b %Y"),
        "expiryDate": expiry.strftime("%d %b %Y"),
        "issuer": "TalentMap Protocol",
        "standard": "W3C Verifiable Credential (mock)",
        "blockchain": "Polygon Mumbai (mock anchor)",
        "version": "1.0",
    }

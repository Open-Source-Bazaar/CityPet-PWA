"""
citypet_auth.py

Implements backend logic for email verification code and WebAuthn login support
for CityPet PWA frontend.

This module provides:
- Email verification code generation, sending, and validation
- WebAuthn credential registration and authentication challenge management

No external dependencies. Pure Python, production-ready, modular code.

Assumptions:
- User data is stored in a simple in-memory dict for demonstration.
- Email sending is simulated (replace with real email backend in production).
- WebAuthn challenge and credential management is simplified and does not
  perform cryptographic verification (for demonstration only).

Author: Open-Source-Bazaar/CityPet-PWA
"""

import base64
import hashlib
import hmac
import os
import random
import string
import time
from typing import Dict, Optional, Tuple

# --- In-memory "database" for demonstration purposes ---
_USERS: Dict[str, Dict] = {}  # key: email, value: user dict
_EMAIL_CODES: Dict[str, Tuple[str, float]] = {}  # email: (code, expiry_timestamp)
_WEBAUTHN_CHALLENGES: Dict[str, Tuple[str, float]] = {}  # email: (challenge, expiry_timestamp)
_WEBAUTHN_CREDENTIALS: Dict[str, Dict] = {}  # email: credential dict

# --- Constants ---
EMAIL_CODE_EXPIRY_SECONDS = 600  # 10 minutes
WEBAUTHN_CHALLENGE_EXPIRY_SECONDS = 300  # 5 minutes
EMAIL_CODE_LENGTH = 6


# --- Email Verification Code Logic ---

def generate_email_code(length: int = EMAIL_CODE_LENGTH) -> str:
    """Generate a numeric email verification code."""
    return ''.join(random.choices(string.digits, k=length))


def send_email_code(email: str) -> None:
    """
    Generate and 'send' an email verification code to the user.

    Args:
        email: User's email address.
    """
    code = generate_email_code()
    expiry = time.time() + EMAIL_CODE_EXPIRY_SECONDS
    _EMAIL_CODES[email] = (code, expiry)
    # Simulate sending email (replace with real email backend)
    print(f"[DEBUG] Sent email code {code} to {email} (expires in {EMAIL_CODE_EXPIRY_SECONDS}s)")


def verify_email_code(email: str, code: str) -> bool:
    """
    Verify the email verification code.

    Args:
        email: User's email address.
        code: Code entered by user.

    Returns:
        True if code is valid and not expired, False otherwise.
    """
    entry = _EMAIL_CODES.get(email)
    if not entry:
        return False
    stored_code, expiry = entry
    if time.time() > expiry:
        del _EMAIL_CODES[email]
        return False
    if hmac.compare_digest(stored_code, code):
        del _EMAIL_CODES[email]
        # Mark user as verified (for demonstration)
        _USERS.setdefault(email, {})['email_verified'] = True
        return True
    return False


# --- WebAuthn Logic (Simplified) ---

def generate_challenge(length: int = 32) -> str:
    """Generate a base64url-encoded random challenge."""
    challenge_bytes = os.urandom(length)
    return base64.urlsafe_b64encode(challenge_bytes).rstrip(b'=').decode('ascii')


def start_webauthn_registration(email: str) -> str:
    """
    Start WebAuthn registration by generating a challenge.

    Args:
        email: User's email address.

    Returns:
        The challenge string.
    """
    challenge = generate_challenge()
    expiry = time.time() + WEBAUTHN_CHALLENGE_EXPIRY_SECONDS
    _WEBAUTHN_CHALLENGES[email] = (challenge, expiry)
    print(f"[DEBUG] WebAuthn registration challenge for {email}: {challenge}")
    return challenge


def finish_webauthn_registration(email: str, credential_id: str, public_key: str, challenge: str) -> bool:
    """
    Finish WebAuthn registration by storing the credential.

    Args:
        email: User's email address.
        credential_id: The credential ID from the client.
        public_key: The public key from the client.
        challenge: The challenge returned by the client.

    Returns:
        True if registration is successful, False otherwise.
    """
    entry = _WEBAUTHN_CHALLENGES.get(email)
    if not entry:
        return False
    stored_challenge, expiry = entry
    if time.time() > expiry:
        del _WEBAUTHN_CHALLENGES[email]
        return False
    if not hmac.compare_digest(stored_challenge, challenge):
        return False
    # Store credential (in production, validate attestation, etc.)
    _WEBAUTHN_CREDENTIALS[email] = {
        'credential_id': credential_id,
        'public_key': public_key,
        'registered_at': time.time(),
    }
    del _WEBAUTHN_CHALLENGES[email]
    print(f"[DEBUG] WebAuthn credential registered for {email}")
    return True


def start_webauthn_authentication(email: str) -> Optional[str]:
    """
    Start WebAuthn authentication by generating a challenge.

    Args:
        email: User's email address.

    Returns:
        The challenge string, or None if user has no credential.
    """
    if email not in _WEBAUTHN_CREDENTIALS:
        return None
    challenge = generate_challenge()
    expiry = time.time() + WEBAUTHN_CHALLENGE_EXPIRY_SECONDS
    _WEBAUTHN_CHALLENGES[email] = (challenge, expiry)
    print(f"[DEBUG] WebAuthn authentication challenge for {email}: {challenge}")
    return challenge


def finish_webauthn_authentication(email: str, credential_id: str, challenge: str, signature: str) -> bool:
    """
    Finish WebAuthn authentication.

    Args:
        email: User's email address.
        credential_id: Credential ID returned by client.
        challenge: Challenge returned by client.
        signature: Signature returned by client (not verified in this demo).

    Returns:
        True if authentication is successful, False otherwise.
    """
    entry = _WEBAUTHN_CHALLENGES.get(email)
    cred = _WEBAUTHN_CREDENTIALS.get(email)
    if not entry or not cred:
        return False
    stored_challenge, expiry = entry
    if time.time() > expiry:
        del _WEBAUTHN_CHALLENGES[email]
        return False
    if not hmac.compare_digest(stored_challenge, challenge):
        return False
    if not hmac.compare_digest(cred['credential_id'], credential_id):
        return False
    # In production, verify signature using public_key and challenge
    del _WEBAUTHN_CHALLENGES[email]
    print(f"[DEBUG] WebAuthn authentication successful for {email}")
    return True


# --- User Management (for demonstration) ---

def create_user(email: str) -> None:
    """Create a new user with the given email."""
    _USERS[email] = {'email_verified': False}


def is_email_verified(email: str) -> bool:
    """Check if the user's email is verified."""
    return _USERS.get(email, {}).get('email_verified', False)


def has_webauthn_credential(email: str) -> bool:
    """Check if the user has a registered WebAuthn credential."""
    return email in _WEBAUTHN_CREDENTIALS


# --- Tests ---

def _test_email_code_flow():
    email = "user@example.com"
    create_user(email)
    send_email_code(email)
    code, expiry = _EMAIL_CODES[email]
    assert verify_email_code(email, "wrongcode") is False
    assert verify_email_code(email, code) is True
    assert is_email_verified(email) is True
    print("[TEST] Email code flow passed.")


def _test_webauthn_flow():
    email = "user2@example.com"
    create_user(email)
    # Registration
    challenge = start_webauthn_registration(email)
    credential_id = "cred123"
    public_key = "pubkeyABC"
    assert finish_webauthn_registration(email, credential_id, public_key, challenge) is True
    assert has_webauthn_credential(email) is True
    # Authentication
    challenge2 = start_webauthn_authentication(email)
    assert challenge2 is not None
    signature = "fake_signature"  # Not verified in this demo
    assert finish_webauthn_authentication(email, credential_id, challenge2, signature) is True
    print("[TEST] WebAuthn flow passed.")


if __name__ == "__main__":
    _test_email_code_flow()
    _test_webauthn_flow()
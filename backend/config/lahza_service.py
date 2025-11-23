"""
Utility helpers for interacting with the Lahza payment gateway.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class LahzaAPIError(Exception):
    """Raised when Lahza returns an error response."""


def _base_url() -> str:
    return getattr(settings, "LAHZA_BASE_URL", "https://api.lahza.io").rstrip("/")


def _headers() -> Dict[str, str]:
    secret_key = getattr(settings, "LAHZA_SECRET_KEY", "")
    if not secret_key:
        raise LahzaAPIError("Lahza secret key is not configured")
    return {
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def initialize_transaction(
    *,
    email: str,
    amount_minor: int,
    currency: str = "USD",
    reference: Optional[str] = None,
    mobile: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    callback_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Initialize a Lahza transaction and return the response payload.

    According to the Lahza integration guide, we must:
    - Send the amount in the lowest currency unit (multiply by 100).
    - Provide identifying customer information (email/mobile).
    - Optionally include metadata and callback URL.

    Reference: https://docs.lahza.io/payments/accept-payments
    """
    url = f"{_base_url()}/transaction/initialize"

    payload: Dict[str, Any] = {
        "email": email,
        "amount": amount_minor,
        "currency": currency.upper(),
    }

    if reference:
        payload["ref"] = reference
    if mobile:
        payload["mobile"] = mobile
    if first_name:
        payload["firstName"] = first_name
    if last_name:
        payload["lastName"] = last_name
    if metadata:
        payload["metadata"] = metadata
    if callback_url:
        payload["callback_url"] = callback_url

    logger.info("[Lahza] Initializing transaction for %s reference=%s", email, reference)

    try:
        response = requests.post(url, json=payload, headers=_headers(), timeout=30)
    except requests.RequestException as exc:
        logger.exception("[Lahza] Network error during initialize_transaction")
        raise LahzaAPIError(str(exc)) from exc

    try:
        data = response.json()
    except ValueError as exc:
        logger.error("[Lahza] Non-JSON response: %s", response.text)
        raise LahzaAPIError("Invalid response from Lahza") from exc

    if not response.ok or not data.get("status"):
        message = data.get("message") or "Failed to initialize Lahza transaction"
        logger.error("[Lahza] Initialization failed: %s", message)
        raise LahzaAPIError(message)

    logger.info("[Lahza] Transaction initialized reference=%s", data.get("data", {}).get("reference"))
    return data.get("data") or data


def verify_transaction(reference: str) -> Dict[str, Any]:
    """
    Verify a Lahza transaction by reference.

    Reference: https://docs.lahza.io/payments/accept-payments (Verify Transaction section)
    """
    url = f"{_base_url()}/transaction/verify/{reference}"
    logger.info("[Lahza] Verifying transaction reference=%s", reference)

    try:
        response = requests.get(url, headers=_headers(), timeout=30)
    except requests.RequestException as exc:
        logger.exception("[Lahza] Network error during verify_transaction")
        raise LahzaAPIError(str(exc)) from exc

    try:
        data = response.json()
    except ValueError as exc:
        logger.error("[Lahza] Non-JSON verification response: %s", response.text)
        raise LahzaAPIError("Invalid response from Lahza") from exc

    # According to Lahza docs: https://docs.lahza.io/payments/verify-payments
    # The API response has 'status' (API call status) and 'data.status' (transaction status)
    # We need to check 'data.status' for the actual transaction status
    if not response.ok or not data.get("status"):
        message = data.get("message") or "Failed to verify Lahza transaction"
        logger.error("[Lahza] Verification failed: %s", message)
        raise LahzaAPIError(message)

    # Return the data object which contains the transaction details
    # The transaction status is in data.status, not the API response status
    transaction_data = data.get("data") or data
    transaction_status = transaction_data.get("status", "")
    logger.info("[Lahza] Verification success reference=%s transaction_status=%s", reference, transaction_status)
    return transaction_data


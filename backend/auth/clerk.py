"""
Clerk JWT verification using JWKS.

Protected endpoints use `Depends(get_current_user)`, which returns the
Clerk user ID (sub claim) as a plain string.
"""

import logging

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from config.settings import settings

logger = logging.getLogger(__name__)

_bearer = HTTPBearer()

# In-memory JWKS cache — refreshed once at startup via lifespan, and on
# any key-not-found error at runtime (handles Clerk key rotation).
_jwks: dict = {"keys": []}


class _UnknownSigningKey(Exception):
    """Raised when JWT kid is not in cached JWKS — caller may refresh and retry."""

    def __init__(self, kid: str | None):
        self.kid = kid
        super().__init__(kid)


def _decode_options() -> dict:
    return {"verify_aud": bool(settings.clerk_jwt_audience)}


def _validate_authorized_party(payload: dict) -> None:
    authorized_parties = settings.clerk_authorized_parties_list
    if not authorized_parties:
        return

    authorized_party = payload.get("azp")
    if authorized_party not in authorized_parties:
        logger.warning("JWT rejected due to missing or invalid authorized party")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token authorized party",
        )


async def refresh_jwks() -> None:
    """Fetch and cache the Clerk JWKS.  Called from the app lifespan."""
    url = f"{settings.clerk_issuer}/.well-known/jwks.json"
    logger.info("Fetching Clerk JWKS from %s", url)
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
    global _jwks
    _jwks = response.json()
    key_count = len(_jwks.get("keys", []))
    logger.info("JWKS refreshed — %d key(s) cached", key_count)


def _decode(token: str) -> dict:
    """Decode and verify a Clerk JWT against the cached JWKS."""
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        key = next((k for k in _jwks.get("keys", []) if k.get("kid") == kid), None)
        if key is None:
            raise _UnknownSigningKey(kid)
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.clerk_jwt_audience or None,
            options=_decode_options(),
            issuer=settings.clerk_issuer,
        )
        _validate_authorized_party(payload)
        return payload
    except JWTError as exc:
        logger.warning("JWT decode failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        ) from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """FastAPI dependency — returns the Clerk user ID (sub)."""
    token = credentials.credentials
    try:
        payload = _decode(token)
    except _UnknownSigningKey as exc:
        logger.info(
            "Unknown signing key kid=%s — refreshing JWKS and retrying once", exc.kid
        )
        await refresh_jwks()
        try:
            payload = _decode(token)
        except _UnknownSigningKey as exc2:
            logger.warning(
                "Unknown signing key kid=%s after JWKS refresh — check CLERK_ISSUER",
                exc2.kid,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unknown signing key",
            ) from None
    user_id: str | None = payload.get("sub")
    if not user_id:
        logger.warning("JWT accepted but missing sub claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing sub claim",
        )
    logger.debug("Authenticated user %s", user_id)
    return user_id

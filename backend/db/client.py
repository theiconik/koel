"""Supabase client singleton."""

import logging

from supabase import create_client, Client

from config.settings import settings

logger = logging.getLogger(__name__)

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        logger.info("Initialising Supabase client for %s", settings.supabase_url)
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client

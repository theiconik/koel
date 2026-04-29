"""
Application settings — single source of truth for all environment variables.

All other modules should import `settings` from here rather than reading
os.environ directly.  pydantic-settings reads `.env` automatically when
the Settings class is instantiated, so no explicit load_dotenv() call is
needed anywhere.

Usage:
    from config.settings import settings
    print(settings.supabase_url)
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────────────────────
    supabase_url: str
    supabase_service_role_key: str

    # ── Clerk ─────────────────────────────────────────────────────────────────
    # Issuer URL — copy from Clerk dashboard → API Keys → JWT Issuer
    clerk_issuer: str

    # ── ElevenLabs ────────────────────────────────────────────────────────────
    elevenlabs_api_key: str
    elevenlabs_agent_id: str = ""
    elevenlabs_branch_id: str | None = None
    elevenlabs_environment: str | None = None

    # ── OpenRouter / LLM ──────────────────────────────────────────────────────
    openrouter_api_key: str
    openrouter_model: str = "openai/gpt-4o-mini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_embedding_model: str = "gemini-embedding-001"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    gemini_native_base_url: str = "https://generativelanguage.googleapis.com/v1beta"

    # ── App / server ──────────────────────────────────────────────────────────
    # Base URL of the Next.js frontend; used to build shareUrl in survey responses
    app_url: str = "http://localhost:3000"
    # Comma-separated list of allowed CORS origins
    cors_origins: str = "http://localhost:3000"

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"
    log_format: str = "text"  # "text" | "json"

    @field_validator("clerk_issuer", "app_url")
    @classmethod
    def strip_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/")

    @field_validator("log_level")
    @classmethod
    def uppercase_log_level(cls, v: str) -> str:
        return v.upper()

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Module-level singleton — imported everywhere else.
settings = Settings()

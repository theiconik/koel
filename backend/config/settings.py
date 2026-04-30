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
    # Optional JWT audience. Set in deployed environments to reject tokens minted
    # for a different API/client.
    clerk_jwt_audience: str = ""
    # Optional comma-separated list of allowed Clerk azp origins/authorized parties.
    clerk_authorized_parties: str = ""

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

    # ── Response processing worker ───────────────────────────────────────────
    response_job_batch_size: int = 1
    response_job_lease_seconds: int = 900
    response_job_poll_interval_seconds: int = 5
    response_job_retry_delay_seconds: int = 60
    response_job_retry_max_delay_seconds: int = 900

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"
    log_format: str = "text"  # "text" | "json"

    # ── OpenTelemetry tracing ────────────────────────────────────────────────
    otel_enabled: bool = False
    otel_service_name: str = "koel-backend"
    otel_exporter_otlp_endpoint: str = ""
    otel_exporter_otlp_headers: str = ""
    otel_traces_sample_rate: float = 1.0

    @field_validator("clerk_issuer", "app_url")
    @classmethod
    def strip_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/")

    @field_validator("otel_exporter_otlp_endpoint")
    @classmethod
    def strip_optional_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/") if v else v

    @field_validator("log_level")
    @classmethod
    def uppercase_log_level(cls, v: str) -> str:
        return v.upper()

    @field_validator("otel_traces_sample_rate")
    @classmethod
    def validate_otel_traces_sample_rate(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("otel_traces_sample_rate must be between 0.0 and 1.0")
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def clerk_authorized_parties_list(self) -> list[str]:
        return [
            party.strip().rstrip("/")
            for party in self.clerk_authorized_parties.split(",")
            if party.strip()
        ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Module-level singleton — imported everywhere else.
settings = Settings()

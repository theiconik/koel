"""
Processing pipeline configuration.

Constants that govern the async background processing flow are centralised
here so they can be adjusted in one place without touching service logic.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ProcessingConfig:
    # ── ElevenLabs ────────────────────────────────────────────────────────────
    # HTTP timeout (seconds) for the transcript fetch call
    elevenlabs_timeout_seconds: int = 30
    # ElevenLabs can return a conversation before transcript processing is done.
    transcript_poll_attempts: int = 8
    transcript_poll_delay_seconds: int = 5

    # ── LLM ──────────────────────────────────────────────────────────────────
    llm_temperature: float = 0.2
    llm_max_tokens: int = 512

    # ── Themes ────────────────────────────────────────────────────────────────
    # Colours assigned to new themes in round-robin order.
    # Chosen to complement the koel design palette (cream bg, midnight text).
    theme_colours: list[str] = field(
        default_factory=lambda: [
            "#E8B04B",  # mango   — matches --color-mango CTA accent
            "#7C9CB5",  # slate blue
            "#B5857C",  # terracotta
            "#7CB585",  # sage
            "#9B7CB5",  # violet
            "#B5A87C",  # warm sand
        ]
    )

    # Maximum number of tags the LLM should produce per response.
    # Passed as a hint in the prompt; actual enforcement is on the LLM.
    max_tags_per_response: int = 4


# Module-level singleton
processing = ProcessingConfig()

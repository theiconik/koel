"""
Seed processed responses and RAG chunks for the "Live in before marriage" survey.

This is intentionally idempotent for synthetic rows:
- one existing response is updated in place when present
- synthetic seed rows use a stable conversation_id prefix and are replaced
- response_chunks are rebuilt through services.response_index.index_response
"""

from __future__ import annotations

import asyncio
from pathlib import Path
import sys
from typing import TypedDict

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db.client import get_client
from services.response_index import index_response, search_response_chunks


SURVEY_TITLE = "Live in before marriage"
SEED_PREFIX = "seed-live-in-before-marriage"


class SeedResponse(TypedDict):
    name: str
    role: str
    sentiment: str
    tags: list[str]
    quote: str
    summary: str
    duration_seconds: int
    answers: list[str]


SEED_RESPONSES: list[SeedResponse] = [
    {
        "name": "Aarav",
        "role": "26, product designer",
        "sentiment": "delighted",
        "tags": ["compatibility", "progressive values", "family acceptance"],
        "quote": "Living together before marriage helps people understand the everyday version of each other.",
        "summary": "Aarav supports live-in relationships before marriage because he sees day-to-day compatibility as more important than a curated dating phase. He is comfortable visiting such couples and views the idea as a sign that society is slowly becoming more practical.",
        "duration_seconds": 168,
        "answers": [
            "Yes, I believe in live-in before marriage. Living together before marriage helps people understand the everyday version of each other, not just the romantic or weekend version.",
            "I would be comfortable visiting someone's home if they are living together before marriage. For me it is their personal choice, and my visit does not become a judgment on their relationship.",
            "Yes, I think this shows society is becoming more progressive. People are starting to value compatibility, consent, and emotional maturity over only following a fixed timeline.",
        ],
    },
    {
        "name": "Meera",
        "role": "31, teacher",
        "sentiment": "neutral",
        "tags": ["caution", "family pressure", "privacy"],
        "quote": "I do not oppose it, but I think people need emotional clarity before choosing it.",
        "summary": "Meera is open to the idea but cautious. She worries less about the arrangement itself and more about whether couples are emotionally clear, financially prepared, and ready for family reactions.",
        "duration_seconds": 151,
        "answers": [
            "I do not oppose it, but I think people need emotional clarity before choosing it. If both people are mature and honest, it can help them decide better.",
            "I would visit if I know them well. I might feel a little conscious at first because families still react strongly, but personally I would not avoid them.",
            "It does show progressive thinking, but only partly. Society is changing in cities, while many families still treat it as something shameful.",
        ],
    },
    {
        "name": "Kabir",
        "role": "29, operations manager",
        "sentiment": "frustrated",
        "tags": ["social stigma", "family pressure", "reputation"],
        "quote": "The couple may be ready, but society often punishes them before understanding them.",
        "summary": "Kabir is sympathetic to live-in relationships but frustrated by the social cost attached to them. He thinks stigma, gossip, and family pressure make the choice difficult even for responsible couples.",
        "duration_seconds": 179,
        "answers": [
            "I believe people should have the option, but I would not call it easy. The couple may be ready, but society often punishes them before understanding them.",
            "I would be comfortable visiting, but I know many relatives would turn it into gossip. That is the uncomfortable part, not the couple living together.",
            "The idea is progressive, but the reaction to it shows we are not fully progressive yet. Acceptance is still very selective.",
        ],
    },
    {
        "name": "Ritika",
        "role": "24, postgraduate student",
        "sentiment": "delighted",
        "tags": ["independence", "compatibility", "modern relationships"],
        "quote": "Marriage should not be the first time two people learn how the other person lives.",
        "summary": "Ritika strongly supports living together before marriage as a way to test compatibility and independence. She sees it as a healthier approach than entering marriage with limited practical knowledge of each other.",
        "duration_seconds": 162,
        "answers": [
            "Yes, I believe in it. Marriage should not be the first time two people learn how the other person lives, handles chores, money, anger, and stress.",
            "I would be completely comfortable visiting. If they are adults and respectful, I do not see why their home should feel different from any other friend's home.",
            "Yes, it shows progressive thinking because the focus moves from social performance to actual compatibility.",
        ],
    },
    {
        "name": "Nikhil",
        "role": "35, small business owner",
        "sentiment": "neutral",
        "tags": ["tradition", "commitment", "boundaries"],
        "quote": "I can understand the logic, but I still feel commitment should be clear before moving in.",
        "summary": "Nikhil has mixed feelings. He understands the practical value of live-in relationships but still associates moving in with a serious commitment that should be discussed clearly.",
        "duration_seconds": 140,
        "answers": [
            "I can understand the logic, but I still feel commitment should be clear before moving in. Otherwise one person may treat it casually and the other may get hurt.",
            "I would visit if they invited me. I may not fully agree with the choice, but I would not disrespect them.",
            "It shows some progress, yes, but progress should also include responsibility. Freedom without clarity can create problems.",
        ],
    },
    {
        "name": "Sana",
        "role": "28, HR consultant",
        "sentiment": "delighted",
        "tags": ["women's agency", "compatibility", "safety"],
        "quote": "For women especially, knowing a partner's real behavior before marriage can be protective.",
        "summary": "Sana sees live-in relationships as a practical and potentially protective choice, especially for women. She believes it can reveal behavior patterns that are often hidden before marriage.",
        "duration_seconds": 188,
        "answers": [
            "Yes, I believe in it when both people consent and have equal say. For women especially, knowing a partner's real behavior before marriage can be protective.",
            "I would be comfortable visiting. I would actually appreciate that they trust me enough to include me in their normal life.",
            "Yes, society getting comfortable with this means it is becoming more progressive, especially about women's agency and choice.",
        ],
    },
    {
        "name": "Dev",
        "role": "33, software engineer",
        "sentiment": "neutral",
        "tags": ["practicality", "financial planning", "urban acceptance"],
        "quote": "I see it as a practical trial of routines, money, and expectations.",
        "summary": "Dev treats live-in relationships as a practical decision rather than a moral statement. He thinks it is becoming normal in urban settings but remains dependent on family background.",
        "duration_seconds": 156,
        "answers": [
            "Yes, but I see it as a practical trial of routines, money, and expectations more than a romantic statement.",
            "I would be comfortable visiting them. In my friend circle this is not unusual anymore, though people still avoid telling parents.",
            "It shows progressive thinking in urban circles. I would not say the whole society has changed yet.",
        ],
    },
    {
        "name": "Pooja",
        "role": "30, lawyer",
        "sentiment": "delighted",
        "tags": ["legal awareness", "personal choice", "consent"],
        "quote": "Adults should not need social permission to understand whether they can build a life together.",
        "summary": "Pooja strongly supports the right of adults to live together before marriage. She frames the issue around consent, legal awareness, and personal autonomy rather than social approval.",
        "duration_seconds": 173,
        "answers": [
            "Yes. Adults should not need social permission to understand whether they can build a life together.",
            "I would be comfortable visiting and I would treat it like any other household. Their relationship status is not a reason to behave differently.",
            "It absolutely shows progressive thinking when people accept consent and personal choice. The challenge is making that acceptance normal outside private conversations.",
        ],
    },
    {
        "name": "Harsh",
        "role": "27, sales executive",
        "sentiment": "frustrated",
        "tags": ["trust issues", "social judgment", "commitment anxiety"],
        "quote": "People say they are open-minded, but they still judge the couple behind their back.",
        "summary": "Harsh is unsure about live-in relationships because he worries about trust and commitment. He is more frustrated with hypocrisy around acceptance than with the arrangement itself.",
        "duration_seconds": 147,
        "answers": [
            "I am not fully convinced. It can work, but it can also become messy if one person is avoiding commitment.",
            "I would visit if they are close friends, but I know people say they are open-minded and still judge the couple behind their back.",
            "The idea is progressive, but our behavior is not always progressive. There is still a lot of hidden judgment.",
        ],
    },
    {
        "name": "Ananya",
        "role": "25, content strategist",
        "sentiment": "delighted",
        "tags": ["emotional compatibility", "modern relationships", "family acceptance"],
        "quote": "It gives couples a chance to notice small incompatibilities before they become lifelong resentment.",
        "summary": "Ananya supports live-in relationships as a way to understand emotional and domestic compatibility. She believes acceptance will grow as families see couples making thoughtful choices.",
        "duration_seconds": 164,
        "answers": [
            "Yes, I believe in it. It gives couples a chance to notice small incompatibilities before they become lifelong resentment.",
            "I would be comfortable visiting. I think treating their home as normal is one way friends can reduce the stigma.",
            "Yes, it is a sign of progressive thinking. It means people are asking what makes a marriage healthy, not only whether it follows tradition.",
        ],
    },
    {
        "name": "Ishaan",
        "role": "32, architect",
        "sentiment": "neutral",
        "tags": ["balanced view", "communication", "social change"],
        "quote": "Live-in can be healthy if expectations are spoken clearly from the beginning.",
        "summary": "Ishaan takes a balanced position. He supports live-in relationships when expectations are explicit and sees society as moving forward unevenly across generations.",
        "duration_seconds": 159,
        "answers": [
            "I think live-in can be healthy if expectations are spoken clearly from the beginning. Without that, it can create confusion.",
            "I would visit them without discomfort. Their arrangement is private, and my role as a friend is to be respectful.",
            "It shows society is becoming progressive, but the change is uneven. Younger people may accept it faster than parents or extended family.",
        ],
    },
]


def _transcript_rows(answers: list[str]) -> list[dict]:
    questions = [
        "Do you believe in live in before marriage? If yes why? If no why?",
        "Would you be comfortable visiting someone's home or place if they are living in before marriage?",
        'Do you think coming up with this idea of "live in before marriage" shows that the society is getting progressive with thinking?',
    ]
    rows: list[dict] = []
    for idx, (question, answer) in enumerate(zip(questions, answers, strict=True)):
        minute = idx
        rows.append(
            {
                "t": f"{minute}:00",
                "who": "koel",
                "text": question,
                "highlight": idx > 0,
            }
        )
        rows.append(
            {
                "t": f"{minute}:18",
                "who": "them",
                "text": answer,
                "highlight": False,
            }
        )
    return rows


def _transcript_text(rows: list[dict]) -> str:
    lines = []
    for row in rows:
        speaker = "Agent" if row["who"] == "koel" else "User"
        lines.append(f"{speaker}: {row['text']}")
    return "\n".join(lines)


def _response_payload(survey_id: str, seed: SeedResponse, conversation_id: str) -> dict:
    transcript_json = _transcript_rows(seed["answers"])
    return {
        "survey_id": survey_id,
        "conversation_id": conversation_id,
        "respondent_name": seed["name"],
        "respondent_role": seed["role"],
        "is_anonymous": False,
        "transcript": _transcript_text(transcript_json),
        "transcript_json": transcript_json,
        "quote": seed["quote"],
        "summary": seed["summary"],
        "sentiment": seed["sentiment"],
        "tags": seed["tags"],
        "duration_seconds": seed["duration_seconds"],
        "processing_status": "done",
        "processing_error": None,
    }


def _find_survey(db) -> dict:
    resp = (
        db.table("surveys")
        .select("id, title, short_id")
        .eq("title", SURVEY_TITLE)
        .limit(1)
        .execute()
    )
    survey = resp.data[0] if resp.data else None
    if not survey:
        raise RuntimeError(f'Survey "{SURVEY_TITLE}" was not found')
    return survey


async def main() -> None:
    db = get_client()
    survey = _find_survey(db)
    survey_id = survey["id"]

    # This fails early with a useful error if migration 003 has not been applied.
    db.table("response_chunks").select("id", count="exact").eq("survey_id", survey_id).limit(1).execute()

    old_seed_rows = (
        db.table("responses")
        .select("id")
        .eq("survey_id", survey_id)
        .like("conversation_id", f"{SEED_PREFIX}-%")
        .execute()
        .data
        or []
    )
    for row in old_seed_rows:
        db.table("responses").delete().eq("id", row["id"]).execute()

    existing_rows = (
        db.table("responses")
        .select("id, conversation_id, created_at")
        .eq("survey_id", survey_id)
        .order("created_at")
        .execute()
        .data
        or []
    )

    first_payload = _response_payload(
        survey_id,
        SEED_RESPONSES[0],
        existing_rows[0]["conversation_id"] or f"{SEED_PREFIX}-existing",
    )
    if existing_rows:
        existing_id = existing_rows[0]["id"]
        db.table("responses").update(first_payload).eq("id", existing_id).execute()
    else:
        inserted = db.table("responses").insert(first_payload).execute().data[0]
        existing_id = inserted["id"]

    inserted_ids: list[str] = []
    for idx, seed in enumerate(SEED_RESPONSES[1:], start=1):
        payload = _response_payload(survey_id, seed, f"{SEED_PREFIX}-{idx:02d}")
        inserted = db.table("responses").insert(payload).execute().data[0]
        inserted_ids.append(inserted["id"])

    response_ids = [existing_id, *inserted_ids]
    indexed = 0
    for response_id in response_ids:
        indexed += await index_response(response_id=response_id, survey_id=survey_id)

    matches = await search_response_chunks(
        survey_id=survey_id,
        query="what are people saying about this survey?",
        match_count=5,
        min_similarity=0.0,
    )

    print(f"Survey: {survey['title']} ({survey['short_id']})")
    print(f"Updated existing response: {existing_id}")
    print(f"Inserted synthetic responses: {len(inserted_ids)}")
    print(f"Indexed chunks: {indexed}")
    print(f"Match check returned: {len(matches)} chunk(s)")


if __name__ == "__main__":
    asyncio.run(main())

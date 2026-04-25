import type { Response, Theme } from "@/lib/types";

export const mockResponses: Response[] = [
  {
    id: "r1",
    surveyId: "1",
    respondentName: "maya r.",
    respondentRole: "pm, fintech",
    isAnonymous: false,
    quote: "honestly, the pricing page confused me more than the product did.",
    duration: "3m 42s",
    durationSeconds: 222,
    tags: ["pricing", "confusion"],
    sentiment: "frustrated",
    koelSummary:
      "maya found pricing copy the biggest friction — specifically the ambiguity between 'per voice' and 'per minute'. the trial was enough to convert her anyway, but she'd flag the wording before any price-sensitive landing page visitor.",
    transcript: [
      { t: "0:00", who: "koel", text: "tell me about the last time you set up a survey — what was the first thing that tripped you up?" },
      { t: "0:08", who: "them", text: "honestly, the pricing page confused me more than the product did. i kept going back and forth between \"per voice\" and \"per minute\" and i couldn't tell which i was being charged for." },
      { t: "0:42", who: "koel", text: "when you say \"per voice\" — you mean one interview, however long it was?", highlight: true },
      { t: "0:47", who: "them", text: "yeah, that's what i assumed eventually. but for the first couple minutes i genuinely thought a 5-minute interview might count as 5 voices. the copy says \"per voice\" but there's no tooltip, nothing explaining it." },
      { t: "1:24", who: "koel", text: "did that affect your decision to keep going?" },
      { t: "1:29", who: "them", text: "not really, because your trial made it easy to just try. but it's a friction i'd fix before anyone who's price-sensitive lands on that page." },
    ],
    createdAt: "2026-04-23T08:44:00Z",
  },
  {
    id: "r2",
    surveyId: "1",
    respondentName: "daniel k.",
    respondentRole: "founder, logistics",
    isAnonymous: false,
    quote: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.",
    duration: "4m 18s",
    durationSeconds: 258,
    tags: ["onboarding", "surprise"],
    sentiment: "delighted",
    koelSummary:
      "daniel arrived skeptical and left genuinely surprised. the voice format unlocked a more honest conversation than he expected — he ended up describing a pain point he hadn't articulated before.",
    transcript: [
      { t: "0:00", who: "koel", text: "tell me about the last time you set up a survey — what was the first thing that tripped you up?" },
      { t: "0:06", who: "them", text: "i'll be honest, i thought the voice thing was a gimmick. like, why not just type? but then i started talking and i realized i was saying something different than i would have typed." },
      { t: "0:42", who: "koel", text: "what felt different about speaking versus typing?", highlight: true },
      { t: "0:48", who: "them", text: "when you type you edit yourself. you think about what sounds smart. when you speak you just... say the thing. i talked about my actual problem, not the polished version." },
      { t: "1:30", who: "koel", text: "what were you hoping koel would do differently from what you've tried before?" },
      { t: "1:36", who: "them", text: "i've tried typeform, google forms, even just cold emailing customers. i wanted something that could handle ambiguity — where i don't have to know the right question in advance." },
      { t: "2:20", who: "koel", text: "did koel handle the ambiguity the way you hoped?", highlight: true },
      { t: "2:26", who: "them", text: "mostly. there was one moment where it could have gone deeper and didn't. but overall yeah — it felt like a real conversation." },
    ],
    createdAt: "2026-04-19T05:00:00Z",
  },
  {
    id: "r3",
    surveyId: "1",
    respondentName: "anon · id 0041",
    respondentRole: "—",
    isAnonymous: true,
    quote: "set up was easy. the part where i got stuck was inviting my team — i couldn't find the link.",
    duration: "2m 55s",
    durationSeconds: 175,
    tags: ["onboarding", "invite"],
    sentiment: "neutral",
    koelSummary:
      "smooth setup overall, but the team invite flow created clear friction. this respondent looked in settings first, then the sidebar, before giving up. a discoverability issue more than a feature gap.",
    transcript: [
      { t: "0:00", who: "koel", text: "tell me about the last time you set up a survey — what was the first thing that tripped you up?" },
      { t: "0:07", who: "them", text: "set up was actually really easy. the part where i got stuck was trying to invite my team. i couldn't find the link anywhere." },
      { t: "0:28", who: "koel", text: "where did you look first?", highlight: true },
      { t: "0:33", who: "them", text: "settings. then the sidebar. i thought it might be under 'workspace' but couldn't find it. eventually i gave up and just sent the survey link directly." },
      { t: "1:10", who: "koel", text: "what were you hoping koel would do differently from what you've tried before?" },
      { t: "1:15", who: "them", text: "honestly just something that doesn't feel like a chore. typeform always felt like i was building a form for myself, not for the person answering." },
    ],
    createdAt: "2026-04-18T12:00:00Z",
  },
  {
    id: "r4",
    surveyId: "1",
    respondentName: "ritika s.",
    respondentRole: "ux researcher",
    isAnonymous: false,
    quote: "i've been using typeform for six years. this felt like reading someone's diary by comparison — in a good way.",
    duration: "6m 12s",
    durationSeconds: 372,
    tags: ["comparison", "delight"],
    sentiment: "delighted",
    koelSummary:
      "ritika brings a professional lens as a ux researcher. her comparison to 'reading a diary' points to the depth of responses koel unlocks. she sees strong potential for client work but wants better export and clip-sharing tools.",
    transcript: [
      { t: "0:00", who: "koel", text: "tell me about the last time you set up a survey — what was the first thing that tripped you up?" },
      { t: "0:08", who: "them", text: "i've been using typeform for six years. i came in expecting something similar, just with audio. what i got felt completely different." },
      { t: "0:38", who: "koel", text: "what made it feel different?", highlight: true },
      { t: "0:44", who: "them", text: "the quality of what people say. with forms you get answers. here you get context, emotion, digression — the stuff that's actually useful. it felt like reading someone's diary by comparison." },
      { t: "1:30", who: "koel", text: "what were you hoping koel would do differently from what you've tried before?" },
      { t: "1:36", who: "them", text: "i hoped it would capture nuance that forms can't. it did. i'm already thinking about how to use this with clients for user research." },
      { t: "2:40", who: "koel", text: "what would need to be true for you to recommend it to a client?", highlight: true },
      { t: "2:47", who: "them", text: "better export options and a way to share specific clips, not just transcripts. the insight is there, i just need to be able to show it to stakeholders easily." },
    ],
    createdAt: "2026-04-17T10:00:00Z",
  },
];

export const mockThemes: Theme[] = [
  {
    name: "pricing clarity",
    count: 14,
    color: "#E8B04B",
    summary:
      "respondents hesitate at the 'per voice' pricing line. several described not knowing whether a 5-minute interview counted as one voice or five. the uncertainty stalled decisions rather than stopping them — but it's unnecessary friction at a critical moment.",
    quotes: [
      { q: "i couldn't tell if i was being charged per interview or per minute.", who: "maya r." },
      { q: "the pricing was the one place i had to re-read the copy.", who: "anon · 0038" },
    ],
  },
  {
    name: "onboarding",
    count: 11,
    color: "#4A7C59",
    summary:
      "setup itself was smooth. the friction clustered around one moment: inviting the team. 9 respondents mentioned not finding the invite link. most eventually sent the survey link directly — a workaround that masks the gap.",
    quotes: [
      { q: "set up was easy. the part where i got stuck was inviting my team.", who: "anon · 0041" },
    ],
  },
  {
    name: "team invites",
    count: 8,
    color: "#F08A63",
    summary:
      "a sub-theme of onboarding, but worth calling out separately. people kept looking for the invite action in settings, not on the home screen. the mental model expects it near account or workspace controls.",
    quotes: [],
  },
  {
    name: "voice novelty",
    count: 6,
    color: "#1A1A2E",
    summary:
      "this cohort expected a gimmick and left surprised. the same six respondents had the highest completion rate (91% vs 84% overall). the novelty didn't wear off — it converted into a belief that voice unlocks something typing can't.",
    quotes: [
      { q: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.", who: "daniel k." },
    ],
  },
  {
    name: "integrations",
    count: 4,
    color: "#A79E8C",
    summary:
      "mostly asks for slack and notion — both already supported. a documentation problem, not a product one. these respondents didn't know the integrations existed.",
    quotes: [],
  },
];

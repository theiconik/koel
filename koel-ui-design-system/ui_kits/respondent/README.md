# Respondent UI Kit

The public-facing experience when someone clicks a koel survey link. This is **separate from the app kit** — respondents never see the creator dashboard, sidebar, or anything research-related.

## Mental model

> Respondents don't see questions. The AI asks. They talk.

The entire interaction reduces to two touches: **start** → **end**. Everything else is the AI's job.

## Stages

1. **Landing** — survey intro, host name, a single "start" button
2. **Permission** — microphone permission primer, not a form
3. **Chatting** — the main event: transcript-style conversation, big mic, AI speaks first and follows up
4. **Ending** — "ready to wrap up?" confirmation
5. **Thanks** — gratitude + what happens next

## Files

- `index.html` — entry
- `Respondent.jsx` — all stages as one component tree

## Design notes

- **No sidebar, no chrome** — respondents get a centered, content-first layout
- **Mic is the hero** — during chatting, the mic dock sits at the bottom with a pulsing state when active
- **AI identity is clear** — koel's turns have her logo avatar and an optional "speaking" indicator
- **User's turns show as transcribed text** — they can see what the AI heard
- **Hosted by [workspace name]** is shown prominently on landing so respondents know who's asking

# App UI Kit

Recreation of koel's in-product surface — the dashboard survey creators see, and the voice session respondents answer in.

## Views

- **Dashboard home** — greeting, 4 stat cards, grid of surveys with status chips
- **Survey detail / Responses** — voice cards with quote pull-outs, auto-theme sidebar
- **New survey** — question editor + sticky preview panel
- **Respondent voice session** — full-screen, mic-centric, reactive waveform

## Files

- `index.html` — interactive click-thru across all four views (use the sidebar + buttons)
- `Components.jsx` — `Sidebar`, `AppTopBar`, `DashboardHome`, `SurveyCard`, `ResponsesView`, `ResponseCard`, `ThemesPanel`, `NewSurveyView`, `RespondentSession`, `Icon` (Lucide-style inline), plus atoms (`Button`, `StatusChip`, `StatCard`, `TabBtn`)

Uses `../../colors_and_type.css` tokens.

**Caveats.** Built from the brand brief, not an existing codebase. The interaction flow is a plausible interpretation — real production flow may branch differently. The icon set is Lucide-style inline SVG (substitution flagged in README).

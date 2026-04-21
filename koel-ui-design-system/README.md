# Koel Design System

Koel is an **AI voice-powered survey platform** that replaces form fields with a conversation. Instead of a 7-question Likert grid, respondents speak; Koel transcribes, summarises, and surfaces the *actual thought process* behind each answer back to the survey creator.

The name comes from the **koel** — an Asian songbird known for its melodic call. The identity leans into that: warm, human, a little literary, South Asian roots but globally legible. Think Linear's restraint meets Airbnb's warmth.

---

## Sources provided

| Kind | Path | Notes |
|---|---|---|
| Wordmark / brandmark | `uploads/koel-logo.svg` → `assets/koel-logo.svg` | Line-drawn bird mark. 698×598 (roughly square). Pair with "koel" wordmark in Absans for full lockup. |
| Display type | `uploads/Absans-Regular.otf` → `fonts/Absans-Regular.otf` | One weight only. Headlines + wordmark. |
| UI type | `uploads/Manrope-*.ttf` → `fonts/Manrope-*.ttf` | 200 / 300 / 400 / 500 / 600 / 700 / 800. |
| Brand brief | chat | Songbird palette, usage ratios, content principles. |

No codebase or Figma was attached, so UI kits are built from the brand brief + product description. Flag for iteration: if you add a codebase or Figma, I'll re-align the UI kits to match.

---

## File index

```
README.md                    ← you are here
SKILL.md                     ← Claude Skill manifest (reusable)
colors_and_type.css          ← tokens: colors, type, spacing, radii, motion
assets/
  koel-logo.svg              ← square bird mark (698×598)
fonts/                       ← Absans + Manrope (all weights)
preview/                     ← design-system cards shown in the Design System tab
ui_kits/
  marketing/                 ← koel.ai-style marketing site
  app/                       ← the survey runner + creator dashboard
```

---

## Content fundamentals

**Voice.** Quiet confidence. We don't shout. We don't sell. We describe.

**Tone register.**
- Warm, not chipper. "Welcome back" over "Hey there! 👋"
- Precise, not corporate. "37 voices, 4 minutes each" over "Gather rich qualitative insights."
- Literary touches okay. The bird is a through-line — *listen*, *voice*, *call*, *song* show up in copy without being cute.
- No jargon. "survey" not "instrument." "question" not "prompt item."

**Casing.**
- **Wordmark** and product name: always lowercase — `koel`, never `Koel` or `KOEL`.
- **Headlines** in Absans: sentence case. "listen to what people actually mean." Full stops allowed at end of headlines — editorial, not marketing.
- **UI labels / buttons**: sentence case. "Start survey", "Add question". Never Title Case Like This.
- **Micro-labels / eyebrows**: ALL CAPS with +8% letter-spacing, used sparingly as a typographic device (tag above a headline, section marker).

**Person.**
- Marketing speaks to *you* (the survey creator). "**you** get the answer behind the answer."
- In-product speaks as *we* sparingly, usually as the system: "we're transcribing now." First-person "I" is reserved for the respondent-facing voice experience itself.

**Punctuation quirks.**
- Em-dashes are fine and encouraged — they match the conversational rhythm.
- Oxford comma: yes.
- Periods at end of single-line headlines: yes, an editorial choice.

**No.**
- No 🎉 🚀 ✨ emoji anywhere in product or marketing copy. The bird carries all the personality.
- No exclamation marks in UI. At most one per marketing page.
- No "revolutionize," "unlock," "supercharge," "game-changer."
- No speech-bubble iconography. We are a *voice* product, not a chat product.
- No generic SaaS blue. The palette *is* the differentiator.

**Specific examples.**

| Do | Don't |
|---|---|
| listen to what people actually mean. | 🚀 Revolutionize your research with AI! |
| 37 voices, ready when you are. | You have 37 new responses! |
| your first survey takes about 6 minutes to set up. | Get started in minutes! |
| we heard something. transcribing now — | ⚡ Processing your response... |
| koel is listening. | Koel is ready to chat! |

---

## Visual foundations

**Palette & ratio.** 60% cream background · 30% midnight ink · 10% mango accent. Forest and coral appear as punctuation — forest for success states, coral because it literally lives inside the logo (sound waves). Never run mango, forest, and coral all on one screen.

**Type.** Absans for every h1/h2 and the wordmark — it carries all the *display* personality, so body can be unfussy Manrope. Headlines run tight (line-height 1.04–1.2), letter-spacing slightly negative. Body runs generous (line-height 1.7). The display / body contrast *is* the type system. No third family.

**Spacing & layout.** Generous. Editorial. Content columns cap at ~680px for readable prose, ~1200px for product UI. Sections breathe — 96–128px vertical gaps between marketing sections; 32–48px inside app screens. Whitespace is a feature, not a cost.

**Backgrounds.** Solid `--cream` by default. Second surface is pure white (`--bg-raised`) for cards that need lift. No gradient backgrounds. No mesh gradients. No hero imagery collage. The occasional full-bleed midnight section for contrast pivots (testimonials, footers). A very subtle 1px warm-grain texture is *acceptable* on large cream surfaces but entirely optional.

**Imagery.** Warm, grainy, natural light. Shot on film or film-emulated. Never stock-photo blue-sky corporate. When we show people, we show them listening, in thought, mid-pause — not smiling at cameras. If no real photo is available, leave the space empty or use a solid mango / forest block as a deliberate placeholder. **Do not generate SVG illustrations of people or environments** — better to show restraint.

**Animation.** Restrained. `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` at `220ms` for almost everything. Fade + 4–8px translate on enter. No bounces, no springs, no parallax. The one expressive animation allowed: the **voice waveform** during recording — a live, continuous reactive bar chart in mango or coral.

**Hover.** Buttons: darken the fill 6–8% (`--accent-hover`). Links: 70% opacity → 100%. Cards: `--shadow-sm` lifts to `--shadow-md`, plus 1px translate-y. Never a color change on hovered cards.

**Press.** Buttons: darken to `--accent-press` AND `scale(0.98)` with no translate. 120ms, ease-out.

**Focus.** Always visible. `--focus-ring` = `0 0 0 3px rgba(232,176,75,0.35)` — mango at 35%. Never the browser default blue.

**Borders.** 1px `--border` (`rgba(26,26,46,0.10)`) is the house border. No double borders, no dashed borders except to indicate drop zones. Mango 1px border appears only on the active voice-recording state.

**Shadows.** Warm-tinted (midnight at low alpha, not pure black). Four levels: `xs` / `sm` / `md` / `lg`. Elevate intentionally — most surfaces sit flat on cream. A card usually has `sm`; a modal `lg`; a popover `md`.

**Corner radii.** Restrained: 4 / 6 / 10 / 16 / 24. Default card = 16. Default button = 10. Input = 10. Pills only for tags/status chips (999). Avoid 4px + pill on the same screen — pick an axis.

**Transparency & blur.** Rare. Sticky nav over cream: 80% cream + 8px backdrop-blur is allowed. Modals get a `rgba(26,26,46,0.40)` scrim, no blur. We do not use glass-morphism cards.

**Capsules vs protection gradients.** We use **capsules** (pill chips) for status and tags. We do **not** use protection gradients over imagery — if imagery needs text legibility, we use a solid midnight block beside it.

**Fixed elements.** Top nav on marketing: fixed, 64px, cream/80 + blur. In-product: a 240px left rail, fixed. No bottom-docked toolbars on desktop.

**Cards.** Default card = `--bg-raised` (white) on cream, 1px `--border`, `--r-lg` (16px), `--shadow-sm`, 24–32px internal padding. No colored left borders. No gradient headers. No shadow + border with dark background — pick lift or outline.

**Buttons.**
- *Primary*: midnight fill, cream text. Mango is used for the single most important CTA on a page (Start survey, Publish, Send). A page should almost never have two mango buttons.
- *Secondary*: transparent, 1px midnight border, midnight text.
- *Tertiary / ghost*: no border, midnight text, hover = `--stone-100` fill.

**Inputs.** White fill, 1px border, 10px radius, 44px min height. Label above input, help text below in `--fg3`. Error state uses `--danger` border + help text, never red fill.

---

## Iconography

The product uses a thin-stroke, humanist line icon system — 1.75px stroke, rounded caps, rounded joins, mostly 24×24. This matches the logo's hand-drawn-feeling bird.

**What we use:** [Lucide](https://lucide.dev) via CDN. Lucide's 1.5–2px rounded strokes match the wordmark's line quality closely. *(Substitution: no first-party icon set was provided with the brand. Lucide is flagged here as a placeholder — replace with an in-house set once designed. It's the closest CDN-available match.)*

**How we use it.**
- Always stroke, never filled — except for status dots and the recording indicator.
- Icon color inherits `currentColor`; set via text color, not SVG fill.
- Pair every icon with a label in UI. No icon-only buttons except the obvious four: close (×), back (←), menu (☰), and the voice record button.
- Icons sit at 20px in buttons, 24px in nav, 18px inline with body copy.

**What we don't use.**
- **No emoji** in product or marketing. Not even 🎤. The bird does this job.
- **No unicode glyphs** as icons (no ★, ✓, ⌘ in copy — use Lucide `check`, `command`).
- **No duotone, no gradient-filled, no 3D icons.**
- **No speech-bubble icons** anywhere. We are voice, not chat.

**The exception: the bird.** The koel bird itself is used as a mark, a loading indicator (single bird, subtle head-tilt on ~4s loop), and occasionally as a section divider. It never becomes a "cute mascot" with facial expressions — it stays the single line-drawing it is in the logo.

---

## How to use this system

Drop `colors_and_type.css` at the top of any HTML artifact:

```html
<link rel="stylesheet" href="../colors_and_type.css">
```

Then build with tokens: `var(--midnight)`, `var(--accent)`, `var(--fs-h1)`, etc. Element defaults (`h1`, `p`, `small`) are styled — you can write plain HTML and it will look like koel.

See `ui_kits/marketing/index.html` for the marketing voice, `ui_kits/app/index.html` for the in-product voice.

---

## Caveats (things to iterate on)

- **No codebase or Figma was attached.** UI kits are built from the brand brief + product description, not from existing production UI. If you have a codebase or Figma, share it and I'll re-align.
- **Icon set is a substitution.** Lucide (inline SVG, 1.75px stroke, rounded) is used in UI. Replace with a first-party set when available.
- **The mango yellow (#E8B04B) in the palette is brand-brief-specified**, but the logo itself uses a **coral / orange** tone for the sound waves (captured as `--coral #F08A63`). I've kept both — mango as CTA accent, coral as a logo-linked secondary. Worth confirming.
- **No slide template was provided**, so no `slides/` folder was created. Ask if you want one.
- **No imagery** (brand photography, illustrations) was provided beyond the logo. The system calls for warm, film-grainy photography — placeholders are used in cards.

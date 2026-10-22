# Stellar smart accounts — Hack Meridian deck

A 15-minute talk in 16 slides, followed by 15 appendix slides for questions,
built on the
[Hack Meridian Google Slides template](https://docs.google.com/presentation/d/1-HRAkfaI2YZQZzSWonXNrDxBCA1HZ4r_OjJ-YvP6lNM/edit).
Every slide has a speaker script, timing, an optional stage cue, and sources in
its notes.

## Open it

- [`dist/hack-meridian-smart-accounts.pptx`](dist/hack-meridian-smart-accounts.pptx) — the deck, with notes
- [`dist/hack-meridian-smart-accounts.pdf`](dist/hack-meridian-smart-accounts.pdf) — the same, rendered with Inter
- [`dist/hack-meridian-slide-preview.html`](dist/hack-meridian-slide-preview.html) — one file: slides beside their scripts, with a present mode
- [`dist/speaker-notes.md`](dist/speaker-notes.md) — every slide's text, timing, cue, script and links, as Markdown
- [`dist/slides.json`](dist/slides.json) — the same notes as data, with no images, for tools and coding agents

## Outline

| Part | Slides | Time |
| --- | --- | --- |
| Opening | 1 | 0:00–0:35 |
| Why a C-address over a G-address: rules, what they buy you, and the trade-offs, including what Nido's relayer pays per account and grant | 2–6 | 0:35–5:00 |
| Perch in one rule; Nido; the finding that the popup can't sign for your contract | 7–9 | 5:00–7:50 |
| Walkthrough: the agent-built Kudos Jar on testnet, from approval to the account refusing a tip | 10–12 | 7:50–10:20 |
| Building your own: when the wallet says "unknown", patterns from six teams, build your own, next step | 13–16 | 10:20–15:00 |
| Appendix: more of what rules buy you, Perch in depth (documents, enforcement, verifiers, constructorless publishing, factories), what an app can ask Nido for, the rest of the walkthrough, what the agent tripped on, upstream findings, running Kudos Jar | 17–31 | backup |

Facts about Nido and Perch are pinned to `nidohq/nido@4fee10d` and
`stellar-registry/perch@2d1df9b`. Demo facts come from a live run of Kudos Jar,
an app a coding agent built from the template and ran on testnet (Oct 2026).
The relayer costs, failure modes and patterns come from a simulated hackathon
run with six teams (Oct 2026). Slide notes link the template's files; where
the demo and hackathon material isn't published alongside the deck, the notes
cite it as plain text.

## Build

Content lives in [`.build/content.mjs`](.build/content.mjs): one entry per slide
naming a template layout (`title`, `bigIdea`, `steps`, `takeaways`,
`topicLeft`, `topicRight`, `demo`, `code`, `next`) and its text. Entries marked
`appendix` come after the closing slide and don't count toward the talk's time;
[`.build/schedule.mjs`](.build/schedule.mjs) works out each slide's start.
Screenshots of the Kudos Jar run are in [`assets/`](assets/).

```sh
node .build/make-dist.mjs
```

That runs `build.mjs` (fill the template, write notes, render PNGs to
`.build/render/`), `finalize.mjs` (package, layout and font validation; receipt in
`.build/validation.json`), a LibreOffice render with Inter, `review.mjs` (the HTML
preview), `notes.mjs` (`speaker-notes.md` and `slides.json`), and copies the
results to `dist/`. `node .build/notes.mjs` on its own regenerates the text
notes with nothing but Node. The full pipeline needs the Codex presentations
runtime (artifact-tool, validators, `soffice`, `pdftoppm`) and the Inter TTFs
from <https://github.com/rsms/inter/releases>
(`Inter-{Regular,Medium,SemiBold,Bold,Light}.ttf`, in `.build/fonts/` by
default). [`.build/runtime.mjs`](.build/runtime.mjs) lists the environment
variables that locate each (`CODEX_RUNTIME`, `PRESENTATIONS_SKILL`,
`INTER_FONTS`, …) with their defaults; `make-dist.mjs` links
`.build/node_modules` to the runtime's packages. `output/` is scratch.

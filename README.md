# Scaffold Stellar + Nido: template and talk

Two things from building Stellar apps on [Nido](https://test.nido.fyi) smart
accounts:

- [`template/`](template/): a React app template for Stellar smart contracts
  where people sign in with a passkey. Nido accounts sit in the wallet picker,
  and the template carries what a smart account needs to use your contracts:
  session keys the owner approves once, the calls signed with them, and the
  screens that ask. Built on [Scaffold Stellar](https://github.com/stellar-scaffold/cli).
  Testnet only.
- [`slides/`](slides/): "Stellar smart accounts", a 15-minute Hack Meridian talk
  with an appendix for questions, on what a contract account buys you, Perch
  policies, Nido, and building your own app from the template.

Nido is at <https://github.com/nidohq/nido>; the Perch policy language its
accounts enforce is at <https://github.com/stellar-registry/perch>.

## Start the template

You need Node 22.12+, Rust with the `wasm32v1-none` target and the
[Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli); the
project installs its own Scaffold.

```sh
cd template
npm run new-app -- ../my-app --blank   # copy the template, without the samples
cd ../my-app
npm run tools:scaffold && npm ci && npm run doctor
npm run deploy:testnet && npm run dev
```

`npm run doctor` says what is missing and how to fix it. Read
[`template/NIDO.md`](template/NIDO.md) for the quick start, your own contract in
five steps, the call pattern and the rules a Nido account follows; coding agents
read [`template/AGENTS.md`](template/AGENTS.md). `npm run test:unit` runs the
unit tests.

## Present or rebuild the slides

Open them from [`slides/dist/`](slides/dist/):

- `hack-meridian-smart-accounts.pptx`, with speaker notes, and the same deck as a PDF
- `hack-meridian-slide-preview.html`: slides beside their scripts in one file;
  **Present** goes full screen, arrow keys move
- `speaker-notes.md` and `slides.json`: every slide's text, timing, script and
  links, as Markdown and as data

The content is in [`slides/.build/content.mjs`](slides/.build/content.mjs).
`node slides/.build/notes.mjs` regenerates the text notes with only Node.
`node slides/.build/make-dist.mjs` rebuilds everything; it needs the Codex
presentations runtime and the Inter fonts, located by the environment variables
in [`slides/.build/runtime.mjs`](slides/.build/runtime.mjs).
[`slides/README.md`](slides/README.md) has the outline and the pipeline.

## Provenance

This repo is exported from a research workspace. The talk draws on a live run of
Kudos Jar, a demo app a coding agent built from this template, and on a
simulated six-team hackathon run (both Oct 2026); neither is published here, so
the slide notes cite them as plain text.

The one secret key in the tree, in
[`template/.github/workflows/build.yml`](template/.github/workflows/build.yml),
comes unchanged from the public upstream
[stellar-scaffold/ui](https://github.com/stellar-scaffold/ui) workflow: it
funds a throwaway identity on the CI job's local quickstart network.

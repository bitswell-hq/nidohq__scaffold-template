# UX walkthrough: Guess the Number on the Nido template, with a 2 XLM session cap, and on the default G-address template

A first-time player's walkthrough, 2026-10-22. Everything ran locally against
Stellar testnet (Nido template) and a local quickstart network (default
template), with throwaway keys and virtual passkeys only.

## Summary

- **The Nido template already shipped a session with a spending cap.** At
  `5170276`, before #9, Guess the Number asks for one session made of two
  grants: `guess` on the game, and XLM `transfer` capped at **3 XLM/day**. A
  first-time player creates a passkey account on test.nido.fyi, approves once
  (two passkey confirmations on two Nido pages), then guesses with no prompts.
  The 4th wrong guess was refused by the account (`#3221`) with "Your account
  refused: this would go over the spending cap you gave this app." (Part A,
  steps 01–29.)
- **Part B is a small change to the template itself**: the cap is now **2
  XLM/day**, so two wrong guesses go through and the account refuses the third.
  The game says what a guess costs, and the refusal names the cap and says it
  cost nothing. A small `isOverCap()` helper, an e2e test and docs come with it.
  The change is https://github.com/nidohq/scaffold-template/pull/9, merged after
  this walkthrough. Verified live on testnet (steps 30–44): unit 34/34, e2e
  12/12, lint, build, `format:check`, and a fresh app from the commit.
- **"One session" is one Approve click but two passkey confirmations.** Nido's
  grant page takes exactly one `target` per request
  (`packages/frontend/src/lib/policy/docRequest.ts` in nidohq/nido), and the
  game needs a rule on the game contract plus one on the XLM token. Getting to a
  single confirmation needs a multi-grant page in Nido; the template can't do it
  alone.
- **The default React template (G-address) needs a browser extension at every
  step.** On the local network its picker offers only xBull, Freighter and Hana.
  A player installs Freighter, creates a password, saves a 12-word phrase, adds
  the "Local" network by hand, connects, funds the account, then approves a
  Freighter popup for every guess. The app's own screens are real captures;
  Freighter's popups are drawn as labelled mocks (steps 45–62).
- **Bug found in the upstream default template:** its guess `<input>` has no
  `name`, so `formData.get("guess")` is `null` and **every Submit shows
  "Incorrect guess. Try again!" without sending anything**. Rejected signatures
  and other errors show the same text. It is still present on
  `stellar-scaffold/ui` main
  (`templates/react/src/components/GuessTheNumber.tsx:50-57`). Step 54 shows it;
  steps 57–62 use a one-line local patch so the signing flow could be shown.
- **Fees:** on the Nido template the player's account pays only the 1 XLM stake
  per wrong guess. The app's session key pays the transaction fee: **about 0.53
  XLM for the first guess** with a new session, almost all of it rent for
  extending the session's persistent entries on first use, and **about 0.034 XLM
  for each later guess**, mostly rent for the growing spending-history entry
  (see [Where the fee goes](#where-the-fee-goes)). That key is Friendbot-funded
  on testnet, but on mainnet the app would have to fund it. Nido's relayer pays
  for account creation and grants. On the G-address template the player pays the
  stake plus about 0.001–0.002 XLM per guess (local network fees, so not
  directly comparable to testnet).

## How it was run

| Step                 | Command                                                                                                                                                                                                   | Result                                                                                                                                                              | Time       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Part A init          | `stellar scaffold init --template nidohq/scaffold-template guess-a --yes`                                                                                                                                 | OK; copies `.env`, runs `npm install`, builds contracts, `git init`                                                                                                 | 53 s       |
|                      | `npm run tools:scaffold`                                                                                                                                                                                  | stellar-scaffold 0.0.31 into `.tools/bin`                                                                                                                           | 1 s        |
|                      | `npm ci`                                                                                                                                                                                                  | OK; 18 `allow-scripts` warnings (documented as harmless)                                                                                                            | 14 s       |
|                      | `npm run doctor`                                                                                                                                                                                          | all ✔, "Ready."                                                                                                                                                     | 1 s        |
|                      | `npm run clients:testnet`                                                                                                                                                                                 | client for the shared deployment `CBY4S4Z2…QUECYGUW`                                                                                                                | 33 s       |
|                      | `npm run dev`                                                                                                                                                                                             | Vite on http://localhost:5173                                                                                                                                       | <1 s       |
|                      | `npm run test-browser`                                                                                                                                                                                    | **failed twice**: "Chrome did not open a debugging port within 30 s" with Playwright's chromium-1223; worked with `CHROME_PATH` set to chromium-1234 (see Friction) | n/a        |
| Part B app           | `git archive` of the branch of https://github.com/nidohq/scaffold-template/pull/9 → `cp .env.example .env` → `npm install` → `git init` (what init does after its download; init can't take a local path) | then `tools:scaffold`, `doctor`, `clients:testnet`, `build`, `test:unit`, all rc=0                                                                                  | 9 s + 38 s |
| Part B, second route | `npm run new-app -- <dir>` from that branch                                                                                                                                                               | rc=0, sample carries the 2 XLM cap                                                                                                                                  |            |
| Part C init          | `stellar scaffold init --template react guess-c --yes`                                                                                                                                                    | OK; uses the already-running `stellar-local` quickstart container                                                                                                   | 58 s       |
|                      | `npm run dev`                                                                                                                                                                                             | Vite on :5173, network "Local"                                                                                                                                      |            |

The browser was headless Chrome for Testing 151 (chromium-1234), driven with
`chrome-devtools-axi`, with the template's virtual-passkey sidecar
(`scripts/webauthn-sidecar.mjs`) in Parts A and B. A virtual authenticator
approves passkey prompts instantly, so the OS passkey sheet (Touch ID / Face ID)
that a real player sees **never appears in these screenshots**. Each "Create
with a passkey" or "Confirm" click below is one biometric prompt for a real
person.

To make the demo guesses deterministically wrong, I read the secret number from
the game's instance storage (`stellar contract read … --key-xdr AAAAFA==` →
`n = 4` on testnet, `6` on local).

---

## Part A: Nido template as shipped before #9 (`5170276`), first-time player

Player account: `CCEZ6BX6PWOP6HQURE4A7TT77UY6M25J4IV22YRKBYYUCXIZO2NDE4WA`
(created in this run).

**01. Landing.** The player opens the app. The header shows "Testnet" and
Connect; the guess form is visible. ![01](screenshots/01-a-landing.png)

**02. Wallet picker.** The player clicks Connect. Nido is listed first;
Freighter and Fordefi show "Install". ![02](screenshots/02-a-wallet-picker.png)

**03. Nido connect popup, no account yet.** The player chooses Nido and a popup
opens on test.nido.fyi: "No accounts on this device. **Create one first**, then
come back." ![03](screenshots/03-a-nido-connect-no-account.png)

**04. Nido home (in the popup).** The player follows "Create one first" and sees
Nido's landing page, squeezed into the ~460 px popup.
![04](screenshots/04-a-nido-home.png)

**05. Get started.** "Get started" opens a menu with one item, "Set up with your
face". ![05](screenshots/05-a-nido-get-started.png)

**06. Address reserved.** "Setting up your Nido… Your Nido is ready." Nido
reserves the C-address before any passkey exists.
![06](screenshots/06-a-nido-address-reserved.png)

**07. Lock it to you.** "Create with a passkey". This is the player's first
biometric prompt (auto-approved here). ![07](screenshots/07-a-nido-passkey.png)

**08. You're almost in.** The player can set up recovery now or later, and
clicks "Continue to my wallet". ![08](screenshots/08-a-nido-almost-in.png)

**09. Deploying.** A progress list: locked to you → preparing → submitting →
confirming → finalizing. Nido's relayer pays.
![09](screenshots/09-a-nido-deploying.png)

**10. Ready.** "Your Nido is ready. It's live on Stellar and locked to you."
![10](screenshots/10-a-nido-ready.png)

**11. Nido wallet.** 5 XLM, the C-address, Send/Receive/Security and a recovery
nudge. About 48 s from "Get started" to here.
![11](screenshots/11-a-nido-wallet.png)

**12. Back in the app: a red error toast.** Closing the popup to return to the
app shows **"Wallet connection was cancelled or failed."**, even though nothing
went wrong from the player's point of view (see Friction).
![12](screenshots/12-a-connect-cancelled-toast.png)

**13. Connect again → choose the account.** Connect → Nido again; the popup now
lists the new account. One click shares only the address ("Read-only… no signing
happens here"). ![13](screenshots/13-a-nido-choose-account.png)

**14. Connected; the session gate.** The header shows `CCEZ…E4WA` and 5 XLM. The
form is replaced by the explanation ("may call `guess` and move up to 3 XLM a
day… for 24 hours") and **"Approve with Nido (2 confirmations)"**.
![14](screenshots/14-a-session-gate.png)

**15. Preparing a key.** The app makes an ed25519 session key and has Friendbot
fund it (about 2 s here; NIDO.md measured 11 s).
![15](screenshots/15-a-preparing-key.png)

**16. Nido grant 1: "Let an app in?"** The app redirects to
`<account>.test.nido.fyi/security/delegate-doc/`. It shows the scope ("Only:
guess" on the game contract), the app's key, expiry "In 24 hours" and an empty
spending cap. ![16](screenshots/16-a-nido-grant1-page.png)

**17. Grant 1: accept "no cap", see the document.** Because this rule has no
cap, the player must tick **"Let this key spend without any cap"**, a rule that
can only call `guess`. The page previews the policy document, its hash and the
diff. ![17](screenshots/17-a-nido-grant1-no-cap.png)

**18. Grant 1: Confirm it's you.** A summary of the signature request ("Grant an
app a scoped session key", rule `guess`, "Can spend: Any amount"). Confirm is
passkey confirmation **1 of 2**. ![18](screenshots/18-a-nido-grant1-confirm.png)

**19. Grant 1 applying.** Building → sign with passkey → submitting → confirming
on-chain, through Nido's relayer.
![19](screenshots/19-a-nido-grant1-applying.png)

**20. Nido grant 2 (XLM, capped).** The app bounces straight to the second
grant: "Only: transfer" on the XLM contract `CDLZFC…HGCYSC`, with the spending
cap prefilled at **3 XLM per day**. ![20](screenshots/20-a-nido-grant2-page.png)

**21. Grant 2: approving summary.** "Up to 3 XLM per day", plus the document
with both rules. ![21](screenshots/21-a-nido-grant2-bottom.png)

**22. Grant 2: Confirm it's you.** Passkey confirmation **2 of 2**.
![22](screenshots/22-a-nido-grant2-confirm.png)

**23. Grant 2 applying.** ![23](screenshots/23-a-nido-grant2-applying.png)

**24. Session ready.** Back in the app: "This app holds a session key for your
account, approved until Fri 4:35 PM. [Forget it]", and the guess form is back.
From the Approve click to here took 81 s, including screenshot pauses.
![24](screenshots/24-a-session-ready.png)

**25. Guess 1, submitting.** The player types 7 and clicks Submit. No popup, no
prompt. ![25](screenshots/25-a-guess1-pending.png)

**26. Guess 1 result.** "Incorrect guess. Try again!" with the transaction hash
(`0569b71c…322b2b`); the balance goes **5 → 4 XLM**. About 4–7 s.
![26](screenshots/26-a-guess1-result.png)

**27. Guess 2.** No prompt; 4 → 3 XLM (`ee10cdb7…01811e`).
![27](screenshots/27-a-guess2-result.png)

**28. Guess 3.** No prompt; 3 → 2 XLM (`abcddc2c…a109bd`). That is 3 XLM spent
today, the shipped cap. ![28](screenshots/28-a-guess3-result.png)

**29. Guess 4: refused by the account.** In about 1.2 s: "Your account refused:
this would go over the spending cap you gave this app." The balance stays at 2
XLM, nothing was submitted, and no fee was paid. The refusal happens in the
enforced simulation. ![29](screenshots/29-a-guess4-over-cap.png)

---

## Part B: the template with the session cap set to 2 XLM ([PR #9](https://github.com/nidohq/scaffold-template/pull/9)), new first-time player

The change is in the template source, so every new app gets it (developer
section below). The app here was made from that PR's branch and run the same way
as Part A, with a fresh browser profile, a fresh passkey and a fresh account:
`CCH2FDKHAMKNT33JCF6NOOUDKZNFIKVOM2P5PMDI7D456LLI6VZSO732`. Account creation and
connect looked exactly like steps 03–13 (same Nido pages, same toast), so those
are not repeated. From opening the app to the funded account took 39 s.

**Why the period is `day`:** the session's grants last `24h` and the cap's `day`
is a rolling 17,280-ledger window (Nido's policy page says "2 XLM per 17,280
ledgers (rolling)", step 44). With matching windows, the cap is also the most
one approval can ever spend: exactly two wrong guesses per approval. A `week` or
`30d` period would allow two wrong guesses in total, but expiry would make the
player re-approve daily anyway, which muddies the demo.

**30. Nido wallet, new account.** 5 XLM. ![30](screenshots/30-b-nido-wallet.png)

**31. Session gate, new text.** "Each wrong guess costs 1 XLM. Approve this game
once and it can guess for you for 24 hours without asking again, spending at
most 2 XLM a day from your account: 2 wrong guesses, then your account says no.
Nido asks you to confirm two rules…" **Approve with Nido (2 confirmations).**
![31](screenshots/31-b-session-gate.png)

**32. Preparing a key.** ![32](screenshots/32-b-preparing-key.png)

**33. Nido grant 1 (game, `guess` only).**
![33](screenshots/33-b-nido-grant1-page.png)

**34. Grant 1: "no cap" ticked, document preview.**
![34](screenshots/34-b-nido-grant1-bottom.png)

**35. Grant 1: Confirm.** Passkey confirmation 1 of 2.
![35](screenshots/35-b-nido-grant1-confirm.png)

**36. Nido grant 2: the 2 XLM cap.** "Only: transfer" on XLM; **Spending cap: 2
per day**; "You're approving… Amount: **Up to 2 XLM per day**".
![36](screenshots/36-b-nido-grant2-page.png)

**37. Grant 2: approving summary and document.**
![37](screenshots/37-b-nido-grant2-bottom.png)

**38. Grant 2: Confirm.** Rule `guess-xlm`. Passkey confirmation 2 of 2.
![38](screenshots/38-b-nido-grant2-confirm.png)

**39. Grant 2 applying.** ![39](screenshots/39-b-nido-grant2-applying.png)

**40. Session ready.** "approved until Fri 4:45 PM". From the Approve click to
here took 47 s. ![40](screenshots/40-b-session-ready.png)

**41. Guess 1, no prompt.** "Incorrect guess: that cost 1 XLM. Try again!" with
the hash `63257679…df6fe377`; **5 → 4 XLM**; 6.0 s.
![41](screenshots/41-b-guess1-result.png)

**42. Guess 2, no prompt.** **4 → 3 XLM** (`8ee5f355…58476d7a`); 7.4 s.
![42](screenshots/42-b-guess2-result.png)

**43. Guess 3: refused, friendly.** "That's the 2 XLM a day you let this game
spend, so your account stopped this guess before anything was sent. It cost
nothing. Come back tomorrow for more guesses." The balance stays at **3 XLM**.
No prompt, no transaction, no fee; about 1.2 s (timed again with a 4th guess,
same result). ![43](screenshots/43-b-guess3-refused.png)

**44. What the account holds (Nido policy page).** Rule `guess`: "session" can
call `guess` on the game. Rule `guess-xlm`: "session" can call `transfer` on
XLM, **spending cap 2 XLM per 17,280 ledgers (rolling)**. Each rule stops at its
ledger. ![44](screenshots/44-b-nido-policy.png)

---

## Part C: default stellar-scaffold React template (G-address, Stellar Wallets Kit)

`stellar scaffold init --template react` (stellar-scaffold 0.0.31, which
downloads `stellar-scaffold/ui`). The app runs on the **local** quickstart
network by default, and on Local/Futurenet its wallet kit lists only xBull,
Freighter and Hana (`app-lib/wallet.ts`, `CUSTOM_NETWORK_WALLETS`).

**What is real and what is mocked.**

- **Real captures (unlabelled):** the app's own screens (45, 46, 51, 53–56, 58,
  60, 62).
- **Real signing, behind those screens:** no extension can be installed in the
  automated browser, so I injected a small page-level stand-in for Freighter
  after load. It answers `@stellar/freighter-api`'s `postMessage` protocol
  (`REQUEST_ACCESS`, `REQUEST_PUBLIC_KEY`, `REQUEST_NETWORK_DETAILS`,
  `SUBMIT_TRANSACTION`) with a throwaway local key,
  `GBO4H3WFMTNWZU5SJJSXXOW2ML26TEIQOY66MF2SYANVWAI4JY4YEIJP`. So the app, the
  wallet kit, the generated client and the transactions are all real; only the
  extension is replaced.
- **Mocked (labelled):** Freighter's own windows (47–50, 52, 57, 59, 61). Each
  carries a visible **"illustrative mock (Freighter)"** label in two places.
  They are drawn from general knowledge of Freighter's flow, not copied from its
  UI, and sit over the real app capture of that moment.
- **What a real player does differently:** clicks the extension icon, types the
  Freighter password when it's locked, and sees each popup as a separate
  extension window.

**45. Landing.** The same layout as the Nido template; the network pill says
"Local". ![45](screenshots/45-c-landing.png)

**46. Wallet picker, no extension installed.** xBull, Freighter (**Install**)
and Hana Wallet (**Install**). ![46](screenshots/46-c-wallet-picker.png)

**47. Install Freighter (mock).** The player leaves the app for the extension
store. Nothing in the app can do this for them.
![47](screenshots/47-c-mock-install.png)

**48. Freighter: create a password (mock).**
![48](screenshots/48-c-mock-password.png)

**49. Freighter: save the 12-word recovery phrase (mock).** Freighter then asks
the player to pick the words back in order.
![49](screenshots/49-c-mock-recovery-phrase.png)

**50. Freighter: add the "Local" network by hand (mock).** The template's
default network isn't one Freighter knows. The player types the RPC URL, Horizon
URL and passphrase `Standalone Network ; February 2017`, and allows HTTP. On
testnet this step would be a network switch instead.
![50](screenshots/50-c-mock-custom-network.png)

**51. Wallet picker with Freighter installed (real, via the stand-in).**
Freighter's Install button is gone.
![51](screenshots/51-c-picker-freighter-installed.png)

**52. Freighter: connection request (mock).** "http://localhost:5173 wants to
connect…" → Connect. ![52](screenshots/52-c-mock-connect.png)

**53. Connected (real).** The header shows `GBO4…EIJP`, "**- XLM**" and **Fund
Account**: a new G-address does not exist on chain until it is funded.
![53](screenshots/53-c-connected.png)

**54. Guess before funding: nothing happens, and the app says "Incorrect guess"
(real, upstream bug).** The player types 7 and clicks Submit. "Incorrect guess.
Try again!" appears in about 1 s, but **no transaction was built or signed**:
the stand-in logged no `SUBMIT_TRANSACTION`. The cause is in the template, not
the account: the `<input>` has `id="guess"` but no `name`, so
`formData.get("guess")` returns `null` and the handler goes straight to
"failure". This is the template exactly as `init` produced it; every guess
behaves this way until it's fixed.
![54](screenshots/54-c-guess-does-nothing.png)

**55. Fund Account (real).** The button disables while the local Friendbot funds
the account. ![55](screenshots/55-c-funding.png)

**56. Funded (real).** 10,000 XLM. ![56](screenshots/56-c-funded.png)

_From here on, the app used for the walkthrough carries a one-line local fix,
`name="guess"` on the input (the Nido template already has it), so the signing
flow could be shown. It was not applied to any repo._

**57. Guess 1 → Freighter sign popup (mock).** "Confirm transaction":
`guess(7, GBO4…)` on `CAQ2…PMCJ`, a 1 XLM transfer authorization and the fee.
The player clicks Confirm. **One popup per guess.**
![57](screenshots/57-c-mock-sign-guess1.png)

**58. Guess 1 result (real).** "Incorrect guess. Try again!"; **10,000 →
9,998.999 XLM** (1 XLM stake + 0.001 XLM fee, paid by the player). About 2.7 s
on local. ![58](screenshots/58-c-guess1-result.png)

**59. Guess 2 → sign popup again (mock).**
![59](screenshots/59-c-mock-sign-guess2.png)

**60. Guess 2 result (real).** 9,998.999 → 9,997.997 XLM. (A third guess also
went through while I set up the rejection test: 9,996.996 XLM.)
![60](screenshots/60-c-guess2-result.png)

**61. The player clicks Reject (mock).** ![61](screenshots/61-c-mock-reject.png)

**62. After the rejection (real).** The stand-in returned Freighter's rejection
(`apiError` code −4, "The user rejected this request."). No transaction was sent
and the balance stayed at 9,996.996 XLM, but the app still says **"Incorrect
guess. Try again!"**: its `catch` maps every error, rejections included, to the
same "failure" state as a wrong guess (`GuessTheNumber.tsx` in
`stellar-scaffold/ui`). ![62](screenshots/62-c-rejected-result.png)

There is no spending limit in the G-address flow. Freighter signs whatever the
player confirms, and the only protection is reading every popup.

---

## Comparison

|                                         | Default template (G-address, Freighter)                                                                                                      | Nido template before #9 (`5170276`, 3 XLM/day)                                                                                                                                                                                   | Nido template + session, 2 XLM/day ([PR #9](https://github.com/nidohq/scaffold-template/pull/9))                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Network in the dev loop                 | Local quickstart (Docker)                                                                                                                    | Testnet                                                                                                                                                                                                                          | Testnet                                                                                                                       |
| What the player installs                | A browser extension (Freighter, Hana, or xBull)                                                                                              | Nothing; a passkey on the device                                                                                                                                                                                                 | Nothing; a passkey on the device                                                                                              |
| Account setup                           | Install → password → 12-word phrase + confirm → add "Local" network by hand → connect → Fund Account                                         | test.nido.fyi in the popup: Get started → "Create with a passkey" (1 biometric) → continue; ~48 s; arrives with 5 XLM                                                                                                            | Same as before #9; 39 s from opening the app here                                                                             |
| Secrets the player keeps                | Recovery phrase and extension password                                                                                                       | None to write down (passkey; recovery optional)                                                                                                                                                                                  | Same                                                                                                                          |
| Connect                                 | Picker → Freighter → connection popup                                                                                                        | Picker → Nido → pick account (address only); first time it's a two-pass flow with an error toast (step 12)                                                                                                                       | Same                                                                                                                          |
| Before the first action                 | Nothing beyond funding                                                                                                                       | One Approve click → **2 Nido pages, 2 passkey confirmations** (game rule with "no cap" ticked, XLM rule with cap)                                                                                                                | Same, with a cap of 2                                                                                                         |
| Prompts per guess                       | **1 Freighter popup** every guess                                                                                                            | **0**                                                                                                                                                                                                                            | **0**                                                                                                                         |
| What the player sees per guess          | Popup → "Incorrect guess. Try again!" (no hash)                                                                                              | "Incorrect guess. Try again!" + tx hash; balance −1                                                                                                                                                                              | "Incorrect guess: that cost 1 XLM. Try again!" + tx hash; balance −1                                                          |
| Time per guess                          | ~1–3 s on local, plus the time to read and approve the popup                                                                                 | ~4–7 s on testnet                                                                                                                                                                                                                | ~6–7 s on testnet                                                                                                             |
| Who pays the fee per guess              | The player (≈0.001–0.002 XLM on local)                                                                                                       | The app's session key, on testnet (Friendbot-funded): ≈0.53 XLM for the first guess with a new session, ≈0.034 XLM for each later one; see [Where the fee goes](#where-the-fee-goes)                                             | Same as before #9                                                                                                             |
| Who pays account creation and approvals | Local Friendbot funds the player                                                                                                             | Nido's relayer (NIDO.md measured ≈1.4 XLM per account, ≈4.5 XLM first grant, ≈2.7 XLM capped grant)                                                                                                                              | Same                                                                                                                          |
| Spending protection                     | None beyond reading each popup                                                                                                               | The account enforces 3 XLM/day for this app's key, until the rules expire (24 h)                                                                                                                                                 | The account enforces **2 XLM/day**: two wrong guesses, then refusal                                                           |
| Over the limit                          | n/a                                                                                                                                          | Refused in simulation (~1.2 s), nothing sent: "Your account refused: this would go over the spending cap you gave this app."                                                                                                     | Refused the same way: "That's the 2 XLM a day you let this game spend… It cost nothing. Come back tomorrow for more guesses." |
| Player rejects / cancels                | Shown as "Incorrect guess. Try again!" (misleading)                                                                                          | Cancelling on Nido's grant page keeps the key; the gate asks again (e2e-tested)                                                                                                                                                  | Same                                                                                                                          |
| Other failure modes                     | **Guess never sent: missing `name` on the input (upstream bug)**; extension on the wrong network; unfunded account; lost phrase = lost funds | Relayer budget, busy or timeout on grants (the gate offers "Check again" / "Ask Nido again"); session expires after 24 h (Renew); key lives in this origin's `localStorage`, port included; revoking isn't available in Nido yet | Same as before #9                                                                                                             |
| Keys the app holds                      | None                                                                                                                                         | A session key per account and origin (can spend at most the cap until expiry)                                                                                                                                                    | Same                                                                                                                          |

### Where the fee goes

Read from each transaction's result meta (`getTransaction` on the testnet RPC).
Fees are in XLM; 1 XLM = 10,000,000 stroops.

| Transaction           | Guess              | `fee_charged` | Rent (`rent_fee_charged`) |
| --------------------- | ------------------ | ------------- | ------------------------- |
| A `0569b71c…322b2b`   | 1st of the session | 0.5325        | 0.5310                    |
| A `ee10cdb7…01811e`   | 2nd                | 0.0341        | 0.0325                    |
| A `abcddc2c…a109bd`   | 3rd                | 0.0341        | 0.0325                    |
| B `63257679…df6fe377` | 1st of the session | 0.5328        | 0.5313                    |
| B `8ee5f355…58476d7a` | 2nd                | 0.0341        | 0.0326                    |

- **The first guess pays rent.** The first call that uses a new session extends
  six persistent entries to about 30 days: on the player's smart account, two
  `ContextRuleData`, two `PolicyData` and one `SignerData`; on the
  spending-limit policy contract (`CAG3…`), the `AccountContext` spending
  tracker. That rent is about 0.531 XLM of the 0.5325.
- **Later guesses pay a little rent too**, about 0.0325 XLM, mostly because the
  spending tracker's persistent `spending_history` list grows by about 80 bytes
  per spend (172 → 252 → 332 bytes), and a bigger entry costs more to keep
  alive.
- **The game itself stores nothing per guess.** The only temporary entry a guess
  writes is the auth nonce.
- The rest of each fee (about 0.0016 XLM) is the non-refundable resource fee and
  the inclusion fee.

---

## Developer section: what changes for the template

The change is https://github.com/nidohq/scaffold-template/pull/9, one commit on
top of `5170276`, merged to `main` after this walkthrough. 9 files, +116/−28.

What a developer sees:

- `app/src/components/GuessTheNumber.tsx`:
  - The cap is one constant, `dailyCap = 2`, used in the grant
    `limit: { amount: String(dailyCap), period: "day" }`.
  - The gate text says what a guess costs and how many wrong guesses the cap
    allows.
  - A wrong guess says "that cost 1 XLM".
  - An over-cap refusal gets a game-specific message through `isOverCap(e)`.
- `app-lib/session.ts`: `isOverCap(error)` recognises the `#3221` refusal either
  raw or after `submitWithSession` has already turned it into a sentence (it
  throws `explainRefusal(...)` text, which no longer contains the code). The
  existing sentence moved into a constant.
- Tests:
  - A unit assertion for `isOverCap`.
  - The e2e mocks gain a `refuse` option that fails the **enforced** simulation,
    as the account does.
  - A new e2e test, "over the 2 XLM cap, the account refuses and the player is
    told why", which also checks that no popup opened.
  - The grant URL expectation changes from `limit: "3"` to `"2"`.
- Docs: the README front door, NIDO.md (quick start paragraph, `isOverCap` in
  the API list, the "capped payment" pattern with the period rationale),
  AGENTS.md (one line) and CHANGELOG (Unreleased). The CHANGELOG diff also
  reflows one existing paragraph, which `prettier --check` was already flagging
  on `main`; with it, `npm run format:check` passes for the whole tree.

Verification on the branch:

```
npm run test:unit          → Test Files 4 passed, Tests 34 passed
npm run lint               → clean
npm run prepare:prototype && npm run test:e2e → 12 passed (12.8s), incl. the new over-cap test
npm run build              → OK
npx prettier --check .     → All matched files use Prettier code style!
fresh app from the branch (git archive + init's post-steps): tools:scaffold, doctor ("Ready."), clients:testnet, build, test:unit → all rc=0
npm run new-app -- <dir>   → rc=0, sample has dailyCap = 2
live on testnet            → steps 30–44 above
```

`stellar scaffold init --template <local path>` itself cannot be tested before
the branch is published: stellar-scaffold 0.0.31 panics in degit-rs with
`Could not parse src: <local path>`. After merge,
`stellar scaffold init --template nidohq/scaffold-template my-app` picks the
change up with no other steps, because the template lives at the repo root.

Full diff as of the walkthrough (index lines removed):

````diff
diff --git a/AGENTS.md b/AGENTS.md
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -125,6 +125,7 @@ export const MyAction = () => {
 - `describe(error, contractErrors)`: #3221 over the cap, #3002/#3016 no rule or
   expired, #3014 an uncovered contract in the tree, Nido relayer codes, and your
   contract's `Error(Contract, #n)`.
+- `isOverCap(error)`: the #3221 refusal, for a message that names your cap.
 - `isSmartAccount(address)` tells a C-address from a G-address.

 ## Smart accounts (C-addresses): what works
diff --git a/CHANGELOG.md b/CHANGELOG.md
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -1,9 +1,23 @@
 # Changelog

+## Unreleased
+
+### Guess the Number shows the spending cap
+
+- The sample's XLM grant caps spending at 2 XLM a day (was 3), so two wrong
+  guesses go through without a prompt and the account refuses the third. The
+  cap's `day` matches the session's `24h`, so it is also the most one approval
+  can spend.
+- The gate and the result say what a guess costs, and a refused guess says which
+  cap stopped it and that it cost nothing, instead of the generic refusal.
+- `isOverCap(error)` in app-lib recognises the #3221 refusal, before or after
+  `describe` has explained it. The e2e mocks can refuse an enforced simulation
+  (`refuse`), and a test covers the over-cap guess.
+
 ## v2 (2026-10-22): after the hackathon simulation

-Each change names the action or finding it answers in the feedback report from
-a simulated six-team hackathon run, Oct 2026 (top-10 action numbers; finding IDs
+Each change names the action or finding it answers in the feedback report from a
+simulated six-team hackathon run, Oct 2026 (top-10 action numbers; finding IDs
 from §5.3).

 ### One human path (action 4: T-H3, T-H4, T-A5)
diff --git a/NIDO.md b/NIDO.md
--- a/NIDO.md
+++ b/NIDO.md
@@ -49,6 +49,11 @@ create one at https://test.nido.fyi: one passkey, and it arrives with 5 test
 XLM. Back in the app, approve the session (one passkey confirmation per grant),
 and each call after that goes through without a prompt.

+In the sample, each wrong guess sends 1 XLM to the game. The session you approve
+lets the game's key call `guess` and spend up to 2 XLM a day from your account,
+so two wrong guesses go through without a prompt and your account refuses the
+third before anything is sent. The app says so and the guess costs nothing.
+
 `new-app` gives the copy its own package name, page title, deployer identity
 (`<name>-deployer`) and dev-server port, so several apps on one machine don't
 collide. Pass `--name` when the folder name isn't the app name.
@@ -158,6 +163,9 @@ Everything here comes from `@stellar-scaffold/app-lib` (the template's
   expired; #3014 a contract in the call has no rule), Nido's relayer codes, and
   your contract's `Error(Contract, #n)` looked up in `contractErrors` (the
   generated client's `Errors`, or your own table).
+- `isOverCap(error)` is true when the account refused a call for going over a
+  grant's cap (#3221), so you can say what the cap was and when to come back.
+  The account checks during simulation, so nothing was sent or paid.
 - `isSmartAccount(address)` tells a Nido C-address from a classic G-address, for
   example to link `/contract/` rather than `/account/` on an explorer.

@@ -208,7 +216,9 @@ Some patterns that work:
 - **An action that moves no money** (claim, vote, check in): one grant on your
   contract, no cap. The `--blank` starter is this.
 - **A capped payment** (tip, buy): two grants, your contract plus the token with
-  a `limit`. Guess the Number is this.
+  a `limit`. Guess the Number is this: 1 XLM a wrong guess, capped at 2 XLM a
+  day. Its `period` matches the grant's 24-hour `duration`, so the cap is also
+  the most one approval can spend.
 - **Shared funds** (a group pot): your contract holds the money and pays out
   when enough members approve; each member uses their own Nido account.
 - **Limits for someone else** (an allowance): a cap limits a key, not the
diff --git a/README.md b/README.md
--- a/README.md
+++ b/README.md
@@ -20,7 +20,9 @@ npm run tools:scaffold && npm ci && npm run doctor
 npm run clients:testnet && npm run dev
 ```

-`npm run doctor` says what is missing and how to fix it.
+`npm run doctor` says what is missing and how to fix it. Open the app, connect
+with Nido and approve the sample once: Guess the Number then plays without
+prompts, at 1 XLM a wrong guess, until the 2 XLM a day you allowed runs out.

 - **Building an app?** Read [`NIDO.md`](NIDO.md): the quick start, your own
   contract in five steps, the call pattern, the rules a Nido account follows,
diff --git a/app-lib/session.test.ts b/app-lib/session.test.ts
--- a/app-lib/session.test.ts
+++ b/app-lib/session.test.ts
@@ -17,6 +17,7 @@ import {
 	describe as explain,
 	explainRefusal,
 	grantUrl,
+	isOverCap,
 	loadSession,
 	parseRules,
 	requestSession,
@@ -537,6 +538,11 @@ describe("describing errors", () => {
 	it("maps account refusals, relayer codes and the app's own errors", () => {
 		const errors = { 4: { message: "Already claimed" }, 5: "Sold out" }
 		expect(explain(new Error("Error(Contract, #3221)"))).toMatch(/cap/)
+		// Still recognisable after submitWithSession has explained it
+		expect(isOverCap(new Error(explainRefusal("Error(Contract, #3221)")))).toBe(
+			true,
+		)
+		expect(isOverCap("Error(Contract, #3002)")).toBe(false)
 		expect(explain("relay: FEE_LIMIT_EXCEEDED")).toMatch(/budget/)
 		expect(explain("POOL_CAPACITY")).toMatch(/busy/)
 		expect(explain("HostError: Error(Contract, #4)", errors)).toBe(
diff --git a/app-lib/session.ts b/app-lib/session.ts
--- a/app-lib/session.ts
+++ b/app-lib/session.ts
@@ -660,9 +660,19 @@ const RELAYER: Record<string, string> = {
 		"Nido's relayer is busy, so nothing was sent. Try again in a minute.",
 }

+const OVER_CAP =
+	"Your account refused: this would go over the spending cap you gave this app."
+
+/** Whether the account refused a call because it would go over a grant's
+ * spending cap (#3221). The account checks before anything is sent, so the
+ * refused call cost nothing. */
+export function isOverCap(error: unknown): boolean {
+	const message = error instanceof Error ? error.message : String(error)
+	return message.includes("#3221") || message.includes(OVER_CAP)
+}
+
 function accountRefusal(message: string): string | undefined {
-	if (message.includes("#3221"))
-		return "Your account refused: this would go over the spending cap you gave this app."
+	if (message.includes("#3221")) return OVER_CAP
 	if (message.includes("#3002") || message.includes("#3016"))
 		return "Your account refused: no approved rule covers this call for this app (it may have expired)."
 	if (message.includes("#3014"))
diff --git a/app/src/components/GuessTheNumber.tsx b/app/src/components/GuessTheNumber.tsx
--- a/app/src/components/GuessTheNumber.tsx
+++ b/app/src/components/GuessTheNumber.tsx
@@ -1,5 +1,6 @@
 import {
 	describe,
+	isOverCap,
 	submitCall,
 	xlmTokenId,
 	type Grant,
@@ -10,7 +11,11 @@ import { useWallet } from "../hooks/useWallet"
 import { SessionGate } from "./SessionGate"

 // A wrong guess calls `guess` and moves 1 XLM from the guesser, so a Nido
-// account approves one rule for each contract the call touches.
+// account approves one rule for each contract the call touches. The XLM rule
+// caps spending at 2 XLM a day: two wrong guesses go through without a prompt
+// and the account refuses the third. The cap's day matches the session's 24
+// hours, so it is also the most one approval can ever spend.
+const dailyCap = 2
 const grants: Grant[] = [
 	{
 		target: guessTheNumber.options.contractId,
@@ -22,7 +27,7 @@ const grants: Grant[] = [
 		target: xlmTokenId,
 		functions: ["transfer"],
 		duration: "24h",
-		limit: { amount: "3", period: "day" },
+		limit: { amount: String(dailyCap), period: "day" },
 		label: "guess-xlm",
 	},
 ]
@@ -61,7 +66,11 @@ export const GuessTheNumber = () => {
 			}
 		} catch (e) {
 			console.error(e)
-			setError(describe(e))
+			setError(
+				isOverCap(e)
+					? `That's the ${dailyCap} XLM a day you let this game spend, so your account stopped this guess before anything was sent. It cost nothing. Come back tomorrow for more guesses.`
+					: describe(e),
+			)
 			setResult("failure")
 		}
 	}
@@ -78,10 +87,12 @@ export const GuessTheNumber = () => {
 				grants={grants}
 				explain={
 					<p>
-						Nido accounts approve this game once: its key may call{" "}
-						<code>guess</code> and move up to 3 XLM a day from your account, for
-						24 hours. Nido asks you to accept the first rule without a cap; it
-						allows only <code>guess</code>, and the second rule caps the XLM.
+						Each wrong guess costs 1 XLM. Approve this game once and it can
+						guess for you for 24 hours without asking again, spending at most{" "}
+						{dailyCap} XLM a day from your account: {dailyCap} wrong guesses,
+						then your account says no. Nido asks you to confirm two rules: the
+						first allows only <code>guess</code>, without a cap; the second caps
+						the XLM.
 					</p>
 				}
 			>
@@ -116,7 +127,7 @@ export const GuessTheNumber = () => {
 					) : !address ? (
 						<p>Connect to your wallet in order to guess.</p>
 					) : (
-						<p>Incorrect guess. Try again!</p>
+						<p>Incorrect guess: that cost 1 XLM. Try again!</p>
 					)}
 				</div>
 			)}
diff --git a/e2e/tests/guess.spec.ts b/e2e/tests/guess.spec.ts
--- a/e2e/tests/guess.spec.ts
+++ b/e2e/tests/guess.spec.ts
@@ -104,7 +104,7 @@ test("a Nido account approves a session once, then guesses without a popup", asy
 		target: sac,
 		signer,
 		functions: "transfer",
-		limit: "3",
+		limit: "2",
 		limit_period: "day",
 	})

@@ -138,6 +138,31 @@ test("a Nido account approves a session once, then guesses without a popup", asy
 	})
 })

+test("over the 2 XLM cap, the account refuses and the player is told why", async ({
+	page,
+	context,
+}) => {
+	let overCap = false
+	await mockServices(context, {
+		auth: guessAuth,
+		refuse: () => (overCap ? "HostError: Error(Contract, #3221)" : undefined),
+	})
+	await connect(page)
+	await page.getByRole("button", { name: approve }).click()
+	await expect(page.getByText("This app holds a session key")).toBeVisible()
+	await guess(page)
+
+	overCap = true
+	let popups = 0
+	page.on("popup", () => popups++)
+	await page.getByPlaceholder("Guess a number from 1 to 10!").fill("3")
+	await page.getByRole("button", { name: "Submit", exact: true }).click()
+	await expect(page.getByRole("alert")).toContainText(
+		"the 2 XLM a day you let this game spend",
+	)
+	expect(popups).toBe(0)
+})
+
 test("a cancelled grant keeps the app's key for the next try", async ({
 	page,
 	context,
diff --git a/e2e/tests/mocks.ts b/e2e/tests/mocks.ts
--- a/e2e/tests/mocks.ts
+++ b/e2e/tests/mocks.ts
@@ -64,7 +64,9 @@ export const approveAll: GrantAnswer = () => ({
 /**
  * Mock the testnet RPC, Friendbot and Nido's pages for `context`. `auth`
  * gives the auth entries a simulated call asks the account for (by function
- * name and contract), and `grantAnswer` plays the owner on Nido's grant page.
+ * name and contract), `grantAnswer` plays the owner on Nido's grant page, and
+ * `refuse` plays the account: an error it returns fails the enforced
+ * simulation of a session call (e.g. `Error(Contract, #3221)` over a cap).
  */
 export async function mockServices(
 	context: BrowserContext,
@@ -72,10 +74,12 @@ export async function mockServices(
 		signResult = `?nido_submitted=${hash}&kind=tx`,
 		grantAnswer = approveAll,
 		auth = () => [],
+		refuse = () => undefined,
 	}: {
 		signResult?: string
 		grantAnswer?: GrantAnswer
 		auth?: (method: string, target: string) => xdr.SorobanAuthorizationEntry[]
+		refuse?: () => string | undefined
 	} = {},
 ) {
 	const calls: string[] = []
@@ -105,24 +109,29 @@ export async function mockServices(
 				const call = op.func.invokeContract()
 				const method = call.functionName().toString()
 				const target = Address.fromScAddress(call.contractAddress()).toString()
+				const enforced =
+					(body.params as { authMode?: string }).authMode === "enforce"
+				const refusal = enforced ? refuse() : undefined
 				const retval =
 					method === "balance"
 						? nativeToScVal(125000000n, { type: "i128" })
 						: method === "installed_rules"
 							? installedRules(landed)
 							: nativeToScVal(false)
-				response = {
-					latestLedger: 100,
-					minResourceFee: "100",
-					transactionData: data,
-					events: [],
-					results: [
-						{
-							auth: auth(method, target).map((a) => a.toXDR("base64")),
-							xdr: retval.toXDR("base64"),
-						},
-					],
-				}
+				response = refusal
+					? { latestLedger: 100, error: refusal }
+					: {
+							latestLedger: 100,
+							minResourceFee: "100",
+							transactionData: data,
+							events: [],
+							results: [
+								{
+									auth: auth(method, target).map((a) => a.toXDR("base64")),
+									xdr: retval.toXDR("base64"),
+								},
+							],
+						}
 			} else if (body.method === "getTransaction") {
 				response = {
 					status: "SUCCESS",
````

---

## Timings

| Moment                                          | Part A (3 XLM, before #9)                                                        | Part B (2 XLM, PR #9)                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| Init + quick start commands                     | 53 s init + 49 s (`tools:scaffold` 1, `ci` 14, `doctor` 1, `clients:testnet` 33) | 47 s (install 9 + `clients:testnet` 38) |
| Open app → Nido account with 5 XLM              | 87 s (including the "create one first" detour)                                   | 39 s                                    |
| Approve click → session ready (2 confirmations) | 81 s (with screenshot pauses; grant pages and relayer applies dominate)          | 47 s                                    |
| Wrong guess with the session key                | 4–7 s, no prompt                                                                 | 6.0 s, 7.4 s, no prompt                 |
| Over-cap refusal                                | ~1.2 s, no fee                                                                   | ~1.2 s, no fee                          |

These are automated timings with instant virtual passkeys. A person adds a
biometric prompt per confirmation (three in total: account plus two grants) and
reading time on Nido's grant pages.

## Friction hit, and recommendations

Template:

1. **Part B shipped as https://github.com/nidohq/scaffold-template/pull/9**
   (merged). It is small and tested, and it makes the cap visible to players.
2. **The first Nido connect for a new player is a two-pass flow that ends in a
   red error toast** (steps 03–13). "Create one first" navigates the connect
   popup away; closing it makes Stellar Wallets Kit report "Wallet connection
   was cancelled or failed.", and the player has to Connect again. Ask Nido's
   connect page to create the account and return the address in place; meanwhile
   the app could soften that toast for Nido.
3. **`npm run test-browser` timed out on this machine** with Playwright's
   chromium-1223 (Chrome for Testing 148 never wrote `DevToolsActivePort`;
   `--version` worked, and chromium-1228 and 1234 started fine). It is probably
   local to this machine, but the script could print "set CHROME_PATH" on that
   timeout (`scripts/test-browser.mjs`, `debuggingPort()`), and it leaves the
   hung Chrome running after it exits.
4. **`stellar scaffold init` doesn't do what `new-app` does.** The app keeps
   package name `@stellar-scaffold/ui`, title "Scaffold Stellar Starter App" and
   `PORT=5173`, so two apps made with init share an origin and therefore Nido
   session storage. Init's closing hint also says `npm start` rather than the
   README's quick start. The doctor's port check helps; a one-line note in
   NIDO.md would help more.
5. **Init also built and deployed the Nido template's contracts to a running
   local quickstart** and wrote `guess-a-*` aliases into the global
   `~/.config/stellar`, while the template keeps everything else in
   `.stellar-config/`. This is harmless, but a surprise when Docker is running.
6. **The player never sees the number they guessed**: the form clears on submit
   (both templates). It is small, but "Incorrect guess: 7" would read better.
7. **The first guess with a new session costs the session key about 0.53 XLM**,
   large next to a 1 XLM stake; later guesses cost about 0.034 XLM. On testnet
   Friendbot pays, but a mainnet app would fund the key itself. Almost all of
   the first fee is rent: the first use of the session extends six persistent
   entries to about 30 days, and every spend grows the spending tracker's
   history by about 80 bytes (see [Where the fee goes](#where-the-fee-goes)).
   Worth looking at both before anyone builds a micro-payment app on this
   pattern.

Nido (outside this repo):

8. **One approval, one confirmation.** Nido's `delegate-doc` page takes one
   `target`, so a game plus its token costs two pages and two passkey prompts. A
   multi-grant request would make "approve this game once" literally one prompt.
9. **"Let this key spend without any cap" on a rule that can only call `guess`**
   reads as if the game could spend anything. The wording could say the rule
   moves no money by itself and point at the capped rule.

Upstream default template (`stellar-scaffold/ui`):

10. **Every guess is silently dropped**: the `<input>` at
    `templates/react/src/components/GuessTheNumber.tsx:50-57` has no
    `name="guess"` (still on main; last touched in f0f0aecc, "upgrade
    Stellar-Wallets-Kit to v2 (#241)"). Also, the `catch` and the `isErr` branch
    don't tell a rejected signature or contract error from a wrong guess. Worth
    an upstream issue or PR.

## Evidence

- Accounts: Part A `CCEZ6BX6PWOP6HQURE4A7TT77UY6M25J4IV22YRKBYYUCXIZO2NDE4WA`
  (session key `GDAHATE2Z2FQFXX7ZWQOPIJ3CSMBPAEPRTI677NOONYRDREFLFAMU75V`); Part
  B `CCH2FDKHAMKNT33JCF6NOOUDKZNFIKVOM2P5PMDI7D456LLI6VZSO732` (session key
  `GCX467LSL2S2PHJM2CXPOLKKFICPJHY6PQGDCQFSONYZNKKA6UMEWKZ4`); Part C local
  `GBO4H3WFMTNWZU5SJJSXXOW2ML26TEIQOY66MF2SYANVWAI4JY4YEIJP`. All throwaway.
- Testnet transactions (stellar.expert/explorer/testnet/tx/…): A
  `0569b71cc3b9251ad3034fb6d5b497a8f4cb39b03fc1f8430e70a8d6aa322b2b`,
  `ee10cdb78317a04531e349b5dd34fa1b24e4d86f671e9be32eb820b1a301811e`,
  `abcddc2c908e9ab670621498040323b7268b55134b6b6e85cd46a2c3c6a109bd`; B
  `63257679b9fafcb1273b3b3cc7f53aff12d904f5229e7ab40ce1275bdf6fe377`,
  `8ee5f35578a508efea4eaba85a5582b4692088ffb641fa8d28278f6d58476d7a`. The first
  is the first guess of each session; fee breakdown in
  [Where the fee goes](#where-the-fee-goes).
- Game contract (shared sample deployment pinned in `scaffold.yml`):
  `CBY4S4Z2TI5HXUKSHFV35PKHSIN4YIXU7MYS44UKY23ONSV7QUECYGUW`. XLM SAC:
  `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`.
- Nido's one-target grant request: nidohq/nido
  `packages/frontend/src/lib/policy/docRequest.ts`, which parses a single
  `target` (lines 65–78).
- Screenshots: 62 PNGs in `screenshots/` (6.5 MB), `NN-part-step.png`; mocks are
  named `*-c-mock-*`.

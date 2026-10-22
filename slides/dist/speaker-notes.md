# Stellar smart accounts: speaker notes

16 slides, 15:00, then 15 appendix slides for questions. Generated from `.build/content.mjs` by `.build/notes.mjs`; edit the content, not this file. The same notes as data: [`slides.json`](slides.json).

| # | Slide | Time |
| --- | --- | --- |
| 1 | Stellar smart accounts | 0:00–0:35 |
| 2 | Rules, not just a key | 0:35–1:15 |
| 3 | The G-address | 1:15–2:00 |
| 4 | The C-address | 2:00–2:50 |
| 5 | What rules buy you | 2:50–3:45 |
| 6 | Honest trade-offs | 3:45–5:00 |
| 7 | Perch: a rule you can read | 5:00–6:05 |
| 8 | Nido | 6:05–6:50 |
| 9 | Finding: the popup and your contract | 6:50–7:50 |
| 10 | An agent builds Kudos Jar | 7:50–8:40 |
| 11 | Approve the rule | 8:40–9:25 |
| 12 | Tap until the cap | 9:25–10:20 |
| 13 | When the wallet says unknown | 10:20–11:35 |
| 14 | Patterns that worked | 11:35–13:00 |
| 15 | Build your own | 13:00–14:20 |
| 16 | Your first smart account app | 14:20–15:00 |
| 17 | Appendix | appendix |
| 18 | What rules buy you (2/2) | appendix |
| 19 | One document, one hash | appendix |
| 20 | From document to enforcement | appendix |
| 21 | Verifiers | appendix |
| 22 | Constructorless publishing | appendix |
| 23 | Accounts and factories | appendix |
| 24 | What a dApp can ask Nido for | appendix |
| 25 | Walkthrough: a passkey account | appendix |
| 26 | Walkthrough: connect and ask once | appendix |
| 27 | Walkthrough: the policy afterwards | appendix |
| 28 | Walkthrough: the call site | appendix |
| 29 | What the agent tripped on | appendix |
| 30 | Upstream findings | appendix |
| 31 | Run Kudos Jar yourself | appendix |

### 1. Stellar smart accounts

**Time:** 0:00–0:35 (35 seconds)

**On the slide:** BUILDING AT HACK MERIDIAN · STELLAR SMART ACCOUNTS

- Why a C-address, and how to build an app on one

**Script**

Imagine someone trying your hackathon app for the first time. They get the idea right away, and then you ask them to learn a wallet: a seed phrase, a browser extension, a signature for every click.

In the next fifteen minutes: why an account with rules is a better start, how Perch and Nido give you one, an app a coding agent built on testnet, and what six teams ran into when they built their own in two hours.

**Links** (not spoken)

- <https://developers.stellar.org/docs/build/guides/contract-accounts>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/README.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/README.md>

### 2. Rules, not just a key

**Time:** 0:35–1:15 (40 seconds)

**On the slide:** THE BIG IDEA · YOUR ACCOUNT SHOULD HAVE RULES, NOT JUST A KEY

- G-addresses hold keys. C-addresses run code.

**Script**

Here is the idea in one line. Today, most Stellar users have an account that is a key. Whoever holds the key, or enough of the keys, can do anything the account can do.

A smart account is an account with rules. It is a contract, so its address starts with C, and the network asks that contract whether each request is allowed. The rules can say who may sign, for which contract, for which function, for how long, and for how much.

**Links** (not spoken)

- <https://developers.stellar.org/docs/build/guides/contract-accounts>
- <https://developers.stellar.org/docs/build/guides/auth/contract-authorization>

### 3. The G-address

**Time:** 1:15–2:00 (45 seconds)

**On the slide:** CLASSIC ACCOUNTS · G-ADDRESS: A KEY

- Ed25519 signers, weights, thresholds:
- fixed rules the protocol defines.
- An app asks every time, or holds your key.
- Multisig exists. Scoped permission does not.

**Script**

Let's be fair to the classic account first. A G-address is an ed25519 key, and it can have several signers with weights and thresholds. That's real multisig, and every wallet and exchange supports it.

What it can't do is scope. There's no way to say "this key may only call this one contract", "only until Friday", or "no more than two XLM a day".

So an app that wants to act for you has two choices: ask you to sign every single action, or hold a key that can do everything.

**Links** (not spoken)

- <https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig>

### 4. The C-address

**Time:** 2:00–2:50 (50 seconds)

**On the slide:** CONTRACT ACCOUNTS · C-ADDRESS: AN ACCOUNT THAT RUNS CODE

- from.require_auth()
- → the account’s __check_auth
- → its rules decide
- Same Address type for your contract

**Script**

A contract account turns that around. When your contract calls require_auth on an address, Soroban checks a classic account's signatures the classic way. If the address is a contract, the host calls that contract's check-auth function and passes it everything: the signature, and the exact calls being authorized.

The account then evaluates its own rules. The important part for you as an app developer: your contract doesn't change. It asks an Address to authorize, the same as always. The difference lives in the account.

One caution. If your contract trusts an address it never calls require_auth on, a smart wallet won't save it.

**Links** (not spoken)

- <https://developers.stellar.org/docs/build/guides/auth/contract-authorization>
- <https://developers.stellar.org/docs/build/guides/contract-accounts>

### 5. What rules buy you

**Time:** 2:50–3:45 (55 seconds)

**On the slide:** WHAT RULES BUY YOU · WHAT RULES BUY YOU

- PASSKEYS: Face ID instead of a seed phrase
- SCOPED KEYS: One contract, listed functions, an expiry
- SPENDING CAPS: A rolling limit the account enforces

**Script**

Three things you can build with rules.

Passkeys. A passkey signs with P-256, which a classic account can't verify. A contract account can, through a WebAuthn verifier contract. The biometric check happens on the device; the chain only sees a signature.

Scoped keys. You can give a key permission for one contract, a list of functions, and an expiry. That's how an app acts for you without holding your account.

Spending caps. A rule can carry a limit, say two XLM per day, and the account enforces it on every transfer. You'll see one refuse a payment.

The same rules also cover recovery, sponsored onboarding, and adding or removing devices; that's in the appendix.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-webauthn-verifier/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-ir/src/doc.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-spending-limit/src/lib.rs>

### 6. Honest trade-offs

**Time:** 3:45–5:00 (75 seconds)

**On the slide:** WHAT IT COSTS · THE HONEST TRADE-OFFS

- WHAT NIDO’S RELAYER PAYS
- Account: about 1.4 XLM
- First grant: about 4.5 XLM
- Capped grant: about 2.7 XLM
- From one 100 XLM/day pot, on 22 Oct 2026
- COMPATIBILITY: No classic operations; Horizon shows no account
- COST: Sponsored, up to a shared daily budget
- MATURITY: Testnet, pre-audit, forked dependencies

**Script**

Now the costs, because you should know them before you choose.

Compatibility. A C-address can't be the source of a classic operation, and Horizon has no account record for it, so your app reads balances from the token contract over RPC. Many tools, exchanges included, still assume a G-address.

Cost. A contract account is storage, so it pays rent, and so does every rule. On testnet, Nido's relayer pays for you, but from one shared budget: a hundred XLM a day for all of testnet. On the twenty-second it counted about 1.4 XLM to create an account, 4.5 for an app's first grant, and 2.7 for a capped one. That's around twenty grants a day for everyone, so a busy room can run it dry. I'll show you what that looks like.

Maturity. Perch and Nido are testnet-only and not yet audited, and Nido's revoke button doesn't work yet. Build on it tonight; don't put real money behind it.

**Links** (not spoken)

- Feedback report from a six-team simulated hackathon run, Oct 2026 §3
- Team hk-ai-claude feedback, simulated hackathon run, Oct 2026
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/docs/ADD-NIDO-TO-DAPP.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/docs/audit-scope.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/docs/MAINNET_READINESS.md>

### 7. Perch: a rule you can read

**Time:** 5:00–6:05 (65 seconds)

**On the slide:** PERCH · THE POLICY LAYER · PERCH: A RULE YOU CAN READ

- One document per account, hashed and compiled on chain, enforced in __check_auth.

```
{ "name": "kudos-xlm",
  "scope": { "type": "contract", "address": "CDLZ…CYSC" },
  "principals": { "type": "all", "signers": ["session"] },
  "functions": ["transfer"],
  "cap": { "limit": "20000000", "period-ledgers": 17280 },
  "not-after-ledger": 5342393 }
```

**Script**

The rules live in Perch, a policy layer for Soroban smart accounts built on OpenZeppelin's account framework. An account's whole authorization is one JSON document: signers, rules, and optional recovery. It's canonical, so the account stores its hash and anyone can check it.

This is a real rule from the demo you'll see. Scope: one contract, the XLM token. Principal: the app's session key. One function, transfer. A cap of two XLM per seventeen thousand two hundred and eighty ledgers, about a day. And an expiry ledger.

Perch compiles the document on chain, and the account enforces it in check-auth on every call, denying by default. Verifiers, the registry and factories are in the appendix if you want the deep dive.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/README.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/CANONICAL.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/docs/schema.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-doc-compiler/src/lib.rs>
- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026

### 8. Nido

**Time:** 6:05–6:50 (45 seconds)

**On the slide:** THE WALLET · NIDO

- Passkey-native Perch accounts.
- Connect, sign, or grant a session.
- Creation and fees sponsored.
- nido.fyi · TESTNET

**Script**

Nido is the wallet people see, and every Nido account is a Perch account. You open nido.fyi, approve with your face or fingerprint, and you have a C-address on its own subdomain, created and funded with five test XLM by Nido's relayer.

From your app, Nido sits in Stellar Wallets Kit next to the usual wallets. You can ask it for three things: connect, which gives you the address; sign one transaction in a popup; or grant your app a scoped session. The third one turns out to matter most.

**Links** (not spoken)

- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/README.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/docs/ADD-NIDO-TO-DAPP.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/infra/relayer/README.md>

### 9. Finding: the popup and your contract

**Time:** 6:50–7:50 (60 seconds)

**Stage cue:** Slow down on the first sentence; this is the turning point of the talk.

**On the slide:** VERIFIED ON TESTNET · THE POPUP CAN’T SIGN FOR YOUR CONTRACT

- One contract: #3002. Several: #3014. Fix: ask once for a session.

```
guess(3, CAXS…) → __check_auth
  context_rule_ids: [0]  // "admin", scoped to the account
  contexts: guess, transfer  // two calls, one rule
→ Error(Contract, #3014) ContextRuleIdsLengthMismatch
```

**Script**

Here's the most important sentence in this talk: today, your app can't ask the passkey to sign a call to your own contract.

Nido's popup signs under the admin rule, and admin covers only the account itself. When our sample game asked the account to authorize a guess, which also moves one XLM, the account got two calls and one rule that covers neither, and refused. A call into a single contract fails the same way, with 3002.

So you ask once for a session. Your app holds its own key, and the owner approves one Perch rule for each contract the call touches. After that, your app's key signs, and the account checks every call.

**Links** (not spoken)

- [template/NIDO.md](../../template/NIDO.md)
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/frontend/src/lib/walletSign.ts>
- <https://github.com/theahaco/stellar-contracts-OZ/tree/33726766a1fd5e7e3d2977d79f64ee29e1ea3ca9/packages/accounts>
- Team hk-hu-noscaffold feedback, simulated hackathon run, Oct 2026

### 10. An agent builds Kudos Jar

**Time:** 7:50–8:40 (50 seconds)

**On the slide:** AN AGENT BUILDS AN APP · ONE PROMPT: KUDOS JAR

- 1. Copy the template with new-app
- 2. Write and test the contract
- 3. Deploy it to testnet
- 4. Run it with a real Nido account

**Script**

To prove it end to end, we gave a coding agent the template and one prompt: build a small app that shows off a smart account, with passkey sign-in and a policy-limited action, live on testnet.

It built Kudos Jar: tip a hackathon team in XLM, with a public tally. It copied the template with new-app, wrote and unit-tested a Soroban contract, deployed it with one Scaffold command, and built a React board on the generated client. Then it ran the real flow with a Nido account on testnet, created with a throwaway virtual passkey, because an agent has no fingerprint.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- Log of the agent-built Kudos Jar run, Oct 2026

### 11. Approve the rule

**Time:** 8:40–9:25 (45 seconds)

**On the slide:** APPROVE ONCE · APPROVE THE RULE IN NIDO

- SCOPE: Only transfer, only on XLM
- CAP: Up to 2 XLM per day
- EXPIRY: About 24 hours, then gone
- [Screenshot: Nido grant page: only transfer on the XLM contract, up to 2 XLM per day, expires in 24 hours]
- Nido’s grant page, before the passkey

**Script**

After connecting, the app asks once, in plain words: may it call tip on the jar and move up to two XLM a day, for twenty-four hours? A tip touches two contracts, the jar and the XLM token, so that's two rules and two passkey confirmations.

Each one happens on Nido's page, not the app's. Nido shows the contract, the functions, the cap and the expiry. The owner confirms with the passkey, Nido applies the new policy document, and the browser comes back to the app. The app never touches the passkey.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/frontend/src/pages/security/delegate-doc/index.astro>

### 12. Tap until the cap

**Time:** 9:25–10:20 (55 seconds)

**Stage cue:** Pause on the red line before reading it.

**On the slide:** TIP UNTIL THE CAP · TAP, TAP, TAP… REFUSED

- NO PROMPTS: Four tips, each confirmed
- THE CAP: The fifth would pass 2 XLM
- ON CHAIN: The account said no: #3221
- [Screenshot: Four confirmed tips and a fifth refused by the spending cap]
- Live testnet, 22 Oct 2026

**Script**

And now the fun part. Tap a team, and the tip goes through: no popup, no prompt. The app's key signs inside the account's own authorization entry, the account checks its rules, and the transaction confirms. Four taps, two XLM, four transaction hashes you can look up.

The fifth tap would take the day's total past two XLM. The app didn't stop it. The account did: its spending-limit policy refused, with error 3221, and the app shows that as a plain sentence.

That's the whole point of a C-address. The limit isn't a promise the app makes. It's a rule the account enforces.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- <https://stellar.expert/explorer/testnet/tx/cd9dfaefb145bd56d6239b1bd3ce8fa12eb5ca10bdee317d6b53e0012e043c1f>
- <https://stellar.expert/explorer/testnet/tx/567a9a60e2e8d91c33e8dd3cac0f4349ce173b5c8c7a2dd401628b0ad94790ec>

### 13. When the wallet says unknown

**Time:** 10:20–11:35 (75 seconds)

**On the slide:** WHEN IT GOES WRONG · WHEN THE WALLET SAYS “UNKNOWN”

- CHECK THE CHAIN BEFORE YOU RETRY
- Go back to the app, press Check again:
- it reads the account’s rules on chain.
- Nothing there? Ask Nido again.
- A failed response can follow a success
- 429 · BUDGET USED UP: Nothing was sent. Wait, or pay your own fee
- 503 · RELAYER BUSY: Nothing was sent. Retry in a moment
- 504 · TIMED OUT: It may have landed. Check, then retry

**Script**

Now the part most talks skip. In our dry run, Nido's relayer ran out of budget partway through, and every team hit it. Nido's page showed one message for three different failures: "we couldn't confirm what happened; retrying could pay twice."

A 429, FEE_LIMIT_EXCEEDED: the shared budget is used up, and nothing was sent. A 503, POOL_CAPACITY: the relayer is busy, nothing was sent, retry in a moment. A 504 is the tricky one: one team's grant timed out and had landed anyway.

So check the chain before you retry. Go back to the app and press Check again: the template reads the account's rules on chain. If nothing landed, Ask Nido again; that can't pay twice.

And when the budget is gone, the passkey's signature doesn't care who pays the fee. The template can already submit the signed grant with its own key, for about a quarter of an XLM; Nido's page doesn't offer that yet.

**Links** (not spoken)

- Feedback report from a six-team simulated hackathon run, Oct 2026 §3, §5.2 N-A2, N-H1
- [template/NIDO.md](../../template/NIDO.md) (When Nido’s relayer says no)
- [template/CHANGELOG.md](../../template/CHANGELOG.md)
- Team hk-hu-codex feedback, simulated hackathon run, Oct 2026
- Team hk-hu-template’s self-relay script, simulated hackathon run, Oct 2026
- [template/app-lib/session.ts](../../template/app-lib/session.ts)

### 14. Patterns that worked

**Time:** 11:35–13:00 (85 seconds)

**On the slide:** WHAT SIX TEAMS BUILT · PATTERNS THAT WORKED

- 1. Per-user cap: a rule on the token
- 2. Shared pot: a contract, 2 of 3 approve
- 3. No money moves: one grant, no cap
- 4. Allowance or time lock: a vault holds it

**Script**

We ran a dry run of this kit: six teams, all driven by AI, three as coding agents and three simulating a person working from these slides, each with two hours on testnet. All six prototypes work, and four patterns came out of them.

One: a per-user cap, like Kudos Jar. Put the cap on the token rule, and the account enforces it.

Two: a shared pot. Group Pot's contract holds the money and pays an expense when two of three members approve. Each member signs in with their own Nido account and approves their own session.

Three: nothing moves. Event tickets, a one-question poll, a guestbook: one grant on your contract, with no cap. Nido asks the owner to accept "no cap" explicitly, and the app's key pays the fees. The template's blank starter is exactly this.

Four: limits the user mustn't undo. A cap limits a key, not the account's admin, so Pocket Money keeps a teen's allowance in a parent-owned vault. And expiry stops a key; it doesn't delay a withdrawal, so Goalpost puts its unlock date in the vault contract.

**Links** (not spoken)

- Feedback report from a six-team simulated hackathon run, Oct 2026 §2, §5.1 D-H2
- [template/NIDO.md](../../template/NIDO.md) (patterns that work)
- Team hk-ai-claude feedback, simulated hackathon run, Oct 2026
- Team hk-ai-sonnet feedback, simulated hackathon run, Oct 2026
- Team hk-ai-codex feedback, simulated hackathon run, Oct 2026
- Team hk-hu-codex feedback, simulated hackathon run, Oct 2026
- Team hk-hu-template feedback, simulated hackathon run, Oct 2026
- Team hk-hu-noscaffold feedback, simulated hackathon run, Oct 2026

### 15. Build your own

**Time:** 13:00–14:20 (80 seconds)

**On the slide:** BUILD YOUR OWN · YOUR OWN APP, START TO FINISH

- Helpers from the template’s app-lib. NIDO.md has the whole path; AGENTS.md is for your agent.

```
npm run new-app -- ../my-app --blank && cd ../my-app
npm run tools:scaffold && npm ci && npm run doctor
# grow contracts/check-in, or add a crate and list it in scaffold.yml
npm run deploy:testnet  # deploys, pins its testnet ID, writes the client
<SessionGate grants={grants}>  // one Grant per contract in env.auths()
const { result, hash } = await submitCall(address, (publicKey) =>
  myContract.my_fn({ user: address }, { publicKey }))
```

**Script**

Here's your own app, start to finish. new-app with blank copies the template with a one-function starter, and gives it its own name, port and deployer key. tools-colon-scaffold installs the right Scaffold into the project in seconds, and doctor checks your tools, keys and testnet, with a fix for each problem.

Grow the starter contract, or add your own crate to scaffold.yml. deploy-colon-testnet deploys it, pins its ID, and writes its client.

To find your grants, assert env.auths in a unit test: one Grant per contract in that list, usually your contract, plus the token if it moves the user's money. Keep require_auth at the top of your function. Then submitCall is the whole call site: it builds the call, signs with whatever the user connected, and returns the result and the hash.

You're done when you have a passkey account, a confirmed transaction hash, and one refusal from the account itself. The template's NIDO.md has the details for you, and AGENTS.md for your coding agent.

**Links** (not spoken)

- [template/NIDO.md](../../template/NIDO.md) (Quick start; Your own contract in five steps; Calling a contract from React)
- [template/AGENTS.md](../../template/AGENTS.md)
- [template/CHANGELOG.md](../../template/CHANGELOG.md)
- [template/app-lib/wallet.ts](../../template/app-lib/wallet.ts)
- [template/app/src/components/SessionGate.tsx](../../template/app/src/components/SessionGate.tsx)
- Feedback report from a six-team simulated hackathon run, Oct 2026 §5.1 D-H1, D-A2, D-A4

### 16. Your first smart account app

**Time:** 14:20–15:00 (40 seconds)

**Stage cue:** Leave this slide up for questions; the appendix follows.

**On the slide:** KEEP BUILDING · YOUR FIRST SMART ACCOUNT APP

- Give the app a rule, not your key.
- Let the account say no.
- nido.fyi  ·  testnet
- github.com/nidohq/nido
- github.com/stellar-registry/perch

**Script**

For your hackathon project: pick the one action your app takes for a user, write down the rule that should bound it, and let the account enforce it. Ask for that rule once, in plain words, and then get out of the user's way.

Nido gives you the passkey wallet. Perch gives the account a policy you can read. The template gives you a working start. The QR code opens Nido's testnet wallet. Thank you.

**Links** (not spoken)

- <https://nido.fyi>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/README.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/README.md>

---

## Appendix

### 17. Appendix

**Time:** appendix, not part of the 15:00 talk (about 20 seconds if used for questions)

**On the slide:** APPENDIX · BACKUP SLIDES

- Perch in depth, the full walkthrough, and what broke

**Script**

Backup slides for questions: more of what rules buy you, Perch in depth, what an app can ask Nido for, the rest of the Kudos Jar walkthrough, what the agent tripped on, findings for the Nido team, and how to run Kudos Jar yourself.

### 18. What rules buy you (2/2)

**Time:** appendix, not part of the 15:00 talk (about 60 seconds if used for questions)

**On the slide:** AND THREE MORE · ONE ADDRESS, MANY KEYS

- RECOVERY: Guardians or a recovery kit
- SPONSORED START: A relayer pays the fees
- ADD AND REMOVE: Devices and app keys come and go

**Script**

Three more.

Recovery. The same rules can say how you get back in: a quorum of guardians, a zero-knowledge recovery kit, or both. It's opt-in, and you set it up before you need it.

Sponsored onboarding. Because the account is a contract, someone else can pay to create it and to submit its transactions. On testnet, Nido's relayer does exactly that, and new accounts arrive with five test XLM.

And one address, many keys. You can add a second device or an app's key, and remove it later, by updating the account's rules. The address never changes, so your balances and history stay put. Grants also expire on their own, which matters, because today expiry is the bound you can rely on most.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/docs/recovery/README.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/infra/relayer/README.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/frontend/src/components/PolicyBuilder.ts>

### 19. One document, one hash

**Time:** appendix, not part of the 15:00 talk (about 55 seconds if used for questions)

**On the slide:** POLICY DOCUMENTS · ONE DOCUMENT, ONE HASH

- Signers, rules, optional recovery.
- Canonical JSON, hashed on chain.
- apply_doc is the only way to change it.
- Every rule names who, where, what, until when, how much

**Script**

A Perch policy is one JSON document: a list of signers, a list of rules, and optionally recovery. It's written in a canonical form, so the same document always produces the same bytes, and the account stores its hash.

That gives you a property I really like: anyone can fetch the applied document, hash it, and check it against the chain. Nido's policy page does exactly that.

And there's one way to change an account's authorization: apply a new document. Adding a device, granting an app, removing a key: each is a document update, signed by the account's admin rule.

Each rule says who may sign, which contract it covers, which functions, until which ledger, and optionally how much may move.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/CANONICAL.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-smart-account/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-account/src/lib.rs>

### 20. From document to enforcement

**Time:** appendix, not part of the 15:00 talk (about 55 seconds if used for questions)

**On the slide:** HOW IT RUNS · DOCUMENT TO ENFORCEMENT

- 1. Write the document
- 2. Compile it on chain
- 3. Install as account rules
- 4. Enforce in __check_auth

**Script**

How does a document become enforcement?

You write the document, or a wallet writes it for you. The account sends it to Perch's doc compiler, which is itself a contract, so compilation happens on chain. The compiler lowers each rule onto an OpenZeppelin context rule. Simple rules need nothing more than OpenZeppelin's own signer check. Rules with constraints get a small program for Perch's interpreter, and a cap attaches OpenZeppelin's spending-limit policy next to it.

Then, on every authorization, the account picks the rule the signature names, checks scope and expiry, verifies the signers, and runs every attached policy. All of them must pass. The interpreter denies by default: if anything can't be decoded, the answer is no.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-doc-compiler/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-interpreter/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-spending-limit/src/lib.rs>

### 21. Verifiers

**Time:** appendix, not part of the 15:00 talk (about 55 seconds if used for questions)

**On the slide:** WHO MAY SIGN · VERIFIERS

- ED25519: Classic keys, as a verifier contract
- WEBAUTHN: Passkeys on P-256
- DELEGATED: Another account signs (CAP-71)
- Coming: ML-DSA (post-quantum) as one more verifier contract. On Perch’s roadmap; not built yet.

**Script**

Who can sign for a Perch account? Three kinds of signer today.

Ed25519, the classic key type, checked by a verifier contract. WebAuthn, for passkeys on the P-256 curve, also a verifier contract; this is what Nido uses for its admin key. And delegated signers: any G or C address, authenticated by the host inside the account's own authorization entry, using a protocol 27 feature, CAP-71. That's what the demo app's session key is.

Because verifiers are contracts, new signature schemes can be added without changing accounts. ML-DSA, a post-quantum scheme, is on Perch's roadmap as exactly that kind of verifier. It is not built yet, so treat it as direction, not a feature.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-ed25519-verifier/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-webauthn-verifier/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/docs/recovery/cap-0071.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/docs/slides/index.html>

### 22. Constructorless publishing

**Time:** appendix, not part of the 15:00 talk (about 55 seconds if used for questions)

**On the slide:** CONTENT-ADDRESSED PUBLISHING · CONSTRUCTORLESS

- Shared contracts deploy with no arguments.
- Address = registry + hash of the wasm.
- Accounts pin them by hash; no one repoints.
- Upgrades wait ~7 days

**Script**

Perch's shared contracts, the compiler, the interpreter, the verifiers, the spending limit, are published through a Stellar Registry instance that only deploys them one way: no constructor arguments, and the deploy salt is the hash of the wasm. So the address of each contract is a pure function of the registry and the code.

That has a nice consequence. An account build pins its compiler, interpreter and spending limit by hash, at build time. There's no admin setting that can point your account at different code later.

If the account itself needs new code, it goes through a scheduled upgrade with a delay of about seven days, which the owner can cancel.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-constructorless-registry/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/AGENTS.md>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/docs/deploy/README.md>

### 23. Accounts and factories

**Time:** appendix, not part of the 15:00 talk (about 55 seconds if used for questions)

**On the slide:** ACCOUNTS · ACCOUNTS AND FACTORIES

- Rule 0, admin: full owner authority.
- Perch factory: the address commits to its signers.
- Nido factory: the address exists before the passkey.
- Everything else arrives as a document

**Script**

Every Perch account starts with one rule, admin, created by its constructor. Admin is scoped to the account itself, which sounds narrow, but it covers apply-doc and execute, so it is full owner authority. Every other rule arrives later as a document.

Accounts come from factories. Perch's own factory derives the address from the admin signers, so an address commits to who controls it.

Nido runs its own factory, for a practical reason: a passkey is bound to a web origin, and Nido gives every account its own subdomain. So the address has to exist before the passkey. Nido reserves it with a one-time setup key, then binds the passkey, and its relayer pays for the deployment.

**Links** (not spoken)

- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-account/src/lib.rs>
- <https://github.com/stellar-registry/perch/blob/2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63/crates/perch-account-factory/src/lib.rs>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/DEPLOYED.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/contracts/factory/src/contract.rs>

### 24. What a dApp can ask Nido for

**Time:** appendix, not part of the 15:00 talk (about 45 seconds if used for questions)

**On the slide:** THE DAPP INTERFACE · WHAT AN APP CAN ASK

- 1. Connect: the C-address
- 2. Sign one transaction
- 3. Grant a scoped session
- 4. Recovery stays in Nido

**Script**

From an app's point of view, Nido shows up in Stellar Wallets Kit next to the usual wallets. Four things you can ask it for.

Connect, which gives you the account's address and nothing else. Sign a transaction, in a popup, with the passkey; Nido's relayer submits it and hands you back the hash. Grant a scoped session: the app holds a key, and the owner approves a rule for it, once. And everything about the account itself, recovery, devices, policies, stays in Nido's own pages.

The popup can only sign calls on the account itself, which is why apps use the session for their own contracts.

**Links** (not spoken)

- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/docs/ADD-NIDO-TO-DAPP.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/stellar-wallets-kit-module/src/module.ts>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/frontend/src/lib/policy/docRequest.ts>

### 25. Walkthrough: a passkey account

**Time:** appendix, not part of the 15:00 talk (about 35 seconds if used for questions)

**On the slide:** WALKTHROUGH · SIGN IN · A PASSKEY ACCOUNT

- RESERVE: The C-address exists first
- LOCK: One passkey ceremony
- FUNDED: 5 test XLM, fees sponsored
- [Screenshot: Nido asking to create the account passkey for CBP72A…Z46QCJ]
- nido.fyi on testnet

**Script**

The walkthrough starts on Nido. Nido reserves the account's address first, here CBP7-something, and then asks for a passkey, which gets bound to that address's own subdomain.

One ceremony, and the relayer deploys the account and funds it with five test XLM. The person never needed XLM, a seed phrase, or a browser extension. It took a minute or two, most of it waiting for the network.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/frontend/src/pages/new-account/index.astro>

### 26. Walkthrough: connect and ask once

**Time:** appendix, not part of the 15:00 talk (about 40 seconds if used for questions)

**On the slide:** WALKTHROUGH · CONNECT · CONNECT, THEN ASK ONCE

- PICK NIDO: From the usual wallet list
- THE ACCOUNT: C-address and its XLM balance
- ONE REQUEST: Two rules, two confirmations
- [Screenshot: Kudos Jar connected to a Nido account, asking to approve a session]
- Kudos Jar, running locally

**Script**

Next, in the app. Connect, choose Nido from the regular wallet list, pick the account. The app now knows the C-address and reads its balance from the XLM token contract.

Then it asks one thing, up front, in plain words: may this app call tip on the jar, and move up to two XLM a day from your account, for twenty-four hours? That's two rules, because a tip touches two contracts, the jar and the XLM token, so it's two passkey confirmations.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- Kudos Jar’s KudosBoard component, same run

### 27. Walkthrough: the policy afterwards

**Time:** appendix, not part of the 15:00 talk (about 30 seconds if used for questions)

**On the slide:** AFTERWARDS · THE ACCOUNT’S POLICY

- DOCUMENT: Hash verified against the chain
- RULES: admin, kudos-tip, kudos-xlm
- KEYS: A passkey and the app’s key
- [Screenshot: Nido policy page showing the verified document and its rules]
- Nido’s policy page

**Script**

Afterwards, the account's policy page in Nido shows the document: its hash, checked byte for byte against the one stored on chain, the two signers, the passkey and the app's key, and the three rules.

When the rules expire, the app's key stops working, with nothing for anyone to remember to clean up.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/frontend/src/lib/policyChainFetch.ts>

### 28. Walkthrough: the call site

**Time:** appendix, not part of the 15:00 talk (about 45 seconds if used for questions)

**On the slide:** THE REACT CALL SITE · THE CODE THAT MATTERS

- transactionSource and submitContract are template helpers from @stellar-scaffold/app-lib.

```
const tx = await kudosJar.tip(
  { from: address, team: team.id, amount: 5_000_000n },
  { publicKey: transactionSource(address) },
)
const { result } = await submitContract(tx, address)
```

**Script**

For developers, the code is short. The generated client builds the tip call. transactionSource keeps the C-address out of the transaction source, because a contract can't be one.

submitContract does the rest. For a classic wallet it signs and sends as usual. For a Nido account with an approved session, the app's key signs a CAP-71 entry that names the right rule for each contract, submits, and returns the confirmed result.

Both helpers come from the template's app-lib, not the Stellar SDK. Kudos Jar predates submitCall, which now wraps these steps in one call.

**Links** (not spoken)

- Kudos Jar’s KudosBoard component, same run
- [template/app-lib/session.ts](../../template/app-lib/session.ts)

### 29. What the agent tripped on

**Time:** appendix, not part of the 15:00 talk (about 65 seconds if used for questions)

**On the slide:** FIXED IN THE TEMPLATE · WHAT THE AGENT TRIPPED ON

- SILENT TOOLS: Old Scaffold wrote no clients
- BLOCKED POPUP: Simulation outlived the click
- WRONG PATH: Popup signing, then non-root auth

**Script**

What got in the way, and what we changed.

Silent tools. The globally installed Scaffold was too old for the template's config, and it failed silently: it compiled contracts and wrote no clients. The template now installs its own tested Scaffold with tools-colon-scaffold, and refuses an older one. A fresh client also brought its own copy of the Stellar SDK, which broke types, so there's a script that folds it back in.

A blocked popup. The app built and simulated the call before opening Nido's popup, and by then the browser had forgotten the click. The template now reserves the popup during the click.

And the wrong path twice: first the popup signing we just saw, then a contract that skipped require-auth to save a rule, which simulation refuses. The agent's own instructions file now says both.

**Links** (not spoken)

- Log of the agent-built Kudos Jar run, Oct 2026
- [template/NIDO.md](../../template/NIDO.md)

### 30. Upstream findings

**Time:** appendix, not part of the 15:00 talk (about 55 seconds if used for questions)

**On the slide:** FOR THE NIDO TEAM · FOUND ALONG THE WAY

- NIDO SIGNER: Admin rule only: no app calls
- NIDO RELAYER: Can’t relay CAP-71 entries yet
- DOCS: Still describe signed XDR

**Script**

A few findings belong upstream, and we've written them up.

Nido's signer, as we saw, signs only under the admin rule. Nido's relayer can't yet decode the CAP-71 entries that its own session grants produce, so the demo's session key pays its own fees. And Nido's integration guide still says the wallet returns signed XDR for the app to submit; the code now submits and returns a hash, and the template handles that.

The dry run added more for Nido: tell the app why the relayer refused, and let it pay its own fee when the budget is gone. The template's half of both is ready; the feedback report has the full list.

**Links** (not spoken)

- Log of the agent-built Kudos Jar run, Oct 2026
- Feedback report from a six-team simulated hackathon run, Oct 2026 §5.2, §6
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/docs/ADD-NIDO-TO-DAPP.md>
- <https://github.com/nidohq/nido/blob/4fee10dc55b877e828c5f9fe60cc6807ea10ea6e/packages/stellar-wallets-kit-module/README.md>

### 31. Run Kudos Jar yourself

**Time:** appendix, not part of the 15:00 talk (about 35 seconds if used for questions)

**Stage cue:** Have the app open in a tab as a fallback if the network is slow.

**On the slide:** TRY IT TONIGHT · RUN KUDOS JAR

- 1. npm ci
- 2. npm run clients:testnet
- 3. npm run dev
- 4. Create a Nido, approve, tip

**Script**

To try the demo app tonight: clone the repository, go into examples slash kudos-jar, run npm ci, generate the client for the demo jar with clients-colon-testnet, and npm run dev.

Create a Nido account at nido.fyi, connect, approve the session, and tip. To start your own app instead, follow the build-your-own slide: the template's NIDO.md has the rules for you, and AGENTS.md has them for your coding agent.

**Links** (not spoken)

- Kudos Jar, an agent-built demo app run live on testnet, Oct 2026
- [template/NIDO.md](../../template/NIDO.md)

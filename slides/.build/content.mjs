import { existsSync } from 'node:fs';

export const templateUrl = 'https://docs.google.com/presentation/d/1-HRAkfaI2YZQZzSWonXNrDxBCA1HZ4r_OjJ-YvP6lNM/edit';
const stellar = 'https://developers.stellar.org/docs/build/guides/contract-accounts';
const auth = 'https://developers.stellar.org/docs/build/guides/auth/contract-authorization';
const multisig = 'https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig';
const nidoRev = '4fee10dc55b877e828c5f9fe60cc6807ea10ea6e';
const perchRev = '2d1df9b3eefbaa70c74bbf83ffb8f96cc9581f63';
const nido = (p = '') => `https://github.com/nidohq/nido/blob/${nidoRev}/${p}`;
const perch = (p = '') => `https://github.com/stellar-registry/perch/blob/${perchRev}/${p}`;
const ozFork = 'https://github.com/theahaco/stellar-contracts-OZ/tree/33726766a1fd5e7e3d2977d79f64ee29e1ea3ca9/packages/accounts';
// Local sources are relative to the deck. research-sources.mjs, in the
// research repo only, locates the template and the material the published
// repo leaves out; without it the template is ../template and that material
// is cited as plain text.
const research = existsSync(new URL('research-sources.mjs', import.meta.url))
  ? await import('./research-sources.mjs') : {};
const src = research.sources ?? {};
const tpl = (p) => (research.templateDir ?? '../template/') + p;
const run = 'simulated hackathon run, Oct 2026';
const template = tpl('NIDO.md');
const agents = tpl('AGENTS.md');
const session = tpl('app-lib/session.ts');
const example = src.example ?? 'Kudos Jar, an agent-built demo app run live on testnet, Oct 2026';
const board = src.board ?? 'Kudos Jar’s KudosBoard component, same run';
const log = src.log ?? 'Log of the agent-built Kudos Jar run, Oct 2026';
const report = src.report ?? `Feedback report from a six-team ${run}`;
const team = (code) => src.team?.(code) ?? `Team ${code} feedback, ${run}`;
const selfRelay = src.selfRelay ?? `Team hk-hu-template’s self-relay script, ${run}`;
const explorer = (tx) => `https://stellar.expert/explorer/testnet/tx/${tx}`;

// Every slide names its template layout (see build.mjs) and the content that
// layout takes. `seconds` budgets the spoken script; notes carry the script,
// an optional stage cue, and sources that are never read aloud.
//
// The talk is the slides up to the closing one and runs 15:00. Slides marked
// `appendix` follow it as backup for questions; their `seconds` are an
// estimate if one is used, and they never count toward the talk's time.
export const slides = [
  // ── Opening ───────────────────────────────────────────────────────────
  { layout:'title', title:'Stellar smart accounts', seconds:35,
    kicker:'BUILDING AT HACK MERIDIAN', heading:'STELLAR\nSMART\nACCOUNTS', subtitle:'Why a C-address, and how to build an app on one',
    script:`Imagine someone trying your hackathon app for the first time. They get the idea right away, and then you ask them to learn a wallet: a seed phrase, a browser extension, a signature for every click.

In the next fifteen minutes: why an account with rules is a better start, how Perch and Nido give you one, an app a coding agent built on testnet, and what six teams ran into when they built their own in two hours.`,
    sources:[stellar, nido('README.md'), perch('README.md')]},

  // ── Why C over G ──────────────────────────────────────────────────────
  { layout:'bigIdea', title:'Rules, not just a key', seconds:40,
    kicker:'THE BIG IDEA', heading:'YOUR ACCOUNT SHOULD\nHAVE RULES,\nNOT JUST A KEY', subtitle:'G-addresses hold keys. C-addresses run code.',
    script:`Here is the idea in one line. Today, most Stellar users have an account that is a key. Whoever holds the key, or enough of the keys, can do anything the account can do.

A smart account is an account with rules. It is a contract, so its address starts with C, and the network asks that contract whether each request is allowed. The rules can say who may sign, for which contract, for which function, for how long, and for how much.`,
    sources:[stellar, auth]},
  { layout:'topicRight', title:'The G-address', seconds:45,
    kicker:'CLASSIC ACCOUNTS', heading:'G-ADDRESS: A KEY', body:'Ed25519 signers, weights, thresholds:\nfixed rules the protocol defines.\nAn app asks every time, or holds your key.', footnote:'Multisig exists. Scoped permission does not.',
    script:`Let's be fair to the classic account first. A G-address is an ed25519 key, and it can have several signers with weights and thresholds. That's real multisig, and every wallet and exchange supports it.

What it can't do is scope. There's no way to say "this key may only call this one contract", "only until Friday", or "no more than two XLM a day".

So an app that wants to act for you has two choices: ask you to sign every single action, or hold a key that can do everything.`,
    sources:[multisig]},
  { layout:'topicLeft', title:'The C-address', seconds:50,
    kicker:'CONTRACT ACCOUNTS', heading:'C-ADDRESS:\nAN ACCOUNT\nTHAT RUNS CODE', body:'from.require_auth()\n→ the account’s __check_auth\n→ its rules decide', footnote:'Same Address type for your contract',
    script:`A contract account turns that around. When your contract calls require_auth on an address, Soroban checks a classic account's signatures the classic way. If the address is a contract, the host calls that contract's check-auth function and passes it everything: the signature, and the exact calls being authorized.

The account then evaluates its own rules. The important part for you as an app developer: your contract doesn't change. It asks an Address to authorize, the same as always. The difference lives in the account.

One caution. If your contract trusts an address it never calls require_auth on, a smart wallet won't save it.`,
    sources:[auth, stellar]},
  { layout:'takeaways', title:'What rules buy you', seconds:55,
    kicker:'WHAT RULES BUY YOU', heading:'WHAT RULES BUY YOU', items:[['PASSKEYS','Face ID instead of a seed phrase'],['SCOPED KEYS','One contract, listed functions, an expiry'],['SPENDING CAPS','A rolling limit the account enforces']],
    script:`Three things you can build with rules.

Passkeys. A passkey signs with P-256, which a classic account can't verify. A contract account can, through a WebAuthn verifier contract. The biometric check happens on the device; the chain only sees a signature.

Scoped keys. You can give a key permission for one contract, a list of functions, and an expiry. That's how an app acts for you without holding your account.

Spending caps. A rule can carry a limit, say two XLM per day, and the account enforces it on every transfer. You'll see one refuse a payment.

The same rules also cover recovery, sponsored onboarding, and adding or removing devices; that's in the appendix.`,
    sources:[perch('crates/perch-webauthn-verifier/src/lib.rs'), perch('crates/perch-ir/src/doc.rs'), perch('crates/perch-spending-limit/src/lib.rs')]},
  { layout:'demo', title:'Honest trade-offs', seconds:75,
    kicker:'WHAT IT COSTS', heading:'THE HONEST TRADE-OFFS', labels:['COMPATIBILITY','COST','MATURITY'], bodies:['No classic operations; Horizon shows no account','Sponsored, up to a shared daily budget','Testnet, pre-audit, forked dependencies'],
    left:{title:'WHAT NIDO’S\nRELAYER PAYS', body:'Account: about 1.4 XLM\nFirst grant: about 4.5 XLM\nCapped grant: about 2.7 XLM', note:'From one 100 XLM/day pot, on 22 Oct 2026'},
    script:`Now the costs, because you should know them before you choose.

Compatibility. A C-address can't be the source of a classic operation, and Horizon has no account record for it, so your app reads balances from the token contract over RPC. Many tools, exchanges included, still assume a G-address.

Cost. A contract account is storage, so it pays rent, and so does every rule. On testnet, Nido's relayer pays for you, but from one shared budget: a hundred XLM a day for all of testnet. On the twenty-second it counted about 1.4 XLM to create an account, 4.5 for an app's first grant, and 2.7 for a capped one. That's around twenty grants a day for everyone, so a busy room can run it dry. I'll show you what that looks like.

Maturity. Perch and Nido are testnet-only and not yet audited, and Nido's revoke button doesn't work yet. Build on it tonight; don't put real money behind it.`,
    sources:[report+' §3', team('hk-ai-claude'), nido('docs/ADD-NIDO-TO-DAPP.md'), perch('docs/audit-scope.md'), nido('docs/MAINNET_READINESS.md')]},

  // ── Perch and Nido ────────────────────────────────────────────────────
  { layout:'code', title:'Perch: a rule you can read', seconds:65,
    kicker:'PERCH · THE POLICY LAYER', heading:'PERCH: A RULE YOU CAN READ',
    code:'{ "name": "kudos-xlm",\n  "scope": { "type": "contract", "address": "CDLZ…CYSC" },\n  "principals": { "type": "all", "signers": ["session"] },\n  "functions": ["transfer"],\n  "cap": { "limit": "20000000", "period-ledgers": 17280 },\n  "not-after-ledger": 5342393 }',
    caption:'One document per account, hashed and compiled on chain, enforced in __check_auth.',
    script:`The rules live in Perch, a policy layer for Soroban smart accounts built on OpenZeppelin's account framework. An account's whole authorization is one JSON document: signers, rules, and optional recovery. It's canonical, so the account stores its hash and anyone can check it.

This is a real rule from the demo you'll see. Scope: one contract, the XLM token. Principal: the app's session key. One function, transfer. A cap of two XLM per seventeen thousand two hundred and eighty ledgers, about a day. And an expiry ledger.

Perch compiles the document on chain, and the account enforces it in check-auth on every call, denying by default. Verifiers, the registry and factories are in the appendix if you want the deep dive.`,
    sources:[perch('README.md'), perch('CANONICAL.md'), perch('docs/schema.md'), perch('crates/perch-doc-compiler/src/lib.rs'), example]},
  { layout:'topicRight', title:'Nido', seconds:45,
    kicker:'THE WALLET', heading:'NIDO', body:'Passkey-native Perch accounts.\nConnect, sign, or grant a session.\nCreation and fees sponsored.', footnote:'nido.fyi · TESTNET', big:true,
    script:`Nido is the wallet people see, and every Nido account is a Perch account. You open nido.fyi, approve with your face or fingerprint, and you have a C-address on its own subdomain, created and funded with five test XLM by Nido's relayer.

From your app, Nido sits in Stellar Wallets Kit next to the usual wallets. You can ask it for three things: connect, which gives you the address; sign one transaction in a popup; or grant your app a scoped session. The third one turns out to matter most.`,
    sources:[nido('README.md'), nido('docs/ADD-NIDO-TO-DAPP.md'), nido('infra/relayer/README.md')]},
  { layout:'code', title:'Finding: the popup and your contract', seconds:60,
    kicker:'VERIFIED ON TESTNET', heading:'THE POPUP CAN’T SIGN\nFOR YOUR CONTRACT',
    code:'guess(3, CAXS…) → __check_auth\n  context_rule_ids: [0]  // "admin", scoped to the account\n  contexts: guess, transfer  // two calls, one rule\n→ Error(Contract, #3014) ContextRuleIdsLengthMismatch',
    caption:'One contract: #3002. Several: #3014. Fix: ask once for a session.',
    script:`Here's the most important sentence in this talk: today, your app can't ask the passkey to sign a call to your own contract.

Nido's popup signs under the admin rule, and admin covers only the account itself. When our sample game asked the account to authorize a guess, which also moves one XLM, the account got two calls and one rule that covers neither, and refused. A call into a single contract fails the same way, with 3002.

So you ask once for a session. Your app holds its own key, and the owner approves one Perch rule for each contract the call touches. After that, your app's key signs, and the account checks every call.`,
    sources:[template, nido('packages/frontend/src/lib/walletSign.ts'), ozFork, team('hk-hu-noscaffold')],
    cue:'Slow down on the first sentence; this is the turning point of the talk.'},

  // ── The walkthrough ───────────────────────────────────────────────────
  { layout:'steps', title:'An agent builds Kudos Jar', seconds:50,
    kicker:'AN AGENT BUILDS AN APP', heading:'ONE PROMPT: KUDOS JAR', rows:['Copy the template with new-app','Write and test the contract','Deploy it to testnet','Run it with a real Nido account'],
    script:`To prove it end to end, we gave a coding agent the template and one prompt: build a small app that shows off a smart account, with passkey sign-in and a policy-limited action, live on testnet.

It built Kudos Jar: tip a hackathon team in XLM, with a public tally. It copied the template with new-app, wrote and unit-tested a Soroban contract, deployed it with one Scaffold command, and built a React board on the generated client. Then it ran the real flow with a Nido account on testnet, created with a throwaway virtual passkey, because an agent has no fingerprint.`,
    sources:[example, log]},
  { layout:'demo', title:'Approve the rule', seconds:45,
    kicker:'APPROVE ONCE', heading:'APPROVE THE RULE IN NIDO', labels:['SCOPE','CAP','EXPIRY'], bodies:['Only transfer, only on XLM','Up to 2 XLM per day','About 24 hours, then gone'],
    image:{file:'08-grant-xlm-cap.png', crop:{left:.41,top:.45,right:.23,bottom:.30}, alt:'Nido grant page: only transfer on the XLM contract, up to 2 XLM per day, expires in 24 hours'},
    caption:'Nido’s grant page, before the passkey',
    script:`After connecting, the app asks once, in plain words: may it call tip on the jar and move up to two XLM a day, for twenty-four hours? A tip touches two contracts, the jar and the XLM token, so that's two rules and two passkey confirmations.

Each one happens on Nido's page, not the app's. Nido shows the contract, the functions, the cap and the expiry. The owner confirms with the passkey, Nido applies the new policy document, and the browser comes back to the app. The app never touches the passkey.`,
    sources:[example, nido('packages/frontend/src/pages/security/delegate-doc/index.astro')]},
  { layout:'demo', title:'Tap until the cap', seconds:55,
    kicker:'TIP UNTIL THE CAP', heading:'TAP, TAP, TAP… REFUSED', labels:['NO PROMPTS','THE CAP','ON CHAIN'], bodies:['Four tips, each confirmed','The fifth would pass 2 XLM','The account said no: #3221'],
    image:{file:'10-tips-and-refusal.png', crop:{left:.18,top:.28,right:.18,bottom:.11}, alt:'Four confirmed tips and a fifth refused by the spending cap'},
    caption:'Live testnet, 22 Oct 2026',
    script:`And now the fun part. Tap a team, and the tip goes through: no popup, no prompt. The app's key signs inside the account's own authorization entry, the account checks its rules, and the transaction confirms. Four taps, two XLM, four transaction hashes you can look up.

The fifth tap would take the day's total past two XLM. The app didn't stop it. The account did: its spending-limit policy refused, with error 3221, and the app shows that as a plain sentence.

That's the whole point of a C-address. The limit isn't a promise the app makes. It's a rule the account enforces.`,
    sources:[example, explorer('cd9dfaefb145bd56d6239b1bd3ce8fa12eb5ca10bdee317d6b53e0012e043c1f'), explorer('567a9a60e2e8d91c33e8dd3cac0f4349ce173b5c8c7a2dd401628b0ad94790ec')],
    cue:'Pause on the red line before reading it.'},

  // ── Building your own ─────────────────────────────────────────────────
  { layout:'demo', title:'When the wallet says unknown', seconds:75,
    kicker:'WHEN IT GOES WRONG', heading:'WHEN THE WALLET SAYS “UNKNOWN”', labels:['429 · BUDGET USED UP','503 · RELAYER BUSY','504 · TIMED OUT'], bodies:['Nothing was sent. Wait, or pay your own fee','Nothing was sent. Retry in a moment','It may have landed. Check, then retry'],
    left:{title:'CHECK THE CHAIN\nBEFORE YOU RETRY', body:'Go back to the app, press Check again:\nit reads the account’s rules on chain.\nNothing there? Ask Nido again.', note:'A failed response can follow a success'},
    script:`Now the part most talks skip. In our dry run, Nido's relayer ran out of budget partway through, and every team hit it. Nido's page showed one message for three different failures: "we couldn't confirm what happened; retrying could pay twice."

A 429, FEE_LIMIT_EXCEEDED: the shared budget is used up, and nothing was sent. A 503, POOL_CAPACITY: the relayer is busy, nothing was sent, retry in a moment. A 504 is the tricky one: one team's grant timed out and had landed anyway.

So check the chain before you retry. Go back to the app and press Check again: the template reads the account's rules on chain. If nothing landed, Ask Nido again; that can't pay twice.

And when the budget is gone, the passkey's signature doesn't care who pays the fee. The template can already submit the signed grant with its own key, for about a quarter of an XLM; Nido's page doesn't offer that yet.`,
    sources:[report+' §3, §5.2 N-A2, N-H1', template+' (When Nido’s relayer says no)', tpl('CHANGELOG.md'), team('hk-hu-codex'), selfRelay, session]},
  { layout:'steps', title:'Patterns that worked', seconds:85,
    kicker:'WHAT SIX TEAMS BUILT', heading:'PATTERNS THAT WORKED', rows:['Per-user cap: a rule on the token','Shared pot: a contract, 2 of 3 approve','No money moves: one grant, no cap','Allowance or time lock: a vault holds it'],
    script:`We ran a dry run of this kit: six teams, all driven by AI, three as coding agents and three simulating a person working from these slides, each with two hours on testnet. All six prototypes work, and four patterns came out of them.

One: a per-user cap, like Kudos Jar. Put the cap on the token rule, and the account enforces it.

Two: a shared pot. Group Pot's contract holds the money and pays an expense when two of three members approve. Each member signs in with their own Nido account and approves their own session.

Three: nothing moves. Event tickets, a one-question poll, a guestbook: one grant on your contract, with no cap. Nido asks the owner to accept "no cap" explicitly, and the app's key pays the fees. The template's blank starter is exactly this.

Four: limits the user mustn't undo. A cap limits a key, not the account's admin, so Pocket Money keeps a teen's allowance in a parent-owned vault. And expiry stops a key; it doesn't delay a withdrawal, so Goalpost puts its unlock date in the vault contract.`,
    sources:[report+' §2, §5.1 D-H2', template+' (patterns that work)', team('hk-ai-claude'), team('hk-ai-sonnet'), team('hk-ai-codex'), team('hk-hu-codex'), team('hk-hu-template'), team('hk-hu-noscaffold')]},
  { layout:'code', title:'Build your own', seconds:80,
    kicker:'BUILD YOUR OWN', heading:'YOUR OWN APP, START TO FINISH',
    code:'npm run new-app -- ../my-app --blank && cd ../my-app\nnpm run tools:scaffold && npm ci && npm run doctor\n# grow contracts/check-in, or add a crate and list it in scaffold.yml\nnpm run deploy:testnet  # deploys, pins its testnet ID, writes the client\n<SessionGate grants={grants}>  // one Grant per contract in env.auths()\nconst { result, hash } = await submitCall(address, (publicKey) =>\n  myContract.my_fn({ user: address }, { publicKey }))',
    caption:'Helpers from the template’s app-lib. NIDO.md has the whole path; AGENTS.md is for your agent.',
    script:`Here's your own app, start to finish. new-app with blank copies the template with a one-function starter, and gives it its own name, port and deployer key. tools-colon-scaffold installs the right Scaffold into the project in seconds, and doctor checks your tools, keys and testnet, with a fix for each problem.

Grow the starter contract, or add your own crate to scaffold.yml. deploy-colon-testnet deploys it, pins its ID, and writes its client.

To find your grants, assert env.auths in a unit test: one Grant per contract in that list, usually your contract, plus the token if it moves the user's money. Keep require_auth at the top of your function. Then submitCall is the whole call site: it builds the call, signs with whatever the user connected, and returns the result and the hash.

You're done when you have a passkey account, a confirmed transaction hash, and one refusal from the account itself. The template's NIDO.md has the details for you, and AGENTS.md for your coding agent.`,
    sources:[template+' (Quick start; Your own contract in five steps; Calling a contract from React)', agents, tpl('CHANGELOG.md'), tpl('app-lib/wallet.ts'), tpl('app/src/components/SessionGate.tsx'), report+' §5.1 D-H1, D-A2, D-A4']},
  { layout:'next', title:'Your first smart account app', seconds:40,
    kicker:'KEEP BUILDING', heading:'YOUR FIRST SMART ACCOUNT APP', body:'Give the app a rule, not your key.\nLet the account say no.', links:'nido.fyi  ·  testnet\ngithub.com/nidohq/nido\ngithub.com/stellar-registry/perch',
    script:`For your hackathon project: pick the one action your app takes for a user, write down the rule that should bound it, and let the account enforce it. Ask for that rule once, in plain words, and then get out of the user's way.

Nido gives you the passkey wallet. Perch gives the account a policy you can read. The template gives you a working start. The QR code opens Nido's testnet wallet. Thank you.`,
    sources:['https://nido.fyi', nido('README.md'), perch('README.md')],
    cue:'Leave this slide up for questions; the appendix follows.'},

  // ── Appendix: backup for questions ────────────────────────────────────
  { layout:'bigIdea', title:'Appendix', seconds:20, appendix:true,
    kicker:'APPENDIX', heading:'BACKUP\nSLIDES', subtitle:'Perch in depth, the full walkthrough, and what broke',
    script:`Backup slides for questions: more of what rules buy you, Perch in depth, what an app can ask Nido for, the rest of the Kudos Jar walkthrough, what the agent tripped on, findings for the Nido team, and how to run Kudos Jar yourself.`,
    sources:[]},
  { layout:'takeaways', title:'What rules buy you (2/2)', seconds:60, appendix:true,
    kicker:'AND THREE MORE', heading:'ONE ADDRESS, MANY KEYS', items:[['RECOVERY','Guardians or a recovery kit'],['SPONSORED START','A relayer pays the fees'],['ADD AND REMOVE','Devices and app keys come and go']],
    script:`Three more.

Recovery. The same rules can say how you get back in: a quorum of guardians, a zero-knowledge recovery kit, or both. It's opt-in, and you set it up before you need it.

Sponsored onboarding. Because the account is a contract, someone else can pay to create it and to submit its transactions. On testnet, Nido's relayer does exactly that, and new accounts arrive with five test XLM.

And one address, many keys. You can add a second device or an app's key, and remove it later, by updating the account's rules. The address never changes, so your balances and history stay put. Grants also expire on their own, which matters, because today expiry is the bound you can rely on most.`,
    sources:[perch('docs/recovery/README.md'), nido('infra/relayer/README.md'), nido('packages/frontend/src/components/PolicyBuilder.ts')]},
  { layout:'topicLeft', title:'One document, one hash', seconds:55, appendix:true,
    kicker:'POLICY DOCUMENTS', heading:'ONE DOCUMENT,\nONE HASH', body:'Signers, rules, optional recovery.\nCanonical JSON, hashed on chain.\napply_doc is the only way to change it.', footnote:'Every rule names who, where, what, until when, how much',
    script:`A Perch policy is one JSON document: a list of signers, a list of rules, and optionally recovery. It's written in a canonical form, so the same document always produces the same bytes, and the account stores its hash.

That gives you a property I really like: anyone can fetch the applied document, hash it, and check it against the chain. Nido's policy page does exactly that.

And there's one way to change an account's authorization: apply a new document. Adding a device, granting an app, removing a key: each is a document update, signed by the account's admin rule.

Each rule says who may sign, which contract it covers, which functions, until which ledger, and optionally how much may move.`,
    sources:[perch('CANONICAL.md'), perch('crates/perch-smart-account/src/lib.rs'), perch('crates/perch-account/src/lib.rs')]},
  { layout:'steps', title:'From document to enforcement', seconds:55, appendix:true,
    kicker:'HOW IT RUNS', heading:'DOCUMENT TO ENFORCEMENT', rows:['Write the document','Compile it on chain','Install as account rules','Enforce in __check_auth'],
    script:`How does a document become enforcement?

You write the document, or a wallet writes it for you. The account sends it to Perch's doc compiler, which is itself a contract, so compilation happens on chain. The compiler lowers each rule onto an OpenZeppelin context rule. Simple rules need nothing more than OpenZeppelin's own signer check. Rules with constraints get a small program for Perch's interpreter, and a cap attaches OpenZeppelin's spending-limit policy next to it.

Then, on every authorization, the account picks the rule the signature names, checks scope and expiry, verifies the signers, and runs every attached policy. All of them must pass. The interpreter denies by default: if anything can't be decoded, the answer is no.`,
    sources:[perch('crates/perch-doc-compiler/src/lib.rs'), perch('crates/perch-interpreter/src/lib.rs'), perch('crates/perch-spending-limit/src/lib.rs')]},
  { layout:'takeaways', title:'Verifiers', seconds:55, appendix:true,
    kicker:'WHO MAY SIGN', heading:'VERIFIERS', items:[['ED25519','Classic keys, as a verifier contract'],['WEBAUTHN','Passkeys on P-256'],['DELEGATED','Another account signs (CAP-71)']],
    note:'Coming: ML-DSA (post-quantum) as one more verifier contract. On Perch’s roadmap; not built yet.',
    script:`Who can sign for a Perch account? Three kinds of signer today.

Ed25519, the classic key type, checked by a verifier contract. WebAuthn, for passkeys on the P-256 curve, also a verifier contract; this is what Nido uses for its admin key. And delegated signers: any G or C address, authenticated by the host inside the account's own authorization entry, using a protocol 27 feature, CAP-71. That's what the demo app's session key is.

Because verifiers are contracts, new signature schemes can be added without changing accounts. ML-DSA, a post-quantum scheme, is on Perch's roadmap as exactly that kind of verifier. It is not built yet, so treat it as direction, not a feature.`,
    sources:[perch('crates/perch-ed25519-verifier/src/lib.rs'), perch('crates/perch-webauthn-verifier/src/lib.rs'), perch('docs/recovery/cap-0071.md'), perch('docs/slides/index.html')]},
  { layout:'topicRight', title:'Constructorless publishing', seconds:55, appendix:true,
    kicker:'CONTENT-ADDRESSED PUBLISHING', heading:'CONSTRUCTORLESS', body:'Shared contracts deploy with no arguments.\nAddress = registry + hash of the wasm.\nAccounts pin them by hash; no one repoints.', footnote:'Upgrades wait ~7 days',
    script:`Perch's shared contracts, the compiler, the interpreter, the verifiers, the spending limit, are published through a Stellar Registry instance that only deploys them one way: no constructor arguments, and the deploy salt is the hash of the wasm. So the address of each contract is a pure function of the registry and the code.

That has a nice consequence. An account build pins its compiler, interpreter and spending limit by hash, at build time. There's no admin setting that can point your account at different code later.

If the account itself needs new code, it goes through a scheduled upgrade with a delay of about seven days, which the owner can cancel.`,
    sources:[perch('crates/perch-constructorless-registry/src/lib.rs'), perch('AGENTS.md'), perch('docs/deploy/README.md')]},
  { layout:'topicLeft', title:'Accounts and factories', seconds:55, appendix:true,
    kicker:'ACCOUNTS', heading:'ACCOUNTS AND\nFACTORIES', body:'Rule 0, admin: full owner authority.\nPerch factory: the address commits to its signers.\nNido factory: the address exists before the passkey.', footnote:'Everything else arrives as a document',
    script:`Every Perch account starts with one rule, admin, created by its constructor. Admin is scoped to the account itself, which sounds narrow, but it covers apply-doc and execute, so it is full owner authority. Every other rule arrives later as a document.

Accounts come from factories. Perch's own factory derives the address from the admin signers, so an address commits to who controls it.

Nido runs its own factory, for a practical reason: a passkey is bound to a web origin, and Nido gives every account its own subdomain. So the address has to exist before the passkey. Nido reserves it with a one-time setup key, then binds the passkey, and its relayer pays for the deployment.`,
    sources:[perch('crates/perch-account/src/lib.rs'), perch('crates/perch-account-factory/src/lib.rs'), nido('DEPLOYED.md'), nido('contracts/factory/src/contract.rs')]},
  { layout:'steps', title:'What a dApp can ask Nido for', seconds:45, appendix:true,
    kicker:'THE DAPP INTERFACE', heading:'WHAT AN APP CAN ASK', rows:['Connect: the C-address','Sign one transaction','Grant a scoped session','Recovery stays in Nido'],
    script:`From an app's point of view, Nido shows up in Stellar Wallets Kit next to the usual wallets. Four things you can ask it for.

Connect, which gives you the account's address and nothing else. Sign a transaction, in a popup, with the passkey; Nido's relayer submits it and hands you back the hash. Grant a scoped session: the app holds a key, and the owner approves a rule for it, once. And everything about the account itself, recovery, devices, policies, stays in Nido's own pages.

The popup can only sign calls on the account itself, which is why apps use the session for their own contracts.`,
    sources:[nido('docs/ADD-NIDO-TO-DAPP.md'), nido('packages/stellar-wallets-kit-module/src/module.ts'), nido('packages/frontend/src/lib/policy/docRequest.ts')]},
  { layout:'demo', title:'Walkthrough: a passkey account', seconds:35, appendix:true,
    kicker:'WALKTHROUGH · SIGN IN', heading:'A PASSKEY ACCOUNT', labels:['RESERVE','LOCK','FUNDED'], bodies:['The C-address exists first','One passkey ceremony','5 test XLM, fees sponsored'],
    image:{file:'01-nido-create-passkey.png', crop:{left:.34,top:.13,right:.34,bottom:.12}, alt:'Nido asking to create the account passkey for CBP72A…Z46QCJ'},
    caption:'nido.fyi on testnet',
    script:`The walkthrough starts on Nido. Nido reserves the account's address first, here CBP7-something, and then asks for a passkey, which gets bound to that address's own subdomain.

One ceremony, and the relayer deploys the account and funds it with five test XLM. The person never needed XLM, a seed phrase, or a browser extension. It took a minute or two, most of it waiting for the network.`,
    sources:[example, nido('packages/frontend/src/pages/new-account/index.astro')]},
  { layout:'demo', title:'Walkthrough: connect and ask once', seconds:40, appendix:true,
    kicker:'WALKTHROUGH · CONNECT', heading:'CONNECT, THEN ASK ONCE', labels:['PICK NIDO','THE ACCOUNT','ONE REQUEST'], bodies:['From the usual wallet list','C-address and its XLM balance','Two rules, two confirmations'],
    image:{file:'06-session-gate.png', crop:{left:.17,top:0,right:.17,bottom:.02}, alt:'Kudos Jar connected to a Nido account, asking to approve a session'},
    caption:'Kudos Jar, running locally',
    script:`Next, in the app. Connect, choose Nido from the regular wallet list, pick the account. The app now knows the C-address and reads its balance from the XLM token contract.

Then it asks one thing, up front, in plain words: may this app call tip on the jar, and move up to two XLM a day from your account, for twenty-four hours? That's two rules, because a tip touches two contracts, the jar and the XLM token, so it's two passkey confirmations.`,
    sources:[example, board]},
  { layout:'demo', title:'Walkthrough: the policy afterwards', seconds:30, appendix:true,
    kicker:'AFTERWARDS', heading:'THE ACCOUNT’S POLICY', labels:['DOCUMENT','RULES','KEYS'], bodies:['Hash verified against the chain','admin, kudos-tip, kudos-xlm','A passkey and the app’s key'],
    image:{file:'11-nido-policy.png', crop:{left:.41,top:.08,right:.23,bottom:.38}, alt:'Nido policy page showing the verified document and its rules'},
    caption:'Nido’s policy page',
    script:`Afterwards, the account's policy page in Nido shows the document: its hash, checked byte for byte against the one stored on chain, the two signers, the passkey and the app's key, and the three rules.

When the rules expire, the app's key stops working, with nothing for anyone to remember to clean up.`,
    sources:[example, nido('packages/frontend/src/lib/policyChainFetch.ts')]},
  { layout:'code', title:'Walkthrough: the call site', seconds:45, appendix:true,
    kicker:'THE REACT CALL SITE', heading:'THE CODE THAT MATTERS',
    code:'const tx = await kudosJar.tip(\n  { from: address, team: team.id, amount: 5_000_000n },\n  { publicKey: transactionSource(address) },\n)\nconst { result } = await submitContract(tx, address)',
    caption:'transactionSource and submitContract are template helpers from @stellar-scaffold/app-lib.',
    script:`For developers, the code is short. The generated client builds the tip call. transactionSource keeps the C-address out of the transaction source, because a contract can't be one.

submitContract does the rest. For a classic wallet it signs and sends as usual. For a Nido account with an approved session, the app's key signs a CAP-71 entry that names the right rule for each contract, submits, and returns the confirmed result.

Both helpers come from the template's app-lib, not the Stellar SDK. Kudos Jar predates submitCall, which now wraps these steps in one call.`,
    sources:[board, session]},
  { layout:'takeaways', title:'What the agent tripped on', seconds:65, appendix:true,
    kicker:'FIXED IN THE TEMPLATE', heading:'WHAT THE AGENT TRIPPED ON', items:[['SILENT TOOLS','Old Scaffold wrote no clients'],['BLOCKED POPUP','Simulation outlived the click'],['WRONG PATH','Popup signing, then non-root auth']],
    script:`What got in the way, and what we changed.

Silent tools. The globally installed Scaffold was too old for the template's config, and it failed silently: it compiled contracts and wrote no clients. The template now installs its own tested Scaffold with tools-colon-scaffold, and refuses an older one. A fresh client also brought its own copy of the Stellar SDK, which broke types, so there's a script that folds it back in.

A blocked popup. The app built and simulated the call before opening Nido's popup, and by then the browser had forgotten the click. The template now reserves the popup during the click.

And the wrong path twice: first the popup signing we just saw, then a contract that skipped require-auth to save a rule, which simulation refuses. The agent's own instructions file now says both.`,
    sources:[log, template]},
  { layout:'takeaways', title:'Upstream findings', seconds:55, appendix:true,
    kicker:'FOR THE NIDO TEAM', heading:'FOUND ALONG THE WAY', items:[['NIDO SIGNER','Admin rule only: no app calls'],['NIDO RELAYER','Can’t relay CAP-71 entries yet'],['DOCS','Still describe signed XDR']],
    script:`A few findings belong upstream, and we've written them up.

Nido's signer, as we saw, signs only under the admin rule. Nido's relayer can't yet decode the CAP-71 entries that its own session grants produce, so the demo's session key pays its own fees. And Nido's integration guide still says the wallet returns signed XDR for the app to submit; the code now submits and returns a hash, and the template handles that.

The dry run added more for Nido: tell the app why the relayer refused, and let it pay its own fee when the budget is gone. The template's half of both is ready; the feedback report has the full list.`,
    sources:[log, report+' §5.2, §6', nido('docs/ADD-NIDO-TO-DAPP.md'), nido('packages/stellar-wallets-kit-module/README.md')]},
  { layout:'steps', title:'Run Kudos Jar yourself', seconds:35, appendix:true,
    kicker:'TRY IT TONIGHT', heading:'RUN KUDOS JAR', rows:['npm ci','npm run clients:testnet','npm run dev','Create a Nido, approve, tip'],
    script:`To try the demo app tonight: clone the repository, go into examples slash kudos-jar, run npm ci, generate the client for the demo jar with clients-colon-testnet, and npm run dev.

Create a Nido account at nido.fyi, connect, approve the session, and tip. To start your own app instead, follow the build-your-own slide: the template's NIDO.md has the rules for you, and AGENTS.md has them for your coding agent.`,
    sources:[example, template],
    cue:'Have the app open in a tab as a fallback if the network is slow.'},
];

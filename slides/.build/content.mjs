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

const publicRepo = 'https://github.com/nidohq/scaffold-template';

// Every slide names its template layout (see build.mjs) and the content that
// layout takes. `seconds` budgets the spoken script; notes carry the script,
// an optional stage cue, and sources that are never read aloud. Code slides
// name a `lang` for highlight.mjs.
//
// The talk is the slides up to the closing one and runs 15:00. Slides marked
// `appendix` follow it as backup for questions; their `seconds` are an
// estimate if one is used, and they never count toward the talk's time.
export const slides = [
  // ── Opening ───────────────────────────────────────────────────────────
  { layout:'title', title:'Stellar smart accounts', seconds:35,
    kicker:'BUILDING AT HACK MERIDIAN', heading:'STELLAR\nSMART\nACCOUNTS', subtitle:'What a C-address gets you, and how to build an app on one',
    script:`I'm going to talk about smart accounts on Stellar: what they are, what they cost, and how to build a hackathon app on one this weekend.

The plan: why you'd want an account with rules instead of an account that's just a key. Perch and Nido, the two projects that give you one today. A small app a coding agent built on testnet. And what six teams ran into when they tried it in two hours.`,
    sources:[stellar, nido('README.md'), perch('README.md')]},

  // ── Why C over G ──────────────────────────────────────────────────────
  { layout:'bigIdea', title:'An account with rules', seconds:35,
    kicker:'THE IDEA', heading:'AN ACCOUNT\nWITH RULES', subtitle:'A G-address is a key. A C-address is a contract that decides what each signature may do.',
    script:`Most Stellar accounts today are a key, or a few keys with weights. Whoever holds enough of them can do anything the account can do.

A smart account is a contract. Its address starts with C, and when something asks it to authorize a call, the network runs the account's own code to decide. That code can check who signed, which contract and function are being called, until when, and how much money moves.`,
    sources:[stellar, auth]},
  { layout:'topicRight', title:'The G-address', seconds:45,
    kicker:'CLASSIC ACCOUNTS', heading:'G-ADDRESS: A KEY',
    body:'Signers are ed25519 keys with weights and thresholds. The protocol fixes the rules; you set the numbers.\nYou can’t say “only this contract”, “only until Friday” or “at most 2 XLM a day”.\nSo an app asks you to sign every action, or holds a key that can do everything.',
    footnote:'Multisig, yes. Scoped permissions, no.',
    script:`To be fair to classic accounts first: a G-address can have several signers, with weights and thresholds. That's real multisig, and every wallet and exchange supports it.

What it can't do is scope a key. There's no way to say this key may only call one contract, or only until Friday, or move at most two XLM a day.

So an app that wants to act for you has two options. Ask you to sign every single action, or hold a key that can do everything you can.`,
    sources:[multisig]},
  { layout:'code', title:'The C-address', seconds:50,
    kicker:'CONTRACT ACCOUNTS', heading:'C-ADDRESS: THE ACCOUNT RUNS CODE', lang:'rust',
    code:'pub fn check_in(env: Env, who: Address) -> u32 {\n    who.require_auth(); // a C-address runs its __check_auth here\n    let count = Self::count(env.clone(), who.clone()) + 1;\n    env.storage().persistent().set(&who, &count);\n    count\n}',
    caption:'Same code either way: the host checks a G-address’s signatures, and asks a C-address.',
    script:`A contract account turns that around. Here's an ordinary Soroban function. It calls require_auth on the address that's checking in.

If that address is a G-address, the host checks its signatures the classic way. If it's a C-address, the host calls the account's check-auth function and hands it the signatures, plus every call they're meant to cover. The account runs its rules and says yes or no.

Your contract doesn't change: it asks an Address to authorize, same as always. One thing to watch. If your contract trusts an address without calling require_auth on it, no smart account can protect anyone.`,
    sources:[auth, stellar, tpl('scripts/blank/contracts/check-in/src/lib.rs')]},
  { layout:'points', title:'What rules buy you', seconds:60,
    kicker:'WHAT RULES BUY YOU', heading:'WHAT YOU CAN DO WITH RULES',
    items:[
      ['PASSKEYS','Sign in with Face ID or a fingerprint. A verifier contract checks the P-256 signature.'],
      ['SCOPED KEYS','Give an app a key for one contract and a few functions, until an expiry.'],
      ['SPENDING CAPS','Attach a limit, like 2 XLM a day. The account enforces it on every transfer.'],
      ['RECOVERY','Guardians or a recovery kit, set up before you need them. It’s opt-in.'],
      ['SPONSORED START','Someone else pays to create the account and submit for it. Nido does on testnet.'],
      ['ONE ADDRESS','Add or remove devices and app keys by changing rules. The address stays.'],
    ],
    script:`So what does that get you?

Passkeys. A passkey signs with the P-256 curve, which a classic account can't verify. A contract account can, through a WebAuthn verifier contract. The fingerprint check happens on the device; the chain only sees a signature.

Scoped keys and spending caps are the two your app will use most: a key that can only call your contract, only until tomorrow, and can't move more than two XLM a day. The account checks that on every call, not your frontend.

Then the account-level features: recovery through guardians, someone else paying to create the account, and adding or removing devices without changing the address.`,
    sources:[perch('crates/perch-webauthn-verifier/src/lib.rs'), perch('crates/perch-ir/src/doc.rs'), perch('crates/perch-spending-limit/src/lib.rs'), perch('docs/recovery/README.md'), nido('infra/relayer/README.md')]},
  { layout:'demo', title:'The trade-offs', seconds:75,
    kicker:'WHAT IT COSTS', heading:'THE TRADE-OFFS', labels:['COMPATIBILITY','COST','MATURITY'], bodies:['No classic operations; no Horizon account record','Rent for the account and for every rule','Testnet only, not audited, forked dependencies'],
    left:{title:'WHAT NIDO’S\nRELAYER PAYS', body:'Account: about 1.4 XLM\nFirst grant: about 4.5 XLM\nCapped grant: about 2.7 XLM', note:'One 100 XLM/day pot for all of testnet'},
    script:`Now what it costs, so you can decide with your eyes open.

Compatibility. A C-address can't be the source of a classic operation, and Horizon doesn't know it exists, so you read balances from the token contract over RPC. A lot of tooling, exchanges included, still assumes G-addresses.

Cost. The account is contract storage, so it pays rent, and so does every rule you add. On testnet, Nido's relayer pays for you, out of one pot of a hundred XLM a day shared by everyone. When we measured on the twenty-second, an account cost about 1.4 XLM, an app's first grant 4.5, and a capped grant 2.7. That's roughly twenty grants a day for the whole network, so a full room can drain it. More on that in a minute.

Maturity. Perch and Nido run on testnet only and aren't audited yet, and Nido's revoke button doesn't work yet. Fine for a hackathon; don't put real money on it.`,
    sources:[report+' §3', team('hk-ai-claude'), nido('docs/ADD-NIDO-TO-DAPP.md'), perch('docs/audit-scope.md'), nido('docs/MAINNET_READINESS.md')]},

  // ── Perch and Nido ────────────────────────────────────────────────────
  { layout:'code', title:'Perch: a rule you can read', seconds:60,
    kicker:'PERCH · THE POLICY LAYER', heading:'PERCH: A RULE YOU CAN READ', lang:'json',
    code:'{\n  "name": "kudos-xlm",\n  "scope": { "type": "contract", "address": "CDLZ…CYSC" },\n  "principals": { "type": "all", "signers": ["session"] },\n  "functions": ["transfer"],\n  "cap": { "limit": "20000000", "period-ledgers": 17280 },\n  "not-after-ledger": 5342393\n}',
    caption:'Perch compiles the account’s document on chain; the account enforces it in __check_auth.',
    script:`The rules live in Perch, a policy layer for Soroban smart accounts, built on OpenZeppelin's account contracts. An account's whole authorization is one JSON document: its signers, its rules, and optional recovery. The document is canonical, so the account stores its hash and anyone can check it.

This is a real rule from the demo. It covers one contract, the XLM token, and applies to the app's session key. It allows one function, transfer, capped at two XLM per 17,280 ledgers, which is about a day. And it stops working after a given ledger.

Perch compiles that on chain, and the account checks it in check-auth on every call. Anything the rules don't allow is denied.`,
    sources:[perch('README.md'), perch('CANONICAL.md'), perch('docs/schema.md'), perch('crates/perch-doc-compiler/src/lib.rs'), example]},
  { layout:'topicRight', title:'Nido', seconds:40,
    kicker:'THE WALLET', heading:'NIDO', big:true,
    body:'A passkey wallet in which every account is a Perch account.\nOne passkey creates a C-address with 5 test XLM; Nido’s relayer pays.\nYour app finds it in Stellar Wallets Kit.',
    footnote:'test.nido.fyi · testnet',
    script:`Nido is the wallet your users see, and every Nido account is a Perch account. You go to test.nido.fyi, approve with your face or fingerprint, and you have a C-address on its own subdomain, created and funded with five test XLM by Nido's relayer.

For your app, Nido sits in Stellar Wallets Kit next to the other wallets. You can ask it to connect, to sign one transaction in a popup, or to approve a scoped session for your app. You'll need the last one, and here's why.`,
    sources:[nido('README.md'), nido('docs/ADD-NIDO-TO-DAPP.md'), nido('infra/relayer/README.md')]},
  { layout:'code', title:'Finding: the popup and your contract', seconds:60,
    kicker:'FOUND ON TESTNET', heading:'NIDO’S POPUP CAN’T SIGN\nFOR YOUR CONTRACT', lang:'trace',
    code:'game.guess(3, CAXS…)                     // the app’s call\n→ CAXS…::__check_auth(signatures, contexts)\n    contexts: guess, xlm.transfer        // two calls\n    context_rule_ids: [0]                // one rule: "admin"\n→ Error(Contract, #3014) ContextRuleIdsLengthMismatch',
    caption:'A call into one contract fails with #3002 instead. Either way the fix is a session.',
    script:`This is what surprised us most. Today, your app can't use Nido's signing popup to call your own contract.

The popup signs under the account's admin rule, and admin only covers calls on the account itself. Our sample game asked the account to authorize a guess, which also moves one XLM. The account got two calls and one rule that covers neither, and refused with 3014. A call into a single contract fails the same way, with 3002.

So instead, your app asks once for a session. The app makes its own key, and the owner approves one Perch rule for each contract the call touches. After that the app's key signs, and the account checks every call against those rules.`,
    sources:[template, nido('packages/frontend/src/lib/walletSign.ts'), ozFork, team('hk-hu-noscaffold')],
    cue:'Slow down here; the rest of the talk builds on this.'},

  // ── The walkthrough ───────────────────────────────────────────────────
  { layout:'topicLeft', title:'An agent builds Kudos Jar', seconds:40,
    kicker:'A TEST RUN', heading:'AN AGENT BUILT\nKUDOS JAR',
    body:'We gave a coding agent the template and one prompt: build a small smart account app, live on testnet.\nIt built Kudos Jar: tip a team in XLM, up to 2 XLM a day, with a public tally.\nIt ran with a real Nido account and a virtual passkey.',
    script:`To check all of this end to end, we gave a coding agent the template and one prompt: build a small app that shows off a smart account, with passkey sign-in and a limited action, live on testnet.

It built Kudos Jar. You tip a hackathon team in XLM, and there's a public tally. It wrote and tested the contract, deployed it, built the React board, and then ran the whole flow with a real Nido account. It used a virtual passkey in an automated browser, since an agent doesn't have a fingerprint.`,
    sources:[example, log]},
  { layout:'demo', title:'Approve the rule', seconds:45,
    kicker:'APPROVE ONCE', heading:'APPROVING THE RULE IN NIDO', labels:['SCOPE','CAP','EXPIRY'], bodies:['Only transfer, only on the XLM token','Up to 2 XLM a day','About 24 hours, then it stops'],
    image:{file:'08-grant-xlm-cap.png', crop:{left:.41,top:.45,right:.23,bottom:.30}, alt:'Nido grant page: only transfer on the XLM contract, up to 2 XLM per day, expires in 24 hours'},
    caption:'Nido’s grant page, before the passkey',
    script:`After you connect, the app asks once: may it call tip on the jar, and move up to two XLM a day, for twenty-four hours? A tip touches two contracts, the jar and the XLM token, so that's two rules and two passkey confirmations.

Both happen on Nido's page, not in the app. Nido shows the contract, the function, the cap and the expiry. The owner confirms with the passkey, Nido applies the new policy document, and the browser goes back to the app. The app never touches the passkey.`,
    sources:[example, nido('packages/frontend/src/pages/security/delegate-doc/index.astro')]},
  { layout:'demo', title:'Tip until the cap', seconds:55,
    kicker:'TIP UNTIL THE CAP', heading:'FOUR TIPS, THEN A REFUSAL', labels:['NO PROMPTS','THE CAP','WHO SAID NO'], bodies:['Four tips, each confirmed on chain','A fifth would pass 2 XLM for the day','The account, with error #3221'],
    image:{file:'10-tips-and-refusal.png', crop:{left:.18,top:.28,right:.18,bottom:.11}, alt:'Four confirmed tips and a fifth refused by the spending cap'},
    caption:'Live testnet, 22 Oct 2026',
    script:`Then you tap a team, and the tip goes through. No popup, no prompt. The app's key signs inside the account's authorization entry, the account checks its rules, and the transaction confirms. Four taps, two XLM, four transaction hashes you can look up.

The fifth tap would push the day's total past two XLM. The app didn't block it; the account did. Its spending-limit policy refused with error 3221, and the app turns that into a sentence.

That's the point of a C-address. The limit isn't something the app promises to respect. The account enforces it.`,
    sources:[example, explorer('cd9dfaefb145bd56d6239b1bd3ce8fa12eb5ca10bdee317d6b53e0012e043c1f'), explorer('567a9a60e2e8d91c33e8dd3cac0f4349ce173b5c8c7a2dd401628b0ad94790ec')],
    cue:'Pause on the red line before reading it.'},

  // ── Building your own ─────────────────────────────────────────────────
  { layout:'demo', title:'When a grant doesn’t confirm', seconds:75,
    kicker:'WHEN IT GOES WRONG', heading:'WHEN A GRANT DOESN’T CONFIRM', labels:['429 · BUDGET USED UP','503 · RELAYER BUSY','504 · TIMED OUT'], bodies:['Nothing was sent. Wait, or pay your own fee','Nothing was sent. Retry in a moment','It may have landed. Check, then retry'],
    left:{title:'CHECK THE CHAIN\nBEFORE YOU RETRY', body:'Go back to the app, press Check again:\nit reads the account’s rules on chain.\nNothing there? Ask Nido again.', note:'A timeout can follow a success'},
    script:`Most talks skip the failure cases, so here's ours. In the dry run, Nido's relayer ran out of budget partway through, and every team hit it. Nido's page showed the same message for three different failures: it couldn't confirm what happened, and retrying might pay twice.

A 429, FEE_LIMIT_EXCEEDED, means the shared budget is gone and nothing was sent. A 503, POOL_CAPACITY, means the relayer is busy; nothing was sent, try again shortly. A 504 is the tricky one: one team's grant timed out and had landed anyway.

So check the chain before you retry. Go back to the app and press Check again; the template reads the account's rules on chain. If nothing landed, ask Nido again. That can't pay twice.

And when the budget's gone: the passkey signs the grant, not the fee payer, so any funded key can submit it. The template already does that for about a quarter of an XLM. Nido's page doesn't offer it yet.`,
    sources:[report+' §3, §5.2 N-A2, N-H1', template+' (When Nido’s relayer says no)', tpl('CHANGELOG.md'), team('hk-hu-codex'), selfRelay, session]},
  { layout:'points', title:'Patterns that worked', seconds:85,
    kicker:'WHAT SIX TEAMS BUILT', heading:'PATTERNS THAT WORKED',
    intro:'Six AI-driven teams, two hours each on testnet. All six prototypes worked.',
    items:[
      ['A CAPPED PAYMENT','Tips or purchases: one rule on your contract, one on the token with a cap.'],
      ['NO MONEY MOVES','Tickets, a poll, a guestbook: one rule on your contract and no cap.'],
      ['SHARED FUNDS','A contract holds the pot and pays out when 2 of 3 members approve.'],
      ['LIMITS THEY CAN’T UNDO','A cap limits a key, not the owner. Put allowances and time locks in a contract.'],
    ],
    script:`Before today we ran a dry run: six teams, all driven by AI, three as coding agents and three simulating a person working from these slides. Two hours each, on testnet. All six prototypes work, and four patterns came out of them.

A capped payment, like Kudos Jar: one rule on your contract, and one on the token with the cap.

Nothing moves: event tickets, a one-question poll, a guestbook. One rule on your contract, with no cap. Nido makes the owner accept "no cap" explicitly, and the app's key pays the fees. The template's blank starter is this pattern.

Shared funds: Group Pot keeps the money in its own contract and pays an expense when two of three members approve, each with their own Nido account.

And limits the user shouldn't be able to undo. A cap limits a key, not the account's owner, who can always change the rules. So Pocket Money keeps a teen's allowance in a vault the parent owns. Time locks are the same: an expiry stops a key, it doesn't delay a withdrawal, so Goalpost puts its unlock date in the contract.`,
    sources:[report+' §2, §5.1 D-H2', template+' (patterns that work)', team('hk-ai-claude'), team('hk-ai-sonnet'), team('hk-ai-codex'), team('hk-hu-codex'), team('hk-hu-template'), team('hk-hu-noscaffold')]},
  { layout:'code', title:'The part you write', seconds:65,
    kicker:'YOUR APP', heading:'THE PART YOU WRITE', lang:'ts',
    code:'// One grant per contract in the call’s env.auths()\nconst grants: Grant[] = [\n  { target: myContract.options.contractId, functions: ["my_fn"],\n    duration: "24h", label: "my-app" },\n]\n// Inside <SessionGate grants={grants}>, on click:\nconst { result, hash } = await submitCall(address, (publicKey) =>\n  myContract.my_fn({ user: address }, { publicKey }))',
    caption:'Keep require_auth first in your contract function. submitCall signs with whatever the user connected.',
    script:`So what's yours to write? Two things.

First, the grants. A Nido account approves one grant per contract it authorizes in a call. To find them, call your function in a unit test and look at env.auths(): every contract in that list is a grant. Usually that's your contract, plus the token if the call moves the user's money. Keep require_auth at the top of your function, or simulation refuses the authorization.

Second, the call. Inside a SessionGate that asks for those grants, submitCall is the whole call site. It builds the call, signs with whatever the user connected, whether that's a classic wallet, the session key or Nido's popup, and gives you back the result and the transaction hash.`,
    sources:[template+' (Your own contract in five steps; Calling a contract from React)', tpl('scripts/blank/contracts/check-in/src/test.rs'), tpl('app-lib/wallet.ts'), tpl('app/src/components/SessionGate.tsx'), report+' §5.1 D-H1, D-A2, D-A4']},
  { layout:'topicRight', title:'Start from the template', seconds:35,
    kicker:'QUICK START', heading:'START FROM THE TEMPLATE',
    body:'github.com/nidohq/scaffold-template\nIts quick start, template/NIDO.md, takes a fresh copy to a deployed contract and a running app.\nAGENTS.md has the same rules, written for coding agents.',
    footnote:'Testnet only. Throwaway keys only.',
    script:`You don't need to remember any commands from this talk. The template is at github.com/nidohq/scaffold-template. The quick start in its NIDO.md takes you from a fresh copy to a deployed contract and a running app. From a clean copy to a first confirmed call took us about six minutes, most of it waiting on testnet.

The same file covers the relayer errors, and AGENTS.md has the same rules written for your coding agent.`,
    sources:[publicRepo, template+' (Quick start; Verified live on testnet)', agents]},
  { layout:'next', title:'Your first smart account app', seconds:40,
    kicker:'KEEP BUILDING', heading:'YOUR FIRST SMART ACCOUNT APP', body:'Find the one thing your app does\nfor a user, and the rule that limits it.', links:'test.nido.fyi  ·  testnet\ngithub.com/nidohq/scaffold-template\ngithub.com/stellar-registry/perch',
    script:`So, for your project: find the one thing your app does on a user's behalf, write down the rule that should limit it, and let the account enforce that rule. Ask for it once, in plain words, and then stay out of the user's way.

Nido is the wallet, Perch is the policy layer, and the template gets you a working start. The QR code opens Nido on testnet. Thanks, and I'm happy to take questions.`,
    sources:['https://test.nido.fyi', publicRepo, nido('README.md'), perch('README.md')],
    cue:'Leave this slide up for questions; the appendix follows.'},

  // ── Appendix: backup for questions ────────────────────────────────────
  { layout:'bigIdea', title:'Appendix', seconds:20, appendix:true,
    kicker:'APPENDIX', heading:'BACKUP\nSLIDES', subtitle:'Perch in depth, the rest of the walkthrough, and what broke',
    script:`Backup slides for questions: Perch in depth, what an app can ask Nido for, the rest of the Kudos Jar walkthrough, what the agent tripped on, and findings for the Nido team.`,
    sources:[]},
  { layout:'topicLeft', title:'One document, one hash', seconds:55, appendix:true,
    kicker:'POLICY DOCUMENTS', heading:'ONE DOCUMENT,\nONE HASH',
    body:'A policy is signers, rules and optional recovery, as canonical JSON. The account stores its hash.\nAnyone can fetch the document, hash it, and compare it with the chain.\napply_doc is the only way to change an account’s authorization.',
    script:`A Perch policy is one JSON document: a list of signers, a list of rules, and optionally recovery. It's written in a canonical form, so the same document always produces the same bytes, and the account stores its hash.

That means anyone can fetch the applied document, hash it, and check it against the chain. Nido's policy page does exactly that.

And there's one way to change an account's authorization: apply a new document. Adding a device, granting an app, removing a key: each is a document update, signed under the account's admin rule.

Each rule says who may sign, which contract it covers, which functions, until which ledger, and optionally how much may move.`,
    sources:[perch('CANONICAL.md'), perch('crates/perch-smart-account/src/lib.rs'), perch('crates/perch-account/src/lib.rs')]},
  { layout:'points', title:'From document to enforcement', seconds:55, appendix:true,
    kicker:'HOW IT RUNS', heading:'FROM DOCUMENT TO ENFORCEMENT',
    items:[
      ['THE COMPILER IS A CONTRACT','The account sends its document to Perch’s doc compiler, so compiling happens on chain.'],
      ['RULES BECOME CONTEXT RULES','Each rule lowers onto an OpenZeppelin context rule; a cap adds the spending-limit policy.'],
      ['CONSTRAINTS ARE PROGRAMS','Rules with constraints get a small program for Perch’s interpreter.'],
      ['EVERY CALL IS CHECKED','The named rule’s scope, expiry, signers and every policy must pass. Anything undecodable is denied.'],
    ],
    script:`How does a document turn into enforcement?

You write the document, or a wallet writes it for you. The account sends it to Perch's doc compiler, which is itself a contract, so compilation happens on chain. The compiler lowers each rule onto an OpenZeppelin context rule. Simple rules need nothing more than OpenZeppelin's own signer check. Rules with constraints get a small program for Perch's interpreter, and a cap attaches OpenZeppelin's spending-limit policy next to it.

Then, on every authorization, the account picks the rule the signature names, checks scope and expiry, verifies the signers, and runs every attached policy. All of them must pass. The interpreter denies by default: if anything can't be decoded, the answer is no.`,
    sources:[perch('crates/perch-doc-compiler/src/lib.rs'), perch('crates/perch-interpreter/src/lib.rs'), perch('crates/perch-spending-limit/src/lib.rs')]},
  { layout:'points', title:'Verifiers', seconds:55, appendix:true,
    kicker:'WHO MAY SIGN', heading:'VERIFIERS',
    items:[
      ['ED25519','Classic keys, checked by a verifier contract.'],
      ['WEBAUTHN','Passkeys on P-256. Nido’s admin key is one.'],
      ['DELEGATED','Any G or C address, authenticated by the host through CAP-71. The demo’s session key is one.'],
      ['NOT BUILT YET: ML-DSA','A post-quantum scheme, on Perch’s roadmap as one more verifier contract.'],
    ],
    script:`Who can sign for a Perch account? Three kinds of signer today.

Ed25519, the classic key type, checked by a verifier contract. WebAuthn, for passkeys on the P-256 curve, also a verifier contract; Nido uses it for the account's admin key. And delegated signers: any G or C address, authenticated by the host inside the account's own authorization entry, using CAP-71 from protocol 27. That's what the demo app's session key is.

Because verifiers are contracts, new signature schemes can be added without changing accounts. ML-DSA, a post-quantum scheme, is on Perch's roadmap as exactly that kind of verifier. It isn't built yet, so treat it as a direction, not a feature.`,
    sources:[perch('crates/perch-ed25519-verifier/src/lib.rs'), perch('crates/perch-webauthn-verifier/src/lib.rs'), perch('docs/recovery/cap-0071.md'), perch('docs/slides/index.html')]},
  { layout:'topicRight', title:'Constructorless publishing', seconds:55, appendix:true,
    kicker:'CONTENT-ADDRESSED PUBLISHING', heading:'CONSTRUCTORLESS',
    body:'Perch’s shared contracts deploy with no constructor arguments.\nEach address is a function of the registry and the wasm hash.\nAccounts pin them by hash, so no admin can repoint them.',
    footnote:'Account upgrades wait about 7 days',
    script:`Perch's shared contracts, the compiler, the interpreter, the verifiers and the spending limit, are published through a Stellar Registry instance that deploys them only one way: no constructor arguments, with the hash of the wasm as the deploy salt. So each contract's address is a pure function of the registry and the code.

An account build pins its compiler, interpreter and spending limit by hash at build time, so no admin setting can point your account at different code later.

If the account itself needs new code, that goes through a scheduled upgrade with a delay of about seven days, which the owner can cancel.`,
    sources:[perch('crates/perch-constructorless-registry/src/lib.rs'), perch('AGENTS.md'), perch('docs/deploy/README.md')]},
  { layout:'topicLeft', title:'Accounts and factories', seconds:55, appendix:true,
    kicker:'ACCOUNTS', heading:'ACCOUNTS AND\nFACTORIES',
    body:'Rule 0, admin, covers calls on the account itself, including apply_doc: full owner authority.\nPerch’s factory derives the address from the admin signers.\nNido’s factory reserves the address before the passkey exists.',
    script:`Every Perch account starts with one rule, admin, created by its constructor. Admin is scoped to the account itself, which sounds narrow, but it covers apply-doc and execute, so it's full owner authority. Every other rule arrives later in a document.

Accounts come from factories. Perch's own factory derives the address from the admin signers, so an address commits to who controls it.

Nido runs its own factory, for a practical reason: a passkey is bound to a web origin, and Nido gives every account its own subdomain, so the address has to exist before the passkey. Nido reserves it with a one-time setup key, then binds the passkey, and its relayer pays for the deployment.`,
    sources:[perch('crates/perch-account/src/lib.rs'), perch('crates/perch-account-factory/src/lib.rs'), nido('DEPLOYED.md'), nido('contracts/factory/src/contract.rs')]},
  { layout:'points', title:'What an app can ask Nido for', seconds:45, appendix:true,
    kicker:'THE DAPP INTERFACE', heading:'WHAT AN APP CAN ASK NIDO FOR',
    items:[
      ['CONNECT','The account’s C-address, and nothing else.'],
      ['SIGN ONE TRANSACTION','A passkey popup. Nido’s relayer submits and returns the hash. Calls on the account only.'],
      ['A SCOPED SESSION','The app holds a key; the owner approves a rule for it once.'],
      ['NOT THE ACCOUNT ITSELF','Recovery, devices and policies stay in Nido’s own pages.'],
    ],
    script:`From an app's point of view, Nido shows up in Stellar Wallets Kit next to the usual wallets, and you can ask it for a few things.

Connect, which gives you the account's address and nothing else. Sign a transaction, in a popup, with the passkey; Nido's relayer submits it and hands you back the hash. Or a scoped session: the app holds a key, and the owner approves a rule for it, once. Everything about the account itself, recovery, devices and policies, stays in Nido's own pages.

The popup can only sign calls on the account itself, which is why apps use a session for their own contracts.`,
    sources:[nido('docs/ADD-NIDO-TO-DAPP.md'), nido('packages/stellar-wallets-kit-module/src/module.ts'), nido('packages/frontend/src/lib/policy/docRequest.ts')]},
  { layout:'demo', title:'Walkthrough: a passkey account', seconds:35, appendix:true,
    kicker:'WALKTHROUGH · SIGN IN', heading:'A PASSKEY ACCOUNT', labels:['RESERVE','ONE PASSKEY','FUNDED'], bodies:['The C-address exists first','Bound to the account’s subdomain','5 test XLM, fees sponsored'],
    image:{file:'01-nido-create-passkey.png', crop:{left:.34,top:.13,right:.34,bottom:.12}, alt:'Nido asking to create the account passkey for CBP72A…Z46QCJ'},
    caption:'test.nido.fyi on testnet',
    script:`The walkthrough starts on Nido. Nido reserves the account's address first, here CBP7-something, and then asks for a passkey, which gets bound to that address's own subdomain.

One ceremony, and the relayer deploys the account and funds it with five test XLM. The person never needed XLM, a seed phrase or a browser extension. It took a minute or two, most of it waiting for the network.`,
    sources:[example, nido('packages/frontend/src/pages/new-account/index.astro')]},
  { layout:'demo', title:'Walkthrough: connect and ask once', seconds:40, appendix:true,
    kicker:'WALKTHROUGH · CONNECT', heading:'CONNECT, THEN ASK ONCE', labels:['PICK NIDO','THE ACCOUNT','ONE REQUEST'], bodies:['From the usual wallet list','C-address and its XLM balance','Two rules, two confirmations'],
    image:{file:'06-session-gate.png', crop:{left:.17,top:0,right:.17,bottom:.02}, alt:'Kudos Jar connected to a Nido account, asking to approve a session'},
    caption:'Kudos Jar, running locally',
    script:`Next, in the app. Connect, choose Nido from the regular wallet list, and pick the account. The app now knows the C-address and reads its balance from the XLM token contract.

Then it asks one thing up front, in plain words: may this app call tip on the jar, and move up to two XLM a day from your account, for twenty-four hours? A tip touches two contracts, the jar and the XLM token, so that's two rules and two passkey confirmations.`,
    sources:[example, board]},
  { layout:'demo', title:'Walkthrough: the policy afterwards', seconds:30, appendix:true,
    kicker:'AFTERWARDS', heading:'THE ACCOUNT’S POLICY', labels:['DOCUMENT','RULES','KEYS'], bodies:['Hash checked against the chain','admin, kudos-tip, kudos-xlm','A passkey and the app’s key'],
    image:{file:'11-nido-policy.png', crop:{left:.41,top:.08,right:.23,bottom:.38}, alt:'Nido policy page showing the verified document and its rules'},
    caption:'Nido’s policy page',
    script:`Afterwards, the account's policy page in Nido shows the document: its hash, checked byte for byte against the one stored on chain, the two signers, the passkey and the app's key, and the three rules.

When the rules expire, the app's key stops working, and nobody has to remember to clean anything up.`,
    sources:[example, nido('packages/frontend/src/lib/policyChainFetch.ts')]},
  { layout:'code', title:'Walkthrough: the call site', seconds:45, appendix:true,
    kicker:'THE REACT CALL SITE', heading:'KUDOS JAR’S CALL SITE', lang:'ts',
    code:'const tx = await kudosJar.tip(\n  { from: address, team: team.id, amount: 5_000_000n },\n  { publicKey: transactionSource(address) },\n)\nconst { result } = await submitContract(tx, address)',
    caption:'transactionSource and submitContract come from the template’s app-lib. submitCall now does both in one call.',
    script:`The code is short. The generated client builds the tip call. transactionSource keeps the C-address out of the transaction source, because a contract can't be one.

submitContract does the rest. For a classic wallet it signs and sends as usual. For a Nido account with an approved session, the app's key signs a CAP-71 entry that names the right rule for each contract, submits it, and returns the confirmed result.

Both helpers come from the template's app-lib, not the Stellar SDK. Kudos Jar predates submitCall, which now wraps these steps in one call.`,
    sources:[board, session]},
  { layout:'points', title:'What the agent tripped on', seconds:65, appendix:true,
    kicker:'FIXED IN THE TEMPLATE', heading:'WHAT THE AGENT TRIPPED ON',
    items:[
      ['A SILENT OLD TOOL','A global Scaffold too old for the config compiled contracts and wrote no clients. The template now installs its own.'],
      ['A BLOCKED POPUP','The app simulated before opening Nido’s popup, and the browser forgot the click. The popup is now reserved during the click.'],
      ['THE WRONG PATH, TWICE','First popup signing, then a contract that skipped require_auth. AGENTS.md now says both.'],
    ],
    script:`What got in the way, and what we changed.

A silent tool. The globally installed Scaffold was too old for the template's config, and it failed silently: it compiled the contracts and wrote no clients. The template now installs its own tested Scaffold with tools-colon-scaffold and refuses an older one. A fresh client also brought its own copy of the Stellar SDK, which broke types, so there's a script that folds it back in.

A blocked popup. The app built and simulated the call before opening Nido's popup, and by then the browser had forgotten the click. The template now reserves the popup during the click.

And the wrong path twice: first the popup signing we just saw, then a contract that skipped require-auth to save a rule, which simulation refuses. The agent's instructions file now says both.`,
    sources:[log, template, agents]},
  { layout:'points', title:'Upstream findings', seconds:55, appendix:true,
    kicker:'FOR THE NIDO TEAM', heading:'FOUND ALONG THE WAY',
    items:[
      ['NIDO’S SIGNER','Signs under the admin rule only, so it can’t authorize calls into apps.'],
      ['NIDO’S RELAYER','Can’t relay CAP-71 entries yet, so session keys pay their own fees.'],
      ['NIDO’S DOCS','Still say the wallet returns signed XDR; it now submits and returns a hash.'],
      ['FROM THE DRY RUN','Say why the relayer refused, and let the app pay its own fee. The template’s half is ready.'],
    ],
    script:`A few findings belong upstream, and we've written them up.

Nido's signer, as we saw, signs only under the admin rule. Nido's relayer can't yet decode the CAP-71 entries that its own session grants produce, so the demo's session key pays its own fees. And Nido's integration guide still says the wallet returns signed XDR for the app to submit; the code now submits and returns a hash, and the template handles that.

The dry run added two more for Nido: tell the app why the relayer refused, and let it pay its own fee when the budget is gone. The template's half of both is ready; the feedback report has the full list.`,
    sources:[log, report+' §5.2, §6', nido('docs/ADD-NIDO-TO-DAPP.md'), nido('packages/stellar-wallets-kit-module/README.md')]},
];

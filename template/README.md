# Scaffold Stellar + Nido passkey accounts

A React app template for Stellar smart contracts where people sign in with a
passkey. Nido smart accounts sit in the wallet picker next to the usual wallets,
and the template carries what a smart account needs to use your contracts:
session keys the owner approves once, the calls signed with them, and the
screens that ask. Built on
[Scaffold Stellar](https://github.com/stellar-scaffold/cli). Testnet only.

- **Building an app?** Read [`NIDO.md`](NIDO.md): the quick start, your own
  contract in five steps, the call pattern, the rules a Nido account follows,
  and what to do when Nido's relayer says no.
- **A coding agent?** Read [`AGENTS.md`](AGENTS.md): the same rules, shorter.

The quickest path, from this checkout:

```sh
npm run new-app -- ../my-app --blank
```

and follow what it prints. `npm run doctor` in the new app says what is missing
and how to fix it.

[License](LICENSE) · [Security](SECURITY.md) ·
[Code of conduct](CODE_OF_CONDUCT.md)

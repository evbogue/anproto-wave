# Collaboration checkpoint — 30 October 2026

## Revision and scope

Base commit: `4a8e59028e73e9c13609e8a1e6ce85d1074a42a7` (Establish collaborative Wave foundation and publishing direction). This checkpoint describes that base plus the preserved Archive/Restore and documentation checkpoint; the base commit alone does not contain Archive/Restore or these reconciled documents. No release or deployment is recorded here.

Preserved changes include Archive controls in `app.js`, `index.html`, and `store-v2.js`, their browser acceptance coverage, workflow/product documentation, and verification images. No original signed records, participant preferences, or unfinished implementation were removed. The checkpoint is preserved together in Git. Locate its commit with `git log -1 -- CHECKPOINT.md`; retain the associated code, browser coverage, documentation, and images together.

## Resume locally

Run `npm start` from this directory and open <http://127.0.0.1:8098>. Use independent browser profiles for Alice and Bob, copy their public keys, and create a Wave containing both editor keys. Keep the same origin. The relay uses `.wave-data/`; production dependencies are vendored.

The demo supports shared text, message/passage replies, signed history, profiles, offline edits, reconnect, public export/import, and personal Collapse Wave / Archive / Restore. All conversation records are public and unencrypted; editors are fixed at creation. Browser-stored signing keys are not backed up by public exports. Archive preferences are per identity and browser origin and never enter public exports or relay traffic.

## Checks observed on 30 October

- `npm test`: 13 passed, 0 failed, including durable relay restart and invalid-orphan recovery.
- `npm run test:browser`: passed using installed Chrome and external Playwright, independent browser contexts, and a temporary loopback relay store. The harness measured 796 ms for remote edit display.
- Archive acceptance covered save-before-collapse, unfinished composer protection, storage failure, reload, incoming activity, share links, import, independent identities, and both restore controls.
- Refreshed screenshots: Alice, Bob, narrow conversation, and Archive. The narrow conversation and Archive images were visually inspected and were legible at 390px; the harness also checked document overflow.
- `git diff --check`, syntax checks for the Archive implementation/browser harness, and local file-link checks across the active documentation passed.
- Loopback binding is blocked in the restricted sandbox (`EPERM`); relay and browser checks passed with execution outside that sandbox.

Browser command used:

```sh
PLAYWRIGHT_MODULE=/Users/evbogue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:browser
```

Supply your own Playwright `index.mjs` path on another machine. Chrome must be installed, or set `CHROME_PATH`. The harness refreshes files in `verification/`.

Historical benchmark and legacy-browser results remain dated in [VERIFICATION.md](VERIFICATION.md); they were not rerun for this checkpoint.

## Remaining work and handoff

Encryption, dynamic membership, announcements, publication snapshots, reader discussion, and independent infrastructure remain planned. Follow/read/search, playback, revision restoration, rich message content, and automated contributors also remain planned. Existing performance, identity-recovery, input, and history-growth limits are listed in [VERIFICATION.md](VERIFICATION.md).

Wave remains secondary while the Wiredove/evbogue.com interactive timeline milestone proceeds. On returning, start with the encryption/access specification gate in [ROADMAP.md](ROADMAP.md), then implement its smaller slices. Preserve the policy that a participant may release content they can access without additional author approval. Publication selections must identify exact revisions.

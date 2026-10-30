# Verification

## Current checkpoint — 30 October 2026

The current working tree passed `npm test` (13 passed, 0 failed) and the Chrome/Playwright browser acceptance harness with two independent identities and a temporary loopback relay store. Remote edit display measured **796 ms**. Relay and browser checks required execution outside the restricted sandbox because loopback binding there failed with `EPERM`.

Archive checks covered save-before-collapse, unfinished composers, storage failure, reload, incoming activity, share-link handling, import, identity isolation, and both restore controls. The harness refreshed the Alice, Bob, narrow, and Archive screenshots; the narrow and Archive layouts were visually inspected. No encryption or publication guarantees are implemented.

[CHECKPOINT.md](CHECKPOINT.md) records the base revision and preserved checkpoint changes, reproduction command, limitations, and handoff. The sections below preserve historical results; benchmarks and the separate legacy-browser smoke check were not rerun on 30 October.

## Wave collapse and Archive — 16 October 2026

The public v2 viewer now supports **Collapse Wave**, a personal Archive, and explicit restoration. [WORKFLOW.md](WORKFLOW.md) defines the full lifecycle and identifies which publishing stages remain planned.

`npm test`: **13 passed, 0 failed**. `npm run test:browser`: **passed** using Chrome and Playwright. The acceptance harness checks collapse while editing offline, local save before removal, retention after reload, incoming remote activity, share-link handling, import without restoration, isolation between local identities and independent browsers, restoration through both controls, and preservation of passage replies. An unfinished composer blocks collapse without losing its text. A simulated archive-storage failure leaves the Wave visible.

The archive check uses isolated browser contexts and a temporary relay store. Archive membership remains local to the identity and browser; it is excluded from public record exports. Encryption and publishing are not implemented by this change.

The [Archive screenshot](verification/archive.png) shows the collapsed Wave retained in an expanded Archive at a 390px viewport. Conversation screenshots below were refreshed for this change. The narrow conversation and Archive layouts were visually inspected.

## Collaboration foundation — 15 October 2026

The signed v2 collaboration foundation passed automated and browser acceptance checks after alignment with the project's plain-HTML direction. The browser pages use native controls and structural CSS. The review covered the editor, reducer, persistence, relay, legacy viewer, fixtures, and documentation. The legacy viewer's instructions now describe its read-and-export behavior.

The browser harness used bundled Playwright and installed Chrome, two independent signing identities and storage contexts, and a temporary loopback relay store. Production dependencies remain included in the repository. This run verifies the public, fixed-membership collaboration foundation. Encryption, publication, and audience-access acceptance criteria are specified in [PUBLISHING.md](PUBLISHING.md) and [ROADMAP.md](ROADMAP.md) for the next milestone.

## Automated verification

`npm test`: **13 passed, 0 failed**.

- Original v1 signed-record/conflict/export verification remains passing.
- V2 evaluates all 120 delivery permutations of the root/thread/blip/two-concurrent-inserts fixture, including duplicate delivery; both insertion runs and emoji survive with identical text.
- An independent valid-fixture reducer constructs atoms from original events, derives causal clocks, and sorts predecessor paths instead of using the production traversal. It agrees on insertion and overlapping-delete/offline fixtures.
- Ordinary cursor insertion, overlapping deletes, delete versus concurrent insertion, Unicode scalar boundaries, deterministic continuations, missing dependencies, unknown fields, malformed Unicode, payload size, unsupported versions, and tampered original bytes are checked.
- Passage anchors exclude edge insertions, include interior insertions, mark partial deletion, and preserve quoted context after full deletion. Wrong quotes and cross-blip targets are rejected.
- Nonmember edits, cross-Wave dependencies, unobserved targets, and unavailable/cyclic-reference attempts do not apply. Invalid multi-operation events cannot partially mutate a blip.
- Relay duplicate handling, durable restart recovery, same-origin write restrictions, private/static-storage isolation, and authenticated ephemeral presence are checked.
- Previously retained invalid orphans cannot block the later arrival of a valid Wave root. Clients quarantine rather than apply those records.

`git diff --check`, JavaScript syntax checks, and local documentation link checks passed.

## Browser acceptance

`npm run test:browser`: **passed** using two isolated contexts and actual UI actions. The harness creates Alice and Bob, includes Bob's key in a fixed participant list, and opens the Wave's share URL in Bob's independent context. It checks:

1. Automatic exchange and editing of a two-paragraph plan without refresh or a Save action.
2. Real DOM passage selection, “Reply here,” inline quoted thread placement, and stable context through edits before the passage.
3. Simultaneous separate edits and same-position insertions with identical final text in both views.
4. Active textarea focus and caret preservation through a remote prefix insertion.
5. Local typing while an already-fetched remote response is deliberately held, demonstrating that applying it does not discard new local input.
6. Composition start/input/end events while another client edits, demonstrating deferral and convergence after composition completes.
7. Offline local edits and automatic reconnect catch-up with retained changes from both clients.
8. Partial and full passage deletion retaining the reply and original quote, with visible removal status.
9. Signed profile-name update, real uploaded PNG avatar processing, and automatic image exchange.
10. Relay restart and browser reload reconstructing text, replies, history, and images.
11. Reload during a transport outage preserving the durable outbox and retrying automatically after recovery.
12. No private key in relay responses and no page errors.
13. A 390px viewport without horizontal document overflow.
14. A 2,000-character deletion split across multiple signed batches, leaving the correct empty text.
15. An oversized paste preserved as an unsigned recoverable draft after reload, and explicit draft discard.

The composition check uses browser-dispatched composition events. Further acceptance work covers physical OS IMEs, unusual Unicode grapheme editing, Safari/Firefox, browser storage exhaustion, and hard power-loss recovery.

The 15 October run measured **792 ms** from a textarea change to its display in the other context, meeting the below-one-second loopback target. The 12 October run recorded 806 ms, with earlier runs ranging from 185 to 832 ms. These measurements describe the local Chrome and loopback setup.

Acceptance screenshots, refreshed on 16 October with the Collapse Wave and Archive controls:

- [Alice](verification/two-client-alice.png)
- [Bob](verification/two-client-bob.png)
- [Narrow layout](verification/narrow.png)

Screenshots capture the completed shared-conversation scenario before the separate large-deletion/draft-recovery checks. The uploaded test avatar is a screenshot-derived verification fixture.

A separate legacy-browser smoke check passed: signed v1 import, history display, reload persistence, read-only controls, and the native stylesheet.

## Replay measurement

`npm run benchmark` creates actual signed records: 503 events (500 edits), 5,500 visible Unicode scalars, **285,662 serialized envelope bytes**. The 15 October replay measurements were **58.7, 60.1, 58.2, 59.0, and 54.3 ms**, all below the 250 ms target. The 12 October measurements were 60.8, 61.7, 58.7, 60.1, and 50.7 ms.

## Operating characteristics and follow-up evidence

| Area | Current behavior | Further work |
| --- | --- | --- |
| Access | Public, unencrypted signed records; fixed editor membership | Encrypted author groups, epochs, recipient grants, and publishing authority |
| Transport | Loopback relay shared by profiles on this computer | Exchange across independent clients and infrastructure |
| Merge evidence | Finite signed fixtures, delivery permutations, and an independent valid-fixture text oracle | Broader generated histories and independent authorization verification |
| History growth | Full-inventory sync, full-file relay replacement, retained tombstones, and causal ancestry replay | Checkpoints and compaction preserving publications, signatures, and passage references |
| Text input | Up to 4,096 UTF-16 units per insertion batch; larger pastes retained as recoverable drafts | Larger-input workflows and richer grapheme editing coverage |
| Editor binding | Prefix/suffix diff turns changes in one idle batch into one contiguous replacement | Finer operations for disjoint replacements, which currently can reinsert unchanged middle characters and affect anchors |
| Durability | Typing becomes durable at its batch save; new messages and replies commit on **Add message** | Composer autosave and broader interruption testing |
| Identity recovery | Signing keys reside in browser storage; clearing site data loses that identity; exports retain public records | Recoverable identity and encryption-key storage with explicit retention policy |
| Conversation depth | Pending dependencies appear as diagnostic counts; nested rendering reaches 50 levels | Richer dependency inspection, playback, restoration, and anchor management |
| Legacy recovery | V1 records remain in their original storage with read-only viewing and public import/export | Preserve this recovery path as the protocol evolves |

These characteristics define the conditions under which the recorded checks apply. Numeric record, transport, operation, and history bounds are specified in [PROTOCOL.md](PROTOCOL.md).

## Publishing acceptance targets

The future publishing integration milestone will demonstrate two authors and an audience member through the full message lifecycle: encrypted collaboration, an optional closed-message announcement, audience discussion, publication with byline and contribution credits, continued private editing, and a published update.

Verification will inspect access at the record and key level as well as the UI. It will cover exact publisher-selected revisions during concurrent typing, recipient-specific releases, public attribution verification, publication-specific passage replies, epoch changes, and offline recovery. Results will be recorded here with their implementation version, test conditions, and measured outcomes.

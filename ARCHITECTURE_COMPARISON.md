# ANProto Wave architecture comparison

Date: 30 September 2026

Decision (2 October 2026): investigate and build an ANProto-specific CRDT for the Wave collaboration needs. Automerge is no longer the intended dependency. The CRDT algorithm and protocol details remain subject to investigation and proof; this decision does not claim the implementation exists.

The comparison below records the earlier evaluation of two implementation work orders for a shared, access-restricted Wave-like messaging system. Both retain ANProto's required portable authorship and integrity guarantees and reuse the same product scope, UI, relay, and acceptance scenario:

- [Work order A: Automerge-backed prototype](IMPLEMENTATION_WORK_ORDER.md)
- [Current work order: ANProto-specific CRDT](CUSTOM_MERGE_WORK_ORDER.md)

These scores record the earlier tradeoff analysis; they do not override the decision above. Neither architecture is implemented. **A score of 5 is strongest**; for cost and risk criteria, 5 means lower cost/risk.

## Weighted decision matrix

Weights reflect the stated product priorities: ANProto portability is mandatory, while reliable live collaboration and a finishable prototype matter most for selecting the merge path. Scores are 1–5. Weighted points are `weight × score`; totals are normalized to 100.

| Criterion | Weight | A: Automerge | B: Custom merge | Why it matters |
|---|---:|---:|---:|---|
| ANProto signature portability and independent verification | 15 | 5 | 5 | Both wrap exact durable contribution bytes in ANProto signatures and can verify them without the relay. |
| Confidentiality and revocation readiness | 20 | 2 | 2 | Neither prototype encrypts records or implements revocation; this is an explicit gap for a truly private product. |
| Concurrent text correctness and edge-case maturity | 17 | 4 | 2 | Automerge supplies a maintained convergence engine; custom merge must establish and validate sequence semantics itself. |
| Anchored replies and stable positions | 10 | 4 | 2 | A can use engine-supported relative positions, subject to validation; B must define anchor behavior over its own element IDs. |
| Fit with Wave event/history model | 8 | 4 | 5 | Both can keep conversation structure explicit; B makes all durable app events native to the application protocol. |
| Relay/reconnect and independent replay | 8 | 4 | 3 | Both use signed records and existing distribution; B must specify dependencies and replay semantics in more detail. |
| Implementation time and likelihood of finishing | 10 | 4 | 2 | A reduces merge-engine work; B adds reducer, ordering, anchor, and long-term compatibility work. |
| Control over wire format, dependencies, and future evolution | 7 | 3 | 5 | B owns the full model; A accepts engine formats, APIs, and a dependency lifecycle. |
| Auditability and ability to explain merge outcomes | 5 | 3 | 4 | B's small rules may be easier to inspect if kept narrow; Automerge behavior may take more effort to explain at the operation level. |
| **Total weighted score** | **100** | **72.6 / 100** | **61.6 / 100** | |

Calculation: A = `15×5 + 20×2 + 17×4 + 10×4 + 8×4 + 8×4 + 10×4 + 7×3 + 5×3 = 363 / 5 = 72.6`. B = `15×5 + 20×2 + 17×2 + 10×2 + 8×5 + 8×3 + 10×2 + 7×5 + 5×4 = 308 / 5 = 61.6`.

## Reading the result

Under the earlier weights, Work order A scored higher because it reduced the uncertainty of concurrent text editing and stable anchors. The decision to build an ANProto-specific CRDT prioritizes an application-owned merge model despite that implementation and correctness burden. The low, equal confidentiality score remains a warning that neither work order alone delivers private, revocable access.

The matrix does not say Automerge provides access control or confidentiality. Both work orders currently assume fixed membership with public data. A private Wave requires a separate, explicit encryption and membership/revocation design, and both architectures must bind any access-control identity to the ANProto signing identity.

## Sensitivity and decision gate

The selected CRDT design must pass the reducer permutation, replay, signed export, and anchor deletion fixtures before full UI work. Investigate the exact event vocabulary, ordering rules, and performance bounds as specified in the [current work order](CUSTOM_MERGE_WORK_ORDER.md). The scores above remain useful for understanding the risk being accepted, not for reopening the dependency choice by default.

Keep the Automerge work order as a documented alternative and source for shared product requirements, not a second production merge path.

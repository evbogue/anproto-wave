# Work order: investigate and build an ANProto-specific CRDT

Drafted: 30 September 2026. Direction selected: 2 October 2026.

Status: chosen direction, pending investigation and proof of the merge model. This is a proposed design, not functionality already implemented. The [earlier Automerge work order](IMPLEMENTATION_WORK_ORDER.md) remains a source for the shared product requirements and acceptance scenario, but its engine-specific instructions are superseded.

## 1. Objective

Build the same recognizable two-person Wave-like conversation described in the [earlier work order](IMPLEMENTATION_WORK_ORDER.md): shared editable blips, live concurrent changes, passage-anchored replies, independent identities, durable history, and reconnect catch-up. Keep ANProto's portable signature and integrity guarantees. Investigate and implement a deliberately narrow, application-owned CRDT carried by signed ANProto events. Use a project-local relay for the first prototype; evaluate APDS and gossip integration separately after the CRDT contract is clear.

Do not make this a generic collaborative JSON engine. Define and implement only the data types required for the first conversation experience. Keep the UI, acceptance scenario, fixed-membership/public-data scope, relay expectations, profile behavior, and handoff deliverables in Work order A unless this document narrows them below.

## 2. Investigation and decision gates

Before implementing the interface, inventory ANProto's existing record, identity, signing, and replication semantics. Write down the exact text and anchor operations this product needs, then evaluate candidate sequence CRDT rules against concurrent typing, deletes, offline edits, replay, bounded event size, and stable passage anchors. Treat the insertion-run design below as a starting hypothesis, not a frozen wire format.

Produce a small pure reducer, a versioned draft protocol, and reproducible fixtures before expanding the app. Require convergence under every tested delivery permutation, deterministic replay from signed records, stable anchors through edits and deletion, and independent verification of exported contributions. Measure event growth and replay cost. If a proposed rule fails ordinary typing or anchor behavior, revise the model and fixtures first. Record the tradeoffs and unresolved cases in `DESIGN.md` and `PROTOCOL.md`; do not claim the CRDT is proven by a working UI alone.

## 3. Core model

The durable source of truth is an append-only set of immutable, ANProto-signed events. Each event has a stable content-derived ID, author key, exact signed payload bytes, schema version, Wave ID, and causal references. A client verifies the original signed bytes before parsing or applying them. An event is not deleted or rewritten to represent a later state; the visible Wave is a deterministic projection of accepted events.

Each author's sequence may reference its preceding ANProto record. A Wave event additionally records causal heads the author had observed. Causality comes from those references, not wall-clock timestamps. Clients may receive events in any order: missing dependencies stay pending, duplicates are idempotent, and replaying the same valid event set must produce the same projection.

The planned relay stores and forwards signed records and content-addressed media. It is not the ordering authority, permission authority, or merge engine. Inspect APDS and Wiredove as read-only references where useful; this repository does not yet have a live relay or gossip transport, and sibling repositories are outside this work.

## 4. Text merge v0: candidate design

Implement a sequence of stable text elements grouped into insertion runs. The intent is a small, explainable sequence CRDT, not a general-purpose CRDT framework.

- `TextInsert` names the target blip, insertion anchor element (or start sentinel), and a run of Unicode scalar values. Element IDs derive from the signed event ID and element/run offset; they must not depend on arrival order.
- `TextDelete` names the exact element IDs to tombstone. Deletion is monotonic and repeated delivery is harmless. A deletion only removes elements in its explicit observed target set; unseen concurrent insertions survive.
- Concurrent inserts at one anchor are ordered by a documented, total deterministic key, initially `(event ID, operation index)`. Runs remain internally ordered. The implementation must prove that this ordering preserves each run and converges under shuffled delivery.
- Batch editor changes into bounded signed events. Never sign each keystroke. Define batch flush conditions, maximum operation count/bytes, and behavior when signing or persistence fails.
- A blip's text is the deterministic traversal of non-tombstoned elements. Do not use timestamps as a tie-breaker or replace the whole text with last-writer-wins snapshots.

Before building the full UI, implement a pure reducer and fixtures for same-position inserts, independent edits, overlapping deletes, delete-vs-concurrent-insert, Unicode/emoji, duplicate delivery, and every relevant event permutation. If the initial sibling-order rule makes ordinary typing reverse or interleave runs awkwardly, revise the rule and fixtures before UI work. Document any sequence-CRDT limitation plainly; convergence does not promise that simultaneous prose reads well.

## 5. Conversation structure and anchors

Represent Wave, thread, and blip structure with explicit signed events, not text operations. A thread creation points to its parent blip or Wave root. A passage reply records stable text element IDs for its selected range, the quoted text, and causal context. Numeric offsets may be UI conveniences but are not durable anchors.

If anchored text is partially or fully deleted, keep the reply and its original quote. Mark an unresolved or removed anchor visibly and place it at a safe location in its parent blip; never search for identical text and silently reattach. Define insertion affinity at either edge and deterministic sibling ordering for concurrent thread/blip creation. Reject invalid parentage, cycles, cross-Wave references, unsupported event versions, and invalid ownership.

Defer rich formatting, arbitrary embedded objects, restoration UI, private subthreads, agents, and semantic conflict resolution. Plain text and stable passage replies are the required collaboration surface.

## 6. Authorization and confidentiality boundary

For this prototype, use the same fixed participant list and public-data assumption as Work order A. Verify ANProto signatures and the Wave root's membership before applying each event. This is an application-level write check; it is not confidentiality, cryptographic membership, revocation, or protection from relay disclosure. Do not describe the Wave as private.

ANProto records must remain independently verifiable after export or relay replacement. Bind the exact payload bytes, Wave/blip IDs, event type/version, and causal references into the signed contribution. If a future access-control system is added, bind its identity to the ANProto author key explicitly; it must not replace ANProto authorship verification.

## 7. Relay and persistence

Use the relay scope and safeguards in Work order A: local relay, bounded payloads, durable acknowledgments, deduplication, reconnect catch-up, and independent client validation. Extend record inventory/sync only as required to retrieve missing causal dependencies. A relay acknowledgment means durable storage, not consensus or authorization.

Persist verified events, pending dependencies, local unsent batches, and the signing key through separate browser storage paths. Replay accepted records to rebuild the projection after reload. Keep deterministic reducer state disposable and rebuildable; do not make relay-specific snapshots the only recoverable representation.

## 8. Acceptance and definition of done

Use the two-independent-client acceptance scenario, UI requirements, profile behavior, network/restart checks, screenshots, and verification report in Work order A. In addition, demonstrate:

1. Every valid event set yields identical text and structure across all delivery permutations tested.
2. A second implementation of the reducer (or a small independent reference reducer) agrees on the same fixtures, so the format is not defined only by one mutable code path.
3. Exported event records verify without APDS, the relay, or local reducer state.
4. Invalid signatures, nonmember events, malformed operations, oversized decoded payloads, cross-Wave references, and missing dependencies are handled as specified.
5. Anchored replies survive insertions and deletions without drifting to unrelated text.

Define a measured performance target for replay and typing latency before implementation; record event count and bytes for the same scripted edit scenario used to evaluate Work order A. If event growth or replay cost is materially worse, report it rather than hiding it behind snapshots.

The deliverables are the working code, tests, `DESIGN.md`, versioned `PROTOCOL.md`, updated README/vendor notes, screenshots, and a limitation report. Keep changes in this repository, do not publish or deploy, and do not modify sibling repositories.

## 9. Stop conditions

Do not proceed to UI polish if the reducer does not converge under shuffled delivery, if element IDs are ambiguous, if editing in normal typing order produces unstable text, or if the signed wire representation cannot be independently verified. Report the smallest concrete blocker and revise this model before expanding scope.

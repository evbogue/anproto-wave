# Collaboration foundation

ANProto Wave is developing encrypted collaborative writing and attributed publishing to wider audiences. The v2 engine supplies its shared text, passage replies, signed contributions, local persistence, and offline synchronization. [PUBLISHING.md](PUBLISHING.md) defines the planned draft, epoch, publication, and audience model; [ROADMAP.md](ROADMAP.md) sequences its implementation.

This document records the collaboration foundation in the development checkout. Its signed records are public and unencrypted, with a fixed editor list per Wave and a loopback relay. The engine was documented on 12 October 2026; the native HTML presentation and documentation alignment were updated on 15 October 2026. The evidence for its behavior is in [VERIFICATION.md](VERIFICATION.md).

## Conversation and screen

Native HTML elements and structural CSS provide the interface. Browser defaults supply text and control appearance; CSS supplies columns, spacing, wrapping, indentation, and image dimensions. A Wave list sits beside the open conversation. The selected Wave shows participants and self-asserted names, connection/save state, editing activity, and a continuous body of editable messages. On narrow screens the list precedes the conversation. Selection within a displayed passage enables “Reply here”; its thread appears between the surrounding text segments. Whole-message replies appear at the message end. Threads retain their quote after deletion and can collapse. History lists signed creation/insert/delete contributions.

The inspected Google-published `references/google-wave/screenshots/inbox-2009.png` supports the participant strip, conversation workspace, and replies interspersed with message content. `references/google-wave/specs/conversation/convspec.rst`, vocabulary and conversation-manifest examples, distinguishes blips, threads, continuations, and inline replies. The selected-text gesture, scalar-ID anchors, RGA, polling relay, and simple textarea binding are our implementation choices. The historical sources inform conversation structure; the prototype uses the browser’s native presentation.

## Narrow CRDT

The source of truth is a set of immutable ANProto-signed records. Creation-record IDs identify Waves, threads, and blips. Text is an RGA-style sequence: each Unicode scalar has an immutable ID, a predecessor, and a deterministic ordering key. A run chains its characters together. Tombstones hide precisely the IDs observed by a deletion; unseen concurrent insertions survive.

A predecessor's children sort by descending causal clock, signed-event ID, operation index, and character index. The clock is derived from signed dependencies, never a timestamp or arrival sequence. Descending causal order lets a later insertion at a cursor precede the old successor. Concurrent runs at the same predecessor sort deterministically and remain contiguous unless another edit intentionally enters the run. Iterative traversal avoids recursion depth failures for long messages.

The immutable dependency DAG constrains references and authorization. An edit can refer only to the target blip and elements in its causal past, or elements inserted by earlier operations of that same event. Threads and blips must reference causally observed objects within their own Wave. This prevents cross-Wave edits and parent cycles. Missing dependencies remain pending. Unknown or invalid events never partially mutate the projection.

`reference-crdt.js` independently constructs atoms from valid fixture records and sorts full causal predecessor paths. It agrees with the production reducer on every tested permutation. It is a valid-fixture text oracle. Tests establish convergence for the exercised cases. Independent authorization validation, broader event-graph coverage, and human review of merged prose extend that evidence.

## Editor and anchors

A textarea uses UTF-16 selection offsets; wire operations and element indexing use Unicode scalars. A prefix/suffix diff produces one contiguous replacement expressed as explicit deletions and an insertion run. Normal typing is grouped by a 250 ms idle flush; polling may flush earlier. Signing/persistence are serialized. A large deletion is split into bounded signed batches, recomputing the remaining diff after each batch. Insertion runs are limited to 4,096 UTF-16 units; a larger paste is retained as a recoverable draft and requires splitting into smaller edits.

Before applying remote records, the client flushes local typing against the exact previously observed projection. It then reconstructs accepted state and restores selection using stable predecessor IDs. If the preceding element is deleted, selection falls back to its nearest surviving predecessor. The focused textarea node is retained, scroll position preserved, and remote synchronization waits during IME composition. Editor updates preserve the native controls and structural layout.

Passage anchors contain the selected scalar IDs and exact original quote. The reply composer captures the selection's causal heads. Creation is validated against that causal view, excluding later or unobserved concurrent events, so a passage can change while its reply is being composed. Edge insertion affinity is outward: new characters before the first or after the last selected ID are excluded. Insertions between selected IDs are included in the visible span. Partial deletion marks the thread as partly removed. Full deletion places it at its parent message end with “Passage removed”; no text-search reattachment occurs. Stable IDs and original quotes remain in history.

## Durability and transport

Browser records, pending outbox, images, and unsent drafts use IndexedDB transactions. Signing keys live in a separate localStorage namespace; exports, requests, and the relay contain no private keys. A draft is stored before signing a batch, and the corresponding draft is removed atomically when its completed signed contribution enters records/outbox; multi-batch edits retain the draft until their final batch. A second in-flight local input is processed next. The interval before a typing flush is not durable; normal completion flushes and closing with unsaved typing prompts the browser.

The Node service binds only to 127.0.0.1. Same-origin JSON requests exchange signed records and content-addressed avatar data. Clients poll at 500 ms, retry a durable outbox, and request a full inventory after a relay revision change. The relay deduplicates IDs, verifies signatures and available Wave constraints, atomically replaces its store, flushes file and directory, and acknowledges only then. Missing-root/dependency records can be retained pending; every client independently validates the complete received set. Relay storage is outside an explicit static asset allowlist.

Signed presence is ephemeral, refreshed at most every two seconds while an editor is open, and expires after ten seconds. The relay verifies the signer, Wave membership, target blip, and signature timestamp freshness. Recipients independently verify the original signed presence envelope and selected-Wave membership. Presence is not persisted or exported and does not affect merge order.

V1 notebooks retain their original storage and public import/export through a read-only legacy viewer. V2 has a separate key/database namespace, so each format retains its own replay and recovery path.

## Performance targets and limits

The initial target is replay of 500 edit events / 5,500 scalars below 250 ms and remote display on loopback below one second. `npm run benchmark` builds actual signed events and reports five replay timings and serialized bytes. The browser harness measures the live-update target.

This first implementation recomputes the projection and causal ancestry from the event inventory. Ancestry storage can grow quadratically; full-inventory transfer and full-file relay replacement also grow with history. Replay retains tombstones and complete event history. Checkpointing and compaction are future protocol work described in the roadmap. A single author can observe at most 256 heads, records are bounded to 64 KiB, and the full relay is bounded to 10,000 events / 32 MiB. These bounds keep the demo finite; large-scale collaboration needs further work.

## Integration with publishing

The next protocol version will carry encrypted working contributions and separately verifiable publications. Its design must connect stable message identity, exact causal revisions, epoch changes, and released attribution while preserving this engine's deterministic text behavior. Decryption and authorization precede projection; publication verification uses the released representation and evidence.

The existing browser editor and recovery path provide the starting point for author views. The next interaction work adds audience views, closed-message announcements, publication-specific passage replies, and explicit publishing policy. See [PUBLISHING.md](PUBLISHING.md) for the intended lifecycle and access boundaries.

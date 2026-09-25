# Work order: a recognizable ANProto Wave prototype

Date: 22 September 2026

Status: implementation handoff, not an implementation already completed. This document authorizes no changes outside this project. The user will hand it to an implementation agent later.

Historical baseline: Google Wave's developer preview was unveiled at Google I/O on May 28, 2009. The collected follow-up sessions are from 2010, not 2011. Use the [verified chronology](GOOGLE_WAVE_RESEARCH.md#verified-chronology) and original references for historical claims. This work order's CRDT, ANProto, relay, and fixed-membership choices are our proposed design, not Google's historical specification.

## 1. Objective and lesson from the first attempt

Build a small, working conversation-document that two people can edit together. It must demonstrate the defining interaction: shared editable messages, live changes, and discussions attached to passages inside those messages.

The existing demo proves signed records, whole-note revisions, profiles, and manual exchange. It does not yet demonstrate that interaction. Do not mistake more controls, a vintage color scheme, or a three-column layout for solving this problem.

The intended separation is:

- Wave inspires the interaction and conversation structure.
- Wiredove supplies the existing visual language, avatars, and image conventions.
- ANProto authenticates durable contributions and content references.
- A collaboration engine reconciles concurrent editing.
- A small local transport exchanges contributions.

Success means two independent clients can think together in one evolving conversation without exchanging files or manually merging ordinary edits.

## 2. Scope and boundaries

Work only within `/Users/evbogue/Code/anproto-wave`. Read sibling repositories as references; do not modify them, install dependencies into them, or start their services. Keep attribution and provenance for copied code. Do not publish, deploy, or expose a service on the LAN or Internet.

Required first release:

- Independent local identities; create a wave with a fixed participant list.
- A compact wave list and an open-wave workspace.
- Plain-text blips, top-level continuation, and passage-anchored reply threads.
- Live concurrent editing of the same blip, with automatic convergence.
- Visible participants, connection state, and editing activity.
- Existing generated avatars, custom photo profiles, and automatic image exchange.
- Durable signed changes, local recovery, and reconnect catch-up.
- A small history inspector showing authors and recorded changes.

Explicitly deferred: SSB integration, federation, robots, gadgets, rich-text formatting, arbitrary attachments, private wavelets, encryption, dynamic membership, moderation, message deletion, restore, full playback, search, production deployment, and mobile-specific feature development. Provide a usable narrow layout, but do not build a separate mobile app.

One wave has one shared participant domain in this release. All participants may edit every blip. Anyone who obtains the records can read them: membership is write authorization, not confidentiality. Do not advertise a private workspace.

SSB remains a possible later transport. Do not add a second replication system merely to mention SSB in the demo.

## 3. Read and inspect before implementation

Read project instructions and these files:

- `GOOGLE_WAVE_RESEARCH.md`: historical model, source limitations, and unresolved design questions.
- `references/google-wave/README.md`: downloaded original specs, verified historical screenshots, and the 2009/2010 Google I/O video watch list. Inspect the full-workspace screenshot and original conversation text before designing; verify video behavior directly rather than inferring it from titles.
- `README.md` and `VENDOR.md`: existing behavior and source provenance.
- `wave.js`, `wave.test.js`, `store.js`, `app.js`, `server.js`, `index.html`, and `wave.css`.
- The copied avatar renderer and stylesheet in `vendor/`.

Inspect Wiredove's active `client/render.js`, `profile_header.js`, and `style.css` read-only if changes to their adaptations are needed. Do not replace the active avatar renderer with its older disabled alternative.

Before designing the interface, inspect original Google Wave demonstration material and interface screenshots, starting with sources in the research document. Record which source or video timestamp supports each adopted interaction. Distinguish demonstrated behavior, draft protocol behavior, and our new design. Do not claim pixel fidelity or exact production behavior from a protocol draft.

Produce a short `DESIGN.md`: a written screen layout, the interaction sequence below, and the architecture decisions. No elaborate design system, generated artwork, or mockup-only deliverable is needed. Compare the current app to the reference interaction, not just its colors.

## 4. The acceptance scenario

Use two genuinely separate browser profiles or isolated storage contexts, with different private keys. Identity switching in one shared local database is not evidence of collaboration.

1. Alice and Bob create local identities. Alice creates a wave containing both public keys. Bob opens its share link and receives its public state automatically from the local relay.
2. Alice writes a two-paragraph workshop plan. Bob sees the text evolving without refresh or Save.
3. Bob selects a phrase in the second paragraph, chooses “Reply here,” and writes a response. The reply appears inline at that passage, not as an unrelated card at the bottom.
4. Alice continues writing before the selected phrase. The reply remains attached to the intended passage.
5. Alice and Bob edit different parts of the same blip simultaneously. Both changes survive. Repeat with simultaneous insertions at the same position; the result must be deterministic and identical in both views.
6. Alice edits inside the selected passage, then removes the passage entirely. The thread remains accessible with its original quoted context and a visible indication that its anchor text was removed. It must not silently attach to unrelated text.
7. Disconnect Bob. Bob edits locally; Alice continues online. Bob reconnects. Both receive retained changes and converge without manual merge or draft loss.
8. Bob changes his avatar. Alice receives the signed profile and image without a manual export.
9. Reload both clients and restart the relay. The accepted conversation, anchors, and history reconstruct. Neither client's private key has been sent to the relay or the other browser.

This sequence is the main demo script and release gate.

## 5. Interface and interaction requirements

### Workspace, not a feed

Use a compact wave list beside the selected wave. The open wave has a title, participant avatars, connection/save state, and a continuous conversation body. Reuse Wiredove's spacing, typography, colors, controls, and light/dark variables. Nested threads need clear indentation and subtle boundaries, not repeated heavy cards around every revision.

On narrow screens, show the selected wave with an obvious way back to the list. Avoid a hard-coded desktop canvas or horizontal page overflow.

### Editing and replies

Blips are shared editable text. Expose an obvious Edit action and make changes propagate while editing. “Done” may close the editor; it must not be the moment all changes are finally transmitted. Say that edits are shared while typing. Do not offer “Cancel” if it falsely implies already shared edits will disappear.

Provide both “Reply” to a whole blip and “Reply here” for a selected passage. A selected-passage reply must show its quoted context while composing. Threads appear at their anchors, can collapse/expand, and support ordered continuations. Replies are editable blips too. Preserve focus, caret, selection, scroll, and IME composition during remote updates; do not rerender the entire app for each keystroke.

Keep signature strings, hashes, import/export, and protocol diagnostics out of the primary writing path. Put them in an inspector or secondary controls. The wave list may track local unread activity, but never imply wall-clock timestamps establish a global edit order.

### Profiles and images

Retain the complete existing path: deterministic key-derived fallback, signed display name and image reference, 256×256 center-cropped PNG upload, content-hash image storage, and fallback when bytes are missing or invalid. Disable profile submission while image processing is incomplete. Reuse the existing image representation, not a new image service or generated asset system.

Identify participants by key even when names or photos match. Label profile names as self-asserted; signatures do not establish a person's real-world identity.

## 6. Architecture decisions

### A. Use a maintained text collaboration engine

Use an established text CRDT implementation with supported stable/relative positions and a browser editor binding. Do not hand-roll OT or a character CRDT for this work order. Plain text is sufficient; a dependable editor binding is more important than retaining zero dependencies.

Before choosing a package, consult its current official documentation and license. Pin exact dependency versions and commit the lockfile. In `DESIGN.md`, name the engine, binding, anchor behavior, Unicode indexing convention, and persistence format. Demonstrate same-blip convergence and anchor movement in a small test before building the full UI. If no suitable engine satisfies these requirements, report the concrete blocker rather than falling back to full-text last-writer-wins updates.

Prefer one text document per blip. Keep conversation structure as explicitly validated signed records instead of giving opaque editor updates authority to change membership or parent relationships. Do not implement distributed text editing with the existing whole-note `replaces` chain. Preserve that model only for legacy data.

CRDT convergence is not semantic agreement: simultaneous prose can still need human cleanup. Do not claim the engine understands intent or attribute every resulting character to the signer of the latest update.

### B. Keep ANProto around durable contributions

Continue using the existing ANProto signing primitives. A v2 contribution signs the hash of its exact serialized payload bytes. Verify the original bytes before interpreting them; do not parse and reserialize imported payloads before checking the signature.

Define a versioned protocol in `PROTOCOL.md`, with exact field types, limits, record IDs, dependency rules, invalid-record handling, and executable examples. At minimum define:

| Record | Meaning |
| --- | --- |
| Wave root | Immutable title, protocol version, fixed participant keys |
| Thread creation | Parent blip or root, optional passage anchor, stable identity |
| Blip creation | Owning thread, predecessor/ordering reference, stable identity |
| Text update | Wave ID, blip ID, engine/format version, encoded incremental update |
| Profile | Signer's display name and optional image hash |

Creation record IDs can serve as object IDs; subsequent records reference them. Specify deterministic sibling ordering using explicit predecessor relationships and a stable ID tie-break, not receipt time. Missing dependencies are pending, not silently discarded. Reject invalid ownership, cycles, cross-wave references, unknown record types, and unsupported formats.

Verify signatures and root membership before any text update reaches the shared document. Verify its wave/blip binding and enforce decoded-size limits as well as transport-size limits. A valid signature authenticates a submitted update; it does not certify its meaning, authorization, or harmlessness. All members intentionally have full text-edit authority in v2.

Batch local editor changes over short intervals, targeting remote display within one second on loopback. Serialize each client's signing/persistence queue so rapid edits and async completion cannot lose batches. Bound the batches. Do not reuse v1's 20,000-character JSON cap blindly for binary updates encoded as text.

### C. Make anchors durable and explainable

An anchored thread records the parent blip, engine-relative start/end positions, original selected quote, and sufficient causal context to resolve the selection. Raw numeric character offsets alone are unacceptable.

Document insertion affinity at both edges, partial deletion behavior, full deletion behavior, and unresolved-anchor behavior. If necessary, store additional stable references to detect removal of the original span. Test this against the selected engine: do not assume a relative-position API automatically detects orphaned quotations.

If an anchor is pending, retain the thread until dependencies arrive. If its text was removed, retain the quoted context and show the thread at a safe, marked location within the parent blip. Do not silently guess by searching for a matching phrase elsewhere. Leave reattachment controls for later.

### D. Add a minimal loopback relay

Extend the standalone Node service or add a companion within this repo. Use a simple bidirectional transport. Bind to loopback by default and retain a one-command start. The relay stores and forwards signed records and content-addressed avatar bytes; it is not a text conflict-resolution authority and never receives private keys.

For this small demo, full per-wave record inventory and missing-record exchange is sufficient. Dedupe by verified IDs, fetch missing dependencies/images, retry after reconnect, and broadcast new records. Do not build an elaborate distributed discovery protocol.

Persist relay data in a project-local ignored data directory outside the static asset allowlist. Enforce origin/host checks, payload limits, and bounded connection/buffer usage; loopback is not a reason to let arbitrary websites write to the service. Never serve source trees, relay storage, dotfiles, or key material through a catch-all static route.

Clients still validate all received records. A receipt acknowledgment is not cryptographic consensus. Define acknowledgment to mean the relay has durably stored a valid record, not merely read a socket message. Relay restart must not invalidate previously acknowledged state.

### E. Local durability and presence are separate

Use transactional browser persistence for v2 records and the pending outbox, with a separate key store. Persist locally before reporting “Saved locally.” Report “Synced to local relay” only after durable acknowledgment. Remote receipt need not imply another participant has opened the wave.

Document the small interval between typing and local persistence. Flush pending batches on normal editor completion and use an appropriate recovery strategy; do not rely solely on asynchronous work during page unload. Never report unsaved text as durable.

Presence and “editing…” are ephemeral, expire after a documented timeout, and do not belong in replayed history. Bind presence claims to the identity, rather than letting any connection impersonate a participant. Full remote caret rendering is optional; correct local selection and visible editing activity are mandatory.

### F. Preserve v1 data without forcing its limitations on v2

Do not overwrite the current browser storage key or silently convert existing notebooks. Use a separate v2 namespace. Keep a clearly labeled read-only legacy viewer and public export path for v1 records, including unresolved alternatives and profiles. A legacy notebook need not support live editing. Defer automatic conversion; do not pick a legacy conflict winner on the user's behalf.

Keep export/import as recovery/diagnostic features, not the collaboration path. Include original signed records and required image bytes, never private keys. Derived editor snapshots are rebuildable caches; retain source records in this prototype. Check that reconstruction and history do not depend on an unverifiable cache.

## 7. Implementation sequence and gates

1. **Baseline:** record git status; preserve user edits; run existing tests. Inventory reusable and replaceable parts. No sibling changes.
2. **Design proof:** complete the short source/interaction review and text-engine/anchor spike. Write `DESIGN.md` and `PROTOCOL.md`. Resolve ordinary technical decisions within scope; ask the user only for a material scope change or a blocker that defeats required behavior.
3. **Vertical slice:** two independent clients edit one blip through signed updates and the relay. Prove convergence, outbox durability, and reconnect before adding the full conversation UI.
4. **Conversation slice:** implement structure, passage selection, anchored threads, nesting, and deleted-anchor presentation. Prove remote edits do not destroy the active editor.
5. **Product slice:** wave list, participants/presence, Wiredove styling, complete profile/image exchange, accessible controls, history inspector, legacy access, and error states.
6. **Verification and handoff:** execute the acceptance scenario, capture actual screenshots, run automated tests, and document known limitations. Compare the result to both the original reference interaction and the failed notebook demo.

Do not spend the first half of the implementation polishing navigation while concurrency remains hypothetical. Do not call a static mockup or same-browser identity switch a completed vertical slice.

## 8. Test plan and definition of done

Automated tests must cover:

- Same-position insertions, separate edits, overlapping deletions, Unicode/emoji, and repeated update delivery.
- Shuffled arrival and delayed dependencies reconstructing identical text and conversation structure.
- Anchors with insertion before/at boundaries, partial/full deletion, duplicate quoted phrases, and pending dependencies.
- Invalid signatures, mismatched content hashes, nonmember writes, cross-wave references, malformed updates, oversized inputs, and corrupted avatar bytes.
- Local outbox retry, duplicate acknowledgments, reload, relay restart, and offline concurrent editing.
- Deterministic replay from original signed records; v1 storage remains intact.

Browser verification must use separate identities and isolated stores connected only through the relay. Run the full scenario in section 4; also exercise keyboard navigation, IME input, missing-avatar fallback, dark/light appearance, and a narrow viewport. Verify no private key appears in outbound requests or public exports without printing keys in logs.

Capture screenshots of the open wave, an inline reply, concurrent editing in both clients, and a removed-anchor thread. Screenshots prove layout, not convergence; retain test results or a short reproducible action log alongside them. Report measured loopback update latency against the one-second target.

Done means all required behaviors pass, the app starts from the documented command, and the user can repeat the two-person demonstration without file exchange. Any unfulfilled requirement must be listed explicitly; do not substitute a broad “tests pass” claim.

## 9. Deliverables and final handoff

- Working code and tests contained in this repository.
- `DESIGN.md` and `PROTOCOL.md` with implemented decisions, not hypothetical alternatives.
- Updated `README.md`: start/test commands, two-client setup, fixed membership, public-data warning, persistence/key limitations, and legacy access.
- Updated `VENDOR.md` and dependency/license provenance.
- Actual screenshots and a concise verification report, including remaining limitations.
- A final summary that separates implemented Wave behavior from deliberately deferred platform features and confirms sibling repositories were untouched.

Do not open a PR, publish a package, deploy a service, or create another task unless separately asked.

## 10. Instruction to the implementation agent

Implement this work order within its boundaries. Preserve the recognizable interaction before adding breadth. Use the existing research and code as evidence and reusable material, not as a reason to preserve the failed notebook layout. If a shortcut would remove live co-editing, stable contextual replies, or independent-client verification, it is not an acceptable shortcut. Explain the blocker instead of quietly redefining success.

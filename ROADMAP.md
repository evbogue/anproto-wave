# Roadmap

Build a plain-HTML browser prototype where partners collaborate on encrypted messages, publish attributed revisions to wider audiences, and keep writing while the audience discusses the work. Preserve local ownership, offline collaboration, and portable signed history through each step.

## Current priority — 30 October 2026

The immediate ticket is the resumable public-v2 checkpoint in [WORK_ORDER.md](WORK_ORDER.md). [CHECKPOINT.md](CHECKPOINT.md) records the revision, local run instructions, checks, and unresolved work. Wave remains secondary to the Wiredove/evbogue.com interactive timeline milestone. The numbered sections below describe future work, not completed features or one implementation ticket.

When Wave resumes, split delivery into these bounded slices:

1. Specify the encryption/access model, versioned records, key recovery, historical access, and concurrent membership outcomes. Review explicit fixtures before claiming privacy.
2. Implement one encrypted working scope for two authors. Verify ciphertext transport, authorized decryption, denied outsider access, and offline/reconnect behavior.
3. Implement immutable publication snapshots with exact revision references, audience, attribution, and publisher signature. Verify concurrent typing cannot alter a selected release and readers need no hidden draft history to verify delivered claims.
4. Add announcement and audience discussion views, preserving publication-specific passage references and the permissive sharing policy.
5. Complete invitations, removal, and offline epoch-transition acceptance before claiming the full dynamic-membership workflow.

Each slice must document actual guarantees and remaining limitations. Preserve personal Archive and existing signed records throughout. The full three-person scenario remains the integration target after these smaller gates.

## 1. Establish the author and audience workflow

Build on the native HTML interface and structural CSS. Make working drafts, closed-message announcements, publications, and audience discussion distinct views of a stable message. Use **Publish** and **Publish update** for release actions and show the revision currently available to each audience.

[WORKFLOW.md](WORKFLOW.md) defines the full path through **Collapse Wave**, the final personal viewer action. Collapse and Archive restoration are implemented in the public v2 foundation. Carry that behavior through the publishing views: retain content and history, preserve other participants' views, and require explicit restoration after new activity.

Implement the initial policy: anyone with access to a Wave, including audience members, can change its viewership without another person's approval. A person can release content they can already access; unpublished working content retains its access boundary. Show who changed viewership and the audience they selected. Support explicit demo identities across three tabs, with independent storage contexts available for access verification.

Evidence: Alice and Bob edit a shared message; a reader follows its announced status and discussion; the interaction shows precisely which revision would be published and who authorizes it. Either collaborator and the reader can change viewership for content they can access without waiting for another person's approval. Interface behavior and access guarantees are recorded separately as the implementation advances.

## 2. Implement encrypted drafts and publication records

Evaluate recipient-specific envelope encryption and MLS against [PUBLISHING.md](PUBLISHING.md). Choose an established implementation and specify authenticated encryption identities, group epochs, recipient grants, historical access, and local key recovery.

Define a versioned format for encrypted contributions and signed publications. Each publication binds an exact revision, audience, byline, credits, and the acting publisher's signature. The initial policy requires no additional approvals. Provide a self-contained released representation whose verification follows from the material delivered to readers. Keep the working draft's causal history available to its authorized collaborators.

Evidence: independent author clients decrypt and merge shared edits; the audience receives a publisher-selected publication and can verify its released attribution; subsequent working edits remain accessible to the author group. Inspect records, transport, storage, and decryption results. Demonstrate audience expansion and a membership change with an epoch transition.

## 3. Complete the living-document demo

Connect author collaboration, optional closed-message announcements, audience discussion, publishing, and further private editing in one browser flow. Preserve stable message identity through every publication. Anchor passage replies to their publication and original quote. Group signed operations into readable contribution history.

Evidence: three tabs complete the write–publish–edit–publish-update cycle. Readers retain earlier discussion context, see the correct publication for their audience, and inspect author names and contribution credits. Test a publication while another author is typing so the selected revision stays exact.

Finish the scenario by collapsing the Wave for one identity: it leaves that identity's active viewer, survives reload in Archive, stays archived through another participant's update, and returns only through **Restore**.

## 4. Strengthen offline work, history, and recovery

Carry durable drafts, signed records, publication selections, and encryption state through interruptions. Define how offline edits cross epoch transitions and how concurrent group changes are resolved. Provide recoverable identity and authorized history storage with an explicit retention policy.

Evidence: clients edit offline, reload, reconnect, and agree on accepted text, group state, publication history, and access. Recovery restores the intended identity and content. Tests describe key retention, forward-secrecy assumptions, and the outcome for each participant after membership changes.

## 5. Distribute conversations across independent infrastructure

Implement synchronization across peers or independently operated relays. Specify inventory exchange, missing dependencies, retries, routing metadata, and replacement of unavailable services. Preserve signatures, encrypted access boundaries, publication references, and deterministic text semantics across transports.

Evidence: clients using separate stores and services exchange offline contributions, reconcile after partitions, and recover their authorized views when a transport is replaced.

## 6. Make the protocol independently reproducible and scalable

Publish portable fixtures covering encryption envelopes, group transitions, publishing authority, attribution, conversation structure, causal validation, and invalid records. Extend independent verification beyond the current valid-fixture text oracle. Measure replay, traffic, retained history, and key-state growth.

Design checkpoints and compaction around historical verification, passage references, publication snapshots, and returning offline peers.

Evidence: another implementation agrees on accepted conversation state, publication content, and access decisions. Measurements establish practical bounds and demonstrate how retained history remains usable after compaction.

## Evidence and implementation records

[VERIFICATION.md](VERIFICATION.md) records dated checks of the collaboration foundation. [DESIGN.md](DESIGN.md) and [PROTOCOL.md](PROTOCOL.md) describe that implementation. Update those records as each milestone produces working behavior and reproducible evidence.

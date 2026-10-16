# Roadmap

Build a plain-HTML browser prototype where partners collaborate on encrypted messages, publish attributed revisions to wider audiences, and keep writing while the audience discusses the work. Preserve local ownership, offline collaboration, and portable signed history through each step.

## 1. Establish the author and audience workflow

Build on the native HTML interface and structural CSS. Make working drafts, closed-message announcements, publications, and audience discussion distinct views of a stable message. Use **Publish** and **Publish update** for release actions and show the revision currently available to each audience.

Define the first publishing-approval policy and the meaning of each role: collaborator, publisher, and audience member. Support explicit demo identities across three tabs, with independent storage contexts available for access verification.

Evidence: Alice and Bob edit a shared message; a reader follows its announced status and discussion; the interaction shows precisely which revision would be published and who authorizes it. Interface behavior and access guarantees are recorded separately as the implementation advances.

## 2. Implement encrypted drafts and publication records

Evaluate recipient-specific envelope encryption and MLS against [PUBLISHING.md](PUBLISHING.md). Choose an established implementation and specify authenticated encryption identities, group epochs, recipient grants, historical access, and local key recovery.

Define a versioned format for encrypted contributions and signed publications. Each publication binds an exact revision, audience, byline, credits, and required approvals. Provide a self-contained released representation whose verification follows from the material delivered to readers. Keep the working draft's causal history available to its authorized collaborators.

Evidence: independent author clients decrypt and merge shared edits; the audience receives an approved publication and can verify its released attribution; subsequent working edits remain accessible to the author group. Inspect records, transport, storage, and decryption results. Demonstrate audience expansion and a membership change with an epoch transition.

## 3. Complete the living-document demo

Connect author collaboration, optional closed-message announcements, audience discussion, publishing, and further private editing in one browser flow. Preserve stable message identity through every publication. Anchor passage replies to their publication and original quote. Group signed operations into readable contribution history.

Evidence: three tabs complete the write–publish–edit–publish-update cycle. Readers retain earlier discussion context, see the correct publication for their audience, and inspect author names and contribution credits. Test a publication while another author is typing so the approved revision stays exact.

## 4. Strengthen offline work, history, and recovery

Carry durable drafts, signed records, publication approvals, and encryption state through interruptions. Define how offline edits cross epoch transitions and how concurrent group changes are resolved. Provide recoverable identity and authorized history storage with an explicit retention policy.

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

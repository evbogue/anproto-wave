# Publishing and privacy

ANProto Wave will let authors collaborate on encrypted messages and publish selected revisions to progressively wider audiences. Every message can keep evolving after publication. This document describes the intended model for the next implementation milestone, building on the v2 collaboration engine documented in [DESIGN.md](DESIGN.md) and [PROTOCOL.md](PROTOCOL.md).

## Message lifecycle

A message has a stable identity connecting its working draft, publications, and discussion. Authors edit the working draft together. A publication captures a precise revision, chosen byline, contribution credits, intended audience, and authorizing signatures. Later edits continue in the draft. **Publish update** releases another revision while preserving the earlier publication as a referenceable object.

Each audience sees the latest publication addressed to it. A review group may receive a newer revision than the public audience. Authors can publish the same revision to another audience through a further signed publication record.

Publishing authority is part of the message's policy. The implementation must make the authorized publishers and required approvals explicit. An approval binds the exact revision, attribution, and audience. Concurrent or later typing belongs to subsequent draft work. The first implementation will choose and document a concrete approval policy before enabling publication.

## Author and audience views

| View | Contents | Access |
| --- | --- | --- |
| Working draft | Live shared text, private discussion, signed editing history | Authorized collaborators |
| Closed-message entry | Chosen title, collaborator names, status, discussion link | The announcement's audience |
| Publication | Released revision, byline, credits, publisher signatures | The publication's audience |
| Audience discussion | Replies, questions, speculation, and passage discussion | That discussion's audience |

A closed-message entry is an intentional, separately signed announcement. Authors choose the metadata to expose. Private editor presence belongs to the working group; any public activity status is a separately chosen disclosure.

Audience discussion can begin on the announcement and continue through successive publications. A general comment refers to the stable message. A passage reply records its publication, selected passage, and original quote. The interface keeps that context visible as the document evolves. Authors can use audience feedback while preparing further work.

## Revisions, epochs, and publications

A **revision** identifies message content at a specific causal state. An **epoch** identifies the authenticated membership and cryptographic state of an encrypted group. A **publication** grants an audience access to a revision and selected attribution. Their identifiers and histories are separate.

For example:

1. Alice and Bob collaborate in author-group epoch 1.
2. They publish revision 12 to five reviewers, with its own access to the released artifact.
3. Alice and Bob continue editing through revision 20 in their author group.
4. Adding another writing partner advances the author group's epoch and grants the history access chosen for that partner.
5. The authorized publishers publish revision 20 publicly. The reviewers and public readers retain the publications they received.

The author group's membership and keys can stay stable through several publications. Key updates can also advance epochs between publications. In MLS, commits advance group epochs; membership changes and key refreshes are examples of such transitions. See [RFC 9420](https://www.rfc-editor.org/rfc/rfc9420.html).

## Encryption boundaries

The implementation will encrypt working content for its authorized collaborators before sending it through storage and transport services. Clients with access decrypt and verify contributions, then apply the text merge rules. Relay validation and routing must be designed around the information available in encrypted envelopes.

A release to a restricted audience will use access scoped to the released artifact. A public publication will expose its approved text and released attribution for public verification. The author group's working keys stay with the collaborators. This separation lets a reader receive an approved revision while the working draft continues privately.

Historical access is an explicit grant. A new collaborator may receive a current starting revision, selected prior history, or the full working history according to the invitation policy. Removing a collaborator changes access to subsequent encrypted work. Recipients retain any content and keys already delivered to them.

Two candidate approaches will be evaluated against the same browser scenario:

- **Envelope encryption:** encrypt content with a fresh content key and distribute that key in recipient-specific encrypted envelopes. HPKE provides a standard public-key encryption building block. The application supplies authenticated membership, key rotation, recipient grants, and recovery rules. See [RFC 9180](https://www.rfc-editor.org/rfc/rfc9180.html).
- **Messaging Layer Security:** use an MLS implementation to manage authenticated group state and epoch transitions, carrying signed collaboration records as application content. Integration must address device identities, offline work, competing membership updates, and retained document history. MLS supplies forward-secrecy and post-compromise recovery mechanisms under its protocol assumptions. See [RFC 9420](https://www.rfc-editor.org/rfc/rfc9420.html).

The protocol choice will follow implementation evidence. Use established cryptographic implementations and document the guarantees of the selected construction. Encryption identities must be authenticated against the signing identities used for contributions. Keep content encryption, signature verification, and application authorization explicit in the design.

## Publication and attribution records

The planned publication record binds:

- The stable message identity and exact released revision.
- The preceding publication or publications it succeeds, where applicable.
- The released text and any explicitly released supporting history.
- The byline, contribution credits, and evidence accompanying those credits.
- The intended audience and restricted-access material where required.
- The publishing identities and approvals required by the message policy.

The byline expresses editorial authorship. Signed edits record which identity performed each operation. The UI groups operations into readable contributions, including insertions, removals, and revisions. The author view retains detailed working history; each publication carries its selected attribution.

A signature on a publication establishes the publisher's endorsement of its text and credits. Verification of an original contributor's edit uses that contributor's signed evidence. The interface will identify which evidence accompanies each claim.

The existing CRDT reconstructs content through causal dependencies and retained text elements. A released revision therefore needs a self-contained representation and explicit verification rules for its selected history. The implementation will specify how readers verify a publication from its released records and how authors retain the relationship to private working history. This includes passage references, stable message identity, and later published updates.

## Local storage and synchronization

Clients retain the records and key material needed for their authorized local views. The storage design will cover reload, offline edits, device recovery, and key availability across epoch changes. Recovery policy and history retention must be considered together with forward-secrecy guarantees.

Synchronization will carry encrypted working records, recipient-scoped publication material, and public announcements and discussion according to their access rules. Metadata such as routing identifiers, collaborator names, timing, and presence needs an explicit disclosure policy. Public announcements carry only the metadata selected for their audience.

Offline text edits and group changes have different reconciliation requirements. The selected protocol must specify how clients process edits created under earlier epochs, concurrent membership changes, and publication approvals after reconnection. Clients must agree on accepted group state and publishing authority as well as message text.

## Browser acceptance scenario

The prototype will use plain HTML and structural CSS with three tabs representing Alice, Bob, and an audience member. The tabs must have explicit demo identities and access state; ordinary tabs on one origin share browser storage, so the harness must account for that when proving confidentiality.

Alice and Bob edit together and inspect signed changes. The audience sees a chosen closed-message entry and posts discussion. Publishing makes the approved revision, byline, and credits available to the audience. Subsequent author edits remain within the working group until **Publish update**. Reload and offline/reconnect preserve the intended view for each identity.

Verification will inspect network responses, exported records, browser storage, and decryption behavior in addition to the rendered UI. Independent browser storage contexts will establish the access boundary. Acceptance will include publication during concurrent typing, revision-specific replies, audience expansion, membership changes, and attribution verification.

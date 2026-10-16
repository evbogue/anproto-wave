# Direction

ANProto Wave lets partners write messages together, publish credited revisions to wider audiences, and continue developing those messages as living documents. We are building a browser prototype that makes the movement from private collaboration to public conversation visible and understandable.

## The experience

A Wave connects shared writing with the conversations around it. Authors collaborate in an encrypted working draft, exchange passage replies, and inspect who changed what. They decide when a revision is ready and who should receive it. Publishing releases that revision with author names and selected contribution credits.

The working draft continues after publication. Each audience sees the latest revision published to it while authors prepare the next one. The privacy boundary moves through explicit publishing decisions. An author may share a revision with a small review group, later publish it more widely, and continue working with the original writing partners.

Authors can announce work before publishing its contents. A closed-message entry exposes chosen metadata, such as a title, collaborator names, and status. The audience can gossip, speculate, ask questions, and discuss the announced work. That discussion belongs to the Wave throughout the message's life. Replies to published passages retain the publication and quote they originally addressed.

## Language

- **Wave:** the shared context connecting messages, collaborators, publications, and discussion.
- **Working draft:** the current editable message available to its authorized collaborators.
- **Revision:** a particular state of a message, identified precisely enough to reproduce and approve.
- **Epoch:** a particular membership and encryption-key state for an encrypted group.
- **Publication:** an authorized release of a revision and selected attribution to a specified audience.
- **Closed message:** an announced message whose public entry describes work underway while its draft remains accessible to its collaborators.

The interface uses **Publish** and **Publish update**. Epoch changes follow cryptographic group changes; publications follow editorial decisions. Both have their own history.

## Authorship and credit

The byline identifies the authors taking credit for a publication. Contribution history identifies the signers of recorded edits. The interface groups edits into understandable changes, with detailed evidence available for inspection. Each publication identifies its publishers, released text, byline, and credit record.

Authors choose which working history accompanies a publication. Readers can verify a signed publication independently. Claims about particular original edits carry the corresponding evidence when that evidence is released.

## Browser prototype

Use ordinary HTML elements and structural CSS: headings, lists, articles, textareas, buttons, and expandable history. Layout should make the selected Wave, working draft, published message, audience discussion, and current identity legible. Keep the interaction and visibility rules at the center of the demonstration.

The first complete scenario uses three tabs with distinct demo identities. Alice and Bob write together. A reader sees their announced work and contributes to its discussion. Alice and Bob publish an attributed revision, continue editing privately, and publish an update. Each tab shows its actual access to content and its local save and connection state.

## Protocol principles

- **Local ownership:** participants retain durable records, identity material, and recoverable access to their work.
- **Offline collaboration:** reading and editing remain useful through connection loss; pending contributions reconcile on reconnect.
- **Deterministic merging:** signed causal history and stable text identities produce a reproducible conversation from the accepted event set.
- **Portable authorship:** signatures bind contributions and publications to identities across clients and transports. Display names remain self-asserted profile information.
- **Explicit access:** encrypted content, recipient membership, editing rights, and publishing authority each have defined rules. Audience access is granted to the selected content and history.
- **Deliberate publication:** each release records exactly what was approved, by whom, and for which audience. Already delivered content remains in its recipients' possession.
- **Distributed infrastructure:** clients exchange verifiable records through independently operated peers or relays, preserving the meaning of the conversation across transport changes.

## From foundation to product

The development checkout's v2 foundation implements signed shared text, passage replies, browser persistence, offline editing, reconnect, and a durable local relay. Its public records and fixed participant lists provide the existing collaboration baseline.

The next work adds the author/audience lifecycle and its encryption boundaries. [PUBLISHING.md](PUBLISHING.md) defines that design, [ROADMAP.md](ROADMAP.md) sequences the work, and [VERIFICATION.md](VERIFICATION.md) records the evidence as it is established.

# How we think Google Wave worked

Research notes for ANProto Wave · 22 September 2026

## Purpose and status

This document records our current understanding of Google Wave's design: the experience it offered, the objects it manipulated, the rules that made collaboration possible, and the extension model that let software participate.

Our goal is to understand those ideas before choosing how ANProto, and possibly Secure Scuttlebutt (SSB), could support a successor. This is a design research document, not an implementation specification or a commitment to use SSB, Git, or any particular editing algorithm.

We distinguish three kinds of statements:

- **Documented:** supported by the original specifications, Google announcements, or developer materials cited nearby.
- **Interpretation:** our explanation of why a documented design choice matters.
- **Proposal or open question:** something we may want for ANProto Wave, rather than a claim about Google Wave.

The historical sources describe different stages of development. The October 2009 conversation specification explicitly calls itself work in progress. The May 2010 client-server whitepaper covers a limited prototype and says it does not describe Google's production web-client protocol. A protocol draft, a demonstration, and a shipped product feature therefore provide different kinds of evidence. [Conversation specification](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.html) · [Client-server whitepaper](https://svn-eu.apache.org/repos/asf/incubator/wave/tags/wave-0.4-rc2/whitepapers/client-server-protocol/client-server-protocol.html)

## 1. The central product idea

### Verified chronology

Google Wave was unveiled in **2009**, not 2011. Distinguish these milestones rather than using “launch” for all of them:

| Date | What Google's contemporary announcement establishes |
| --- | --- |
| May 28, 2009 | Google unveiled the developer preview at Google I/O. [Announcement](https://developers.googleblog.com/hello-world-meet-google-wave/) |
| September 29, 2009 | Google announced a larger invitation-based preview beginning September 30. [Preview expansion](https://googleblog.blogspot.com/2009/09/surfs-up-wednesday-google-wave-update.html) |
| May 18, 2010 | Google announced open access without invitations, as part of Google Labs. [Open availability](https://googlewave.blogspot.com/2010/05/google-wave-available-for-everyone.html) |
| August 4, 2010 | Google announced it would not continue developing Wave as a standalone product; this was not an immediate service shutdown. [Development announcement](https://googleblog.blogspot.com/2010/08/update-on-google-wave.html) |
| November 22, 2011 | Google announced the final hosted-service schedule: read-only on January 31, 2012, and service shutdown on April 30, 2012. These dates are the announced schedule. [Final steps](https://googlewave.blogspot.com/2011/11/final-steps-for-google-wave.html) |

The reference collection's product demonstration and initial technical sessions are from Google I/O 2009; its follow-up sessions are from 2010. We have not verified a Wave-specific Google I/O 2011 session. Google Wave's hosted-service lifecycle is distinct from the continuation of open-source Wave projects.

### Product concept

**Documented.** Google presented a Wave as a space for both communication and collaborative documents. People could add participants, write rich content, reply, edit existing material, see concurrent typing, and review the evolution through playback. Google also separated the web product, extension platform, and federation protocol. [Launch announcement](https://googleblog.blogspot.com/2009/05/went-walkabout-brought-back-google-wave.html)

**Our interpretation.** The durable unit was the shared work. A discussion could become a draft, and the draft could remain connected to the discussion that shaped it. Participants did not have to repeatedly copy conclusions from a conversation into another document just to make them editable.

That gives us a useful product test: can a person arrive at a Wave, understand what the group is making, contribute in context, and later understand how the result came about?

Live typing was one way to make that experience immediate. It was not the entire idea. A successor could initially support slower, discrete contributions while preserving the relationship between discussion, editable objects, and history. We should describe such a prototype accurately: it would capture part of Wave's model, without yet providing the full live-editing experience.

## 2. Vocabulary and object model

**Documented.** The conversation specification defines this hierarchy and terminology:

| Term | Role |
| --- | --- |
| Wave | Collection of related wavelets |
| Wavelet | Named documents, participants, and a domain for concurrent editing |
| Document | Structured editable content |
| Blip | A document used as a conversational message |
| Thread | Ordered continuation of blips |
| Conversation manifest | Document describing relationships among blips and threads |
| Data document | Document outside the displayed conversation |

Content and conversation placement were represented separately. Replies could be attached to a message or anchored within its content. Private replies were conversations in separate wavelets with restricted participants. [Conversation specification](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.html)

**Our interpretation.** Three questions deserve separate answers in our model:

1. What object is this?
2. Where does it belong in the discussion?
3. Who shares access to it?

Treating all three as properties of a single feed post would make later collaboration features awkward. The exact historical names are optional; the distinctions are useful.

An illustrative workspace could be organized as follows. This is our example, not a historical schema:

```text
Wave: Plan a community workshop
  Shared area: organizers and invited assistants
    Brief
    Discussion attached to the brief
    Schedule object
    Research results
  Restricted area: two organizers
    Budget discussion
```

The restricted area is an access decision. A reply beneath the brief is a conversational relationship. A proposed alternate schedule is another concept again: an alternative result. These should not silently become the same kind of branch.

## 3. Editable messages and contextual discussion

**Documented.** The Apache project's description preserves the broad interaction model: participants could reply within material, edit content, and add people during collaboration. [Apache Wave overview](https://svn.apache.org/repos/infra/websites/production/wave/content/wave/about.html)

**Our interpretation.** Editing and replying express different intentions. Editing proposes or makes a change to the shared object. Replying contributes discussion about it. A design that offers both needs to keep their effects understandable.

Consider an agent asked to inspect a workshop plan. These actions are meaningfully different:

- Reply beside the budget with a concern.
- Propose a replacement budget.
- Directly replace the accepted budget.
- Produce a separate comparison of alternatives.

They may involve the same text, but they require different authority and presentation. Our event vocabulary should preserve that distinction.

Anchored discussion introduces a second problem: references must survive editing. If a reply points to a sentence and someone inserts text above it, its target should remain understandable. If the sentence disappears, the interface needs a deliberate behavior—show the old context, mark the target as removed, or attach the discussion to a surviving object. We have not chosen an anchoring scheme.

## 4. The relationship between history and current state

**Documented.** In the later federation design, a wavelet's state was determined by its operations. Providers exchanged changes and applied them to their copies. The host validated and ordered submissions and reconciled concurrency. Other providers held copies and sent changes to that host. [July 2009 Apache federation specification](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/wavespec.html)

**Our interpretation.** A useful distinction is between an action someone attempts and a change the workspace accepts. Receiving a signed object is insufficient to establish that the action was permitted, based on valid context, or compatible with other work.

For ANProto Wave, the lifecycle to specify is:

```text
Participant constructs a contribution
  → authenticity is checked
  → permission and structural rules are checked
  → concurrent changes are reconciled or exposed
  → accepted state is derived
  → participants see the result and its history
```

This is a proposed reasoning model, not a reproduction of Google's wire protocol.

We should also distinguish local optimism from shared acceptance. A person may see their own edit immediately while the system is still exchanging information. The interface needs a way to represent pending, accepted, rejected, or conflicting work if those states exist in our design.

## 5. Concurrency is a product rule as well as an algorithm

**Documented.** Google used operational transformation to reconcile concurrent operations. The July 2009 federation draft required equivalent transformation behavior across interoperating implementations. [Federation specification](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/wavespec.html)

**Our interpretation.** We can choose a different mechanism, but we cannot leave concurrent behavior undefined.

Several cases have distinct requirements:

| Concurrent activity | Question for our design |
| --- | --- |
| Two participants add independent replies | Can both appear without intervention? |
| Two participants edit different paragraphs | Can their changes combine automatically? |
| Two participants replace the same sentence | Combine, choose deterministically, or request a decision? |
| A participant removes an object while another replies | Where does the reply belong? |
| An agent finishes work against an outdated document | Apply, rebase, retain as a proposal, or reject? |
| Membership changes while someone submits an edit | Which permission state governs acceptance? |

Identical final state is only one success condition. A system can converge consistently while surprising its users or losing meaningful intent. We need tests for both agreement and understandable outcomes.

This historical analysis did not itself select a mechanism. The later project decision is to investigate and build an ANProto-specific CRDT; its precise merge rules still require validation against the behavior we want.

## 6. Playback, restoration, and accountability

**Documented.** In January 2010, Google announced restoration from playback. A restoration appended a restored state to history instead of deleting intervening history. Participants with full access could restore; read-only participants could inspect playback. [Read-only and restore announcement](https://googlewave.blogspot.com/2010/01/new-features-read-only-and-restore.html)

**Our interpretation.** History serves at least three purposes:

- Understanding how work evolved.
- Recovering from mistakes.
- Inspecting who contributed or changed material.

Those purposes do not require the default interface to display every low-level operation. A useful interface could group changes into understandable contributions, while retaining finer detail where available.

For agent work, we should be able to inspect the request, the result, the relevant document version, and any acceptance or correction. Playback should replay recorded effects; it should not re-execute an agent's external actions. Re-running a tool could create different results or repeat a real-world action.

A restoration is also a new collaborative act. If others have contributed since the target version, the person restoring needs to understand what current material will be replaced. An immutable record makes recovery inspectable, but does not by itself make restoration harmless or obvious.

## 7. Participants, permissions, and privacy

**Documented.** Google's January 2010 product update let creators change participants between full and read-only access. Read-only users could watch changes but could not edit or add people. The same announcement described reply-only access as planned, not shipped. Google's September 2009 preview announcement had identified missing permission configuration and participant-removal functionality, showing that these controls evolved. [Permissions update](https://googlewave.blogspot.com/2010/01/new-features-read-only-and-restore.html) · [Preview status](https://googleblog.blogspot.com/2009/09/)

**Our interpretation.** Membership, editing authority, and confidentiality are separate design decisions.

For our successor we need to answer:

- Who can invite another participant?
- Can an invited person read earlier history?
- Can an agent comment without replacing shared content?
- Who can accept a proposal or restore a version?
- What happens to future access when membership is revoked?
- Does a private area reveal its existence to other participants?

Restricting a view in the interface does not keep its underlying data private. If we use peer replication, the data-distribution and encryption rules must match the claimed access boundaries. Revocation can prevent some future access; it cannot make someone forget material they already received.

These are requirements to design for ANProto Wave. This document does not establish that Google Wave offered equivalent cryptographic guarantees, nor that its draft private-reply model was fully available in every product release.

## 8. Robots: automated collaborators

**Documented.** Google's 2009 API presentation distinguished robots from embedded gadgets. Robots were participants that observed and modified a Wave. The API exposed events around document and participant changes, with operations for manipulating content and conversation. Demonstrations included search, publishing, and connections to external systems. [Google I/O API presentation](https://docs.huihoo.com/google/io/2009/T_1200_Programming_With_For_Google_Wave.pdf)

The March 2010 Robots API update added proactive changes without a preceding user event, event filtering, adjustable context, error reporting, and a way to identify activity performed on behalf of another user. [Robots API v2](https://googlewavedev.blogspot.com/2010/03/introducing-robots-api-v2-rise-of.html)

**Our interpretation.** Wave's automation model already went beyond inserting generated chat messages. An automated participant could observe relevant activity and act on the shared environment.

For ANProto Wave, the agent contract should make these relationships explicit:

| Relationship | What we need to know |
| --- | --- |
| Identity | Which agent signed the contribution? |
| Delegation | Who requested or authorized its work? |
| Context | Which objects and revisions did it use? |
| Subscription | Which events should cause it to act? |
| Authority | May it reply, propose, edit, invite, or publish? |
| Result | What did it produce or change? |
| Outcome | Was the result accepted, rejected, superseded, or unsuccessful? |

These are our proposed distinctions. A signature proves a relationship to a key, not the truth of an agent's research or the legitimacy of its claimed delegation.

Agent-to-agent collaboration also requires policies against accidental repeated work: one agent reacting to another agent's output can create a loop. Stable request identifiers, recorded completion, and explicit triggering rules are candidates for a later specification.

## 9. Gadgets: shared interactive objects

**Documented.** Gadgets were elements within a Wave. They interacted with users and saved shared state; their scope differed from robots that could work on the surrounding conversation. Google's developer presentation illustrated shared maps and discussed games and polls. [Google I/O API presentation](https://docs.huihoo.com/google/io/2009/T_1200_Programming_With_For_Google_Wave.pdf)

**Our interpretation.** A participant and the object it produces should have separate identities and lifecycles. A research agent may create a comparison table, but the table should remain useful after that agent stops running.

Possible objects in our system include a task list, schedule, annotated document, comparison table, or collection of media. Each needs a defined state model and an intelligible fallback when a client cannot render its interactive interface.

The portability question is therefore broader than exporting text. Can another client understand the object's data, its authorship, and the actions available on it? We have not selected an extension packaging or execution system.

## 10. Embedding and multiple surfaces

**Documented.** Wave offered an embedding API. An April 2010 update added anonymous read access for embedded public waves; earlier embedding had required a signed-in account with access. [Embed API announcement](https://googlewavedev.blogspot.com/2010/04/embed-api-improvements-viewing-public.html)

**Our interpretation.** The workspace's identity should be independent of the page presenting it. A project page, a standalone application, and an agent interface could show different views of the same underlying work.

This fits our existing interest in shared tooling across the ANProto sandbox and Wiredove. The reusable unit should include object meaning and behavior, not only a matching visual component.

A public preview also needs an explicit boundary: showing a selected result is different from publishing its entire working history. Our design should let users understand which of those they are sharing.

## 11. Federation and portability are different promises

**Documented.** The July 2009 Apache-hosted federation draft retained a host for each wavelet even while other providers stored copies and participated. That host transformed and validated incoming operations, then distributed applied operations to other providers. We should not describe that design as having no coordinating authority. [Federation specification](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/wavespec.html)

### The May and July 2009 federation drafts

The May 2009 Wayback transcript and the July 2009 Apache-hosted document are distinct snapshots of the federation protocol, not two names for one unchanged specification. The older copy is preserved locally as a text transcript; the Wayback toolbar does not expose an exact timestamp for that selected capture. The July document is the later Apache-hosted draft, dated July 2009. The Apache Wave protocol page was last updated in 2013 and links to these specifications; the project is now retired. [May 2009 transcript](references/google-wave/specs/federation/draft-protocol-spec-wayback-transcript.txt) · [July 2009 Apache text](references/google-wave/specs/federation/wavespec.rst) · [Apache protocol-specifications page](https://cwiki.apache.org/confluence/spaces/WAVE/pages/31823357/Protocol%2BSpecifications)

| Topic | May 2009 draft | July 2009 Apache draft |
| --- | --- | --- |
| Authority | Describes one authoritative server for a wave, which orders operations. | Makes the host/provider relationship explicit for each wavelet; the host transforms and validates operations while other providers keep copies. |
| Topology | Introduces wavelets and allows additional wavelets, including private replies, to be hosted by providers. | Specifies provider roles and local/remote wavelet views, including restricted participant sets for private wavelets. |
| Transport | Defines XMPP `request` and `delta` elements, with wave/wavelet ID fields and requested operation ranges. | Defines XMPP message stanzas for pushed updates and PubSub service requests for history, submissions, and signer operations. |
| History and delivery | Supports requesting historical operations; the draft has fewer delivery details. | Adds version/history hashes, commit notices, receipts, persistent delivery queues, and reconnect/retry behavior. |
| Operations and documents | Lists a small operation vocabulary including participant changes and document content mutations. | Expands the XML-like document/annotation operation model and includes protocol-buffer delta definitions. |
| Authentication | Requires TLS for the XMPP connection. | Adds signer and certificate exchange. Its text says the intended cryptographic attribution techniques were not yet fully implemented or incorporated. |

**Interpretation.** Between these snapshots the protocol became much more explicit about server-to-server federation and reliable operation delivery. Its core remains a centrally ordered OT design: the host of a wavelet accepts, transforms, and validates submissions. The July draft says interoperating implementations must use functionally equivalent OT and composition algorithms. It is historical context, not a design requirement for ANProto Wave.

**Our design distinction.** The project has chosen to investigate and build an ANProto-specific CRDT over signed events. ANProto records carry durable contributions, and a loopback relay stores and forwards them. This has different trust boundaries from Google's host-ordered OT: the relay is not intended to order or transform document changes, and signatures alone do not establish permission. The first prototype keeps fixed membership and public data as explicit scope limits; it does not reproduce Wave's federation, private wavelets, or access-control guarantees. See the [architecture decision record](ARCHITECTURE_COMPARISON.md).

On November 9, 2010, Google announced ZIP exports of a wave's current view and attachments. On November 22, 2011, it announced the hosted-service shutdown schedule described above. Those announcements do not establish a complete export preserving every interactive behavior and historical operation. [Export announcement](https://googlewave.blogspot.com/2010/11/exporting-your-waves.html) · [Shutdown schedule](https://googlewave.blogspot.com/2011/11/final-steps-for-google-wave.html)

**Our interpretation.** We should evaluate portability through concrete recovery questions:

1. Can participants keep readable content?
2. Can they keep structured objects and attachments?
3. Can they retain verifiable contributions and history?
4. Can another implementation reconstruct the workspace?
5. Can collaboration continue when the original service disappears?

These are progressively stronger promises. A downloadable snapshot satisfies some needs without proving that the living collaboration can move elsewhere.

For ANProto Wave, preserving authorship and enabling continued work are especially relevant. We should test them rather than assume that federation, hashes, or an export button make them automatic.

## 12. What ANProto and SSB could contribute

This section is a mapping for ANProto Wave, not a conclusion reached by Google's designers.

**Product decision.** ANProto's portable authorship and integrity guarantees are required. Durable contributions must remain independently verifiable when copied, exported, or moved between relays; verification must not depend on trusting the relay or on Keyhive being available. The signed format must bind the exact contribution bytes to the author's key and a stable content-derived record ID. It does not prove that the key belongs to a named person, grant access, establish global order, or make the contribution true or safe.

If Keyhive is adopted, it supplies document membership, delegation, and encryption; it does not replace ANProto's signed application-level contribution records. The system must explicitly bind each Keyhive identity to its ANProto signing identity and reject ambiguous or mismatched bindings. Permission checks and cryptographic authorship verification remain separate checks.

For collaborative text, define a signed contribution envelope around each bounded CRDT operation batch. It should identify the wave and blip, the exact serialized operation bytes, the relevant causal heads, and the format/version. Do not sign each keystroke. Clients verify the signature and membership/permission before applying the update; a valid signature alone is not authorization.

**Documented about SSB.** SSB's database model provides signed append-only feeds associated with individual identities. Application-level changes to existing entities can be represented through later messages. Replication and author history are useful primitives, but application semantics sit above them. [SSB database design](https://github.com/ssbc/ssb-db)

**Our inference.** SSB could help distribute and retain contributions. It does not automatically turn multiple authors' feeds into one accepted, concurrently editable workspace. The distinction between each author's sequence and the workspace's causal relationships remains important.

| Concern | Candidate responsibility |
| --- | --- |
| Signed contribution and portable authorship | ANProto (required product guarantee) |
| Distribution and retained author history | SSB or another transport/storage arrangement |
| Document and conversation meaning | ANProto Wave application protocol |
| Concurrent state and acceptance | Explicit collaboration rules |
| Membership and delegated authority | Keyhive or another explicit permission model, bound to the ANProto author key |
| Media bytes | A storage layer such as AndFS |
| Rendering and interaction | Shared client components |

If we use both ANProto and SSB signatures, we should explain what each authenticates. Wrapping one signed object in another is justified only when the identities, portability, or transport semantics benefit from that separation.

## 13. Reconsidering our earlier Git analogy

Our previous discussions proposed agent branches and selective merges. Those remain interesting ideas, but this research does not establish Git-style branching as the foundation of Google's Wave model.

We should distinguish four actions in our own vocabulary:

- **Reply:** discuss existing material.
- **Restricted discussion:** share material with a different set of participants.
- **Alternative revision:** develop another possible result.
- **Restore:** make a previous result current again while retaining subsequent history.

The first two can look visually nested without being version-control branches. The third introduces a new decision process: who compares alternatives and chooses what becomes current? Git might support some workflows, but the behavioral requirement should come first.

## 14. A worked scenario for our successor

The following is a proposed design exercise, not a claim about a historical Google demo. It is broader than the current implementation scope: the [implementation work order](IMPLEMENTATION_WORK_ORDER.md) defers agents, restoration, restricted areas, and publication.

Ev creates a Wave to prepare a workshop. Its first object is a brief. Two collaborators join, and a research agent receives permission to read the brief and add proposals.

One collaborator comments beside the intended audience. Another edits the schedule. The research agent produces a list of sources, recording the version of the brief it used.

While the agent was working, the audience changed. Its result is still available, but the client identifies that it used an earlier revision. Ev asks for an update rather than letting the result silently replace current work.

The group accepts selected findings into the brief. A participant later makes an incorrect edit. They restore the relevant content through a new recorded contribution. The agent's sources and the acceptance decision remain inspectable.

Finally, the group publishes the approved brief on a website. The public view includes the intended attribution and media. A separate decision governs whether the private working discussion is shared.

This scenario exercises content identity, context, permissions, concurrency, agent participation, restoration, and publication without selecting a network or programming language.

## 15. Questions for the first behavioral specification

Before implementation, we should write examples and expected outcomes for:

1. **Objects:** What is the smallest independently editable and referenceable unit?
2. **Structure:** How do replies, documents, and interactive objects relate?
3. **Sharing:** What is the scope of a participant list and permission grant?
4. **Changes:** Which actions create records, and which merely affect local presentation?
5. **Causality:** How does a contribution identify the context it depends on?
6. **Acceptance:** What makes a contribution part of shared state?
7. **Conflicts:** Which concurrent actions combine automatically?
8. **Agents:** How are requests, delegation, results, and failures represented?
9. **History:** What must remain available for meaningful inspection and restoration?
10. **Portability:** What must another client receive to continue the work?

A later platform test could involve two people and one agent working on one document, including an anchored reply, a stale agent result, a concurrent edit, and reconnect recovery. The current [implementation work order](IMPLEMENTATION_WORK_ORDER.md) instead requires two independent human clients, live editing, anchored replies, and recovery; it explicitly defers agents. That work order governs the first implementation, not this earlier exploratory scenario.

## 16. Findings and limits

Our strongest conclusion is that Wave combined editable content, contextual conversation, participant boundaries, recorded change, and programmable collaboration into one environment.

Our strongest correction to the earlier architecture discussion is that signed history and replication are supporting mechanisms. The shared-state rules still need to be designed and validated in an ANProto-specific CRDT. ANProto's portable signed authorship and integrity are a product requirement; a future access-control layer such as Keyhive remains a separate concern.

This research has not established exact production behavior for every release, comprehensive offline editing, cryptographic confidentiality of private replies, full-fidelity migration, detailed deletion semantics, or a complete permission system. It also does not explain why the product failed; that would require a separate adoption and usability study.

The next protocol design should specify the signed contribution envelope, causal context, identity binding, access checks, and which responsibilities remain with SSB, AndFS, or another component.

## Source register

Original sources are preferred. Apache-hosted documents below preserve Google's historical specifications; the API slide deck is Google's presentation hosted on a mirror.

| Source | Evidence and limits |
| --- | --- |
| [Google launch announcement, May 2009](https://googleblog.blogspot.com/2009/05/went-walkabout-brought-back-google-wave.html) | Product concept and separation of product, platform, protocol; announcement rather than exhaustive specification |
| [Conversation model, October 2009](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.html) | Object vocabulary and relationships; explicitly a developing draft |
| [May 2009 federation draft transcript](references/google-wave/specs/federation/draft-protocol-spec-wayback-transcript.txt) | Early XMPP `request`/`delta` protocol and wave-level authority; pasted Wayback text, exact capture timestamp unknown |
| [July 2009 federation specification](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/wavespec.html) | Later Apache-hosted draft: wavelet hosting, XMPP/PubSub exchange, history, delivery, OT, and signer mechanisms; still marked work in progress |
| [Client-server whitepaper, May 2010](https://svn-eu.apache.org/repos/asf/incubator/wave/tags/wave-0.4-rc2/whitepapers/client-server-protocol/client-server-protocol.html) | Useful scope warning; explicitly not Google's production web-client protocol |
| [Google I/O API presentation, May 2009](https://docs.huihoo.com/google/io/2009/T_1200_Programming_With_For_Google_Wave.pdf) | Robot/gadget distinction, examples, API concepts; developer-preview material |
| [September 2009 preview announcement](https://googleblog.blogspot.com/2009/09/surfs-up-wednesday-google-wave-update.html) | Invitation-preview expansion and contemporary acknowledgment of missing features |
| [Read-only and restore, January 2010](https://googlewave.blogspot.com/2010/01/new-features-read-only-and-restore.html) | Shipped access and restoration changes; identifies reply-only as future work |
| [Robots API v2, March 2010](https://googlewavedev.blogspot.com/2010/03/introducing-robots-api-v2-rise-of.html) | Proactive robots, event/context controls, errors, attribution |
| [Embed API update, April 2010](https://googlewavedev.blogspot.com/2010/04/embed-api-improvements-viewing-public.html) | Public anonymous embedded reading |
| [Export announcement, November 2010](https://googlewave.blogspot.com/2010/11/exporting-your-waves.html) | Current-view and attachment export; not proof of full-fidelity portability |
| [Final steps, November 2011](https://googlewave.blogspot.com/2011/11/final-steps-for-google-wave.html) | Announced read-only and shutdown dates in 2012 |
| [Apache Wave overview](https://svn.apache.org/repos/infra/websites/production/wave/content/wave/about.html) | Retrospective project description and interaction summary |
| [SSB database documentation](https://github.com/ssbc/ssb-db) | Comparison source for signed feeds and application semantics; not a Google Wave source |

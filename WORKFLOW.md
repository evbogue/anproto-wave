# Wave workflow

This document specifies the intended ANProto Wave experience from discovery and collaboration through publication, catch-up, and personal archiving. It combines the current collaboration foundation with the publishing workflow and selected ideas from the original Google Wave. It is a product specification, not a claim that every action below is implemented.

The usual path for a collaborator is:

**Create → collaborate → optionally announce → publish → keep collaborating and publish updates → collapse into Archive.**

The usual path for someone outside the writing group is:

**Discover an announcement → optionally follow or discuss → receive a publication → read, discuss, or share it → collapse into Archive.**

Neither path is mandatory. A Wave can stay private, remain unpublished, be shared with a small group, or become public. Someone can finish with a Wave before anyone publishes it. Publication is repeatable; collapse is the final action in a person's active workflow, with explicit restoration available later.

## 1. What exists today

The current v2 browser implementation provides public shared text, fixed participants chosen at creation, whole-message and passage replies, signed contribution history, editing presence, local persistence, offline edits, reconnect, public export/import, and personal collapse/restore. It uses native HTML controls and structural CSS.

**Current v2 records are public and unencrypted.** The private drafts, restricted publications, announcement-only views, and access rules specified below require the next protocol and browser implementation. Hiding controls alone does not implement those boundaries.

| Capability | Current state | Intended next behavior |
| --- | --- | --- |
| Shared writing and replies | Implemented for public text with fixed editors | Preserve live collaboration within authorized working groups |
| Collapse and Archive | Implemented per identity in this browser | Preserve explicit restore; add independent following and unread state |
| Announcement and publication | Planned | Reveal chosen metadata, then release exact revisions to chosen audiences |
| Encrypted access and changing membership | Planned | Invite collaborators, share publications, and change future access |
| Following, unread navigation, and notifications | Planned | Catch up without conflating subscription with access |
| Search, filters, and personal organization | Planned | Find accessible active and archived work |
| Playback and revision restoration | Signed history exists; these interactions are planned | Inspect past states and restore content through a new recorded edit |
| Restricted side conversations | Planned | Discuss passages with a selected subset of people |
| Rich content and attachments | Message text is plain; profile images exist | Add formatting, files, and images to messages and publications |
| Polls, checklists, and other shared objects | Planned later | Add a small native object set before an extension platform |
| Automated contributors | Planned later | Attribute proposals and edits to an invited software identity |

The decisions below are the initial product defaults. Encryption construction, wire formats, and protocol conflict rules must be specified and verified before the corresponding controls ship. [DESIGN.md](DESIGN.md) describes the implementation; [PUBLISHING.md](PUBLISHING.md) develops the publication and encryption model; [ROADMAP.md](ROADMAP.md) sequences delivery; [VERIFICATION.md](VERIFICATION.md) records evidence.

## 2. The objects people work with

| Term | Meaning |
| --- | --- |
| Wave | The stable shared context connecting messages, collaborators, announcements, publications, and discussion |
| Message | An individually addressable piece of writing inside a Wave; a Wave may contain several |
| Working draft | A message's current editable state, available to its working group |
| Revision | A precise, reproducible state of a message, including referenced content objects |
| Announcement | A deliberately disclosed workspace listing for work whose contents may still be unpublished; also called a closed-message entry |
| Publication | An immutable release of a selected message revision, audience, byline, credits, and publisher signature |
| Audience | The people or public scope selected to receive a particular announcement, publication, or discussion |
| Thread | A conversation attached to a whole message or a passage |
| Epoch | A membership and encryption-key state; independent of revision and publication numbering |
| Archive | A person's collection of collapsed Waves; it preserves their retained content and access |

A Wave can contain one published message, another unpublished message, and several discussions at once. Publishing one message does not publish all other messages. A release involving several messages must list each selected revision explicitly. Collapse applies to the whole Wave.

## 3. Four independent kinds of state

Do not represent the whole workflow with one status field.

| Dimension | Question it answers | Initial behavior |
| --- | --- | --- |
| Discovery | Can I see that this Wave exists? | Only through an announcement addressed to me, content access, or already retained information |
| Content access | What can I read, edit, or share? | Grants identify working content or particular publications; listing visibility grants neither |
| Following | Do I want activity updates? | A personal subscription to activity I am permitted to see |
| Archive | Do I want this Wave in my active viewer? | Collapse removes it; only explicit restoration returns it |

Unread state is personal too: it records which accessible changes a person has reviewed. Publication state belongs to individual messages and audiences. A message may have a public revision while collaborators work on a newer private revision.

Examples:

- An announcement viewer can follow a Wave without reading its draft or becoming a collaborator.
- A collaborator can unfollow a Wave while retaining editing access.
- A publication reader can share a received revision without acquiring access to later private edits.
- A collapsed Wave can retain its follow preference and accumulate unread changes, while staying out of the active viewer and suppressing notifications until restored.

## 4. Who can do what

The initial sharing policy is permissive: **anyone with access to a Wave's contents can change viewership for content they can access.** No designated publisher or approval from other authors is required. Seeing an announcement or joining its discussion alone does not count as content access.

| Action | Announcement viewer | Publication reader | Working collaborator |
| --- | --- | --- | --- |
| See disclosed listing metadata | Yes, if addressed to them | Yes, for accessible information | Yes |
| Follow, unfollow, or collapse locally | Yes | Yes | Yes |
| Read unpublished working text and private working history | No | No | Within their grant |
| Read a published revision | Only after receiving access | Within their grant | Within their grant |
| Participate in audience discussion | In the discussion audience | In the discussion audience | In the discussion audience |
| Edit working text | No | No | Within their grant |
| Change viewership or share a publication | No | For received content | For accessible content |
| Invite someone into the working group | No | No | Within the working group they can manage |
| Publish a new working revision | No | No | For an accessible draft |
| Play back history | Announcement history made available to them | Released history made available to them | Authorized working history |
| Restore an earlier draft revision | No | No | For a draft they can edit |

“Publisher” names the person performing a release, not a separate privileged role. A collaborator can publish directly. A reader can share an existing publication with others, but cannot alter its text, rewrite its byline, impersonate its authors, or release an unseen draft.

For the first membership implementation, working collaborators can invite and remove collaborators within their working group without a separate approval round. This does not give a publication reader control over draft membership. Named groups and more granular permissions can follow later; the first interface uses explicit identities and, where supported, a public audience.

## 5. The workspace

Use plain HTML headings, lists, articles, buttons, textareas, and expandable details. Keep the Wave list and selected content legible on wide and narrow screens.

Each accessible Wave listing should show:

- The title disclosed to this viewer.
- The collaborator or author names disclosed to this viewer.
- An understandable state such as **Being worked on**, **Published**, or **Published · newer draft available to you**.
- The latest activity this viewer is allowed to know about.
- Unread and following indicators when those features are available.

Do not expose private edits through a public listing's timestamps, counters, presence indicators, or “newer draft” label. “Being worked on” is an intentionally published status, not a live feed of private editor activity.

The selected Wave offers the views available to the current identity: **Working draft**, **Published**, **Discussion**, and **History**. An announcement-only viewer gets the listing and its available discussion, with a clear **Contents not published to you** message. Do not render an empty editor that implies the contents are missing or editable.

The interface always identifies the current identity, the displayed revision or publication, the relevant audience, and local save/connection status. Shared actions identify the affected content and people. Personal actions identify their local effect.

## 6. Create and collaborate

Choose **New Wave**, enter a title, and choose writing partners. The creator joins the working group. Creation does not automatically announce the Wave or publish any text.

Collaborators add messages, edit existing shared text, reply to whole messages, and use **Reply here** on a selected passage. Edits synchronize while typing; **Done** ends the editing session without publishing a revision. The working conversation remains useful without any publication.

Retain the existing editor behaviors: stable passage anchors, original quoted text, signed contributions, local saving, offline work, reconnect, and caret preservation during remote changes. If an anchored passage is deleted, keep the reply and its original quote and indicate that the passage was removed. Do not silently attach it to similar text elsewhere.

Show **Unsaved typing**, **Saved locally · awaiting synchronization**, and **Synced** distinctly. Presence is transient and visible only within its authorized scope. Being present, editing, following, and endorsing a publication are separate facts.

### Invite to collaborate

**Invite to collaborate** grants working access. **Share publication** grants access to released content. These must be separate actions, even when both are reached through **Viewership**.

An invitation identifies the person, working scope, and historical access. Default to the current starting revision plus subsequent work. Sharing earlier working history is an explicit additional choice; a new invitation does not automatically disclose every previous private conversation or removed attachment.

Accepting an invitation opens the available starting state and explains any unavailable earlier history. Removing a collaborator ends future working access after the membership transition; retained copies and already delivered keys cannot be recalled. Invitations, acceptance, and membership changes appear in authorized history.

Creating a Wave or accepting a collaboration invitation follows it by default. Merely opening a link does not. A new invitation never automatically restores a previously collapsed Wave.

## 7. Announce work before publication

**Announce** creates a workspace listing for a selected audience. A collaborator chooses the disclosed title, collaborator names, status, and whether audience discussion is open. These are deliberate disclosures, not an automatic copy of all private metadata.

Someone outside the Wave can therefore see that Alice and Bob are working on “Workshop plan,” follow that work, and discuss its announcement without reading the draft. The listing does not grant access to unpublished messages, private replies, working history, or viewership controls.

Announcement discussion is attached to the stable Wave or announced message and survives later publication. Each discussion retains its own audience. Publishing a message more widely does not automatically publish earlier restricted discussion alongside it.

An announcement is optional. Unannounced private Waves do not appear in outsiders' discovery results. Following an announcement does not reserve or guarantee access to the eventual publication; it produces a publication notification only when that person can access the release or a separately disclosed announcement about it.

Changing an announcement's title or status is a new recorded update. Previously received metadata remains in recipients' possession. Withdrawing future discovery does not erase that history.

## 8. Publish an exact revision

**Publish** releases selected working content. **Publish update** releases a later revision of an already published message. Both use the same explicit review of the release:

1. Save the acting collaborator's pending edits and capture a reproducible revision.
2. Show the exact text and selected attachments or object snapshots to be released.
3. Show the intended audience: named recipients or public, plus any existing audience selection being reused.
4. Show the byline, contribution credits, and supporting history included with this release.
5. Identify which publication this release updates, when applicable.
6. On the acting person's publish action, sign and save that exact release and distribute it according to its audience.

No other person's approval is required. The review is the publisher choosing what they release. If another collaborator types while it is open, the captured preview does not change under the publisher. **Refresh revision** captures newer work and replaces the preview explicitly.

A publication is immutable. Corrections create a new publication. A collaborator's newer draft does not change what readers see until another release. Each audience sees its latest applicable publication while earlier publications remain addressable.

If two people independently publish updates to the same preceding publication, preserve both releases. When neither explicitly succeeds the other, show **Concurrent publications** with both publishers and revisions rather than presenting arrival order as an editorial decision. A subsequent publication can explicitly supersede both after a collaborator reviews the result. A reader only sees the concurrent releases addressed to them.

Bylines express editorial authorship; signed editing history records actual contributions; the publisher's signature identifies who authorized the release. Naming someone in a byline does not claim that person separately approved it. A release can include selected supporting evidence without exposing the entire private working history.

The initial publication UI selects one message at a time. A later multi-message release must preview each exact revision and cannot include unpublished siblings merely because they share a Wave.

## 9. Change viewership and share released work

**Viewership** shows separate scopes for the announcement, working group, publications, and discussions. It must not be one ambiguous “public/private” switch that silently moves all four together.

| Control | Effect | Who can use it |
| --- | --- | --- |
| Change announcement audience | Change future distribution of disclosed listing metadata | People with content access in the relevant Wave scope |
| Invite to collaborate | Grant current working access with the selected historical scope | Working collaborators |
| Share publication | Deliver an existing immutable revision and attribution to another audience | Anyone with access to that publication |
| Change publication audience | Change intended future delivery for the selected message/publication scope | Anyone with content access to that scope |
| Change discussion audience | Share or restrict the selected accessible discussion explicitly | Content participants in that discussion scope; announcement-only commenters cannot change Wave viewership |

Sharing a publication records the original publication reference, the new audience, and the sharing identity. Preserve the original publisher, text, byline, credits, and evidence. Re-sharing an older revision must not replace a newer revision already available to a recipient simply because the share action happened later.

Before expanding access, show exactly which existing publication or discussion will be delivered. Before narrowing access, show which future deliveries are affected. Existing copies cannot be recalled. A private reply thread does not become public because its parent message is published.

Treat audience choices as reusable defaults for subsequent releases, not as permission to publish future drafts automatically. Each release still identifies its audience. If a default changes after a publication preview was opened, show the difference and require the publisher to review the audience again.

Concurrent viewership or membership changes must not silently produce a broader audience than someone selected. The protocol must define deterministic reconciliation and authorization. The UI must surface an unresolved concurrent change for review before treating a dependent release as delivered. Exact record and reconciliation rules are implementation prerequisites, not behavior supplied by the current text CRDT.

## 10. Follow, catch up, and manage notifications

**Follow** subscribes to permitted activity. **Unfollow** stops that subscription without removing access, deleting content, or collapsing the Wave. Merely browsing a public publication or announcement does not follow it. Creating a Wave or accepting a collaboration invitation follows it by default; explicitly unfollowing remains respected after later edits or replies.

Default subscriptions follow the viewer's scope:

- Collaborators receive updates about accessible working changes, replies, publications, and membership changes.
- Publication readers receive updates about publications available to them and discussion they can read.
- Announcement viewers receive disclosed announcement changes, available announcement discussion, and releases they become eligible to read.

Private activity must not generate a public count, snippet, badge, email, or notification. Coalesce bursts of edits into useful updates. Suppress redundant notifications for a Wave someone is already viewing and for their own actions. Begin with in-app updates; optional email or operating-system delivery can be added later with explicit user preferences.

### What changed since I last visited?

Track a read position for each identity and accessible content stream. A new message, reply, or substantive edit can make content unread. Presence pings and sync retries do not. Reading the public publication does not mark private draft activity as read for a collaborator.

Provide **Next unread**, changed-passage highlighting, and **Mark as read**. Opening a long Wave must not silently mark every hidden thread as read. The initial rule is to mark displayed changes as read when their content is brought into view; **Mark as read** explicitly marks all currently accessible changes in the Wave.

Show edits as understandable contributions rather than one unread event per keystroke. A deleted passage can still have an unread change and a retained quote. An updated publication can offer a comparison against the reader's previous publication without exposing intervening private edits.

Following, read positions, and notification preferences are personal data. Initially keep them per identity in this browser, like Archive. Cross-device synchronization requires an explicit personal-state design and does not belong in public conversation exports.

## 11. Discuss in context, including private side conversations

Keep three discussion scopes visible: working discussion for collaborators, audience discussion around an announcement or publication, and restricted side conversations for selected people.

General audience comments reference the stable Wave or message. A reply to published text identifies the publication, selected passage, and original quote. Publishing an update does not silently reattach that reply to different text. Readers can inspect its original context and, separately, the latest publication they can access.

**Discuss privately** starts a side conversation attached to an accessible message or passage. Choose recipients explicitly. Show its audience beside the composer and thread. Its membership is independent of the parent Wave's broader audience.

For the initial private-discussion feature, recipients must already have access to the referenced parent content. If they do not, first use the appropriate invitation or publication-sharing action. This avoids silently disclosing a private passage through an invitation preview.

People outside a private side conversation should not receive its text, participant list, activity counters, or a placeholder revealing that it exists. Any later sharing of the thread is an explicit action by a person with access to it. Publication never sweeps side conversations into its release by default.

Keep private side conversations separate from alternative drafts: a private reply discusses content; it does not create a second editable version of the parent message.

## 12. Playback, comparison, and restoring a revision

**History** offers readable groups of contributions and the underlying signed evidence. **Playback** reconstructs recorded states in order so someone can understand how an accessible message developed. It does not rerun tools, agents, notifications, or external actions.

Readers see released publications and any history explicitly included with them. Collaborators see only the working history covered by their grant. Missing history is identified as unavailable rather than fabricated from the current text.

**Compare revisions** shows additions, removals, changed attachments, and supported object changes between two accessible states. This helps with both catch-up and recovery.

**Restore revision** is available to someone who can edit the working draft:

1. Select an accessible earlier revision.
2. Preview its difference from the current working draft.
3. Choose **Restore revision** to create a new signed edit that brings that content forward.
4. If the current draft changed during the preview, refresh the comparison before applying it.

Restoration retains intervening history and preserves original publication snapshots and reply references. It does not restore old membership, resurrect revoked grants, roll back follow/read/archive preferences, or republish anything automatically. Publishing the restored draft requires a separate release.

Use **Restore revision** for content recovery and **Restore from Archive** for returning a Wave to the viewer. The current UI's **Restore** and **Restore Wave** controls perform only the latter.

## 13. Find and organize work

Search titles, disclosed names, and content available to the current identity. Announcements are searchable only by disclosed metadata and accessible discussion; private drafts must not leak through snippets, result counts, suggested terms, or sorting timestamps.

Provide filters for **Working**, **Published**, **Following**, **Unread**, and **Archived**. Working and Published may both apply to the same Wave. Their results are viewer-relative: a reader cannot infer an unpublished revision from a collaborator-only Working state.

The default active list and default search exclude collapsed Waves. **Archive** and an explicit **Include archived** search option expose retained archived results. Opening an archived result displays its archived state and a restore action; it does not silently restore it.

Add personal labels and saved searches after basic search and filters. Saved searches can combine accessible content, participants, and state, for example “unread publications I follow.” Labels and saved searches affect the person's organization, not another participant's view or content access.

Wave links identify stable shared objects; publication and passage links identify exact context. A link alone does not grant access or override Archive. When access is absent, show only information the person is permitted to discover.

## 14. Rich content, attachments, and shared objects

Add headings, lists, emphasis, links, images, and file attachments without losing message identity, signed attribution, anchored replies, or offline recovery. The first text editor remains the baseline while rich-text semantics are implemented and tested.

Attachments belong to a content scope. Their bytes and previews follow the same access rules as that content. A publication includes only explicitly selected files, images, and object representations; it must not expose unrelated working uploads. Identify each released asset precisely so replacing an image later does not change an older publication.

Show upload and local availability status. If a necessary asset is missing, do not claim that the publication is fully delivered. Downloads and exports should preserve filenames and useful types together with the verifiable references required by the format. Removing an attachment from the current draft does not imply erasing copies in earlier publications.

Start interactive content with native **checklists** and **polls**:

- A checklist contains stable item identities, labels, completion state, and recorded changes.
- A poll contains a question, stable choices, its voting audience, and identifiable signed votes. Anonymous voting is a separate future design.
- Working objects can change live. A publication initially captures an explicit snapshot of an object.
- A live audience poll, if offered, is visibly a separate live object with its own audience and history. It cannot silently mutate an immutable published snapshot.

Maps, drawings, scheduling widgets, and third-party gadgets can come later. Do not require a general extension runtime to deliver the first useful shared objects. Their data should remain exportable and intelligible without the original widget provider.

## 15. Automated contributors

An automated contributor is an explicitly invited software identity with a visible name, scope, and contribution history. It can help summarize accessible work, research a question, or propose a revision. Its output uses the same stable message and passage references as human contributions.

Start with **Request contribution**: a person chooses the task and accessible input, and the software returns a separately attributed reply or proposal. Record the requested scope and input revision. If the draft changed while the job ran, label the result as based on an earlier revision and let a collaborator compare it before applying it.

The first automation feature is request-driven and proposes work rather than silently replacing shared text. A later explicit automation grant may allow direct edits or proactive contributions. Granting such capability is distinct from merely following a Wave or appearing in an announcement.

Do not attribute a software-generated edit to a human merely because that person requested it. Record the software signer and the requesting identity separately. Display failures and retries without duplicating previously accepted contributions.

The permissive human viewership policy does not by itself authorize a background job to publish, change recipients, or contact outside services. Those actions require an explicit task or automation grant covering them. Playback and revision restoration reproduce recorded content, not external side effects.

## 16. Collapse into Archive

**Collapse Wave** ends the current person's active workflow. It applies to every message and thread in that Wave, not just the visible message. It is available before publication, after publication, or after many updates.

Collapse must:

1. Finish saving current shared-text edits locally. If saving fails, leave the Wave open and explain the failure.
2. Require an unfinished new message or reply to be added or explicitly closed first. Do not silently discard its text.
3. Persist the personal archive preference.
4. Remove the Wave from the active list and remove its conversation from the viewer.
5. Keep its records, retained assets, recoverable drafts, and pending outbox intact.

Another active Wave may then be selected; if none remain, show the empty state. The Archive lists retained titles and offers **Restore from Archive**. Restoration opens the Wave with currently accessible content, retained history, and any received updates.

| Event while collapsed | Required outcome |
| --- | --- |
| Browser reload or reconnect | Stay archived |
| New edit, reply, publication, or membership invitation | Stay archived |
| Import of the same Wave's records | Stay archived |
| Opening its share link or an archived search result | Show an archived notice and explicit restore action |
| Incoming permitted changes | Retain them through normal synchronization; accumulate unread state when supported |
| Notification trigger | Suppress delivery and active-list resurfacing while archived |
| Restore from Archive | Return to active view, retain unread changes, and resume the previous follow preference |

Archive does not change anyone else's view, end collaboration for the group, revoke access, withdraw a publication, delete signed history, or advance an encryption epoch. The Wave may remain active for Bob after Alice collapses it.

Collapse leaves the follow preference intact but overrides its notifications while archived. Restoring an unfollowed Wave leaves it unfollowed. Restoring a followed Wave resumes future updates; it should offer a catch-up view rather than send a backlog of individual notifications.

Current Archive membership is stored per identity and browser origin, survives reload, and is excluded from relay traffic and public exports. Clearing browser storage clears that preference. Preserve this behavior until a separate cross-device personal-state mechanism is designed.

Folding an inline reply thread only changes that thread's presentation. **Collapse Wave**, **Restore from Archive**, and **Restore revision** are three different actions.

## 17. Offline work, failures, and recovery

Keep reading cached accessible content and editing authorized working drafts offline. Save signed changes in the durable outbox and reconcile them on reconnect. Preserve the existing recovered-draft path when a contribution cannot be signed or accepted.

Collapse and archive restoration work offline against local data. Following, read positions, and personal organization should also work locally once implemented. Network-dependent invitations, shares, and publications must show **Pending delivery** until the relevant exchange succeeds; a click is not proof that another person received content.

An offline publication can preserve an exact proposed revision and audience locally. After reconnect, recheck the applicable membership and audience state before sending it. If access changed or a concurrent viewership change needs review, keep the proposal recoverable and ask the person to review it rather than silently publishing to a different audience.

Exports preserve the authorized records and assets needed for their stated purpose. Public exports contain neither private keys nor personal follow/read/archive preferences. Future encrypted backups need an explicit key-recovery and history-retention design; the existing public export is not an encrypted identity backup.

Synchronization across independent infrastructure remains planned. Replacing a relay must preserve content identities, signatures, publication references, access rules, and local viewer choices. This document does not promise Google's original federation protocol or reuse its concurrency algorithm.

## 18. Implementation sequence and acceptance scenarios

The immediate scope is the preservation checkpoint in [WORK_ORDER.md](WORK_ORDER.md), recorded in [CHECKPOINT.md](CHECKPOINT.md). Stages B–E remain future work after the interactive timeline milestone. Stage B is an integration target delivered through the smaller gates in [ROADMAP.md](ROADMAP.md), not one implementation ticket.

Deliver complete behaviors in stages. Each stage must identify its actual access guarantees separately from its visible interface.

### Stage A: preserve the collaboration foundation

Maintain live shared text, passage replies, signed history, offline/reconnect behavior, and personal Archive. Continue using simple HTML controls. Test local save before collapse, unfinished composer handling, archive persistence, import behavior, and identity isolation. These are existing behaviors, not new publishing guarantees.

### Stage B: discovery, access, and publication

Implement encrypted working scopes, dynamic invitations, announcement listings, publication snapshots, audience discussion, and the permissive viewership policy. Use three independent browser identities and inspect transport, storage, records, and decryption results as well as the UI.

The acceptance scenario is:

1. Alice creates an unannounced Wave with Bob. Reader Carol cannot discover its private contents or metadata.
2. Alice and Bob write together and make a private passage reply.
3. Alice announces selected metadata to Carol. Carol sees the title, chosen collaborator names, and **Being worked on** status, but cannot read the draft or change viewership.
4. Carol discusses the announcement. Her comment does not grant draft or sharing authority.
5. Alice previews revision A. Bob continues typing. Alice's release still contains exactly revision A and its selected attribution.
6. Carol receives publication A and can share it with another reader without Alice or Bob's approval. She cannot edit A, change its attribution, or publish Bob's unseen changes. Re-sharing A later does not displace a newer release that reader already has.
7. Bob publishes revision B to a review audience. Other readers remain on A until a publication is addressed to them.
8. Audience discussion remains in its chosen scope. Passage replies to A keep A's quote and identity after B becomes available.
9. Either collaborator invites another collaborator with a current starting revision. Earlier private history is available only if explicitly included.
10. A future-access removal and an offline return produce the specified membership outcome without pretending previously delivered content was recalled.
11. Alice collapses the Wave. Bob and Carol retain their own active views. Updates and reload do not restore Alice's Wave; explicit restoration does.

Also exercise concurrent publications, an audience change during an open publication preview, and an offline release after membership changes. Preserve both independent publications, require review of a changed audience, and keep an unauthorized or unresolved release pending without sending its content.

### Stage C: attention and retrieval

Add following, scoped unread markers, **Next unread**, comparisons between received publications, basic search, and filters.

Verify that Carol can follow the announcement without joining the Wave; inaccessible edits produce no signals; opening one thread does not mark the whole Wave read; unfollow preserves access; and collapse suppresses notifications while retaining the subscription preference. Search must find authorized archived content only when Archive or **Include archived** is selected. Restoring shows accumulated unread changes without replaying a notification backlog.

### Stage D: history, richer content, and private discussions

Add playback, revision restoration, formatting, attachments, private side conversations, and personal labels/saved searches. Verify that revision restoration creates a new contribution, never removes intervening history, and leaves publication snapshots and permissions unchanged. Verify that files and private discussion remain outside unrelated publications, search results, and exports.

### Stage E: shared objects and automated help

Add native checklists and polls, then request-driven automated contributions. Verify stable object snapshots in publications, attributed changes, stale-result handling, and recovery without repeated external actions. Evaluate broader gadgets, proactive automation, groups, and external embedding only after these smaller interactions are useful and verifiable.

## 19. What we borrow from Google Wave

Keep the combined conversation/document experience, inline discussion, live collaboration, useful history, following, unread navigation, and room for interactive objects and automated participants. Preserve our explicit publication boundary and personal collapse behavior.

The historical distinctions matter:

- Google's launch described live collaborative editing, rich content, inline replies, and playback. Our announcement and exact-revision publication cycle is an additional product structure. [Original announcement](https://googleblog.blogspot.com/2009/05/went-walkabout-brought-back-google-wave.html)
- Google separated following from opening a public Wave. Its archived followed Waves returned on updates; our collapsed Waves require explicit restoration. [Following behavior](https://googlewave.blogspot.com/2009/11/follow-your-waves.html)
- Google shipped read-only participants and restoration that appended an earlier state without deleting history. Our current policy permits readers with content access to share it more broadly. [Read-only and restoration](https://googlewave.blogspot.com/2010/01/new-features-read-only-and-restore.html)
- Unread navigation and notifications were part of its later product. [May 2010 update](https://googlewave.blogspot.com/2010/05/google-wave-available-for-everyone.html)
- Its conversation specification described restricted private replies as separate wavelets; that specification is not evidence that every preview feature shipped in every release. [Preserved conversation specification](references/google-wave/specs/conversation/convspec.rst)
- Gadgets supplied interactive objects, while robots could contribute to the surrounding conversation. Our native objects and explicitly scoped software identities carry those ideas forward incrementally. [Extensions](https://googlewave.blogspot.com/2010/03/finding-fun-and-useful-extensions-for.html), [Robots API](https://googlewavedev.blogspot.com/2010/03/introducing-robots-api-v2-rise-of.html)

The [reference collection](references/google-wave/README.md) preserves the historical evidence. Product decisions in this document describe ANProto Wave, not claims of complete feature parity with Google Wave.

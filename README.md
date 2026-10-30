# ANProto Wave

ANProto Wave is a browser workspace for shared writing, passage replies, and portable signed history. The current v2 prototype supports live collaboration, offline edits, reconnect, public export/import, and personal Archive/Restore. **All current conversation records are public and unencrypted, and editors are fixed when a Wave is created.**

The product direction is to publish exact attributed revisions while collaborators keep developing a working draft. Encrypted drafts, announcements, publication records, and audience discussion are planned; they are not available in the current demo.

The immediate priority is to preserve a resumable collaboration checkpoint while the Wiredove/evbogue.com reading-and-reply experiment proceeds. Start with the [work order](WORK_ORDER.md), [current checkpoint](CHECKPOINT.md), and [roadmap](ROADMAP.md).

## Current demo

1. Create a Wave with a fixed set of editor public keys.
2. Write together, reply to messages or selected passages, and inspect signed history.
3. Work offline and reconnect to exchange retained edits.
4. Collapse the Wave into your personal Archive, then explicitly restore it. Other participants keep their own views.

## Planned publishing workflow

Collaborate → optionally announce → publish an exact attributed revision → discuss → keep writing → publish an update. Earlier publications and their discussion context remain addressable. The intended policy lets a person release content they can access without another author's approval.

[Wave workflow](WORKFLOW.md) specifies this intended lifecycle and distinguishes implemented behavior from planned stages.

A **revision** identifies a state of a message. An **epoch** identifies a membership and encryption-key state. A **publication** releases a revision and selected attribution to an audience. Publication history and cryptographic epochs advance independently.

## Project guide

- [Direction](DIRECTION.md): product intentions and protocol principles.
- [Wave workflow](WORKFLOW.md): the complete path from creation to collapse, including restore and viewer ownership.
- [Publishing and privacy](PUBLISHING.md): the planned author, audience, encryption, and publication model.
- [Roadmap](ROADMAP.md): implementation sequence and acceptance evidence.
- [Design](DESIGN.md): the existing collaboration engine and browser interactions.
- [Protocol](PROTOCOL.md): the implemented v2 signed-record format and merge rules.
- [Verification](VERIFICATION.md): dated results for the collaboration foundation and the next verification targets.
- [Attribution](VENDOR.md): dependency and asset provenance.

## Implementation baseline

The development checkout contains the v2 collaboration foundation: shared text editing, passage replies, signed history, browser persistence, offline work, reconnect, public export/import, and a durable loopback relay. Its records are public and unencrypted, and each Wave has a fixed set of editors. The interface uses native HTML elements and structural CSS. [DESIGN.md](DESIGN.md) records that baseline.

After the interactive timeline milestone, Wave resumes with a specified encryption/access model, followed by small implementation slices for encrypted drafts, publication records, and audience views. [PUBLISHING.md](PUBLISHING.md) describes the intended behavior; [ROADMAP.md](ROADMAP.md) turns it into implementation and verification steps.

## Run the collaboration foundation

```sh
npm start
```

Open <http://127.0.0.1:8098>. The Node service binds to loopback and saves acknowledged public records in `.wave-data/`. Production dependencies are included in the repository.

Use independent browser profiles for independent signing identities. In each profile, open **Edit profile**, set a self-asserted name, and copy the public key. Create a Wave with the other profile's key in its participant list, then open its share link in that profile on the same local relay. Keep the origin consistent: `127.0.0.1`.

Add a message, choose **Edit**, and type. Changes are signed, saved locally, and exchanged while typing. **Done** closes the editor. Select a passage and choose **Reply here** to create an inline thread. History shows signed contributions. Concurrent edits converge; authors review the resulting prose together.

**Work offline** retains edits locally; **Reconnect** exchanges pending contributions. Recovery & inspection provides public export/import and the read-only **Legacy notebooks** viewer. Signing keys live in browser storage, so retaining that storage preserves the identity; public exports preserve conversation records. New insertion batches accept up to 4,096 UTF-16 units. The editor saves typing in batches and reports local save and synchronization status.

**Collapse Wave** saves current edits and moves the Wave into **Archive** for this identity in this browser. Add or close unfinished message/reply composers first. **Restore** returns it to the viewer. New activity and reloads leave archived Waves archived. Archive preferences remain local and are excluded from public exports.

## Verify

```sh
npm test
npm run benchmark
```

The automated suite exercises signatures, merge convergence, passage anchors, causal authorization, relay durability, and storage isolation. The benchmark measures replay of actual signed contributions.

`npm run test:browser` runs the optional Playwright acceptance harness with Chrome and isolated browser storage contexts. Set `PLAYWRIGHT_MODULE` to an externally supplied Playwright `index.mjs` path and `CHROME_PATH` when needed. The harness uses a temporary relay store and writes screenshots into `verification/`.

[VERIFICATION.md](VERIFICATION.md) records the dated results and their test conditions. Earlier plans and research are in [the archive](docs/archive/README.md); original Wave sources are in the [reference collection](references/google-wave/README.md).

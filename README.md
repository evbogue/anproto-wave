# ANProto Wave

We are building ANProto Wave, a browser workspace where partners write messages together, publish them to wider audiences with authorship and contribution credits, and keep improving them as living documents. Encrypted working drafts give authors room to collaborate. Each publication moves an approved revision across the privacy boundary to a chosen audience. Readers can discuss both published messages and work that authors have announced is underway.

We are building this experience with simple HTML elements and structural CSS. The first demonstration follows two authors and an audience member across three browser tabs: write together, discuss a closed message, publish, continue editing privately, and publish an update.

The project also develops the protocols behind that experience: local ownership, offline collaboration, signed contributions, deterministic text merging, encrypted access, and distribution across independently operated infrastructure.

## How a Wave works

1. **Write together.** Authors and invited partners edit a shared working draft and reply to passages. Contributions retain their signing identity.
2. **Announce the work.** Authors can publish a closed-message entry containing a chosen title, collaborator names, and status. The audience can discuss that entry while the draft develops.
3. **Publish.** Authorized authors release a particular revision, its byline, and selected contribution credits to a chosen audience.
4. **Keep writing.** Authors continue editing the working draft while readers see the latest publication available to them.
5. **Publish an update.** A later publication advances the audience's view. Earlier publications and the discussions attached to them remain addressable.

A **revision** identifies a state of a message. An **epoch** identifies a membership and encryption-key state. A **publication** releases a revision and selected attribution to an audience. Publication history and cryptographic epochs advance independently.

## Project guide

- [Direction](DIRECTION.md): product intentions and protocol principles.
- [Publishing and privacy](PUBLISHING.md): the planned author, audience, encryption, and publication model.
- [Roadmap](ROADMAP.md): implementation sequence and acceptance evidence.
- [Design](DESIGN.md): the existing collaboration engine and browser interactions.
- [Protocol](PROTOCOL.md): the implemented v2 signed-record format and merge rules.
- [Verification](VERIFICATION.md): dated results for the collaboration foundation and the next verification targets.
- [Attribution](VENDOR.md): dependency and asset provenance.

## Implementation baseline

The development checkout contains the v2 collaboration foundation: shared text editing, passage replies, signed history, browser persistence, offline work, reconnect, public export/import, and a durable loopback relay. Its records are public and unencrypted, and each Wave has a fixed set of editors. The interface uses native HTML elements and structural CSS. [DESIGN.md](DESIGN.md) records that baseline.

The next implementation milestone adds encrypted drafts, publication records, audience discussion, and distinct author and reader views. [PUBLISHING.md](PUBLISHING.md) describes the intended behavior; [ROADMAP.md](ROADMAP.md) turns it into implementation and verification steps.

## Run the collaboration foundation

```sh
npm start
```

Open <http://127.0.0.1:8098>. The Node service binds to loopback and saves acknowledged public records in `.wave-data/`. Production dependencies are included in the repository.

Use independent browser profiles for independent signing identities. In each profile, open **Edit profile**, set a self-asserted name, and copy the public key. Create a Wave with the other profile's key in its participant list, then open its share link in that profile on the same local relay. Keep the origin consistent: `127.0.0.1`.

Add a message, choose **Edit**, and type. Changes are signed, saved locally, and exchanged while typing. **Done** closes the editor. Select a passage and choose **Reply here** to create an inline thread. History shows signed contributions. Concurrent edits converge; authors review the resulting prose together.

**Work offline** retains edits locally; **Reconnect** exchanges pending contributions. Recovery & inspection provides public export/import and the read-only **Legacy notebooks** viewer. Signing keys live in browser storage, so retaining that storage preserves the identity; public exports preserve conversation records. New insertion batches accept up to 4,096 UTF-16 units. The editor saves typing in batches and reports local save and synchronization status.

## Verify

```sh
npm test
npm run benchmark
```

The automated suite exercises signatures, merge convergence, passage anchors, causal authorization, relay durability, and storage isolation. The benchmark measures replay of actual signed contributions.

`npm run test:browser` runs the optional Playwright acceptance harness with Chrome and isolated browser storage contexts. Set `PLAYWRIGHT_MODULE` to an externally supplied Playwright `index.mjs` path and `CHROME_PATH` when needed. The harness uses a temporary relay store and writes screenshots into `verification/`.

[VERIFICATION.md](VERIFICATION.md) records the dated results and their test conditions. Earlier plans and research are in [the archive](docs/archive/README.md); original Wave sources are in the [reference collection](references/google-wave/README.md).

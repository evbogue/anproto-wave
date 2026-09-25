# ANProto Wave

A local shared-notebook demo using ANProto signatures and Wiredove's CSS and avatars.

## Run

```sh
npm start
```

Open http://127.0.0.1:8098. No installation step or remote services required.

Load the two-person example, switch between Alex and Sam, reply, edit a note, inspect history, and resolve the competing revisions. Edit profile to set a name and upload a photo. The example identities are both controlled by this browser.

For independent browsers, create an identity in each. Copy the public key shown in Edit profile into the participant list when creating a Wave. Exchange Export files with Import, or copy the exported JSON and use Import pasted notebook. Import merges public signed records and avatar images; private keys are never exported. Keys live in browser storage, so clearing site data loses them. Membership is fixed and all members can edit. Data is public/non-encrypted, with manual exchange only. Storage uses localStorage and is subject to browser quota; a failed save displays an error. Keep exports of important work.

Revisions contain complete text, preserving alternatives when edits are concurrent. Reply anchors target a whole note, not a text range. Missing or incompatible references are not applied. The profile shown is the latest signed profile by timestamp with a deterministic ID tiebreaker. No AI service runs in this demo.

```sh
npm test
```

See [VENDOR.md](VENDOR.md) for copied source attribution and the boundary between Wiredove reuse and the demo's local profile format.

## Research

Historical baseline: Google Wave's developer preview was unveiled at Google I/O on May 28, 2009. See the [verified chronology](GOOGLE_WAVE_RESEARCH.md#verified-chronology) for the separate public-access, development, and shutdown milestones. The [implementation work order](IMPLEMENTATION_WORK_ORDER.md) describes proposed work; the app above remains the local signed-notebook demo.

- [Offline Google Wave references](references/google-wave/README.md) — original specifications, three Google-published interface screenshots, and Google I/O video links with dates and provenance.
- [How we think Google Wave worked](GOOGLE_WAVE_RESEARCH.md) — sourced design research covering the platform, collaboration model, automated participants, and implications for ANProto Wave.

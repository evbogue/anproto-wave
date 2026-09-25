# Google Wave reference collection

Retrieved 22 September 2026 for ANProto Wave implementation research. These are historical source documents and actual Google-published screenshots, not screenshots of our demo or generated reconstructions.

## Start here

1. Inspect `screenshots/inbox-2009.png` for the overall workspace and inline conversation structure.
2. Read `specs/conversation/convspec.rst` for the conversation model.
3. Watch the 2009 product demonstration linked below to study interaction over time. Still images cannot prove live editing behavior.
4. Read the federation and client/server documents for architectural distinctions, not as requirements to reuse Google's tools.

The `.rst` files are the original readable text sources, not our summaries. The `.html` files preserve the published rendering. Documents are unmodified downloads; some external links and referenced resources may be dead or require a network connection. The downloaded blog pages are provenance snapshots, not fully self-contained offline websites; scripts and remote assets were not mirrored.

## Specifications downloaded

Source archive: [Apache Wave whitepapers](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/).

| Local file | Original source | Read for |
| --- | --- | --- |
| [Conversation HTML](specs/conversation/convspec.html) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.html) | Conversation structure, blips, threads, inline replies |
| [Conversation text](specs/conversation/convspec.rst) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.rst) | Agent-readable original source |
| [Federation HTML](specs/federation/wavespec.html) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/wavespec.html) | Hosted shared state, operations, server-to-server exchange |
| [Federation text](specs/federation/wavespec.rst) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/wavespec.rst) | Agent-readable original source |
| [Federation schema](specs/federation/waveschema.rnc) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/federation/waveschema.rnc) | Formal wire schema, supplementary rather than required reading |
| [Client/server HTML](specs/client-server-protocol/client-server-protocol.html) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/client-server-protocol/client-server-protocol.html) | Prototype client/server interaction |
| [Client/server text](specs/client-server-protocol/client-server-protocol.rst) | [Apache](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/client-server-protocol/client-server-protocol.rst) | Agent-readable original source |

These are historical drafts, not a complete product specification. In particular, the client/server whitepaper explicitly does not describe Google's production web-client protocol. Do not treat these files as a final specification of every shipped feature, or describe our proposed CRDT design as Google's implementation.

## Screenshots downloaded and visually inspected

No pre-existing historical Wave screenshot was identified in the project's files or the Wave-named file search under `/Users/evbogue/Code`. This is not an exhaustive search of every image on the computer. The following images were newly retrieved from Google's original posts.

### 1. Full workspace, May 2009 — 1361 × 888

[Open inbox screenshot](screenshots/inbox-2009.png)

Source: [Went Walkabout. Brought back Google Wave](https://googleblog.blogspot.com/2009/05/went-walkabout-brought-back-google-wave.html), with local provenance in `pages/launch-2009.html`.

Visible evidence: navigation and contacts on the left, an inbox in the middle, and an open wave on the right. The wave shows participant avatars, a playback action, nested replies between surrounding text, and an image gallery. This is the strongest downloaded layout reference. It does not by itself establish exact selection gestures or concurrent editing semantics.

### 2. Participant access, January 2010 — 594 × 284

[Open participant screenshot](screenshots/read-only-2010.png)

Source: [New features: Read-only and Restore](https://googlewave.blogspot.com/2010/01/new-features-read-only-and-restore.html), with local provenance in `pages/read-only-restore-2010.html`.

Visible evidence: participant strip and an access menu opened from a participant. Useful for understanding participant controls; dynamic permissions remain outside our first implementation scope.

### 3. Playback and restore, January 2010 — 452 × 186

[Open playback screenshot](screenshots/restore-2010.png)

Same source post as screenshot 2. Visible evidence: playback navigation, a timeline slider, a restore action, and a recorded-change caption above the conversation. Full playback and restore remain deferred in our work order.

The original posts link to Blogger image-viewer pages. Those pages were followed to the actual PNGs; file signatures and dimensions were checked. These are not HTML responses saved under image filenames. Source posts retain the original image links. Actual image endpoints used:

- Inbox: https://lh3.googleusercontent.com/blogger_img/APIUysjC4IUU-YF6lo0KFSjiOvraJC8HYeINtRUuTJurcksKrXu6VU7gQ5pF3gKX5ffBcZTsCwvz2S7eTFiWqw=s1600
- Participant access: https://lh3.googleusercontent.com/blogger_img/APIUysh9HttpxlBd6nKQFaBi9YzBB92p214ErtDdNuPad91YDcTvJzY6XvUXzz5H3A_NnXQW4Ckwga4sFg3a=s1600
- Playback: https://lh3.googleusercontent.com/blogger_img/APIUysjsuulT1QRKSsjiPAQyHjVZ3IkkIQ5oTUZZUeAGpbJzJk0XLsgVDYBCf2QO9-Q5chwTaAgY3Zxz5zlZ=s1600

## Google I/O videos: verified dates and watch list

Google unveiled the developer preview at **Google I/O on May 28, 2009**, as its [contemporary announcement](https://developers.googleblog.com/hello-world-meet-google-wave/) states. The collection below contains **2009 and 2010** sessions. A Wave-specific I/O 2011 session has not been verified; do not relabel these recordings as 2011.

The [research chronology](../../GOOGLE_WAVE_RESEARCH.md#verified-chronology) distinguishes the 2009 preview, 2010 open availability and end-of-standalone-development announcement, and the November 2011 announcement scheduling service shutdown for 2012. Neither 2011 nor 2012 is the introduction year.

### 2009: start with the product experience

- [Google Wave developer preview / launch demonstration](https://www.youtube.com/watch?v=v_UyVmITiYQ). The original video link is explicitly present in Google's [June 4, 2009 session roundup](https://developers.googleblog.com/google-wave-google-io/). The research browser could not open the video page directly, so current playback availability was not verified. Start here to study the product in motion.
- [Google I/O 2009 — Google Wave: Under the hood](https://www.youtube.com/watch?v=uOFzWZrsPV0). Official Google for Developers listing verified through search. Covers the editing/concurrency stack; distinguish useful concepts from historical implementation choices.
- [Google I/O 2009 — Programming With and For Google Wave](https://www.youtube.com/watch?v=O5JT2jBrJX8). Official Google for Developers listing verified through search. Useful for embedding and the extension model; extensions remain deferred.

Local source roundup: `pages/io-2009.html`.

### 2010: platform follow-up

- [Google I/O 2010 — Waving across the web](https://www.youtube.com/watch?v=ktBsUFte_sA). Official Google for Developers listing verified through search. Focuses on using Wave outside its main product.
- [Original 2010 Wave session playlist link](https://www.youtube.com/view_play_list?p=3AC60BE50C522C90). Preserved exactly from Google's [June 7, 2010 roundup](https://developers.googleblog.com/google-wave-at-io-learn-new-apis-build-your-own-wave/). The old playlist URL's current playback availability was not verified; use the roundup for session names if it no longer resolves.

Local source roundup: `pages/io-2010.html`. It lists provider, robot, media, embedding, enterprise, API-design, and team Q&A sessions.

Videos are linked, not downloaded or transcribed. No viewing timestamps or behavioral claims are invented from video titles. The implementation agent should watch relevant portions and record verified timestamps in its design notes.

## Context and rights

Additional original announcement snapshots supporting the corrected chronology are saved in `pages/developer-preview-2009.html`, `pages/open-availability-2010.html`, `pages/development-announcement-2010.html`, and `pages/shutdown-schedule-2011.html`. Their source URLs are linked in the research chronology. These downloads preserve the original pages; historical source files are not rewritten to match our commentary.

This collection makes references available on disk; it does not automatically load every document or video into an agent's context. The work order points here and tells the next agent what to inspect. Keep historical evidence separate from our product decisions.

Retain source notices and attribution. The federation document contains specification licensing/patent references and separate code notices. Do not assume that one license covers all pages, screenshots, and code. Screenshots are historical research references, not assets to ship in the application or material we claim to own. No application code or sibling repository was changed to collect these references.

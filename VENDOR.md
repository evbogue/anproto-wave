# Dependencies and asset provenance

ANProto Wave uses repository-local copies of its signing and avatar dependencies. The browser interface uses native HTML and structural CSS.

- `vendor/an.js`: copied from `../anproto/an.js`, with the unused blob-module import/export removed to keep the app self-contained.
- `vendor/lib/nacl-fast-es.js`: copied from ANProto, with its public-domain notice retained.
- `vendor/lib/base64.js`: copied from ANProto, with its Deno MIT notice retained.
- `vendor/wiredove-render.js`: copied unchanged from `../wiredove/client/render.js`. Its active Visualize Buffer avatar implementation credits Dominic Tarr (MIT).
- `vendor/wiredove.css` and `vendor/doveorange_sm.png`: retained copies of Wiredove's stylesheet and dove asset from the earlier interface. The current HTML pages use `wave.css` for structural layout.
- The avatar upload flow in `app.js` adapts Wiredove's `profile_header.js` center crop: 256×256 canvas → PNG data URL → content hash.

V1 and v2 profile records use signed JSON. The v2 app exchanges those self-asserted profiles and content-addressed image bytes through its local relay. Production dependencies are included in the repository. The optional browser verification harness uses externally supplied Playwright and Chrome.

The Google Wave reference collection retains source notices and provenance for historical specifications, screenshots, and research. See [references/google-wave/README.md](references/google-wave/README.md).

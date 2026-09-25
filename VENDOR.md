# Copied dependencies

This demo only changes files within anproto-wave.

- `vendor/wiredove.css`: copied unchanged from `../wiredove/style.css`.
- `vendor/wiredove-render.js`: copied unchanged from `../wiredove/client/render.js`. Its active Visualize Buffer avatar implementation credits Dominic Tarr (MIT).
- `vendor/doveorange_sm.png`: copied from Wiredove.
- `vendor/an.js`: copied from `../anproto/an.js`, removing only the unused blob-module import/export to keep the demo self-contained.
- `vendor/lib/nacl-fast-es.js`: copied from ANProto, with its public-domain notice retained.
- `vendor/lib/base64.js`: copied from ANProto, with its Deno MIT notice retained.
- The avatar upload flow in `app.js` adapts Wiredove's `profile_header.js` center crop: 256×256 canvas → PNG data URL → content hash. The older proportional-resize settings uploader is not used.

Profile records use signed JSON for this Wave demo, not Wiredove's YAML post format. This is visual and image-format reuse, not a claim of live Wiredove profile synchronization. No external dependencies, fonts, relays, or profile services are requested.

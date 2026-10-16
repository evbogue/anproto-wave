# ANProto Wave / 2 — draft protocol

This v2 protocol provides the signed collaboration foundation for ANProto Wave's encrypted drafting and publishing direction. It defines public, unencrypted conversation records and fixed participant authorization. [PUBLISHING.md](PUBLISHING.md) describes the planned encryption epochs, recipient access, and signed publication records; those additions will receive an explicitly versioned wire format.

Implemented draft, 12 October 2026. Executable examples: `crdt.test.js`; independent valid-fixture text oracle: `reference-crdt.js`. V1 retains its own format and replay path. The rules below describe the v2 implementation.

## Envelope and verification

A durable record is `{ "content": "<exact JSON payload bytes as a JS string>", "message": "<ANProto signed message>" }`.

Payload `content` is UTF-8 encoded and SHA-256 hashed to ANProto's padded base64 hash. `an.sign(hash, key)` signs the timestamp string concatenated with that hash using the existing ANProto Ed25519 primitive and prefixes the base64 public key. `message` is 208 characters. Verification opens the signature, requires a 13-digit timestamp plus 44-character hash, and compares that hash to the original content bytes **before** JSON parsing. Do not parse and reserialize to verify. The author is the first 44 characters of `message`; event ID is `an.hash(message)`. Event IDs are signed-envelope content hashes. Signature timestamps inform profile choice and presence expiry, never merge causality.

All payloads have `version: 2`. Hashes and public keys match `[A-Za-z0-9+/]{43}=`. IDs are compared by JavaScript string code-unit order, independent of locale. Unsupported versions/types are rejected. Objects must contain exactly the specified fields, including operations and anchors; extra properties are rejected. Future extensions require a new explicitly supported version.

## Payload vocabulary

| `type` | Required fields beyond `version`, `type` |
| --- | --- |
| `wave` | `title`: nonblank string ≤150 UTF-16 units; `participants`: unique array of ≤30 public keys. Author is automatically a member. |
| `thread` | `wave`, `deps`, `parent`: blip ID or null, `anchor`: null or `{ids, quote}`. Null parent means a top-level thread and requires null anchor. |
| `blip` | `wave`, `deps`, `thread`: owning thread ID, `after`: preceding blip in the same thread or null, `text`: initial scalar run, ≤4,096 UTF-16 units. |
| `edit` | `wave`, `deps`, `blip`: target blip ID, `ops`: nonempty array of ≤128 insertion/deletion operations. |
| `profile` | `name`: nonblank string ≤100 UTF-16 units; `image`: content hash or null. Latest signed timestamp wins, then ascending ID order's last record. Self-asserted identity metadata. |
| `presence` | `wave`, `blip`. Ephemeral only, prohibited in durable exports. Relay requires the signed timestamp within ten seconds of receipt; claims expire at timestamp + ten seconds. |

Every structural/text event's `deps` is a unique, nonempty array of ≤256 signed event IDs. It identifies observed causal heads in that Wave. The root must be in its transitive ancestry. Clients normally include the full current head set. Dependencies on available records belonging to another Wave are rejected. Missing dependencies remain pending and are reevaluated during replay; descendants of rejected events are rejected. A dependency cycle cannot apply. Profiles are not Wave dependencies.

A creation's signed ID is its object ID. Parent/thread/predecessor/blip references must already exist in the causal past and belong to that Wave. All root members have equal edit rights. Nonmember events are rejected. Membership is immutable write authorization, not confidentiality or revocation.

## Text operations

Insertion: `{ "kind": "insert", "after": null | "<eventID>:<opIndex>:<scalarIndex>", "text": "..." }`.

Deletion: `{ "kind": "delete", "ids": ["<elementID>", ...] }`.

Element IDs use decimal, zero-based operation and scalar indices. Initial blip text uses operation index 0 of its creation event. Each insertion run chains its scalar elements: the first follows `after` (null means start); each later scalar follows the preceding element. Reject unpaired UTF-16 surrogates. Inserts are nonempty and ≤4,096 UTF-16 units. A deletion has 1–8,192 unique element IDs. Client batches use smaller deletion groups so the envelope stays within the byte bound.

Targets must belong to the same blip, with their creation event in the edit's causal ancestry, or be inserted by a preceding operation in the same event. Validate the entire event before mutation. Deletion adds tombstones permanently, even if repeated by another event. It never deletes unseen concurrent insertions. Tombstoned elements remain traversal anchors.

Clock(root) = 0. Clock(event) = 1 + max(clock(dependency)). For each predecessor, children sort **descending** by `(clock, eventID, operationIndex, scalarIndex)`. Traverse depth-first, outputting each non-tombstoned element before its children. Traversal is iterative in the production reducer. This derived ordering is not relay authority or wall-clock order.

Blip continuations use explicit predecessor relationships and ascending creation-event ID sibling order. Top-level/reply threads use ascending creation-event ID order. No receipt-time ordering.

## Passage anchors

`anchor.ids` is a nonempty ordered array of ≤8,192 unique scalar IDs and `quote` is an exact, valid-Unicode string ≤16,384 UTF-16 units. The IDs must form one contiguous visible range in the parent's projection of exactly the author's causal past, and their values must equal `quote`. Cross-blip or unobserved elements are rejected.

Resolve using surviving original IDs. Boundary insertions are excluded, interior insertions included. If some IDs are tombstoned, mark partial removal; if all are tombstoned, mark removal and display the thread at the parent end. Preserve the original quote forever. Do not locate a duplicate phrase by string matching. Whole-message replies have null anchor.

## Limits and pending records

The exact content string is bounded to 65,536 UTF-8 bytes and 65,536 UTF-16 units. A verified inventory is capped at 10,000 events. An edit whose observed causal blip history plus its insertion exceeds 200,000 scalar elements is rejected. This is a **causal per-event** bound: concurrent unobserved inserts do not cause a previously valid edit to be rejected, and combined branches can exceed that number. There is no compaction in this draft.

A parsed malformed record or invalid signature is rejected before projection. A syntactically valid event with unavailable dependencies remains pending, not visible. Once dependencies arrive it either applies or is rejected with a reason. Available incompatible ownership/parentage/authorization is rejected. Reducer input must be verified records. Duplicate IDs are idempotent; order and repeated delivery do not alter the projected set.

## Bundles, images, and relay

Export/sync bundle: `{ "format": "anproto-wave/2", "records": [envelope, ...], "images": { "<hash>": "data:image/png;base64,..." } }`. No private keys, derived state, or durable presence. JPEG/WebP data URLs are accepted too. Image string ≤1,000,000 units; verify the hash of the entire string. Browser photo upload follows Wiredove's 256×256 center crop and PNG data-URL convention.

`GET /sync?revision=<opaque token>` returns `{revision, presence}` if unchanged, otherwise adds bundle fields containing the full retained public inventory. Revisions are random opaque cache tokens, not causal clocks. Restart creates a new token. Client polls at 500 ms, verifies received envelopes/images, persists them locally, and replays.

`POST /sync` accepts a bundle. Successful response `{ids:[...], revision}` means those signed records and supplied images were deduplicated into an atomic, flushed relay store. Unknown causal dependencies may still be pending; an acknowledgment is not consensus or permission. Invalid incoming contributions with available Wave context reject the submitted batch. Previously stored pending records that become invalid when a dependency arrives remain quarantined in the public inventory; they do not block the valid dependency and clients never apply them. Client clears acknowledged outbox IDs transactionally.

`POST /presence` accepts a signed presence envelope. Successful response is `{ok:true}`. Presence is bounded to 256 active identities, authenticated against accepted public Wave state, expires, and never enters durable records. GET presence entries include their original content/message envelope; recipients independently verify it and derive the author, target, and expiration instead of trusting relay summary fields.

Relay binds loopback only, checks exact loopback Host and same-origin writes, blocks cross-site requests, allows only JSON writes, bounds requests at 20 MiB (presence at 4 KiB), total stored bundle at 32 MiB, connections at 32, and request lifetime at 15 seconds. Static files come from an explicit allowlist; relay storage and arbitrary project files are not served. Public reads are intentionally accessible to local clients. Root creation is open in this public prototype.

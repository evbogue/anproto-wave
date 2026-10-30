# Work order: preserve the collaboration checkpoint

## Current priority — sustainable internet fame, 2026-10-29

Status: local preservation/reconciliation ticket completed on 30 October 2026; checkpoint preserved in Git. Encryption and publication remain planned. No deployment is recorded or authorized by this ticket.

**Research purpose:** learn whether publishing on Ev’s own domain, with portable authorship and accessible conversations, leads to repeat recognition, relationships, collaborations, and opportunities at a sustainable cost in time.

**Shared first milestone:** a visitor reads Ev’s Wiredove posts on evbogue.com, opens a conversation, replies without leaving the site, and can reload the same conversation. The reply is also retrievable in Wiredove. Reading requires no identity setup. Validate writes with disposable identities and isolated local services before any separately authorized public release.

## Position in the sequence

Wave explores how people make work together before publishing it. It remains an active secondary project. The immediate priority is the Wiredove/evbogue.com reading-and-reply experiment; Wave encryption and publication work are not dependencies of that release.

## Next ticket: make the current foundation easy to resume

- [x] Inspect and preserve the existing code, workflow, documentation, and verification-image changes. Separate current implemented behavior from intended publication/encryption behavior without discarding unfinished work.
- [x] Reconcile `README.md`, `WORKFLOW.md`, `ROADMAP.md`, and `VERIFICATION.md` around the current public, unencrypted, fixed-editor v2 foundation. Confirm collapse/Archive/Restore behavior against code and existing browser checks before recording it as verified.
- [x] Record a focused checkpoint with revision, local run instructions, meaningful checks actually run, and unresolved work. Keep private-draft language clearly marked as planned.

**Acceptance:** another session can start the existing demo, identify current limitations, and locate the next roadmap step. Preserve original signed history and participants’ independent archive state. Record screenshots only when observed; do not rerun unrelated work merely to fill a checklist.

**Stop point:** the existing checkpoint is reconciled and resumable. Do not start encrypted drafts, change publishing policy, or add new transports as part of this ticket.

Completion evidence: [CHECKPOINT.md](CHECKPOINT.md) identifies the base revision plus working-tree changes, run instructions, checks, and remaining work. Automated tests passed (13/13), browser acceptance passed, and refreshed narrow/Archive screenshots were inspected on 30 October. The checkpoint commit includes the implementation, browser checks, workflow, reconciled documents, and screenshots together; locate it with `git log -1 -- CHECKPOINT.md`.

## Resume after the interactive timeline milestone

Use `ROADMAP.md` and `PUBLISHING.md` for the next deliberate implementation slice. Specify and verify the encryption/access model before describing working drafts as private. Preserve the existing policy that a participant may release content they can access without an additional approval requirement; do not silently replace that policy while interpreting “approved revision.”

The eventual demonstration is collaborate → release an exact attributed revision → discuss → keep working → release an update. Earlier publications and discussion context must remain addressable. Connect a real published collaboration to the Fame ledger only when it exists; no automatic Wiredove export or interoperability is implied by this plan.

No rich editor, extension platform, broad federation, or research instrumentation is required for the checkpoint.

## Coordination

`../wiredove/SHARED_UI_WORK_ORDER.md` and `../evbogue.com/AGENTS.md` own the first audience experience. `../anproto-fame/WORK_ORDER.md` owns later observation of collaboration outcomes. Sibling paths are local workspace references.

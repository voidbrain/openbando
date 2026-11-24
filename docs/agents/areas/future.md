# Future (not done yet)

Area notes for OpenBando ([index](../areas.md)). Read before you change this area; the rules and lessons here are as binding as AGENTS.md.

### Not done yet (future)

- National elevation data: the terrain uses the free worldwide AWS terrarium tiles; per-country high-resolution DEMs could replace them where available (an `ElevationService` source).
- Bandos rebuilt from flight video (F-053): a point cloud made from a flight's video, its camera poses seeded and scaled
  by the synced blackbox attitude and GPS, shown over the bando to trace walls and roofs. It has to run on a Mac without
  CUDA (browser WebGPU / WASM); research models such as lingbot-map are references only. A point cloud of a private
  place never enters the repository, an export or a hidden bando.
- Multi-user authoring: the catalogue is published only by the maintainer (`library/` in this repo, read-only in the app). Letting any pilot publish blocks or bandos needs accounts, per-user rights and moderation (a server such as Supabase), plus queued offline edits that never overwrite another pilot's work.
- Smarter AI editing: preview an edit before it is applied, a visual diff of what changed, overlap detection, multi-step
  plans with rollback, and saying why a command was rejected. Already there: the review list (`AiService.changes`, one
  entry per real change, Undo) and reports from `RunResult`, never from the model's words.
- Site and block workflows: search / filter / bulk actions in the Elements tree; align and distribute for a selection;
  more parametric blocks; collision previews while placing; an asset validation report for the catalogue. Already
  there: block parameters, Library groups and sizes, `sanitizeBlock` and `core/catalog.spec.ts` checking every block.
- Presentation and sharing: camera bookmarks, cinematic camera paths, saved scenes (panel layout + camera + time),
  shareable packages (bando + flight + video), video overlays, a guided first flight in the simulator. Already there:
  the welcome tour, MP4 render, hidden / rounded exports, example releases.
- Roadmap: (1) stabilize: done in large part (storage failures reported, undo restores the selection, the AI proxy fails
  closed, deploy runs every check); PR #124 passed all browser shards after the elapsed-time guide fix; keep future failures in the backlog. (2) Validate core behaviour: a
  regression matrix of the example bandos (load, build, collide, export / import round trip) on top of
  `core/examples.spec.ts`. (3) Maintainability: keep splitting `bando-editor.ts` into tools under `ui/studio/editor/`
  (terrain, layers, underground, measure, blocks and the host are split already).

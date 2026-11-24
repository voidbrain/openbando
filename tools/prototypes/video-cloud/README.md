# Video point-cloud trial (F-053)

A prototype, not app code, for two routes of the F-053 trial. It tests whether a flight's video, with the log's attitude and GPS for the camera poses, can
become a point cloud good enough to trace a bando from. Results: F-053 in [the backlog](../../../docs/BACKLOG.md).

1. `depth.mjs` serves `page.html` and the demo video, and runs Depth Anything V2 small (transformers.js, WebGPU) in
   Chrome through Playwright. Per frame it saves a 160 × 90 relative-depth map and colours.
2. `fuse.ts` takes each frame's camera pose from the app's own code (`parseLog`, `prepareFlight`, `ReplayPose`, the
   25° uptilt, video offset −0.69 s), scales the frame's depth by fitting it to the ground under the drone, merges the
   frames into 0.25 m cells, and reports wall lines, their spread and a top view.

Run from the repository root; write outputs outside the repository (a point cloud of a real place never enters it):

```bash
OUT=/path/outside/the/repo
node tools/prototypes/video-cloud/depth.mjs . $OUT/frames.json 5
npx esbuild tools/prototypes/video-cloud/fuse.ts --bundle --platform=node --format=esm --outfile=$OUT/fuse.mjs
node $OUT/fuse.mjs . $OUT/frames.json $OUT/cloud pinhole 110   # [tiltDeg] [offset] [yawDeg]
```

The model downloads from Hugging Face on first run; the video and log stay on the machine.

## Route (a): COLMAP, placed by the log

`colmap.sh` extracts frames (6 a second, 960 px), runs COLMAP on the CPU (SIFT, sequential matching over 30 frames,
incremental mapper), writes each frame's position from the log (`colmap.ts refs`), aligns every reconstructed piece to
those positions (`model_aligner`, scale + rotation + shift), merges the pieces' points and scores them (`colmap.ts score`,
the same `score.ts` as route (b)). It needs `colmap` and `ffmpeg` (Homebrew: `brew install colmap ffmpeg`).

```bash
OUT=/path/outside/the/repo
npx esbuild tools/prototypes/video-cloud/colmap.ts --bundle --platform=node --format=esm --outfile=$OUT/colmap.mjs
tools/prototypes/video-cloud/colmap.sh . $OUT 6
```

## Results on the demo flight (2026-11-24, M3 Pro)

| | Route (b): log poses + in-browser depth | Route (a): COLMAP + log placement |
|---|---|---|
| Time | 31 s for 102 s of video (WebGPU) | about 6 min (CPU: 43 s features, 149 s matching, mapping) |
| Frames used | 208 of 511 | 496 of 614, in 17 pieces (largest 147) |
| One wall | 0.3–0.9 m spread, few points | 0.2–0.6 m spread |
| Between frames or pieces | smeared fans; no building shows | the same wall twice, 2.2–3.0 m apart (two runs; the mapper is not deterministic): pieces are placed by GPS only |
| Measured buildings | none found | right-angled walls (square within 1–3°); no full Main store (55.2 m) or greenhouse (20.3 m) outline |

The footage is freestyle: flips and sky-only frames break COLMAP's chain of matches, so the pieces meet only through
GPS (cameras vs log: median 1.5 m, 90% 4 m). Giving the log positions to `pose_prior_mapper` as priors did not join
them either. A fisheye camera model made COLMAP verify no image pair.

## Options for the owner

1. **Survey pass, then an import tool.** The pilot flies one slow pass or orbit around the bando (no flips) with
   blackbox and GPS; an offline script (this prototype grown up) builds one connected COLMAP model, places it by the
   log, and the editor shows it as a reference layer to trace. First step: one survey-style flight to test.
2. **In-app reconstruction.** The same in the browser: depth on WebGPU is fast enough, but feature matching and bundle
   adjustment in TypeScript / WASM are a large project; only worth it after option 1 shows usable models.
3. **Stop.** Keep modelling from photos and top views; this README and F-053 keep the evidence.

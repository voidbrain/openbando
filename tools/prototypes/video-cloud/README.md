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

`colmap.sh` syncs the video to its log with the app's own auto-sync (`sync.mjs`, in Chrome; skipped when an offset is
given), extracts frames (6 a second, 960 px), runs COLMAP on the CPU (SIFT, sequential matching over 30 frames,
incremental mapper), writes each frame's position from the log in metres from the first fix (`colmap.ts refs`), aligns
every reconstructed piece to those positions (`model_aligner`, scale + rotation + shift), merges the pieces' points and
scores them (`colmap.ts score`, the same `score.ts` as route (b)). It needs `colmap` and `ffmpeg` (Homebrew:
`brew install colmap ffmpeg`). Video and log default to the demo flight; on the demo, `sync.mjs` finds −0.695 s with
high confidence (the app's measured `DEMO_OFFSET` is −0.69 s).

```bash
OUT=/path/outside/the/repo
npx esbuild tools/prototypes/video-cloud/colmap.ts --bundle --platform=node --format=esm --outfile=$OUT/colmap.mjs
tools/prototypes/video-cloud/colmap.sh . $OUT                       # the demo flight
tools/prototypes/video-cloud/colmap.sh . $OUT video.mp4 log.csv     # another flight; [fps] [offset] optional
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

Decided 2026-11-24 by the owner: option 1.

1. **Survey pass, then an import tool (chosen).** The pilot flies one slow pass or orbit around the bando (no flips)
   with blackbox and GPS; an offline script (this prototype grown up) builds one connected COLMAP model, places it by
   the log, and the editor shows it as a reference layer to trace. First step: one survey-style flight to test.
2. **In-app reconstruction.** The same in the browser: depth on WebGPU is fast enough, but feature matching and bundle
   adjustment in TypeScript / WASM are a large project; only worth it after option 1 shows usable models.
3. **Stop.** Keep modelling from photos and top views; this README and F-053 keep the evidence.

## Survey flight (the owner's step)

Any bando; the video and log stay on the pilot's Mac and never enter the repository, an issue or a chat.

1. **At the field, before arming:** wait for a GPS lock of at least 8 satellites, and check Blackbox is logging (the
   log must carry GPS: `GPS_coord[0]` and `GPS_coord[1]` columns). Record the HD video at the highest resolution.
   Expected: the OSD shows 8+ satellites and the recording indicator.
2. **Fly, 2–4 minutes, no flips or rolls:**
   - one or two slow orbits around the bando at about 10–20 m, under 5 m/s, nose and camera turned in towards the
     buildings so they stay in frame;
   - a second, lower orbit at about 5–8 m, still facing the buildings;
   - if there is room, one straight pass along each long side;
   - keep the sky out of frame as much as you can: a sky-only frame is a gap COLMAP cannot bridge.
3. **On the Mac:** copy the video and the log into one folder outside the repository; a `.bbl` log is exported to CSV
   with Betaflight Blackbox Explorer. Then check the log in Terminal, on the Mac:

   ```bash
   grep -m1 -c 'GPS_coord\[0\]' /path/to/folder/log.csv
   ```

   Expected: `1` (the column is there). Then tell the agent the folder's path.

The agent then runs, on the same Mac:

```bash
tools/prototypes/video-cloud/colmap.sh . /path/outside/the/repo/work /path/to/folder/video.mp4 /path/to/folder/log.csv
```

Expected: `offset … s` from the auto-sync, one `piece` line per COLMAP piece (ideally one large piece; a piece the log places more than 5 m off is left out), and the score.
Target for option 1: one connected model whose walls spread under about 0.5 m and whose parallel walls match the
bando's measured sizes.

# Video point-cloud trial (F-053)

A prototype, not app code: it tests whether a flight's video, with the log's attitude and GPS for the camera poses, can
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

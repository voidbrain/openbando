# Owner checks and decisions

The steps for every backlog record that waits on the owner: what to open, what to do, and what you should see after each step. The live site is <https://voidbrain.github.io/openbando/>. Report the result in a session of this repository, with the message given at the end of each section; a step that does not behave as written is a new finding on its record.

## B-009 simulator and selected-flight replay

On the live site, in a desktop browser:

1. Open any bando, then **Fly** → start the simulator. Expected: the drone starts on the pad.
2. Fly into a wall. Expected: the crash stops the simulator.
3. Leave the simulator, select a recorded flight that has a video, and play it. Expected: the flight replays in step with its video.

Message to send: `B-009: simulator start, crash and flight/video replay pass` (or name the step that failed).

## B-017 Villetta replay pinned to the video

On the live site, open Villetta with the demo flight and its video:

1. Pause at 0:27.6, **Path** panel → **Pin this moment**, then click the bottom of the greenhouse's west face. Expected: the drone moves to that point.
2. Do the same at 1:13.1 (middle of the greenhouse) and at 1:35.9 (leaving the store). Expected: at each pinned moment the drone is where the video shows it; the path between pins follows the flight; the take-off stays on its pad.
3. Reload the log. Expected: the three pins come back. Click **×** on one. Expected: it is removed.

Message to send: `B-017: the replay follows the video at the three pins` (or the moment where it does not).

## B-018 hidden-bando flight paths and live GPS

1. Open a bando whose place is hidden and load a flight you recorded there. Expected: the path follows the real flight, with no sideways bend.
2. Connect a live GPS device (**Live link**) at that place. Expected: the live drone is shown where it really is.

Message to send: `B-018: hidden-bando path and live GPS position match reality` (or what is off, and by how much).

## B-028 new bando after a hidden one

On the live site:

1. Open a hidden bando, then **Bandos** → **New**. Expected: the map shows (no grey map, no "place hidden"); the Area step is enabled.
2. Search a full street address, house number included. Expected: the matches list fills and the map moves to the first match; another row moves the map there.
3. Before choosing a place, look at **Generate 3D**. Expected: it waits until a match is picked, coordinates are typed or the map is dragged.

Message to send: `B-028: map, matches list and Generate behave as written` (or the step that failed).

## F-001 Cut and Wing on diagonal basements

In the editor:

1. Pick a building with a diagonal basement outline, switch to **Indoors −1**, and use **Cut** and **Wing** on a diagonal edge. Expected: both edits apply along the diagonal, and the 3D floor-height preview follows.
2. Save, export the bando, and import it again. Expected: the edited outline is unchanged after import.

Message to send: `F-001: diagonal Cut/Wing and save/import pass` (or the step that failed).

## F-009 racing on two real devices

Two devices with real GPS telemetry at the same bando; background in [racing](racing/README.md):

1. On both devices open the same exported bando, then **Multiple live sources** → add each pilot's **Telemetry URL**. Expected: both pilots' ghosts move with their drones.
2. Fly a lap each. Expected: lap times on both devices agree within a second.
3. Cut one drone's GPS (cover it or switch off the bridge). Expected: after about 5 s its ghost is hidden and marked stale; its trace stays.
4. Start the relay on a machine both devices reach, then join the same **Shared race room** on both:

   ```bash
   export RACE_TOKEN="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(24).toString("hex"))')"
   export RACE_ORIGINS='https://voidbrain.github.io'
   RACE_HOST=0.0.0.0 npm run race:relay
   ```

   The published site needs the relay behind your own HTTPS reverse proxy ([racing](racing/README.md), "Optional shared room relay"). Expected: each device sees the other's paths after **Share local paths**.
5. Disconnect one device from the relay and rejoin. Expected: its publication disappears, then comes back.
6. Fly both drones close together and look in every camera. Expected: both paths stay readable.

Message to send: `F-009: two-device timing, GPS loss, relay rejoin and crowded paths pass` (or the step that failed).

## F-025 Fly checklist rework (decision)

Open the live site's **Fly** panel and its checklist. Decide what it should do differently. Message to send, filled in:

```text
F-025: steps: <add, drop or rename>; order: <new order>; checks: <what each step should verify>; opens: <when the checklist should open>
```

## F-026 "?" tips (decision)

With **?** on, tips explain 9 of 407 controls (inventory in [element map](agents/element-map.md), "Tips per file"). Options:

- **A (recommended)**: a control no guide step explains shows its title (or accessible name) in the same tip box; titles are added where missing; the element-map check fails on an icon-only control with neither.
- **B**: a written, translated tip for every control (about 400 texts).
- **C**: remove **?** and rely on browser titles.

Message to send: `F-026: A` (or `B`, or `C`).

## F-031 re-record guide clips and Welcome films

On a machine with the GPU and ffmpeg, in a checkout of `main`:

```bash
npm ci
npm run clips
npm run films
npm run check:media
```

Expected: both recordings finish; `check:media` reports the clips and films current. Watch the new clips and films. Expected: they show the current app (the new palette included).

Message to send: `F-031: clips and films re-recorded and reviewed` (or the clip that looks wrong).

# Owner checks

The checks and decisions that wait on the owner, one section per backlog step. Each says where it runs, what to do and what you should see. Reply in the chat with what you saw (or your choice); the agent records it in the record and closes or reopens it.

The live site is <https://voidbrain.github.io/openbando/>. Use a desktop browser (Chrome or Safari) unless a section says otherwise.

## B-009: simulator and selected-flight replay

On a desktop browser:

1. Open `https://voidbrain.github.io/openbando/`, open the Villetta example, then start the simulator (Simulator panel). Expected: the drone starts on the take-off pad.
2. Fly into a wall. Expected: the crash stops the flight.
3. Leave the simulator; in the **Flights** panel select the demo flight with its video and press Play. Expected: the replay moves in step with the video.

Reply: `B-009: pass` or `B-009: fails at step N: <what you saw>`.

## B-017: Villetta replay follows the video after moment pins

On a desktop browser, Villetta with the demo flight and its video:

1. Pause at 0:27.6; Flight path panel → **Pin this moment**, click the bottom of the west face.
2. Repeat at 1:13.1 (middle of the greenhouse) and 1:35.9 (leaving the store).
3. Play from the start. Expected: at each pinned moment the drone is where the video shows it; between them the path follows the flight; the take-off stays on its pad.
4. Reload the log. Expected: the pins come back; × removes one.

Reply: `B-017: pass` or `B-017: fails at step N: <what you saw>`.

## B-018: hidden-origin GPS projection

On a desktop browser with one of your own recorded flights, then a live GPS device:

1. Open a hidden bando, load your own flight (log and video). Expected: the path follows the real flight, without a sideways drift.
2. Connect a live GPS device (racing relay). Expected: the live drone shows where it really is.

Reply: `B-018: pass` or `B-018: fails at step N: <what you saw>` (no coordinates in the reply).

## B-028: New bando after a hidden bando

On a desktop browser:

1. Open a hidden bando, then **Bandos → New**. Expected: the map shows (not grey).
2. Search a full street address (street and number). Expected: the matches list fills and the first match is chosen.
3. Before choosing a place, look at **Generate**. Expected: it waits for a place.

Reply: `B-028: pass` or `B-028: fails at step N: <what you saw>` (no address in the reply).

## F-001: Cut and Wing on diagonal basement outlines

On a desktop browser, in the editor:

1. Take a building with a diagonal basement, choose **Indoors −1**, use **Cut** and **Wing** on a diagonal edge. Expected: the edits apply along the diagonal and the 3D preview follows.
2. Save, export, then import the file. Expected: the outline is the same after import.

Reply: `F-001: pass` or `F-001: fails at step N: <what you saw>`.

## F-025: what the Fly checklist should do

On a desktop browser: open any bando and read the **Fly checklist** panel.

Decide, in one reply: which steps to add, drop or reorder; what it should check; when it should open. Example reply: `F-025: drop step 3, add a battery check first, open only before the first flight`.

## F-026: the panels' "?" tips

Read the tips per file in [the element map](agents/element-map.md), and try the "?" in any panel's title bar. Choose one:

- **A** (recommended): a control's title is its tip; the check makes every control have one.
- **B**: a written tip for every control.
- **C**: remove the "?" tips.

Reply: `F-026: A`, `F-026: B` or `F-026: C`.

## F-031: re-record the guide clips and Welcome films

On the Mac with the GPU and ffmpeg, in a checkout of `main`:

```bash
npm ci
npx playwright install chromium
npm run clips
npm run films
npm run check:media
```

Expected: the two recordings finish; `check:media` then reports both sets current. Watch a few clips and the three films: they show the current app.

Reply: `F-031: recorded, look right` or what looked wrong; the agent commits the recordings.

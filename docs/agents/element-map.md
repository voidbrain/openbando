<!-- Written by tools/build-element-map.mjs from the templates and src/app/core/tour.ts: change those, then run the script. -->

# Element map

The element-level part of the impact map ([impact-map.md](impact-map.md), from the harness, lists what must follow a change). Every control the templates show, with its label, its `data-tour` mark, the guide steps that show it as a tip on hover and the guide steps whose clips use it (F-032). Generated; CI fails when this page differs from the code.

**407 controls** · 9 with a tip on hover · 116 with a title · 18 shown in a clip · 32 whose name the script cannot read (a bound expression; axe checks the real names)

### src/app/ui/float-box.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| Collapse | button |  | yes |  |  |
| Undock inspector | button |  | yes |  |  |

### src/app/ui/panel/panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| Close  | button | close-* | yes |  | sc-bando |
| Collapse / expand | button |  | yes |  |  |
| Tips on hover | button |  | yes |  |  |
| Transparent | button |  | yes |  |  |

### src/app/ui/panels/features-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  |  |  |  |

### src/app/ui/panels/flights-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  |  |  |  |
| Clear paths | button |  |  |  |  |
| Upload log | input |  |  |  |  |

### src/app/ui/panels/fly-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| … | button | fly-route-* | yes |  | fly-checklist |
| … | button |  |  |  |  |
| Close the checklist; loaded files and edits stay | button |  | yes |  |  |
| Reopen the last skipped step | button |  | yes |  |  |
| Skip | button |  |  |  |  |

### src/app/ui/panels/guide-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| ▶ Play | button |  |  |  |  |
| Play:  | button |  | yes |  |  |
| Show tips on hover | input |  |  |  |  |

### src/app/ui/panels/live-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | input |  |  |  |  |
| … | button |  |  |  |  |
| Go live | button |  |  |  |  |

### src/app/ui/panels/path-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  | yes |  |  |
| Fit the path in the view | button |  | yes |  |  |
| Pin end | button |  | yes |  |  |
| Pin start | button |  | yes |  |  |
| start | input |  | yes |  |  |
| start x m | input |  | yes |  |  |
| z m | input |  | yes |  |  |

### src/app/ui/panels/racing-controls.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | input |  |  |  |  |
| … | button |  |  |  |  |
| … | button |  |  |  |  |
| Add live source | button |  |  |  |  |
| Clear shared paths | button |  |  |  |  |
| Closed loop Set start gate @if (row.track.closed) { Laps : … | input |  |  |  |  |
| Closed loop Set start gate @if (row.track.closed) { Laps : … | button |  |  |  |  |
| Colour trails by speed | input |  |  |  |  |
| Disconnect | button |  |  |  |  |
| Export race | button |  |  |  |  |
| Gate height (m) | input |  |  |  |  |
| Gate width (m) | input |  |  |  |  |
| Import race | input |  |  |  |  |
| Minimum lap (s) | input |  |  |  |  |
| Minimum lap distance (m) | input |  |  |  |  |
| Pilot colour:  | input |  |  |  |  |
| Pilot name | input |  |  |  |  |
| Pilot name:  | input |  |  |  |  |
| Race time (s) | input |  |  |  |  |
| Relay token | input |  |  |  |  |
| Relay URL | input |  |  |  |  |
| Repeat replay Race time (s) | input |  |  |  |  |
| Restart race | button |  |  |  |  |
| Room | input |  |  |  |  |
| Share local paths | button |  |  |  |  |
| Show pilot:  | input |  |  |  |  |
| Show racing ghosts @if (race.enabled()) { Colour trails by s | input |  |  |  |  |
| Start delay (s) | input |  |  |  |  |
| Telemetry URL | input |  |  |  |  |

### src/app/ui/panels/radio-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
|  axis | select |  |  |  |  |
| expo | input |  |  |  |  |
| Gamepad preset | button |  |  |  |  |
| inv | input |  |  |  |  |
| rate °/s | input |  |  |  |  |
| throttle springs to centre (gamepad) | input |  |  |  |  |
| Zorro preset | button |  |  |  |  |

### src/app/ui/panels/render-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| ■ Cancel | button |  |  |  |  |
| ■ Stop | button |  |  |  |  |
| ● Record (real time) | button |  |  |  |  |
| background | select |  |  |  |  |
| Download … (… MB) | a |  |  |  |  |
| fps | select |  |  |  |  |
| Render replay (exact MP4) | button |  |  |  |  |
| size | select |  |  |  |  |

### src/app/ui/panels/simulator-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| … | button |  |  |  |  |
| CSV | button |  |  |  |  |
| H | button |  | yes |  |  |
| JSON | button |  |  |  |  |
| Mode: … | button |  |  |  |  |
| R | button |  | yes |  |  |
| The drone hits buildings, trees and the ground (off: it flies through them) | button |  | yes |  |  |

### src/app/ui/panels/timeline-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| +10s | button |  |  |  |  |
| +1s | button |  |  |  |  |
| −10s | button |  |  |  |  |
| −1s | button |  |  |  |  |
| 0" title="Play (P)" (click)="playback.play()" data-tour="pla | button |  |  |  |  |
| Back to start | button |  | yes |  |  |
| loop | input |  |  |  |  |
| Pause | button |  | yes |  |  |
| Play backwards | button |  | yes |  |  |
| Replay speed | select |  |  |  |  |

### src/app/ui/panels/video-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| +0.1 | button |  |  |  |  |
| −0.1 | button |  |  |  |  |
| Auto-sync | button | auto-sync |  | sync | sc-load, sync |
| cam tilt° | input |  |  |  |  |
| from s | input |  |  |  |  |
| Load another video | input |  |  |  |  |
| Load video | input |  |  |  |  |
| Move the video back 1 s (the replay stays) | button |  | yes |  |  |
| Move the video back one frame (the replay stays) | button |  | yes |  |  |
| Move the video forward 1 s (the replay stays) | button |  | yes |  |  |
| Move the video forward one frame (the replay stays) | button |  | yes |  |  |
| offset s | input |  |  |  |  |
| scan s | input |  |  |  |  |
| Sync here | button |  |  |  |  |
| Video here = first flip/roll | button |  |  |  |  |
| Video here = first yaw flick | button |  |  |  |  |
| Video here = lift-off | button |  |  |  |  |

### src/app/ui/panels/views-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  | yes |  |  |
| (none) | button |  | yes |  |  |
| (none) | button |  |  |  |  |
| … | input |  |  |  |  |
| Hide  | button |  | yes |  |  |
| Hide  | button |  | yes |  |  |
| Hide every panel but this one | button |  | yes |  |  |
| Hide every panel in  | button |  | yes |  |  |
| Hide roofs | button |  | yes |  |  |
| Reset the camera | button |  | yes |  |  |
| Reset UI | button |  | yes |  |  |
| Satellite ground | button |  | yes |  |  |
| Show every panel | button |  | yes |  |  |
| X-ray | button |  | yes |  |  |

### src/app/ui/panels/welcome-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| … | button |  |  |  |  |
| ▶ Watch | button | welcome-tour |  |  |  |
| Features | button |  |  |  |  |
| Guide me | button |  |  |  |  |
| Open the bandos | button |  |  |  |  |

### src/app/ui/studio/assistant-box.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | textarea | ai-input |  |  | ai |
| … | button |  |  |  |  |
| address | input |  |  |  |  |
| browser | button |  | yes |  |  |
| Clear chat | button |  |  |  |  |
| Connect | button |  |  |  |  |
| In this browser | button |  |  |  |  |
| Load model | button |  |  |  |  |
| Mark everything as reviewed | button |  | yes |  |  |
| model | input |  |  |  |  |
| model | select |  |  |  |  |
| Reviewed | input |  | yes |  |  |
| Select it, show the floor and zoom the map there | button |  | yes |  |  |
| Send | button | ai-send |  |  | ai |
| Server / home PC | button |  |  |  |  |
| token (optional) | input |  |  |  |  |
| Undo last AI change | button |  |  |  |  |

### src/app/ui/studio/bando-editor.html

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | select |  | yes |  |  |
|  :  | button | tab-model | yes |  |  |
|  :  | button | generate | yes | generate | generate |
|  ·  | button | tool-* | yes | add-building, select, trees |  |
| … | button |  | yes |  |  |
| … | button |  |  |  |  |
| … | input |  |  |  |  |
| … | input |  |  |  |  |
| … | input |  |  |  |  |
| … | input |  |  |  |  |
| … | input |  |  |  |  |
| … | input |  |  |  |  |
| … … | input |  |  |  |  |
| … wall | input |  |  |  |  |
| ) +  | button |  | yes |  |  |
| × | input |  |  |  |  |
| × | input |  |  |  |  |
| ∿ Line | button |  |  |  |  |
| ⌀ m | input |  |  |  |  |
| ⌀ m | input |  |  |  |  |
| ▭ Box | button |  |  |  |  |
| ◌ Lasso | button |  |  |  |  |
| ◌ Outline | button |  |  |  |  |
| ⧉ Duplicate | button |  |  |  |  |
| ⧉ Duplicate | button |  |  |  |  |
| 2D | button | view-2d |  |  | look-3d |
| 3D | button | view-3d |  | look-3d | look-3d |
| Add a floor on top (a copy of the last one; the roof moves up) | button |  | yes |  |  |
| Add a floor on top (a copy of the last one; the roof moves up) | button | add-floor | yes |  | adjust |
| Add basement wall | button |  |  |  |  |
| arch ratio | input |  |  |  |  |
| auto-align | input |  |  |  |  |
| Back to a plain rectangle over the bounding box | button |  | yes |  |  |
| basement m | input |  |  |  |  |
| battlements | input |  |  |  |  |
| Brush shape | menu |  |  |  |  |
| ceiling m | input |  |  |  |  |
| centre strip m | input |  |  |  |  |
| Chat with the AI assistant to edit buildings and interiors | button | ai | yes | ai | ai |
| Close the matches | button |  | yes |  |  |
| closed (…; open = just the hole) | input |  |  |  |  |
| Courtyard  | input |  |  |  |  |
| Debug coordinates | input |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete | button |  |  |  |  |
| Delete basement wall | button |  |  |  |  |
| Delete courtyard  | button |  |  |  |  |
| Delete piece  | button |  |  |  |  |
| Delete the selected measure (Delete key) | button |  | yes |  |  |
| Delete wall | button |  |  |  |  |
| depth m | input |  |  |  |  |
| depth m | input |  |  |  |  |
| depth m | input |  |  |  |  |
| Direction of the rows | select |  |  |  |  |
| Download the real ground again (your strokes stay) | button |  | yes |  |  |
| Edge | menu |  |  |  |  |
| Edit this floor · click again to see the whole building | button |  | yes |  |  |
| Elements: list of all buildings, structures, walls and trees (grouped by area), with thumbnails and links | button |  | yes |  |  |
| Every column in the same east–west row (double-click a column does the same) | button |  | yes |  |  |
| Every column in the same north–south line | button |  | yes |  |  |
| Every column of the same size and shape on this floor | button |  | yes |  |  |
| every m | input |  |  |  |  |
| every m | input |  |  |  |  |
| every m | input |  |  |  |  |
| fill the gaps | input |  |  |  |  |
| Fill the whole floor with columns like this one on a grid of the spacing above (not inside voids) | button |  | yes |  |  |
| floor m | input |  |  |  |  |
| from north wall | input |  |  |  |  |
| from west wall | input |  |  |  |  |
| glass | input |  |  |  |  |
| Go | button | search-go |  |  | place |
| ground | select |  |  |  |  |
| Ground | menu |  |  |  |  |
| Ground | menu |  |  |  |  |
| height | input |  |  |  |  |
| height | input |  |  |  |  |
| height | input |  |  |  |  |
| height m | input |  |  |  |  |
| Join it with every water it overlaps or touches into one outline | button |  | yes |  |  |
| Keep it, forget the block | button |  | yes |  |  |
| Keep it, forget the block | button |  | yes |  |  |
| Keep this framed area and frame another one: they are generated together | button |  | yes |  |  |
| Kind | menu |  |  |  |  |
| Kind | menu |  |  |  |  |
| Kind | menu |  |  |  |  |
| length m | input |  |  |  |  |
| length m | input |  |  |  |  |
| level m | input |  |  |  |  |
| Library: ready-made objects, buildings and patterns, yours and from the online catalogue | button | library | yes | library | library |
| magnet | input |  |  |  |  |
| Make a row | button |  |  |  |  |
| map | select |  |  |  |  |
| Map opacity | input |  |  |  |  |
| Material | menu |  |  |  |  |
| Material | menu |  |  |  |  |
| name | input |  |  |  |  |
| name | input |  |  |  |  |
| name | input |  |  |  |  |
| One copy, spacing away along the chosen direction | button |  | yes |  |  |
| open floor above | input |  |  |  |  |
| open shell | input |  |  |  |  |
| Perimeter edge … | input |  |  |  |  |
| Piece  | input |  |  |  |  |
| Pin end | button |  | yes |  |  |
| Pin start | button |  | yes |  |  |
| position on wall | input |  |  |  |  |
| radius | input |  |  |  |  |
| raised by m | input |  |  |  |  |
| Rebuilds it as the other kind: the interior, openings and outline are lost | button |  | yes |  |  |
| Redo | button |  | yes |  |  |
| Remove all measures | button |  | yes |  |  |
| Remove area  | button |  | yes |  |  |
| Remove every terrain stroke (back to the real ground, or flat) | button |  | yes |  |  |
| Remove everything this placement made | button |  | yes |  |  |
| Remove everything this placement made | button |  | yes |  |  |
| Remove the selected floor | button |  | yes |  |  |
| Remove the selected floor | button |  | yes |  |  |
| Repeat | button |  |  |  |  |
| repeat × | input |  |  |  |  |
| Restore roof | button |  |  |  |  |
| Restore studio size | button |  | yes |  |  |
| roofs | input |  |  |  |  |
| rotation° | input |  |  |  |  |
| rotation° | input |  |  |  |  |
| round | input |  |  |  |  |
| Ruin of the  | input |  | yes |  |  |
| ruined % | input |  |  |  |  |
| Save | button |  |  |  |  |
| Search a place | input | search |  | place | place |
| Section | menu |  |  |  |  |
| Section | menu |  |  |  |  |
| shape | select |  |  |  |  |
| Shape of new columns | menu |  |  |  |  |
| Shape the ground | menu |  |  |  |  |
| Show only this floor solid, the rest of the building ghosted (click again for the whole building) | button |  | yes |  |  |
| Show the basement floor | button |  | yes |  |  |
| Show the basement floor | button |  | yes |  |  |
| sill (bottom) | input |  |  |  |  |
| size | input |  |  |  |  |
| Stairs or a ramp | menu |  |  |  |  |
| stands on | select |  |  |  |  |
| style | select |  |  |  |  |
| Surface | menu |  |  |  |  |
| Take the roof off and edit one floor of the selected building: walls, doors, windows, voids, columns, stairs | button |  | yes |  |  |
| thickness | input |  |  |  |  |
| This bando was shared without its place: there is no map area to edit | button |  | yes |  |  |
| turn ° | input |  |  |  |  |
| turn 90° | input |  |  |  |  |
| Turn the frame back to north-up | button |  | yes |  |  |
| type | select |  |  |  |  |
| Undo (Ctrl+Z) | button |  | yes |  |  |
| Update to v… | button |  |  |  |  |
| Update to v… | button |  |  |  |  |
| Use building footprint | button |  |  |  |  |
| Use your own OpenStreetMap data server (e.g. the PHP proxy) instead of the public ones | button |  | yes |  |  |
| Vegetation | menu |  |  |  |  |
| Vegetation | menu |  |  |  |  |
| wall height m | input | wall-height |  | adjust | adjust |
| walls m | input |  |  |  |  |
| water (basin) | input |  |  |  |  |
| water in it m | input |  |  |  |  |
| What | menu |  |  |  |  |
| What to draw | menu |  |  |  |  |
| What to place | menu |  |  |  |  |
| What to place | menu |  |  |  |  |
| width | input |  |  |  |  |
| width m | input |  |  |  |  |
| width m | input |  |  |  |  |
| width m | input |  |  |  |  |
| width m | input |  |  |  |  |
| width m | input |  |  |  |  |
| width m | input |  |  |  |  |
| width m | input |  |  |  |  |
| x (east) m | input |  |  |  |  |
| z (south) m | input |  |  |  |  |

### src/app/ui/studio/blocks-box.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button | block-* |  |  | library |
| (none) | button |  |  |  |  |
| … | button |  |  |  |  |
| … @if (p.type === 'bool') { } @else if (p.type === 'choice') | input |  |  |  |  |
| … @if (p.type === 'bool') { } @else if (p.type === 'choice') | select |  |  |  |  |
| … @if (p.type === 'bool') { } @else if (p.type === 'choice') | input |  |  |  |  |
| An editable copy among your own blocks | button |  | yes |  |  |
| Apply to the selected building, this floor | button |  | yes |  |  |
| Check the online catalogue for new blocks | button |  | yes |  |  |
| Delete | button |  |  |  |  |
| Describe the object | textarea |  |  |  |  |
| Export | button |  |  |  |  |
| Import… | input |  |  |  |  |
| Keep it as it is and forget the block | button |  | yes |  |  |
| Open the AI assistant to connect a model | button |  | yes |  |  |
| Search blocks | input |  |  |  |  |
| The selected building or structure becomes one of your blocks | button |  | yes |  |  |
| Then click the map where it goes (Esc stops) | button | block-place | yes |  | library |
| turn ° | input |  |  |  |  |
| Update | button |  |  |  |  |

### src/app/ui/studio/element-preview.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| Smaller preview | button |  | yes |  |  |
| Stop turning | button |  | yes |  |  |
| The roof is hidden while editing indoors | button |  | yes |  |  |
| Zoom to | select |  | yes |  |  |

### src/app/ui/studio/elements-box.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| (none) | button |  |  |  |  |
| As a tree | button |  |  |  |  |
| By category | button |  |  |  |  |
| Edit this floor | button |  | yes |  |  |
| Filter elements | input |  |  |  |  |
| show tree zones on the map | input |  |  |  |  |

### src/app/ui/studio/pick-menu.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| :  | button |  | yes |  |  |

### src/app/ui/studio/site-view.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| … | button |  |  |  |  |
| Insert basement vertex | button |  |  |  |  |
| Move basement vertex  | button |  | yes |  |  |
| Remove basement vertex | button |  |  |  |  |

### src/app/ui/studio/studio-panel.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| ← Bandos | button |  |  |  |  |
| ＋ New bando | button | new-bando |  | place | place |
| Add a copy of  | button | example-* | yes |  | sc-bando |
| Back up all | button |  |  |  |  |
| Bando name | input |  |  |  |  |
| Delete | button |  |  |  |  |
| Duplicate | button |  |  |  |  |
| Fly | button |  |  |  |  |
| hidden | button |  | yes |  |  |
| Import | input |  |  |  |  |
| Open a fresh copy | button |  |  |  |  |
| Rename | button |  |  |  |  |
| Restore… | input |  |  |  |  |
| Save a copy to share without its place: no map, no map names, no GPS landmarks | button |  | yes |  |  |
| Save every bando and your own blocks in one file (keep it somewhere safe: the browser can lose what it stores) | button |  | yes |  |  |
| Save it as a file to share, with its place | button |  | yes |  |  |
| Save it as a file to share; its place stays hidden | button |  | yes |  |  |
| Show  | button |  | yes |  |  |
| Try again | button |  |  |  |  |

### src/app/ui/tour-overlay.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| … | button |  |  |  |  |
| ▶ Show me | button |  |  |  |  |
| Back: this step again from its start (from its start, the step before) | button |  | yes |  |  |
| Skip to the next step | button |  | yes |  |  |
| Stop the tour (Esc) | button |  | yes |  |  |

### src/app/ui/version-badge.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| (none) | button |  |  |  |  |
| Language:  | button |  | yes |  |  |
| Open the Views panel | button |  | yes |  |  |

### src/app/ui/widgets/camera-compass.ts

| Control | Element | Mark | Title | Tip (guide step) | In clips |
|---|---|---|---|---|---|
| Orient camera: click for north, drag or use arrow keys to turn | button |  | yes |  |  |


# Multipath racing and shared ghosts

Steps 7–10 extend the existing multiple-log uploader. No second log parser, flight store, video clock or simulator is introduced. Use **Flights → Racing and ghosts**. This is GPS comparison and ghost playback, not authoritative race timing or drone control.

## Is a server needed?

| Workflow | Extra server? | Where the data lives |
|---|---|---|
| Load several recordings on one device and compare them | No | This browser's loaded flights |
| Exchange `.race.json` files between pilots/devices | No | Exported local-coordinate package, imported on each device |
| One browser connects directly to several GPS telemetry URLs | No additional race server | The existing WebSocket/SSE telemetry bridges must already be reachable |
| Pilots on different devices exchange tracks in a shared room | Yes: the optional relay below | Temporary relay memory; no database or accounts |
| Broadcast live paths between devices | Same relay, plus each pilot's existing telemetry bridge | Explicit opt-in snapshots at approximately 1 Hz |

The relay can run on a laptop, Raspberry Pi or home server on the same LAN/hotspot. It does not inherently require Internet hosting. GitHub Pages hosts the frontend only; it cannot run the relay. HTTPS frontend pages need HTTPS relay / HTTPS or WSS telemetry URLs that the browser can reach, with appropriate CORS and local-network permissions. A phone hotspot with no mobile data can support the LAN workflow if every participant can actually reach the host.

## Compare recordings on one device (steps 7–8)

1. Open the bando and align it with the flights as usual. Upload several CSV, GPX or JSON logs using the existing **Upload log** picker (it already accepts multiple files).
2. Expand **Racing and ghosts**, turn on **Show racing ghosts**. Up to eight pilots are drawn with individual colours and named rows. Colour represents pilot identity in the 3D race view; normal replay keeps its speed colours when racing is off.
3. Change pilot name/colour, hide one pilot, and set a **Start delay (s)**. Positive delay makes that recording start later in the shared race clock; negative delay advances it. The race clock starts every log at its first fix, not at a presumed common wall-clock time. Align takeoff times manually with offsets.
4. **Play race**, **Pause race**, **Restart race**, scrub the race slider, or enable **Repeat replay**. This clock is independent of the existing active-flight/video clock, so racing does not seek the video or overwrite its sync.
5. The coloured ghosts are non-colliding GPS markers. Their nose follows travel direction; this first implementation does not transfer remote IMU attitude/video. Finished pilots disappear once their recording ends, and a pilot is hidden before its delayed start. There is no extrapolation across GPS intervals longer than 5 s.

The normal Flight path, telemetry/video instruments and selected-flight camera still describe the selected regular flight. Race ghosts and shared tracks appear in the main 3D scene and its other cameras. Starting the race selects Orbit for an overview. The simulator remains independent; these features never command a real drone.

## Closed loops and laps

- Put the start of one path on the intended common finish line, with its first movement in the forward direction. Click that pilot's **Set start gate**. Every pilot uses this same gate. A white rectangle and forward arrow mark it in 3D.
- Enable **Closed loop** per pilot. Choose width/height of the gate and minimum lap time / distance to suit the course. The defaults are 12 m wide, 10 m high, at least 5 s and 30 m travelled per lap.
- A lap ends at an interpolated forward crossing of the finite gate rectangle. The pilot must first rearm more than 2 m behind the plane; reverse crossings, short jitter loops, out-of-gate/height crossings and samples separated by >5 s or >150 m/s do not produce a lap. A gap resets the current lap.
- A recording beginning on the gate uses its first fix as the initial start. Otherwise the first valid crossing starts the timer and the next completes a lap. The table shows completed lap count, best and last lap duration.
- This is a single-gate GPS estimate, not a checkpoint-validated race course. GPS drift, sparse fixes, arbitrary courses that cross the line midway, short-cuts and altitude error still matter. No anti-cheat or official timing is claimed.

## Exchange recordings between devices (step 9 without a server)

1. Export the bando through the existing Bandos workflow; choose its privacy deliberately. Have **all pilots including the sender open the same exported bando** and model scale. Bando geometry and terrain must match.
2. **Export race** produces `openbando.race.json`: pilot names, colours, start delays, local x/y/z metre samples and relative times, closed-loop settings, and the shared gate. It carries no latitude/longitude fields, original log bytes, telemetry URL, video or token. The local trace still reveals the shape of the place and flights; share it intentionally.
3. Transfer the file by any method you normally use. The recipient opens that bando, then **Import race**. Imports add rather than replace loaded logs. Foreign coordinates are never projected through the receiver's GPS calibration again.
4. The geometry/model-scale tag rejects accidental mismatches. It ignores names/ids/cosmetic colours; it is a non-cryptographic compatibility tag, not a security guarantee. Changing geometry or model scale disconnects racing links and clears foreign tracks/gate; local logs remain under the normal calibration workflow.

Exports freeze live paths into recordings. Imports are validated atomically (version, unique IDs, finite bounded local coordinates, strictly increasing times, at most eight tracks and 12,000 points per track). A malformed file adds nothing. File input is bounded to 12 MB. The race view samples longer local recordings uniformly to 12,000 points while retaining both ends; the original loaded flight remains untouched. Dense/long recordings may therefore have less precise race/lap interpolation.

## Multiple direct live sources (step 10)

Expand **Multiple live sources**. Give each stream a pilot name and **Telemetry URL**, then **Add live source**. Each connection has its own time origin, height baseline, status and recording. One source failing/disconnecting does not close the others. The old single **Live link** panel remains available unchanged.

Accepted transports: JSON messages via `ws://` / `wss://`, or HTTP(S) **Server-Sent Events**. Each message is handled by the existing `normalizeLive` field mapper, for example:

```json
{"lat":45.4642,"lon":9.19,"alt":12.3,"sats":10,"speed_ms":8.5}
```

The example is a neutral test coordinate, not a bando location. JSON field aliases follow `core/live/live-normalizer.ts`; messages must have a valid GPS fix. A SquirrelCast video page / WebRTC / RTSP URL is not a GPS telemetry endpoint. Use the GPS JSON bridge associated with each pilot's stream. The app does not transcode video or open a UDP socket in the browser.

For testing without hardware, the existing bridge can expose multiple ports (its documented dependency is `websockets`):

```bash
python tools/elrs_bridge.py --simulate --ws-port 8765
python tools/elrs_bridge.py --simulate --ws-port 8766
```

Connect those two WebSocket URLs from an HTTP localhost frontend. For real devices use their reachable hostnames/IPs and telemetry ports; separate devices can use the same port on different hosts.

- Intake is limited to 5 GPS points/s per source, with 64 KB/message and coordinate bounds. A ghost whose most recent fix is older than about 5 s is hidden and marked stale. The trace remains visible.
- Disconnect retains the received points as a normal race recording. The trace is capped at 12,000 points (~40 minutes at maximum intake); reaching the cap closes that connection and reports the limit, rather than silently dropping laps or growing memory indefinitely.
- Reconnect adds a new recording, not a continuation across an unknown gap. Direct feeds use their own connect-relative timestamps; no remote wall-clock synchronisation is assumed.

## Optional shared room relay (step 9 network sharing; optional step 10 broadcast)

The relay uses Node's built-in HTTP server and SSE, with no database/runtime library dependencies. Use the repository's supported Node version and `npm ci` first.

```bash
export RACE_TOKEN="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(24).toString("hex"))')"
export RACE_ORIGINS='http://localhost:4200,http://localhost:4300'
npm run race:relay
```

It binds to **127.0.0.1:8787** by default. For LAN clients set `RACE_HOST` to an address they can reach (or `0.0.0.0` intentionally), `RACE_PORT` as needed, and `RACE_ORIGINS` to the exact frontend origins, including scheme and port. The published app's origin is `https://voidbrain.github.io` (no `/openbando/` path in an Origin). Serve the relay over HTTPS through your own streaming-capable reverse proxy for an HTTPS frontend; disable proxy response buffering and allow long-lived SSE connections.

In **Shared race room**, enter that relay's base URL, a room name, and the relay token. Join on each device. Clicking **Share local paths** explicitly publishes this device's loaded/local direct-live tracks; received peer tracks are not rebroadcast. Names and local coordinates leave this browser only when you publish or enable broadcast. **Broadcast live paths** refreshes snapshots approximately once a second while a local live source exists; it is opt-in and turns off when leaving. Room reception is automatic after joining.

The token is held in memory and sent in Authorization headers, not placed in URLs or localStorage. The room name is grouping, **not a separate access-control boundary**: the token is a shared server-wide secret for trusted participants. This is not a public multi-tenant service, account system or anti-cheat server. For public use, put authenticated TLS access and appropriate deployment controls in front of it rather than exposing the development relay directly.

Bounds: eight rooms, eight publishers/subscribers per room, 2 MB per publish, 4 MB stored room content, 64 connections and bounded response buffers. Invalid packs, unknown origins, frame mismatches and unjoined publishers are rejected. A room can contain only one bando frame. Publications are removed when the publisher leaves/disconnects; abandoned empty rooms expire after 20 minutes. Everything disappears when the process restarts. Browser reconnect is explicit: join again after a relay failure. A new publisher ID is generated per page load. No raw data is written to disk.

Live snapshot delivery is best-effort, about 1 Hz, not lockstep race networking. A stalled live publisher disappears as stale after the freshness timeout. A fresh snapshot restores it; a recorded peer follows this browser's independent race clock. SSE heartbeats do not mark a stale track fresh. Everyone must choose matching offsets / replay time when comparing recorded peers; there is no server-authoritative shared start signal in this version.

## Implementation and verification

- `core/racing/race.ts`: wire validation, coordinate tag, time interpolation and lap detection.
- `RaceService`: metadata and race clock over the existing FlightService, local/shared/live tracks; no change to single-flight or video ownership.
- `RaceLinksService`: independent direct stream lifecycles and optional authenticated HTTP/SSE room client.
- `three/race-renderer.ts`: identity-colour trails and ghosts, bounded trail sampling; geometry rebuilds at most once/s during incoming updates while ghost positions update immediately.
- `tools/racing/relay.ts`: optional in-memory relay; `npm run test:race-relay` exercises two-device exchange, disconnect cleanup, authentication/origin/frame validation and payload limits.
- Unit/service/render tests cover time offsets, package round trips, local/remote coordinate joins, laps, stale live data and the original playback clock. A focused `race-browser` PR job covers upload/export/import and two mocked telemetry URLs, including an axe check. The old full-guide e2e input-guard limitation remains separate.

GitHub CI run `40362635101` passed the focused racing browser tests and axe, 434 unit/service/render tests, three relay integration tests, types, translations, example consistency and production build. A real multi-device/SquirrelCast session and visual inspection in every camera remain pending in the working plan. Automated tests do not establish radio-network latency, GPS timing accuracy or field reliability.

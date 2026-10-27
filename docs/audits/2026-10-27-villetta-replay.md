# Villetta replay alignment investigation — 27 October 2026

The pilot reports that the log and video are synchronized, including entering the greenhouse from the south and exiting west; the replay is displaced slightly relative to both the greenhouse and the main store. Treat this as a spatial alignment report. A temporal sync mismatch is not established.

## Reproducible evidence

The repository's `public/guide-demo/flight.csv` and `flight.mp4` contain the same flight shown in the supplied screenshots. The log is anonymized; do not publish private coordinates or a private saved bando. At approximately 27.7 s of log time the video shows the greenhouse end; at approximately 43.2 s it shows the main store from outside. The showcase uses a video offset of −0.54 s. This is consistent with the user's timing confirmation, but does not establish the offset used in their screenshots.

For a fresh hidden Villetta release 10 with neutral rotation and its first demo fix placed at the take-off pad, direct projection of the demo samples gives:

| Log time | Frame | Along / across the building centre (m) | Relevant half dimensions (m) |
|---|---|---|---|
| 27.7 s | Greenhouse | −13.31 / −4.21 | length 25.20, width 10.14 |
| 43.2 s | Main store | 8.54 / −29.71 | length 75.12, width 27.60 |

The latter projected point lies about 2.1 m beyond the main-store side in this **default** calculation. The screenshot shows an inside position; the user's own saved alignment, example copy, and any changes are not available here. Do not treat this calculation as a reproduction of their saved session. Matching replay/video time alone does not prove that GPS positions agree with surveyed walls.

## Coordinate-projection finding

`toLocalAt` scales the whole longitude difference by the sample's latitude. When a hidden bando has origin (0, 0), a real flight can be far from that synthetic origin before its first point is shifted to the take-off pad. The subsequent shift cannot remove the latitude-dependent distortion. A neutral example at 45° N, 9° E with constant longitude and a 0.001° northward movement produces about 111.13 m north **and 12.36 m west**, although the east/west displacement should be zero. This is a reproducible mathematical defect, not proof that it accounts for the pilot's particular displacement; the supplied demo's anonymized points are around 1° N, 1° E, where the same distortion is much smaller.

Fixing it requires a stable local reference for the complete flight and the corresponding inverse mapping, including start/end pins, calibration persistence, multiple flights and live GPS/racing. A fix must preserve saved user alignments and the privacy of hidden sites. Track the work separately as B-018; do not adjust Villetta's dimensions to mask it.

The attitude parser also estimates a yaw offset from GPS course at speed. A freestyle drone can face a different direction from its movement; this can affect the camera view independently of spatial position. It has not been established as the cause here.

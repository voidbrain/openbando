# Guided Fly workflow proposal

Status: the checklist is implemented (F-018): `FlyChecklist` panel, opened beside the replay workspace by a saved bando's Fly button; it does not arm the simulator or start a live session. The guide step "Follow the Fly checklist" (Flight section, Full and Fly tours) shows it, with its clip. Not done: a dedicated step per route; the racing/relay branch points to Flights instead of its own steps.

## Entry and routes

1. **Choose a place:** create a bando or open an existing one. Finish creating/saving the model before proceeding. Keep the chosen model and any pilot calibration when moving between steps.
2. **What are you doing?** Offer Replay a recorded flight, Fly in the simulator, or Follow live telemetry. Live is a separate route: absence of a DVR/log does not imply simulator use.
3. **Replay:** ask which recordings are available: DVR and log, log only, or DVR only. Open Flights first for the log, then Video for its matching DVR. Loading either also exposes the other panel. Open the available telemetry instruments, run Auto-sync only when both recordings exist, then explain spatial alignment separately from time sync. Offer adding further flights for comparison.
4. **Simulator:** check controller setup, explain arming/disarming and collisions, then offer a local practice flight. Never arm automatically when choosing this route.
5. **Live:** open Live link explicitly, explain the supported telemetry bridge and connection status, then handle stale data, GPS loss and disconnect. Do not ask the replay user whether they are live after loading recordings.
6. **Flying with others?** Offer local multi-flight comparison, exported race-file exchange, directly reachable live streams, or an optional relay session according to the chosen route. Explain trusted token holders and sharing hidden bandos; never imply a public ranked race or deployed relay.

## Interaction requirements

Use a resumable task checklist with Back/Skip/Cancel, preserve loaded files and edits, and explain unavailable actions. Keep the current Welcome showcase as a demonstration; do not turn it into an interactive upload wizard. Simulator, recorded replay and live/racing can have separate focused guides sharing the bando-selection step. Do not require real devices for the simulator/replay routes.

## Guide and verification work

Before implementation, map each branch to the existing guide snippets and identify missing steps. Update tour source, generated guide pages, Italian text and component guidance together. Re-record affected clips/films separately (F-011); Markdown regeneration is not a media refresh. Browser tests must cover each branch, missing recordings, cancellation/resume, no accidental simulator arming and retained model/alignment. Real-device checks remain F-009/B-018.

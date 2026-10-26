# RacingControls

Nested under Flights, in a native foldable details section. Reuse the existing log picker; do not introduce another parser or automatic network sharing.

Use native labelled fields, `.btn` actions and `.check` toggles. Pilot rows show name, a data colour picker, visibility, delay and closed-loop choice; gate fields show metres/seconds explicitly. Identity colours are path data, not new editing-tool or interface accent tokens. Names accompany colours so pilots are not identified by colour alone. Errors use `warn`; connection status uses a live status region.

Keep local replay, imported files, direct live sources and optional shared room separate in the foldouts. Sharing must remain explicit. Relay credentials are password fields and are never persisted. The room text states which data leaves the device. The race clock has its own Play/Pause/Restart and does not control the video clock. On small panels wrap rows rather than clipping fields.

Source: `src/app/ui/panels/racing-controls.ts`; behaviour and operational limits: `docs/racing/README.md`.

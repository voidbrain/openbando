# WelcomePanel

The first thing a visitor sees, over the empty world turning slowly: what OpenBando is for, and where to start. A
`Panel` (`tools` group in Views), centred across the window (`anchor.center`), about 1080 px wide.

## Use

- Head: the single-line pixel-art **OPENBANDO** wordmark (responsive image with accessible alternative text; see `docs/mascot/wordmark-style-guide.md`), the tagline "Build, Fly, Share." in `accent` (18 px, 600), one `dim`
  line under it.
- Three columns, Build / Fly / Share (one column under 760 px): a bordered card (`line`, `radius`) with a 16:10 film
  (muted, looped, no controls; dimmed until its column is in focus), a 17 px title, two or three lines of text, and
  link buttons ("Open the bandos →") that open the panels for that job and close Welcome. The column under the pointer
  or the keyboard focus gets an `accent` border and plays its film.
- Footer: the primary `▶ Watch the welcome tour`, `Guide me`, `Features`, and a `dim` note on privacy.
- Closing it shows Views. The mascot starts its animation from the first pose whenever Welcome reopens.

## Voice

Plain and concrete, for pilots: what you do and what you get ("Drop your Blackbox log and your DVR: they sync
themselves"), no feature lists, no superlatives.

Source: `src/app/ui/panels/welcome-panel.ts` (films: `public/welcome/`, `npm run films`).

The Welcome-only pixel mascot sits beside the title. This is the explicit decorative-motion exception requested by the mascot task: black/orange artwork, no new UI colours. Use the shared timeline, still fallback and reduced-motion support. On narrow panels keep the title readable and let the illustration shrink. Sources/rules: `docs/mascot/README.md`.

The Welcome tour highlights Build/Fly/Share while the mascot plays, then waits for the first full rendered mascot loop before closing the panel. Returning to Welcome hides replay and race paths.

Features opens its own panel and is reachable with `?panel=features`; it is excluded from Views. Its marketing card grid is an explicit content exception to the instrument UI field-manual voice, not permission to add promotional copy to editing controls.

The showcase highlights Build, Fly and Share in turn, playing each eight-second film completely and distributing mascot progress across the three stages. Films pause while Welcome is hidden. There is no separate long wait after the third card.

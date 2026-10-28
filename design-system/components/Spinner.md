# Spinner

Spinner is the 11px ring shown inline while something loads (map data, a model, a search).

## Use

- `dim` ring with an `accent` top, 0.8s linear. Always beside a word ("Loading buildings"), never alone.

## Consumer provides

The label next to it.

Source: `src/app/ui/studio/bando-editor.scss (.spin)`.

Video first-frame decoding uses the same ring alongside Loading video in a panel-solid overlay. Hide it on loadeddata/canplay; show a decode error instead of an endless spinner. Honour reduced motion.

Tour captions use a separate determinate 24px remaining-time ring beside the title: line track, accent arc, rounded ends, emptying clockwise. It follows the rendered mascot or replay where available; other guide steps label timing as estimated and retain a small remainder until completion. Pause freezes it; this is not an indeterminate loading spinner.

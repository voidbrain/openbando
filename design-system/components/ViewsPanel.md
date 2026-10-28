# ViewsPanel

Promote Flights, Timeline, Video and then the Bandos editor as ordinary `.vis` rows in that order; the editor has no special styling. Secondary Telemetry, Simulator and Tools fold by default; preserve saved preferences, and restore default folds with Reset UI. Do not duplicate quick controls inside group lists; group eye commands still control their complete groups. Every panel row, quick or grouped, carries the same Show / Hide title with the panel's full name.

Main page source selection remains visible. Camera and camera-view-panel groups appear only for a 3D main source. Keep a native Options disclosure closed by default. Follow the drone means Orbit/Top centring; Chase/FPV reuse the same Follow icon button for replay-follow; its title and accessible label say so, with no extra text label. Options icons are drawn at 18px (`app-tool-icon [size]="18"`) so all five fit one row. Roof visibility changes shared geometry even in FPV. Satellite ground applies to the main model; Studio has a separate ground selector. X-ray still fades camera-near surfaces in FPV. Reset returns to Orbit and parks the simulator drone; its hint must say this.

Use existing text/accent/line tokens, shared button states and accessible pressed/expanded labels. Default folding must not remove access to task panels. Source: src/app/ui/panels/views-panel.ts.

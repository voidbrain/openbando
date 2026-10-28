# ViewsPanel

Promote Bandos editor with a full-width accent text row; keep Flights, Timeline and Video directly available. Secondary Telemetry, Simulator and Tools fold by default; preserve saved preferences, and restore default folds with Reset UI. Do not duplicate quick controls inside group lists; group eye commands still control their complete groups.

Main page source selection remains visible. Camera and camera-view-panel groups appear only for a 3D main source. Keep a native Options disclosure closed by default. Follow the drone means Orbit/Top centring; Chase/FPV retain an explicitly labelled Follow replay control. Roof visibility changes shared geometry even in FPV. Satellite ground applies to the main model; Studio has a separate ground selector. X-ray still fades camera-near surfaces in FPV. Reset returns to Orbit and parks the simulator drone; its hint must say this.

Use existing text/accent/line tokens, shared button states and accessible pressed/expanded labels. Default folding must not remove access to task panels. Source: src/app/ui/panels/views-panel.ts.

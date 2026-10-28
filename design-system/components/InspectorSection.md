# InspectorSection

InspectorSection groups the selected element's properties: an uppercase caption, then fields two to a row.

## Use

- `<div class="sec">` with a `.st` caption (`section-label` style, dim, uppercase) and `.fld` labels each wrapping its control.
- A `.span2` field or a `.row` takes the whole width; `.sec.acts` is a flex row of buttons at the end.
- Sections are separated by their own top rule (`line`), not by cards or backgrounds.
- Units go in the label ("Height (m)"), not in the input.

## Consumer provides

The caption, the fields and their bindings. Keep each section to one concern (Size, Floors, Openings, Modules).

Source: `src/app/ui/studio/bando-editor.scss (.sec, .st, .fld)`.

Basements expose a −1 button in Floors, a dedicated preview and a separate section for height, independent rectangular dimensions, footprint reset, perimeter walls and internal wall endpoints. Choosing a roof when ruin/open shell removed it explicitly restores the roof (and lowers global ruin below the roof-removal threshold); explain that effect beside the selector.

In the 2D indoor plan and 3D indoor view, the selected basement shows outline vertices: drag or use the focusable vertex controls and arrow keys to move, Insert adds a midpoint, and Delete removes a vertex. In 3D a compact expandable control provides keyboard movement and pointer buttons for insertion and removal. The existing yellow outline/handle styling and visible focus treatment identify these controls.

The greenhouse arch ratio is dimensionless; show the corresponding crown height in metres next to it.

Polygonal or vertex-edited basements use numbered Perimeter edge checkboxes rather than compass-side checkboxes, preserving open walls as edges move or split. Replacing the footprint or dimensions while an edge is open shows an explanatory toast instead of silently closing that wall.

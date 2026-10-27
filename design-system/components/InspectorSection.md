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

In the 2D indoor plan, the selected basement shows focusable outline vertices: drag or use arrow keys to move, Insert adds a midpoint, and Delete removes a vertex. The existing yellow outline/handle styling and visible focus treatment identify these controls.

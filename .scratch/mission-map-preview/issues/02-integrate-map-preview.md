Status: ready-for-agent

## Parent

None

## What to build

Integrate a miniature map preview directly into the `MissionModal` layout. Replace the raw JSON string `<input id="mission-map">` field with a small container (e.g., 200px tall). Inside this container, render the `MapCanvas` component with the `readonly` prop set to true, using the form's current `map` JSON state. The preview should automatically re-render and scale appropriately when the user updates the map via the full-screen Map Builder.

## Acceptance criteria

- [ ] `MissionModal.tsx` displays the `MapCanvas` preview instead of the raw JSON input field.
- [ ] The `MapCanvas` is in `readonly` mode.
- [ ] The preview scales down cleanly inside its designated container.
- [ ] The preview updates in real-time or upon closing the full Map Builder modal when a new map is saved.

## Blocked by

- .scratch/mission-map-preview/issues/01-read-only-mapcanvas.md (Completed)

---

## Agent Brief

**Category:** enhancement
**Summary:** Replace the map JSON text input with a live, scalable readonly MapCanvas preview

**Current behavior:**
Inside `MissionModal.tsx`, the `map` state (from `react-hook-form`) is displayed to the user as a raw string inside an HTML `<input id="mission-map" readOnly />`.

**Desired behavior:**
The `<input>` should be replaced by a miniature map preview. A container `<div>` with a fixed height (e.g. `200px` or `250px`) should house a `<MapCanvas readonly initialMapJson={getValues('map')} />`. The map state needs to be watched so the preview updates automatically when the user returns from the Map Builder modal with a new map JSON string.

**Key interfaces:**
- `MissionModal.tsx` render function — replace the text `<input>` beside the "Open Map Builder" button.
- `react-hook-form`'s `watch` or `getValues` — must be used so the `MapCanvas` component mounts with the correct, latest JSON. Note that `MapCanvas` might need to be forced to re-mount (using a `key` prop based on the json string or length) if it doesn't dynamically parse `initialMapJson` on updates.

**Acceptance criteria:**
- [ ] The raw JSON text input for the map is completely removed from the UI.
- [ ] A small preview container renders `MapCanvas` with `readonly={true}` in its place.
- [ ] The preview displays the map corresponding to the form's current `map` value.
- [ ] Updating the map in the fullscreen Map Builder updates the miniature preview upon returning.

**Out of scope:**
- Editing shapes from the miniature preview (handled by `readonly`).
- Modifying the layout or logic of the Match Builder sidebar.

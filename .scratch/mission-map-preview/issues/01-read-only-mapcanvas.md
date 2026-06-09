Status: ready-for-agent

## What to build

Update the `MapCanvas` component to accept a new `readonly` boolean prop. When `readonly` is true, the component should hide the editing toolbar, force `isLocked: true` to prevent shape dragging, and disable pointer interactions on the canvas. This allows `MapCanvas` to act as a clean, static, scalable map viewer for previews.

## Acceptance criteria

- [ ] `MapCanvas` accepts an optional `readonly` prop.
- [ ] If `readonly` is true, the toolbar (`MapToolbar` or toolbar buttons) is not rendered.
- [ ] If `readonly` is true, the map cannot be edited, and shapes cannot be dragged, resized, or drawn.
- [ ] The existing behavior is unaffected when `readonly` is false or not provided.

## Blocked by

None - can start immediately

---

## Agent Brief

**Category:** enhancement
**Summary:** Extend MapCanvas to support a strict read-only viewing mode

**Current behavior:**
The `MapCanvas` component assumes it is always being used as an interactive editor. It hardcodes its internal state, draws its own toolbar, and accepts interactions (clicks, drags) whenever `isLocked` is false. There is no way to render a purely static map preview without the toolbar and tools getting in the way.

**Desired behavior:**
`MapCanvas` should accept a `readonly?: boolean` prop. When true, the component skips rendering the toolbar completely and treats the map as fully locked (`isLocked: true`). No drawing, selecting, or dragging should be possible, turning the canvas into a clean, scalable preview. 

**Key interfaces:**
- `MapCanvasProps` — must be extended to include `readonly?: boolean`.
- Toolbar rendering logic inside `MapCanvas` — should return `null` or be skipped if `readonly` is true.
- `ShapeLayer`'s `isLocked` prop — must be forced to `true` if `readonly` is true, regardless of the internal reducer state.

**Acceptance criteria:**
- [ ] Passing `readonly={true}` to `MapCanvas` hides the toolbar.
- [ ] Passing `readonly={true}` to `MapCanvas` prevents any shape from being selected, dragged, or resized.
- [ ] Passing `readonly={true}` prevents the user from drawing new polygons or adding any new shapes.
- [ ] Omitting the `readonly` prop or passing `false` maintains the exact current editor functionality.

**Out of scope:**
- Modifying how the map scales or fits its container (scaling is handled via an external `ResizeObserver`).
- Integrating the preview into other screens (handled by a separate issue).

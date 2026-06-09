### Goal

Create a utility that can be used to draw interactive campaign maps. This tool will be used to edit and store map data within the `map` attribute of a **Mission** entity (saved as a Konva JSON structure).

The user can select a play area that will generally be a square or rectangle of any size. Default sizes include 60x44 inches, 72x48 inches, 30x22 inches, and 36x24 inches. Any size using an even number of inches is acceptable.

### Features & Requirements

- **Grid System, Scaling & Interaction:** 
  - The map will feature a grid overlay of 1 inch by 1 inch squares for snapping.
  - **Snapping Behavior:** Snapping defaults to **ON** and snaps objects (corners/vertices) to the grid *intersections* (lines) for precise zone layout. 
  - **Freeform Placement:** Users can hold the `Shift` key while drawing or dragging to temporarily disable snapping (essential for precise placement of objectives).
  - **Nudging:** Users can select a shape (or a specific point of a Polygon) and use the arrow keys to "nudge" it by 1 pixel for micro-adjustments.
  - To handle mixing metrics (inches for boards, mm for objectives), the system will use a mathematical scale where 1 inch ≈ 25.4mm.
  - A global constant (e.g., `PIXELS_PER_INCH = 20`) will ensure the board, grid, and objectives render proportionally on the canvas.
- **Drawing Zones:** 
  - Tools to draw zones/areas indicating deployment, mission objectives, and other terrain.
  - Available tools will include basic primitives: Squares, Rectangles, Triangles, and Circles.
  - For complex, custom-shaped zones, a **Polygon tool** will be provided (allowing the user to click point-by-point to outline the zone).
  - Users can select any drawn area to enter a title, type, and description.
- **Objectives:** 
  - Objectives are predefined circles that are either 40mm or 32mm in diameter (calculated accurately against the inch-based grid).
- **Measurement Arrows:** 
  - Arrows indicate distances in inches between points (e.g., shape edges to map edges, or shape dimensions).
  - **Auto-Generation:** When a shape is added, the tool will automatically generate and suggest permanent Arrow objects (e.g., showing distance to the nearest board edge). 
  - These are permanent canvas objects intended to be visible on the final exported image to aid in real-world physical table setup. The user can manually delete them if they are unwanted.
  - Users can also manually place measurement arrows between any two points.
  - The tool calculates and labels all arrows with the exact distance in inches based on the canvas scale.
- **State Management:**
  - The map can be saved (serialized to JSON), reloaded, and edited.
  - A "Lock" feature to prevent accidental edits to the map.
  - An export function to save the visible map as an image file (e.g., PNG).

### Technical Proposal

**Konva (react-konva)** is the chosen library for map display and interaction.
- Konva is an HTML5 Canvas JavaScript framework that extends the 2d context by enabling canvas interactivity.
- It provides high performance animations, node nesting, layering, caching, and event handling required for a complex map builder.

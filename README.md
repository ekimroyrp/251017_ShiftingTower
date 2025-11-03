# 251017_ShiftingTower

251017_ShiftingTower is an interactive tower sketching studio built with Three.js, Cannon-ES, and lil-gui. It procedurally stacks, offsets, and colors architectural slabs so you can experiment with shifting high-rise massings, then toggle lighting, fog, shadows, and physics to see concepts from both presentation and simulation perspectives.

## Features
- Parametric geometry generator with controls for slab count, taper, shift amplitude, vertical jitter, and per-level sub-slab layering.
- Lighting presets ranging from soft studio to neon night, plus background and fog tuning for instant mood changes.
- Procedural gradient coloring across the tower with easy swapping of top and bottom hues.
- Optional physics mode powered by Cannon-ES to let slabs tumble under gravity for concept studies.
- Auto-rotation, shadow toggles, and presentation helpers optimized for screenshot capture or quick reviews.

## Getting Started
1. Install dependencies: `npm install`
2. Launch the dev server: `npm run dev` (Vite serves at http://localhost:5173 by default)
3. Build for production: `npm run build`
4. Preview the production build locally: `npm run preview`

## Controls
- **Structure:** Adjust slab count, total height, base dimensions, taper, and jitter to reshape the tower massing.
- **Layering:** Fine-tune slab thickness variance, sub-slab quantity, and scaling to add complexity.
- **Footprint:** Set width/depth variance and shift amplitude to create dynamic offsets.
- **Color:** Pick gradient bottom/top colors and background tone for the scene.
- **Presentation:** Toggle auto-rotation, alter rotation speed, enable shadows or fog, and switch lighting presets.
- **Physics:** Enable gravity mode to drop the tower slabs using the built-in physics simulation.

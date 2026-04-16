# NeuralReach UI Polish — Demo-Ready Design

## Context

Hackathon demo in a few hours. Science fair format — judges walk between tables, 4-minute pitch. The tree is the hero (seen from afar), the floating window opens on node click (seen up close). Current UI is functional but visually rough. Goal: make it hackathon-winner sharp.

## Design Decisions

### 1. Theme: Clay Fidele (Light)

White background (#FAFAFA), white cards (#FFFFFF), gray borders (#E5E7EB), subtle shadows. No dark mode anywhere — including the brain viz. Consistent with clay.com aesthetic.

Color tokens:
- Background: #FAFAFA
- Card surface: #FFFFFF
- Border: #E5E7EB
- Text primary: #111827
- Text secondary: #6B7280
- Text muted: #9CA3AF
- Positive: #10B981 (emerald-500)
- Negative: #EF4444 (red-500)
- Positive bg: #ECFDF5
- Negative bg: #FEF2F2

### 2. Tree Nodes: Score-Forward

Replace current basic card with a score-dominant design:

- **Top band**: Full-width gradient header colored by score. Green gradient (`linear-gradient(135deg, #ECFDF5, #D1FAE5)`) for positive, red gradient (`linear-gradient(135deg, #FEF2F2, #FECACA)`) for negative.
- **Score**: Large (20px), font-weight 800, monospace, in the band. "+2.40" or "-1.87".
- **Badge**: "BEST" pill (white bg, green text) on the best-scoring variant only.
- **Body**: Variant label (11px semibold, gray-700) + message preview (11px, gray-400, line-clamp-2).
- **Mini score bars**: 5 bars at the bottom (4 green for attention/curiosity/trust/motivation, 1 red for resistance). Width proportional to normalized score. Height 3px, border-radius 2px.
- **Node width**: 240px (up from current 208px).
- **Selected state**: ring-2 ring-blue-200, border-blue-500, shadow-lg.
- **Archived state**: opacity-40.

File: `HorizontalTree.tsx`

### 3. Tree Edges: Gradient Score-to-Score

Replace uniform gray edges with score-colored gradients:

- Map each variant's overall score to a color on the scale: red (#EF4444) → yellow (#F59E0B) → green (#10B981).
- Edge uses SVG `<linearGradient>` interpolating from parent score color to child score color.
- Score mapping function: `clamp((score + 1) / 3, 0, 1)` → 0.0 = red, 0.5 = yellow, 1.0 = green. So score -1 → red, score +0.5 → yellow, score +2 → green.
- Stroke width: 2px (unchanged).
- Edge type: smoothstep (unchanged).
- Fallback: gray (#D1D5DB) if either variant has no scores yet.

File: `HorizontalTree.tsx` (add custom edge component)

### 4. Floating Window: 3-Column Layout, No Tabs

Remove the tab system. Show everything simultaneously in 3 columns:

**Title bar** (unchanged structure):
- macOS traffic lights (red/yellow/green dots)
- Variant name as title
- Overall score badge (right side)

**Left column (~32% width)**: Email + Lead
- Section "Email Draft" with the message text. WordStream highlighting if matrix loaded.
- Section "Active Lead" with avatar initials, name, role, company in a subtle card.
- Mini OCEAN bars below the lead (5 tiny bars: O/C/E/A/N with appropriate colors).

**Center column (flex-1)**: Brain + Timeline
- Brain viz on #F3F4F6 background (see section 5).
- Small color legend overlay (top-right corner): High/Med/Low with color swatches.
- Timeline scrubber at bottom with current word indicator.

**Right column (~22% width)**: Scores + Persona
- 5 score bars (attention, curiosity, trust, motivation, resistance) with gradient fills.
- Bars height 4px (up from 1.5px).
- Overall score at bottom, large (16px), bold.
- Persona adjustment box: blue background (#EFF6FF), shows "Adjusted for {name}" + key deltas.

**Action bar** (bottom): Branch (primary black), Optimize (secondary white), Prune (ghost, right-aligned).

**Lead switching**: Add clickable lead pills (initials avatar + name, horizontal row) below the active lead card. Click a pill → it becomes the active lead, scores column updates with persona-adjusted values. Click again to deselect (raw scores).

File: `campaign.$id.tsx`

### 5. Brain Visualization: Light Background + Jet Colormap

Replace dark sci-fi aesthetic with clean light look:

- **Scene background**: #F3F4F6 (gray-100) — was #0A0A0F
- **Mesh baseline color**: #D1D5DB (gray-300) — was dark
- **Remove bloom/postprocessing**: No EffectComposer, no Bloom. Clean render only.
- **Colormap**: Jet scale — Blue (#3B82F6) → Cyan (#06B6D4) → Green (#10B981) → Yellow (#EAB308) → Orange (#F59E0B) → Red (#EF4444)
- **Threshold**: Only top 20% activated vertices get colored (unchanged logic, new colors).
- **Ambient light**: Increase intensity for clean look on light bg.

File: `Brain.tsx`

### 6. Score Bars Polish

- Bar height: 4px (up from 1.5px).
- Positive bars: `linear-gradient(to right, #10B981, #34D399)`.
- Negative bars (resistance): `linear-gradient(to right, #F87171, #EF4444)`.
- Persona delta: Blue info box (#EFF6FF border #DBEAFE) showing key deltas with +/- values.

File: `ScoreBars.tsx`

### 7. Brain Legend

- Adapt to jet colormap colors.
- Light background, dark text.
- Compact: 3 entries (High/Med/Low) with color swatches.

File: `BrainLegend.tsx`

## Files Changed

| File | Changes |
|---|---|
| `frontend/src/components/HorizontalTree.tsx` | New VariantNode (score-forward), custom gradient edge, node width 240px |
| `frontend/src/routes/campaign.$id.tsx` | Remove tabs, 3-column window layout, lead selector in left column |
| `frontend/src/components/Brain.tsx` | Light bg #F3F4F6, gray mesh, jet colormap, remove bloom |
| `frontend/src/components/ScoreBars.tsx` | Thicker bars (4px), gradient fills, persona delta box |
| `frontend/src/components/BrainLegend.tsx` | Jet colormap legend, light background |

## Out of Scope

- Landing page (`index.tsx`) — only 5s of demo, not worth polishing now.
- Convex backend — no schema or query changes needed.
- New dependencies — all achievable with existing stack (Tailwind, React Flow, R3F).
- Claude email generation / Clay sending — separate feature, not UI polish.

## Success Criteria

- Judges can read scores from 2 meters away (score-forward nodes).
- Tree tells the improvement story visually without reading (gradient edges).
- Clicking a node shows email + brain + scores simultaneously (no tab switching).
- Brain on light background feels clean and scientific, not dark/gamer.
- Entire UI feels like one cohesive product, not a prototype.

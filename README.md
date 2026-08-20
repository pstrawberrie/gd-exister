# gd-exister

Exister's game and visual experimentation laboratory.

## Structure

- `experiments/` — Self-contained prototypes and visual experiments. Things can begin, mutate, fail, or disappear here without needing to become permanent Exister systems.
- `exister/` — Reusable pieces that have survived experimentation and belong to the Exister universe.
  - `entities/wisps/` — Shared wisp behavior, visuals, and related resources.
  - `fonts/` — Shared Exister fonts.
  - `game/` — Shared game state and rules used across scenes.
  - `ui/` — Shared world-space UI and transitions.
  - `lighting/` — Shared lighting resources and systems.
  - `shaders/` — Shared shaders.
  - `audio/` — Shared audio and audio-related resources.
- `games/` — Isolated playable game experiments built from reusable Exister systems.

Keep experiments together by concept rather than separating files globally by type. Promote something into `exister/` only when it earns permanence.

## Current shared baselines

- Wisp — the Presence 001 wisp is the reusable baseline under `exister/entities/wisps/`.
- Action space — the thin organic Seed Halo outline, gold proximity glow, and interior particles under `exister/ui/`.
- Title font — Isenheim.
- Body/UI font — Crimson Pro, using ExtraBold for button labels.

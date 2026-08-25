# Exister 3D Laboratory

This repository is the clean 3D restart of the Exister game laboratory.

The previous 2D experiments did their job: they established important visual and interaction ideas. Their implementation is intentionally not carried forward. The 3D world, its wisps, and its systems will be rediscovered for 3D rather than translated mechanically.

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

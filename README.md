# gd-exister

Exister's game and visual experimentation laboratory.

## Structure

- `experiments/` — Self-contained prototypes and visual experiments. Things can begin, mutate, fail, or disappear here without needing to become permanent Exister systems.
- `exister/` — Reusable pieces that have survived experimentation and belong to the Exister universe.
  - `entities/wisps/` — Shared wisp scenes, behavior, visuals, and related resources.
  - `lighting/` — Shared lighting resources and systems.
  - `shaders/` — Shared shaders.
  - `audio/` — Shared audio and audio-related resources.

Keep experiments together by concept rather than separating files globally by type. Promote something into `exister/` only when it earns permanence.

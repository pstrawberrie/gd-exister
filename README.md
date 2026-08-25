# Exister 3D Laboratory

This repository is the clean 3D restart of the Exister game laboratory.

The previous 2D experiments did their job: they established important visual and interaction ideas. Their implementation is intentionally not carried forward. The 3D world, its wisps, and its systems will be rediscovered for 3D rather than translated mechanically.

## Direction

- Godot 4 / GDScript
- Browser-first
- Full 3D
- Stylized geometry + atmosphere rather than photorealism
- No dependency on external art assets or textures as a requirement
- Hand-authored/static overworld geography
- Procedural generation used as an **authoring tool**, not as a randomized overworld seed
- Hardcore-mode procedural generation can be explored separately later
- Multiplayer target: intimate persistent world, roughly 1–10 players

## Repository shape

```text
experiments/
  world_001/        First 3D world-generation experiment.

exister/
  world/
    terrain/        Reusable terrain-generation/world-shaping systems.
    atmosphere/     Reusable sky, lighting, weather, and ambience systems.
  entities/
    wisps/          Future 3D wisp implementation.
```

Keep experiments self-contained until a system earns a reusable home under `exister/`.

## Terrain philosophy

The overworld itself is authored and familiar. Noise/procedural systems are allowed to help us **find and shape** landforms, but once geography feels right it becomes canon rather than changing between sessions.

`World 001` therefore uses a fixed noise seed and tunable terrain parameters. It is a landscape sketching tool, not a runtime random-world generator.

## Browser rendering

The project intentionally uses Godot's **GL Compatibility** renderer. Web exports use WebGL 2 and this keeps the visual target aligned with the browser from the beginning.

## Terrain3D

Terrain3D is intentionally not installed as a runtime dependency yet. We may evaluate it later as an editor-side sculpting/baking tool once the native prototype teaches us what kind of terrain workflow Exister actually needs.

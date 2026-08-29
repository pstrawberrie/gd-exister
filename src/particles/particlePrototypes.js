import { ParticleEmitter, drawCircle, rgb, vec2 } from 'littlejsengine';

const HEAVEN_GROUND_Y = -5.25;

export function getBloodtideWaveY(x, time) {
    return 0.35
        + Math.sin(x * 0.9 + time * 1.9) * 0.28
        + Math.sin(x * 1.85 - time * 2.8) * 0.18
        + Math.sin(x * 3.6 + time * 4.6) * 0.08
        + Math.sin(x * 6.8 - time * 7.2) * 0.035;
}

let particleSceneTime = 0;

export function setParticleSceneTime(time) {
    particleSceneTime = time;
}

export const particlePrototypes = [
    {
        id: 'heaven',
        name: 'Heaven',
        description: 'A descending light with illuminated dust suspended above a hard ground plane.',
        captionNumber: 'Particle 001',
        captionTitle: 'Heaven',
        captionSubtitle: 'light from above · dust in suspension',
    },
    {
        id: 'bloodtide',
        name: 'Bloodtide',
        description: 'Panic-white dust falls into a translucent blood ocean with chaotic glowing crests.',
        captionNumber: 'Particle 002',
        captionTitle: 'Bloodtide',
        captionSubtitle: 'panic fall · blood sea below',
    },
];

export function createParticlePrototype(id) {
    if (id === 'heaven')
        return createHeaven();

    if (id === 'bloodtide')
        return createBloodtide();

    return [];
}

function createHeaven() {
    const emitters = [];

    // Broad, barely-there dust. Long lives keep the scene continuously full.
    emitters.push(createRoundEmitter(new ParticleEmitter(
        vec2(0, 1.2), 0,
        18, 0, 11, Math.PI * 2,
        undefined,
        rgb(1, 0.94, 0.76, 0.1), rgb(0.88, 0.84, 0.72, 0.035),
        rgb(1, 0.94, 0.76, 0), rgb(0.88, 0.84, 0.72, 0),
        6, 0.07, 0.035, 0.035, 0.01,
        0.995, 0.99, 0, Math.PI * 2,
        0.18, 0.85, false, false,
    )));

    // Fine bright motes: sharper, smaller, and more numerous near the light.
    emitters.push(createRoundEmitter(new ParticleEmitter(
        vec2(0, 2.8), 0,
        10, 0, 20, Math.PI * 2,
        undefined,
        rgb(1, 0.98, 0.9, 0.26), rgb(0.98, 0.86, 0.58, 0.08),
        rgb(1, 0.98, 0.9, 0), rgb(0.98, 0.86, 0.58, 0),
        4.4, 0.032, 0.012, 0.028, 0,
        0.997, 1, 0, Math.PI * 2,
        0.1, 0.75, false, true,
    )));

    // Soft bloom dust closer to the reflected light for depth / defocus variation.
    emitters.push(createRoundEmitter(new ParticleEmitter(
        vec2(0, -2.6), 0,
        7.6, 0, 7, Math.PI * 2,
        undefined,
        rgb(1, 0.9, 0.62, 0.09), rgb(0.9, 0.82, 0.62, 0.025),
        rgb(1, 0.9, 0.62, 0), rgb(0.9, 0.82, 0.62, 0),
        5.4, 0.16, 0.08, 0.018, 0,
        0.998, 1, 0, Math.PI * 2,
        0.25, 0.9, false, true,
    )));

    return emitters;
}


function createBloodtide() {
    const emitters = [];

    // Broad soft fall: white dust dropping quickly in mostly straight lines.
    emitters.push(createUpwardBloodtideEmitter(new ParticleEmitter(
        vec2(0, -5.8), 0,
        18, 0, 22, 0,
        undefined,
        rgb(0.98, 0.99, 1, 0.12), rgb(0.92, 0.94, 1, 0.03),
        rgb(0.98, 0.99, 1, 0), rgb(0.92, 0.94, 1, 0),
        4.2, 0.024, 0.012, 0.02, 0,
        0.998, 1, 0, 0,
        0.04, 2.4, false, false,
    )));

    // Sharper bright motes near the center of the scene.
    emitters.push(createUpwardBloodtideEmitter(new ParticleEmitter(
        vec2(0, -4.6), 0,
        12, 0, 38, 0,
        undefined,
        rgb(1, 1, 1, 0.22), rgb(0.95, 0.97, 1, 0.06),
        rgb(1, 1, 1, 0), rgb(0.95, 0.97, 1, 0),
        2.9, 0.016, 0.008, 0.014, 0,
        0.999, 1, 0, 0,
        0.02, 3.1, false, true,
    )));

    // Slightly larger defocused particles to keep depth and panic variation.
    emitters.push(createUpwardBloodtideEmitter(new ParticleEmitter(
        vec2(0, -3.8), 0,
        16, 0, 16, 0,
        undefined,
        rgb(0.96, 0.97, 1, 0.07), rgb(0.92, 0.94, 1, 0.02),
        rgb(0.96, 0.97, 1, 0), rgb(0.92, 0.94, 1, 0),
        4.6, 0.03, 0.015, 0.012, 0,
        0.9985, 1, 0, 0,
        0.05, 2.7, false, true,
    )));

    // Blood rain: rebuilt from scratch. Several narrow emitters span the top
    // of the viewport, while each spawned particle gets an explicit downward
    // velocity so the rain never depends on emitter-angle conventions.
    const bloodRainColumns = [-7.5, -3.75, 0, 3.75, 7.5];
    for (const x of bloodRainColumns) {
        emitters.push(createBloodRainEmitter(new ParticleEmitter(
            vec2(x, 8.25), 0,
            4.5, 0, 5.625, 0,
            undefined,
            rgb(1, 0.08, 0.1, 0.92), rgb(0.78, 0.015, 0.04, 0.7),
            rgb(1, 0.08, 0.1, 0), rgb(0.78, 0.015, 0.04, 0),
            2.7, 0.06624, 0.02304, 0, 0,
            1, 1, 0, 0,
            0.08, 0.06, false, true,
        )));
    }


    return emitters;
}

function createRoundEmitter(emitter) {
    // LittleJS's untextured particles render as quads by default. Keep the
    // emitter's spawning/physics/lifetime/fade behavior, but render each
    // particle as a circle for Exister's softer dust language.
    emitter.particleCreateCallback = (particle) => {
        particle.render = function renderRoundExisterParticle() {
            const diameter = this.size.x;
            const radius = diameter * 0.5;

            // Some scenes treat the surface as a true clipping boundary.
            if (emitter.existerClipY != null && this.pos.y - radius <= emitter.existerClipY)
                return;

            drawCircle(this.pos, diameter, this.color);
        };
    };

    return emitter;
}



function createUpwardBloodtideEmitter(emitter) {
    emitter.particleCreateCallback = (particle) => {
        // Preserve the existing slow/random magical drift, but ensure the
        // particle's long-term destination is upward rather than downward.
        const horizontalDrift = (Math.random() - 0.5) * 0.018;
        const upwardSpeed = 0.008 + Math.random() * 0.018;
        particle.velocity = vec2(horizontalDrift, upwardSpeed);

        // Only about half of the above-water dust should turn red. The rest
        // should stay in a pale gray/white family once they leave the water.
        particle.existerTurnsRedAboveWater = Math.random() < 0.5;

        particle.render = function renderUpwardBloodtideParticle() {
            const diameter = this.size.x;
            const waveY = getBloodtideWaveY(this.pos.x, particleSceneTime);
            const aboveWater = this.pos.y > waveY;

            // Below the surface, keep the original pale magical dust. Once the
            // mote rises out of the water, only half shift to blood-red; the
            // rest become softly gray-white so the field stays varied.
            const aboveWaterAlpha = Math.min(0.46, Math.max(0.22, this.color.a * 1.8));
            const paleAboveWaterAlpha = Math.min(0.4, Math.max(0.18, this.color.a * 1.55));
            const aboveWaterColor = particle.existerTurnsRedAboveWater
                ? rgb(1, 0.28, 0.24, aboveWaterAlpha)
                : rgb(0.98, 0.985, 1, paleAboveWaterAlpha);
            const belowWaterColor = rgb(
                Math.min(1, this.color.r * 1.08),
                Math.min(1, this.color.g * 1.08),
                Math.min(1, this.color.b * 1.08),
                Math.min(0.36, Math.max(0.12, this.color.a * 1.35)),
            );
            const color = aboveWater ? aboveWaterColor : belowWaterColor;

            drawCircle(this.pos, diameter, color);
        };
    };

    return emitter;
}

function createBloodRainEmitter(emitter) {
    emitter.particleCreateCallback = (particle) => {
        // Explicitly force a very fast downward trajectory with only a hair of
        // horizontal nervousness. LittleJS still owns lifetime and cleanup.
        particle.velocity = vec2(
            (Math.random() - 0.5) * 0.008,
            -(0.116 + Math.random() * 0.04),
        );

        particle.render = function renderBloodRainParticle() {
            const diameter = this.size.x;
            const verticalOffset = diameter * 0.34;
            const waveY = getBloodtideWaveY(this.pos.x, particleSceneTime);
            const submerged = this.pos.y <= waveY;

            // Water drag: once submerged, reduce the fall speed smoothly and
            // keep it capped so the drop feels resisted by the blood ocean.
            if (submerged && !this.existerSubmerged) {
                this.velocity.y *= 0.38;
                this.velocity.x *= 0.5;
                this.existerSubmerged = true;
            }

            // Keep the rain simple now: a red oblong body above the surface,
            // fading to a faint white ghost once submerged.
            const bodyColor = submerged
                ? rgb(1, 1, 1, this.color.a * 0.16)
                : rgb(0.92, 0.025, 0.055, this.color.a * 0.52);

            drawCircle(this.pos.add(vec2(0, verticalOffset)), diameter, bodyColor);
            drawCircle(this.pos, diameter, bodyColor);
            drawCircle(this.pos.add(vec2(0, -verticalOffset)), diameter, bodyColor);
        };
    };

    return emitter;
}

export function destroyParticleEmitters(emitters) {
    for (const emitter of emitters)
        emitter?.destroy?.(true);
}

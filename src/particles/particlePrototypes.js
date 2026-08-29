import { ParticleEmitter, drawCircle, rgb, vec2 } from 'littlejsengine';

const HEAVEN_GROUND_Y = -5.25;

export const particlePrototypes = [
    {
        id: 'heaven',
        name: 'Heaven',
        description: 'A descending light with illuminated dust suspended above a hard ground plane.',
    },
];

export function createParticlePrototype(id) {
    if (id === 'heaven')
        return createHeaven();

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

function createRoundEmitter(emitter) {
    // LittleJS's untextured particles render as quads by default. Keep the
    // emitter's spawning/physics/lifetime/fade behavior, but render each
    // particle as a circle for Exister's softer dust language.
    emitter.particleCreateCallback = (particle) => {
        particle.render = function renderRoundHeavenParticle() {
            const diameter = this.size.x;
            const radius = diameter * 0.5;

            // Treat the ground as a true clipping boundary. If any part of the
            // mote would cross below it, do not render that mote this frame.
            if (this.pos.y - radius <= HEAVEN_GROUND_Y)
                return;

            drawCircle(this.pos, diameter, this.color);
        };
    };

    return emitter;
}

export function destroyParticleEmitters(emitters) {
    for (const emitter of emitters)
        emitter?.destroy?.();
}

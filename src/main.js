import {
    drawCircle,
    drawLine,
    engineInit,
    rgb,
    setCameraPos,
    setCameraScale,
    setCanvasClearColor,
    setInputPreventDefault,
    vec2,
} from 'littlejsengine';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { activeParticlePrototype } from './ui/labState.js';
import { createParticlePrototype, destroyParticleEmitters } from './particles/particlePrototypes.js';
import './ui/styles.css';

const CAMERA_SCALE = 62;
let sceneTime = 0;
let activeParticleId = 'heaven';
let particleEmitters = [];

setInputPreventDefault(false);

activeParticlePrototype.subscribe((id) => {
    if (id === activeParticleId && particleEmitters.length)
        return;

    activeParticleId = id;
    rebuildParticleScene();
});

function gameInit() {
    setCanvasClearColor(rgb(0.01, 0.012, 0.016));
    setCameraPos(vec2(0, 0));
    setCameraScale(CAMERA_SCALE);
    rebuildParticleScene();
}

function gameUpdate() {
    sceneTime += 1 / 60;
}

function gameUpdatePost() {
    setCameraPos(vec2(0, 0));
    setCameraScale(CAMERA_SCALE);
}

function gameRender() {
    if (activeParticleId === 'heaven')
        drawHeaven();
    else if (activeParticleId === 'bloodtide')
        drawBloodtide();
}

function gameRenderPost() {
    // Static prototype navigation is HTML/Svelte. LittleJS owns the scene.
}

function rebuildParticleScene() {
    destroyParticleEmitters(particleEmitters);
    particleEmitters = [];

    // The store subscribes before engineInit; wait until the engine is ready.
    if (!document.querySelector('canvas'))
        return;

    particleEmitters = createParticlePrototype(activeParticleId);
}


function drawBloodtide() {
    const surge = sceneTime;
    const seaLevel = 0.35;
    const bottomY = -8.8;
    const leftX = -10;
    const rightX = 10;
    const step = 0.12;

    // Faint upper haze so the falling white dust feels trapped in a bad place.
    drawCircle(vec2(0, 3.4), 5.6, rgb(0.26, 0.02, 0.03, 0.018));
    drawCircle(vec2(0, -0.6), 7.8, rgb(0.34, 0.03, 0.04, 0.024));

    // Chaotic wave surface built from several frequencies so the top edge feels
    // nervous and unstable rather than like a gentle sine wave.
    const columns = [];
    for (let x = leftX; x <= rightX; x += step) {
        const waveY = seaLevel
            + Math.sin(x * 0.9 + surge * 1.9) * 0.28
            + Math.sin(x * 1.85 - surge * 2.8) * 0.18
            + Math.sin(x * 3.6 + surge * 4.6) * 0.08
            + Math.sin(x * 6.8 - surge * 7.2) * 0.035;
        columns.push({ x, waveY });

        // Semi-transparent body lets some white particles remain visible below.
        drawLine(vec2(x, bottomY), vec2(x, waveY), 0.11, rgb(0.54, 0.02, 0.05, 0.36));
        drawLine(vec2(x, bottomY), vec2(x, waveY - 0.05), 0.065, rgb(0.72, 0.04, 0.08, 0.12));
    }

    // Glowing red crest pushed into a near-molten metallic specular look.
    for (let i = 1; i < columns.length; i++) {
        const a = columns[i - 1];
        const b = columns[i];
        const crestPulse = 0.82 + Math.sin(surge * 8.5 + a.x * 2.4) * 0.18;

        // Large red bloom hugging the liquid edge.
        drawLine(vec2(a.x, a.waveY), vec2(b.x, b.waveY), 0.34, rgb(1, 0.035, 0.07, 0.2 * crestPulse));
        drawLine(vec2(a.x, a.waveY), vec2(b.x, b.waveY), 0.24, rgb(1, 0.06, 0.08, 0.3 * crestPulse));
        drawLine(vec2(a.x, a.waveY), vec2(b.x, b.waveY), 0.15, rgb(1, 0.13, 0.12, 0.5 * crestPulse));

        // Hot metal-like crest core.
        drawLine(vec2(a.x, a.waveY + 0.006), vec2(b.x, b.waveY + 0.006), 0.085, rgb(1, 0.28, 0.22, 0.82));
        drawLine(vec2(a.x, a.waveY + 0.014), vec2(b.x, b.waveY + 0.014), 0.038, rgb(1, 0.66, 0.5, 0.98));
        drawLine(vec2(a.x, a.waveY + 0.02), vec2(b.x, b.waveY + 0.02), 0.018, rgb(1, 0.92, 0.78, 0.94));

        // Thin specular streaks offset above the crest make the shine appear to
        // kick outward like reflected light on polished metal.
        if (i % 3 === 0) {
            const flare = 0.055 + (Math.sin(a.x * 5.7 + surge * 10.5) + 1) * 0.035;
            drawLine(vec2(a.x, a.waveY + 0.055), vec2(b.x, b.waveY + 0.055), 0.012, rgb(1, 0.52, 0.4, flare));
            drawLine(vec2(a.x, a.waveY + 0.09), vec2(b.x, b.waveY + 0.09), 0.007, rgb(1, 0.35, 0.3, flare * 0.6));
        }
    }

    // Darker underbody to keep the sea heavy and ominous.
    drawCircle(vec2(0, -5.8), 7.2, rgb(0.16, 0.005, 0.015, 0.1));
}

function drawHeaven() {
    const breathing = 0.92 + Math.sin(sceneTime * 0.28) * 0.08;
    const top = vec2(0, 8.2);
    const groundY = -5.25;
    const landing = vec2(0, groundY);

    // Large descending ray. It terminates exactly at the ground plane.
    for (let i = 0; i < 46; i++) {
        const t = i / 45;
        const signed = t * 2 - 1;
        const edge = Math.abs(signed);
        const end = vec2(signed * 3.2, groundY + 0.035);
        const alpha = (0.015 + (1 - edge) * 0.022) * breathing;
        const width = 0.16 + (1 - edge) * 0.13;
        drawLine(top.add(vec2(signed * 0.18, 0)), end, width, rgb(1, 0.93, 0.72, alpha));
    }

    // Bright inner ray.
    for (let i = 0; i < 18; i++) {
        const t = i / 17;
        const signed = t * 2 - 1;
        const edge = Math.abs(signed);
        const end = vec2(signed * 1.28, groundY + 0.035);
        drawLine(top, end, 0.1, rgb(1, 0.97, 0.84, (0.022 + (1 - edge) * 0.032) * breathing));
    }

    // Heat the floor itself instead of sending a visible halo upward. Keep
    // the energy concentrated in the reflection line, with only a tiny amount
    // of immediate surface bloom above it.
    const heatedFloorHalfWidth = 3.45;

    // The ground itself is a hard visual boundary. Nothing in this prototype
    // intentionally renders beneath it.
    drawLine(vec2(-10, groundY), vec2(10, groundY), 0.025, rgb(0.92, 0.8, 0.52, 0.09));

    // Main heated reflection strip — bright, narrow, and exactly as long as
    // the light's floor reflection footprint.
    drawLine(vec2(-heatedFloorHalfWidth, groundY + 0.012), vec2(heatedFloorHalfWidth, groundY + 0.012), 0.038, rgb(1, 0.96, 0.84, 0.34 * breathing));
    drawLine(vec2(-heatedFloorHalfWidth, groundY + 0.015), vec2(heatedFloorHalfWidth, groundY + 0.015), 0.016, rgb(1, 1, 0.96, 0.72 * breathing));

    // Tiny constrained bloom hugging the surface, not a visible upward halo.
    drawLine(vec2(-heatedFloorHalfWidth, groundY + 0.028), vec2(heatedFloorHalfWidth, groundY + 0.028), 0.03, rgb(1, 0.92, 0.72, 0.12 * breathing));
    drawLine(vec2(-heatedFloorHalfWidth * 0.9, groundY + 0.05), vec2(heatedFloorHalfWidth * 0.9, groundY + 0.05), 0.024, rgb(1, 0.9, 0.68, 0.05 * breathing));
}

mount(App, { target: document.getElementById('ui-root') });
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

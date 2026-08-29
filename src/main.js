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

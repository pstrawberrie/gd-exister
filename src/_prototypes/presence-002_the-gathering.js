import {
    engineInit,
    drawCircle,
    drawLine,
    drawRect,
    drawText,
    drawTextScreen,
    keyIsDown,
    mainCanvasSize,
    mousePos,
    mouseWasPressed,
    rgb,
    setCameraPos,
    setCameraScale,
    setCanvasClearColor,
    vec2,
} from 'littlejsengine';

const WORLD_LIMIT = 9;
const MOVE_SPEED = 0.14;
const CAMERA_SCALE = 48;
const HEIGHT_FACTOR = 1.18;
const SHADOW_SHIFT = vec2(0.18, -0.22);

let sceneTime = 0;
let hoveredEntity;
let selectedEntity;

const player = createWisp({
    id: 'you',
    name: 'YOU',
    x: 0,
    depth: -4.8,
    size: 1.02,
    shape: 'round',
    auraColor: [0.92, 0.78, 0.38],
    bodyColor: [1, 0.92, 0.68],
    coreColor: [1, 1, 0.97],
    trailColor: [0.98, 0.9, 0.7],
    trailCount: 3,
    orbitals: 0,
    hover: 1.15,
    driftSpeed: 0.9,
    driftPhase: 0.3,
    profile: 'warm core · blank beginning',
    player: true,
});

const entities = [
    player,
    createWisp({
        id: 'luma',
        name: 'LUMA',
        x: -2.2,
        depth: -1.7,
        size: 0.9,
        shape: 'round',
        auraColor: [0.98, 0.84, 0.42],
        bodyColor: [1, 0.95, 0.76],
        coreColor: [1, 1, 0.98],
        trailColor: [0.98, 0.88, 0.66],
        trailCount: 4,
        orbitals: 1,
        orbitalColor: [0.99, 0.92, 0.68],
        orbitRadius: 0.58,
        hover: 1.24,
        driftSpeed: 1.2,
        driftPhase: 0.8,
        profile: 'growing light · little seed',
    }),
    createWisp({
        id: 'moss',
        name: 'MOSS',
        x: -1.05,
        depth: -0.85,
        size: 0.96,
        shape: 'teardrop',
        auraColor: [0.46, 0.68, 0.42],
        bodyColor: [0.8, 0.95, 0.78],
        coreColor: [0.96, 1, 0.92],
        trailColor: [0.68, 0.84, 0.66],
        trailCount: 5,
        orbitals: 0,
        hover: 1.02,
        driftSpeed: 0.6,
        driftPhase: 1.9,
        markings: 'freckles',
        adornment: 'leaf',
        profile: 'moss glow · leaf crown',
    }),
    createWisp({
        id: 'ember',
        name: 'EMBER',
        x: 0.45,
        depth: -0.55,
        size: 1.0,
        shape: 'comet',
        auraColor: [0.94, 0.48, 0.18],
        bodyColor: [1, 0.76, 0.46],
        coreColor: [1, 0.98, 0.85],
        trailColor: [1, 0.58, 0.24],
        trailCount: 7,
        orbitals: 2,
        orbitalColor: [1, 0.7, 0.36],
        orbitRadius: 0.5,
        hover: 1.18,
        driftSpeed: 1.75,
        driftPhase: 2.6,
        markings: 'ring',
        profile: 'ember trail · restless flare',
    }),
    createWisp({
        id: 'elder',
        name: 'ELDER',
        x: 1.95,
        depth: -1.0,
        size: 1.34,
        shape: 'elder',
        auraColor: [0.94, 0.82, 0.52],
        bodyColor: [0.98, 0.95, 0.86],
        coreColor: [1, 1, 0.98],
        trailColor: [0.94, 0.88, 0.72],
        trailCount: 4,
        orbitals: 3,
        orbitalColor: [0.97, 0.9, 0.7],
        orbitRadius: 0.9,
        hover: 1.3,
        driftSpeed: 0.5,
        driftPhase: 0.4,
        adornment: 'crown',
        profile: 'elder bloom · three orbiting seeds',
    }),
    createWisp({
        id: 'veil',
        name: 'VEIL',
        x: -1.9,
        depth: 0.8,
        size: 1.02,
        shape: 'split',
        auraColor: [0.54, 0.68, 0.88],
        bodyColor: [0.84, 0.92, 1],
        coreColor: [0.2, 0.24, 0.3],
        trailColor: [0.68, 0.78, 0.92],
        trailCount: 6,
        orbitals: 1,
        orbitalColor: [0.78, 0.84, 0.98],
        orbitRadius: 0.72,
        hover: 1.08,
        driftSpeed: 0.75,
        driftPhase: 2.25,
        markings: 'eclipse',
        profile: 'mist wake · shadowed center',
    }),
    createWisp({
        id: 'gilt',
        name: 'GILT',
        x: -0.25,
        depth: 1.05,
        size: 1.08,
        shape: 'tall',
        auraColor: [0.95, 0.72, 0.24],
        bodyColor: [1, 0.9, 0.58],
        coreColor: [1, 0.98, 0.92],
        trailColor: [0.98, 0.8, 0.36],
        trailCount: 3,
        orbitals: 2,
        orbitalColor: [1, 0.9, 0.68],
        orbitRadius: 0.66,
        hover: 1.36,
        driftSpeed: 0.95,
        driftPhase: 1.35,
        markings: 'ring',
        adornment: 'halo',
        profile: 'ceremonial gold · halo ring',
    }),
    createWisp({
        id: 'rill',
        name: 'RILL',
        x: 1.25,
        depth: 0.45,
        size: 0.94,
        shape: 'tall',
        auraColor: [0.38, 0.76, 0.92],
        bodyColor: [0.78, 0.94, 1],
        coreColor: [0.95, 1, 1],
        trailColor: [0.56, 0.86, 0.98],
        trailCount: 8,
        orbitals: 0,
        hover: 1.42,
        driftSpeed: 1.1,
        driftPhase: 0.1,
        profile: 'river-light · long wake',
    }),
    createWisp({
        id: 'ash',
        name: 'ASH',
        x: -0.95,
        depth: 2.0,
        size: 0.88,
        shape: 'flat',
        auraColor: [0.62, 0.62, 0.64],
        bodyColor: [0.9, 0.92, 0.96],
        coreColor: [1, 1, 1],
        trailColor: [0.72, 0.74, 0.8],
        trailCount: 2,
        orbitals: 0,
        hover: 0.96,
        driftSpeed: 0.45,
        driftPhase: 2.95,
        markings: 'freckles',
        profile: 'ash freckles · hush',
    }),
    createWisp({
        id: 'pearl',
        name: 'PEARL',
        x: 0.72,
        depth: 2.15,
        size: 0.96,
        shape: 'round',
        auraColor: [0.94, 0.82, 0.9],
        bodyColor: [1, 0.95, 0.98],
        coreColor: [1, 1, 1],
        trailColor: [0.96, 0.88, 0.94],
        trailCount: 4,
        orbitals: 1,
        orbitalColor: [0.99, 0.92, 0.98],
        orbitRadius: 0.42,
        hover: 1.08,
        driftSpeed: 0.55,
        driftPhase: 1.8,
        profile: 'pearl glow · calm drift',
    }),
    createWisp({
        id: 'thorn',
        name: 'THORN',
        x: 2.1,
        depth: 1.55,
        size: 0.98,
        shape: 'split',
        auraColor: [0.54, 0.74, 0.34],
        bodyColor: [0.9, 1, 0.78],
        coreColor: [0.98, 1, 0.92],
        trailColor: [0.68, 0.88, 0.52],
        trailCount: 5,
        orbitals: 1,
        orbitalColor: [0.82, 0.98, 0.66],
        orbitRadius: 0.62,
        hover: 1.22,
        driftSpeed: 1.0,
        driftPhase: 2.1,
        adornment: 'twig',
        profile: 'twig crown · sharp orbit',
    }),
    createWisp({
        id: 'echo',
        name: 'ECHO',
        x: 0.05,
        depth: 3.2,
        size: 1.06,
        shape: 'comet',
        auraColor: [0.42, 0.42, 0.56],
        bodyColor: [0.84, 0.86, 0.98],
        coreColor: [0.08, 0.08, 0.12],
        trailColor: [0.58, 0.6, 0.78],
        trailCount: 6,
        orbitals: 2,
        orbitalColor: [0.68, 0.72, 0.88],
        orbitRadius: 0.56,
        hover: 1.04,
        driftSpeed: 0.7,
        driftPhase: 1.15,
        markings: 'eclipse',
        profile: 'hollow core · quiet orbit',
    }),
    { id: 'tree', name: 'TREE', type: 'tree', x: -4.9, depth: 3.2, size: 1.05 },
    { id: 'monolith', name: 'STONE', type: 'monolith', x: -3.2, depth: 1.65, size: 1.0 },
    { id: 'lantern', name: 'LANTERN', type: 'lantern', x: 3.4, depth: 2.9, size: 1.0 },
    { id: 'rock', name: 'ROCK', type: 'rock', x: 4.45, depth: -0.25, size: 1.0 },
];

function gameInit() {
    setCanvasClearColor(rgb(0.018, 0.02, 0.024));
    setCameraPos(vec2(0, 0));
    setCameraScale(CAMERA_SCALE);
    selectedEntity = entities[1];
}

function gameUpdate() {
    sceneTime += 1 / 60;

    let dx = 0;
    let dd = 0;

    if (keyIsDown('KeyA')) dx -= 1;
    if (keyIsDown('KeyD')) dx += 1;
    if (keyIsDown('KeyW')) dd += 1;
    if (keyIsDown('KeyS')) dd -= 1;

    if (dx || dd) {
        const length = Math.hypot(dx, dd) || 1;
        player.x = clamp(player.x + (dx / length) * MOVE_SPEED, -WORLD_LIMIT, WORLD_LIMIT);
        player.depth = clamp(player.depth + (dd / length) * MOVE_SPEED, -WORLD_LIMIT, WORLD_LIMIT);
    }

    hoveredEntity = pickEntity(mousePos);

    if (mouseWasPressed(0) && hoveredEntity)
        selectedEntity = hoveredEntity;
}

function gameUpdatePost() {
    setCameraPos(vec2(0, 0));
    setCameraScale(CAMERA_SCALE);
}

function gameRender() {
    drawGround();

    const sorted = [...entities].sort((a, b) => b.depth - a.depth || a.x - b.x || a.id.localeCompare(b.id));
    for (const entity of sorted)
        drawEntity(entity);
}

function gameRenderPost() {
    const titleY = 34;

    drawTextScreen('PRESENCE 002  ·  THE GATHERING', vec2(mainCanvasSize.x / 2, titleY), 22, rgb(0.95, 0.91, 0.78));
    drawTextScreen('Diorama overworld locked in · one species, many possible selves', vec2(mainCanvasSize.x / 2, titleY + 24), 15, rgb(0.66, 0.64, 0.6));

    drawTextScreen(
        'WASD MOVE  ·  HOVER + CLICK TO INSPECT  ·  CUSTOMIZATION STUDY: SIZE · SHAPE · GLOW · TRAIL · ORBITALS · ADORNMENT',
        vec2(mainCanvasSize.x / 2, mainCanvasSize.y - 28),
        13,
        rgb(0.58, 0.58, 0.56),
    );

    if (selectedEntity?.type === 'wisp') {
        drawTextScreen(
            `${selectedEntity.name}  ·  ${selectedEntity.profile.toUpperCase()}`,
            vec2(mainCanvasSize.x / 2, mainCanvasSize.y - 50),
            14,
            rgb(0.92, 0.8, 0.48),
        );
    }
    else if (selectedEntity) {
        drawTextScreen(
            `SELECTED: ${selectedEntity.name}`,
            vec2(mainCanvasSize.x / 2, mainCanvasSize.y - 50),
            14,
            rgb(0.82, 0.75, 0.68),
        );
    }
}

function drawGround() {
    const horizonA = project(-WORLD_LIMIT, WORLD_LIMIT);
    const horizonB = project(WORLD_LIMIT, WORLD_LIMIT);
    drawLine(horizonA.pos, horizonB.pos, 0.12, rgb(0.75, 0.62, 0.3, 0.12));

    const clearing = project(0, 0).pos;
    drawCircle(clearing, 4.6, rgb(0.26, 0.24, 0.18, 0.08));
    drawCircle(clearing, 3.2, rgb(0.9, 0.74, 0.34, 0.04));

    for (let depth = -WORLD_LIMIT; depth <= WORLD_LIMIT; depth += 2) {
        const alpha = depth === 0 ? 0.08 : 0.04;
        drawProjectedLine(-WORLD_LIMIT, depth, WORLD_LIMIT, depth, rgb(0.28, 0.28, 0.26, alpha));
    }

    for (let x = -WORLD_LIMIT; x <= WORLD_LIMIT; x += 2) {
        for (let depth = -WORLD_LIMIT; depth <= WORLD_LIMIT; depth += 2) {
            const p = project(x, depth).pos;
            const warmth = 0.05 + Math.max(0, 0.1 - Math.abs(x) * 0.007 - Math.abs(depth) * 0.006);
            drawCircle(p, 0.05, rgb(0.86, 0.78, 0.56, warmth));
        }
    }

    drawPath(-3.8, -1.2, -0.8, 0.1, 10);
    drawPath(-0.2, -0.2, 2.7, 2.2, 9);
}

function drawPath(x1, d1, x2, d2, steps) {
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const depth = d1 + (d2 - d1) * t;
        const p = project(x, depth).pos;
        const radius = 0.1 + (1 - Math.abs(t - 0.5) * 2) * 0.05;
        drawCircle(p, radius, rgb(0.34, 0.3, 0.22, 0.12));
    }
}

function drawProjectedLine(x1, depth1, x2, depth2, colorValue) {
    const a = project(x1, depth1).pos;
    const b = project(x2, depth2).pos;
    drawLine(a, b, 0.022, colorValue);
}

function drawEntity(entity) {
    const data = getEntityVisuals(entity);
    const isHovered = hoveredEntity === entity;
    const isSelected = selectedEntity === entity;

    if (entity.type === 'wisp')
        drawWisp(entity, data, isHovered, isSelected);
    else if (entity.type === 'tree')
        drawTree(entity, data, isHovered, isSelected);
    else if (entity.type === 'monolith')
        drawMonolith(entity, data, isHovered, isSelected);
    else if (entity.type === 'lantern')
        drawLantern(entity, data, isHovered, isSelected);
    else
        drawRock(entity, data, isHovered, isSelected);

    if (isHovered) {
        drawText(
            entity.name,
            data.body.add(vec2(0, 1.02 * data.scale * entity.size)),
            0.4,
            rgb(1, 0.94, 0.72),
        );
    }
}

function drawWisp(entity, data, isHovered, isSelected) {
    const bob = Math.sin(sceneTime * entity.driftSpeed + entity.driftPhase) * 0.12 * data.scale;
    const sway = Math.cos(sceneTime * entity.driftSpeed * 0.75 + entity.driftPhase) * 0.08 * data.scale;
    const p = data.body.add(vec2(sway, bob));
    const s = data.scale * entity.size;

    drawShadowBlob(data.shadowCenter, 0.34 * s, 3, rgb(0, 0, 0, 0.14));
    drawGroundMarker(data.anchor, 0.22 * s, rgb(0.94, 0.88, 0.62, 0.05));
    drawTrail(entity, data.anchor, p, s);
    drawAura(entity, p, s);
    drawBodyShape(entity, p, s);
    drawMarkings(entity, p, s);
    drawOrbitals(entity, p, s);
    drawAdornment(entity, p, s);

    if (isSelected)
        drawCircle(p, 1.14 * s, rgb(0, 0, 0, 0), 0.055, rgb(0.95, 0.72, 0.28, 0.85));
    else if (isHovered)
        drawCircle(p, 1.05 * s, rgb(0, 0, 0, 0), 0.04, rgb(1, 0.9, 0.62, 0.62));
}

function drawAura(entity, p, s) {
    drawCircle(p, 1.7 * s, color(entity.auraColor, 0.05));
    drawCircle(p, 1.05 * s, color(entity.auraColor, 0.11));
    drawCircle(p, 0.52 * s, color(entity.bodyColor, 1));
    drawCircle(p, 0.16 * s, color(entity.coreColor, 1));
}

function drawBodyShape(entity, p, s) {
    switch (entity.shape) {
        case 'tall':
            drawCircle(p.add(vec2(0, 0.22 * s)), 0.42 * s, color(entity.bodyColor, 0.92));
            drawCircle(p.add(vec2(0, -0.24 * s)), 0.28 * s, color(entity.bodyColor, 0.82));
            break;
        case 'flat':
            drawCircle(p, 0.4 * s, color(entity.bodyColor, 0.86));
            drawCircle(p.add(vec2(-0.26 * s, 0)), 0.23 * s, color(entity.bodyColor, 0.7));
            drawCircle(p.add(vec2(0.26 * s, 0)), 0.23 * s, color(entity.bodyColor, 0.7));
            break;
        case 'teardrop':
            drawCircle(p.add(vec2(0, 0.16 * s)), 0.42 * s, color(entity.bodyColor, 0.9));
            drawCircle(p.add(vec2(0, -0.24 * s)), 0.21 * s, color(entity.bodyColor, 0.75));
            break;
        case 'comet':
            drawCircle(p.add(vec2(0.12 * s, 0.04 * s)), 0.4 * s, color(entity.bodyColor, 0.88));
            drawCircle(p.add(vec2(-0.2 * s, -0.08 * s)), 0.22 * s, color(entity.bodyColor, 0.66));
            break;
        case 'split':
            drawCircle(p.add(vec2(-0.18 * s, 0)), 0.28 * s, color(entity.bodyColor, 0.84));
            drawCircle(p.add(vec2(0.18 * s, 0.02 * s)), 0.31 * s, color(entity.bodyColor, 0.88));
            break;
        case 'elder':
            drawCircle(p, 0.52 * s, color(entity.bodyColor, 0.94));
            drawCircle(p.add(vec2(-0.22 * s, 0.2 * s)), 0.24 * s, color(entity.bodyColor, 0.7));
            drawCircle(p.add(vec2(0.24 * s, 0.18 * s)), 0.24 * s, color(entity.bodyColor, 0.7));
            drawCircle(p.add(vec2(0, -0.26 * s)), 0.2 * s, color(entity.bodyColor, 0.66));
            break;
        default:
            drawCircle(p, 0.42 * s, color(entity.bodyColor, 0.9));
            break;
    }

    drawCircle(p, 0.14 * s, color(entity.coreColor, 1));
    drawCircle(p.add(vec2(-0.16 * s, 0.1 * s)), 0.09 * s, rgb(1, 1, 1, 0.22));
}

function drawMarkings(entity, p, s) {
    if (entity.markings === 'freckles') {
        drawCircle(p.add(vec2(-0.15 * s, 0.02 * s)), 0.05 * s, rgb(0.26, 0.24, 0.22, 0.24));
        drawCircle(p.add(vec2(0.08 * s, -0.14 * s)), 0.04 * s, rgb(0.26, 0.24, 0.22, 0.22));
        drawCircle(p.add(vec2(0.18 * s, 0.09 * s)), 0.03 * s, rgb(0.3, 0.28, 0.24, 0.18));
    }
    else if (entity.markings === 'ring') {
        drawCircle(p, 0.3 * s, rgb(0, 0, 0, 0), 0.03 * s, color(entity.auraColor, 0.42));
    }
    else if (entity.markings === 'eclipse') {
        drawCircle(p.add(vec2(0.08 * s, 0)), 0.18 * s, rgb(0.06, 0.06, 0.08, 0.55));
    }
}

function drawOrbitals(entity, p, s) {
    if (!entity.orbitals)
        return;

    for (let i = 0; i < entity.orbitals; i++) {
        const angle = sceneTime * 0.9 + entity.driftPhase + (Math.PI * 2 * i) / entity.orbitals;
        const radius = entity.orbitRadius * s;
        const orbitalPos = p.add(vec2(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5 + 0.18 * s));
        drawCircle(orbitalPos, 0.09 * s, color(entity.orbitalColor || entity.coreColor, 0.92));
        drawCircle(orbitalPos, 0.04 * s, rgb(1, 1, 0.98, 0.9));
    }
}

function drawAdornment(entity, p, s) {
    if (entity.adornment === 'leaf') {
        drawLine(p.add(vec2(-0.08 * s, 0.42 * s)), p.add(vec2(0, 0.66 * s)), 0.03 * s, rgb(0.4, 0.6, 0.34, 0.85));
        drawCircle(p.add(vec2(-0.12 * s, 0.58 * s)), 0.08 * s, rgb(0.46, 0.72, 0.4, 0.8));
        drawCircle(p.add(vec2(0.08 * s, 0.62 * s)), 0.07 * s, rgb(0.38, 0.62, 0.34, 0.74));
    }
    else if (entity.adornment === 'twig') {
        drawLine(p.add(vec2(0, 0.42 * s)), p.add(vec2(0, 0.72 * s)), 0.025 * s, rgb(0.42, 0.34, 0.22, 0.85));
        drawLine(p.add(vec2(0, 0.6 * s)), p.add(vec2(-0.18 * s, 0.72 * s)), 0.02 * s, rgb(0.42, 0.34, 0.22, 0.8));
        drawLine(p.add(vec2(0, 0.6 * s)), p.add(vec2(0.18 * s, 0.74 * s)), 0.02 * s, rgb(0.42, 0.34, 0.22, 0.8));
    }
    else if (entity.adornment === 'crown') {
        const top = p.add(vec2(0, 0.72 * s));
        drawLine(top.add(vec2(-0.22 * s, -0.04 * s)), top.add(vec2(0.22 * s, -0.04 * s)), 0.03 * s, rgb(0.84, 0.76, 0.48, 0.85));
        drawLine(top.add(vec2(-0.18 * s, -0.02 * s)), top.add(vec2(-0.08 * s, 0.18 * s)), 0.025 * s, rgb(0.84, 0.76, 0.48, 0.82));
        drawLine(top.add(vec2(0, -0.02 * s)), top.add(vec2(0, 0.24 * s)), 0.025 * s, rgb(0.84, 0.76, 0.48, 0.82));
        drawLine(top.add(vec2(0.18 * s, -0.02 * s)), top.add(vec2(0.08 * s, 0.18 * s)), 0.025 * s, rgb(0.84, 0.76, 0.48, 0.82));
    }
    else if (entity.adornment === 'halo') {
        drawCircle(p.add(vec2(0, 0.68 * s)), 0.24 * s, rgb(0, 0, 0, 0), 0.03 * s, color(entity.auraColor, 0.65));
    }
}

function drawTrail(entity, anchor, body, s) {
    const direction = body.subtract(anchor);
    const distance = Math.max(1, entity.trailCount);

    for (let i = 1; i <= distance; i++) {
        const t = i / (distance + 1);
        const p = body.subtract(direction.scale(t * 0.92));
        const radius = (0.14 - t * 0.08) * s;
        const alpha = 0.26 * (1 - t);
        drawCircle(p.add(vec2(-0.06 * s * t, 0.02 * s * Math.sin(sceneTime * entity.driftSpeed + t * 6))), radius, color(entity.trailColor, alpha));
    }
}

function drawTree(entity, data, isHovered, isSelected) {
    const s = data.scale * entity.size;

    drawShadowBlob(data.shadowCenter, 0.9 * s, 7, rgb(0, 0, 0, 0.17));
    drawGroundMarker(data.anchor, 0.42 * s, rgb(0.72, 0.6, 0.36, 0.11));

    const trunkMid = data.anchor.add(vec2(0, data.height * 0.48));
    drawLine(data.anchor, data.body.add(vec2(0, -0.5 * s)), 0.22 * s, rgb(0.23, 0.18, 0.13));
    drawRect(trunkMid, vec2(0.44 * s, data.height * 0.95), rgb(0.22, 0.17, 0.12));

    drawCircle(data.body, 1.9 * s, rgb(0.16, 0.22, 0.17));
    drawCircle(data.body.add(vec2(-0.74 * s, -0.12 * s)), 1.28 * s, rgb(0.13, 0.19, 0.15));
    drawCircle(data.body.add(vec2(0.82 * s, 0.02 * s)), 1.22 * s, rgb(0.14, 0.2, 0.15));
    drawCircle(data.body.add(vec2(0.1 * s, 0.7 * s)), 1.25 * s, rgb(0.17, 0.24, 0.18));

    drawSelectionHalo(data.anchor, 1.02 * s, isHovered, isSelected);
}

function drawRock(entity, data, isHovered, isSelected) {
    const s = data.scale * entity.size;
    const p = data.body;

    drawShadowBlob(data.shadowCenter, 0.62 * s, 5, rgb(0, 0, 0, 0.14));
    drawGroundMarker(data.anchor, 0.32 * s, rgb(0.86, 0.82, 0.76, 0.08));

    drawCircle(p, 1.08 * s, rgb(0.24, 0.25, 0.24));
    drawCircle(p.add(vec2(-0.34 * s, 0.18 * s)), 0.58 * s, rgb(0.33, 0.33, 0.31));
    drawCircle(p.add(vec2(0.38 * s, -0.1 * s)), 0.42 * s, rgb(0.2, 0.21, 0.21));
    drawCircle(p.add(vec2(-0.18 * s, 0.44 * s)), 0.18 * s, rgb(0.44, 0.44, 0.39));

    drawSelectionHalo(data.anchor, 0.92 * s, isHovered, isSelected);
}

function drawMonolith(entity, data, isHovered, isSelected) {
    const s = data.scale * entity.size;
    const shaftHeight = data.height * 0.82;
    const shaftMid = data.anchor.add(vec2(0, shaftHeight * 0.5));
    const capCenter = data.anchor.add(vec2(0, shaftHeight));

    drawShadowBlob(data.shadowCenter, 0.62 * s, 5, rgb(0, 0, 0, 0.16));
    drawGroundMarker(data.anchor, 0.34 * s, rgb(0.86, 0.82, 0.76, 0.08));

    drawRect(shaftMid, vec2(0.88 * s, shaftHeight), rgb(0.2, 0.22, 0.25));
    drawRect(capCenter, vec2(1.06 * s, 0.26 * s), rgb(0.32, 0.34, 0.38));
    drawCircle(data.body.add(vec2(0, 0.16 * s)), 0.48 * s, rgb(0.88, 0.8, 0.52, 0.08));

    drawSelectionHalo(data.anchor, 0.94 * s, isHovered, isSelected);
}

function drawLantern(entity, data, isHovered, isSelected) {
    const s = data.scale * entity.size;
    const poleTop = data.anchor.add(vec2(0, data.height));
    const lamp = poleTop.add(vec2(0, 0.22 * s));

    drawShadowBlob(data.shadowCenter, 0.52 * s, 5, rgb(0, 0, 0, 0.15));
    drawGroundMarker(data.anchor, 0.28 * s, rgb(0.9, 0.84, 0.6, 0.08));

    drawLine(data.anchor, poleTop, 0.07 * s, rgb(0.38, 0.32, 0.2));
    drawLine(poleTop.add(vec2(-0.22 * s, 0.08 * s)), poleTop.add(vec2(0.22 * s, 0.08 * s)), 0.05 * s, rgb(0.44, 0.37, 0.22));
    drawRect(lamp, vec2(0.42 * s, 0.54 * s), rgb(0.28, 0.24, 0.16));
    drawCircle(lamp, 0.78 * s, rgb(0.92, 0.78, 0.38, 0.08));
    drawCircle(lamp, 0.48 * s, rgb(0.96, 0.84, 0.44, 0.14));
    drawCircle(lamp, 0.2 * s, rgb(1, 0.96, 0.84));

    drawSelectionHalo(data.anchor, 0.82 * s, isHovered, isSelected);
}

function drawSelectionHalo(anchor, radius, isHovered, isSelected) {
    if (isSelected)
        drawCircle(anchor, radius, rgb(0, 0, 0, 0), 0.055, rgb(0.95, 0.72, 0.28, 0.85));
    else if (isHovered)
        drawCircle(anchor, radius, rgb(0, 0, 0, 0), 0.04, rgb(1, 0.9, 0.62, 0.55));
}

function drawGroundMarker(center, radius, colorValue) {
    drawCircle(center, radius, colorValue);
}

function drawShadowBlob(center, radius, count, colorValue) {
    for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const offset = (t - 0.5) * radius * 1.5;
        drawCircle(center.add(vec2(offset, 0)), radius * (0.58 + (1 - Math.abs(t - 0.5) * 2) * 0.24), colorValue);
    }
}

function getEntityVisuals(entity) {
    const height = getEntityHeight(entity);
    const raised = getRaisedPoint(entity.x, entity.depth, height, entity.size);
    const shadowVector = SHADOW_SHIFT.scale(raised.scale * 1.8);

    return {
        ...raised,
        shadowCenter: raised.anchor.add(shadowVector),
    };
}

function getRaisedPoint(x, depth, height, size = 1) {
    const projected = project(x, depth);
    const lift = height * projected.scale * HEIGHT_FACTOR * size;

    return {
        anchor: projected.pos,
        body: projected.pos.add(vec2(0, lift)),
        height: lift,
        scale: projected.scale,
    };
}

function getEntityHeight(entity) {
    switch (entity.type) {
        case 'tree':
            return 3.2;
        case 'monolith':
            return 2.1;
        case 'lantern':
            return 2.6;
        case 'rock':
            return 0.56;
        default:
            return entity.hover || 1.18;
    }
}

function pickEntity(point) {
    const candidates = [];

    for (const entity of entities) {
        const data = getEntityVisuals(entity);
        const radius = pickRadius(entity, data.scale);
        const bodyDistance = point.distanceSquared(data.body);
        const anchorDistance = point.distanceSquared(data.anchor);
        const distance = Math.min(bodyDistance, anchorDistance * 1.1);

        if (distance <= radius * radius)
            candidates.push({ entity, distance });
    }

    candidates.sort((a, b) => {
        if (a.entity.depth !== b.entity.depth)
            return a.entity.depth - b.entity.depth;
        return a.distance - b.distance;
    });

    return candidates[0]?.entity;
}

function pickRadius(entity, projectedScale) {
    if (entity.type === 'tree') return 1.72 * projectedScale;
    if (entity.type === 'monolith') return 1.08 * projectedScale;
    if (entity.type === 'lantern') return 0.96 * projectedScale;
    if (entity.type === 'rock') return 0.94 * projectedScale;
    return 0.94 * projectedScale * entity.size;
}

function project(x, depth) {
    const depth01 = (depth + WORLD_LIMIT) / (WORLD_LIMIT * 2);
    const scale = 1.28 - depth01 * 0.56;
    return {
        pos: vec2(x * (0.96 - depth01 * 0.16), depth * 0.62),
        scale,
    };
}

function createWisp(config) {
    return {
        type: 'wisp',
        orbitRadius: 0.56,
        orbitalColor: config.coreColor,
        trailCount: 4,
        hover: 1.18,
        driftSpeed: 1,
        driftPhase: 0,
        markings: 'none',
        adornment: 'none',
        orbitals: 0,
        ...config,
    };
}

function color(channels, alphaScale = 1) {
    return rgb(channels[0], channels[1], channels[2], (channels[3] ?? 1) * alphaScale);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

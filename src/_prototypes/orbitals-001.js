import {
    engineInit,
    drawCircle,
    drawLine,
    drawRect,
    drawTextScreen,
    keyWasPressed,
    mainCanvasSize,
    rgb,
    setCameraPos,
    setCameraScale,
    setCanvasClearColor,
    vec2,
} from 'littlejsengine';

const WORLD_LIMIT = 9;
const CAMERA_SCALE = 72;
const HEIGHT_FACTOR = 1.18;
const SHADOW_SHIFT = vec2(0.18, -0.22);

let sceneTime = 0;

const orbitStyles = [
    {
        name: 'SEED',
        glow: [0.98, 0.86, 0.46],
        body: [1, 0.94, 0.72],
        core: [1, 1, 0.98],
        kind: 'seed',
    },
    {
        name: 'PEARL',
        glow: [0.94, 0.84, 0.92],
        body: [1, 0.95, 0.98],
        core: [1, 1, 1],
        kind: 'pearl',
    },
    {
        name: 'EMBER',
        glow: [0.98, 0.58, 0.22],
        body: [1, 0.78, 0.46],
        core: [1, 0.98, 0.9],
        kind: 'ember',
    },
    {
        name: 'SHARD',
        glow: [0.52, 0.78, 0.98],
        body: [0.84, 0.95, 1],
        core: [1, 1, 1],
        kind: 'shard',
    },
    {
        name: 'SHADOW',
        glow: [0.66, 0.7, 0.84],
        body: [0.84, 0.88, 0.98],
        core: [0.08, 0.08, 0.12],
        kind: 'shadow',
    },
];

const orbitalState = {
    count: 3,
    size: 0.12,
    speed: 1.1,
    orientationDeg: 18,
    radius: 0.88,
    flatten: 0.42,
    wobble: 0.06,
    styleIndex: 0,
};

const focusWisp = {
    x: 0,
    depth: -3.2,
    size: 2.05,
    hover: 1.36,
    auraColor: [0.96, 0.82, 0.4],
    bodyColor: [1, 0.94, 0.72],
    coreColor: [1, 1, 0.98],
};

const backgroundEntities = [
    { id: 'tree-left', type: 'tree', x: -5.25, depth: 4.6, size: 1.05 },
    { id: 'shrine', type: 'shrine', x: -0.4, depth: 4.9, size: 1.1 },
    { id: 'tree-right', type: 'tree', x: 5.1, depth: 4.7, size: 0.98 },
    { id: 'lantern-left', type: 'lantern', x: -3.2, depth: 2.3, size: 1.0 },
    { id: 'lantern-right', type: 'lantern', x: 3.35, depth: 2.15, size: 1.0 },
    { id: 'stone-left', type: 'rock', x: -4.2, depth: 1.4, size: 0.9 },
    { id: 'stone-right', type: 'rock', x: 4.45, depth: 1.2, size: 1.05 },
];

function gameInit() {
    setCanvasClearColor(rgb(0.017, 0.019, 0.023));
    setCameraPos(vec2(0, 0));
    setCameraScale(CAMERA_SCALE);
}

function gameUpdate() {
    sceneTime += 1 / 60;

    if (keyWasPressed('Digit1')) orbitalState.styleIndex = 0;
    if (keyWasPressed('Digit2')) orbitalState.styleIndex = 1;
    if (keyWasPressed('Digit3')) orbitalState.styleIndex = 2;
    if (keyWasPressed('Digit4')) orbitalState.styleIndex = 3;
    if (keyWasPressed('Digit5')) orbitalState.styleIndex = 4;

    if (keyWasPressed('KeyQ')) orbitalState.count = clamp(orbitalState.count + 1, 0, 8);
    if (keyWasPressed('KeyA')) orbitalState.count = clamp(orbitalState.count - 1, 0, 8);

    if (keyWasPressed('KeyW')) orbitalState.size = clamp(orbitalState.size + 0.01, 0.04, 0.26);
    if (keyWasPressed('KeyS')) orbitalState.size = clamp(orbitalState.size - 0.01, 0.04, 0.26);

    if (keyWasPressed('KeyE')) orbitalState.speed = clamp(orbitalState.speed + 0.12, 0, 3);
    if (keyWasPressed('KeyD')) orbitalState.speed = clamp(orbitalState.speed - 0.12, 0, 3);

    if (keyWasPressed('KeyR')) orbitalState.orientationDeg = wrapDeg(orbitalState.orientationDeg + 15);
    if (keyWasPressed('KeyF')) orbitalState.orientationDeg = wrapDeg(orbitalState.orientationDeg - 15);

    if (keyWasPressed('KeyT')) orbitalState.radius = clamp(orbitalState.radius + 0.06, 0.24, 1.6);
    if (keyWasPressed('KeyG')) orbitalState.radius = clamp(orbitalState.radius - 0.06, 0.24, 1.6);

    if (keyWasPressed('KeyY')) orbitalState.flatten = clamp(orbitalState.flatten + 0.05, 0.12, 1.0);
    if (keyWasPressed('KeyH')) orbitalState.flatten = clamp(orbitalState.flatten - 0.05, 0.12, 1.0);

    if (keyWasPressed('KeyU')) orbitalState.wobble = clamp(orbitalState.wobble + 0.01, 0, 0.2);
    if (keyWasPressed('KeyJ')) orbitalState.wobble = clamp(orbitalState.wobble - 0.01, 0, 0.2);
}

function gameUpdatePost() {
    setCameraPos(vec2(0, 0));
    setCameraScale(CAMERA_SCALE);
}

function gameRender() {
    drawBackground();

    const sorted = [...backgroundEntities].sort((a, b) => b.depth - a.depth || a.x - b.x || a.id.localeCompare(b.id));
    for (const entity of sorted)
        drawScenery(entity);

    drawFocusWisp();
}

function gameRenderPost() {
    const style = orbitStyles[orbitalState.styleIndex];
    const panelX = 34;
    const panelY = 34;
    const line = 18;

    drawTextScreen('ORBITALS 001', vec2(mainCanvasSize.x / 2, 34), 24, rgb(0.96, 0.92, 0.78));
    drawTextScreen('Customization-view prototype · zoomed hero wisp + famous-place background (TBD)', vec2(mainCanvasSize.x / 2, 58), 14, rgb(0.66, 0.64, 0.6));

    drawTextScreen('STYLE', vec2(panelX, panelY), 14, rgb(0.9, 0.82, 0.56));
    drawTextScreen(`1-5   ${style.name}`, vec2(panelX, panelY + line), 14, rgb(0.88, 0.88, 0.86));

    drawTextScreen(`Q / A   COUNT         ${orbitalState.count}`, vec2(panelX, panelY + line * 3), 13, rgb(0.82, 0.82, 0.8));
    drawTextScreen(`W / S   SIZE          ${format(orbitalState.size)}`, vec2(panelX, panelY + line * 4), 13, rgb(0.82, 0.82, 0.8));
    drawTextScreen(`E / D   SPEED         ${format(orbitalState.speed)}`, vec2(panelX, panelY + line * 5), 13, rgb(0.82, 0.82, 0.8));
    drawTextScreen(`R / F   ORIENTATION   ${Math.round(orbitalState.orientationDeg)}°`, vec2(panelX, panelY + line * 6), 13, rgb(0.82, 0.82, 0.8));
    drawTextScreen(`T / G   RADIUS        ${format(orbitalState.radius)}`, vec2(panelX, panelY + line * 7), 13, rgb(0.82, 0.82, 0.8));
    drawTextScreen(`Y / H   FLATTEN       ${format(orbitalState.flatten)}`, vec2(panelX, panelY + line * 8), 13, rgb(0.82, 0.82, 0.8));
    drawTextScreen(`U / J   WOBBLE        ${format(orbitalState.wobble)}`, vec2(panelX, panelY + line * 9), 13, rgb(0.82, 0.82, 0.8));

    drawTextScreen('KEY IDEAS', vec2(panelX, mainCanvasSize.y - 122), 14, rgb(0.9, 0.82, 0.56));
    drawTextScreen('• quantity, size, speed, orientation', vec2(panelX, mainCanvasSize.y - 104), 13, rgb(0.74, 0.74, 0.72));
    drawTextScreen('• radius / distance from the core', vec2(panelX, mainCanvasSize.y - 88), 13, rgb(0.74, 0.74, 0.72));
    drawTextScreen('• flatten / ellipse amount', vec2(panelX, mainCanvasSize.y - 72), 13, rgb(0.74, 0.74, 0.72));
    drawTextScreen('• front/back layering around the body', vec2(panelX, mainCanvasSize.y - 56), 13, rgb(0.74, 0.74, 0.72));
    drawTextScreen('• wobble / living motion', vec2(panelX, mainCanvasSize.y - 40), 13, rgb(0.74, 0.74, 0.72));

    drawTextScreen('Orbitals should feel like companions, memories, relics, seeds, or tiny satellites — not just particles.', vec2(mainCanvasSize.x / 2, mainCanvasSize.y - 26), 13, rgb(0.58, 0.58, 0.56));
}

function drawBackground() {
    const horizonA = project(-WORLD_LIMIT, WORLD_LIMIT);
    const horizonB = project(WORLD_LIMIT, WORLD_LIMIT);
    drawLine(horizonA.pos, horizonB.pos, 0.12, rgb(0.78, 0.64, 0.32, 0.12));

    const shrineGlow = project(-0.4, 4.5).pos;
    drawCircle(shrineGlow, 2.5, rgb(0.96, 0.76, 0.36, 0.03));
    drawCircle(project(0, 0.1).pos, 5.2, rgb(0.24, 0.22, 0.18, 0.06));
    drawCircle(project(0, -1.4).pos, 4.2, rgb(0.94, 0.76, 0.34, 0.02));

    for (let depth = -WORLD_LIMIT; depth <= WORLD_LIMIT; depth += 2) {
        const alpha = depth === 0 ? 0.04 : 0.02;
        drawProjectedLine(-WORLD_LIMIT, depth, WORLD_LIMIT, depth, rgb(0.28, 0.28, 0.26, alpha));
    }

    for (let i = 0; i < 24; i++) {
        const x = -7.2 + (i % 6) * 2.9 + ((i * 17) % 3) * 0.15;
        const depth = -0.5 + Math.floor(i / 6) * 1.45;
        const p = project(x, depth).pos;
        const alpha = 0.025 + ((i % 4) / 4) * 0.03;
        drawCircle(p, 0.045 + (i % 3) * 0.01, rgb(0.9, 0.84, 0.62, alpha));
    }

    drawPath(-3.9, -0.2, -0.85, 2.7, 12);
    drawPath(0.7, -0.15, 3.35, 2.75, 10);
}

function drawPath(x1, depth1, x2, depth2, steps) {
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const depth = depth1 + (depth2 - depth1) * t;
        const p = project(x, depth).pos;
        drawCircle(p, 0.1 + (1 - Math.abs(t - 0.5) * 2) * 0.06, rgb(0.34, 0.3, 0.22, 0.1));
    }
}

function drawProjectedLine(x1, depth1, x2, depth2, colorValue) {
    const a = project(x1, depth1).pos;
    const b = project(x2, depth2).pos;
    drawLine(a, b, 0.018, colorValue);
}

function drawScenery(entity) {
    const data = getEntityVisuals(entity);

    if (entity.type === 'tree') drawTree(entity, data);
    else if (entity.type === 'shrine') drawShrine(entity, data);
    else if (entity.type === 'lantern') drawLantern(entity, data);
    else drawRock(entity, data);
}

function drawFocusWisp() {
    const data = getEntityVisuals(focusWisp);
    const s = data.scale * focusWisp.size;
    const bob = Math.sin(sceneTime * 0.92) * 0.14 * data.scale;
    const sway = Math.cos(sceneTime * 0.65) * 0.1 * data.scale;
    const center = data.body.add(vec2(sway, bob));

    drawShadowBlob(data.shadowCenter, 0.46 * s, 5, rgb(0, 0, 0, 0.16));
    drawGroundMarker(data.anchor, 0.24 * s, rgb(0.98, 0.9, 0.68, 0.04));
    drawAnchorBeam(data.anchor, center, s);

    drawOrbitGuide(center, s);
    const orbitals = getOrbitals(center, s);
    drawOrbitals(orbitals.filter((orbital) => orbital.planeY < 0));

    drawCircle(center, 2.0 * s, color(focusWisp.auraColor, 0.05));
    drawCircle(center, 1.28 * s, color(focusWisp.auraColor, 0.12));
    drawCircle(center, 0.58 * s, color(focusWisp.bodyColor, 0.98));
    drawCircle(center, 0.18 * s, color(focusWisp.coreColor, 1));
    drawCircle(center.add(vec2(-0.18 * s, 0.12 * s)), 0.1 * s, rgb(1, 1, 1, 0.22));
    drawCircle(center.add(vec2(0.15 * s, -0.08 * s)), 0.06 * s, rgb(1, 0.98, 0.9, 0.18));

    drawOrbitals(orbitals.filter((orbital) => orbital.planeY >= 0));
}

function drawAnchorBeam(anchor, body, scale) {
    const direction = body.subtract(anchor);
    for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const p = body.subtract(direction.scale(t));
        drawCircle(p, (0.16 - t * 0.08) * scale, rgb(0.96, 0.88, 0.66, 0.08 * (1 - t)));
    }
}

function drawOrbitGuide(center, scale) {
    if (!orbitalState.count) return;

    const segments = 48;
    for (let i = 0; i < segments; i++) {
        const phaseA = (Math.PI * 2 * i) / segments;
        const phaseB = (Math.PI * 2 * (i + 1)) / segments;
        const pointA = getOrbitVector(phaseA, scale);
        const pointB = getOrbitVector(phaseB, scale);
        const midPhase = (phaseA + phaseB) / 2;
        const mid = getOrbitVector(midPhase, scale);
        const alpha = mid.planeY < 0 ? 0.08 : 0.16;
        const width = mid.planeY < 0 ? 0.012 : 0.02;
        drawLine(center.add(pointA.offset), center.add(pointB.offset), width, color(orbitStyles[orbitalState.styleIndex].glow, alpha));
    }
}

function getOrbitals(center, scale) {
    const orbitals = [];
    const count = orbitalState.count;
    if (!count) return orbitals;

    for (let i = 0; i < count; i++) {
        const phase = sceneTime * orbitalState.speed + (Math.PI * 2 * i) / count;
        const orbitPoint = getOrbitVector(phase, scale);
        orbitals.push({
            ...orbitPoint,
            center: center.add(orbitPoint.offset),
            size: orbitalState.size * scale,
            phase,
        });
    }

    orbitals.sort((a, b) => a.planeY - b.planeY);
    return orbitals;
}

function drawOrbitals(orbitals) {
    for (const orbital of orbitals)
        drawOrbital(orbital);
}

function drawOrbital(orbital) {
    const style = orbitStyles[orbitalState.styleIndex];
    const p = orbital.center;
    const size = orbital.size;

    const motionOffset = vec2(
        Math.cos(orbital.phase - 1.1) * size * 0.45,
        Math.sin(orbital.phase - 1.1) * size * 0.22,
    );

    if (style.kind === 'ember') {
        drawCircle(p.subtract(motionOffset.scale(1.25)), size * 0.72, color(style.glow, 0.12));
    }
    else if (style.kind === 'seed' || style.kind === 'pearl') {
        drawCircle(p.subtract(motionOffset.scale(0.75)), size * 0.8, color(style.glow, 0.07));
    }

    if (style.kind === 'seed') {
        drawCircle(p, size * 1.12, color(style.glow, 0.08));
        drawCircle(p.add(vec2(0, 0.04 * size)), size, color(style.body, 0.96));
        drawCircle(p.add(vec2(0, -0.14 * size)), size * 0.46, color(style.body, 0.82));
        drawCircle(p.add(vec2(-0.16 * size, 0.1 * size)), size * 0.2, rgb(1, 1, 1, 0.22));
    }
    else if (style.kind === 'pearl') {
        drawCircle(p, size * 1.2, color(style.glow, 0.08));
        drawCircle(p, size, color(style.body, 0.98));
        drawCircle(p.add(vec2(-0.22 * size, 0.16 * size)), size * 0.32, rgb(1, 1, 1, 0.28));
    }
    else if (style.kind === 'ember') {
        drawCircle(p, size * 1.35, color(style.glow, 0.12));
        drawCircle(p.add(vec2(0.12 * size, 0.03 * size)), size * 0.92, color(style.body, 0.98));
        drawCircle(p.add(vec2(-0.1 * size, -0.04 * size)), size * 0.45, color(style.core, 0.86));
    }
    else if (style.kind === 'shard') {
        drawCircle(p, size * 1.15, color(style.glow, 0.08));
        const top = p.add(vec2(0, size));
        const right = p.add(vec2(size * 0.8, 0));
        const bottom = p.add(vec2(0, -size));
        const left = p.add(vec2(-size * 0.8, 0));
        drawLine(top, right, 0.05 * size, color(style.body, 0.92));
        drawLine(right, bottom, 0.05 * size, color(style.body, 0.92));
        drawLine(bottom, left, 0.05 * size, color(style.body, 0.92));
        drawLine(left, top, 0.05 * size, color(style.body, 0.92));
        drawCircle(p, size * 0.12, rgb(1, 1, 1, 0.4));
    }
    else if (style.kind === 'shadow') {
        drawCircle(p, size * 1.3, color(style.glow, 0.08));
        drawCircle(p, size, color(style.body, 0.24));
        drawCircle(p, size * 0.78, color(style.body, 0.78));
        drawCircle(p.add(vec2(0.08 * size, 0)), size * 0.4, color(style.core, 1));
    }
}

function getOrbitVector(phase, scale) {
    const radiusX = orbitalState.radius * scale;
    const radiusY = orbitalState.radius * scale * orbitalState.flatten;
    const orientation = (orbitalState.orientationDeg * Math.PI) / 180;

    let x = Math.cos(phase) * radiusX;
    let y = Math.sin(phase) * radiusY;

    const wobbleX = Math.cos(sceneTime * 1.55 + phase * 1.7) * orbitalState.wobble * scale;
    const wobbleY = Math.sin(sceneTime * 1.15 + phase * 1.3) * orbitalState.wobble * scale * 0.65;
    x += wobbleX;
    y += wobbleY;

    const rotatedX = x * Math.cos(orientation) - y * Math.sin(orientation);
    const rotatedY = x * Math.sin(orientation) + y * Math.cos(orientation);

    return {
        offset: vec2(rotatedX, rotatedY),
        planeY: rotatedY,
    };
}

function drawTree(entity, data) {
    const s = data.scale * entity.size;
    drawShadowBlob(data.shadowCenter, 0.82 * s, 7, rgb(0, 0, 0, 0.16));
    drawGroundMarker(data.anchor, 0.34 * s, rgb(0.72, 0.6, 0.36, 0.09));
    drawLine(data.anchor, data.body.add(vec2(0, -0.4 * s)), 0.18 * s, rgb(0.23, 0.18, 0.13));
    drawRect(data.anchor.add(vec2(0, data.height * 0.45)), vec2(0.38 * s, data.height * 0.84), rgb(0.22, 0.17, 0.12));
    drawCircle(data.body, 1.5 * s, rgb(0.16, 0.22, 0.17));
    drawCircle(data.body.add(vec2(-0.6 * s, -0.12 * s)), 1.02 * s, rgb(0.13, 0.19, 0.15));
    drawCircle(data.body.add(vec2(0.68 * s, 0.02 * s)), 0.98 * s, rgb(0.14, 0.2, 0.15));
}

function drawShrine(entity, data) {
    const s = data.scale * entity.size;
    const shaftHeight = data.height * 0.76;
    const shaftMid = data.anchor.add(vec2(0, shaftHeight * 0.5));
    const capCenter = data.anchor.add(vec2(0, shaftHeight));

    drawShadowBlob(data.shadowCenter, 0.72 * s, 6, rgb(0, 0, 0, 0.16));
    drawGroundMarker(data.anchor, 0.32 * s, rgb(0.88, 0.82, 0.7, 0.06));

    drawRect(shaftMid, vec2(1.02 * s, shaftHeight), rgb(0.22, 0.23, 0.27));
    drawRect(capCenter, vec2(1.22 * s, 0.28 * s), rgb(0.34, 0.35, 0.4));
    drawCircle(data.body.add(vec2(0, 0.15 * s)), 0.72 * s, rgb(0.94, 0.8, 0.46, 0.06));
    drawCircle(data.body.add(vec2(0, 0.15 * s)), 0.34 * s, rgb(0.98, 0.9, 0.7, 0.12));
}

function drawLantern(entity, data) {
    const s = data.scale * entity.size;
    const poleTop = data.anchor.add(vec2(0, data.height));
    const lamp = poleTop.add(vec2(0, 0.16 * s));

    drawShadowBlob(data.shadowCenter, 0.46 * s, 5, rgb(0, 0, 0, 0.14));
    drawGroundMarker(data.anchor, 0.24 * s, rgb(0.9, 0.84, 0.6, 0.08));
    drawLine(data.anchor, poleTop, 0.06 * s, rgb(0.38, 0.32, 0.2));
    drawLine(poleTop.add(vec2(-0.2 * s, 0.05 * s)), poleTop.add(vec2(0.2 * s, 0.05 * s)), 0.04 * s, rgb(0.44, 0.37, 0.22));
    drawRect(lamp, vec2(0.34 * s, 0.44 * s), rgb(0.28, 0.24, 0.16));
    drawCircle(lamp, 0.66 * s, rgb(0.96, 0.78, 0.38, 0.08));
    drawCircle(lamp, 0.38 * s, rgb(1, 0.88, 0.54, 0.16));
    drawCircle(lamp, 0.14 * s, rgb(1, 0.98, 0.86));
}

function drawRock(entity, data) {
    const s = data.scale * entity.size;
    const p = data.body;
    drawShadowBlob(data.shadowCenter, 0.5 * s, 5, rgb(0, 0, 0, 0.13));
    drawGroundMarker(data.anchor, 0.24 * s, rgb(0.86, 0.82, 0.76, 0.06));
    drawCircle(p, 0.88 * s, rgb(0.24, 0.25, 0.24));
    drawCircle(p.add(vec2(-0.28 * s, 0.16 * s)), 0.46 * s, rgb(0.33, 0.33, 0.31));
    drawCircle(p.add(vec2(0.3 * s, -0.08 * s)), 0.34 * s, rgb(0.2, 0.21, 0.21));
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
            return 3.1;
        case 'shrine':
            return 2.35;
        case 'lantern':
            return 2.2;
        case 'rock':
            return 0.56;
        default:
            return entity.hover || 1.18;
    }
}

function project(x, depth) {
    const depth01 = (depth + WORLD_LIMIT) / (WORLD_LIMIT * 2);
    const scale = 1.28 - depth01 * 0.56;
    return {
        pos: vec2(x * (0.96 - depth01 * 0.16), depth * 0.62),
        scale,
    };
}

function color(channels, alphaScale = 1) {
    return rgb(channels[0], channels[1], channels[2], (channels[3] ?? 1) * alphaScale);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function wrapDeg(value) {
    const result = value % 360;
    return result < 0 ? result + 360 : result;
}

function format(value) {
    return value.toFixed(2);
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

import { writable } from 'svelte/store';

export const orbitStyles = [
    { name: 'Seed', glow: [0.98, 0.86, 0.46], body: [1, 0.94, 0.72], core: [1, 1, 0.98], kind: 'seed' },
    { name: 'Pearl', glow: [0.94, 0.84, 0.92], body: [1, 0.95, 0.98], core: [1, 1, 1], kind: 'pearl' },
    { name: 'Ember', glow: [0.98, 0.58, 0.22], body: [1, 0.78, 0.46], core: [1, 0.98, 0.9], kind: 'ember' },
    { name: 'Shard', glow: [0.52, 0.78, 0.98], body: [0.84, 0.95, 1], core: [1, 1, 1], kind: 'shard' },
    { name: 'Shadow', glow: [0.66, 0.7, 0.84], body: [0.84, 0.88, 0.98], core: [0.08, 0.08, 0.12], kind: 'shadow' },
];

export const orbitalState = writable({
    count: 3,
    size: 0.12,
    speed: 1.1,
    orientationDeg: 18,
    radius: 0.88,
    flatten: 0.42,
    wobble: 0.06,
    styleIndex: 0,
});

export const characterState = writable({
    name: 'Wisp',
    remembrance: '',
    visibleToOthers: true,
    presence: 'calm',
    lightTemperament: 'warm',
});

import { playSamples, zzfxG } from 'littlejsengine';
import { lastPlayedSoundPrototype } from '../ui/labState.js';

const MESSAGE_SAMPLE_RATE = 44100;

// Signal 001: waveform-study communicator chitter.
//
// The reference waveform is less like a melodic notification and more like a
// dense train of evenly spaced electronic pulses: a fairly level body followed
// by a soft taper. ZzFX generates each microscopic pulse; we then arrange those
// generated samples into the larger notification waveform so the shape itself
// becomes part of the sound design.
const messageReceivedSamples = buildMessageReceivedSamples();

export const soundPrototypes = [
    {
        id: 'message-received',
        name: 'Message Received',
        description: 'A soft tremolo communicator carrier with a brief higher resolving tone.',
        play() {
            playSamples([messageReceivedSamples], 0.7, 1, 0, false, MESSAGE_SAMPLE_RATE);
        },
    },
];

export function playSoundPrototype(id) {
    const prototype = soundPrototypes.find((entry) => entry.id === id);
    if (!prototype)
        return;

    prototype.play();
    lastPlayedSoundPrototype.set(id);
}

function buildMessageReceivedSamples() {
    // The supplied MP3 is fundamentally one soft carrier tone with very fast
    // amplitude modulation, followed by a short higher resolving tone. ZzFX's
    // tremolo is driven by repeatTime, which makes it a much closer fit than
    // manually arranging dozens of separate chirps.
    const carrier = zzfxG(
        0.34,   // volume
        0,      // randomness
        1565,   // slightly raised from the locked 1490 Hz carrier
        0.001,  // attack — final cue compressed to half duration
        0.01325,// sustain — +2ms for the final length tweak
        0.01325,// release — stays matched to sustain
        0,      // sine keeps the pulse rounded instead of arcade-bright
        1,
        0,      // slide
        0,
        0,      // pitch jump
        0,
        0.004,  // tremolo cycle compressed with the cue to preserve its internal rhythm
        0,      // noise
        0,      // modulation
        0,      // bit crush
        0,      // delay
        0.68,   // sustain volume
        0.16,   // slow decay compressed with the rest of the cue
        0.48,   // strong but rounded tremolo depth
        -4200,  // gentle low-pass to keep it soft and communications-like
    );

    const resolve = zzfxG(
        0.24,
        0,
        2340,   // raised with the carrier to preserve the interval
        0.00075,
        0.01925,
        0.0145,
        0,
        1,
        -0.03,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0.0015,
        0.78,
        0.00625,
        0,
        -5200,
    );

    const gapSeconds = 0.010; // +1ms; total audible cue grows by about 10ms overall
    const totalLength = carrier.length + Math.ceil(gapSeconds * MESSAGE_SAMPLE_RATE) + resolve.length;
    const output = new Float32Array(totalLength);

    mixPulse(output, carrier, 0, 1);
    mixPulse(output, resolve, carrier.length + Math.ceil(gapSeconds * MESSAGE_SAMPLE_RATE), 0.9);

    return output;
}

function mixPulse(output, pulse, start, gain) {
    for (let i = 0; i < pulse.length; i++) {
        const outputIndex = start + i;
        if (outputIndex >= output.length)
            break;

        output[outputIndex] = clampSample(output[outputIndex] + pulse[i] * gain);
    }
}

function clampSample(value) {
    return Math.max(-1, Math.min(1, value));
}

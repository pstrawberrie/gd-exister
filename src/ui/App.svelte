<script>
    import { particlePrototypes } from '../particles/particlePrototypes.js';
    import { playSoundPrototype, soundPrototypes } from '../audio/audioPrototypes.js';
    import { activeParticlePrototype, lastPlayedSoundPrototype } from './labState.js';

    $: activeParticle = particlePrototypes.find((prototype) => prototype.id === $activeParticlePrototype) || particlePrototypes[0];

    function selectParticle(id) {
        activeParticlePrototype.set(id);
    }
</script>

<div class="game-ui game-ui--prototype-lab" aria-label="Exister visual and audio prototype lab">
    <header class="lab-masthead">
        <p class="eyebrow">Exister laboratory</p>
        <h1>Scenes + Signals</h1>
        <p>Particle atmosphere and procedural audio studies.</p>
    </header>

    <aside class="lab-sidebar lab-sidebar--left" aria-label="Particle prototypes">
        <div class="lab-sidebar__heading">
            <p class="eyebrow">LittleJS</p>
            <h2>Particles</h2>
            <p>Static scene atmospheres.</p>
        </div>

        <div class="prototype-list">
            {#each particlePrototypes as prototype}
                <button
                    class:prototype-button--active={$activeParticlePrototype === prototype.id}
                    class="prototype-button"
                    type="button"
                    aria-pressed={$activeParticlePrototype === prototype.id}
                    on:click={() => selectParticle(prototype.id)}
                >
                    <span class="prototype-button__index">{String(particlePrototypes.indexOf(prototype) + 1).padStart(2, '0')}</span>
                    <span class="prototype-button__body">
                        <strong>{prototype.name}</strong>
                        <small>{prototype.description}</small>
                    </span>
                </button>
            {/each}
        </div>
    </aside>

    <aside class="lab-sidebar lab-sidebar--right" aria-label="ZzFX sound prototypes">
        <div class="lab-sidebar__heading">
            <p class="eyebrow">ZzFX</p>
            <h2>Signals</h2>
            <p>Procedural sounds and music sketches.</p>
        </div>

        <div class="prototype-list">
            {#each soundPrototypes as prototype}
                <button
                    class:prototype-button--played={$lastPlayedSoundPrototype === prototype.id}
                    class="prototype-button prototype-button--sound"
                    type="button"
                    on:click={() => playSoundPrototype(prototype.id)}
                >
                    <span class="prototype-button__glyph" aria-hidden="true">›</span>
                    <span class="prototype-button__body">
                        <strong>{prototype.name}</strong>
                        <small>{prototype.description}</small>
                    </span>
                </button>
            {/each}
        </div>

        <p class="lab-sidebar__note">Click a signal to play it. Browser audio begins from your interaction.</p>
    </aside>

    <div class="scene-caption" aria-live="polite">
        <span class="scene-caption__number">{activeParticle.captionNumber}</span>
        <strong>{activeParticle.captionTitle}</strong>
        <span>{activeParticle.captionSubtitle}</span>
    </div>
</div>

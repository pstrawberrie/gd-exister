<script>
    import { characterState, orbitalState, orbitStyles } from './gameState.js';

    let showSpecimen = false;

    const resetOrbitals = {
        count: 3,
        size: 0.12,
        speed: 1.1,
        orientationDeg: 18,
        radius: 0.88,
        flatten: 0.42,
        wobble: 0.06,
        styleIndex: 0,
    };

    function numberValue(event) {
        return Number(event.currentTarget.value);
    }

    function setOrbital(key, value) {
        orbitalState.update((current) => ({ ...current, [key]: value }));
    }

    function setCharacter(key, value) {
        characterState.update((current) => ({ ...current, [key]: value }));
    }
</script>

<div class="game-ui" aria-label="Exister interface prototype">
    <header class="game-ui__masthead">
        <p class="eyebrow">Interface 001</p>
        <h1>The Looking Glass</h1>
        <p>Orbitals</p>
    </header>

    <aside class="customizer" aria-label="Orbital customization">
        <div class="customizer__heading">
            <div>
                <p class="eyebrow">Presence</p>
                <h2>Orbitals</h2>
            </div>
            <span class="customizer__count">{$orbitalState.count}</span>
        </div>

        <div class="form-stack">
            <label class="field">
                <span class="field__label">Form</span>
                <select value={$orbitalState.styleIndex} on:change={(event) => setOrbital('styleIndex', numberValue(event))}>
                    {#each orbitStyles as style, index}
                        <option value={index}>{style.name}</option>
                    {/each}
                </select>
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Quantity</span><output>{$orbitalState.count}</output></span>
                <input type="range" min="0" max="8" step="1" value={$orbitalState.count} on:input={(event) => setOrbital('count', numberValue(event))} />
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Size</span><output>{$orbitalState.size.toFixed(2)}</output></span>
                <input type="range" min="0.04" max="0.26" step="0.01" value={$orbitalState.size} on:input={(event) => setOrbital('size', numberValue(event))} />
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Speed</span><output>{$orbitalState.speed.toFixed(2)}</output></span>
                <input type="range" min="0" max="3" step="0.05" value={$orbitalState.speed} on:input={(event) => setOrbital('speed', numberValue(event))} />
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Orientation</span><output>{Math.round($orbitalState.orientationDeg)}°</output></span>
                <input type="range" min="0" max="360" step="1" value={$orbitalState.orientationDeg} on:input={(event) => setOrbital('orientationDeg', numberValue(event))} />
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Radius</span><output>{$orbitalState.radius.toFixed(2)}</output></span>
                <input type="range" min="0.24" max="1.6" step="0.02" value={$orbitalState.radius} on:input={(event) => setOrbital('radius', numberValue(event))} />
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Flatten</span><output>{$orbitalState.flatten.toFixed(2)}</output></span>
                <input type="range" min="0.12" max="1" step="0.02" value={$orbitalState.flatten} on:input={(event) => setOrbital('flatten', numberValue(event))} />
            </label>

            <label class="field field--range">
                <span class="field__row"><span>Wobble</span><output>{$orbitalState.wobble.toFixed(2)}</output></span>
                <input type="range" min="0" max="0.2" step="0.01" value={$orbitalState.wobble} on:input={(event) => setOrbital('wobble', numberValue(event))} />
            </label>
        </div>

        <div class="customizer__actions">
            <button class="button button--quiet" type="button" on:click={() => orbitalState.set({ ...resetOrbitals })}>Reset</button>
            <button class="button" type="button">Keep this light</button>
        </div>
    </aside>

    <button class="specimen-toggle" type="button" aria-expanded={showSpecimen} on:click={() => showSpecimen = !showSpecimen}>
        {showSpecimen ? 'Hide' : 'Show'} UI specimen
    </button>

    {#if showSpecimen}
        <section class="specimen" aria-label="Exister form element specimen">
            <div class="specimen__heading">
                <div>
                    <p class="eyebrow">UI Language</p>
                    <h2>Native elements</h2>
                </div>
                <button class="icon-button" type="button" aria-label="Close UI specimen" on:click={() => showSpecimen = false}>×</button>
            </div>

            <div class="form-stack">
                <label class="field">
                    <span class="field__label">Name</span>
                    <input type="text" value={$characterState.name} on:input={(event) => setCharacter('name', event.currentTarget.value)} />
                </label>

                <label class="field">
                    <span class="field__label">A remembered thing</span>
                    <textarea rows="3" placeholder="Something small is enough." value={$characterState.remembrance} on:input={(event) => setCharacter('remembrance', event.currentTarget.value)}></textarea>
                </label>

                <label class="field">
                    <span class="field__label">Light temperament</span>
                    <select value={$characterState.lightTemperament} on:change={(event) => setCharacter('lightTemperament', event.currentTarget.value)}>
                        <option value="warm">Warm</option>
                        <option value="clear">Clear</option>
                        <option value="dim">Dim</option>
                        <option value="strange">Strange</option>
                    </select>
                </label>

                <fieldset class="choice-group">
                    <legend>Presence</legend>
                    <label class="choice"><input type="radio" name="presence" checked={$characterState.presence === 'calm'} on:change={() => setCharacter('presence', 'calm')} /><span>Calm</span></label>
                    <label class="choice"><input type="radio" name="presence" checked={$characterState.presence === 'restless'} on:change={() => setCharacter('presence', 'restless')} /><span>Restless</span></label>
                    <label class="choice"><input type="radio" name="presence" checked={$characterState.presence === 'heavy'} on:change={() => setCharacter('presence', 'heavy')} /><span>Heavy</span></label>
                </fieldset>

                <label class="choice choice--check">
                    <input type="checkbox" checked={$characterState.visibleToOthers} on:change={(event) => setCharacter('visibleToOthers', event.currentTarget.checked)} />
                    <span>Let others see this presence</span>
                </label>
            </div>

            <div class="specimen__buttons">
                <button class="button" type="button">Primary action</button>
                <button class="button button--quiet" type="button">Quiet action</button>
                <button class="button button--text" type="button">Text action</button>
            </div>
        </section>
    {/if}
</div>

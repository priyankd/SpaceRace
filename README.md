# Space Race: Planet Adventures

A complete local first slice of a family-friendly airborne lunar racing game. Built with React, Vinext, TypeScript and a Canvas chase-camera renderer. No external services or image assets are required during play.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open the Local URL printed in the terminal. The port advances if 3000 is occupied.

```sh
npm test
npm run typecheck
npm run build
```

## Play

- Hold W to accelerate; release W to brake automatically. A / D or Left / Right steer.
- Up rises and Down descends (Q/E also work); release to hold altitude. Touch devices have Rise and Down buttons. Move above or below boulders while staying inside the boxes. Wait for laser gates to turn green. Higher flight levels also contain boulders, moving asteroids and elevated laser gates.
- Hold Space or Shift while accelerating to boost. On touch devices, release Hold to go to brake.
- P / Escape pauses; R recenters the car without rewinding.
- Touch controls support simultaneous steering, throttle and boost.
- Hover pods keep the car airborne automatically. Steer within the floating box corridor. Its four walls stop the car gently, and the corridor rises and falls to meet elevated gates.
- Avoid floating boulders and moving asteroids. Brake for red laser gates and cross on green. Lasers are active for 1.6–2 seconds in each 6-second cycle, leaving 4–4.4 seconds to pass.
- Collisions slow the car and trigger a short shield without rewinding. There are no checkpoint gates or saved checkpoint positions. The box boundaries prevent bypassing laser gates above, below, or to the side.
- The 30,000-unit course is 2.5× its original length, with 48 floating obstacles and no checkpoints. The first 2,000 units are a safe practice airspace. Later sections add denser slaloms, faster asteroids and shorter green gate windows. There is no time limit.
- Finish earns an explorer badge. Replay starts a fresh run; your best time stays on this browser if local storage is available.
- The optional journal pauses driving and can be opened at any time. No quizzes, assessments or knowledge gates.

## Files

- `app/page.tsx`: game flow, keyboard/touch input, HUD and journal.
- `app/globals.css`: responsive game layout and theme.
- `game/engine.mjs`: deterministic physics, obstacles, continuous flight and discoveries.
- `game/render.mjs`: procedural game scene and chase-camera projection.
- `tests/engine.test.mjs`: simulation tests, including an entire driver-controlled course completion.

The hover car, flight technology, lasers and boost technology are fictional. Lunar gravity, exosphere and crater notes are based on https://science.nasa.gov/moon/facts/. Rendering, speed and flight are stylized for play rather than a scale physics simulation.

## Scope and validation

Four levels are playable end to end: Moon Leap (48 obstacles), Mars Explorer (52), Jupiter Storm Run (56) and Saturn Ring Rally (60). Each has its own scenery, deterministic obstacle layout, three optional discoveries and browser-local best time. Use Levels to choose any destination; finishing offers the next level. All levels are available immediately. Jupiter and Saturn courses take place in fictional orbital arenas, not on solid ground. Constellation tracks and garage customizations remain future work. No publishing or account setup has been performed. Automated engine tests, TypeScript checking, production build and a local HTTP check validate the first slice. Manual browser and device playtesting remains to be done. An optional feature-detected WebMCP start action is available in supporting browsers; no supporting runtime was available to validate its registration.

Dependency audit: the pinned Sites starter currently reports 11 advisories in the full dependency tree (6 when development dependencies are omitted, including 5 high). These have not been automatically upgraded across framework versions. Keep this prototype local pending dependency review before any hosting.

Planet references: https://science.nasa.gov/mars/facts/, https://science.nasa.gov/jupiter/jupiter-facts/, https://science.nasa.gov/saturn/facts/.

## Updated game art

The car uses a generated lime Lamborghini-style rear-view sprite. Three generated asteroid silhouettes (rounded, elongated and angular) match the user's dark cratered reference, with shape-specific dimensions and collisions. Assets and the built-in image generation prompts are in `public/assets/PROMPTS.md`. Source PNGs remain unchanged; canvas silhouette clipping removes the generated backdrops at render time. Driving tips and transient notices no longer appear in the center of the race view.

## Solar flyby and sound

A side display follows the Sun, Mercury, Venus, Earth, Mars, the asteroid belt, Jupiter, Saturn, Uranus, Neptune and Pluto in that order as each race progresses. Planet silhouettes, surface shading and rings accompany the flyby. The Sun is a star, Pluto is a dwarf planet, and the belt is not counted as a planet. Distances, sizes and travel times are compressed, not a realistic aligned planetary configuration. Order reference: https://science.nasa.gov/solar-system/planets/.

Synthesized cockpit sounds include a speed-sensitive engine, boost sweep, collision thump, laser warning, planet-pass chime and finish melody. Sound starts only after a player gesture. The speaker button mutes it, and pausing or hiding the page silences it. Sounds are fictional cockpit feedback, not sound travelling through space.

The airborne corridor follows smooth alternating sweeps and S-turns, with stronger bends on later worlds. Connected corner rails show the route ahead, the camera follows its heading, and the car banks into bends. Climbs ease smoothly into laser gates while retaining the enforced box boundaries.

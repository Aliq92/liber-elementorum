# Arcane Interface

A full-screen, dependency-free magical UI: four floating 3D spell buttons
(Ignis, Aqua, Terra, Aeris) arranged around a glowing rune ring. Pressing one
casts its spell — a mystical incantation card animates into view, backed by
element-specific particle effects and a synthesized chime.

No build step, no framework, no external assets. Plain HTML/CSS/JS (ES
modules), runnable from any static file server. It's also an installable,
offline-capable PWA — see [PWA build](#pwa-build) below. **The PWA is the
recommended way to run this on Android**; see [Mobile-specific behavior
differences](#mobile-specific-behavior-differences) for how it compares to
the native Capacitor build.

## Running it

Node isn't required. From the project root:

```bash
python serve.py
```

Then open `http://localhost:5173`. `serve.py` is a static server that sends
`no-store` and strips conditional-request headers. That matters during
development: plain `python -m http.server` sends `Last-Modified` with no
`Cache-Control`, so browsers keep serving stale ES modules after you edit
them — you end up testing code you already changed.

Any static server works for actually shipping it; there is no build step and
no bundler, so the files on disk are the deployable artifact.

Opening `index.html` directly via `file://` will **not** work — browsers
block ES module imports from the `file://` origin.

## Verifying it

```bash
python verify.py
```

Stands in for a build step: resolves every `<script src>`/`<link href>` in
`index.html`, every ES import in every `.js`, and every `url()` in every
`.css`, and fails if any reference is missing, escapes the project root, or
is a bare specifier (which would need a bundler this project doesn't have).

The spell data also self-checks at boot. `validateSpellData()` runs from the
`ArcaneInterface` constructor and warns in the console if any record is
missing required metadata, if an element pool isn't exactly 3 spells, or if
an id is duplicated or carries the wrong element prefix — the failure modes
that would otherwise surface as `undefined` rendered into a card.

## PWA build

Arcane Interface ships as an installable, offline-capable Progressive Web
App. There's still no bundler — the manifest, service worker and icons are
plain files at the project root, and "building" it is the same as running it.

**Install dependencies**

Node isn't required for the web/PWA target at all (only `npm install` is
needed if you're also touching the Capacitor/Android project — see the
mobile build section below).

**Development server**

```bash
python serve.py
```

Open `http://localhost:5173`. This *is* the PWA — the manifest link, service
worker registration and icons are all active in dev, same as production.

**Production build**

There isn't a separate one: no bundler means the files on disk are already
the deployable artifact (same as the plain web build described above). Point
any static file host — one that serves `.webmanifest` as
`application/manifest+json` or `application/json` and doesn't strip
`Service-Worker-Allowed`/scope headers — at the project root. `npm run
build` (`scripts/build.js`) still exists, but it only stages
`index.html` + `src/` into `www/` for the **Capacitor/Android** project; it
deliberately does *not* copy `manifest.webmanifest`, `sw.js` or `icons/` into
`www/` — a service worker has no useful role inside a WebView that already
ships every asset locally, and registering one there risks the native shell
getting stuck on a cached build during future development.

**Preview "production"**

```bash
python serve.py 8080
```

(or any other static server — `python -m http.server` works too, though
without `serve.py`'s no-cache headers you may need a hard refresh to see
edits). Confirm the manifest and service worker registered:
DevTools → Application → Manifest / Service Workers.

**Install as a PWA on Android**

Open the served URL in Chrome for Android → menu → **Install app** (or
**Add to Home screen**). Chrome will also offer this automatically once the
install criteria are met (manifest + service worker + served over HTTPS or
localhost). The installed app launches in `standalone` display mode — no
address bar, dark status bar matching the theme colour, portrait orientation.

**Offline behavior**

After the first successful load, `sw.js` precaches the full app shell (HTML,
CSS, JS, bundled fonts, spell data, icons — everything under `src/` plus the
manifest and icons; see `PRECACHE_URLS` in `sw.js`). Reload with the network
disabled (DevTools → Network → Offline, or airplane mode once installed) and
the app should load and run identically, including invoking spells and
viewing source records — none of that touches the network anyway.

Cache updates are versioned: bump `CACHE_VERSION` in `sw.js` when shipping a
build with changed assets. The new service worker activates immediately
(`skipWaiting` + `clients.claim`) and deletes any cache not matching the
current version, so returning users pick up the new build on their next load
rather than staying stuck on an old one.

**Visual quality modes**

A small toggle next to the sound icon (top right) cycles **Auto → Full →
Performance**. AUTO (the default) picks a tier from pointer coarseness, touch
support, viewport width and `prefers-reduced-motion` — no user-agent
sniffing. The choice persists in `localStorage`. See `src/performanceMode.js`
for the detection logic and the `:root[data-quality="…"]` CSS gates in
`layout.css` / `button.css` / `spell-display.css` for what each tier changes
(particle budget, backdrop-filter, shadow layers, background blur radius).

## Structure

```
index.html                       markup shell: background, ring, buttons, spell card
manifest.webmanifest             PWA manifest (name, icons, standalone display)
sw.js                             service worker: offline cache, cache-version cleanup
serve.py                         no-cache static dev server
verify.py                        reference/import integrity check (stands in for a build)
icons/                           192/512 + maskable PWA icons (rasterized from icon-source/)
src/
  config.js                      centralized interaction timings (charge threshold etc.)
  main.js                        boots ArcaneInterface, performance mode, quality toggle, SW registration
  performanceMode.js             shared AUTO/FULL/PERFORMANCE visual-quality detection + switching
  rotation.js                    shuffle-bag rotation for the invocation archive, persisted per element
  data/spells.js                 archive entries per element: du'a/adhkar/Qur'anic recitations, source
                                 metadata, glyph svg, theme colours — plus the sourcing policy those
                                 entries follow
  components/
    ArcaneInterface.js           root controller: wires buttons, display, particles, sound, parallax
    SpellButton.js                per-button behavior: pointer tilt, charge visuals, tap/hold routing
    LongPress.js                  reusable hold detection: charge progress, cancellation, keyboard parity
    SpellDisplay.js               renders/animates the floating card; casting -> reading-space transition
    ParticleLayer.js              canvas-based ambient dust + per-element burst effects; quality-aware budget
    soundEngine.js                tiny WebAudio synth — no audio files, just oscillators
  styles/
    base.css                      resets, fonts, reduced-motion handling
    layout.css                    background layers, ring/orbit geometry, sound toggle, performance-mode gates
    button.css                    the 3D button face: bevel, glow, tilt/press transforms
    spell-display.css             the floating spell card and its backdrop
```

Each JS component is a plain ES class bound to a slice of the static DOM
(no virtual DOM, no build tooling) — `SpellButton` is instantiated once per
button, `SpellDisplay` and `ParticleLayer` once each, and `ArcaneInterface`
owns and coordinates all of them.

## How the interactions work

**A layered 3D scene, not a flat page** — `#ring-scene` is a
`transform-style: preserve-3d` world; a `pointermove` listener on `window`
(rAF-throttled to one style write per frame) rotates it a few degrees toward
the cursor, like tilting a floating console. Everything inside it sits at a
different `translateZ`: the decorative orbit rings, rune circle and arc
segments recede into the background (`-25px` to `-115px`), the core plate
sits at the reference plane, and the button layer pops forward (`+38px`).
Because they're all real depth offsets under one perspective, the scene
tilt reads as actual parallax, not a simulated one. `.ring-float` still
carries the slow vertical bob it always had — bob and cursor-tilt compose
independently since they live on separate nested elements.

**3D button feel** — `SpellButton` tracks `pointermove` over each button and
writes `--tilt-x` / `--tilt-y` CSS custom properties, which `button.css`
feeds into a `perspective(...) rotateX/rotateY` transform on the button
face — the button tilts toward the cursor. Hovering also raises `--lift`
(a `translateZ`), so the button visibly lifts off the panel, brightens, and
wakes its inner rune ring and energy swirl. `pointerdown` captures the exact
contact point (as `--px`/`--py` percentages within the face, from the real
`clientX`/`clientY` — not the button's center) and uses it to: position a
radial "aura" glow, anchor an expanding ripple/pressure-wave element that
animates outward from that point, and set `--press`/`--lift` negative so the
face visibly depresses into the panel and darkens toward the touch point.
Releasing swaps `.is-pressed` for `.is-releasing`, which plays a brief
spring-back keyframe (`button-rebound`) before settling. Terra presses
deeper and rebounds slower (`--press-depth: 9px`, `--rebound-duration: .5s`)
than Aeris, which is lighter and snappier (`4px` / `.3s`) — set per element
via `[data-element="…"]` overrides on the same custom properties. None of
this depends on `:hover`, so it works identically on touch.

**Tap vs. hold — two actions per button.** Each button is a dual-action
control, handled by `LongPress.js`:

- **Short press → inspect.** Opens the element's archive card (qualities,
  triplicity, sources). Never casts.
- **Long press (800ms) → invoke.** Charges visibly, then manifests one of
  three historically grounded spell records for that element, chosen at
  random.

`LongPress` is a three-state machine (`idle → charging → invoked`) and is the
single authority for the tap/hold decision. Exactly one terminal callback
fires per press — `onTap`, `onCancel`, or `onComplete` — which is what stops
a completed hold from also firing a click action. It captures the pointer,
cancels on `pointerup`/`pointercancel`/`pointerleave`/`blur` or if the pointer
travels more than 28px outside the control, refuses a second pointer while a
hold is in flight, and suppresses the context menu and drag-start. Keyboard
gets parity — Enter/Space tap to inspect, hold to invoke, with `e.repeat`
guarded so auto-repeat can't restart the charge. `destroy()` removes every
listener and clears every handle.

All timings live in `src/config.js`; nothing hard-codes a duration.

> **Completion is timer-driven, not rAF-driven.** This matters: `requestAnimationFrame`
> is throttled or paused outright in background/non-compositing tabs, so
> deriving completion from the animation loop meant a legitimate hold could
> silently never fire. A `setTimeout` guarantees the threshold; rAF only
> paints the progress. This was a real bug caught in testing, not a
> hypothetical.

**Charge feedback, no progress bar.** `LongPress` writes a `--charge` value
(0→1) onto the button and the stage each frame; CSS reads it to drive
everything at once — the face sinks and compresses further, a tremor
animation scales with charge, the aura tightens as its blur drops, runes and
the energy swirl spin up (animation-duration interpolated by `--charge`), the
glyph brightens and grows, ring geometry accelerates toward alignment, and
the core pools light. `ParticleLayer.chargeTick()` emits motes that spiral
*inward* to the press point, emitting faster as charge builds.

**Manifestation.** On completion the button discharges (`discharge-pulse`
spring + expanding ring), `castBurst()` throws a heavier particle release
plus three expanding shock rings, a beam element rotates to the held
button's compass angle and travels inward to the core, the alignment ring
snaps closed, and the core flashes. The card itself is *assembled* rather
than faded: `spell-assemble` opens it from a horizontal seam via `clip-path`,
and text parts stagger in.

**CASTING → READING.** The card's elemental effect is deliberately
short-lived. `SpellDisplay` adds `.is-casting-phase` for `CASTING_PHASE_MS`
(1100ms), during which the orb runs at 1.12× scale and ~0.95 opacity with
fast rings and a striking glyph; when it clears, the orb settles to 0.72×
and ~0.36 opacity so the invocation is the loudest thing on the card.
Measured: 202px @ 0.95 while casting, 130px @ 0.36 at rest.

### Layering rules (these are load-bearing)

The manifestation lives in `.manifest-stage` — a self-contained block between
the heading and the invocation, with its own positioning context,
`pointer-events: none`, and a small *flow* height (`clamp(60px, 10vmin,
104px)`) even though the orb reads much larger. That keeps decorative
graphics from inflating the card's scroll height.

- Readable content (`.spell-header`, `.invocation-content`, `.spell-brief`,
  `.spell-source`) sits at `z-index: 2`; the stage sits at `0`.
- The orb is capped (`clamp(180px, 22vmin, 220px)`) so its bleed above and
  below the stage lands on the heading and the divider rule, never on the
  invocation paragraph.
- **No blur or backdrop-filter on any container that holds text.** The card's
  own `backdrop-filter` blurs what is *behind* the card, not its contents.
- The ring is split into two stacking layers — `.arcane-ring--scene`
  (geometry + core plate) at `z-index: 3` *behind* the card, and
  `.arcane-ring--controls` (the four buttons only) at `z-index: 12` in front.
  Both receive identical cursor tilt so they read as one object. This split
  exists because the core plate carries a `backdrop-filter`; when the whole
  ring was raised above the card, that filter blurred the spell text.
- `--btn-offset-f` pushes the top/bottom controls outward (0.10 desktop, 0.34
  on phones) to widen the clear band the card is sized against. Without the
  larger phone value the band is only ~200px and those two buttons end up
  sitting on top of the spell title.

**Archive card** (short press) materializes the same way but without the
casting flourish, offset toward the pressed button's direction
(`--origin-x`/`--origin-y`), so it reads as projected from that button.

**Returning.** A spell card carries `[ VIEW RECORD ]` (full provenance for
that specific spell, including its status badge) and `[ RETURN TO ARCHIVE ]`,
which goes back to the element's informational card. There is no automatic
timeout — the spell stays until dismissed.

**One active spell at a time** — `ArcaneInterface` is the single source of
truth for `activeId`; every `activate()` call resets all buttons' active
state before setting the new one, and there's exactly one `SpellDisplay`
instance.

**Dismissing** — a full-screen `#spell-backdrop` layer dims in behind the
ring while a spell is open; clicking it (or pressing `Escape`) calls
`deactivate()`. It sits in the stacking order *below* the ring buttons
(z-index 2 vs. 3) and the ring wrapper has `pointer-events: none` with only
the buttons themselves re-enabled — so the compass buttons stay clickable
through the dimmed backdrop, letting you switch spells directly instead of
having to dismiss first.

**Particles** — `ParticleLayer` runs one canvas + one `requestAnimationFrame`
loop for both a continuous ambient drift (tinted toward the active element,
each mote randomly assigned a "depth" that scales its size/speed/opacity for
a cheap depth-of-field feel with no blur filter) and on-demand bursts. Each
element has its own particle behavior: Ignis embers flicker upward, Aqua
mixes falling droplets with expanding ripple rings, Terra scatters
gravity-settling debris chunks, Aeris spirals pale motes outward. Bursts now
originate from the actual point you pressed, not the button's center.
`prefers-reduced-motion` cuts burst counts and disables the ambient field.

**Sound** — `soundEngine.js` synthesizes a short multi-oscillator chime per
element with the WebAudio API — no audio files. The speaker icon (top
right) toggles a `muted` flag that short-circuits `chime()`.

**Floating geometry** — around the core, `.ring-geo` holds a handful of
slow, faint decorations, each pinned to its own `translateZ` so the scene
tilt separates them visually: two dashed orbit rings, a large tick-mark
"rune circle" (the same `repeating-conic-gradient` + radial mask technique
used for the buttons' inner rune layer, just scaled up), two partial SVG
arc segments rotating in opposite directions, and three small orbiting
satellite dots. All `pointer-events: none` and animated purely with CSS.

**Lighting contrast** — `.has-active-spell` dims the background fog/vortex
and the three inactive buttons (`filter: brightness/saturate` down) while
the active button and card get a slightly stronger glow, so the open spell
reads as the clear focal point instead of competing with idle chrome.

**Responsiveness** — sizes use `clamp()`/`vmin` throughout; a single
`max-width: 640px` breakpoint tightens the ring and button dimensions for
phones. Pointer-tilt (the hover-follow effect) is skipped for touch input
(`pointerType === "touch"`) since there's no hover state to react to, but
every part of the *press* feedback — contact-point capture, ripple, depress,
rebound, particle burst, spell reveal — runs off `pointerdown`/`pointerup`
directly and works the same on touch as on mouse.

## Archive content & sourcing policy

Two bodies of content, both in `src/data/spells.js`: the four **element**
entries (short press — general Western classical-element history, unrelated
to the material below) and a **protective invocation archive** (long press)
of authentic Islamic du'a, adhkar, Qur'anic protection verses and prophetic
ruqyah — 19 records across the four elements.

- **Accurate terminology, always.** Nothing here is labelled "spell". Every
  record's `type` field (`Du'a`, `Dhikr`, `Qur'anic Recitation`, `Ruqyah`) is
  what's actually shown on the card. The app's own interaction verbs
  (invoke, manifest, casting) describe the fictional interface's action, not
  the text itself.
- **Every record checked against a primary reference before inclusion.**
  Arabic, transliteration, reference (surah:ayah or collection+number), and
  authenticity grading were checked against sunnah.com and standard Qur'anic
  text before being written into `spells.js` — see the header comment there.
  Where a hadith's grading couldn't be confirmed with confidence, the record
  was left out rather than included with a guessed citation. Quality over an
  arbitrary count is why the archive has 19 records, not a rounder number.
- **Commentary is never presented as the text.** `notes` is our own
  historical/contextual framing (who narrated it, what a source says about
  its virtue); `arabic`/`transliteration`/`meaning` are the recitation
  itself. The two are never blended.
- **The elemental filing is ours, and says so.** IGNIS/AQUA/TERRA/AERIS
  group the archive by theme (strength, healing, refuge, protection) as a
  navigation choice made by this interface — not a claim that Islam
  associates the four classical elements with specific prayers or
  correspondences. Stated explicitly in `FRAMEWORK_NOTE`, shown in every
  record's source panel.
- **No efficacy claims.** Every source panel closes with: *"Religious texts
  are presented for reflection and historical/devotional context. The
  interface does not claim supernatural guarantees."* The same note also
  appears once, permanently, in the archive's footer.

### The invocation archive

| Element | Record | Type | Source |
|---|---|---|---|
| Ignis | Hasbunallahu wa ni'mal Wakil | Qur'anic Recitation | Qur'an 3:173 |
| Ignis | Rabbana Afrigh 'Alayna Sabran | Qur'anic Recitation | Qur'an 2:250 |
| Ignis | Fa-inna Ma'al-'Usri Yusra | Qur'anic Recitation | Qur'an 94:5-6 |
| Ignis | La Hawla wa la Quwwata illa Billah | Dhikr | Bukhari 6384; Muslim 2704 |
| Ignis | Allahumma la Sahla illa ma Ja'altahu Sahla | Du'a | Ibn Hibban 2427 |
| Aqua | Du'a of Yunus | Qur'anic Recitation | Qur'an 21:87 |
| Aqua | Refuge from Anxiety and Sorrow | Du'a | Bukhari 6369 |
| Aqua | Ruqyah for Pain | Ruqyah | Muslim 2202 |
| Aqua | Ruqyah of Jibril | Ruqyah | Muslim 2186 |
| Aqua | Ruqyah for the Sick | Ruqyah | Bukhari 5743; Muslim 2191 |
| Aqua | Ruqyah by Surah Al-Fatiha | Qur'anic Recitation | Qur'an 1:1-7; Bukhari 5736 |
| Terra | Ayat al-Kursi | Qur'anic Recitation | Qur'an 2:255 |
| Terra | Bismillahil-ladhi la Yadurru | Dhikr | Tirmidhi 3388; Ibn Majah 3869 |
| Terra | Refuge on Entering a Place | Du'a | Muslim 2708a |
| Terra | Sleep and Waking | Du'a | Bukhari 6324 |
| Aeris | Surah Al-Ikhlas | Qur'anic Recitation | Qur'an 112:1-4 |
| Aeris | Surah Al-Falaq | Qur'anic Recitation | Qur'an 113:1-5 |
| Aeris | Surah An-Nas | Qur'anic Recitation | Qur'an 114:1-6 |
| Aeris | Refuge for Hasan and Husain | Du'a | Bukhari 3371 |

### Rotation

Selection uses a shuffle-bag (`src/rotation.js`), not plain random: every
record in an element's pool is served exactly once before any repeat, then
the bag reshuffles — checked so a reshuffle never opens on the record the
previous cycle just ended on. Each element's rotation is independent and
persists in `localStorage` (`arcane-rotation-v1`), so reloading or reopening
the installed PWA continues the sequence rather than restarting it. A
changed record pool (ids added/removed in some future revision) is detected
via a signature check and safely starts a fresh rotation instead of reading
mismatched saved state.

### Reading space

Long-pressing settles into two visually distinct phases, driven by
`SpellDisplay`'s `is-casting-phase` → `is-reading` transition and mirrored
onto `#arcane-stage` for the background: **casting** (~1.1s, luminous,
moving — the existing manifestation flourish) then **reading** (calm,
near-stationary — ambient particles drop to a near-zero tier via
`ParticleLayer.setReadingMode()`, background rings dim substantially, and a
slow ~5s breathing pulse on the manifestation orb is the only motion left,
skipped under `prefers-reduced-motion`). Arabic is revealed as a single RTL
block — never per-letter or per-word — sized and spaced for mobile legibility
(generous line-height, no letter-spacing, no competing text-shadow).

---

# ARCANE INTERFACE — MOBILE BUILD

The same source tree wrapped in [Capacitor](https://capacitorjs.com) as a
standalone Android app. No second codebase: the native shell loads exactly
the files under `src/` and `index.html` — the web build and the Android
build run identical code.

## Toolchain

This machine had none of Node, a JDK, or the Android SDK installed. All
three were fetched as portable zips (no admin rights needed — the winget MSI
installers hung waiting on a UAC prompt nothing could answer) and don't
touch the system PATH:

| Tool | Version | Location |
|---|---|---|
| Node.js | 22.23.2 (Capacitor 8 requires ≥22) | `C:\devtools\node` |
| JDK | Microsoft OpenJDK 21 (Capacitor 8's Android module needs Java 21 source compat — 17 fails the build) | `C:\devtools\jdk21` |
| Android SDK | platform-tools, `platforms;android-34`, `build-tools;34.0.0` | `C:\devtools\android-sdk` |

If your own machine already has these on `PATH`, ignore the table — the
commands below are identical either way. If not, put equivalents on `PATH`
(or export `JAVA_HOME` / `ANDROID_HOME` / `ANDROID_SDK_ROOT`) before running
anything under `android/`.

## Commands

These are the actual scripts in `package.json` — nothing here is invented.

```bash
npm install              # installs @capacitor/* (core, android, app, haptics,
                          # status-bar, splash-screen) and the Capacitor CLI

npm run build             # stages index.html + src/ into www/ (see scripts/build.js —
                          # there's no bundler; this is a straight copy, matching
                          # verify.py's point that the source files ARE the artifact)

npm run cap:sync          # build, then `npx cap sync android` — copies www/ into
                          # android/app/src/main/assets/public and updates plugins

npm run android:open      # npx cap open android — launches Android Studio on the project
```

Opening in Android Studio (`npm run android:open`) is the normal path for
day-to-day work — run on a device/emulator from there. The commands below are
for building APKs/AABs directly, which is how this was actually validated in
this session (no Android Studio GUI was available here either).

### Debug APK

```bash
cd android
./gradlew assembleDebug          # gradlew.bat on Windows if not using a POSIX shell
```

Output: **`android/app/build/outputs/apk/debug/app-debug.apk`**. Self-signed
with Gradle's auto-generated debug key — installable on a device
(`adb install app-debug.apk`) or emulator, not distributable.

### Signed release APK / AAB

**Debug and release are not the same artifact with a different flag.** A
release build must be signed with a key *you* generate and keep — Android
will refuse to install an unsigned release APK, and if you ever lose this
key you can never publish an update to the same app listing again. Nothing
in this repo does this for you, deliberately: generating a "release"
keystore is a permanent identity, not a build artifact, and shouldn't be
something that happens silently in an automated session.

1. Generate your own keystore once, keep it and its password somewhere safe
   (a password manager, not this repo):
   ```bash
   keytool -genkeypair -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 \
     -validity 10000 -alias arcane-interface
   ```
2. Create `android/keystore.properties` (already in `.gitignore` — never commit
   this or the `.jks` file):
   ```properties
   storeFile=/absolute/path/to/my-release-key.jks
   storePassword=...
   keyAlias=arcane-interface
   keyPassword=...
   ```
3. Add a `signingConfigs` block to `android/app/build.gradle` that reads those
   properties and assigns it to `buildTypes.release` (standard Capacitor/
   Android pattern — not included by default, since without your keystore
   present it would just fail).
4. Build:
   ```bash
   cd android
   ./gradlew assembleRelease   # signed APK
   ./gradlew bundleRelease     # signed AAB, for Play Store upload
   ```

**What was actually verified in this session, without a signing key:**
`./gradlew assembleRelease` was run and succeeded, producing
`android/app/build/outputs/apk/release/app-release-unsigned.apk` — proving the
release build pipeline itself works. It's unsigned, exactly as its filename
says, and won't install until you sign it per the steps above.
`./gradlew bundleDebug` was also run and succeeded, producing
`android/app/build/outputs/bundle/debug/app-debug.aab`, proving the AAB
bundling path works too.

## Updating the version

Two places, kept in sync manually:
- `package.json` → `"version"`
- `android/app/build.gradle` → `defaultConfig.versionCode` (bump every
  release) and `versionName` (what users see)

Currently `versionCode 1`, `versionName "1.0.0"`.

## Icon & splash

Source SVGs and the regeneration pipeline live in `icon-source/` (see
`icon-source/README.md`) — a compass/star rune echoing the app's own
Ignis-top/Aqua-right/Terra-bottom/Aeris-left button layout, on a dark violet
radial gradient. Already rendered into every density Android needs:
- Adaptive icon: `android/app/src/main/res/mipmap-*/ic_launcher_{foreground,background}.png`
- Legacy/round icon: `android/app/src/main/res/mipmap-*/ic_launcher{,_round}.png`
- Splash: `android/app/src/main/res/drawable{,-port-*,-land-*}/splash.png`
- Play Store listing icon: `icon-source/play-store-icon-512.png`

## What's native vs. guarded no-op

`src/native.js` is the only file that touches Capacitor plugins, and it does
so by calling `window.Capacitor.Plugins.*` directly rather than importing the
npm plugin packages — this project has no bundler, so a bare `import
"@capacitor/haptics"` couldn't resolve in a browser anyway. This is
Capacitor's documented mechanism for exactly this case, and it means the web
build and the native build run the *same* files: on plain web
`window.Capacitor` is simply undefined, so every exported function in
`native.js` is a no-op. Verified after all native work was done: production
web build still passes `verify.py`, boots with zero console errors, and
`window.Capacitor` reads `"undefined"`.

Wired in:
- **Haptics** — light impact on tap (`SpellButton`'s `onTap`), medium on a
  successful invocation (`onComplete`), one optional light pulse when the
  casting animation settles into its reading state (`SpellDisplay`).
- **Status bar** — dark background, light (pale) icons, non-overlaying.
  (`Style.Dark` in `@capacitor/status-bar` counter-intuitively means *light*
  text for a *dark* background — confirmed against the plugin's own
  `definitions.js` rather than assumed, after getting it backwards once.)
- **Splash screen** — hidden explicitly once `ArcaneInterface` finishes
  constructing, on top of the config's own `launchAutoHide`.
- **App lifecycle** — `appStateChange` with `isActive:false` runs the same
  `bailOut()` used for tab-blur/hidden on web: cancels any in-flight charge,
  clears the pending cast-flourish timer, so resuming can't fire a delayed
  spell or leave a button stuck pressed. Whatever archive/spell card was open
  is left untouched.
- **Android back button** — a priority stack, checked top-down: source/record
  panel open → close it; spell manifestation active → return to archive;
  archive open → go to idle; otherwise → `App.exitApp()`.

## Mobile-specific behavior differences

- **Cursor parallax is skipped on touch** (`pointerType === "touch"` guard on
  the global `pointermove` tilt handler) — touch fires `pointermove` during
  drags/scrolls, which would otherwise jerk the ring toward the last touch
  point. The ring's existing autonomous float bob (`ring-float-kf`) still
  runs regardless, which is the "subtle motion" on touch devices.
- **Particle budget, backdrop-filter, shadow layers and background blur
  radius all drop in PERFORMANCE quality mode** (`src/performanceMode.js`,
  gated via `:root[data-quality]` in CSS and `ParticleLayer`'s own listener
  for the same event) — 220 → 90 max particles, burst/cast counts scaled
  down, charge-tick emission rate floor raised, the card's `backdrop-filter`
  swapped for a solid gradient, and one of the two blurred ambient background
  layers dropped entirely. AUTO picks PERFORMANCE for coarse-pointer/touch
  devices, a native Capacitor shell, or `prefers-reduced-motion`. The canvas
  particle loop is also the one genuinely unbounded per-frame cost in the
  app, and now pauses outright on `visibilitychange` (backgrounded tab/app)
  rather than continuing to render invisibly.
- **Ambient background motion (fog, vortex, stars) pauses while charging or
  casting** (`is-charging`/`is-casting` on `#arcane-stage`, see the "casting
  priority" block in `layout.css`) so rendering budget goes to the active
  interaction; `ParticleLayer.setFocusMode()` does the equivalent for ambient
  particle emission. The ring geometry's own charge-driven acceleration is
  deliberately left alone — pausing it would cancel that flourish.
- **Fonts are bundled locally**, not loaded from Google Fonts' CDN (see
  `src/styles/fonts.css`) — the native build has no guaranteed network
  access. Both Cinzel and EB Garamond are OFL-licensed, which permits this.
- **Recommended Android use: install the PWA** (Chrome → Add to Home
  screen/Install app — see [PWA build](#pwa-build)) rather than building the
  Capacitor APK. It's the same UI running the same files, launches standalone,
  works offline, and needs no `gradlew` build step. The Capacitor/Android
  project is kept intact for whatever future native-only need arises (a Play
  Store listing, a native plugin this app doesn't currently use), but isn't
  the primary way to run this on a phone anymore.

## A real bug this surfaced (and how it was told apart from a test artifact)

While regression-testing rapid sequential casts across all four elements in
this browser automation tool, roughly 1 in 4 casts silently failed to invoke.
Tracing every `LongPress` callback with timestamps showed the charge starting
and then being cancelled ~130ms later — far too fast to be a real pointer
movement. That pointed at `visibilitychange`, and logging it directly
confirmed the automation tool itself toggles `document.hidden` every ~2
seconds (apparently as part of its own tab/screenshot management) —
triggering the *exact* cancel-on-background path built for requirement #6.
Pinning `document.hidden` to `false` for the duration of one test run made
all four casts succeed cleanly with correct, distinct titles — confirming
this was the test environment, not the app. The mechanism this exposed is
real and correct: a mid-charge hold cancels cleanly on hidden (verified
directly: charging state clears, no stuck button, no spurious invoke/inspect
fires when the pointer is later released) — which is exactly the behavior a
real Android user backgrounding the app mid-hold needs.

## Notes

- Requires a modern Chromium/Firefox/Safari (`color-mix()`, backdrop-filter,
  ES modules — all standard in current browsers).
- All four entries — text, colours, glyphs, and source metadata — are defined
  in one place, `src/data/spells.js`. The shared `FRAMEWORK_NOTE` and
  `DISCLAIMER` exported from that file are rendered into every source panel.

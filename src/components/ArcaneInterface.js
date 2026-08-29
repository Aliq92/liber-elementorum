import { ELEMENTS, SPELLBOOK, pickSpell, validateSpellData } from "../data/spells.js";
import { SpellButton } from "./SpellButton.js";
import { SpellDisplay } from "./SpellDisplay.js";
import { ParticleLayer } from "./ParticleLayer.js";
import { chime, chargeTone, castTone, setMuted } from "./soundEngine.js";
import { CAST_FLOURISH_MS } from "../config.js";
import { initStatusBar, hideSplash, onAppStateChange, onBackButton, exitApp } from "../native.js";

export class ArcaneInterface {
  constructor(root) {
    this.root = root;
    // two stacking layers (geometry behind the card, controls in front) that
    // must receive identical tilt so they read as one object
    this.ringScenes = [root.querySelector("#ring-scene"), root.querySelector("#ring-scene-controls")].filter(
      Boolean
    );
    this.ringScene = this.ringScenes[0];
    this.ringCoreGlyph = root.querySelector("#ring-core-glyph");
    this.canvas = root.querySelector("#particle-layer");
    this.beam = root.querySelector("#cast-beam");

    this.particles = new ParticleLayer(this.canvas);
    this.display = new SpellDisplay(root.querySelector("#spell-display"), {
      onReturnToArchive: () => this.returnToArchive(),
    });

    this.backdrop = root.querySelector("#spell-backdrop");
    this.backdrop.addEventListener("click", () => this.deactivate());

    this.buttons = new Map();
    root.querySelectorAll(".spell-button").forEach((el) => {
      const element = ELEMENTS.find((s) => s.id === el.dataset.element);
      if (!element) return;
      const button = new SpellButton(el, {
        onInspect: (id, x, y, pos) => this.inspect(id, x, y, pos),
        onInvoke: (id, x, y, pos) => this.invoke(id, x, y, pos),
        onChargeStart: (id, pos) => this.beginCharge(id, pos),
        onChargeProgress: (id, t, x, y) => this.updateCharge(id, t, x, y),
        onChargeCancel: (id) => this.endCharge(id),
      });
      button.setColors(element.color, element.colorSoft);
      button.setGlyph(element.glyph);
      this.buttons.set(element.id, button);
    });

    this.activeId = null;
    this.lastSpellByElement = {};
    this._castTimer = null;
    this._bindGlobal();
    this._bindNative();

    // surfaces data defects (missing metadata, cross-element leakage) at boot
    validateSpellData();

    // cosmetic native setup; both are guarded no-ops on plain web
    initStatusBar();
    hideSplash();
  }

  /** Full teardown — used by tests and any future unmount path. */
  destroy() {
    window.clearTimeout(this._castTimer);
    this.buttons.forEach((btn) => btn.destroy());
    this.particles.destroy();
    if (this._unbindAppState) this._unbindAppState();
    if (this._unbindBackButton) this._unbindBackButton();
  }

  _element(id) {
    return ELEMENTS.find((s) => s.id === id);
  }

  _applyTheme(element) {
    this.root.style.setProperty("--active-color", element.color);
    this.root.style.setProperty("--active-glow", element.glow);
    this.ringCoreGlyph.innerHTML = element.glyph;
    this.ringCoreGlyph.style.color = element.color;
  }

  /* ---------------- charging ---------------- */

  beginCharge(id, position) {
    const element = this._element(id);
    if (!element) return;
    // only one control may be charging at a time
    this.buttons.forEach((btn, key) => {
      if (key !== id) btn.cancelCharge();
    });
    this._applyTheme(element);
    this.root.classList.add("is-charging");
    this.root.style.setProperty("--charge", "0");
    this._orientBeam(position);
    this.particles.setActiveElement(element.color);
    this.particles.setFocusMode(true);
    chargeTone(id);
  }

  updateCharge(id, t, x, y) {
    this.root.style.setProperty("--charge", t.toFixed(3));
    this.particles.chargeTick(id, x, y, t);
  }

  endCharge() {
    this.root.classList.remove("is-charging");
    this.root.style.setProperty("--charge", "0");
    if (!this.activeId) this.particles.setActiveElement(null);
    // A completed hold flows straight into invoke() without going through
    // here, so reaching this point always means the hold was cancelled or
    // released as a tap — ambient rendering can relax immediately.
    this.particles.setFocusMode(false);
  }

  /** point the inbound cast beam at the button that was held */
  _orientBeam(position) {
    const angle = { top: 0, right: 90, bottom: 180, left: 270 }[position] ?? 180;
    if (this.beam) this.beam.style.setProperty("--beam-angle", `${angle}deg`);
  }

  /* ---------------- short press : inspect ---------------- */

  inspect(id, x, y, position) {
    const element = this._element(id);
    if (!element) return;

    this.endCharge();
    this.buttons.forEach((btn, key) => btn.setActive(key === id));
    this._applyTheme(element);
    this.particles.setActiveElement(element.color);
    this.particles.burst(id, x, y);

    this.root.classList.add("has-active-spell");
    this.root.classList.remove("is-casting");
    this.display.showArchive(element, position);

    this.activeId = id;
    this.activePosition = position;
    chime(id);
  }

  /* ---------------- long press : invoke ---------------- */

  invoke(id, x, y, position) {
    const element = this._element(id);
    if (!element) return;

    const spell = pickSpell(id, this.lastSpellByElement[id]);
    if (!spell) return;
    this.lastSpellByElement[id] = spell.id;

    this.root.classList.remove("is-charging");
    this.root.style.setProperty("--charge", "1");

    this.buttons.forEach((btn, key) => btn.setActive(key === id));
    this._applyTheme(element);
    this.particles.setActiveElement(element.color);
    this.particles.setFocusMode(true);
    this.particles.castBurst(id, x, y);

    // casting flourish: beam travels inward, geometry snaps into alignment
    this._orientBeam(position);
    this.root.classList.add("has-active-spell", "is-casting");
    window.clearTimeout(this._castTimer);
    this._castTimer = window.setTimeout(() => {
      this.root.classList.remove("is-casting");
      this.root.style.setProperty("--charge", "0");
      this.particles.setFocusMode(false);
    }, CAST_FLOURISH_MS);

    this.display.showSpell(spell, element, position);

    this.activeId = id;
    this.activePosition = position;
    castTone(id);
  }

  returnToArchive() {
    if (!this.activeId) return;
    const element = this._element(this.activeId);
    if (!element) return;
    this.display.showArchive(element, this.activePosition);
    chime(this.activeId);
  }

  deactivate() {
    this.buttons.forEach((btn) => btn.setActive(false));
    this.display.hide();
    this.root.classList.remove("has-active-spell", "is-casting", "is-charging");
    this.root.style.setProperty("--charge", "0");
    this.particles.setActiveElement(null);
    this.activeId = null;
  }

  /* ---------------- global ---------------- */

  _bindGlobal() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.deactivate();
    });

    // rAF-throttled cursor tilt — one style write per frame at most
    let pendingEvent = null;
    let ticking = false;
    const applyTilt = () => {
      ticking = false;
      if (!pendingEvent) return;
      const px = pendingEvent.clientX / window.innerWidth - 0.5;
      const py = pendingEvent.clientY / window.innerHeight - 0.5;
      const t = `rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 13).toFixed(2)}deg)`;
      this.ringScenes.forEach((s) => (s.style.transform = t));
    };

    window.addEventListener("pointermove", (e) => {
      // Cursor parallax is a desktop-only flourish. Touch input still fires
      // pointermove during drags/scrolls, which would otherwise jerk the
      // whole ring toward wherever the user last touched. The ring already
      // has its own autonomous float bob (see ring-float-kf in layout.css)
      // that runs regardless — that's the "subtle motion" on touch devices.
      if (e.pointerType === "touch") return;
      pendingEvent = e;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyTilt);
      }
    });

    // never leave the rig stuck mid-charge/mid-cast if focus, tab visibility,
    // or (on native) the app itself goes away
    const bailOut = () => {
      this.buttons.forEach((btn) => btn.longPress && btn.longPress.cancel());
      this.endCharge();
      // a pending cast-flourish timer must not fire late after we resume —
      // that would read as a spell casting itself with no button held
      window.clearTimeout(this._castTimer);
      this.root.classList.remove("is-casting");
    };
    window.addEventListener("blur", () => {
      this.ringScenes.forEach((s) => (s.style.transform = "rotateX(0deg) rotateY(0deg)"));
      bailOut();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) bailOut();
    });
    this._bailOut = bailOut;

    const soundToggle = document.getElementById("sound-toggle");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        const currentlyOn = soundToggle.getAttribute("aria-pressed") === "true";
        soundToggle.setAttribute("aria-pressed", String(!currentlyOn));
        soundToggle.classList.toggle("is-muted", currentlyOn);
        setMuted(currentlyOn);
      });
    }
  }

  /** App lifecycle + Android back button. Both are guarded no-ops on plain web. */
  _bindNative() {
    // Backgrounding mid-charge/mid-cast must cancel the same way blur/hidden
    // already do; resuming must not trigger a delayed spell or leave a
    // button stuck pressed, and should preserve whatever archive/spell card
    // was already open.
    this._unbindAppState = onAppStateChange(({ isActive }) => {
      if (!isActive) this._bailOut();
    });

    // Priority stack, checked top-down, exactly as specified:
    //   1. record/source panel open -> close it
    //   2. spell manifestation active -> return to archive
    //   3. archive/element view active -> go to idle
    //   4. otherwise -> normal Android back/exit behavior
    this._unbindBackButton = onBackButton(() => {
      if (this.display.isRecordOpen()) {
        this.display.closeRecord();
        return;
      }
      if (this.display.mode === "spell") {
        this.returnToArchive();
        return;
      }
      if (this.display.mode === "archive") {
        this.deactivate();
        return;
      }
      exitApp();
    });
  }
}

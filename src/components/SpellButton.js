import { LongPress } from "./LongPress.js";
import { CHARGE_THRESHOLD, DISCHARGE_MS } from "../config.js";
import { hapticLight, hapticMedium } from "../native.js";

const POSITIONS = ["top", "right", "bottom", "left"];

export class SpellButton {
  constructor(el, { onInspect, onInvoke, onChargeStart, onChargeProgress, onChargeCancel }) {
    this.el = el;
    this.face = el.querySelector(".spell-button__face");
    this.ripple = el.querySelector(".spell-button__ripple");
    this.element = el.dataset.element;
    this.position = POSITIONS.find((p) => el.classList.contains(`pos-${p}`)) || "bottom";

    this.onInspect = onInspect;
    this.onInvoke = onInvoke;
    this.onChargeStart = onChargeStart || (() => {});
    this.onChargeProgress = onChargeProgress || (() => {});
    this.onChargeCancel = onChargeCancel || (() => {});

    this._bindHover();
    this._bindPress();
  }

  /* ---------- cursor tilt (mouse only) ---------- */

  _bindHover() {
    this.el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const rect = this.el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      this.face.style.setProperty("--tilt-x", `${px * 20}deg`);
      this.face.style.setProperty("--tilt-y", `${-py * 20}deg`);
    });

    this.el.addEventListener("pointerleave", () => {
      this.face.style.setProperty("--tilt-x", "0deg");
      this.face.style.setProperty("--tilt-y", "0deg");
    });
  }

  /* ---------- tap = inspect, hold = invoke ---------- */

  _bindPress() {
    this.longPress = new LongPress(this.el, {
      threshold: CHARGE_THRESHOLD,

      onStart: () => {
        // A discharge timer still pending from a previous cast would otherwise
        // fire mid-charge and wipe the press/charge visuals. Clear it first.
        this._clearDischargeTimer();
        this.el.classList.remove("is-discharging");
        this.face.classList.remove("is-releasing");
        this.el.classList.add("is-pressed", "is-charging");
        this.setCharge(0);
        this.onChargeStart(this.element, this.position);
      },

      onProgress: (t, x, y) => {
        this.setContactPoint(x, y);
        this.setCharge(t);
        this.onChargeProgress(this.element, t, x, y);
      },

      onCancel: () => {
        this._endPressVisuals();
        this.onChargeCancel(this.element);
      },

      onTap: (x, y) => {
        this._endPressVisuals();
        this.onChargeCancel(this.element);
        this.setContactPoint(x, y);
        this.fireRipple();
        hapticLight(); // no-op on plain web
        this.onInspect(this.element, x, y, this.position);
      },

      onComplete: (x, y) => {
        this.el.classList.remove("is-charging");
        this.el.classList.add("is-discharging");
        this.setCharge(1);
        this.fireRipple();
        hapticMedium(); // no-op on plain web
        this.onInvoke(this.element, x, y, this.position);

        // let the discharge flourish read, then settle
        this._clearDischargeTimer();
        this._dischargeTimer = window.setTimeout(() => {
          this._dischargeTimer = null;
          this.el.classList.remove("is-discharging");
          this._endPressVisuals();
        }, DISCHARGE_MS);
      },
    });

    // The rebound is fill-mode:both, so the class must be dropped once the
    // animation ends or the face stays pinned to its final frame.
    this._onRebindEnd = (e) => {
      if (e.animationName === "button-rebound") this.face.classList.remove("is-releasing");
    };
    this.face.addEventListener("animationend", this._onRebindEnd);
  }

  _clearDischargeTimer() {
    if (this._dischargeTimer) {
      window.clearTimeout(this._dischargeTimer);
      this._dischargeTimer = null;
    }
  }

  _endPressVisuals() {
    this.el.classList.remove("is-pressed", "is-charging");
    this.face.classList.add("is-releasing");
    this.setCharge(0);
  }

  /** Cancel any in-flight hold from outside (e.g. another element taking over). */
  cancelCharge() {
    this.longPress.cancel();
  }

  destroy() {
    this._clearDischargeTimer();
    this.longPress.destroy();
    this.face.removeEventListener("animationend", this._onRebindEnd);
  }

  /* ---------- visual plumbing ---------- */

  setContactPoint(clientX, clientY) {
    const rect = this.el.getBoundingClientRect();
    const px = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const py = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    this.face.style.setProperty("--px", `${px}%`);
    this.face.style.setProperty("--py", `${py}%`);
  }

  setCharge(t) {
    this.face.style.setProperty("--charge", t.toFixed(3));
  }

  fireRipple() {
    if (!this.ripple) return;
    this.ripple.classList.remove("is-active");
    void this.ripple.offsetWidth; // reflow so the animation can retrigger
    this.ripple.classList.add("is-active");
  }

  setGlyph(svg) {
    const glyphEl = this.el.querySelector(".spell-button__glyph");
    if (glyphEl) glyphEl.innerHTML = svg;
  }

  setColors(color, colorSoft) {
    this.el.style.setProperty("--btn-color", color);
    this.el.style.setProperty("--btn-color-soft", colorSoft);
  }

  setActive(isActive) {
    this.el.classList.toggle("is-active", isActive);
  }
}

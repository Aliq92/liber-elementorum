import { CHARGE_THRESHOLD, POINTER_SLOP } from "../config.js";

/**
 * Pointer/keyboard hold detection with readable charge progress.
 *
 * STATE MACHINE — one authority for the whole tap/hold decision.
 *
 *              ┌──────────────────────────── cancel / leave / pointercancel
 *              ▼                                          │
 *   idle ──pointerdown──▶ charging ──threshold──▶ invoked │
 *     ▲                      │                       │    │
 *     └───────tap────────────┘                       │    │
 *     └──────────────────────────────────────────────┴────┘
 *
 * Exactly one terminal callback per press: onTap, onCancel, or onComplete.
 *
 * Guarantees the rest of the app relies on:
 *   - onComplete fires at most once per press
 *   - the release that follows a completed hold fires nothing extra
 *   - every timer and rAF handle is cleared on any exit path
 *   - a second pointer cannot hijack an in-flight hold
 */

const STATE = {
  IDLE: "idle",
  CHARGING: "charging",
  INVOKED: "invoked",
};

export class LongPress {
  constructor(
    el,
    { threshold = CHARGE_THRESHOLD, onStart, onProgress, onCancel, onComplete, onTap } = {}
  ) {
    this.el = el;
    this.threshold = threshold;
    this.onStart = onStart || (() => {});
    this.onProgress = onProgress || (() => {});
    this.onCancel = onCancel || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onTap = onTap || (() => {});

    this.state = STATE.IDLE;
    this.startTime = 0;
    this.rafId = null;
    this.completeTimer = null;
    this.pointerId = null;
    this.lastX = 0;
    this.lastY = 0;

    this._tick = this._tick.bind(this);
    this._listeners = [];
    this._bind();
  }

  /** True while a hold is accumulating. Kept for readability at call sites. */
  get charging() {
    return this.state === STATE.CHARGING;
  }

  _on(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    this._listeners.push([target, type, handler, opts]);
  }

  _bind() {
    const el = this.el;

    this._on(el, "pointerdown", (e) => {
      if (e.button !== undefined && e.button !== 0) return; // primary button only
      // A second pointer must not hijack an in-flight hold.
      if (this.state !== STATE.IDLE) return;

      e.preventDefault(); // suppress text selection / native drag
      el.focus({ preventScroll: true }); // preventDefault would otherwise skip focus

      this._begin(e.clientX, e.clientY, e.pointerId);

      // Only capture once we actually own the gesture.
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {
        /* capture is an optimisation, not a requirement */
      }
    });

    this._on(el, "pointermove", (e) => {
      if (!this.charging || e.pointerId !== this.pointerId) return;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (this._isFarOutside(e.clientX, e.clientY)) this.cancel();
    });

    this._on(el, "pointerup", (e) => {
      if (e.pointerId !== this.pointerId) return;
      this._release(e.clientX, e.clientY);
    });

    this._on(el, "pointercancel", (e) => {
      if (e.pointerId !== this.pointerId) return;
      this.cancel();
    });

    // Belt and braces alongside the slop check: if the pointer leaves the
    // element without capture being active, abandon the hold.
    this._on(el, "pointerleave", (e) => {
      if (!this.charging || e.pointerId !== this.pointerId) return;
      this.cancel();
    });

    this._on(el, "lostpointercapture", () => {
      if (this.charging) this.cancel();
    });

    this._on(el, "contextmenu", (e) => e.preventDefault());
    this._on(el, "dragstart", (e) => e.preventDefault());

    // Keyboard parity: tap Enter/Space to inspect, hold to invoke.
    this._on(el, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      if (e.repeat) return; // auto-repeat must not restart the hold
      if (this.state !== STATE.IDLE) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      this._begin(r.left + r.width / 2, r.top + r.height / 2, "keyboard");
    });

    this._on(el, "keyup", (e) => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      if (this.pointerId !== "keyboard") return;
      this._release(this.lastX, this.lastY);
    });

    this._on(el, "blur", () => this.cancel());
  }

  _isFarOutside(x, y) {
    const r = this.el.getBoundingClientRect();
    return (
      x < r.left - POINTER_SLOP ||
      x > r.right + POINTER_SLOP ||
      y < r.top - POINTER_SLOP ||
      y > r.bottom + POINTER_SLOP
    );
  }

  _begin(x, y, pointerId) {
    if (this.state !== STATE.IDLE) return;
    this.state = STATE.CHARGING;
    this.pointerId = pointerId;
    this.startTime = performance.now();
    this.lastX = x;
    this.lastY = y;
    this.onStart();

    // Completion is timer-driven, NOT rAF-driven: rAF is throttled or paused
    // outright in background/non-compositing tabs, which would make a
    // legitimate hold silently never fire. rAF only paints progress.
    this.completeTimer = window.setTimeout(() => this._complete(), this.threshold);
    this.rafId = requestAnimationFrame(this._tick);
  }

  _tick(now) {
    if (!this.charging) return;
    const t = Math.min(1, (now - this.startTime) / this.threshold);
    this.onProgress(t, this.lastX, this.lastY);
    this.rafId = requestAnimationFrame(this._tick);
  }

  _complete() {
    if (this.state !== STATE.CHARGING) return;
    this.state = STATE.INVOKED; // release will now be a no-op
    this._clearHandles();
    this.onComplete(this.lastX, this.lastY);
  }

  _release(x, y) {
    const state = this.state;
    if (state === STATE.IDLE) return;

    // A completed hold consumes its own release — no extra tap/click action.
    if (state === STATE.INVOKED) {
      this._reset();
      return;
    }

    this._reset();
    if (!this._isFarOutside(x, y)) this.onTap(x, y);
    else this.onCancel();
  }

  cancel() {
    if (this.state !== STATE.CHARGING) return;
    this._reset();
    this.onCancel();
  }

  _clearHandles() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.completeTimer !== null) {
      window.clearTimeout(this.completeTimer);
      this.completeTimer = null;
    }
  }

  _reset() {
    this.state = STATE.IDLE;
    this.pointerId = null;
    this._clearHandles();
  }

  /** Full teardown — timers, rAF and every listener this instance attached. */
  destroy() {
    this._reset();
    this._listeners.forEach(([target, type, handler, opts]) =>
      target.removeEventListener(type, handler, opts)
    );
    this._listeners = [];
  }
}

import { ArcaneInterface } from "./components/ArcaneInterface.js";
import { initPerformanceMode, getQualityPreference, setQualityPreference, QUALITY_CHANGE_EVENT } from "./performanceMode.js";

// Set before first paint where possible — CSS gates the expensive effects
// (backdrop-filter, background blur radius, decorative layer count) on the
// data-quality attribute this sets on <html>.
initPerformanceMode();

// ES modules are deferred: the document is already parsed when this runs, so
// no DOMContentLoaded wrapper is needed. Waiting for that event is actively
// fragile — if this script is ever loaded late (dynamic import, async), the
// event has already fired and the app would silently never boot.
const stage = document.getElementById("arcane-stage");
const ui = new ArcaneInterface(stage);

// Exposed for debugging and QA introspection (interaction state, teardown).
// Nothing in the app reads it back.
window.__arcane = ui;

/* ---------------- visual quality toggle : AUTO / FULL / PERFORMANCE ---------------- */

const QUALITY_CYCLE = ["auto", "full", "performance"];
const QUALITY_LABEL = { auto: "Auto", full: "Full", performance: "Performance" };

const qualityToggle = document.getElementById("quality-toggle");
if (qualityToggle) {
  const paint = () => {
    const pref = getQualityPreference();
    qualityToggle.dataset.pref = pref;
    qualityToggle.setAttribute("aria-label", `Visual quality: ${QUALITY_LABEL[pref]}. Tap to change.`);
    qualityToggle.querySelector(".quality-toggle__label").textContent = QUALITY_LABEL[pref][0];
  };
  qualityToggle.addEventListener("click", () => {
    const pref = getQualityPreference();
    const next = QUALITY_CYCLE[(QUALITY_CYCLE.indexOf(pref) + 1) % QUALITY_CYCLE.length];
    setQualityPreference(next);
  });
  window.addEventListener(QUALITY_CHANGE_EVENT, paint);
  paint();
}

/* ---------------- service worker : offline + installable ---------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* offline support is an enhancement, never a requirement to run */
    });
  });
}

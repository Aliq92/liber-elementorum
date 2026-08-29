/**
 * Single source of truth for the app's visual-quality tier ("full" vs
 * "performance"). Everything that needs to know — CSS (via a root data
 * attribute), ParticleLayer's particle budget, the settings toggle — reads
 * from here instead of running its own device-capability sniffing.
 *
 * AUTO heuristic deliberately avoids user-agent sniffing (unreliable, and
 * explicitly out of scope): it combines pointer coarseness, touch support,
 * viewport width, reduced-motion preference and, where available, logical
 * CPU count. Any one strong signal (touch + coarse pointer, or a native
 * Capacitor shell) is enough to tip into "performance".
 */

const STORAGE_KEY = "arcane-quality";
const EVENT = "arcane-quality-change";

function isNativeShell() {
  return (
    typeof window !== "undefined" &&
    !!window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === "function" &&
    window.Capacitor.isNativePlatform()
  );
}

function detectTier() {
  if (typeof window === "undefined" || !window.matchMedia) return "full";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  const touch = navigator.maxTouchPoints > 0;
  const narrow = window.innerWidth <= 820;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;

  if (reducedMotion) return "performance";
  if (isNativeShell()) return "performance";
  if (coarse && (touch || noHover)) return "performance";
  if (coarse && narrow && lowCores) return "performance";
  return "full";
}

/** Raw stored preference — "auto" (default), "full" or "performance". */
export function getQualityPreference() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "full" || v === "performance" || v === "auto") return v;
  } catch (_) {
    /* localStorage unavailable (private mode, etc.) — fall through to default */
  }
  return "auto";
}

export function setQualityPreference(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (_) {
    /* non-critical: quality just won't persist across reloads */
  }
  apply();
}

/** The tier actually in effect right now ("full" | "performance"). */
export function resolveQuality() {
  const pref = getQualityPreference();
  if (pref === "full" || pref === "performance") return pref;
  return detectTier();
}

function apply() {
  const quality = resolveQuality();
  document.documentElement.dataset.quality = quality;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { quality, preference: getQualityPreference() } }));
  return quality;
}

/** Boots the system: sets the root attribute and wires live re-evaluation for AUTO. */
export function initPerformanceMode() {
  apply();

  // Only matters in AUTO: a manual FULL/PERFORMANCE choice should never
  // silently change underneath the user because they rotated a tablet.
  const reevaluateIfAuto = () => {
    if (getQualityPreference() === "auto") apply();
  };

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(reevaluateIfAuto, 300);
  });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", reevaluateIfAuto);
}

export const QUALITY_CHANGE_EVENT = EVENT;

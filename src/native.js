/**
 * Thin, guarded bridge to Capacitor's native plugins (Haptics, StatusBar,
 * SplashScreen, App).
 *
 * This project deliberately has no bundler (see verify.py / README): every
 * file is loaded directly as a browser ES module, so the npm plugin packages
 * (@capacitor/haptics etc.) can't be `import`ed by bare specifier here —
 * there is no bundler to resolve "@capacitor/haptics" to a file. Instead,
 * everything below calls straight into `window.Capacitor.Plugins.*`, which
 * the native Android/iOS host injects automatically at runtime. This is
 * Capacitor's documented mechanism for exactly this no-build-step case, and
 * it means the plain web build and the native build run the *same* files
 * with zero divergence.
 *
 * On plain web, `window.Capacitor` is simply undefined, so `plugin()` always
 * returns null and every exported function below is a safe no-op. Nothing
 * here can throw into caller code — nativePlatform() APIs are optional
 * enhancement, never a requirement for the app to function.
 */

function plugin(name) {
  return typeof window !== "undefined" && window.Capacitor && window.Capacitor.Plugins
    ? window.Capacitor.Plugins[name]
    : null;
}

export function isNative() {
  return (
    typeof window !== "undefined" &&
    !!window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === "function" &&
    window.Capacitor.isNativePlatform()
  );
}

/* ---------------- haptics ---------------- */
// Deliberately sparse: light on tap, medium on a successful cast, one
// optional light pulse when the spell finishes manifesting. Nothing
// continuous during the charge itself — see config for the "why".

export function hapticLight() {
  const Haptics = plugin("Haptics");
  if (!Haptics) return;
  Haptics.impact({ style: "LIGHT" }).catch(() => {});
}

export function hapticMedium() {
  const Haptics = plugin("Haptics");
  if (!Haptics) return;
  Haptics.impact({ style: "MEDIUM" }).catch(() => {});
}

/* ---------------- status bar ---------------- */

export async function initStatusBar() {
  const StatusBar = plugin("StatusBar");
  if (!StatusBar) return;
  try {
    // Capacitor's naming is the opposite of what it sounds like: Style.Dark
    // ("DARK") means *light* text/icons, meant for a dark background — which
    // is what we want. Verified against @capacitor/status-bar's own
    // definitions.js rather than assumed.
    await StatusBar.setStyle({ style: "DARK" });
    await StatusBar.setBackgroundColor({ color: "#05040c" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (_) {
    /* non-critical cosmetic setup */
  }
}

/* ---------------- splash screen ---------------- */

export function hideSplash() {
  const SplashScreen = plugin("SplashScreen");
  if (!SplashScreen) return;
  SplashScreen.hide().catch(() => {});
}

/* ---------------- app lifecycle ---------------- */

/** Returns an unsubscribe function; a no-op unsubscribe on plain web. */
export function onAppStateChange(handler) {
  const App = plugin("App");
  if (!App) return () => {};
  const pending = App.addListener("appStateChange", handler);
  return () => pending.then((l) => l.remove()).catch(() => {});
}

/** Android hardware/gesture back button. No-op registration on plain web. */
export function onBackButton(handler) {
  const App = plugin("App");
  if (!App) return () => {};
  const pending = App.addListener("backButton", handler);
  return () => pending.then((l) => l.remove()).catch(() => {});
}

export function exitApp() {
  const App = plugin("App");
  if (!App) return;
  App.exitApp();
}

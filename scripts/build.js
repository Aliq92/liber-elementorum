#!/usr/bin/env node
/**
 * "Build" for Arcane Interface.
 *
 * There is no bundler here (see verify.py) — the app is plain ES modules and
 * the files on disk are already the deployable artifact. This script's only
 * job is to stage a clean copy of exactly those files into www/, which is
 * the conventional directory Capacitor expects as `webDir`. It does not
 * transform, minify, or bundle anything.
 *
 *   node scripts/build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "www");

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

rimraf(OUT);
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, "index.html"), path.join(OUT, "index.html"));
copyDir(path.join(ROOT, "src"), path.join(OUT, "src"));

// index.html links to these (manifest + apple-touch-icon) — staged so the
// WebView doesn't 404 on them. sw.js is deliberately NOT staged: a service
// worker has no useful role inside a WebView that already ships every asset
// locally, and registering one there risks the native shell getting stuck
// on a cached build during future development. main.js only registers it
// when `serviceWorker` is present, which is harmless either way.
fs.copyFileSync(path.join(ROOT, "manifest.webmanifest"), path.join(OUT, "manifest.webmanifest"));
copyDir(path.join(ROOT, "icons"), path.join(OUT, "icons"));

let fileCount = 0;
(function count(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count(path.join(dir, entry.name));
    else fileCount++;
  }
})(OUT);

console.log(`Staged ${fileCount} files into ${path.relative(ROOT, OUT)}/`);

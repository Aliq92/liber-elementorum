#!/usr/bin/env python3
"""
Static integrity check for Arcane Interface.

There is no bundler in this project (no Node toolchain): the files on disk ARE
the production artifact. This stands in for a build step by proving the thing
a bundler would catch — that every reference actually resolves.

Checks:
  * every <script src> / <link href> in index.html exists
  * every ES import specifier in every .js file resolves to a real file
  * every url(...) in every .css file resolves (http(s) and data: are skipped)
  * no file imports itself; no import points outside the project

    python verify.py        # exit 0 = clean, 1 = problems found
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

HTML_REF = re.compile(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']')
JS_IMPORT = re.compile(r'(?:^|\s)(?:import|export)[^\'"]*?from\s*["\']([^"\']+)["\']|import\s*\(\s*["\']([^"\']+)["\']\s*\)')
CSS_URL = re.compile(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)')

SKIP_SCHEMES = ("http://", "https://", "data:", "//", "mailto:", "#")


def rel(path):
    return os.path.relpath(path, ROOT).replace("\\", "/")


# Directories that aren't the source tree: vendored deps, generated build
# output (www/ is staged by scripts/build.js, android/ by `cap add android`),
# and the one-off asset-generation tooling under icon-source/.
EXCLUDE_DIRS = {".git", "node_modules", "__pycache__", "www", "android", "icon-source"}


def walk(exts):
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if fn.endswith(exts):
                yield os.path.join(dirpath, fn)


def check_ref(src_file, spec, problems, kind):
    if spec.startswith(SKIP_SCHEMES):
        return
    spec = spec.split("?")[0].split("#")[0]
    if not spec:
        return
    base = ROOT if spec.startswith("/") else os.path.dirname(src_file)
    target = os.path.normpath(os.path.join(base, spec.lstrip("/")))

    if not target.startswith(ROOT):
        problems.append(f"{rel(src_file)}: {kind} escapes project root -> {spec}")
        return
    if not os.path.isfile(target):
        problems.append(f"{rel(src_file)}: {kind} not found -> {spec}")
        return
    if os.path.abspath(target) == os.path.abspath(src_file):
        problems.append(f"{rel(src_file)}: {kind} imports itself")


def main():
    problems = []
    counts = {"html": 0, "js": 0, "css": 0}

    index = os.path.join(ROOT, "index.html")
    if not os.path.isfile(index):
        print("FAIL: index.html missing")
        return 1

    with open(index, encoding="utf-8") as fh:
        html = fh.read()
    for spec in HTML_REF.findall(html):
        counts["html"] += 1
        check_ref(index, spec, problems, "html ref")

    for js in walk((".js",)):
        with open(js, encoding="utf-8") as fh:
            body = fh.read()
        for a, b in JS_IMPORT.findall(body):
            spec = a or b
            if not spec:
                continue
            counts["js"] += 1
            # bare specifiers would need a bundler/import-map; we ship none
            if not spec.startswith((".", "/")) and not spec.startswith(SKIP_SCHEMES):
                problems.append(f"{rel(js)}: bare import specifier '{spec}' (no bundler present)")
                continue
            check_ref(js, spec, problems, "import")

    for css in walk((".css",)):
        with open(css, encoding="utf-8") as fh:
            body = fh.read()
        for spec in CSS_URL.findall(body):
            counts["css"] += 1
            check_ref(css, spec, problems, "css url")

    print(f"checked: {counts['html']} html refs, {counts['js']} imports, {counts['css']} css urls")
    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print("  - " + p)
        return 1
    print("OK: all references resolve")
    return 0


if __name__ == "__main__":
    sys.exit(main())

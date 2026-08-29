/**
 * Shuffle-bag rotation for the invocation archive.
 *
 * Each element keeps its own independent shuffled order: every record in the
 * pool is served exactly once before any repeat, then the bag reshuffles —
 * checked so the reshuffle's first pick is never the same record the
 * previous cycle just ended on. State persists in localStorage so reloading
 * or reopening the installed PWA continues the same sequence rather than
 * restarting it.
 */

const STORAGE_KEY = "arcane-rotation-v1";

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    /* rotation still works in-memory for this session even if persistence fails */
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Fresh shuffled order, with the boundary check: a new cycle must not open on `avoidFirst`. */
function freshOrder(ids, avoidFirst) {
  const order = shuffle(ids);
  if (avoidFirst != null && order.length > 1 && order[0] === avoidFirst) {
    const j = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[j]] = [order[j], order[0]];
  }
  return order;
}

function poolSignature(pool) {
  return pool.map((p) => p.id).join("|");
}

let state = loadState();

/**
 * Returns the next record id for `elementId` from its shuffle-bag, advancing
 * (and persisting) the rotation. `pool` is the element's current full record
 * list — its signature is compared against any saved state so a changed
 * archive (records added/removed/reordered in a future release) safely
 * starts a fresh rotation instead of reading a stale, mismatched order.
 */
export function nextInPool(elementId, pool) {
  const ids = pool.map((p) => p.id);
  const sig = poolSignature(pool);
  let entry = state[elementId];

  const stale =
    !entry || entry.sig !== sig || !Array.isArray(entry.order) || entry.order.length !== ids.length;

  if (stale) {
    entry = { sig, order: freshOrder(ids), position: 0, lastId: entry ? entry.lastId : null };
  }

  if (entry.position >= entry.order.length) {
    entry = { sig, order: freshOrder(ids, entry.lastId), position: 0, lastId: entry.lastId };
  }

  const id = entry.order[entry.position];
  entry.position += 1;
  entry.lastId = id;

  state = { ...state, [elementId]: entry };
  saveState(state);
  return id;
}

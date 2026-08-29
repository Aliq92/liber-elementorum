import { FRAMEWORK_NOTE, DISCLAIMER } from "../data/spells.js";
import { CASTING_PHASE_MS } from "../config.js";
import { hapticLight } from "../native.js";

const ORIGIN_OFFSETS = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
};

/** Minimal escaping — archive copy is authored in-repo, but never trust a string. */
function esc(str) {
  return String(str).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function row(label, value) {
  return `<div class="spell-source__row"><dt>${label}</dt><dd>${value}</dd></div>`;
}

export class SpellDisplay {
  constructor(root, { onReturnToArchive, onReadingStart, onReadingEnd } = {}) {
    this.root = root;
    this.card = root.querySelector("#spell-card");
    this.onReturnToArchive = onReturnToArchive || (() => {});
    this.onReadingStart = onReadingStart || (() => {});
    this.onReadingEnd = onReadingEnd || (() => {});
    this._materializeTimer = null;
    this.mode = null;

    // delegated once — innerHTML is replaced on every reveal
    this.card.addEventListener("click", (e) => {
      const toggle = e.target.closest(".spell-source__toggle");
      if (toggle) {
        this._toggleSource(toggle);
        return;
      }
      if (e.target.closest(".spell-return")) this.onReturnToArchive();
    });
  }

  /** Is the source/record panel currently expanded? Used by the Android back button. */
  isRecordOpen() {
    const panel = this.card.querySelector(".spell-source__panel");
    return !!panel && !panel.hidden;
  }

  /** Close the source/record panel if open. No-op otherwise. */
  closeRecord() {
    const toggle = this.card.querySelector(".spell-source__toggle");
    if (toggle && toggle.getAttribute("aria-expanded") === "true") this._toggleSource(toggle);
  }

  /** Currently showing the deep-quiet reading phase of an invoked record? */
  isReading() {
    return this.card.classList.contains("is-reading");
  }

  _toggleSource(toggle) {
    const panel = this.card.querySelector(".spell-source__panel");
    if (!panel) return;
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.querySelector(".spell-source__toggle-text").textContent = toggle.dataset.labelBase
      ? open
        ? toggle.dataset.labelBase
        : toggle.dataset.labelOpen
      : open
      ? "View source"
      : "Hide source";
    panel.classList.toggle("is-open", !open);
    panel.hidden = open;
  }

  _setTheme(entry, originPosition) {
    this.root.style.setProperty("--active-color", entry.color || entry.themeColor);
    this.root.style.setProperty("--active-glow", entry.glow || entry.themeGlow);
    // Drives the per-element personality of the manifestation stage.
    // Deliberately NOT `data-element`: the four buttons already use that
    // attribute, and reusing it here makes `[data-element="x"]` ambiguous.
    if (entry.id) this.card.dataset.spellElement = entry.id;
    const [ox, oy] = ORIGIN_OFFSETS[originPosition] || [0, 1];
    this.card.style.setProperty("--origin-x", ox);
    this.card.style.setProperty("--origin-y", oy);
  }

  _render(html, extraClass) {
    this.card.className = `spell-display__card${extraClass ? ` ${extraClass}` : ""}`;
    this.card.innerHTML = html;
    // The card is a scroll container and keeps its offset across re-renders,
    // which would open a freshly cast spell already scrolled past its title.
    this.card.scrollTop = 0;
    this.card.classList.add("is-materializing");
    window.clearTimeout(this._materializeTimer);
    this._materializeTimer = window.setTimeout(() => {
      this.card.classList.remove("is-materializing");
    }, 900);
  }

  /**
   * CASTING → READING. The dramatic phase is deliberately short-lived: once it
   * ends the orb contracts and dims, and the card enters the deep-quiet
   * READING state — the dedicated space for actually reading the recitation,
   * distinct from both the loud casting flourish and the calmer-but-still-
   * decorated archive view. Timer is always cleared first so rapid switching
   * can't leave a card stuck in the bright casting state.
   */
  _runCastingPhase() {
    window.clearTimeout(this._castPhaseTimer);
    this.card.classList.add("is-casting-phase");
    if (this.card.classList.contains("is-reading")) {
      this.card.classList.remove("is-reading");
      this.onReadingEnd();
    }
    this._castPhaseTimer = window.setTimeout(() => {
      this._castPhaseTimer = null;
      this.card.classList.remove("is-casting-phase");
      this.card.classList.add("is-reading");
      hapticLight(); // subtle secondary pulse as the reading space settles — no-op on plain web
      this.onReadingStart();
    }, CASTING_PHASE_MS);
  }

  _clearCastingPhase() {
    window.clearTimeout(this._castPhaseTimer);
    this._castPhaseTimer = null;
    const wasReading = this.card.classList.contains("is-reading");
    this.card.classList.remove("is-casting-phase", "is-reading");
    if (wasReading) this.onReadingEnd();
  }

  /** Swap content, crossfading if something is already open. */
  _swap(renderFn) {
    if (this.root.classList.contains("is-active")) {
      this.card.classList.add("is-switching");
      window.setTimeout(() => {
        renderFn();
        this.card.classList.remove("is-switching");
      }, 180);
    } else {
      renderFn();
    }
    this.root.classList.add("is-active");
  }

  /* ---------------- archive mode (short press) ---------------- */

  showArchive(element, originPosition) {
    this.mode = "archive";
    this._setTheme(element, originPosition);
    this._clearCastingPhase(); // the archive card never casts or enters reading mode

    this._swap(() => {
      const lines = element.fragment
        .map((line, i) => `<span class="spell-line" style="--i:${i}">${esc(line)}</span>`)
        .join("");

      const primary = element.sources[0];
      const secondary = element.sources[1];
      const rows =
        row("Source", `${esc(primary.title)}<span class="spell-source__sub">${esc(primary.author)}</span>`) +
        row("Tradition", esc(primary.tradition)) +
        row("Period", esc(primary.period)) +
        row("Language", esc(primary.language)) +
        row("Element", esc(element.element)) +
        (secondary
          ? row(
              "Triplicities after",
              `${esc(secondary.title)}<span class="spell-source__sub">${esc(secondary.author)} · ${esc(secondary.period)}</span>`
            )
          : "");

      this._render(
        `
        <div class="spell-card__mark" aria-hidden="true">${esc(element.catalogMark)}</div>

        <header class="spell-header">
          <h2 class="spell-card__title">${esc(element.name)}</h2>
          <p class="spell-card__tagline">${esc(element.element)} <span aria-hidden="true">·</span> ${esc(element.qualities)}</p>
          <p class="spell-card__classification">${esc(element.classification)}</p>
        </header>

        <div class="manifest-stage manifest-stage--quiet" aria-hidden="true">
          <span class="manifest-orb"></span>
          <span class="manifest-glyph" style="color:${element.color}">${element.glyph}</span>
        </div>

        <div class="invocation-content">
          <div class="spell-card__rule" aria-hidden="true"><span></span><i>&#10022;</i><span></span></div>
          <p class="spell-card__text">${lines}</p>
        </div>

        <div class="spell-source">
          <button class="spell-source__toggle" type="button" aria-expanded="false" aria-controls="spell-source-panel">
            <span class="spell-source__bracket" aria-hidden="true">[</span>
            <span class="spell-source__toggle-text">View source</span>
            <span class="spell-source__bracket" aria-hidden="true">]</span>
          </button>
          <div class="spell-source__panel" id="spell-source-panel" hidden>
            <dl class="spell-source__grid">${rows}</dl>
            <p class="spell-source__notes">${esc(element.notes)}</p>
            <p class="spell-source__notes spell-source__notes--framework">${esc(FRAMEWORK_NOTE)}</p>
            <p class="spell-source__disclaimer">${esc(DISCLAIMER)}</p>
          </div>
        </div>

        <p class="spell-card__hint">Hold the sigil to invoke</p>
        `
      );
    });
  }

  /* ---------------- manifestation mode (long press) ---------------- */

  showSpell(spell, element, originPosition) {
    this.mode = "spell";
    this._setTheme(element, originPosition);

    this._swap(() => {
      const rows =
        row("Source", esc(spell.source)) +
        row("Reference", esc(spell.reference)) +
        (spell.recommendedContext ? row("Context", esc(spell.recommendedContext)) : "") +
        (spell.repetition ? row("Repetition", esc(spell.repetition)) : "") +
        row("Authenticity", esc(spell.authenticity));

      this._render(
        `
        <div class="spell-card__mark" aria-hidden="true">${esc(element.element)} <span>·</span> RECORD</div>

        <header class="spell-header">
          <p class="spell-card__eyebrow">${esc(element.element)}</p>
          <h2 class="spell-card__title spell-card__title--spell">${esc(spell.title)}</h2>
          <p class="spell-card__classification">${esc(spell.type)}</p>
        </header>

        <!-- Decorative only. Self-contained: its own positioning context, its
             own flow height, pointer-events:none, and it never overlaps the
             Arabic/translation below it. -->
        <div class="manifest-stage" aria-hidden="true">
          <span class="manifest-ring manifest-ring--outer"></span>
          <span class="manifest-ring manifest-ring--inner"></span>
          <span class="manifest-orb"></span>
          <span class="manifest-glyph" style="color:${element.color}">${element.glyph}</span>
        </div>

        <div class="invocation-content">
          <div class="spell-card__rule" aria-hidden="true"><span></span><i>&#10022;</i><span></span></div>
          <p class="invocation-arabic" dir="rtl" lang="ar">${esc(spell.arabic)}</p>
          <p class="invocation-transliteration">${esc(spell.transliteration)}</p>
          <p class="invocation-meaning"><span class="invocation-field__label">Meaning</span>${esc(spell.meaning)}</p>
          ${
            spell.purpose
              ? `<p class="invocation-purpose"><span class="invocation-field__label">Purpose</span>${esc(spell.purpose)}</p>`
              : ""
          }
        </div>

        <div class="spell-source">
          <button class="spell-source__toggle" type="button" aria-expanded="false"
                  aria-controls="spell-source-panel"
                  data-label-base="View record" data-label-open="Hide record">
            <span class="spell-source__bracket" aria-hidden="true">[</span>
            <span class="spell-source__toggle-text">View record</span>
            <span class="spell-source__bracket" aria-hidden="true">]</span>
          </button>
          <div class="spell-source__panel" id="spell-source-panel" hidden>
            <dl class="spell-source__grid">${rows}</dl>
            <p class="spell-source__notes">${esc(spell.notes)}</p>
            <p class="spell-source__disclaimer">${esc(DISCLAIMER)}</p>
          </div>

          <button class="spell-return" type="button">
            <span class="spell-source__bracket" aria-hidden="true">[</span>
            <span>Return to archive</span>
            <span class="spell-source__bracket" aria-hidden="true">]</span>
          </button>
        </div>
        `,
        "is-spell"
      );
      this._runCastingPhase();
    });
  }

  hide() {
    this.root.classList.remove("is-active");
    this._clearCastingPhase();
    this.mode = null;
  }
}

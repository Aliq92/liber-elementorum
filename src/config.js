/** Single source of truth for interaction timings. */

/** Hold duration before an invocation fires. Spec band: 750–850ms. */
export const CHARGE_THRESHOLD = 800;

/** How long the button's discharge flourish reads before settling. */
export const DISCHARGE_MS = 520;

/** How long the stage keeps its casting state after an invocation. */
export const CAST_FLOURISH_MS = 900;

/** Crossfade gap when swapping card content. */
export const CARD_SWAP_MS = 180;

/**
 * How long the spell card stays in its dramatic CASTING phase before settling
 * into the calmer READING phase. Spec band: 700–1400ms.
 */
export const CASTING_PHASE_MS = 1100;

/** Travel outside the control (px) that abandons a hold. */
export const POINTER_SLOP = 28;

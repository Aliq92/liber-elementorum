let ctx = null;
let muted = false;

const FREQUENCIES = {
  ignis: [220, 330, 440],
  aqua: [392, 523.25, 659.25],
  terra: [130.81, 196, 261.63],
  aeris: [587.33, 880, 1174.66],
};

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

/**
 * Rising tone while a hold charges. Sound-ready hook: it is scheduled as one
 * short ramp rather than a loop, so nothing can be left running if the hold is
 * cancelled — the charge visual is the authoritative feedback.
 */
export function chargeTone(elementId) {
  if (muted) return;
  const audioCtx = getContext();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const base = (FREQUENCIES[elementId] || FREQUENCIES.ignis)[0];

    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(base * 0.5, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.8);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  } catch (err) {
    /* audio unavailable — non-critical */
  }
}

/** Heavier confirmation on successful invocation. */
export function castTone(elementId) {
  if (muted) return;
  const audioCtx = getContext();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const freqs = FREQUENCIES[elementId] || FREQUENCIES.ignis;

    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    master.connect(audioCtx.destination);

    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq * 0.5, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.25);

      const voiceGain = audioCtx.createGain();
      voiceGain.gain.setValueAtTime(1 / (i + 1.4), now);

      osc.connect(voiceGain);
      voiceGain.connect(master);
      osc.start(now + i * 0.02);
      osc.stop(now + 1.8);
    });
  } catch (err) {
    /* audio unavailable — non-critical */
  }
}

export function chime(elementId) {
  if (muted) return;
  const audioCtx = getContext();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const freqs = FREQUENCIES[elementId] || FREQUENCIES.ignis;

    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    master.connect(audioCtx.destination);

    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const voiceGain = audioCtx.createGain();
      voiceGain.gain.setValueAtTime(1 / (i + 1.6), now);

      osc.connect(voiceGain);
      voiceGain.connect(master);
      osc.start(now + i * 0.03);
      osc.stop(now + 1.1);
    });
  } catch (err) {
    /* audio unavailable — non-critical for the demo */
  }
}

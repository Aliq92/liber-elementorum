import { QUALITY_CHANGE_EVENT } from "../performanceMode.js";

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function makeAmbient(width, height, activeColor) {
  const color = activeColor || "rgba(180, 160, 255, 0.6)";
  // depth is a cheap depth-of-field proxy: nearer motes are bigger, faster
  // and more visible; farther ones are small, slow and faint. No blur filter
  // needed, so it stays free on the canvas.
  const depth = rand(0, 1);
  const speedMul = 0.5 + depth * 1.1;
  return {
    x: rand(0, width),
    y: height + 10,
    vx: rand(-0.1, 0.1) * speedMul,
    vy: rand(-0.35, -0.15) * speedMul,
    t: 0,
    life: 0,
    maxLife: rand(6000, 11000),
    size: 0.6 + depth * 2.2,
    depth,
    color,
    update() {
      this.t += 16;
      this.x += this.vx + Math.sin(this.t * 0.001) * 0.15 * this.depth;
      this.y += this.vy;
      this.life += 16;
      this.dead = this.life > this.maxLife || this.y < -10;
    },
    draw(ctx) {
      const alpha = 1 - this.life / this.maxLife;
      ctx.globalAlpha = alpha * (0.15 + this.depth * 0.45);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  };
}

function emberParticle(x, y) {
  const hue = rand(10, 40);
  return {
    x: x + rand(-10, 10),
    y: y + rand(-10, 10),
    vx: rand(-0.6, 0.6),
    vy: rand(-2.6, -1.2),
    size: rand(1.5, 3.5),
    life: 0,
    maxLife: rand(700, 1300),
    hue,
    update() {
      this.life += 16;
      this.vy -= 0.01;
      this.x += this.vx + Math.sin(this.life * 0.02) * 0.4;
      this.y += this.vy;
      this.vx *= 0.98;
      this.dead = this.life > this.maxLife;
    },
    draw(ctx) {
      const p = this.life / this.maxLife;
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = `hsl(${this.hue} 100% ${60 - p * 20}%)`;
      ctx.shadowColor = `hsl(${this.hue} 100% 55%)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (1 - p * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  };
}

function waterParticle(x, y) {
  if (Math.random() < 0.18) {
    const maxR = rand(50, 90);
    return {
      x,
      y,
      r: 2,
      maxR,
      life: 0,
      maxLife: rand(700, 1000),
      update() {
        this.life += 16;
        this.r += 2.4;
        this.dead = this.r > this.maxR;
      },
      draw(ctx) {
        const p = this.r / this.maxR;
        ctx.globalAlpha = (1 - p) * 0.5;
        ctx.strokeStyle = "#8fe3ff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      },
    };
  }

  return {
    x: x + rand(-18, 18),
    y: y + rand(-6, 6),
    vx: rand(-0.5, 0.5),
    vy: rand(0.4, 1.6),
    size: rand(1.5, 3),
    life: 0,
    maxLife: rand(900, 1500),
    update() {
      this.life += 16;
      this.vy += 0.02;
      this.x += this.vx;
      this.y += this.vy;
      this.dead = this.life > this.maxLife;
    },
    draw(ctx) {
      const p = this.life / this.maxLife;
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = "#9fe8ff";
      ctx.shadowColor = "#29b6f6";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  };
}

function earthParticle(x, y) {
  return {
    x: x + rand(-24, 24),
    y: y + rand(-6, 10),
    vx: rand(-1.2, 1.2),
    vy: rand(-2.4, -0.8),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.2, 0.2),
    size: rand(2, 4),
    settled: false,
    grounded: y + rand(24, 60),
    color: Math.random() < 0.3 ? "#cddb9e" : "#b08d57",
    life: 0,
    maxLife: rand(1400, 2000),
    update() {
      this.life += 16;
      this.vy += 0.09;
      this.x += this.vx;
      this.y += this.vy;
      this.rot += this.vr;
      if (this.y > this.grounded && !this.settled) {
        this.settled = true;
        this.vy *= -0.3;
        this.vx *= 0.4;
      }
      this.dead = this.life > this.maxLife;
    },
    draw(ctx) {
      const p = this.life / this.maxLife;
      ctx.globalAlpha = 1 - Math.max(0, p - 0.6) / 0.4;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
      ctx.globalAlpha = 1;
    },
  };
}

function airParticle(x, y) {
  return {
    cx: x,
    cy: y,
    angle: rand(0, Math.PI * 2),
    radius: rand(6, 16),
    speed: rand(0.05, 0.09),
    rise: rand(0.3, 0.7),
    size: rand(1, 2.2),
    life: 0,
    maxLife: rand(1200, 1900),
    update() {
      this.life += 16;
      this.angle += this.speed;
      this.radius += 0.35;
      this.cy -= this.rise;
      this.dead = this.life > this.maxLife;
    },
    draw(ctx) {
      const p = this.life / this.maxLife;
      const x = this.cx + Math.cos(this.angle) * this.radius;
      const y = this.cy + Math.sin(this.angle) * this.radius * 0.6;
      ctx.globalAlpha = (1 - p) * 0.8;
      ctx.fillStyle = "#eef5ff";
      ctx.shadowColor = "#bcd4ff";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  };
}

/** Mote pulled inward toward the press point — reads as energy accumulating. */
function makeConverging(x, y, spread, color, charge) {
  const angle = rand(0, Math.PI * 2);
  const dist = rand(spread * 0.55, spread);
  return {
    cx: x,
    cy: y,
    angle,
    dist,
    speed: 0.055 + charge * 0.075,
    pull: 0.9 + charge * 1.5,
    size: rand(1, 2.1) + charge,
    life: 0,
    maxLife: rand(420, 680),
    color,
    update() {
      this.life += 16;
      this.angle += this.speed;
      this.dist -= this.pull;
      this.dead = this.life > this.maxLife || this.dist <= 1;
    },
    draw(ctx) {
      const p = this.life / this.maxLife;
      const px = this.cx + Math.cos(this.angle) * this.dist;
      const py = this.cy + Math.sin(this.angle) * this.dist;
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  };
}

/** Expanding ring on release. */
function makeShockRing(x, y, color, delay) {
  return {
    x,
    y,
    r: 4,
    life: -delay,
    maxLife: 620,
    color,
    update() {
      this.life += 16;
      if (this.life < 0) return;
      this.r += 7;
      this.dead = this.life > this.maxLife;
    },
    draw(ctx) {
      if (this.life < 0) return;
      const p = this.life / this.maxLife;
      ctx.globalAlpha = (1 - p) * 0.55;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.4 * (1 - p) + 0.4;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  };
}

const BURST_FACTORIES = {
  ignis: emberParticle,
  aqua: waterParticle,
  terra: earthParticle,
  aeris: airParticle,
};

// Desktop/full-quality budget. Performance mode runs at roughly 35-45% of
// these (within the spec's 50-70% *reduction* band) — see _applyQuality().
const MAX_PARTICLES_DESKTOP = 220;
const MAX_PARTICLES_PERFORMANCE = 90;

export class ParticleLayer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.activeColor = null;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Charging/casting temporarily quiets ambient emission so rendering
    // budget goes to the interaction the user is actively driving — see
    // setFocusMode(), called from ArcaneInterface on beginCharge/invoke.
    this.focused = false;
    this._lastAmbient = 0;
    this._lastCharge = 0;

    this._resize = this._resize.bind(this);
    this._tick = this._tick.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._onQualityChange = this._onQualityChange.bind(this);
    this._rafId = null;
    this._destroyed = false;

    this._applyQuality();
    window.addEventListener(QUALITY_CHANGE_EVENT, this._onQualityChange);

    window.addEventListener("resize", this._resize);
    document.addEventListener("visibilitychange", this._onVisibility);
    this._resize();
    if (!document.hidden) this._rafId = requestAnimationFrame(this._tick);
  }

  _applyQuality() {
    this.lowPower = document.documentElement.dataset.quality === "performance";
    this.maxParticles = this.lowPower ? MAX_PARTICLES_PERFORMANCE : MAX_PARTICLES_DESKTOP;
    // Shrink existing overflow immediately rather than waiting for natural
    // death, so switching to PERFORMANCE mid-session has an instant effect.
    if (this.particles.length > this.maxParticles) {
      this.particles.length = this.maxParticles;
    }
  }

  _onQualityChange() {
    this._applyQuality();
  }

  /** Stop/resume the render loop when the tab or app is hidden/shown. A
   * hidden canvas still burning CPU on a particle sim is pure waste, and on
   * a backgrounded PWA it drains battery for zero visible benefit. */
  _onVisibility() {
    if (document.hidden) {
      if (this._rafId !== null) cancelAnimationFrame(this._rafId);
      this._rafId = null;
    } else if (!this._destroyed && this._rafId === null) {
      // Reset timers to "now" so resuming doesn't read as a huge elapsed gap
      // and dump a burst of catch-up ambient particles in one frame.
      const now = performance.now();
      this._lastAmbient = now;
      this._lastCharge = now;
      this._rafId = requestAnimationFrame(this._tick);
    }
  }

  /** Dial ambient emission down while a charge/cast is in progress, and back
   * up once it settles. Bursts (tap/invoke) are unaffected — this only
   * throttles the continuous background drift. */
  setFocusMode(active) {
    this.focused = active;
  }

  /** Stop the render loop, drop listeners and release every particle. */
  destroy() {
    this._destroyed = true;
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
    window.removeEventListener("resize", this._resize);
    document.removeEventListener("visibilitychange", this._onVisibility);
    window.removeEventListener(QUALITY_CHANGE_EVENT, this._onQualityChange);
    this.particles.length = 0;
  }

  _resize() {
    const { innerWidth: w, innerHeight: h } = window;
    this.width = w;
    this.height = h;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setActiveElement(hexColor) {
    this.activeColor = hexColor;
  }

  burst(elementId, x, y) {
    const factory = BURST_FACTORIES[elementId] || emberParticle;
    const count = this.reducedMotion ? 8 : this.lowPower ? 10 : 26;
    const room = this.maxParticles - this.particles.length;
    for (let i = 0; i < Math.min(count, room); i++) {
      this.particles.push(factory(x, y));
    }
  }

  /**
   * Emitted continuously while a button is held. Rate and inward pull both
   * scale with charge progress, so accumulation is visible without a meter.
   */
  chargeTick(elementId, x, y, t) {
    if (this.reducedMotion) return;
    const now = performance.now();
    const floor = this.lowPower ? 65 : 30; // busiest allowed rate slows on low-power devices
    const interval = 90 - t * (90 - floor);
    if (now - this._lastCharge < interval) return;
    this._lastCharge = now;
    if (this.particles.length >= this.maxParticles) return;

    const color = this.activeColor || "#b9a6ff";
    const spread = 46 + t * 26;
    this.particles.push(makeConverging(x, y, spread, color, t));
  }

  /** Big release on successful invocation. */
  castBurst(elementId, x, y) {
    const factory = BURST_FACTORIES[elementId] || emberParticle;
    const count = this.reducedMotion ? 10 : this.lowPower ? 18 : 46;
    const room = this.maxParticles - this.particles.length;
    for (let i = 0; i < Math.min(count, room); i++) {
      this.particles.push(factory(x, y));
    }
    const color = this.activeColor || "#b9a6ff";
    for (let i = 0; i < Math.min(3, room); i++) {
      this.particles.push(makeShockRing(x, y, color, i * 90));
    }
  }

  _tick(t) {
    if (this._destroyed) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // While charging/casting, ambient drift emits far less often — rendering
    // budget belongs to the interaction, not the background. Bursts and
    // charge-converging particles (the active feedback itself) are untouched.
    const ambientInterval = this.focused ? 900 : 220;
    const ambientCeiling = Math.round(this.maxParticles * 0.7);
    if (!this.reducedMotion && t - this._lastAmbient > ambientInterval && this.particles.length < ambientCeiling) {
      this._lastAmbient = t;
      this.particles.push(makeAmbient(this.width, this.height, this.activeColor));
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.dead) {
        this.particles.splice(i, 1);
        continue;
      }
      p.draw(ctx);
    }

    this._rafId = requestAnimationFrame(this._tick);
  }
}

/**
 * Procedural sound effects — plays on user touch/click (browser-safe).
 * No external audio files needed.
 */
const SoundFX = (function () {
  let ctx = null;
  let enabled = true;
  let unlocked = false;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    const c = getCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    g.gain.value = 0.001;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.01);
    unlocked = true;
  }

  function tone(freq, duration, type = "sine", volume = 0.15, ramp = "exponential") {
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(volume, t);
    g.gain[ramp === "exponential" ? "exponentialRampToValueAtTime" : "linearRampToValueAtTime"](0.001, t + duration);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + duration + 0.05);
  }

  function noiseBurst(duration = 0.08, volume = 0.12) {
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    g.gain.value = volume;
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start();
  }

  return {
    unlock,
    setEnabled(on) {
      enabled = on;
      try {
        sessionStorage.setItem("amira-sound", on ? "1" : "0");
      } catch (_) {}
    },
    isEnabled() {
      return enabled;
    },
    loadPreference() {
      try {
        enabled = sessionStorage.getItem("amira-sound") !== "0";
      } catch (_) {}
      return enabled;
    },

    tap() {
      tone(520, 0.06, "triangle", 0.1);
    },
    tapSoft() {
      tone(380, 0.04, "sine", 0.06);
    },

    success() {
      if (!enabled) return;
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, "sine", 0.12), i * 70));
    },

    wrong() {
      tone(180, 0.15, "sawtooth", 0.08);
      setTimeout(() => tone(140, 0.2, "sawtooth", 0.06), 80);
    },

    dodge() {
      tone(300, 0.05, "square", 0.06);
      setTimeout(() => tone(250, 0.08, "square", 0.05), 40);
    },

    scanBeep() {
      tone(880, 0.05, "sine", 0.07);
    },

    scanDone() {
      tone(660, 0.1, "sine", 0.1);
      setTimeout(() => tone(990, 0.15, "sine", 0.1), 100);
    },

    powerSelect() {
      [440, 554, 659].forEach((f, i) => setTimeout(() => tone(f, 0.12, "triangle", 0.1), i * 60));
    },

    chaos() {
      if (!enabled) return;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => tone(200 + Math.random() * 400, 0.06, "square", 0.05), i * 50);
      }
    },

    alert() {
      tone(740, 0.08, "square", 0.08);
      setTimeout(() => tone(740, 0.08, "square", 0.08), 120);
    },

    typewriter() {
      tone(1200, 0.02, "square", 0.03);
    },

    confetti() {
      if (!enabled) return;
      [392, 494, 587, 698, 784].forEach((f, i) => setTimeout(() => tone(f, 0.25, "sine", 0.09), i * 90));
      setTimeout(() => noiseBurst(0.15, 0.06), 200);
    },

    dog() {
      if (!enabled) return;
      tone(180, 0.1, "triangle", 0.15);
      setTimeout(() => tone(220, 0.08, "triangle", 0.12), 60);
      setTimeout(() => noiseBurst(0.06, 0.1), 100);
    },

    birthday() {
      if (!enabled) return;
      const melody = [523, 523, 587, 523, 698, 659];
      melody.forEach((f, i) => setTimeout(() => tone(f, 0.18, "sine", 0.11), i * 160));
    },

    boot() {
      tone(440, 0.06, "sine", 0.05);
      setTimeout(() => tone(554, 0.06, "sine", 0.05), 80);
    },

    pubg() {
      if (!enabled) return;
      tone(120, 0.3, "sawtooth", 0.06);
      setTimeout(() => tone(90, 0.4, "sawtooth", 0.05), 150);
    },

    heart() {
      tone(330, 0.1, "sine", 0.1);
      setTimeout(() => tone(415, 0.15, "sine", 0.1), 100);
    },
  };
})();

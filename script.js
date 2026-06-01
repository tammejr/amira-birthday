(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  SoundFX.loadPreference();

  const noTexts = ["Nice try.", "Wrong answer detected 😭", "Princess denial rejected.", "The system knows, Amira.", "Try again — June 1 files don't lie."];
  const noStreakMsgs = [
    "",
    "",
    "Denial streak: 3. System is concerned.",
    "4 wrong answers. Even PUBG would spectate this.",
    "5 NOs. Cherry red chaos cannot be denied forever.",
    "OKAY PRINCESS we get it you're 'not soft' 😭",
  ];
  let noClickCount = 0;
  let princessMode = false;
  let confettiEngine = null;
  let afrobeatReady = false;
  let afrobeatSoundtrackOn = false;
  let musicPreloadStarted = false;
  let musicPlayQueued = false;
  let afrobeatSrcInited = false;
  let musicUserPaused = false;

  const powerResponses = {
    noodles: "Unlimited noodles unlocked. PUBG squad will never understand your carb power. Ramen aura: +999. 😭",
    shopping: "Unlimited shopping granted. Tigray to worldwide delivery — danger level now CRITICAL. Your bank account has left the chat.",
    afrobeat: "Soundtrack unlocked — plays across the whole site.",
    dogs: "100 dogs now follow you everywhere. They don't judge your PUBG bot moments. They only judge when you pretend you're not soft.",
  };

  const roastMessages = {
    not: "Investigation note: Subject AMIRA claimed 'not soft.' Contradicted by entire June 1 file. Nice try, Princess.",
    little: "'A little soft' — statistically impossible for someone who feels bad after getting angry. Try again.",
    very: "Close, but you're underselling. The correct answer involves 😭 and post-anger guilt. We know you.",
    literal: null,
  };

  const fakeToasts = [
    "SYSTEM: AMIRA birthday protocol active",
    "ALERT: Cherry red energy spike detected",
    "NOTICE: Soft heart behind firewall — access granted",
    "PUBG bot status: still iconic",
    "TikTok mass story: uploading to universe",
    "Winner winner — birthday dinner? 🍜",
    "Accent.exe loaded successfully",
  ];

  const princessCompliments = [
    "certified Princess energy",
    "soft heart detected",
    "main character from Tigray",
    "PUBG bot but make it iconic",
    "cherries red, attitude louder",
  ];

  const floatEmojis = ["😭", "❤️", "🎵", "🛍️", "☕", "🐶", "👑", "🎂"];

  // ——— Sound + touch helpers ———
  function initAudio() {
    SoundFX.unlock();
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function screenShake() {
    document.body.classList.add("screen-shake");
    setTimeout(() => document.body.classList.remove("screen-shake"), 450);
  }

  function tapRipple(x, y) {
    const layer = $("#tap-ripples");
    if (!layer) return;
    const r = document.createElement("div");
    r.className = "tap-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    layer.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }

  function maybeFloatEmoji(x, y) {
    if (Math.random() > 0.35) return;
    const layer = $("#float-emoji-layer");
    if (!layer) return;
    const el = document.createElement("span");
    el.className = "float-emoji";
    el.textContent = floatEmojis[Math.floor(Math.random() * floatEmojis.length)];
    el.style.left = `${x + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${y}px`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function playSound(soundFn = "tap") {
    initAudio();
    if (typeof SoundFX[soundFn] === "function") SoundFX[soundFn]();
  }

  function getAfrobeatEl() {
    return $("#afrobeat-player");
  }

  function showMusicDock(show) {
    $("#music-dock")?.classList.toggle("hidden", !show);
    document.body.classList.toggle("has-music-dock", show);
    if (show) $("#music-preload-pill")?.classList.add("hidden");
  }

  function initAfrobeatSrc() {
    const a = getAfrobeatEl();
    if (!a || afrobeatSrcInited) return;
    afrobeatSrcInited = true;
    const m4a = new URL("audio/afrobeat.m4a", window.location.href).href;
    const mp3 = new URL("audio/afrobeat.mp3", window.location.href).href;
    const sources = a.querySelectorAll("source");
    if (sources[0]) sources[0].src = m4a;
    if (sources[1]) sources[1].src = mp3;
    a.preload = "auto";
    a.load();
  }

  function getMusicBufferedPercent() {
    const a = getAfrobeatEl();
    if (!a || !a.duration || !isFinite(a.duration) || a.buffered.length === 0) return 0;
    try {
      const end = a.buffered.end(a.buffered.length - 1);
      return Math.min(100, Math.round((end / a.duration) * 100));
    } catch (_) {
      return 0;
    }
  }

  function isMusicReadyToPlay() {
    const a = getAfrobeatEl();
    if (!a) return false;
    if (afrobeatReady) return true;
    if (a.readyState >= 2) return true;
    if (a.readyState >= 1 && a.buffered.length > 0) return true;
    return getMusicBufferedPercent() >= 3;
  }

  function updateMusicLoadUI() {
    const pct = getMusicBufferedPercent();
    const pill = $("#music-preload-pill");
    const pillText = $("#music-pill-text");

    if (isMusicReadyToPlay()) afrobeatReady = true;

    if (!afrobeatReady && musicPreloadStarted && !afrobeatSoundtrackOn) {
      pill?.classList.remove("hidden");
      if (pillText) pillText.textContent = pct > 0 ? `Loading ${pct}%` : "Loading song…";
    } else {
      pill?.classList.add("hidden");
    }
  }

  function showPage4Music(show) {
    $("#page4-music")?.classList.toggle("hidden", !show);
  }

  function setMusicPlayButtonLabel(text) {
    const btn = $("#btn-start-music");
    if (btn) btn.textContent = text;
  }

  function setPauseButtonLabels(label) {
    const text = label || "Pause";
    const pauseBtns = [$("#btn-pause-music"), $("#btn-pause-music-dock")];
    pauseBtns.forEach((btn) => {
      if (btn) btn.textContent = text;
    });
  }

  function setMusicPlayingUI() {
    musicUserPaused = false;
    $("#btn-start-music")?.classList.add("hidden");
    $("#music-controls-row")?.classList.remove("hidden");
    $("#power-afrobeat")?.classList.add("playing");
    setPauseButtonLabels("Pause");
    setMusicPlayButtonLabel("Play");
    showMusicDock(true);
    const s = $("#music-status");
    if (s) s.textContent = "Now playing";
  }

  function setMusicPausedUI() {
    $("#btn-start-music")?.classList.add("hidden");
    $("#music-controls-row")?.classList.remove("hidden");
    $("#power-afrobeat")?.classList.remove("playing");
    setPauseButtonLabels("Resume");
    showMusicDock(true);
    const s = $("#music-status");
    if (s) s.textContent = "Paused";
  }

  function setMusicStoppedUI() {
    musicUserPaused = false;
    $("#btn-start-music")?.classList.remove("hidden");
    $("#music-controls-row")?.classList.add("hidden");
    $("#power-afrobeat")?.classList.remove("playing");
    setPauseButtonLabels("Pause");
    setMusicPlayButtonLabel("Play");
    showMusicDock(false);
  }

  function bindMusicBtn(el, handler) {
    el?.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      playSound("tap");
      handler(e);
    });
  }

  function startEarlyMusicPreload() {
    if (musicPreloadStarted) return;
    musicPreloadStarted = true;
    initAfrobeatSrc();
    preloadAfrobeat();
    updateMusicLoadUI();
  }

  function preloadAfrobeat() {
    startEarlyMusicPreload();
    const a = getAfrobeatEl();
    if (!a) return;
    a.volume = 1;
  }

  function afrobeatErrorMessage() {
    const a = getAfrobeatEl();
    const code = a?.error?.code;
    if (code === 4) return "File not found — add audio/afrobeat.m4a or afrobeat.mp3";
    if (code === 3) return "Wrong format — rename your file to afrobeat.m4a (see README) or convert to MP3";
    if (code === 2) return "Music file didn't load — check audio/afrobeat.m4a is on the site";
    return "Music didn't load — tap Play again";
  }

  function beginAfrobeatPlayback(a) {
    afrobeatSoundtrackOn = true;
    musicPlayQueued = false;
    musicUserPaused = false;
    a.volume = 1;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        setMusicPlayingUI();
        showFakeToast("Now playing");
      }).catch(() => {
        setMusicStoppedUI();
        showFakeToast("Tap Play again — still loading");
      });
    } else if (!a.paused) {
      setMusicPlayingUI();
    }
  }

  function resumeAfrobeat() {
    const a = getAfrobeatEl();
    if (!a || !afrobeatSoundtrackOn) return;
    musicUserPaused = false;
    a.volume = 1;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => setMusicPlayingUI()).catch(() => showFakeToast("Could not resume — tap Play"));
    } else if (!a.paused) {
      setMusicPlayingUI();
    }
  }

  function pauseAfrobeat() {
    const a = getAfrobeatEl();
    if (!a || !afrobeatSoundtrackOn) return;
    musicUserPaused = true;
    a.pause();
    setMusicPausedUI();
  }

  function toggleAfrobeatPlayback() {
    const a = getAfrobeatEl();
    if (!a || !afrobeatSoundtrackOn) return;
    if (a.paused) resumeAfrobeat();
    else pauseAfrobeat();
  }

  /** Play button — queues until buffered if needed */
  function startMusicFromTap() {
    initAudio();
    preloadAfrobeat();
    const a = getAfrobeatEl();
    if (!a) return;

    if (!SoundFX.isEnabled()) {
      showFakeToast("Unmute sound first (top right)");
      return;
    }

    if (afrobeatSoundtrackOn && a.paused && a.currentTime > 0) {
      resumeAfrobeat();
      return;
    }

    if (!isMusicReadyToPlay() && a.readyState < 2) {
      musicPlayQueued = true;
      setMusicPlayButtonLabel("Loading…");
      showFakeToast("Loading song… starts when ready");
      const onReady = () => {
        if (!musicPlayQueued) return;
        beginAfrobeatPlayback(a);
      };
      a.addEventListener("canplay", onReady, { once: true });
      a.addEventListener("loadeddata", onReady, { once: true });
      return;
    }

    beginAfrobeatPlayback(a);
  }

  function playAfrobeat() {
    showPage4Music(true);
    preloadAfrobeat();
    $("#btn-power-next")?.classList.remove("hidden");
  }

  function stopAfrobeat() {
    afrobeatSoundtrackOn = false;
    const a = getAfrobeatEl();
    if (a) {
      a.pause();
      try {
        a.currentTime = 0;
      } catch (_) {}
    }
    musicPlayQueued = false;
    setMusicStoppedUI();
    if ($("#power-afrobeat")?.classList.contains("selected")) {
      showPage4Music(true);
    } else {
      showPage4Music(false);
    }
    $("#power-afrobeat")?.classList.remove("playing");
  }

  function setupAfrobeatPlayer() {
    const a = getAfrobeatEl();
    if (!a) return;
    initAfrobeatSrc();
    startEarlyMusicPreload();

    setTimeout(() => {
      if (!afrobeatReady) {
        afrobeatReady = true;
        updateMusicLoadUI();
      }
    }, 5000);

    a.addEventListener("progress", updateMusicLoadUI);
    a.addEventListener("loadedmetadata", updateMusicLoadUI);
    a.addEventListener("canplay", () => {
      afrobeatReady = true;
      updateMusicLoadUI();
    });
    a.addEventListener("canplaythrough", () => {
      afrobeatReady = true;
      updateMusicLoadUI();
    });

    a.addEventListener("error", () => {
      showFakeToast(afrobeatErrorMessage());
    });
    a.addEventListener("ended", () => {
      setMusicStoppedUI();
      $("#power-afrobeat")?.classList.remove("playing");
    });

    bindMusicBtn($("#btn-start-music"), () => startMusicFromTap());
    bindMusicBtn($("#btn-pause-music"), () => toggleAfrobeatPlayback());
    bindMusicBtn($("#btn-pause-music-dock"), () => toggleAfrobeatPlayback());
    bindMusicBtn($("#btn-stop-music"), () => {
      stopAfrobeat();
      showFakeToast("Soundtrack stopped");
    });
    bindMusicBtn($("#btn-stop-music-inline"), () => {
      stopAfrobeat();
      showFakeToast("Soundtrack stopped");
    });
  }
  setupAfrobeatPlayer();
  startEarlyMusicPreload();

  // Global tap ripples + emoji on interactive elements (sounds handled per-action)
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target.closest("button, .power-card, .soft-btn, .text-link, .gallery-img-wrap");
      if (!t || t.id === "sound-toggle") return;
      tapRipple(e.clientX, e.clientY);
      if (Math.random() > 0.45) maybeFloatEmoji(e.clientX, e.clientY);
    },
    true
  );

  // Sound toggle
  const soundBtn = $("#sound-toggle");
  function updateSoundUI() {
    const on = SoundFX.isEnabled();
    soundBtn?.querySelector(".sound-on")?.classList.toggle("hidden", !on);
    soundBtn?.querySelector(".sound-off")?.classList.toggle("hidden", on);
  }
  updateSoundUI();
  soundBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    initAudio();
    const wasOn = SoundFX.isEnabled();
    SoundFX.setEnabled(!wasOn);
    updateSoundUI();
    const a = getAfrobeatEl();
    if (!SoundFX.isEnabled()) {
      pauseAfrobeat();
      if (a) a.volume = 0;
    } else {
      if (a) a.volume = 1;
      if (afrobeatSoundtrackOn && a?.paused && !musicUserPaused) {
        a.play().then(() => setMusicPlayingUI()).catch(() => {});
      }
    }
    if (SoundFX.isEnabled()) SoundFX.tap();
  });

  // Secret cake
  $("#secret-cake")?.addEventListener("click", (e) => {
    playSound("birthday");
    showFakeToast("🎂 Secret birthday chime unlocked for AMIRA");
    burstHearts(e.clientX, e.clientY);
  });

  function burstHearts(x, y) {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const el = document.createElement("span");
        el.className = "float-emoji";
        el.textContent = "❤️";
        el.style.left = `${x + (Math.random() - 0.5) * 80}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = `${1 + Math.random()}rem`;
        $("#float-emoji-layer")?.appendChild(el);
        setTimeout(() => el.remove(), 1200);
      }, i * 60);
    }
  }

  // Triple-click banner → chaos overlay
  let bannerClicks = 0;
  let bannerTimer;
  $("#official-banner")?.addEventListener("click", () => {
    bannerClicks++;
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => (bannerClicks = 0), 600);
    if (bannerClicks >= 3) {
      bannerClicks = 0;
      SoundFX.chaos();
      const overlay = $("#chaos-overlay");
      overlay?.classList.remove("hidden");
      screenShake();
      vibrate([50, 30, 50]);
      setTimeout(() => overlay?.classList.add("hidden"), 900);
      showFakeToast("CHERRY RED OVERLOAD — AMIRA chaos at 100%");
    }
  });

  // Princess name hover compliments
  $("#princess-name")?.addEventListener("mouseenter", (e) => {
    if (Math.random() > 0.6) return;
    const pop = document.createElement("div");
    pop.className = "princess-pop";
    pop.textContent = princessCompliments[Math.floor(Math.random() * princessCompliments.length)];
    pop.style.left = `${e.clientX}px`;
    pop.style.top = `${e.clientY - 30}px`;
    document.body.appendChild(pop);
    SoundFX.tapSoft();
    setTimeout(() => pop.remove(), 1500);
  });

  // Konami-style: A M I R A keys
  const secretKeys = [];
  const code = ["a", "m", "i", "r", "a"];
  document.addEventListener("keydown", (e) => {
    secretKeys.push(e.key.toLowerCase());
    if (secretKeys.length > 5) secretKeys.shift();
    if (secretKeys.join("") === code.join("")) {
      secretKeys.length = 0;
      princessMode = true;
      $("#princess-mode-banner")?.classList.remove("hidden");
      SoundFX.success();
      showFakeToast("👑 PRINCESS MODE — type P for PUBG drop sound");
      vibrate([100, 50, 100]);
    }
    if (e.key.toLowerCase() === "p" && princessMode) {
      SoundFX.pubg();
      showFakeToast("Winner winner — Princess dinner 🍗 (bot placement: iconic)");
      screenShake();
    }
  });

  // Boot → Page 1 (start loading music early while she reads/plays)
  setTimeout(() => {
    SoundFX.boot();
    startEarlyMusicPreload();
    $("#boot-screen").classList.add("fade-out");
    showPage("page-1");
    setTimeout(() => $("#boot-screen").remove(), 900);
  }, 4500);

  function showPage(id, playSoundOnNav = true) {
    $$(".page").forEach((p) => p.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("active");
      if (id === "page-2") runScan();
      if (id === "page-4") preloadAfrobeat();
      if (id === "page-5") revealGallery();
      if (id === "page-final") runFinale();
    }
    if (playSoundOnNav && id !== "page-1") SoundFX.alert();
  }

  // Page 1
  $("#btn-continue")?.addEventListener("click", (e) => {
    playSound("alert");
    $("#verify-panel").classList.add("show");
    $("#btn-continue").classList.add("hidden");
    showFakeToast("VERIFICATION STEP 2 — Identity check for AMIRA");
  });

  $("#btn-yes")?.addEventListener("click", (e) => {
    playSound("success");
    vibrate([80, 40, 80]);
    showFakeToast("Identity confirmed: Princess ✓");
    setTimeout(() => showPage("page-2"), 600);
  });

  $("#btn-no")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    noClickCount++;
    btn.textContent = noTexts[(noClickCount - 1) % noTexts.length];
    const dx = (Math.random() - 0.5) * 80;
    const dy = (Math.random() - 0.5) * 40;
    btn.style.setProperty("--dx", `${dx}px`);
    btn.style.setProperty("--dy", `${dy}px`);
    btn.classList.add("dodge");
    setTimeout(() => btn.classList.remove("dodge"), 200);
    playSound("dodge");
    screenShake();
    const streak = $("#no-streak-msg");
    if (streak && noStreakMsgs[noClickCount]) {
      streak.textContent = noStreakMsgs[noClickCount];
      streak.classList.remove("hidden");
    }
  });

  // Page 2 scan
  function runScan() {
    const bar = $("#scan-bar");
    const results = $$("#scan-results li");
    const nextBtn = $("#btn-scan-next");
    if (!bar) return;

    let progress = 0;
    let lastBeep = 0;
    const interval = setInterval(() => {
      progress += 2;
      bar.style.width = `${Math.min(progress, 100)}%`;
      if (progress % 20 === 0 && progress !== lastBeep) {
        SoundFX.tapSoft();
        lastBeep = progress;
      }
      if (progress >= 100) {
        clearInterval(interval);
        SoundFX.scanDone();
        results.forEach((li, i) => {
          setTimeout(() => {
            li.classList.add("show");
            SoundFX.scanBeep();
          }, i * 350);
        });
        setTimeout(() => nextBtn?.classList.remove("hidden"), results.length * 350 + 400);
      }
    }, 40);
  }

  $("#btn-scan-next")?.addEventListener("click", (e) => {
    playSound("success");
    showPage("page-3");
  });

  // Page 3 café
  let chaosMode = false;
  $("#toggle-chaos")?.addEventListener("click", (e) => {
    chaosMode = !chaosMode;
    const scene = $("#cafe-scene");
    $("#cafe-chaos")?.classList.toggle("hidden", !chaosMode);
    $("#cafe-students-chaos")?.classList.toggle("hidden", !chaosMode);
    $(".cafe-students.calm")?.classList.toggle("hidden", chaosMode);
    scene?.classList.toggle("chaos-mode", chaosMode);
    $("#toggle-chaos").textContent = chaosMode ? "back to calm café energy" : "absolute chaotic student energy";
    scene?.classList.toggle("chaos-shake", chaosMode);
    if (chaosMode) {
      playSound("chaos");
      screenShake();
      showFakeToast("CHAOTIC STUDENT ENERGY DEPLOYED 😭");
    } else playSound("tap");
  });

  $("#btn-cafe-next")?.addEventListener("click", (e) => {
    playSound("success");
    showPage("page-4");
  });

  // Page 4 powers
  $$(".power-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      $$(".power-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      card.classList.add("pop");
      setTimeout(() => card.classList.remove("pop"), 400);
      const key = card.dataset.power;
      const box = $("#power-response");
      if (box) {
        box.textContent = powerResponses[key] || "";
        box.classList.remove("hidden");
      }
      $("#btn-power-next")?.classList.remove("hidden");
      vibrate(50);
      if (key === "afrobeat") {
        if (box) box.classList.add("hidden");
        playAfrobeat();
        setTimeout(() => playSound("powerSelect"), 80);
        return;
      } else {
        box?.classList.remove("hidden");
        stopAfrobeat();
        showPage4Music(false);
        playSound("powerSelect");
        showFakeToast(`Birthday power assigned to AMIRA: ${key}`);
      }
      if (key === "dogs") setTimeout(() => playSound("dog"), 300);
    });
  });

  $("#btn-power-next")?.addEventListener("click", (e) => {
    playSound("success");
    showPage("page-5");
  });

  function revealGallery() {
    setTimeout(() => {
      $$(".gallery-card").forEach((c, i) => {
        setTimeout(() => {
          c.classList.add("show");
          SoundFX.scanBeep();
          c.classList.add("shimmer");
        }, i * 400);
      });
    }, 200);
  }

  $$(".gallery-img-wrap").forEach((wrap) => {
    wrap.addEventListener("click", (e) => {
      playSound("heart");
      showFakeToast("Evidence accepted. Amira remains dangerous.");
    });
  });

  $("#btn-gallery-next")?.addEventListener("click", (e) => {
    playSound("success");
    showPage("page-6");
  });

  // Page 6 soft question
  let answered = false;
  $$(".soft-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const answer = btn.dataset.answer;
      const roast = $("#roast-msg");
      if (answer === "literal") {
        if (answered) return;
        answered = true;
        btn.classList.add("correct-pick");
        roast?.classList.add("hidden");
        SoundFX.success();
        burstHearts(e.clientX, e.clientY);
        vibrate([60, 30, 60, 30, 100]);
        showFakeToast("CASE CLOSED — Soft heart confirmed for AMIRA-0601");
        $("#btn-question-next")?.classList.remove("hidden");
      } else {
        if (roast) {
          roast.textContent = roastMessages[answer] || "";
          roast.classList.remove("hidden");
        }
        SoundFX.wrong();
        screenShake();
        btn.style.animation = "shake 0.4s ease";
        setTimeout(() => (btn.style.animation = ""), 400);
      }
    });
  });

  $("#btn-question-next")?.addEventListener("click", (e) => {
    playSound("success");
    showPage("page-timeline");
  });

  // Timeline
  $("#btn-june-secret")?.addEventListener("click", (e) => {
    const el = $("#june-secret-text");
    if (el) {
      el.textContent =
        'Because on June 1, the universe decided: "let\'s create someone who feels like a quiet café one week and pure student chaos the next — from Tigray, with cherry red energy and a heart that pretends it doesn\'t care." 😭';
      el.classList.remove("hidden");
    }
    playSound("heart");
  });

  $("#btn-timeline-next")?.addEventListener("click", () => {
    playSound("success");
    showPage("page-final");
  });

  // Finale typewriter + confetti
  function runFinale() {
    const lines = [
      "You answered all questions successfully.",
      "Reward unlocked.",
      "Decrypting birthday message for AMIRA…",
      "June 1 · Status: LEGENDARY",
    ];
    const block = $("#typewriter-block");
    let lineIdx = 0;
    let charIdx = 0;

    function typeLine() {
      if (lineIdx >= lines.length) {
        setTimeout(() => {
          $("#final-message")?.classList.remove("hidden");
          $("#btn-confetti-toggle")?.classList.remove("hidden");
          initBirthdayVideo();
          SoundFX.confetti();
          SoundFX.birthday();
          vibrate([100, 50, 100, 50, 200]);
          startCelebration();
        }, 500);
        return;
      }
      const line = lines[lineIdx];
      if (charIdx <= line.length) {
        const display = lines.slice(0, lineIdx).join("\n") + (lineIdx ? "\n" : "") + line.slice(0, charIdx);
        if (block) block.textContent = display + (charIdx < line.length ? "▌" : "");
        if (charIdx > 0 && charIdx <= line.length) SoundFX.typewriter();
        charIdx++;
        setTimeout(typeLine, charIdx <= line.length ? 35 : 400);
        if (charIdx > line.length) {
          lineIdx++;
          charIdx = 0;
        }
      }
    }
    typeLine();
  }

  // AMIRA.exe modal
  $("#amira-exe")?.addEventListener("click", (e) => {
    playSound("alert");
    $("#amira-modal")?.classList.remove("hidden");
  });
  $(".modal-close")?.addEventListener("click", () => {
    SoundFX.tap();
    $("#amira-modal")?.classList.add("hidden");
  });
  $("#amira-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "amira-modal") $("#amira-modal")?.classList.add("hidden");
  });

  // Dog surprise
  const dogMessages = [
    "🐶 WOOF — Amira's hidden soft mode activated",
    "🐶 This dog saw you mass-post on TikTok and still loves you",
    "🐶 100 dogs would follow Princess anywhere. Fact.",
    "🐶 PUBG bot? This dog says you're MVP.",
    "🐶 Tap again — the dogs are judging your shopping cart",
  ];
  let dogClicks = 0;
  $("#dog-surprise")?.addEventListener("click", (e) => {
    playSound("dog");
    vibrate([30, 20, 30]);
    const toast = $("#dog-toast");
    if (toast) {
      toast.textContent = dogMessages[dogClicks % dogMessages.length];
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 2800);
    }
    dogClicks++;
  });

  // Fake toasts
  let toastTimer;
  function showFakeToast(msg) {
    const t = $("#fake-toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), 3200);
  }

  setInterval(() => {
    if (Math.random() > 0.92 && $(".page.active")) {
      showFakeToast(fakeToasts[Math.floor(Math.random() * fakeToasts.length)]);
      if (Math.random() > 0.7) SoundFX.tapSoft();
    }
  }, 12000);

  // Cursor sparkles
  const sparkleContainer = $("#cursor-sparkles");
  document.addEventListener("mousemove", (e) => {
    if (Math.random() > 0.65) return;
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    sparkleContainer?.appendChild(s);
    setTimeout(() => s.remove(), 800);
  });

  // First touch anywhere unlocks audio (mobile)
  document.addEventListener(
    "touchstart",
    () => {
      initAudio();
      preloadAfrobeat();
    },
    { once: true, passive: true }
  );
  document.addEventListener(
    "click",
    () => {
      initAudio();
      startEarlyMusicPreload();
    },
    { once: true }
  );

  // Floating particles
  const canvas = $("#particles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const count = princessMode ? 60 : 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.4 + 0.1,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 30, 58, ${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // Birthday video
  function initBirthdayVideo() {
    const video = $("#birthday-video");
    const missing = $("#video-missing");
    const wrap = video?.closest(".video-wrap");
    if (!video) return;
    video.addEventListener(
      "error",
      () => {
        wrap?.classList.add("is-missing");
        missing?.classList.remove("hidden");
      },
      { once: true }
    );
    video.addEventListener("loadeddata", () => {
      missing?.classList.add("hidden");
      wrap?.classList.remove("is-missing");
    });
    if (video.readyState >= 2) missing?.classList.add("hidden");
    else if (video.error) {
      wrap?.classList.add("is-missing");
      missing?.classList.remove("hidden");
    }
  }

  // Save birthday card to gallery (PNG download)
  function generateBirthdayCard() {
    const w = 1080;
    const h = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1a0a0e");
    grad.addColorStop(0.5, "#0a0a0b");
    grad.addColorStop(1, "#140810");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(196, 30, 58, ${Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(196, 30, 58, 0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    ctx.textAlign = "center";
    ctx.fillStyle = "#e82a4f";
    ctx.font = "600 28px Outfit, sans-serif";
    ctx.fillText("JUNE 1 · BIRTHDAY FILE", w / 2, 140);

    ctx.fillStyle = "#f5ebe0";
    ctx.font = "italic 72px Georgia, serif";
    ctx.fillText("Happy Birthday", w / 2, 280);

    ctx.fillStyle = "#e82a4f";
    ctx.font = "bold 96px Georgia, serif";
    ctx.fillText("Amira", w / 2, 400);
    ctx.font = "48px serif";
    ctx.fillText("❤️", w / 2, 470);

    const cuteLines = [
      "You're my favourite chaos in human form.",
      "Soft heart, loud attitude — wouldn't change you.",
      "Long distance but you're still my person.",
      "Princess energy from Tigray forever. 👑",
    ];
    ctx.fillStyle = "#c9bdb4";
    ctx.font = "italic 36px Georgia, serif";
    let y = 580;
    cuteLines.forEach((line) => {
      ctx.fillText(line, w / 2, y);
      y += 56;
    });

    ctx.fillStyle = "rgba(232, 42, 79, 0.9)";
    ctx.font = "24px monospace";
    ctx.fillText("Cherry red chaos · Afrobeat · PUBG bot legend", w / 2, y + 60);

    ctx.fillStyle = "#9a8f88";
    ctx.font = "italic 32px Georgia, serif";
    ctx.fillText("— Nate, your long-distance bestie —", w / 2, h - 120);

    return canvas;
  }

  $("#btn-save-gallery")?.addEventListener("click", async () => {
    playSound("success");
    vibrate(80);
    const canvas = generateBirthdayCard();
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 1));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Happy-Birthday-Amira-June-1.png";
    a.click();
    URL.revokeObjectURL(url);
    $("#save-done")?.classList.remove("hidden");
    showFakeToast("Birthday card saved — check your gallery 📸");
    burstHearts(window.innerWidth / 2, window.innerHeight / 2);
  });

  // Beautiful confetti — burst then gentle ambient (doesn't awkwardly stop)
  function startCelebration() {
    const canvas = $("#confetti-canvas");
    if (!canvas) return;

    if (confettiEngine) confettiEngine.stop();
    confettiEngine = new ConfettiEngine(canvas);
    confettiEngine.start();
    canvas.classList.remove("faded");

  }

  $("#btn-confetti-toggle")?.addEventListener("click", () => {
    confettiEngine?.calmDown();
    $("#confetti-canvas")?.classList.add("faded");
    const btn = $("#btn-confetti-toggle");
    if (btn) {
      btn.textContent = "✨ Confetti resting…";
      btn.disabled = true;
    }
  });

  function ConfettiEngine(canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let raf = null;
    let mode = "burst";
    let burstEnd = 0;
    const colors = ["#c41e3a", "#e82a4f", "#f5ebe0", "#8b1529", "#ff6b8a", "#ffd700", "#ff8fab"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle(burst) {
      const w = canvas.width;
      const h = canvas.height;
      const type = Math.random() < 0.25 ? "heart" : Math.random() < 0.15 ? "star" : "rect";
      return {
        x: burst ? Math.random() * w : Math.random() * w,
        y: burst ? -20 - Math.random() * h * 0.5 : -15,
        w: Math.random() * 10 + 4,
        h: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: burst ? Math.random() * 4 + 2 : Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * (burst ? 3 : 1),
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * (burst ? 10 : 4),
        type,
        opacity: burst ? 1 : 0.35 + Math.random() * 0.35,
        sway: Math.random() * Math.PI * 2,
      };
    }

    function burst(count) {
      for (let i = 0; i < count; i++) particles.push(spawnParticle(true));
    }

    function drawHeart(x, y, size, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 10, size / 10);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(-6, -4, -12, 2, 0, 10);
      ctx.bezierCurveTo(12, 2, 6, -4, 0, 2);
      ctx.fill();
      ctx.restore();
    }

    function drawStar(x, y, r, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.4;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === "burst") {
        if (now > burstEnd) mode = "ambient";
        if (particles.length < 280 && Math.random() > 0.3) burst(8);
      } else if (mode === "ambient") {
        if (particles.length < 90 && Math.random() > 0.5) particles.push(spawnParticle(false));
      } else if (mode === "calm") {
        particles = particles.filter((p) => p.opacity > 0.02);
        particles.forEach((p) => (p.opacity *= 0.98));
      }

      particles.forEach((p) => {
        p.sway += 0.02;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.sway) * 0.3;
        p.rot += p.vr;
        if (p.y > canvas.height + 30) {
          if (mode === "ambient" || mode === "burst") {
            p.y = -20;
            p.x = Math.random() * canvas.width;
            if (mode === "ambient") {
              p.vy = Math.random() * 1.2 + 0.4;
              p.opacity = 0.25 + Math.random() * 0.3;
            }
          } else {
            p.opacity = 0;
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (p.type === "heart") drawHeart(0, 0, p.w, p.color, 1);
        else if (p.type === "star") drawStar(0, 0, p.w * 0.6, p.color, 1);
        else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = mode === "burst" ? 6 : 0;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      particles = particles.filter((p) => p.opacity > 0.01);
      raf = requestAnimationFrame(tick);
    }

    this.start = () => {
      mode = "burst";
      burstEnd = performance.now() + 10000;
      particles = [];
      burst(120);
      tick();
    };

    this.calmDown = () => {
      mode = "calm";
    };

    this.stop = () => {
      if (raf) cancelAnimationFrame(raf);
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }
})();

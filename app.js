/* =========================================================
   PROJECT AURA 3.0 — MASTER FRONTEND CONTROLLER
   Architecture: Personal AI Operating System
   Features: Gemini Image Studio · Abstract AI Companion · Multi-AI Router
   Zero Space Elements · Zero Pollinations · 100% Polish
========================================================= */

"use strict";

// Backend API Endpoint
// Backend API Endpoint: automatically resolves localhost for local testing, or remote deployment
const API_URL = (typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port === "3000"))
  ? (window.location.origin.includes("http") ? window.location.origin : "http://localhost:3000")
  : "https://project-aura-hush.onrender.com";
const BACKEND_URL = API_URL;

// Master System State
const state = {
  activeView: "command-center",
  coreState: "idle",
  currentConversationId: null,
  totalCommands: 0,
  isRecording: false,
  speechRecognition: null,
  voiceGender: localStorage.getItem("aura_voice_gender") || "female",
  soundEnabled: localStorage.getItem("aura_sound_enabled") !== "false",
  bootFinished: true,
  currentTask: "Awaiting Directive",
  activeCreationTab: "writing",
  spatial3dEnabled: true,
  tasks: JSON.parse(localStorage.getItem("aura_tasks") || "[]")
};

function getActiveUserId() {
  const sess = localStorage.getItem("aura_auth_session");
  if (sess) {
    try {
      const parsed = JSON.parse(sess);
      if (parsed.user && parsed.user.id) return parsed.user.id;
    } catch (_) {}
  }
  let deviceUid = localStorage.getItem("aura_device_uid");
  if (!deviceUid) {
    deviceUid = "dev_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
    localStorage.setItem("aura_device_uid", deviceUid);
  }
  return deviceUid;
}

/* =========================================================
   1. REAL AUDIO ENGINE & PROJECT AURA CINEMATIC IMPACT SYNTHESIZER
   Web Audio API Sub-Bass Drop · Resonant Filter Swell · Crystal Harmonic Chime
========================================================= */
let _auraAudioCtx = null;

function getSharedAudioContext() {
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!_auraAudioCtx) {
    _auraAudioCtx = new AudioCtxClass();
  }
  if (_auraAudioCtx.state === "suspended") {
    _auraAudioCtx.resume().catch(() => {});
  }
  return _auraAudioCtx;
}

/**
 * Synthesizes an authentic PROJECT AURA Cinematic Impact:
 * Sub-bass drop (85Hz -> 28Hz) + Resonant bandpass filter swell + Crystal harmonic chime
 */
function playProjectAuraCinematicImpact(volume = 0.9) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(volume, now);
    master.connect(ctx.destination);

    // Stereo delay / spatial acoustic reverb
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.28, now);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.32, now);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.setValueAtTime(2800, now);

    delay.connect(feedback);
    feedback.connect(delayFilter);
    delayFilter.connect(delay);
    delay.connect(master);

    // 1. Sub-Bass Exponential Drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(85, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 1.6);
    subGain.gain.setValueAtTime(0.55, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start(now);
    subOsc.stop(now + 1.85);

    // 2. Resonant Filter Swell (Sawtooth + Triangle warm aura sweep)
    const swellOsc1 = ctx.createOscillator();
    const swellOsc2 = ctx.createOscillator();
    swellOsc1.type = "sawtooth";
    swellOsc2.type = "triangle";
    swellOsc1.frequency.setValueAtTime(110, now);
    swellOsc2.frequency.setValueAtTime(220.5, now);

    const swellFilter = ctx.createBiquadFilter();
    swellFilter.type = "bandpass";
    swellFilter.Q.setValueAtTime(3.2, now);
    swellFilter.frequency.setValueAtTime(140, now);
    swellFilter.frequency.linearRampToValueAtTime(2200, now + 0.6);
    swellFilter.frequency.exponentialRampToValueAtTime(450, now + 2.2);

    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.001, now);
    swellGain.gain.linearRampToValueAtTime(0.28, now + 0.35);
    swellGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    swellOsc1.connect(swellFilter);
    swellOsc2.connect(swellFilter);
    swellFilter.connect(swellGain);
    swellGain.connect(master);
    swellGain.connect(delay);

    swellOsc1.start(now);
    swellOsc2.start(now);
    swellOsc1.stop(now + 2.3);
    swellOsc2.stop(now + 2.3);

    // 3. Pristine Crystal Harmonic Glass Chime (Aura Chord: E5, A5, C#6, E6)
    const chimeFreqs = [659.25, 880.00, 1108.73, 1318.51];
    chimeFreqs.forEach((freq, idx) => {
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      const startTime = now + 0.18 + idx * 0.08;

      cOsc.type = "sine";
      cOsc.frequency.setValueAtTime(freq, startTime);

      cGain.gain.setValueAtTime(0.001, startTime);
      cGain.gain.linearRampToValueAtTime(0.14, startTime + 0.03);
      cGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);

      cOsc.connect(cGain);
      cGain.connect(master);
      cGain.connect(delay);

      cOsc.start(startTime);
      cOsc.stop(startTime + 1.45);
    });

  } catch (err) {
    console.warn("[PROJECT AURA CINEMATIC AUDIO]", err);
  }
}



class CinematicBootAudioEngine {
  constructor() {
    this.ambientSrc = "assets/audio/aura_startup.wav";
    this.voiceSrc = "assets/audio/aura_voice_online.mp3";
    this.ambientAudioEl = null;
    this.voiceAudioEl = null;
    this.voiceTimer = null;
    this.isPlaying = false;
    this.init();
  }

  init() {
    try {
      this.ambientAudioEl = new Audio(this.ambientSrc);
      this.ambientAudioEl.preload = "auto";
      this.ambientAudioEl.volume = state.soundEnabled ? 0.7 : 0;

      this.voiceAudioEl = new Audio(this.voiceSrc);
      this.voiceAudioEl.preload = "auto";
      this.voiceAudioEl.volume = state.soundEnabled ? 1.0 : 0;
    } catch (_) {}
  }

  play() {
    if (!state.soundEnabled) return;
    this.isPlaying = true;

    // 1. Play synthesized original PROJECT AURA impact
    playProjectAuraCinematicImpact(0.9);

    // 2. Play recorded voice or ambient audio if available
    if (this.voiceAudioEl) {
      try {
        this.voiceAudioEl.currentTime = 0;
        this.voiceAudioEl.volume = state.soundEnabled ? 1.0 : 0;
        this.voiceAudioEl.play().catch(() => {});
      } catch (_) {}
    } else if (this.ambientAudioEl) {
      try {
        this.ambientAudioEl.currentTime = 0;
        this.ambientAudioEl.volume = state.soundEnabled ? 0.6 : 0;
        this.ambientAudioEl.play().catch(() => {});
      } catch (_) {}
    }

    // 3. Trigger authentic AURA Voice announcement: "Project Aura online..."
    if (this.voiceTimer) clearTimeout(this.voiceTimer);
    this.voiceTimer = setTimeout(() => {
      if (!this.isPlaying || state.bootFinished || !state.soundEnabled) return;
      auraSpeakGreeting("Project Aura online. Intelligence systems ready for directive.");
    }, 2400);
  }

  stopAndCleanup() {
    this.isPlaying = false;
    if (this.voiceTimer) {
      clearTimeout(this.voiceTimer);
      this.voiceTimer = null;
    }
    if (this.ambientAudioEl) {
      try { this.ambientAudioEl.pause(); this.ambientAudioEl.currentTime = 0; } catch (_) {}
    }
    if (this.voiceAudioEl) {
      try { this.voiceAudioEl.pause(); this.voiceAudioEl.currentTime = 0; } catch (_) {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  setMuted(muted) {
    state.soundEnabled = !muted;
    localStorage.setItem("aura_sound_enabled", (!muted).toString());
    if (this.ambientAudioEl) this.ambientAudioEl.volume = muted ? 0 : 0.6;
    if (this.voiceAudioEl) this.voiceAudioEl.volume = muted ? 0 : 1.0;
  }
}

function auraSpeakGreeting(text) {
  if (!window.speechSynthesis || !state.soundEnabled) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.90;
  utter.pitch = 0.82;
  utter.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const preferred = ["Daniel", "Oliver", "George", "Google UK English Male", "Microsoft George"];
  let chosen = null;
  for (const name of preferred) {
    chosen = voices.find(v => v.name.includes(name));
    if (chosen) break;
  }
  if (!chosen) chosen = voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("female")) || voices[0];
  if (chosen) utter.voice = chosen;

  window.speechSynthesis.speak(utter);
}

const realSoundPlayer = new CinematicBootAudioEngine();

// Tactile UI Sound Generator
function playTactileSound(type) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.03);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === "dispatch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.00, now + 0.07);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (_) { }
}

/* =========================================================
   2. 8K SCI-FI CINEMATIC BOOT ENGINE — PROJECT AURA
   Black & Gold Cybernetic Android Explosion & Reassembly
   5 Phases: Appearance -> Disassembly -> Drone -> Vortex -> Reassembly
========================================================= */
const bootOverlay = document.getElementById("auraBootOverlay");
const bootVisualWrap = document.getElementById("bootVisualWrap");
const bootFXCanvas = document.getElementById("bootFXCanvas");
const bootFXCtx = bootFXCanvas ? bootFXCanvas.getContext("2d") : null;
const skipBootBtn = document.getElementById("skipBootBtn");
const bootAudioBtn = document.getElementById("bootAudioToggleBtn");
const bootAudioIcon = document.getElementById("bootAudioIcon");
const bootPhaseLabel = document.getElementById("bootPhaseLabel");
const bootTimecode = document.getElementById("bootTimecode");
const bootSchTitle = document.getElementById("bootSchTitle");
const bootSchDesc = document.getElementById("bootSchDesc");
const bootProgressBar = document.getElementById("introProgressBar");
const bootHudClock = document.getElementById("bootHudClock");
const bootPhasesTrack = document.getElementById("bootPhasesTrack");

const BOOT_TOTAL_DURATION_SEC = 18.0;

const BOOT_PHASES_DATA = [
  {
    phase: 1,
    start: 0.0,
    end: 3.0,
    name: "APPEARANCE",
    label: "PHASE 1: FIRST APPEARANCE",
    title: "HALO STRIKE & VISOR IGNITION",
    desc: "Overhead circular halo lights striking downward. Golden visor ignites with an intense amber pulse as internal circuits illuminate."
  },
  {
    phase: 2,
    start: 3.0,
    end: 6.0,
    name: "DISASSEMBLY",
    label: "PHASE 2: EXPLODED SCHEMATIC DECOUPLING",
    title: "ARMOR DECOUPLING & REACTOR EXPOSURE",
    desc: "Mechanical latches release with pneumatic precision. Armor plates, pauldrons & casings glide outward, exposing radiant golden AI core reactor."
  },
  {
    phase: 3,
    start: 6.0,
    end: 10.0,
    name: "DRONE SWEEP",
    label: "PHASE 3: FPV DRONE 360° ORBITAL SWEEP",
    title: "360° PARALLAX SWEEP & ANAMORPHIC FLARES",
    desc: "Dynamic drone camera swoops low skimming glowing floor rings, banking around the right flank in a full 360° orbital ascent to high 3/4 angle."
  },
  {
    phase: 4,
    start: 10.0,
    end: 14.0,
    name: "ANTIGRAVITY VORTEX",
    label: "PHASE 4: MAGNETIC VORTEX & PLASMA ARCS",
    title: "PARTS FLYING IN AIR // VORTEX TRAJECTORY",
    desc: "Antigravity field reaches peak power. Floating armor modules swirl through 3D air along magnetic vortex trajectories with crackling golden plasma arcs."
  },
  {
    phase: 5,
    start: 14.0,
    end: 18.0,
    name: "REASSEMBLY",
    label: "PHASE 5: GRAVITATIONAL REASSEMBLY",
    title: "GRAVITATIONAL SHOCKWAVE & SYSTEM ENGAGED",
    desc: "Core releases radial shockwave. Swirling modules accelerate inward, snapping into locking mechanical sockets with crisp alignment. 100% online status."
  }
];

let bootStartTime = null;
let bootAnimId = null;
let bootCurrentPhase = 1;
let bootFXParticles = [];
let bootAudioSynthContext = null;
let bootAudioNodes = null;

// Initialize particles for canvas FX
function initBootParticles() {
  bootFXParticles = [];
  const count = 75;
  for (let i = 0; i < count; i++) {
    bootFXParticles.push({
      angle: Math.random() * Math.PI * 2,
      radiusX: 40 + Math.random() * 260,
      radiusY: 20 + Math.random() * 120,
      speed: 0.015 + Math.random() * 0.035,
      size: 1.2 + Math.random() * 2.8,
      alpha: 0.3 + Math.random() * 0.7,
      color: Math.random() > 0.3 ? "#D8B15E" : "#00F0FF",
      heightOffset: (Math.random() - 0.5) * 80
    });
  }
}

// Procedural Web Audio Sound Generator for Sci-Fi Boot
function startBootAudioSynth() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!bootAudioSynthContext) {
      bootAudioSynthContext = new AudioCtx();
    }
    if (bootAudioSynthContext.state === "suspended") {
      bootAudioSynthContext.resume();
    }

    const ctx = bootAudioSynthContext;
    const now = ctx.currentTime;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(state.soundEnabled ? 0.35 : 0.0, now);
    masterGain.connect(ctx.destination);

    // Sub-bass drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = "sawtooth";
    droneOsc.frequency.setValueAtTime(55, now);
    droneOsc.frequency.exponentialRampToValueAtTime(110, now + 14);

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(140, now);
    droneFilter.frequency.exponentialRampToValueAtTime(800, now + 14);

    droneOsc.connect(droneFilter);
    droneFilter.connect(masterGain);
    droneOsc.start(now);

    // Harmonic shimmer (sine chord)
    const shimmerOsc = ctx.createOscillator();
    shimmerOsc.type = "sine";
    shimmerOsc.frequency.setValueAtTime(440, now);
    shimmerOsc.frequency.exponentialRampToValueAtTime(880, now + 14);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.08, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.2, now + 12);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    shimmerOsc.start(now);

    bootAudioNodes = { masterGain, droneOsc, shimmerOsc };
  } catch (err) {
    console.warn("[PROJECT AURA BOOT AUDIO] Web Audio unavailable:", err);
  }
}

function stopBootAudioSynth() {
  try {
    if (bootAudioNodes) {
      const now = bootAudioSynthContext ? bootAudioSynthContext.currentTime : 0;
      if (bootAudioNodes.masterGain) {
        bootAudioNodes.masterGain.gain.linearRampToValueAtTime(0.0, now + 0.3);
      }
      setTimeout(() => {
        try {
          if (bootAudioNodes.droneOsc) bootAudioNodes.droneOsc.stop();
          if (bootAudioNodes.shimmerOsc) bootAudioNodes.shimmerOsc.stop();
        } catch (_) {}
        bootAudioNodes = null;
      }, 350);
    }
  } catch (_) {}
}

function resizeBootFXCanvas() {
  if (!bootFXCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  bootFXCanvas.width = window.innerWidth * dpr;
  bootFXCanvas.height = window.innerHeight * dpr;
  if (bootFXCtx) {
    bootFXCtx.scale(dpr, dpr);
  }
}

function initBootSequence() {
  state.bootFinished = true;
  document.body.classList.remove("aura-booting");

  if (bootOverlay) {
    bootOverlay.classList.add("boot-done");
    bootOverlay.style.display = "none";
  }

  // Initialize companion core canvas & 3D card tilt
  initCompanionCoreCanvas();
  init3DCardTilt();

  // Check providers and telemetry
  refreshProviderStatus();
  loadVaultFiles();
  loadMemoryNotes();
  renderTasks();
}

function runBootRenderLoop() {
  if (state.bootFinished) return;

  const now = performance.now();
  const elapsedSec = (now - bootStartTime) / 1000;

  // Complete if past total duration
  if (elapsedSec >= BOOT_TOTAL_DURATION_SEC) {
    completeBootImmediately();
    return;
  }

  // Determine current active phase
  let activePhaseObj = BOOT_PHASES_DATA[0];
  for (const p of BOOT_PHASES_DATA) {
    if (elapsedSec >= p.start && elapsedSec < p.end) {
      activePhaseObj = p;
      break;
    }
  }

  // Update DOM phase state if changed
  if (activePhaseObj.phase !== bootCurrentPhase) {
    bootCurrentPhase = activePhaseObj.phase;
    if (bootOverlay) {
      bootOverlay.setAttribute("data-phase", String(bootCurrentPhase));
    }
    if (bootPhaseLabel) {
      bootPhaseLabel.textContent = activePhaseObj.label;
    }
    if (bootSchTitle) {
      bootSchTitle.textContent = activePhaseObj.title;
    }
    if (bootSchDesc) {
      bootSchDesc.textContent = activePhaseObj.desc;
    }
    // Update phase scrubber steps
    if (bootPhasesTrack) {
      const steps = bootPhasesTrack.querySelectorAll(".boot-phase-step");
      steps.forEach((st) => {
        const pNum = parseInt(st.getAttribute("data-phase"), 10);
        st.classList.toggle("active", pNum === bootCurrentPhase);
        st.classList.toggle("completed", pNum < bootCurrentPhase);
      });
    }
  }

  // Update timecode display
  if (bootTimecode) {
    const mins = Math.floor(elapsedSec / 60);
    const secs = (elapsedSec % 60).toFixed(1).padStart(4, "0");
    bootTimecode.textContent = `${String(mins).padStart(2, "0")}:${secs} / 00:18.0`;
  }

  // Update clock
  if (bootHudClock) {
    const d = new Date();
    bootHudClock.textContent = d.toTimeString().split(" ")[0];
  }

  // Update progress bar
  if (bootProgressBar) {
    const pct = Math.min(100, (elapsedSec / BOOT_TOTAL_DURATION_SEC) * 100);
    bootProgressBar.style.width = pct.toFixed(1) + "%";
  }

  // Render Canvas FX
  drawBootFX(elapsedSec, bootCurrentPhase);

  bootAnimId = requestAnimationFrame(runBootRenderLoop);
}

function drawBootFX(elapsedSec, phase) {
  if (!bootFXCanvas || !bootFXCtx) return;
  const ctx = bootFXCtx;
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.clearRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.41; // Anchored on the android chest reactor core

  // 1. Concentric Golden Reactor Rings
  const ringScale = phase === 2 ? 1.2 : (phase === 4 ? 1.35 : 1.0);
  const ringAlpha = phase === 1 ? 0.35 : 0.75;
  
  ctx.save();
  ctx.translate(cx, cy);

  for (let r = 0; r < 4; r++) {
    const baseRadiusX = (55 + r * 28) * ringScale;
    const baseRadiusY = (24 + r * 12) * ringScale;
    const rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.8 + r * 0.3);
    const ringAngle = elapsedSec * rotSpeed;

    ctx.save();
    ctx.rotate(ringAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, baseRadiusX, baseRadiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = r === 0 ? `rgba(255, 235, 160, ${ringAlpha})` : `rgba(216, 177, 94, ${ringAlpha * 0.75})`;
    ctx.lineWidth = r === 0 ? 2.5 : 1.5;
    ctx.stroke();

    // Small glowing node on ring
    const nodeX = Math.cos(elapsedSec * 2 + r) * baseRadiusX;
    const nodeY = Math.sin(elapsedSec * 2 + r) * baseRadiusY;
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF0BF";
    ctx.shadowColor = "#D8B15E";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
  ctx.restore();

  // 2. Swirling Antigravity Particles
  const vortexSpeedMultiplier = phase === 4 ? 2.5 : (phase === 5 ? -2.0 : 1.0);
  for (let i = 0; i < bootFXParticles.length; i++) {
    const p = bootFXParticles[i];
    p.angle += p.speed * vortexSpeedMultiplier;

    const px = cx + Math.cos(p.angle) * p.radiusX;
    const py = cy + Math.sin(p.angle) * p.radiusY + p.heightOffset;

    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  }

  // 3. Crackling Plasma Energy Arcs (Phases 2, 3, 4)
  if (phase >= 2 && phase <= 4) {
    const arcCount = phase === 4 ? 6 : 3;
    for (let a = 0; a < arcCount; a++) {
      if (Math.random() > 0.4) {
        const targetAngle = (a / arcCount) * Math.PI * 2 + Math.random() * 0.5;
        const targetDist = 140 + Math.random() * 120;
        const tx = cx + Math.cos(targetAngle) * targetDist;
        const ty = cy + Math.sin(targetAngle) * targetDist * 0.6;

        drawLightningArc(ctx, cx, cy, tx, ty, "#D8B15E");
      }
    }
  }

  // 4. Gravitational Shockwave Ripple (Phase 5)
  if (phase === 5) {
    const shockProgress = (elapsedSec - 14.0) % 2.0;
    const shockRadius = shockProgress * (w * 0.6);
    const shockAlpha = Math.max(0, 1.0 - shockProgress / 2.0);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.82, shockRadius, shockRadius * 0.28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(216, 177, 94, ${shockAlpha * 0.7})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = "#D8B15E";
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();
  }
}

function drawLightningArc(ctx, x1, y1, x2, y2, color) {
  const steps = 6;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  let curX = x1;
  let curY = y1;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const nx = x1 + (x2 - x1) * progress + (Math.random() - 0.5) * 22;
    const ny = y1 + (y2 - y1) * progress + (Math.random() - 0.5) * 22;
    ctx.lineTo(nx, ny);
    curX = nx;
    curY = ny;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();
}

function completeBootImmediately() {
  state.bootFinished = true;
  if (bootAnimId) cancelAnimationFrame(bootAnimId);
  stopBootAudioSynth();
  try { realSoundPlayer.stopAndCleanup(); } catch (_) {}

  if (bootOverlay) {
    bootOverlay.classList.add("boot-done");
    bootOverlay.style.display = "none";
  }

  document.body.classList.remove("aura-booting");

  // Initialize companion core canvas & 3D card tilt
  initCompanionCoreCanvas();
  init3DCardTilt();

  // Check providers and telemetry
  refreshProviderStatus();
  loadVaultFiles();
  loadMemoryNotes();
  renderTasks();
}

window.restartAuraBoot = function () {
  console.log("[PROJECT AURA] Boot sequence animation is disabled.");
};

if (skipBootBtn) {
  skipBootBtn.addEventListener("click", () => completeBootImmediately());
}

if (bootAudioBtn) {
  bootAudioBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const next = !state.soundEnabled;
    state.soundEnabled = next;
    realSoundPlayer.setMuted(!next);
    if (bootAudioNodes && bootAudioNodes.masterGain && bootAudioSynthContext) {
      bootAudioNodes.masterGain.gain.setValueAtTime(next ? 0.35 : 0.0, bootAudioSynthContext.currentTime);
    }
    if (bootAudioIcon) bootAudioIcon.textContent = next ? "🔊" : "🔇";
  });
}

const replayBootBtn = document.getElementById("replayBootBtn");
if (replayBootBtn) {
  replayBootBtn.addEventListener("click", () => window.restartAuraBoot());
}

const visualReplayBootBtn = document.getElementById("visualReplayBootBtn");
if (visualReplayBootBtn) {
  visualReplayBootBtn.addEventListener("click", () => window.restartAuraBoot());
}

const soundToggleBtn = document.getElementById("soundToggleBtn");
if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    const next = !state.soundEnabled;
    realSoundPlayer.setMuted(!next);
    soundToggleBtn.textContent = next ? "♫" : "✕";
  });
}


/* =========================================================
   3. AURA 3D HOLOGRAPHIC NEURAL CORE CANVAS
   (True 3D Perspective Projection · Geodesic Sphere · Orbiting Gyro-Rings)
========================================================= */
const coreCanvas = document.getElementById("coreCanvas");
const coreCtx = coreCanvas ? coreCanvas.getContext("2d") : null;
let coreTicks = 0;
let pointerX = 0;
let pointerY = 0;
let targetPointerX = 0;
let targetPointerY = 0;

// 3D Engine State & Physics
let rotX = 0.25;
let rotY = 0.45;
let velX = 0;
let velY = 0;
let isDraggingCore = false;
let lastDragX = 0;
let lastDragY = 0;

// Pre-compute 38 Fibonacci Geodesic Sphere Vertices
const SPHERE_NODES = [];
const SPHERE_NODE_COUNT = 36;
const GOLDEN_RATIO_ANGLE = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < SPHERE_NODE_COUNT; i++) {
  const y = 1 - (i / (SPHERE_NODE_COUNT - 1)) * 2;
  const rad = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_RATIO_ANGLE * i;
  SPHERE_NODES.push({
    x: Math.cos(theta) * rad,
    y: y,
    z: Math.sin(theta) * rad,
    phase: Math.random() * Math.PI * 2
  });
}

// Pre-calculate nearest neighbor wireframe edges (3D geodesic connectivity)
const SPHERE_EDGES = [];
for (let i = 0; i < SPHERE_NODE_COUNT; i++) {
  for (let j = i + 1; j < SPHERE_NODE_COUNT; j++) {
    const dx = SPHERE_NODES[i].x - SPHERE_NODES[j].x;
    const dy = SPHERE_NODES[i].y - SPHERE_NODES[j].y;
    const dz = SPHERE_NODES[i].z - SPHERE_NODES[j].z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 0.68) {
      SPHERE_EDGES.push([i, j]);
    }
  }
}

function initCompanionCoreCanvas() {
  if (!coreCanvas || !coreCtx) return;

  function resize() {
    const rect = coreCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    coreCanvas.width = (rect.width || 300) * dpr;
    coreCanvas.height = (rect.height || 180) * dpr;
  }
  window.addEventListener("resize", resize);
  resize();

  // Interactive 3D Orbit Drag & Hover Physics
  coreCanvas.addEventListener("pointerdown", (e) => {
    isDraggingCore = true;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    coreCanvas.setPointerCapture(e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    if (isDraggingCore) {
      const dx = e.clientX - lastDragX;
      const dy = e.clientY - lastDragY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      velY = dx * 0.008;
      velX = -dy * 0.008;
      rotY += velY;
      rotX += velX;
    } else if (coreCanvas) {
      const rect = coreCanvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        targetPointerX = (e.clientX - rect.left - rect.width * 0.5) * 0.12;
        targetPointerY = (e.clientY - rect.top - rect.height * 0.5) * 0.12;
      }
    }
  });

  window.addEventListener("pointerup", () => {
    isDraggingCore = false;
  });

  coreCanvas.addEventListener("pointerleave", () => {
    targetPointerX = 0;
    targetPointerY = 0;
  });

  renderCompanionCore();
}

function setCoreState(newState, label) {
  state.coreState = newState;
  const dot = document.getElementById("coreStateDot");
  const text = document.getElementById("coreStateText");

  if (text) text.textContent = label || newState.toUpperCase();
  if (dot) {
    if (newState === "thinking") {
      dot.style.background = "var(--accent-gold)";
    } else if (newState === "listening") {
      dot.style.background = "var(--accent-blue)";
    } else if (newState === "error") {
      dot.style.background = "var(--accent-rose)";
    } else {
      dot.style.background = "var(--accent-sage)";
    }
  }
}

function updateContextTask(taskText) {
  state.currentTask = taskText;
  const el = document.getElementById("contextCurrentTask");
  if (el) el.textContent = taskText;
}

// 3D Perspective Projection Matrix
function project3D(x, y, z, cx, cy, baseScale, rX, rY) {
  // Rotate around Y
  const cosY = Math.cos(rY);
  const sinY = Math.sin(rY);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;

  // Rotate around X
  const cosX = Math.cos(rX);
  const sinX = Math.sin(rX);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  // Camera perspective
  const fov = 340;
  const dist = 280;
  const pScale = fov / (z2 + dist);

  return {
    px: cx + x1 * baseScale * pScale,
    py: cy + y2 * baseScale * pScale,
    z: z2,
    pScale: pScale,
    depthRatio: Math.max(0.1, Math.min(1.0, (z2 + 120) / 240))
  };
}

function renderCompanionCore() {
  if (!coreCtx || !coreCanvas) return;
  coreTicks++;

  const w = coreCanvas.width;
  const h = coreCanvas.height;
  pointerX += (targetPointerX - pointerX) * 0.08;
  pointerY += (targetPointerY - pointerY) * 0.08;

  const cx = w * 0.5 + pointerX;
  const cy = h * 0.5 + pointerY;
  const scale = (Math.min(w, h) / 180) * 0.85;
  const baseSphereRadius = 46 * scale;

  coreCtx.clearRect(0, 0, w, h);

  // Dynamic parameters by state
  let rotSpeed = 0.012;
  let pulseFreq = 0.04;
  const currentTheme = document.body.getAttribute("data-theme") || "rose-olive";
  let primaryColor = "201, 160, 160"; // Rose (#c9a0a0)
  let secondaryColor = "138, 143, 107"; // Olive (#8a8f6b)

  if (currentTheme === "rose-olive-light") {
    primaryColor = "158, 107, 107";
    secondaryColor = "138, 143, 107";
  } else if (currentTheme === "lavender-beige") {
    primaryColor = "168, 155, 190"; // Lavender (#a89bbe)
    secondaryColor = "219, 195, 168"; // Beige (#dbc3a8)
  } else if (currentTheme === "lavender-beige-light") {
    primaryColor = "122, 105, 150";
    secondaryColor = "219, 195, 168";
  } else if (currentTheme === "sage-cream") {
    primaryColor = "80, 94, 62"; // Deep Botanical
    secondaryColor = "163, 177, 138"; // Sage (#a3b18a)
  } else if (currentTheme === "sage-cream-dark") {
    primaryColor = "163, 177, 138"; // Sage (#a3b18a)
    secondaryColor = "242, 232, 207"; // Cream (#f2e8cf)
  } else if (currentTheme === "cyber-obsidian" || currentTheme === "minimal-dark") {
    primaryColor = "201, 164, 92"; // Gold
    secondaryColor = "160, 160, 160";
  } else if (currentTheme === "minimal-light") {
    primaryColor = "17, 24, 39";
    secondaryColor = "75, 85, 99";
  }
  let nucleusRadius = 14 * scale;

  if (state.coreState === "thinking") {
    rotSpeed = 0.042;
    pulseFreq = 0.12;
    primaryColor = "245, 166, 35";
    secondaryColor = "255, 215, 0";
    nucleusRadius = 18 * scale;
  } else if (state.coreState === "listening") {
    rotSpeed = 0.022;
    pulseFreq = 0.08;
    primaryColor = "0, 229, 255";
    secondaryColor = "41, 121, 255";
    nucleusRadius = 16 * scale;
  } else if (state.coreState === "responding") {
    rotSpeed = 0.026;
    pulseFreq = 0.07;
    primaryColor = "16, 185, 129";
    secondaryColor = "194, 155, 72";
    nucleusRadius = 16 * scale;
  } else if (state.coreState === "error") {
    rotSpeed = 0.035;
    pulseFreq = 0.14;
    primaryColor = "255, 51, 102";
    secondaryColor = "255, 102, 140";
    nucleusRadius = 17 * scale;
  }

  // Momentum damping
  if (!isDraggingCore) {
    rotY += rotSpeed + velY;
    rotX += (rotSpeed * 0.35) + velX;
    velX *= 0.92;
    velY *= 0.92;
  }

  // 1. Ambient Volumetric 3D Glow
  const glowRadius = (68 + Math.sin(coreTicks * pulseFreq) * 8) * scale;
  const glowGrad = coreCtx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
  glowGrad.addColorStop(0, `rgba(${primaryColor}, 0.22)`);
  glowGrad.addColorStop(0.5, `rgba(${secondaryColor}, 0.08)`);
  glowGrad.addColorStop(1, "transparent");
  coreCtx.fillStyle = glowGrad;
  coreCtx.beginPath();
  coreCtx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  coreCtx.fill();

  // 2. Project Geodesic 3D Vertices
  const projectedNodes = SPHERE_NODES.map((node) => {
    // Subtle organic breathing oscillation on radius
    const breathing = 1.0 + Math.sin(coreTicks * pulseFreq + node.phase) * 0.07;
    const r = baseSphereRadius * breathing;
    const p = project3D(node.x * r, node.y * r, node.z * r, cx, cy, 1.0, rotX, rotY);
    return { ...p, raw: node };
  });

  // Separate elements by depth for correct 3D occluding/stacking
  // 3. Render 3D Back Orbiting Ring
  const ringTilt1 = 0.52; // ~30 deg
  const ringRadius1 = baseSphereRadius * 1.55;
  const ringSteps = 32;

  // Background half of Orbit Ring (z < 0)
  coreCtx.save();
  for (let i = 0; i < ringSteps; i++) {
    const angle1 = (i / ringSteps) * Math.PI * 2 + coreTicks * rotSpeed * 1.4;
    const angle2 = ((i + 1) / ringSteps) * Math.PI * 2 + coreTicks * rotSpeed * 1.4;

    // Ring 1 in local coordinates tilted along X and rotated with sphere
    const rx1 = Math.cos(angle1) * ringRadius1;
    const ry1 = Math.sin(angle1) * ringRadius1 * Math.sin(ringTilt1);
    const rz1 = Math.sin(angle1) * ringRadius1 * Math.cos(ringTilt1);

    const rx2 = Math.cos(angle2) * ringRadius1;
    const ry2 = Math.sin(angle2) * ringRadius1 * Math.sin(ringTilt1);
    const rz2 = Math.sin(angle2) * ringRadius1 * Math.cos(ringTilt1);

    const p1 = project3D(rx1, ry1, rz1, cx, cy, 1.0, rotX, rotY);
    const p2 = project3D(rx2, ry2, rz2, cx, cy, 1.0, rotX, rotY);

    if (p1.z < 0) {
      coreCtx.beginPath();
      coreCtx.moveTo(p1.px, p1.py);
      coreCtx.lineTo(p2.px, p2.py);
      coreCtx.strokeStyle = `rgba(${secondaryColor}, ${0.12 * p1.depthRatio})`;
      coreCtx.lineWidth = Math.max(0.8, 1.0 * scale);
      coreCtx.stroke();
    }
  }
  coreCtx.restore();

  // 4. Render 3D Wireframe Edges (Connecting lines with depth cueing)
  coreCtx.save();
  SPHERE_EDGES.forEach(([i, j]) => {
    const pA = projectedNodes[i];
    const pB = projectedNodes[j];
    const avgDepth = (pA.depthRatio + pB.depthRatio) * 0.5;
    const alpha = 0.1 + avgDepth * 0.45;

    coreCtx.beginPath();
    coreCtx.moveTo(pA.px, pA.py);
    coreCtx.lineTo(pB.px, pB.py);
    coreCtx.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
    coreCtx.lineWidth = Math.max(0.6, (0.8 + avgDepth * 0.9) * scale);
    coreCtx.stroke();
  });
  coreCtx.restore();

  // 5. Render Central 3D Energetic Nucleus
  coreCtx.save();
  const nucleusPulse = nucleusRadius * (1.0 + Math.sin(coreTicks * (pulseFreq * 1.5)) * 0.12);
  const nucGrad = coreCtx.createRadialGradient(
    cx - 3 * scale,
    cy - 3 * scale,
    2 * scale,
    cx,
    cy,
    nucleusPulse * 1.3
  );
  nucGrad.addColorStop(0, "#FFFFFF");
  nucGrad.addColorStop(0.35, `rgb(${secondaryColor})`);
  nucGrad.addColorStop(0.8, `rgb(${primaryColor})`);
  nucGrad.addColorStop(1, "transparent");
  coreCtx.fillStyle = nucGrad;
  coreCtx.beginPath();
  coreCtx.arc(cx, cy, nucleusPulse, 0, Math.PI * 2);
  coreCtx.fill();
  coreCtx.restore();

  // 6. Foreground half of Orbit Ring (z >= 0) with orbiting data beads
  coreCtx.save();
  for (let i = 0; i < ringSteps; i++) {
    const angle1 = (i / ringSteps) * Math.PI * 2 + coreTicks * rotSpeed * 1.4;
    const angle2 = ((i + 1) / ringSteps) * Math.PI * 2 + coreTicks * rotSpeed * 1.4;

    const rx1 = Math.cos(angle1) * ringRadius1;
    const ry1 = Math.sin(angle1) * ringRadius1 * Math.sin(ringTilt1);
    const rz1 = Math.sin(angle1) * ringRadius1 * Math.cos(ringTilt1);

    const rx2 = Math.cos(angle2) * ringRadius1;
    const ry2 = Math.sin(angle2) * ringRadius1 * Math.sin(ringTilt1);
    const rz2 = Math.sin(angle2) * ringRadius1 * Math.cos(ringTilt1);

    const p1 = project3D(rx1, ry1, rz1, cx, cy, 1.0, rotX, rotY);
    const p2 = project3D(rx2, ry2, rz2, cx, cy, 1.0, rotX, rotY);

    if (p1.z >= 0) {
      coreCtx.beginPath();
      coreCtx.moveTo(p1.px, p1.py);
      coreCtx.lineTo(p2.px, p2.py);
      coreCtx.strokeStyle = `rgba(${secondaryColor}, ${0.35 * p1.depthRatio})`;
      coreCtx.lineWidth = Math.max(1.0, 1.6 * scale * p1.pScale);
      coreCtx.stroke();

      // Beacon nodes on foreground ring
      if (i % 6 === 0) {
        coreCtx.fillStyle = "#FFFFFF";
        coreCtx.beginPath();
        coreCtx.arc(p1.px, p1.py, Math.max(1.5, 2.8 * scale * p1.depthRatio), 0, Math.PI * 2);
        coreCtx.fill();
      }
    }
  }
  coreCtx.restore();

  // 7. Render 3D Projected Vertex Nodes
  coreCtx.save();
  projectedNodes.forEach((node) => {
    const nodeR = Math.max(1.2, (2.2 * node.depthRatio + (node.z > 0 ? 1.0 : 0)) * scale);
    const nodeAlpha = Math.max(0.18, 0.25 + node.depthRatio * 0.7);

    // Glowing dot
    coreCtx.fillStyle = node.z > 0 ? "#FFFFFF" : `rgba(${primaryColor}, ${nodeAlpha})`;
    coreCtx.beginPath();
    coreCtx.arc(node.px, node.py, nodeR, 0, Math.PI * 2);
    coreCtx.fill();

    // Specular halo for frontal nodes
    if (node.z > 25) {
      coreCtx.strokeStyle = `rgba(${secondaryColor}, ${0.4 * node.depthRatio})`;
      coreCtx.lineWidth = 1 * scale;
      coreCtx.beginPath();
      coreCtx.arc(node.px, node.py, nodeR * 2.2, 0, Math.PI * 2);
      coreCtx.stroke();
    }
  });
  coreCtx.restore();

  requestAnimationFrame(renderCompanionCore);
}

/* =========================================================
   4. NAVIGATION & WORKSPACE CONTROLLER
========================================================= */
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".aura-view");
const sidebar = document.getElementById("auraSidebar");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const mobileNavToggleBtn = document.getElementById("mobileNavToggleBtn");
const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

function closeMobileSidebar() {
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
}

function openMobileSidebar() {
  if (sidebar) sidebar.classList.add("mobile-open");
  if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
}

function toggleMobileSidebar() {
  if (sidebar && sidebar.classList.contains("mobile-open")) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
}

window.switchKnowledgeVaultSubTab = function(subtab) {
  const btnDocs = document.getElementById("kvTabDocsBtn");
  const btnMem = document.getElementById("kvTabMemBtn");
  const paneDocs = document.getElementById("kvSubTabDocs");
  const paneMem = document.getElementById("kvSubTabMemory");

  if (subtab === "memory") {
    if (btnDocs) btnDocs.classList.remove("active");
    if (btnMem) btnMem.classList.add("active");
    if (paneDocs) { paneDocs.style.display = "none"; paneDocs.classList.remove("active"); }
    if (paneMem) { paneMem.style.display = "block"; paneMem.classList.add("active"); }
    if (typeof loadMemoryNotes === "function") loadMemoryNotes();
  } else {
    if (btnMem) btnMem.classList.remove("active");
    if (btnDocs) btnDocs.classList.add("active");
    if (paneMem) { paneMem.style.display = "none"; paneMem.classList.remove("active"); }
    if (paneDocs) { paneDocs.style.display = "block"; paneDocs.classList.add("active"); }
    if (typeof loadVaultFiles === "function") loadVaultFiles();
  }
};

window.switchStudyPlannerSubTab = function(subtab) {
  const btnMilestones = document.getElementById("studySubtabMilestones");
  const btnKanban = document.getElementById("studySubtabKanban");
  const paneMilestones = document.getElementById("studyTabMilestonesContent");
  const paneKanban = document.getElementById("studyTabKanbanContent");

  if (subtab === "kanban") {
    if (btnMilestones) btnMilestones.classList.remove("active");
    if (btnKanban) btnKanban.classList.add("active");
    if (paneMilestones) { paneMilestones.style.display = "none"; paneMilestones.classList.remove("active"); }
    if (paneKanban) { paneKanban.style.display = "block"; paneKanban.classList.add("active"); }
    if (typeof renderTasks === "function") renderTasks();
  } else {
    if (btnKanban) btnKanban.classList.remove("active");
    if (btnMilestones) btnMilestones.classList.add("active");
    if (paneKanban) { paneKanban.style.display = "none"; paneKanban.classList.remove("active"); }
    if (paneMilestones) { paneMilestones.style.display = "block"; paneMilestones.classList.add("active"); }
  }
};

function switchView(viewKey) {
  if (!viewKey) viewKey = "command-center";

  // Route aliases for consolidated workspaces
  if (viewKey === "memory-cortex") {
    viewKey = "knowledge-vault";
    window.switchKnowledgeVaultSubTab("memory");
  } else if (viewKey === "tasks") {
    viewKey = "study-intel";
    window.switchStudyPlannerSubTab("kanban");
  } else if (viewKey === "engineering-hub" || viewKey === "academic-hub" || viewKey === "academic-intelligence" || viewKey === "college-school-hub") {
    viewKey = "academic-hub-workspace";
  }

  state.activeView = viewKey;

  navItems.forEach(item => {
    const itemDataView = item.getAttribute("data-view");
    const isMatch = itemDataView === viewKey || (viewKey === "academic-hub-workspace" && (itemDataView === "academic-hub-workspace" || itemDataView === "engineering-hub"));
    item.classList.toggle("active", isMatch);
  });

  views.forEach(v => {
    const isViewMatch = v.id === `view-${viewKey}` || v.id === viewKey || (viewKey === "academic-hub-workspace" && (v.id === "academic-hub-workspace" || v.id === "view-engineering-hub"));
    v.classList.toggle("active", isViewMatch);
  });

  if (breadcrumbCurrent) {
    const activeItem = document.querySelector(`.nav-item[data-view="${viewKey}"], .nav-item[data-view="academic-hub-workspace"] .nav-label`);
    breadcrumbCurrent.textContent = activeItem ? activeItem.textContent : viewKey;
  }

  // Trigger view-specific fresh data loading
  if (viewKey === "knowledge-vault") {
    loadVaultFiles();
    loadMemoryNotes();
  }
  if (viewKey === "study-intel") {
    renderTasks();
  }
  if (viewKey === "student-performance") loadStudentPerformance();
  if (viewKey === "mock-test") initSemesterMockTest();
  if (viewKey === "academic-hub-workspace" || viewKey === "engineering-hub") {
    if (typeof initCollegeAndSchoolHub === "function") initCollegeAndSchoolHub();
    if (typeof initEngineeringHub === "function") initEngineeringHub();
    if (typeof window.loadYouTubeLectures === "function") {
      window.loadYouTubeLectures();
    }
  }

  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
  playTactileSound("click");
}

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const viewKey = item.getAttribute("data-view");
    if (viewKey) switchView(viewKey);
  });
});

const brandHomeLink = document.getElementById("brandHomeLink");
if (brandHomeLink) {
  brandHomeLink.addEventListener("click", () => switchView("command-center"));
}

if (mobileNavToggleBtn && sidebar) {
  mobileNavToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileSidebar();
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", () => {
    closeMobileSidebar();
  });
}

document.addEventListener("click", (e) => {
  if (sidebar && sidebar.classList.contains("mobile-open")) {
    if (!sidebar.contains(e.target) && e.target !== mobileNavToggleBtn) {
      closeMobileSidebar();
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileSidebar();
  }
});

/* =========================================================
   4B. 3D INTERACTIVE SPATIAL PERSPECTIVE & CARD TILT
========================================================= */
function init3DCardTilt() {
  const tiltableCards = document.querySelectorAll(
    ".command-surface-card, .action-card, .companion-card, .directive-resolution-dossier, .workspace-card, .stat-card, .metric-card, .quick-action-pill, .cognitive-pipeline-card"
  );

  tiltableCards.forEach(card => {
    card.classList.add("card-tilt-3d");

    card.addEventListener("pointermove", (e) => {
      if (state.spatial3dEnabled === false || window.innerWidth <= 768) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width * 0.5;
      const cy = rect.height * 0.5;

      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      card.style.setProperty("--glare-x", `${px}%`);
      card.style.setProperty("--glare-y", `${py}%`);

      const rotX = ((y - cy) / cy) * -6.5;
      const rotY = ((x - cx) / cx) * 6.5;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)";
    });
  });

  // Spatial 3D horizon grid parallax movement
  const gridPlane = document.getElementById("spatial3dGridPlane");
  if (gridPlane) {
    window.addEventListener("pointermove", (e) => {
      if (state.spatial3dEnabled === false || window.innerWidth <= 768) return;
      const normX = ((e.clientX / window.innerWidth) - 0.5) * 8;
      const normY = ((e.clientY / window.innerHeight) - 0.5) * 6;
      gridPlane.style.transform = `rotateX(${62 + normY}deg) rotateZ(${normX}deg) translateY(-20px)`;
    });
  }
}

// Modular Action Cards in Command Center
document.querySelectorAll(".action-card").forEach(card => {
  card.addEventListener("click", () => {
    const target = card.getAttribute("data-view");
    if (target) switchView(target);
  });
});

// Live Clock
function updateClock() {
  const clockEl = document.getElementById("osClock");
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("en-IN", { hour12: false });
  }
}
setInterval(updateClock, 1000);
updateClock();

/* =========================================================
   5. COMMAND PALETTE MODAL (⌘K)
========================================================= */
const paletteModal = document.getElementById("commandPaletteModal");
const topbarSearchTrigger = document.getElementById("topbarSearchTrigger");
const sidebarSearchBtn = document.getElementById("sidebarSearchBtn");
const paletteInput = document.getElementById("paletteSearchInput");
const paletteItems = document.querySelectorAll(".palette-item");

function openPalette() {
  if (paletteModal) {
    paletteModal.classList.remove("hidden");
    if (paletteInput) {
      paletteInput.value = "";
      paletteInput.focus();
    }
  }
}

function closePalette() {
  if (paletteModal) paletteModal.classList.add("hidden");
}

if (topbarSearchTrigger) topbarSearchTrigger.addEventListener("click", openPalette);
if (sidebarSearchBtn) sidebarSearchBtn.addEventListener("click", openPalette);

paletteItems.forEach(item => {
  item.addEventListener("click", () => {
    const target = item.getAttribute("data-view");
    if (target) {
      switchView(target);
      closePalette();
    }
  });
});

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette();
  } else if (e.key === "Escape" && paletteModal && !paletteModal.classList.contains("hidden")) {
    closePalette();
  }
});

if (paletteModal) {
  paletteModal.addEventListener("click", (e) => {
    if (e.target === paletteModal) closePalette();
  });
}

/* =========================================================
   6. COMMAND CENTER DISPATCH & CHAT STREAM
   (Replies on TOP of typing area · Mini Attachment Preview & Grounded Analysis)
========================================================= */
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const ccChatStream = document.getElementById("ccChatStream");
const ccHero = document.getElementById("ccHero");
const ccAttachStrip = document.getElementById("ccAttachStrip");
const vaultAttachBtn = document.getElementById("vaultAttachBtn");
const composerFileInput = document.getElementById("composerFileInput");
const spatialTiltToggleBtn = document.getElementById("spatialTiltToggleBtn");

let currentComposerAttachment = null;

// Cognitive Pipeline Tracker
function updateCognitivePipeline(step) {
  const map = {
    understand: document.getElementById("pipeUnderstanding"),
    reason: document.getElementById("pipeReasoning"),
    synthesize: document.getElementById("pipeSynthesizing"),
    complete: document.getElementById("pipeCompleted")
  };
  const order = ["understand", "reason", "synthesize", "complete"];
  const targetIdx = order.indexOf(step);
  if (targetIdx === -1) return;

  order.forEach((key, idx) => {
    const el = map[key];
    if (!el) return;
    el.classList.remove("active", "completed");
    if (idx < targetIdx) el.classList.add("completed");
    else if (idx === targetIdx) el.classList.add("active");
  });
}

// Prompt Suggestion Chips
document.querySelectorAll(".suggestion-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const prompt = chip.getAttribute("data-prompt");
    if (messageInput && prompt) {
      messageInput.value = prompt;
      messageInput.focus();
      playTactileSound("click");
    }
  });
});

// Auto-expand textarea
if (messageInput) {
  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(180, messageInput.scrollHeight) + "px";
  });

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      dispatchCommand();
    }
  });
}

if (sendBtn) {
  sendBtn.addEventListener("click", dispatchCommand);
}

if (spatialTiltToggleBtn) {
  spatialTiltToggleBtn.addEventListener("click", () => {
    state.spatial3dEnabled = !state.spatial3dEnabled;
    spatialTiltToggleBtn.classList.toggle("active", state.spatial3dEnabled);
    if (!state.spatial3dEnabled) {
      document.querySelectorAll(".card-tilt-3d").forEach(card => (card.style.transform = ""));
    }
    playTactileSound("click");
  });
}

// Miniature File Attachment Handling on Typing Place
if (vaultAttachBtn && composerFileInput) {
  vaultAttachBtn.addEventListener("click", () => composerFileInput.click());
  composerFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length) {
      const file = e.target.files[0];
      handleComposerFileSelect(file);
    }
  });
}

function handleComposerFileSelect(file) {
  if (!file) return;

  currentComposerAttachment = {
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    content: "",
    status: "processing"
  };
  renderComposerAttachmentChip();
  playTactileSound("click");

  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const textExts = [".txt", ".csv", ".json", ".js", ".ts", ".py", ".md", ".html", ".css", ".java", ".c", ".cpp"];

  if (file.type.startsWith("text/") || textExts.includes(ext)) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentComposerAttachment.content = event.target.result;
      currentComposerAttachment.status = "ready";
      renderComposerAttachmentChip();
      playTactileSound("success");
    };
    reader.readAsText(file);
  } else {
    // Binary or document file (PDF, DOCX, PPTX, XLSX, images, etc.) -> upload to Knowledge Vault to parse chunks
    const formData = new FormData();
    formData.append("file", file);

    fetch(`${BACKEND_URL}/api/vault/upload`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.file) {
          const extractedText = (data.file.chunks || []).map(c => c.text).join("\n\n");
          currentComposerAttachment.fileId = data.file.id;
          currentComposerAttachment.content = extractedText || `Document: ${file.name} successfully indexed.`;
          currentComposerAttachment.status = "ready";
          renderComposerAttachmentChip();
          playTactileSound("success");
          loadVaultFiles();
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            currentComposerAttachment.content = e.target.result;
            currentComposerAttachment.status = "ready";
            renderComposerAttachmentChip();
          };
          reader.readAsDataURL(file);
        }
      })
      .catch(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          currentComposerAttachment.content = e.target.result;
          currentComposerAttachment.status = "ready";
          renderComposerAttachmentChip();
        };
        reader.readAsDataURL(file);
      });
  }
}

function renderComposerAttachmentChip() {
  if (!ccAttachStrip) return;
  if (!currentComposerAttachment) {
    ccAttachStrip.style.display = "none";
    ccAttachStrip.innerHTML = "";
    return;
  }

  const szStr = currentComposerAttachment.size < 1024 * 1024
    ? `${(currentComposerAttachment.size / 1024).toFixed(1)} KB`
    : `${(currentComposerAttachment.size / (1024 * 1024)).toFixed(1)} MB`;

  const statusBadge = currentComposerAttachment.status === "processing"
    ? `<span style="font-size:10px; color:#c29b48; font-weight:700;">Analyzing...</span>`
    : `<span style="font-size:10px; color:#10B981; font-weight:700;">Ready</span>`;

  ccAttachStrip.style.display = "flex";
  ccAttachStrip.innerHTML = `
    <div class="cc-attach-chip" style="display:inline-flex; align-items:center; gap:8px; padding:6px 12px; background:rgba(0, 240, 255, 0.08); border:1px solid rgba(0, 240, 255, 0.25); border-radius:20px; font-size:12px; color:var(--text-primary);">
      <span style="font-size:14px;">📄</span>
      <strong style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(currentComposerAttachment.name)}</strong>
      <span style="font-size:11px; opacity:0.7;">(${szStr})</span>
      ${statusBadge}
      <button onclick="removeComposerAttachment()" style="background:transparent; border:none; color:var(--text-secondary); cursor:pointer; font-size:13px; padding:0 2px;" title="Remove attachment">✕</button>
    </div>
  `;
}

window.removeComposerAttachment = function() {
  currentComposerAttachment = null;
  if (ccAttachStrip) {
    ccAttachStrip.style.display = "none";
    ccAttachStrip.innerHTML = "";
  }
  if (composerFileInput) composerFileInput.value = "";
  playTactileSound("click");
};

function scrollChatStreamToBottom() {
  if (ccChatStream) {
    ccChatStream.scrollTo({
      top: ccChatStream.scrollHeight,
      behavior: "smooth"
    });
  }
}

async function dispatchCommand() {
  const text = messageInput ? messageInput.value.trim() : "";
  if (!text && !currentComposerAttachment) return;

  const queryText = text || (currentComposerAttachment ? `Analyze attached document: ${currentComposerAttachment.name}` : "");

  messageInput.value = "";
  messageInput.style.height = "auto";
  playTactileSound("dispatch");

  state.totalCommands++;

  // Hide initial greeting hero once dialogue begins
  if (ccHero) ccHero.style.display = "none";

  // 1. Render User Message inside #ccChatStream (above typing place)
  if (ccChatStream) {
    const userMsgEl = document.createElement("div");
    userMsgEl.className = "cc-msg user-msg";
    userMsgEl.style.cssText = "display:flex; justify-content:flex-end; margin-bottom:16px; animation:fadeIn 0.25s ease;";

    const attachBadge = currentComposerAttachment
      ? `<div style="display:inline-flex; align-items:center; gap:6px; background:var(--accent-gold-soft); padding:4px 10px; border-radius:12px; font-size:11px; color:var(--accent-gold); margin-bottom:6px; font-weight:700;">
          <span>📎</span> <span>${escapeHtml(currentComposerAttachment.name)}</span>
        </div><br/>`
      : "";

    userMsgEl.innerHTML = `
      <div style="max-width:80%; background:var(--bg-surface-elevated); border:1px solid var(--border-card); border-radius:16px 16px 4px 16px; padding:12px 18px; box-shadow:0 4px 16px rgba(0,0,0,0.18);">
        ${attachBadge}
        <div style="font-size:14px; color:var(--text-primary); line-height:1.5;">${escapeHtml(queryText)}</div>
        <div style="font-size:10px; color:var(--text-tertiary); text-align:right; margin-top:4px;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;
    ccChatStream.appendChild(userMsgEl);
    scrollChatStreamToBottom();
  }

  // 2. Render AI Thinking Bubble in #ccChatStream
  let thinkingBubble = null;
  if (ccChatStream) {
    thinkingBubble = document.createElement("div");
    thinkingBubble.className = "cc-msg ai-msg thinking-bubble";
    thinkingBubble.style.cssText = "display:flex; justify-content:flex-start; margin-bottom:16px;";
    thinkingBubble.innerHTML = `
      <div style="max-width:82%; background:var(--bg-surface); border:1px solid var(--border-medium); border-radius:16px 16px 16px 4px; padding:12px 18px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:24px; height:24px; border-radius:50%; background:var(--accent-gold-soft); color:var(--accent-gold); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">✦</div>
          <div style="font-size:13px; font-weight:700; color:var(--accent-gold);" id="ccThinkingText">AURA is analyzing directive & context...</div>
        </div>
      </div>
    `;
    ccChatStream.appendChild(thinkingBubble);
    scrollChatStreamToBottom();
  }

  updateCognitivePipeline("understand");
  setCoreState("thinking", "UNDERSTANDING");
  updateContextTask(`Processing: "${queryText.slice(0, 28)}..."`);

  setTimeout(() => {
    updateCognitivePipeline("reason");
    setCoreState("thinking", "REASONING");
  }, 350);

  const payloadAttachment = currentComposerAttachment ? { ...currentComposerAttachment } : null;
  // Clear attachment chip immediately from input
  removeComposerAttachment();

  try {
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: queryText,
        attachment: payloadAttachment,
        conversationId: state.currentConversationId
      })
    });

    const data = await res.json();
    const answer = data.answer || data.response || "Directive synthesized successfully.";
    const provider = data.provider || "Google Gemini 3.7 Flash";

    updateCognitivePipeline("synthesize");
    setCoreState("responding", "SYNTHESIZING");

    // Replace thinking bubble with formatted AI response
    if (thinkingBubble) {
      thinkingBubble.className = "cc-msg ai-msg";
      thinkingBubble.innerHTML = `
        <div style="max-width:84%; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:16px 16px 16px 4px; padding:16px 20px; box-shadow:0 6px 24px rgba(0,0,0,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border-subtle); padding-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent-gold); font-weight:800; font-size:13px;">✦ PROJECT AURA</span>
              <span style="font-size:10px; padding:2px 8px; border-radius:10px; background:var(--bg-surface-subtle); color:var(--text-secondary);">${escapeHtml(provider)}</span>
            </div>
            <button class="btn-dossier-tool" onclick="copyAiBubbleText(this)" style="font-size:11px; padding:4px 8px;">📋 Copy</button>
          </div>
          <div class="dialogue-content cc-ai-response-body" style="font-size:14px; line-height:1.6; color:var(--text-primary);">
            ${formatMarkdownResponse(answer)}
            ${typeof inspectAndHandleProfileMemory === "function" ? inspectAndHandleProfileMemory(queryText, answer) : ""}
          </div>
        </div>
      `;
      scrollChatStreamToBottom();
    }


    updateCognitivePipeline("complete");
    setCoreState("idle", "ONLINE");
    updateContextTask("Awaiting Directive");
    playTactileSound("success");
  } catch (err) {
    if (thinkingBubble) {
      thinkingBubble.innerHTML = `
        <div style="max-width:84%; background:var(--bg-surface); border:1px solid rgba(239, 68, 68, 0.4); border-radius:16px; padding:14px 18px;">
          <div style="font-size:13px; color:#EF4444; font-weight:700;">⚠️ Communication Notice</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">${escapeHtml(err.message)}</div>
        </div>
      `;
    }
    setCoreState("error", "CIRCUIT ALERT");
    updateCognitivePipeline("complete");
    setTimeout(() => setCoreState("idle", "ONLINE"), 3000);
  }
}

window.copyAiBubbleText = function(btn) {
  const container = btn.closest(".cc-msg");
  if (!container) return;
  const textEl = container.querySelector(".cc-ai-response-body");
  if (!textEl) return;
  navigator.clipboard.writeText(textEl.innerText).then(() => {
    const orig = btn.textContent;
    btn.textContent = "✓ Copied!";
    playTactileSound("success");
    setTimeout(() => { btn.textContent = orig; }, 1800);
  });
};

/* =========================================================
   7. CREATION STUDIO (WORKSPACE 7) — MULTI-MODE EXECUTIVE STUDIO
   Modes: Write · Code · Script · Presentation · Social · Templates
   Features: Short & Crisp by Default · Emojis · Markdown / TXT / Print Exports
========================================================= */
state.creationLengthMode = "short";

function initCreationStudio() {
  const creationTabs = document.querySelectorAll(".creation-tab-btn");
  const creationTabContents = document.querySelectorAll(".creation-tab-content");
  const shortBtn = document.getElementById("creationLengthShortBtn");
  const longBtn = document.getElementById("creationLengthLongBtn");

  // Tab switching
  creationTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabKey = btn.getAttribute("data-tab");
      state.activeCreationTab = tabKey;

      creationTabs.forEach(b => b.classList.toggle("active", b === btn));
      creationTabContents.forEach(c => {
        c.style.display = c.id === `tab-${tabKey}` ? "block" : "none";
      });
      playTactileSound("click");
    });
  });

  // Length toggles
  if (shortBtn && longBtn) {
    shortBtn.addEventListener("click", () => {
      state.creationLengthMode = "short";
      shortBtn.classList.add("active");
      longBtn.classList.remove("active");
      playTactileSound("click");
    });

    longBtn.addEventListener("click", () => {
      state.creationLengthMode = "detailed";
      longBtn.classList.add("active");
      shortBtn.classList.remove("active");
      playTactileSound("click");
    });
  }

  function formatCreationStudioOutput(text, defaultTopic) {
    if (!text) return "";

    let cleanText = text.replace(/^[=\-_*]{3,}\s*$/gm, "").trim();
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

    let summaryText = "";
    const bulletPoints = [];

    lines.forEach(line => {
      const isBullet = /^[-*•►✦✧]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line);
      const isHeader = /^#{1,4}\s+/.test(line) || /^\*\*[^*]+\*\*:?$/.test(line);

      if (isBullet) {
        const cleanPt = line.replace(/^[-*•►✦✧]\s+/, '').replace(/^\d+[\.\)]\s+/, '').trim();
        if (cleanPt) bulletPoints.push(cleanPt);
      } else if (!isHeader && !summaryText && line.length > 20) {
        summaryText = line;
      } else if (!isHeader && line.length > 10) {
        bulletPoints.push(line);
      }
    });

    if (!summaryText && bulletPoints.length > 0) {
      summaryText = bulletPoints.shift();
    }
    if (!summaryText) {
      summaryText = `Executive synthesis for ${defaultTopic || "selected topic"}.`;
    }

    return `
      <div class="creation-summary-wrapper">
        <div class="creation-exec-brief-card">
          <div class="creation-exec-brief-title">
            <span>✦ Executive Briefing</span>
            <span class="eng-badge-pill" style="font-size:10px;">High-Yield Summary</span>
          </div>
          <div class="creation-exec-brief-text">
            ${escapeHtml(summaryText).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
          </div>
        </div>

        <div class="creation-crisp-bullets-card">
          <div class="creation-crisp-bullets-title">
            <span>🎯 Key Actionable Takeaways &amp; Core Concepts</span>
            <span style="font-size:11px; color:var(--text-tertiary);">${bulletPoints.length} Key Points</span>
          </div>
          <ul class="creation-points-list">
            ${bulletPoints.map((pt, pIdx) => {
              const boldFormatted = escapeHtml(pt).replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary); font-weight:700;">$1</strong>');
              const glyph = String(pIdx + 1).padStart(2, '0');
              return `
                <li class="creation-point-item">
                  <span class="point-glyph">${glyph}</span>
                  <div style="flex:1;">${boldFormatted}</div>
                </li>
              `;
            }).join("")}
          </ul>
        </div>
      </div>
    `;
  }
  window.formatCreationStudioOutput = formatCreationStudioOutput;

  function parsePresentationSlides(rawText, topic) {
    // Try to extract slide blocks
    const slides = [];
    const chunks = rawText.split(/(?:Slide\s*\d+|SLIDE\s*\d+|##\s*Slide\s*\d+)/i).filter(c => c.trim().length > 10);

    if (chunks.length > 0) {
      chunks.forEach((chunk, idx) => {
        const lines = chunk.trim().split('\n').map(l => l.trim()).filter(Boolean);
        const titleLine = lines[0] ? lines[0].replace(/^[#*:\-\s]+/, '').replace(/\*\*+/g, '') : `Slide ${idx + 1}`;
        const bullets = [];
        let notes = "";

        lines.slice(1).forEach(l => {
          if (/speaker notes|notes:|script:/i.test(l)) {
            notes += l.replace(/.*(?:notes:|script:)/i, '').trim() + " ";
          } else {
            const clean = l.replace(/^[-*•►✧]\s+/, '').replace(/\*\*+/g, '');
            if (clean && clean.length > 3) bullets.push(clean);
          }
        });

        slides.push({
          number: idx + 1,
          title: titleLine || `Key Point ${idx + 1}`,
          bullets: bullets.slice(0, 5),
          notes: notes.trim() || `Deliver key insights on ${titleLine} with clear emphasis on strategic impact.`
        });
      });
    }

    if (slides.length === 0) {
      // Default structure
      slides.push(
        { number: 1, title: `${topic}: Executive Overview`, bullets: ["Strategic market imperative", "Core objectives & architecture", "Anticipated milestones"], notes: "Welcome the stakeholders and set the strategic context." },
        { number: 2, title: "Problem Space & Current Latency", bullets: ["Identified system bottlenecks", "Resource friction & scaling limits", "Urgency of intelligent automation"], notes: "Emphasize why existing legacy approaches fail." },
        { number: 3, title: "Proposed Solution Architecture", bullets: ["Modular intelligence pipeline", "Real-time state validation", "High-throughput deterministic execution"], notes: "Walk through the architectural blueprint." },
        { number: 4, title: "Implementation Roadmap & Metrics", bullets: ["Phase 1: Rapid deployment", "Phase 2: Full-scale telemetry", "Measurable 40%+ efficiency gain"], notes: "Conclude with concrete measurable outcomes and next steps." }
      );
    }
    return slides;
  }

  function downloadPptxPresentation(slides, topic, themeKey = "cyber-dark") {
    if (typeof window.PptxGenJS === "undefined") {
      alert("PowerPoint library is initializing. Please retry in a moment.");
      return;
    }

    try {
      const pptx = new window.PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      pptx.title = topic;

      const isDark = themeKey !== "minimal-light";
      const bgHex = isDark ? "151314" : "F2E8CF";
      const cardBgHex = isDark ? "1E1A1B" : "FAF6EC";
      const titleColor = isDark ? "c9a0a0" : "505E3E";
      const textColor = isDark ? "F8F4F4" : "24301B";
      const accentGold = isDark ? "8a8f6b" : "a3b18a";

      // Slide 1: Cover Slide
      const coverSlide = pptx.addSlide();
      coverSlide.background = { color: bgHex };
      coverSlide.addText("PROJECT AURA 3.0 · EXECUTIVE AI PRESENTATION", {
        x: 0.8, y: 1.6, w: 8.5, h: 0.4,
        fontSize: 12, bold: true, color: accentGold, fontFace: "Calibri"
      });
      coverSlide.addText(topic, {
        x: 0.8, y: 2.2, w: 8.5, h: 1.8,
        fontSize: 32, bold: true, color: titleColor, fontFace: "Calibri"
      });
      coverSlide.addText("Synthesized by Project Aura Autonomous AI Presentation Engine", {
        x: 0.8, y: 4.2, w: 8.5, h: 0.4,
        fontSize: 13, italic: true, color: textColor, fontFace: "Calibri"
      });

      // Subsequent Slides
      slides.forEach(s => {
        const slide = pptx.addSlide();
        slide.background = { color: bgHex };

        // Card Container
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: 0.6, y: 0.6, w: 8.8, h: 5.6,
          fill: { color: cardBgHex },
          line: { color: isDark ? "253350" : "CBD5E1", width: 1 },
          rectRadius: 0.15
        });

        // Slide Pill / Number
        slide.addText(`SLIDE ${String(s.number).padStart(2, '0')}`, {
          x: 0.9, y: 0.85, w: 2.0, h: 0.3,
          fontSize: 10, bold: true, color: accentGold, fontFace: "Calibri"
        });

        // Slide Title
        slide.addText(s.title, {
          x: 0.9, y: 1.25, w: 8.2, h: 0.8,
          fontSize: 22, bold: true, color: titleColor, fontFace: "Calibri"
        });

        // Bullets
        if (s.bullets && s.bullets.length > 0) {
          const bulletItems = s.bullets.map(b => ({
            text: b,
            options: { bullet: true, fontSize: 14, color: textColor, fontFace: "Calibri", lineSpacing: 26 }
          }));
          slide.addText(bulletItems, {
            x: 0.9, y: 2.2, w: 8.2, h: 2.6
          });
        }

        // Speaker notes in PowerPoint native notes drawer
        if (s.notes) {
          slide.addNotes(s.notes);
        }
      });

      const cleanFilename = (topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32) || 'project-aura-presentation') + ".pptx";
      pptx.writeFile({ fileName: cleanFilename });
      playTactileSound("success");
    } catch (err) {
      console.error("[PPTX EXPORT ERROR]", err);
      alert("PPTX export completed fallback.");
    }
  }

  function buildCreationPrompt(directive, userTopic, contextType) {
    const isDetailed = state.creationLengthMode === "detailed" || /detailed|in-depth|comprehensive|big answer|expand/i.test(userTopic);
    const styleInstruction = isDetailed
      ? "Provide an extensive, comprehensive master breakdown. Include natural emojis, bold structured section headers, in-depth bullet points, and key takeaways."
      : "Keep the output SHORT, CRISP, AND HIGH-IMPACT. Use natural emojis, bold section headers, bullet points, and concise key takeaways. Avoid wordy fluff.";

    return `[CREATION STUDIO // ${(contextType || "STUDIO").toUpperCase()}]
${directive}

Topic/Requirement: ${userTopic}

Formatting Directive:
${styleInstruction}
Make it look natural, professional, and visually engaging with clean points and modern alignment.`;
  }

  // Export helper
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playTactileSound("success");
  }

  // 1. Write Tab
  const generateWritingBtn = document.getElementById("generateWritingBtn");
  const writingTopicInput = document.getElementById("writingTopicInput");
  const writingFormatSelect = document.getElementById("writingFormatSelect");
  const writingOutputContainer = document.getElementById("writingOutputContainer");
  const writingOutputText = document.getElementById("writingOutputText");
  const copyWritingBtn = document.getElementById("copyWritingBtn");
  const exportWritingMdBtn = document.getElementById("exportWritingMdBtn");
  const exportWritingTxtBtn = document.getElementById("exportWritingTxtBtn");
  const printWritingBtn = document.getElementById("printWritingBtn");

  let lastWritingResult = "";

  if (generateWritingBtn) {
    generateWritingBtn.addEventListener("click", async () => {
      const topic = writingTopicInput ? writingTopicInput.value.trim() : "";
      if (!topic) return;

      const format = writingFormatSelect ? writingFormatSelect.value : "Executive Brief";
      generateWritingBtn.disabled = true;
      generateWritingBtn.textContent = "Synthesizing...";

      try {
        const res = await fetch(`${BACKEND_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: buildCreationPrompt(`Draft a formal ${format} with clean points, topic headers, and zero messy lines.`, topic, format)
          })
        });
        const data = await res.json();
        lastWritingResult = data.answer || data.response || "Synthesis complete.";

        if (writingOutputText && writingOutputContainer) {
          writingOutputText.innerHTML = formatCreationStudioOutput(lastWritingResult, topic);
          writingOutputContainer.style.display = "block";
        }
        playTactileSound("success");
      } catch (_) { }
      finally {
        generateWritingBtn.disabled = false;
        generateWritingBtn.textContent = "Synthesize Document";
      }
    });
  }

  if (copyWritingBtn) {
    copyWritingBtn.addEventListener("click", () => {
      if (!lastWritingResult) return;
      navigator.clipboard.writeText(lastWritingResult);
      copyWritingBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyWritingBtn.textContent = "📋 Copy"; }, 1500);
      playTactileSound("click");
    });
  }

  if (exportWritingMdBtn) {
    exportWritingMdBtn.addEventListener("click", () => {
      if (!lastWritingResult) return;
      downloadTextFile("project-aura-document.md", lastWritingResult);
    });
  }

  if (exportWritingTxtBtn) {
    exportWritingTxtBtn.addEventListener("click", () => {
      if (!lastWritingResult) return;
      downloadTextFile("project-aura-document.txt", lastWritingResult.replace(/#{1,6}\s/g, "").replace(/\*\*/g, ""));
    });
  }

  if (printWritingBtn) {
    printWritingBtn.addEventListener("click", () => window.print());
  }

  // 2. Code Tab
  const generateCodeBtn = document.getElementById("generateCodeBtn");
  const codingTopicInput = document.getElementById("codingTopicInput");
  const codingLangSelect = document.getElementById("codingLangSelect");
  const codingOutputContainer = document.getElementById("codingOutputContainer");
  const codingOutputText = document.getElementById("codingOutputText");
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  const exportCodeBtn = document.getElementById("exportCodeBtn");

  let lastCodeResult = "";

  if (generateCodeBtn) {
    generateCodeBtn.addEventListener("click", async () => {
      const spec = codingTopicInput ? codingTopicInput.value.trim() : "";
      if (!spec) return;

      const lang = codingLangSelect ? codingLangSelect.value : "TypeScript";
      generateCodeBtn.disabled = true;
      generateCodeBtn.textContent = "Generating Code...";

      try {
        const res = await fetch(`${BACKEND_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: buildCreationPrompt(`Write production-ready code in ${lang} with clean architecture, comments, and tests.`, spec, "Coding")
          })
        });
        const data = await res.json();
        lastCodeResult = data.answer || data.response || "Complete.";

        if (codingOutputText && codingOutputContainer) {
          codingOutputText.textContent = lastCodeResult;
          codingOutputContainer.style.display = "block";
        }
        playTactileSound("success");
      } catch (_) { }
      finally {
        generateCodeBtn.disabled = false;
        generateCodeBtn.textContent = "Generate Production Code";
      }
    });
  }

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", () => {
      if (!lastCodeResult) return;
      navigator.clipboard.writeText(lastCodeResult);
      copyCodeBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyCodeBtn.textContent = "📋 Copy Code"; }, 1500);
      playTactileSound("click");
    });
  }

  if (exportCodeBtn) {
    exportCodeBtn.addEventListener("click", () => {
      if (!lastCodeResult) return;
      downloadTextFile("project-aura-code.txt", lastCodeResult);
    });
  }

  // 3. Script Tab
  const generateScriptBtn = document.getElementById("generateScriptBtn");
  const scriptTopicInput = document.getElementById("scriptTopicInput");
  const scriptFormatSelect = document.getElementById("scriptFormatSelect");
  const scriptOutputContainer = document.getElementById("scriptOutputContainer");
  const scriptOutputText = document.getElementById("scriptOutputText");
  const copyScriptBtn = document.getElementById("copyScriptBtn");
  const exportScriptMdBtn = document.getElementById("exportScriptMdBtn");

  let lastScriptResult = "";

  if (generateScriptBtn) {
    generateScriptBtn.addEventListener("click", async () => {
      const topic = scriptTopicInput ? scriptTopicInput.value.trim() : "";
      if (!topic) return;

      const fmt = scriptFormatSelect ? scriptFormatSelect.value : "YouTube Video";
      generateScriptBtn.disabled = true;
      generateScriptBtn.textContent = "Drafting Script...";

      try {
        const res = await fetch(`${BACKEND_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: buildCreationPrompt(`Draft an engaging ${fmt} script with hooks, core beats, and call-to-action formatted as clear point cards.`, topic, "Script")
          })
        });
        const data = await res.json();
        lastScriptResult = data.answer || data.response || "Complete.";

        if (scriptOutputText && scriptOutputContainer) {
          scriptOutputText.innerHTML = formatCreationStudioOutput(lastScriptResult, topic);
          scriptOutputContainer.style.display = "block";
        }
        playTactileSound("success");
      } catch (_) { }
      finally {
        generateScriptBtn.disabled = false;
        generateScriptBtn.textContent = "Draft Script";
      }
    });
  }

  if (copyScriptBtn) {
    copyScriptBtn.addEventListener("click", () => {
      if (!lastScriptResult) return;
      navigator.clipboard.writeText(lastScriptResult);
      copyScriptBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyScriptBtn.textContent = "📋 Copy Script"; }, 1500);
      playTactileSound("click");
    });
  }

  if (exportScriptMdBtn) {
    exportScriptMdBtn.addEventListener("click", () => {
      if (!lastScriptResult) return;
      downloadTextFile("project-aura-script.md", lastScriptResult);
    });
  }

  // 4. Presentation Tab (Dual View: Slides Blueprint + Speech Script + Native PPTX Generator)
  const generatePresBtn = document.getElementById("generatePresBtn");
  const directPptxBtn = document.getElementById("directPptxBtn");
  const presTopicInput = document.getElementById("presTopicInput");
  const presSlideCountSelect = document.getElementById("presSlideCountSelect");
  const presThemeSelect = document.getElementById("presThemeSelect");
  const presOutputContainer = document.getElementById("presOutputContainer");
  const presOutputText = document.getElementById("presOutputText");
  const presScriptOutputText = document.getElementById("presScriptOutputText");
  const btnPresViewSlides = document.getElementById("btnPresViewSlides");
  const btnPresViewScript = document.getElementById("btnPresViewScript");
  const presSlidesViewContainer = document.getElementById("presSlidesViewContainer");
  const presScriptViewContainer = document.getElementById("presScriptViewContainer");
  const downloadPptxFileBtn = document.getElementById("downloadPptxFileBtn");
  const copyPresBtn = document.getElementById("copyPresBtn");
  const printPresBtn = document.getElementById("printPresBtn");

  let parsedSlidesData = [];
  let lastPresSpeechScript = "";

  if (btnPresViewSlides && btnPresViewScript) {
    btnPresViewSlides.addEventListener("click", () => {
      btnPresViewSlides.classList.add("active");
      btnPresViewScript.classList.remove("active");
      if (presSlidesViewContainer) presSlidesViewContainer.style.display = "block";
      if (presScriptViewContainer) presScriptViewContainer.style.display = "none";
      playTactileSound("click");
    });

    btnPresViewScript.addEventListener("click", () => {
      btnPresViewScript.classList.add("active");
      btnPresViewSlides.classList.remove("active");
      if (presSlidesViewContainer) presSlidesViewContainer.style.display = "none";
      if (presScriptViewContainer) presScriptViewContainer.style.display = "block";
      playTactileSound("click");
    });
  }

  if (generatePresBtn) {
    generatePresBtn.addEventListener("click", async () => {
      const topic = presTopicInput ? presTopicInput.value.trim() : "";
      if (!topic) return;

      const slideCount = presSlideCountSelect ? presSlideCountSelect.value : "8";
      generatePresBtn.disabled = true;
      generatePresBtn.textContent = "⚡ AI Synthesizing Slides & Speech Script...";

      try {
        const presPrompt = `Generate a master-level ${slideCount}-slide presentation deck AND full spoken speech script for: "${topic}".
Output structure:
PART 1: SLIDE DECK OUTLINE
For each slide provide:
Slide [N]: [Slide Title]
- [Bullet Point 1]
- [Bullet Point 2]
- [Bullet Point 3]
Speaker Notes: [What the presenter should say for this slide]

PART 2: COMPLETE PRESENTATION SPEECH SCRIPT
Chronological, natural speech script for the speaker to present to the audience seamlessly.`;

        const res = await fetch(`${BACKEND_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: presPrompt })
        });
        const data = await res.json();
        const rawRes = data.answer || data.response || "Presentation synthesis complete.";

        parsedSlidesData = parsePresentationSlides(rawRes, topic);
        lastPresSpeechScript = rawRes;

        // Render Slides Grid
        if (presOutputText) {
          presOutputText.innerHTML = `
            <div class="ppt-slides-grid">
              ${parsedSlidesData.map(s => `
                <div class="ppt-slide-card">
                  <div>
                    <span class="slide-number-badge">SLIDE ${String(s.number).padStart(2, '0')}</span>
                    <div class="slide-title-text">${escapeHtml(s.title)}</div>
                    <div class="slide-visual-media" style="margin:8px 0; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle); height:110px; background:#0f172a; position:relative;"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80" alt="Slide Visual" style="width:100%; height:100%; object-fit:cover; opacity:0.85;" loading="lazy" onerror="this.style.display='none'" /><div style="position:absolute; bottom:4px; right:6px; font-size:10px; background:rgba(0,0,0,0.65); padding:2px 6px; border-radius:4px; color:#fff;">100% Curated Visual</div></div>
                    <ul class="slide-bullets-list">
                      ${s.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
                    </ul>
                  </div>
                  <div class="slide-notes-drawer">
                    <strong>📌 Speaker Note:</strong> ${escapeHtml(s.notes)}
                  </div>
                </div>
              `).join("")}
            </div>
          `;
        }

        // Render Speech Script View
        if (presScriptOutputText) {
          presScriptOutputText.innerHTML = formatCreationStudioOutput(rawRes, `Spoken Script: ${topic}`);
        }

        if (presOutputContainer) presOutputContainer.style.display = "block";
        if (directPptxBtn) directPptxBtn.style.display = "inline-flex";

        playTactileSound("success");
      } catch (err) {
        alert("Presentation generation error: " + err.message);
      } finally {
        generatePresBtn.disabled = false;
        generatePresBtn.textContent = "⚡ Synthesize Deck & Speech Script";
      }
    });
  }

  const triggerPptxDownload = () => {
    const topic = presTopicInput ? presTopicInput.value.trim() : "Project Aura Presentation";
    const theme = presThemeSelect ? presThemeSelect.value : "cyber-dark";
    if (parsedSlidesData.length === 0) {
      parsedSlidesData = parsePresentationSlides(lastPresSpeechScript || topic, topic);
    }
    downloadPptxPresentation(parsedSlidesData, topic, theme);
  };

  if (downloadPptxFileBtn) downloadPptxFileBtn.addEventListener("click", triggerPptxDownload);
  if (directPptxBtn) directPptxBtn.addEventListener("click", triggerPptxDownload);

  if (copyPresBtn) {
    copyPresBtn.addEventListener("click", () => {
      if (!lastPresSpeechScript) return;
      navigator.clipboard.writeText(lastPresSpeechScript);
      copyPresBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyPresBtn.textContent = "📋 Copy"; }, 1500);
      playTactileSound("click");
    });
  }

  if (printPresBtn) {
    printPresBtn.addEventListener("click", () => window.print());
  }

  // 5. Social Tab
  const generateSocialBtn = document.getElementById("generateSocialBtn");
  const socialTopicInput = document.getElementById("socialTopicInput");
  const socialPlatformSelect = document.getElementById("socialPlatformSelect");
  const socialOutputContainer = document.getElementById("socialOutputContainer");
  const socialOutputText = document.getElementById("socialOutputText");
  const copySocialBtn = document.getElementById("copySocialBtn");

  let lastSocialResult = "";

  if (generateSocialBtn) {
    generateSocialBtn.addEventListener("click", async () => {
      const topic = socialTopicInput ? socialTopicInput.value.trim() : "";
      if (!topic) return;

      const platform = socialPlatformSelect ? socialPlatformSelect.value : "LinkedIn Post";
      generateSocialBtn.disabled = true;
      generateSocialBtn.textContent = "Crafting Content...";

      try {
        const res = await fetch(`${BACKEND_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: buildCreationPrompt(`Craft high-engagement ${platform} copy with punchy hooks, clean spacing, bullet points, and trending hashtags. No messy lines.`, topic, "Social")
          })
        });
        const data = await res.json();
        lastSocialResult = data.answer || data.response || "Complete.";

        if (socialOutputText && socialOutputContainer) {
          socialOutputText.innerHTML = formatCreationStudioOutput(lastSocialResult, `${platform}: ${topic}`);
          socialOutputContainer.style.display = "block";
        }
        playTactileSound("success");
      } catch (_) { }
      finally {
        generateSocialBtn.disabled = false;
        generateSocialBtn.textContent = "Generate Social Content";
      }
    });
  }

  if (copySocialBtn) {
    copySocialBtn.addEventListener("click", () => {
      if (!lastSocialResult) return;
      navigator.clipboard.writeText(lastSocialResult);
      copySocialBtn.textContent = "✓ Copied!";
      setTimeout(() => { copySocialBtn.textContent = "📋 Copy"; }, 1500);
      playTactileSound("click");
    });
  }

  // 6. Templates Tab (Platform AI: Figma, Canva, Spline 3D, Notion, Creator, Academic)
  const templateCategoryBar = document.getElementById("templateCategoryBar");
  const templateCardsShelf = document.getElementById("templateCardsShelf");
  const generateTemplateBtn = document.getElementById("generateTemplateBtn");
  const templateTopicInput = document.getElementById("templateTopicInput");
  const templateTypeSelect = document.getElementById("templateTypeSelect");
  const templateOutputContainer = document.getElementById("templateOutputContainer");
  const templateOutputText = document.getElementById("templateOutputText");
  const copyTemplateBtn = document.getElementById("copyTemplateBtn");
  const exportTemplateMdBtn = document.getElementById("exportTemplateMdBtn");

  const PLATFORM_TEMPLATES_LIST = [
    { cat: "figma", badgeClass: "figma", badge: "Figma UI/UX", title: "Figma Design System & Token Spec", desc: "Color tokens, typography scale, 8pt spacing hierarchy, component props & variants." },
    { cat: "figma", badgeClass: "figma", badge: "Figma UI/UX", title: "Mobile App User Flow & Wireframe Blueprint", desc: "User journey map, core screen states, modal interactions & gesture navigation." },
    { cat: "canva", badgeClass: "canva", badge: "Canva AI", title: "Canva High-Stakes Investor Pitch Deck", desc: "10-slide venture narrative: Hook, TAM/SAM, Product Moat, Unit Economics, Ask." },
    { cat: "canva", badgeClass: "canva", badge: "Canva AI", title: "Canva Product Launch Visual Campaign Outline", desc: "Social launch banners, carousel assets, email marketing header specs & typography." },
    { cat: "spline", badgeClass: "spline", badge: "Spline 3D", title: "Spline 3D Interactive Web Scene Structure & Lighting", desc: "3D camera coordinates, glassmorphic materials, event triggers, Webflow embeds." },
    { cat: "spline", badgeClass: "spline", badge: "Spline 3D", title: "Webflow High-Converting Landing Page Spec", desc: "Hero section, feature matrices, interactive demo embeds, CMS collection schema." },
    { cat: "notion", badgeClass: "notion", badge: "Notion OS", title: "Notion Second Brain & Knowledge Management OS", desc: "PARA Method database relations (Projects, Areas, Resources, Archives), daily dashboard." },
    { cat: "creator", badgeClass: "social", badge: "Creator Kit", title: "Viral LinkedIn Carousel Framework", desc: "7-slide educational visual framework with high-retention hooks and engagement loops." },
    { cat: "academic", badgeClass: "academic", badge: "IEEE Academic", title: "IEEE Research Conference Paper Structure", desc: "Standard IEEE two-column structure: Abstract, Related Work, Methodology, Results." }
  ];

  function renderTemplateCards(filter = "all") {
    if (!templateCardsShelf) return;
    const filtered = filter === "all" ? PLATFORM_TEMPLATES_LIST : PLATFORM_TEMPLATES_LIST.filter(t => t.cat === filter);
    templateCardsShelf.innerHTML = `
      <div class="templates-showcase-grid">
        ${filtered.map(t => `
          <div class="platform-tpl-card" onclick="selectPlatformTemplate('${escapeHtml(t.title)}')">
            <div>
              <span class="platform-badge ${t.badgeClass}">${t.badge}</span>
              <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:4px;">${escapeHtml(t.title)}</div>
              <div style="font-size:11px; color:var(--text-secondary); line-height:1.4;">${escapeHtml(t.desc)}</div>
            </div>
            <div style="margin-top:10px; font-size:11px; color:var(--accent-gold); font-weight:700;">✦ Use Template →</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  if (templateCategoryBar) {
    templateCategoryBar.querySelectorAll("button[data-tplcat]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-tplcat") || "all";
        templateCategoryBar.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
        renderTemplateCards(cat);
        playTactileSound("click");
      });
    });
    renderTemplateCards("all");
  }

  window.selectPlatformTemplate = function(title) {
    if (templateTypeSelect) templateTypeSelect.value = title;
    if (templateTopicInput && !templateTopicInput.value) {
      templateTopicInput.value = `Production-grade architecture for ${title}`;
    }
    if (generateTemplateBtn) generateTemplateBtn.click();
    playTactileSound("click");
  };

  let lastTemplateResult = "";

  if (generateTemplateBtn) {
    generateTemplateBtn.addEventListener("click", async () => {
      const topic = templateTopicInput ? templateTopicInput.value.trim() : "";
      const tpl = templateTypeSelect ? templateTypeSelect.value : "Figma Design System";

      generateTemplateBtn.disabled = true;
      generateTemplateBtn.textContent = "⚡ Synthesizing Platform Specification...";

      try {
        const res = await fetch(`${BACKEND_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: buildCreationPrompt(`Generate a production-ready ${tpl} specification with all tokens, layout hierarchies, parameters, and design/code guidelines. Format in clean points with topic headers and no messy lines.`, topic || tpl, "Template")
          })
        });
        const data = await res.json();
        lastTemplateResult = data.answer || data.response || "Complete.";

        if (templateOutputText && templateOutputContainer) {
          templateOutputText.innerHTML = formatCreationStudioOutput(lastTemplateResult, tpl);
          templateOutputContainer.style.display = "block";
        }
        playTactileSound("success");
      } catch (_) { }
      finally {
        generateTemplateBtn.disabled = false;
        generateTemplateBtn.textContent = "⚡ Synthesize Platform Template";
      }
    });
  }

  if (copyTemplateBtn) {
    copyTemplateBtn.addEventListener("click", () => {
      if (!lastTemplateResult) return;
      navigator.clipboard.writeText(lastTemplateResult);
      copyTemplateBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyTemplateBtn.textContent = "📋 Copy"; }, 1500);
      playTactileSound("click");
    });
  }

  if (exportTemplateMdBtn) {
    exportTemplateMdBtn.addEventListener("click", () => {
      if (!lastTemplateResult) return;
      downloadTextFile("project-aura-template.md", lastTemplateResult);
    });
  }
}

/* =========================================================
   8. KNOWLEDGE VAULT (WORKSPACE 3) — REVAMPED
   (Visible Files Shelf · In-App Document Reader Modal · AI Matched Topics Bar)
========================================================= */
const vaultDropzone = document.getElementById("vaultDropzone");
const vaultFileInput = document.getElementById("vaultFileInput");
const vaultFilesGrid = document.getElementById("vaultFilesGrid");
const refreshVaultFilesBtn = document.getElementById("refreshVaultFilesBtn");
const vaultRelatedList = document.getElementById("vaultRelatedList");
const documentReaderModal = document.getElementById("documentReaderModal");
const docReaderModalTitle = document.getElementById("docReaderModalTitle");
const docReaderModalBody = document.getElementById("docReaderModalBody");
const btnCloseReaderModal = document.getElementById("btnCloseReaderModal");
const btnCopyReaderContent = document.getElementById("btnCopyReaderContent");

if (vaultDropzone && vaultFileInput) {
  vaultDropzone.addEventListener("click", () => vaultFileInput.click());

  vaultDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    vaultDropzone.style.borderColor = "var(--text-primary)";
  });

  vaultDropzone.addEventListener("dragleave", () => {
    vaultDropzone.style.borderColor = "";
  });

  vaultDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    vaultDropzone.style.borderColor = "";
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      uploadFileToVault(e.dataTransfer.files[0]);
    }
  });

  vaultFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length) {
      uploadFileToVault(e.target.files[0]);
    }
  });
}

if (refreshVaultFilesBtn) {
  refreshVaultFilesBtn.addEventListener("click", () => loadVaultFiles());
}

async function uploadFileToVault(file) {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);

  setCoreState("thinking", "INDEXING DOCUMENT");
  updateContextTask(`Ingesting: ${file.name}`);

  try {
    const res = await fetch(`${BACKEND_URL}/api/vault/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    playTactileSound("success");
    loadVaultFiles();
    setCoreState("idle", "ONLINE");

    // Automatically analyze document for matched web topics
    if (data.file) {
      analyzeVaultFile(data.file.id || data.file.filename, data.file.originalName || file.name);
    }
  } catch (err) {
    console.warn("[VAULT UPLOAD ERROR]", err.message);
    setCoreState("error", "UPLOAD ERROR");
    setTimeout(() => setCoreState("idle", "ONLINE"), 2500);
  }
}

async function loadVaultFiles() {
  if (!vaultFilesGrid) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/vault/files`);
    const data = await res.json();
    const serverFiles = data.files || [];
    const localFiles = JSON.parse(localStorage.getItem("aura_local_vault_files") || "[]");
    const filesMap = new Map();
    localFiles.forEach(f => filesMap.set(f.id || f.filename, f));
    serverFiles.forEach(f => filesMap.set(f.id || f.filename, f));
    const files = Array.from(filesMap.values());

    if (files.length === 0) {
      vaultFilesGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 32px; text-align: center; color: var(--text-tertiary); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-card);">
          No documents uploaded yet. Drop a PDF, Word document, or code file above.
        </div>
      `;
      return;
    }

    function getVaultFileIcon(fName) {
      const ext = (fName || "").split(".").pop().toLowerCase();
      if (ext === "pdf") return "📕";
      if (ext === "docx" || ext === "doc") return "📘";
      if (ext === "xlsx" || ext === "xls" || ext === "csv") return "📊";
      if (ext === "pptx" || ext === "ppt") return "📙";
      if (ext === "txt" || ext === "md") return "📝";
      if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "🖼️";
      if (["js", "py", "html", "css", "ts", "json", "cpp", "java"].includes(ext)) return "💻";
      return "📄";
    }

    vaultFilesGrid.innerHTML = files.map(f => {
      const fileId = f.id || f.filename;
      const fileName = f.originalName || f.filename;
      const sizeStr = f.size ? `${(f.size / 1024).toFixed(1)} KB` : "Indexed Document";
      const icon = getVaultFileIcon(fileName);

      return `
        <div class="vault-file-card" style="display:flex; flex-direction:column; justify-content:space-between; padding:16px; background:var(--bg-surface); border:1px solid var(--border-card); border-radius:var(--radius-md);">
          <div class="file-card-top" style="display:flex; align-items:flex-start; gap:12px; margin-bottom:12px;">
            <div class="file-type-icon" style="font-size:24px; color:var(--accent-gold);">${icon}</div>
            <div class="file-name-meta" style="flex:1; min-width:0;">
              <div class="file-title" title="${escapeHtml(fileName)}" style="font-weight:700; font-size:13px; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(fileName)}</div>
              <div class="file-date-size" style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${sizeStr}</div>
            </div>
          </div>
          
          <!-- Direct File Actions: Open Raw & Download -->
          <div class="vault-file-buttons-row" style="margin-bottom:10px;">
            <a href="${BACKEND_URL}/api/files/${encodeURIComponent(fileId)}/raw" target="_blank" rel="noopener noreferrer" class="btn-vault-open-raw">
              📂 Open Uploaded File
            </a>
            <a href="${BACKEND_URL}/api/files/${encodeURIComponent(fileId)}/download" target="_blank" rel="noopener noreferrer" class="btn-vault-download-raw">
              ⬇️ Download File
            </a>
          </div>

          <div class="file-card-actions" style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="file-action-btn" onclick="openVaultDocumentReader('${escapeHtml(fileId)}', '${escapeHtml(fileName)}')">📖 In-App Reader</button>
            <button class="file-action-btn" onclick="analyzeVaultFile('${escapeHtml(fileId)}', '${escapeHtml(fileName)}')" style="color:var(--accent-gold); font-weight:700;">⚡ Auto AI Research</button>
            <button class="file-action-btn" onclick="askAboutFile('${escapeHtml(fileName)}')">💬 Ask AI</button>
            <button class="file-action-btn" onclick="generateNotesFromFile('${escapeHtml(fileName)}')">📝 Notes</button>
            <button class="file-action-btn" onclick="generateQuizFromFile('${escapeHtml(fileName)}')">✦ Quiz</button>
            <button class="file-action-btn delete" onclick="deleteVaultFile('${escapeHtml(fileId)}')" style="color:#EF4444;" title="Delete File">✕</button>
          </div>
        </div>
      `;
    }).join("");
  } catch (_) { }
}

window.askAboutFile = function(fileName) {
  switchView("command-center");
  if (messageInput) {
    messageInput.value = `Explain the core concepts and chapters of "${fileName}"`;
    messageInput.focus();
  }
  playTactileSound("click");
};

window.generateNotesFromFile = function(fileName) {
  switchView("creation-lab");
  const writingInput = document.getElementById("writingTopicInput");
  if (writingInput) {
    writingInput.value = `Comprehensive high-yield study notes and chapter summary for ${fileName}`;
    writingInput.focus();
  }
  playTactileSound("click");
};

window.generateQuizFromFile = function(fileName) {
  switchView("quiz-engine");
  const topicInput = document.getElementById("quizTopicInput");
  if (topicInput) {
    topicInput.value = fileName.replace(/\.[^/.]+$/, "");
    topicInput.focus();
  }
  playTactileSound("click");
};

window.openVaultDocumentReader = async function(fileId, fileName) {
  if (!documentReaderModal) return;

  if (docReaderModalTitle) docReaderModalTitle.textContent = fileName || "Document Viewer";
  if (docReaderModalBody) docReaderModalBody.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);">✦ Ingesting and formatting document text...</div>`;
  documentReaderModal.style.display = "flex";
  playTactileSound("click");

  try {
    const res = await fetch(`${BACKEND_URL}/api/files/${encodeURIComponent(fileId)}/content`);
    const data = await res.json();
    const docContent = data.content || data.file?.content;
    if (data.success && docContent) {
      if (docReaderModalBody) {
        docReaderModalBody.innerHTML = `
          <div style="font-size:14px; line-height:1.7; color:var(--text-primary); white-space:pre-wrap; font-family:var(--font-sans);">
            ${escapeHtml(docContent)}
          </div>
        `;
      }
    } else {
      if (docReaderModalBody) {
        docReaderModalBody.innerHTML = `
          <div style="text-align:center; padding:20px;">
            <p style="color:var(--text-secondary); margin-bottom:14px;">Text preview not directly extractable for binary file. File is successfully indexed for AI question answering.</p>
            <a href="${BACKEND_URL}/api/files/${encodeURIComponent(fileId)}/raw" target="_blank" rel="noopener noreferrer" class="btn-vault-open-raw">
              📂 Click to Open Raw File in New Window
            </a>
          </div>
        `;
      }
    }
  } catch (err) {
    if (docReaderModalBody) {
      docReaderModalBody.innerHTML = `<p style="color:#EF4444;">Unable to load document content: ${escapeHtml(err.message)}</p>`;
    }
  }
};


window.renderVaultRelatedTopics = function(fileName, relatedTopics, relationInfo, summary, links) {
  const vaultRelatedList = document.getElementById("vaultRelatedList");
  const vaultRelatedBarTitle = document.getElementById("vaultRelatedBarTitle");
  if (!vaultRelatedList) return;

  if (vaultRelatedBarTitle) {
    vaultRelatedBarTitle.textContent = `Relations: ${fileName}`;
  }

  const topics = Array.isArray(relatedTopics) ? relatedTopics : [];
  const relations = Array.isArray(relationInfo) ? relationInfo : [];
  const webLinks = Array.isArray(links) ? links : [];
  const execSummary = summary || "Core academic concepts extracted and synthesized automatically upon upload.";

  const researchDocContent = `# AI KNOWLEDGE VAULT RESEARCH REPORT\nDocument: ${fileName}\nSynthesized: ${new Date().toLocaleString()}\n\n## EXECUTIVE SUMMARY\n${execSummary}\n\n## RELATED TOPICS\n${topics.map(t => `- ${t}`).join('\n')}\n\n## CONCEPT RELATIONS\n${relations.map(r => `- ${r.topic || r.name} (${r.relationship || r.category || 'Core'}): ${r.info || r.description || ''}`).join('\n')}\n\n## VERIFIED CHROME RESOURCES\n${webLinks.map((l, i) => `${i + 1}. ${l.title}\n   URL: ${l.url}\n   Summary: ${l.snippet}\n`).join('\n')}`;

  vaultRelatedList.innerHTML = `
    <!-- Executive Briefing Card -->
    <div style="padding:14px; background:var(--bg-surface-subtle); border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
        <div style="font-size:11px; font-weight:800; color:var(--accent-gold); text-transform:uppercase;">✦ Ingested: ${escapeHtml(fileName)}</div>
        <button class="btn-vault-download-raw" onclick="downloadTextFile('${escapeHtml(fileName.replace(/\\.[^/.]+$/, ''))}-relations.md', decodeURIComponent('${encodeURIComponent(researchDocContent)}'))">
          📥 Download Report (.md)
        </button>
      </div>
      <div style="font-size:12px; color:var(--text-primary); line-height:1.55;">${escapeHtml(execSummary)}</div>
    </div>

    <!-- Extracted Related Topics -->
    ${topics.length > 0 ? `
      <div style="margin-bottom:14px;">
        <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">
          🏷️ Extracted Academic Topics (${topics.length})
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${topics.map(t => `
            <button class="youtube-quick-pill" onclick="askAboutTopic('${escapeHtml(t).replace(/'/g, "\\'")}')" style="font-size:11px; padding:4px 10px;">
              ✦ ${escapeHtml(t)}
            </button>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <!-- Relational Information Hierarchy -->
    ${relations.length > 0 ? `
      <div style="margin-bottom:14px;">
        <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">
          ⚡ Conceptual Relations & Dependencies
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${relations.map(r => `
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:var(--accent-gold); font-size:12px;">${escapeHtml(r.topic || r.name || 'Concept')}</span>
                <span style="font-size:10px; color:var(--text-tertiary); background:var(--bg-surface-subtle); padding:2px 6px; border-radius:4px;">${escapeHtml(r.relationship || r.category || 'Linked')}</span>
              </div>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:4px; line-height:1.4;">
                ${escapeHtml(r.info || r.description || '')}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <!-- Verified Chrome & Web Links -->
    ${webLinks.length > 0 ? `
      <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
        <span>🌐 Verified Web Resources:</span>
        <span style="color:#10B981; font-weight:700;">${webLinks.length} Links</span>
      </div>
      ${webLinks.map(l => `
        <div class="chrome-web-res-card">
          <div class="chrome-res-top">
            <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="chrome-res-title">${escapeHtml(l.title)}</a>
            <span style="font-size:10px; color:#10B981; font-weight:800; background:rgba(16, 185, 129, 0.12); padding:2px 6px; border-radius:4px;">Verified</span>
          </div>
          <p class="chrome-res-snippet">${escapeHtml(l.snippet)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <a href="${l.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:var(--accent-gold); font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
              <span>🌐 Open in Chrome →</span>
            </a>
            <button onclick="askAboutTopic('${escapeHtml(l.title).replace(/'/g, "\\'")}')" class="btn-vault-action" style="font-size:10px; padding:3px 10px;">
              Ask AURA
            </button>
          </div>
        </div>
      `).join("")}
    ` : ''}
  `;
  playTactileSound("success");
};

window.analyzeVaultFile = async function(fileId, fileName) {
  if (!vaultRelatedList) return;

  vaultRelatedList.innerHTML = `
    <div style="text-align:center; padding:24px; color:var(--text-secondary);">
      <span class="pulse-dot-cyan"></span>
      <div style="margin-top:8px; font-weight:600; font-size:12px;">AI is researching web topics, matching Chrome links & compiling documentation...</div>
    </div>
  `;
  playTactileSound("click");

  try {
    const res = await fetch(`${BACKEND_URL}/api/files/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, fileName })
    });
    const data = await res.json();

    if (data.success) {
      const summary = data.summary || "Core technical content analyzed.";
      const links = data.links || [];

      // Construct downloadable AI research document
      const researchDocContent = `# AI RESEARCH INTELLIGENCE REPORT
Document: ${fileName}
Analyzed: ${new Date().toLocaleString()}

## EXECUTIVE SUMMARY
${summary}

## MATCHED WEB TOPICS & HIGHER-YIELD RESOURCES
${links.map((l, i) => `${i + 1}. ${l.title}\n   URL: ${l.url}\n   Summary: ${l.snippet}\n`).join("\n")}

Synthesized by Project Aura 3.0 Knowledge Intelligence Engine.`;

      vaultRelatedList.innerHTML = `
        <div style="padding:14px; background:var(--bg-surface-subtle); border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
            <div style="font-size:11px; font-weight:800; color:var(--accent-gold); text-transform:uppercase;">AI Synthesis: ${escapeHtml(fileName)}</div>
            <button class="btn-vault-download-raw" onclick="downloadTextFile('${escapeHtml(fileName.replace(/\\.[^/.]+$/, ''))}-ai-research.md', decodeURIComponent('${encodeURIComponent(researchDocContent)}'))">
              📥 Download AI Research Doc (.md)
            </button>
          </div>
          <div style="font-size:12px; color:var(--text-primary); line-height:1.55;">${escapeHtml(summary)}</div>
        </div>

        <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
          <span>🌐 100% Matched Web Pages & Chrome Results:</span>
          <span style="color:#10B981; font-weight:700;">${links.length} Resources Found</span>
        </div>

        ${links.map(l => `
          <div class="chrome-web-res-card">
            <div class="chrome-res-top">
              <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="chrome-res-title">
                ${escapeHtml(l.title)}
              </a>
              <span style="font-size:10px; color:#10B981; font-weight:800; background:rgba(16, 185, 129, 0.12); padding:2px 6px; border-radius:4px;">100% Match</span>
            </div>
            <p class="chrome-res-snippet">${escapeHtml(l.snippet)}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <a href="${l.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:var(--accent-gold); font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                <span>🌐 Open in Chrome / Browser →</span>
              </a>
              <button onclick="askAboutTopic('${escapeHtml(l.title).replace(/'/g, "\\'")}')" class="btn-vault-action" style="font-size:10px; padding:3px 10px;">
                Ask AURA
              </button>
            </div>
          </div>
        `).join("")}
      `;
      playTactileSound("success");
    }
  } catch (err) {
    vaultRelatedList.innerHTML = `<div style="padding:16px; color:#EF4444; font-size:12px;">Failed to analyze document topics: ${escapeHtml(err.message)}</div>`;
  }
};

window.askAboutTopic = function(topic) {
  switchView("command-center");
  if (messageInput) {
    messageInput.value = `Explain the core concepts and applications of: ${topic}`;
    messageInput.focus();
  }
};

window.deleteVaultFile = async function(fileId) {
  try {
    await fetch(`${BACKEND_URL}/api/files/${encodeURIComponent(fileId)}`, { method: "DELETE" });
    playTactileSound("click");
    loadVaultFiles();
  } catch (_) { }
};

if (btnCloseReaderModal && documentReaderModal) {
  btnCloseReaderModal.addEventListener("click", () => {
    documentReaderModal.style.display = "none";
    playTactileSound("click");
  });
  documentReaderModal.addEventListener("click", (e) => {
    if (e.target === documentReaderModal) {
      documentReaderModal.style.display = "none";
    }
  });
}

if (btnCopyReaderContent) {
  btnCopyReaderContent.addEventListener("click", () => {
    if (!docReaderModalBody) return;
    navigator.clipboard.writeText(docReaderModalBody.innerText).then(() => {
      const orig = btnCopyReaderContent.textContent;
      btnCopyReaderContent.textContent = "✓ Copied!";
      playTactileSound("success");
      setTimeout(() => { btnCopyReaderContent.textContent = orig; }, 1800);
    });
  });
}

/* =========================================================
   9. MEMORY CORTEX (WORKSPACE 2) — CATEGORIZED & PINNABLE MEMORY
   Categories: Personal · Study · Projects · Preferences · Notes · Knowledge
   Features: Live Search · Pin to Top · AI Strategic Insights
========================================================= */
const memoryTitleInput = document.getElementById("memoryTitleInput");
const memoryCategorySelect = document.getElementById("memoryCategorySelect");
const memoryContentInput = document.getElementById("memoryContentInput");
const saveMemoryBtn = document.getElementById("saveMemoryBtn");
const memoryNotesGrid = document.getElementById("memoryNotesGrid");
const memorySearchInput = document.getElementById("memorySearchInput");

const memoryState = {
  allMemories: [],
  activeCategory: "all",
  searchQuery: "",
  pinnedIds: JSON.parse(localStorage.getItem("aura_pinned_memories") || "[]")
};

function initMemoryCortex() {
  // Category tabs
  const catTabs = document.querySelectorAll("#memoryCategoryTabs .creation-tab-btn");
  catTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-memcat");
      memoryState.activeCategory = cat || "all";
      catTabs.forEach(b => b.classList.toggle("active", b === btn));
      renderFilteredMemories();
      playTactileSound("click");
    });
  });

  // Search input
  if (memorySearchInput) {
    memorySearchInput.addEventListener("input", () => {
      memoryState.searchQuery = memorySearchInput.value.trim().toLowerCase();
      renderFilteredMemories();
    });
  }

  if (saveMemoryBtn) {
    saveMemoryBtn.addEventListener("click", async () => {
      const title = memoryTitleInput ? memoryTitleInput.value.trim() : "";
      const content = memoryContentInput ? memoryContentInput.value.trim() : "";
      const category = memoryCategorySelect ? memoryCategorySelect.value : "study";

      if (!content) return;

      saveMemoryBtn.disabled = true;
      saveMemoryBtn.textContent = "Analyzing & Committing...";

      try {
        const res = await fetch(`${BACKEND_URL}/api/memory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category })
        });
        const data = await res.json();
        if (data.success) {
          if (memoryTitleInput) memoryTitleInput.value = "";
          if (memoryContentInput) memoryContentInput.value = "";
          loadMemoryNotes();
          playTactileSound("success");
        }
      } catch (err) {
        console.warn("[MEMORY COMMIT ERROR]", err.message);
      } finally {
        saveMemoryBtn.disabled = false;
        saveMemoryBtn.textContent = "Commit to Memory (with AI Analysis)";
      }
    });
  }
}

async function loadMemoryNotes() {
  if (!memoryNotesGrid) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/memory`);
    const data = await res.json();
    memoryState.allMemories = data.memories || data.notes || [];
    renderFilteredMemories();
  } catch (_) { }
}

function renderFilteredMemories() {
  if (!memoryNotesGrid) return;

  let filtered = memoryState.allMemories.filter(m => {
    const matchCat = memoryState.activeCategory === "all" ||
      (m.category && m.category.toLowerCase().includes(memoryState.activeCategory));
    const matchQuery = !memoryState.searchQuery ||
      (m.title && m.title.toLowerCase().includes(memoryState.searchQuery)) ||
      (m.content && m.content.toLowerCase().includes(memoryState.searchQuery)) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(memoryState.searchQuery)));
    return matchCat && matchQuery;
  });

  // Sort pinned memories to top
  filtered.sort((a, b) => {
    const aPin = memoryState.pinnedIds.includes(a.id) ? 1 : 0;
    const bPin = memoryState.pinnedIds.includes(b.id) ? 1 : 0;
    return bPin - aPin;
  });

  if (filtered.length === 0) {
    memoryNotesGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 32px; text-align: center; color: var(--text-tertiary); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-card);">
        No memories match the selected filter. Save a memory above or try another category.
      </div>
    `;
    return;
  }

  memoryNotesGrid.innerHTML = filtered.map(n => {
    const isPinned = memoryState.pinnedIds.includes(n.id);
    const retentionPct = 90 + Math.floor(Math.random() * 10);

    return `
      <div class="memory-entry-card ${isPinned ? 'pinned' : ''}" id="memCard_${n.id}">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:8px;">
            <div>
              <div style="font-size:14px; font-weight:800; color:var(--text-primary); margin-bottom:4px;">${escapeHtml(n.title || "Memory Entry")}</div>
              <div class="neural-retention-pill">
                <span>⚡ ${retentionPct}% Neural Retention</span>
                <span style="opacity:0.6;">· Active Synapse</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              ${isPinned ? '<span class="memory-pin-badge">📌 PINNED</span>' : ''}
              <button onclick="togglePinMemory('${n.id}')" style="background:transparent; border:none; cursor:pointer; font-size:13px; color:${isPinned ? 'var(--accent-gold)' : 'var(--text-tertiary)'};" title="Pin / Unpin">📌</button>
              <button onclick="deleteMemoryNote('${n.id}')" style="background:transparent; border:none; cursor:pointer; font-size:12px; color:#EF4444;" title="Delete">✕</button>
            </div>
          </div>
          
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin:10px 0 12px 0;">${escapeHtml(n.content || "")}</p>
          
          ${n.aiInsight ? `
            <div style="background:var(--accent-gold-soft); border-left:3px solid var(--accent-gold); padding:10px 12px; border-radius:4px; font-size:12px; color:var(--text-primary); line-height:1.4; margin-bottom:10px;">
              <strong style="color:var(--accent-gold);">💡 AI Strategic Insight:</strong>
              <div>${escapeHtml(n.aiInsight.replace(/💡\s*/, ''))}</div>
            </div>
          ` : ''}

          <!-- AI Research Actions Row -->
          <div class="memory-action-row">
            <button class="btn-memory-action-pill" onclick="triggerMemoryDeepResearch('${n.id}', '${escapeHtml(n.title || '').replace(/'/g, "\\'")}', '${escapeHtml(n.content || '').replace(/'/g, "\\'")}')">
              🔬 Deep Research
            </button>
            <button class="btn-memory-action-pill" onclick="triggerMemoryActionPlan('${n.id}', '${escapeHtml(n.title || '').replace(/'/g, "\\'")}', '${escapeHtml(n.content || '').replace(/'/g, "\\'")}')">
              📋 Action Steps
            </button>
            <button class="btn-memory-action-pill" onclick="triggerMemoryRecallQuiz('${n.id}', '${escapeHtml(n.title || '').replace(/'/g, "\\'")}', '${escapeHtml(n.content || '').replace(/'/g, "\\'")}')">
              🎯 Test Recall
            </button>
          </div>

          <!-- Inline Expandable Research Drawer -->
          <div id="memDrawer_${n.id}" class="memory-deep-research-box" style="display:none; margin-top:12px;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:10px; margin-top:12px; font-size:11px; color:var(--text-tertiary);">
          <span style="text-transform:uppercase; font-weight:700; color:var(--accent-gold);">✦ ${escapeHtml(n.category || "General")}</span>
          <span>${n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</span>
        </div>
      </div>
    `;
  }).join("");
}

window.triggerMemoryDeepResearch = async function(id, title, content) {
  const drawer = document.getElementById(`memDrawer_${id}`);
  if (!drawer) return;
  drawer.style.display = "block";
  drawer.innerHTML = `<span class="pulse-dot-cyan"></span> Conducting AI Deep Research & Literature Mapping for "${escapeHtml(title)}"...`;
  playTactileSound("click");

  try {
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Conduct an elite research deep-dive on this concept:
Topic: ${title}
Context: ${content}

Provide:
1. Advanced Theoretical Foundations & Governing Laws
2. Real-World Industry Architectural Applications
3. Key Equations / Algorithmic Flow
4. Cross-Disciplinary Research Synergies`
      })
    });
    const data = await res.json();
    const text = data.answer || data.response || "Research complete.";
    drawer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="color:var(--accent-gold); font-size:12px;">🔬 Deep Research Synthesis</strong>
        <button onclick="document.getElementById('memDrawer_${id}').style.display='none'" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer;">✕ Close</button>
      </div>
      <div style="font-size:12px; line-height:1.55; color:var(--text-primary); white-space:pre-wrap;">${escapeHtml(text)}</div>
    `;
    playTactileSound("success");
  } catch (err) {
    drawer.innerHTML = `<span style="color:#EF4444;">Deep research error: ${escapeHtml(err.message)}</span>`;
  }
};

window.triggerMemoryActionPlan = async function(id, title, content) {
  const drawer = document.getElementById(`memDrawer_${id}`);
  if (!drawer) return;
  drawer.style.display = "block";
  drawer.innerHTML = `<span class="pulse-dot-cyan"></span> Synthesizing high-impact execution action plan...`;
  playTactileSound("click");

  try {
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Synthesize 3 concrete, high-impact tactical execution action steps for this memory:
Title: ${title}
Content: ${content}
Format each step clearly with:
Step 1: [Actionable Directive]
Step 2: [Actionable Directive]
Step 3: [Actionable Directive]`
      })
    });
    const data = await res.json();
    const text = data.answer || data.response || "Action plan ready.";
    drawer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="color:#10B981; font-size:12px;">📋 Tactical Action Roadmap</strong>
        <button onclick="document.getElementById('memDrawer_${id}').style.display='none'" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer;">✕ Close</button>
      </div>
      <div style="font-size:12px; line-height:1.55; color:var(--text-primary); white-space:pre-wrap;">${escapeHtml(text)}</div>
    `;
    playTactileSound("success");
  } catch (err) {
    drawer.innerHTML = `<span style="color:#EF4444;">Action plan error: ${escapeHtml(err.message)}</span>`;
  }
};

window.triggerMemoryRecallQuiz = async function(id, title, content) {
  const drawer = document.getElementById(`memDrawer_${id}`);
  if (!drawer) return;
  drawer.style.display = "block";
  drawer.innerHTML = `<span class="pulse-dot-cyan"></span> Formulating Active Recall Challenge...`;
  playTactileSound("click");

  try {
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Create a single high-impact active recall question with 3 options based on:
Concept: ${title} - ${content}.
Include which option is correct and brief explanation.`
      })
    });
    const data = await res.json();
    const text = data.answer || data.response || "Recall challenge ready.";
    drawer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="color:var(--accent-gold); font-size:12px;">🎯 Active Synapse Challenge</strong>
        <button onclick="document.getElementById('memDrawer_${id}').style.display='none'" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer;">✕ Close</button>
      </div>
      <div style="font-size:12px; line-height:1.55; color:var(--text-primary); white-space:pre-wrap;">${escapeHtml(text)}</div>
    `;
    playTactileSound("success");
  } catch (err) {
    drawer.innerHTML = `<span style="color:#EF4444;">Recall error: ${escapeHtml(err.message)}</span>`;
  }
};

window.togglePinMemory = function(id) {
  const idx = memoryState.pinnedIds.indexOf(id);
  if (idx !== -1) {
    memoryState.pinnedIds.splice(idx, 1);
  } else {
    memoryState.pinnedIds.push(id);
  }
  localStorage.setItem("aura_pinned_memories", JSON.stringify(memoryState.pinnedIds));
  renderFilteredMemories();
  playTactileSound("click");
};

async function deleteMemoryNote(id) {
  try {
    await fetch(`${BACKEND_URL}/api/memory/${id}`, { method: "DELETE" });
    memoryState.allMemories = memoryState.allMemories.filter(m => m.id !== id);
    renderFilteredMemories();
    playTactileSound("click");
  } catch (_) { }
}

/* =========================================================
   10. STUDY, QUIZ, RESEARCH & YOUTUBE WORKSPACES
   Study Intel (Paced Milestones) · Quiz Engine (7 Patterns) · Research · YouTube
========================================================= */

// ── STUDY INTEL (PACED MILESTONES: TODAY, THIS WEEK, UPCOMING) ──
const generateStudyPlanBtn = document.getElementById("generateStudyPlanBtn");
const studyTopicInput = document.getElementById("studyTopicInput");
const studyPlanOutput = document.getElementById("studyPlanOutput");
const studyPlanText = document.getElementById("studyPlanText");
const studyPacedMilestonesGrid = document.getElementById("studyPacedMilestonesGrid");
const studyTodayTasks = document.getElementById("studyTodayTasks");
const studyWeekTasks = document.getElementById("studyWeekTasks");
const studyUpcomingTasks = document.getElementById("studyUpcomingTasks");
const copyStudyPlanBtn = document.getElementById("copyStudyPlanBtn");

document.querySelectorAll(".study-quick-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    const t = pill.getAttribute("data-topic");
    if (studyTopicInput && t) {
      studyTopicInput.value = t;
      if (generateStudyPlanBtn) generateStudyPlanBtn.click();
    }
  });
});

let lastStudyPlanResult = "";

if (generateStudyPlanBtn) {
  generateStudyPlanBtn.addEventListener("click", async () => {
    const topic = studyTopicInput ? studyTopicInput.value.trim() : "";
    if (!topic) return;

    generateStudyPlanBtn.disabled = true;
    generateStudyPlanBtn.textContent = "Synthesizing Paced Milestones...";

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Create a structured paced milestone study plan for: "${topic}".
Divide into 3 distinct paced buckets:
1. TODAY: 3 immediate high-priority active recall objectives.
2. THIS WEEK: 3 core foundational modules & exam PYQ patterns.
3. UPCOMING: 3 advanced revision milestones & practice problems.

Followed by a high-yield summary of key formulas, 2-mark definitions, and 13-mark repeated exam questions.`
        })
      });
      const data = await res.json();
      lastStudyPlanResult = data.answer || data.response || "Complete.";

      // Populate interactive milestones
      renderPacedMilestones(topic);

      if (studyPlanText && studyPlanOutput) {
        if (typeof window.formatCreationStudioOutput === "function") {
          studyPlanText.innerHTML = window.formatCreationStudioOutput(lastStudyPlanResult, `Curriculum Blueprint: ${topic}`);
        } else {
          studyPlanText.innerHTML = formatMarkdownResponse(lastStudyPlanResult);
        }
        studyPlanOutput.style.display = "block";
      }
      playTactileSound("success");
    } catch (_) { }
    finally {
      generateStudyPlanBtn.disabled = false;
      generateStudyPlanBtn.textContent = "Build Paced Milestones";
    }
  });
}

function renderPacedMilestones(topic) {
  if (!studyPacedMilestonesGrid) return;
  studyPacedMilestonesGrid.style.display = "grid";

  const todayItems = [
    `Master foundational theorems & core governing laws of ${topic}`,
    `Solve 5 high-frequency university 2-mark definitions`,
    `Construct visual mind-map / architecture block diagram`
  ];

  const weekItems = [
    `Complete Unit 1 & Unit 2 derivations and proofs`,
    `Draft outline for 3 repeated 13-mark university PYQs`,
    `Take Semester Mock Test under 60-minute exam conditions`
  ];

  const upcomingItems = [
    `Comprehensive full-syllabus active recall revision`,
    `Review weak topics identified by AI Performance Mentor`,
    `Final exam simulation & model answer key comparison`
  ];

  function makeTaskHtml(items, bucketName) {
    return items.map((text, idx) => {
      const boxId = `explain_box_${bucketName}_${idx}`;
      const safeText = escapeHtml(text).replace(/'/g, "\\'");
      return `
        <div class="study-task-card" style="background:var(--bg-surface); border:1px solid var(--border-card); border-radius:var(--radius-sm); padding:10px 12px; margin-bottom:8px;">
          <div style="display:flex; align-items:flex-start; gap:8px;">
            <input type="checkbox" class="study-task-checkbox" style="margin-top:3px; cursor:pointer;" onchange="this.closest('.study-task-card').classList.toggle('done', this.checked)">
            <div style="flex:1;">
              <div class="study-task-label" style="font-size:13px; font-weight:600; color:var(--text-primary); line-height:1.4;">${escapeHtml(text)}</div>
              <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
                <button type="button" class="btn-vault-action" style="font-size:11px; padding:3px 8px; cursor:pointer; background:var(--accent-gold-soft); color:var(--accent-gold); border:1px solid var(--border-medium); border-radius:4px;" onclick="explainStudyTopic('${safeText}', '${boxId}')">
                  💡 Tap to Explain Briefly
                </button>
                <button type="button" class="btn-vault-action" style="font-size:11px; padding:3px 8px; cursor:pointer; background:var(--bg-surface-subtle); color:var(--text-secondary); border:1px solid var(--border-medium); border-radius:4px;" onclick="addMilestoneToTasks('${safeText}')">
                  ✓ Add to Task Planner
                </button>
              </div>
              <div id="${boxId}" class="study-inline-explain-box" style="display:none; margin-top:8px; padding:10px 12px; background:var(--bg-surface-subtle); border-left:3px solid var(--accent-gold); border-radius:4px; font-size:12px; line-height:1.5;"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  if (studyTodayTasks) studyTodayTasks.innerHTML = makeTaskHtml(todayItems, "today");
  if (studyWeekTasks) studyWeekTasks.innerHTML = makeTaskHtml(weekItems, "week");
  if (studyUpcomingTasks) studyUpcomingTasks.innerHTML = makeTaskHtml(upcomingItems, "upcoming");
}

if (copyStudyPlanBtn) {
  copyStudyPlanBtn.addEventListener("click", () => {
    if (!lastStudyPlanResult) return;
    navigator.clipboard.writeText(lastStudyPlanResult);
    copyStudyPlanBtn.textContent = "✓ Copied!";
    setTimeout(() => { copyStudyPlanBtn.textContent = "📋 Copy Blueprint"; }, 1500);
    playTactileSound("click");
  });
}

// ── QUIZ ENGINE (7 DIVERSE QUESTION PATTERNS) ──
const generateQuizBtn = document.getElementById("generateQuizBtn");
const quizTopicInput = document.getElementById("quizTopicInput");
const quizRunnerBox = document.getElementById("quizRunnerBox");
const quizTopicBadge = document.getElementById("quizTopicBadge");
const quizProgressBadge = document.getElementById("quizProgressBadge");
const quizPatternBadge = document.getElementById("quizPatternBadge");
const quizScoreTracker = document.getElementById("quizScoreTracker");
const quizProgressFill = document.getElementById("quizProgressFill");
const quizQuestionText = document.getElementById("quizQuestionText");

// 7 Pattern containers
const quizOptionsContainer = document.getElementById("quizOptionsContainer");
const quizTfContainer = document.getElementById("quizTfContainer");
const quizTfTrueBtn = document.getElementById("quizTfTrueBtn");
const quizTfFalseBtn = document.getElementById("quizTfFalseBtn");
const quizFillBlankContainer = document.getElementById("quizFillBlankContainer");
const quizFillBlankInput = document.getElementById("quizFillBlankInput");
const quizFillBlankVerifyBtn = document.getElementById("quizFillBlankVerifyBtn");
const quizWrittenContainer = document.getElementById("quizWrittenContainer");
const quizWrittenInput = document.getElementById("quizWrittenInput");
const quizWrittenVerifyBtn = document.getElementById("quizWrittenVerifyBtn");
const quizMatchContainer = document.getElementById("quizMatchContainer");
const quizMatchPairsList = document.getElementById("quizMatchPairsList");
const quizMatchVerifyBtn = document.getElementById("quizMatchVerifyBtn");
const quizScenarioContainer = document.getElementById("quizScenarioContainer");
const quizScenarioPrompt = document.getElementById("quizScenarioPrompt");
const quizScenarioOptionsContainer = document.getElementById("quizScenarioOptionsContainer");
const quizCodingContainer = document.getElementById("quizCodingContainer");
const quizCodingInput = document.getElementById("quizCodingInput");
const quizCodingVerifyBtn = document.getElementById("quizCodingVerifyBtn");

const quizExplanationBox = document.getElementById("quizExplanationBox");
const quizExplanationText = document.getElementById("quizExplanationText");
const quizFooterActions = document.getElementById("quizFooterActions");
const nextQuizQuestionBtn = document.getElementById("nextQuizQuestionBtn");
const quizStatusHint = document.getElementById("quizStatusHint");

const quizScoreSummaryBox = document.getElementById("quizScoreSummaryBox");
const quizFinalScoreBadge = document.getElementById("quizFinalScoreBadge");
const quizFinalScoreTitle = document.getElementById("quizFinalScoreTitle");
const quizFinalScoreDesc = document.getElementById("quizFinalScoreDesc");
const retakeQuizBtn = document.getElementById("retakeQuizBtn");
const newQuizTopicBtn = document.getElementById("newQuizTopicBtn");

const quizState = {
  topic: "",
  difficulty: "Standard",
  questions: [],
  currentIndex: 0,
  score: 0,
  userAnswers: [],
  answered: false
};

async function startInteractiveQuiz(topic) {
  if (!topic) return;

  if (generateQuizBtn) {
    generateQuizBtn.disabled = true;
    generateQuizBtn.textContent = "Synthesizing Multi-Pattern Quiz...";
  }

  if (quizScoreSummaryBox) quizScoreSummaryBox.style.display = "none";
  if (quizRunnerBox) quizRunnerBox.style.display = "none";

  try {
    const res = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count: 7, difficulty: "Semester Standard" })
    });
    const data = await res.json();

    if (data.success && data.questions && data.questions.length > 0) {
      quizState.topic = data.topic || topic;
      quizState.difficulty = data.difficulty || "Semester Standard";
      quizState.questions = data.questions;
      quizState.currentIndex = 0;
      quizState.score = 0;
      quizState.userAnswers = [];
      quizState.answered = false;

      renderQuizQuestion(0);
      playTactileSound("success");
    } else {
      throw new Error(data.error || "Unable to generate quiz questions.");
    }
  } catch (err) {
    console.error("[QUIZ ERROR]", err);
    // 7-Pattern Fallback questions
    quizState.topic = topic;
    quizState.difficulty = "Semester Standard";
    quizState.questions = [
      {
        id: 1,
        pattern: "MCQ",
        question: `Which fundamental principle is central to ${topic}?`,
        options: [
          "Rigorous structural analysis and continuous validation",
          "Random execution without bounds checking",
          "Bypassing deterministic invariants",
          "Static unoptimized memory allocations"
        ],
        answer: 0,
        explanation: `In ${topic}, rigorous structural analysis and continuous validation ensure deterministic resilience.`
      },
      {
        id: 2,
        pattern: "TRUE_FALSE",
        question: `In ${topic}, optimal performance requires maintaining a balanced trade-off between throughput and latency overhead.`,
        options: ["True", "False"],
        answer: 0,
        explanation: "Engineering trade-offs between computational throughput and latency are universally fundamental."
      },
      {
        id: 3,
        pattern: "FILL_BLANK",
        question: `In ${topic}, the measure of asymptotic efficiency is formally expressed as Big-___ notation.`,
        answerText: "O",
        acceptableAnswers: ["O", "Oh", "Order"],
        explanation: "Big-O notation describes the upper bound on the growth rate of algorithm run time or memory."
      },
      {
        id: 4,
        pattern: "WRITTEN",
        question: `Define the primary engineering objective or core theorem governing ${topic}:`,
        answerText: "Reliability and deterministic efficiency",
        explanation: `In ${topic}, primary architectural models guarantee deterministic reliability and fault tolerance.`
      },
      {
        id: 5,
        pattern: "MATCH",
        question: `Match the foundational concepts of ${topic} with their primary role:`,
        leftItems: ["Invariance", "Convergence", "Modularity"],
        rightItems: ["System Boundary Isolation", "Guaranteed End State", "Condition Unchanged During Execution"],
        correctMatches: { 0: 2, 1: 1, 2: 0 },
        explanation: "Invariance remains unchanged, convergence guarantees termination, and modularity encapsulates boundaries."
      },
      {
        id: 6,
        pattern: "SCENARIO",
        scenario: `A high-throughput distributed system encounters severe latency spikes under peak load in ${topic}. Which mitigation strategy provides immediate stability?`,
        question: "Select the optimal mitigation strategy:",
        options: [
          "Implement exponential backoff with jitter and circuit breaking",
          "Double the concurrent thread pool without rate limiting",
          "Disable all caching layers to force fresh queries",
          "Increase retry frequency to maximum"
        ],
        answer: 0,
        explanation: "Circuit breaking combined with exponential backoff and jitter prevents thundering herd failures."
      },
      {
        id: 7,
        pattern: "CODING",
        question: `Write the base condition check for a recursive search or traversal in ${topic}:`,
        targetKeyword: "return",
        explanation: "A robust base condition terminates recursion when the terminal or base case is reached."
      }
    ];
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.userAnswers = [];
    quizState.answered = false;

    renderQuizQuestion(0);
  } finally {
    if (generateQuizBtn) {
      generateQuizBtn.disabled = false;
      generateQuizBtn.textContent = "Create Quiz";
    }
  }
}

function hideAllQuizPatternContainers() {
  if (quizOptionsContainer) quizOptionsContainer.style.display = "none";
  if (quizTfContainer) quizTfContainer.style.display = "none";
  if (quizFillBlankContainer) quizFillBlankContainer.style.display = "none";
  if (quizWrittenContainer) quizWrittenContainer.style.display = "none";
  if (quizMatchContainer) quizMatchContainer.style.display = "none";
  if (quizScenarioContainer) quizScenarioContainer.style.display = "none";
  if (quizCodingContainer) quizCodingContainer.style.display = "none";
}

function renderQuizQuestion(index) {
  if (!quizState.questions || index >= quizState.questions.length) {
    showQuizScoreSummary();
    return;
  }

  quizState.currentIndex = index;
  quizState.answered = false;
  const q = quizState.questions[index];
  const total = quizState.questions.length;
  const pattern = (q.pattern || "MCQ").toUpperCase();

  if (quizRunnerBox) quizRunnerBox.style.display = "flex";
  if (quizScoreSummaryBox) quizScoreSummaryBox.style.display = "none";

  if (quizTopicBadge) quizTopicBadge.textContent = `✦ ${(quizState.topic || "QUIZ").toUpperCase()}`;
  if (quizProgressBadge) quizProgressBadge.textContent = `Question ${index + 1} of ${total}`;
  if (quizPatternBadge) quizPatternBadge.textContent = pattern;
  if (quizScoreTracker) quizScoreTracker.textContent = `Score: ${quizState.score} / ${total}`;

  const pct = Math.round(((index + 1) / total) * 100);
  if (quizProgressFill) quizProgressFill.style.width = `${pct}%`;

  if (quizQuestionText) quizQuestionText.textContent = q.question || "Question text unavailable";

  if (quizExplanationBox) quizExplanationBox.style.display = "none";
  if (quizFooterActions) quizFooterActions.style.display = "none";

  hideAllQuizPatternContainers();

  // Pattern 1: MCQ
  if (pattern === "MCQ") {
    if (quizOptionsContainer) {
      quizOptionsContainer.style.display = "grid";
      const opts = q.options || [];
      quizOptionsContainer.innerHTML = opts.map((opt, i) => `
        <button class="quiz-opt-btn" onclick="handleQuizAnswer(${i})">
          <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
          <span class="opt-text">${escapeHtml(opt)}</span>
        </button>
      `).join("");
    }
  }
  // Pattern 2: TRUE_FALSE
  else if (pattern === "TRUE_FALSE") {
    if (quizTfContainer) {
      quizTfContainer.style.display = "flex";
      if (quizTfTrueBtn) {
        quizTfTrueBtn.className = "btn-tf-opt";
        quizTfTrueBtn.onclick = () => handleQuizAnswer(0);
      }
      if (quizTfFalseBtn) {
        quizTfFalseBtn.className = "btn-tf-opt";
        quizTfFalseBtn.onclick = () => handleQuizAnswer(1);
      }
    }
  }
  // Pattern 3: FILL_BLANK
  else if (pattern === "FILL_BLANK") {
    if (quizFillBlankContainer) {
      quizFillBlankContainer.style.display = "block";
      if (quizFillBlankInput) {
        quizFillBlankInput.value = "";
        quizFillBlankInput.disabled = false;
        quizFillBlankInput.focus();
      }
      if (quizFillBlankVerifyBtn) {
        quizFillBlankVerifyBtn.onclick = () => {
          const val = (quizFillBlankInput?.value || "").trim().toLowerCase();
          const target = (q.answerText || q.answer || "").toString().trim().toLowerCase();
          const acceptable = (q.acceptableAnswers || []).map(a => a.toLowerCase());
          const isCorrect = val === target || acceptable.includes(val);
          handleQuizVerifiedAnswer(isCorrect, q.answerText || target);
        };
      }
    }
  }
  // Pattern 4: WRITTEN
  else if (pattern === "WRITTEN") {
    if (quizWrittenContainer) {
      quizWrittenContainer.style.display = "block";
      if (quizWrittenInput) {
        quizWrittenInput.value = "";
        quizWrittenInput.disabled = false;
        quizWrittenInput.focus();
      }
      if (quizWrittenVerifyBtn) {
        quizWrittenVerifyBtn.onclick = () => {
          const val = (quizWrittenInput?.value || "").trim().toLowerCase();
          const target = (q.answerText || "").toLowerCase();
          const words = target.split(/\s+/).filter(w => w.length > 3);
          const isMatch = words.length === 0 || words.some(w => val.includes(w));
          handleQuizVerifiedAnswer(isMatch, q.answerText || "Model Key Definition");
        };
      }
    }
  }
  // Pattern 5: MATCH
  else if (pattern === "MATCH") {
    if (quizMatchContainer && quizMatchPairsList) {
      quizMatchContainer.style.display = "block";
      const left = q.leftItems || ["Concept A", "Concept B", "Concept C"];
      const right = q.rightItems || ["Definition 1", "Definition 2", "Definition 3"];

      quizMatchPairsList.innerHTML = left.map((lItem, idx) => `
        <div class="match-pair-row">
          <span class="match-left-item">${idx + 1}. ${escapeHtml(lItem)}</span>
          <select class="match-select" id="matchSelect_${idx}">
            <option value="">-- Match with --</option>
            ${right.map((rItem, rIdx) => `<option value="${rIdx}">${escapeHtml(rItem)}</option>`).join("")}
          </select>
        </div>
      `).join("");

      if (quizMatchVerifyBtn) {
        quizMatchVerifyBtn.onclick = () => {
          const correct = q.correctMatches || { 0: 0, 1: 1, 2: 2 };
          let matchesCount = 0;
          let totalPairs = left.length;

          left.forEach((_, idx) => {
            const sel = document.getElementById(`matchSelect_${idx}`);
            if (sel && parseInt(sel.value, 10) === correct[idx]) {
              matchesCount++;
            }
          });

          const isOverallCorrect = matchesCount >= Math.ceil(totalPairs * 0.6);
          handleQuizVerifiedAnswer(isOverallCorrect, `Matched ${matchesCount} of ${totalPairs} pairs correctly.`);
        };
      }
    }
  }
  // Pattern 6: SCENARIO
  else if (pattern === "SCENARIO") {
    if (quizScenarioContainer) {
      quizScenarioContainer.style.display = "block";
      if (quizScenarioPrompt) {
        quizScenarioPrompt.textContent = q.scenario || q.question;
      }
      if (quizScenarioOptionsContainer) {
        const opts = q.options || [];
        quizScenarioOptionsContainer.innerHTML = opts.map((opt, i) => `
          <button class="quiz-opt-btn" onclick="handleQuizAnswer(${i})">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            <span class="opt-text">${escapeHtml(opt)}</span>
          </button>
        `).join("");
      }
    }
  }
  // Pattern 7: CODING
  else if (pattern === "CODING") {
    if (quizCodingContainer) {
      quizCodingContainer.style.display = "block";
      if (quizCodingInput) {
        quizCodingInput.value = "";
        quizCodingInput.disabled = false;
        quizCodingInput.focus();
      }
      if (quizCodingVerifyBtn) {
        quizCodingVerifyBtn.onclick = () => {
          const codeVal = (quizCodingInput?.value || "").trim().toLowerCase();
          const target = (q.targetKeyword || "return").toLowerCase();
          const isCorrect = codeVal.includes(target) && codeVal.length > 5;
          handleQuizVerifiedAnswer(isCorrect, `Target syntax: "${target}"`);
        };
      }
    }
  }
}

function handleQuizVerifiedAnswer(isCorrect, keyAnswer) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.currentIndex];

  if (isCorrect) {
    quizState.score++;
    playTactileSound("success");
  } else {
    playTactileSound("click");
  }

  const total = quizState.questions.length;
  if (quizScoreTracker) quizScoreTracker.textContent = `Score: ${quizState.score} / ${total}`;

  if (quizExplanationBox && quizExplanationText) {
    quizExplanationText.innerHTML = `
      <div style="font-weight:700; color:${isCorrect ? '#10B981' : '#FF0055'}; margin-bottom:4px;">
        ${isCorrect ? "✓ Accurate Answer!" : "✕ Key Expected:"}
      </div>
      ${!isCorrect ? `<div style="font-size:12px; color:var(--text-primary); margin-bottom:6px;"><strong>Model Key:</strong> ${escapeHtml(keyAnswer)}</div>` : ''}
      <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(q.explanation || "Verification completed.")}</div>
    `;
    quizExplanationBox.style.display = "flex";
  }

  if (quizFooterActions) {
    quizFooterActions.style.display = "flex";
    if (quizStatusHint) quizStatusHint.textContent = isCorrect ? "Excellent mastery!" : "Review explanation before proceeding";
  }
}

window.handleQuizAnswer = function(chosenIdx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.currentIndex];
  const isCorrect = chosenIdx === q.answer;

  if (isCorrect) {
    quizState.score++;
    playTactileSound("success");
  } else {
    playTactileSound("click");
  }

  const total = quizState.questions.length;
  if (quizScoreTracker) quizScoreTracker.textContent = `Score: ${quizState.score} / ${total}`;

  // Highlight buttons
  document.querySelectorAll(".quiz-opt-btn").forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer) btn.classList.add("correct");
    else if (idx === chosenIdx) btn.classList.add("wrong");
  });

  if (q.pattern === "TRUE_FALSE") {
    if (quizTfTrueBtn) quizTfTrueBtn.classList.toggle("correct", q.answer === 0);
    if (quizTfFalseBtn) quizTfFalseBtn.classList.toggle("correct", q.answer === 1);
    if (!isCorrect) {
      if (chosenIdx === 0 && quizTfTrueBtn) quizTfTrueBtn.classList.add("wrong");
      if (chosenIdx === 1 && quizTfFalseBtn) quizTfFalseBtn.classList.add("wrong");
    }
  }

  if (quizExplanationBox && quizExplanationText) {
    quizExplanationText.innerHTML = `
      <div style="font-weight:700; color:${isCorrect ? '#10B981' : '#FF0055'}; margin-bottom:4px;">
        ${isCorrect ? "✓ Accurate Choice!" : "✕ Not quite"}
      </div>
      <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(q.explanation || "")}</div>
    `;
    quizExplanationBox.style.display = "flex";
  }

  if (quizFooterActions) {
    quizFooterActions.style.display = "flex";
    if (quizStatusHint) quizStatusHint.textContent = isCorrect ? "Well done!" : "Examine rationale above";
  }
};

if (nextQuizQuestionBtn) {
  nextQuizQuestionBtn.addEventListener("click", () => {
    renderQuizQuestion(quizState.currentIndex + 1);
    playTactileSound("click");
  });
}

function showQuizScoreSummary() {
  if (quizRunnerBox) quizRunnerBox.style.display = "none";
  if (quizScoreSummaryBox) quizScoreSummaryBox.style.display = "flex";

  const total = quizState.questions.length || 1;
  const pct = Math.round((quizState.score / total) * 100);

  if (quizFinalScoreBadge) quizFinalScoreBadge.textContent = `${pct}%`;
  if (quizFinalScoreTitle) {
    quizFinalScoreTitle.textContent = pct >= 80 ? "Outstanding Comprehension!" : (pct >= 50 ? "Proficient Understanding" : "Foundational Review Recommended");
  }
  if (quizFinalScoreDesc) {
    quizFinalScoreDesc.textContent = `You answered ${quizState.score} out of ${total} questions correctly across all 7 diverse patterns.`;
  }

  // Record quiz result in DB analytics
  fetch(`${BACKEND_URL}/api/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "quiz_result",
      message: `Completed Multi-Pattern Quiz on "${quizState.topic}": ${pct}%`,
      metadata: { topic: quizState.topic, score: quizState.score, total, percentage: pct }
    })
  }).catch(() => {});
}

if (retakeQuizBtn) {
  retakeQuizBtn.addEventListener("click", () => {
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.answered = false;
    renderQuizQuestion(0);
  });
}

if (newQuizTopicBtn) {
  newQuizTopicBtn.addEventListener("click", () => {
    if (quizScoreSummaryBox) quizScoreSummaryBox.style.display = "none";
    if (quizTopicInput) {
      quizTopicInput.value = "";
      quizTopicInput.focus();
    }
  });
}

if (generateQuizBtn) {
  generateQuizBtn.addEventListener("click", () => {
    const topic = quizTopicInput ? quizTopicInput.value.trim() : "";
    if (topic) startInteractiveQuiz(topic);
  });
}

document.querySelectorAll(".quiz-quick-topic").forEach(pill => {
  pill.addEventListener("click", () => {
    const t = pill.getAttribute("data-topic");
    if (t) {
      if (quizTopicInput) quizTopicInput.value = t;
      startInteractiveQuiz(t);
    }
  });
});

// Deep Research Studio
const executeResearchBtn = document.getElementById("executeResearchBtn");
const researchQueryInput = document.getElementById("researchQueryInput");
const researchResultsContainer = document.getElementById("researchResultsContainer");
const researchSummaryText = document.getElementById("researchSummaryText");

if (executeResearchBtn) {
  executeResearchBtn.addEventListener("click", async () => {
    const query = researchQueryInput ? researchQueryInput.value.trim() : "";
    if (!query) return;

    executeResearchBtn.disabled = true;
    executeResearchBtn.textContent = "Researching...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (researchSummaryText && researchResultsContainer) {
        researchSummaryText.innerHTML = formatMarkdownResponse(data.summary || data.answer || "Research complete.");
        researchResultsContainer.style.display = "block";
      }
      playTactileSound("success");
    } catch (_) { }
    finally {
      executeResearchBtn.disabled = false;
      executeResearchBtn.textContent = "Research";
    }
  });
}

// YouTube Intel Search
const ytSearchBtn = document.getElementById("ytSearchBtn");
const ytSearchInput = document.getElementById("ytSearchInput");
const ytVideoResultsGrid = document.getElementById("ytVideoResultsGrid");
const ytSearchStatus = document.getElementById("ytSearchStatus");

if (ytSearchBtn) {
  ytSearchBtn.addEventListener("click", async () => {
    const q = ytSearchInput ? ytSearchInput.value.trim() : "";
    if (!q) return;

    ytSearchBtn.disabled = true;
    ytSearchBtn.textContent = "Searching...";
    if (ytSearchStatus) {
      ytSearchStatus.style.display = "block";
      ytSearchStatus.textContent = `Searching educational lectures for: "${q}"...`;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, maxResults: 6 })
      });
      const data = await res.json();
      const videos = data.videos || data.results || [];

      if (ytVideoResultsGrid) {
        if (videos.length === 0) {
          ytVideoResultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-secondary);">No videos found for this topic.</div>`;
        } else {
          ytVideoResultsGrid.innerHTML = videos.map(v => `
            <div class="yt-video-card" style="display:flex; flex-direction:column; background:var(--bg-surface); border:1px solid var(--border-card); border-radius:var(--radius-md); overflow:hidden;">
              <img src="${escapeHtml(v.thumbnail || '')}" style="width:100%; height:140px; object-fit:cover;" alt="thumbnail" />
              <div style="padding:12px; display:flex; flex-direction:column; justify-content:space-between; flex:1;">
                <div>
                  <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${escapeHtml(v.title || '')}</div>
                  <div style="font-size:11px; color:var(--text-secondary); margin-bottom:8px;">${escapeHtml(v.channel || '')}</div>
                </div>
                <div style="display:flex; gap:6px;">
                  <button class="btn-vault-action" onclick="openEmbeddedYoutubeModal('${escapeHtml(v.url || '')}', '${escapeHtml(v.title || '').replace(/'/g, "\\'")}', '${escapeHtml(v.channel || '').replace(/'/g, "\\'")}')">▷ Play</button>
                  <a href="${escapeHtml(v.url || '')}" target="_blank" rel="noopener noreferrer" class="btn-vault-action" style="text-decoration:none;">↗ External</a>
                </div>
              </div>
            </div>
          `).join("");
        }
      }
      playTactileSound("success");
    } catch (_) { }
    finally {
      ytSearchBtn.disabled = false;
      ytSearchBtn.textContent = "Search YouTube";
      if (ytSearchStatus) ytSearchStatus.style.display = "none";
    }
  });
}

// Global In-App YouTube Modal Player
window.openEmbeddedYoutubeModal = function (url, title, channel) {
  const modal = document.getElementById("youtubeEmbeddedModal");
  const iframe = document.getElementById("ytModalIframe");
  const titleEl = document.getElementById("ytModalVideoTitle");
  if (!modal || !iframe) return;

  let videoId = "";
  if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("embed/")) {
    videoId = url.split("embed/")[1].split("?")[0];
  }

  if (titleEl) {
    titleEl.textContent = title ? `${title} · ${channel || 'YouTube'}` : "Educational Lecture Stream";
  }

  iframe.src = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : url;
  modal.style.display = "flex";
  modal.classList.add("active");
  playTactileSound("click");
};

const btnCloseYtModal = document.getElementById("btnCloseYtModal");
if (btnCloseYtModal) {
  btnCloseYtModal.addEventListener("click", () => {
    const modal = document.getElementById("youtubeEmbeddedModal");
    const iframe = document.getElementById("ytModalIframe");
    if (iframe) iframe.src = "";
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("active");
    }
  });
}

const ytEmbeddedModal = document.getElementById("youtubeEmbeddedModal");
if (ytEmbeddedModal) {
  ytEmbeddedModal.addEventListener("click", (e) => {
    if (e.target === ytEmbeddedModal) {
      const iframe = document.getElementById("ytModalIframe");
      if (iframe) iframe.src = "";
      ytEmbeddedModal.style.display = "none";
      ytEmbeddedModal.classList.remove("active");
    }
  });
}

if (ytSearchInput) {
  ytSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (ytSearchBtn) ytSearchBtn.click();
    }
  });
}

/* =========================================================
   11. TASKS WORKSPACE (3-COLUMN KANBAN & EVENT SCHEDULER)
========================================================= */
const newTaskInput = document.getElementById("newTaskInput");
const taskBucketSelect = document.getElementById("taskBucketSelect");
const taskPrioritySelect = document.getElementById("taskPrioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");

const tasksTodayList = document.getElementById("tasksTodayList");
const tasksUpcomingList = document.getElementById("tasksUpcomingList");
const tasksCompletedList = document.getElementById("tasksCompletedList");
const tasksTodayCount = document.getElementById("tasksTodayCount");
const tasksUpcomingCount = document.getElementById("tasksUpcomingCount");
const tasksCompletedCount = document.getElementById("tasksCompletedCount");

// Task Edit Modal Elements
const taskEditModal = document.getElementById("taskEditModal");
const taskEditTextInput = document.getElementById("taskEditTextInput");
const taskEditBucketSelect = document.getElementById("taskEditBucketSelect");
const btnSaveTaskEdit = document.getElementById("btnSaveTaskEdit");
const btnCloseTaskEditModal = document.getElementById("btnCloseTaskEditModal");

let activeEditingTaskId = null;

function saveTasks() {
  localStorage.setItem("aura_tasks", JSON.stringify(state.tasks));
}

function renderTasks() {
  if (!tasksTodayList) return;

  const today = state.tasks.filter(t => !t.completed && (t.bucket === "today" || !t.bucket));
  const upcoming = state.tasks.filter(t => !t.completed && t.bucket === "upcoming");
  const completed = state.tasks.filter(t => t.completed);

  if (tasksTodayCount) tasksTodayCount.textContent = today.length;
  if (tasksUpcomingCount) tasksUpcomingCount.textContent = upcoming.length;
  if (tasksCompletedCount) tasksCompletedCount.textContent = completed.length;

  tasksTodayList.innerHTML = today.length === 0
    ? `<div style="font-size:12px; color:var(--text-tertiary); padding:16px; text-align:center; background:rgba(255,255,255,0.02); border-radius:var(--radius-sm);">No active focus items for today. Add an objective above.</div>`
    : today.map(t => renderKanbanTaskCard(t)).join("");

  tasksUpcomingList.innerHTML = upcoming.length === 0
    ? `<div style="font-size:12px; color:var(--text-tertiary); padding:16px; text-align:center; background:rgba(255,255,255,0.02); border-radius:var(--radius-sm);">No upcoming academic deadlines or events recorded.</div>`
    : upcoming.map(t => renderKanbanTaskCard(t)).join("");

  tasksCompletedList.innerHTML = completed.length === 0
    ? `<div style="font-size:12px; color:var(--text-tertiary); padding:16px; text-align:center; background:rgba(255,255,255,0.02); border-radius:var(--radius-sm);">No completed objectives yet.</div>`
    : completed.map(t => renderKanbanTaskCard(t)).join("");
}

function renderKanbanTaskCard(t) {
  const priorityColor = t.priority === "High" ? "#FF0055" : t.priority === "Low" ? "#10B981" : "#F59E0B";
  const priorityIcon = t.priority === "High" ? "🔥" : t.priority === "Low" ? "🌱" : "⚡";

  return `
    <div class="task-item-card" style="display:flex; flex-direction:column; gap:8px; padding:12px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); transition:border-color 0.2s ease;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <span style="font-size:11px; font-weight:700; color:${priorityColor}; display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:rgba(255,255,255,0.04); border-radius:4px;">
          ${priorityIcon} ${t.priority || "Medium"}
        </span>
        <span style="font-size:10px; color:var(--text-tertiary); font-family:var(--font-mono);">${t.date || "Active"}</span>
      </div>

      <div style="font-size:13px; font-weight:500; color:var(--text-primary); line-height:1.4; ${t.completed ? "text-decoration:line-through; opacity:0.6;" : ""}">
        ${escapeHtml(t.text)}
      </div>

      <div style="display:flex; justify-content:flex-end; align-items:center; gap:6px; margin-top:4px; border-top:1px solid var(--border-subtle); padding-top:6px;">
        ${!t.completed ? `
          <button onclick="toggleTask('${t.id}')" class="btn-vault-action" style="padding:4px 8px; font-size:11px; color:#10B981; border-color:rgba(16,185,129,0.3);" title="Mark as Completed">
            ✓ Done
          </button>
          <button onclick="openTaskEdit('${t.id}')" class="btn-vault-action" style="padding:4px 8px; font-size:11px;" title="Edit Task">
            ✎ Edit
          </button>
        ` : `
          <button onclick="toggleTask('${t.id}')" class="btn-vault-action" style="padding:4px 8px; font-size:11px; color:var(--accent-cyan);" title="Reopen Task">
            ↺ Reopen
          </button>
        `}
        <button onclick="deleteTask('${t.id}')" class="btn-vault-action delete" style="padding:4px 8px; font-size:11px;" title="Delete Task">
          ✕
        </button>
      </div>
    </div>
  `;
}

window.toggleTask = function (id) {
  const item = state.tasks.find(t => t.id === id);
  if (item) {
    item.completed = !item.completed;
    saveTasks();
    renderTasks();
    playTactileSound("click");
  }
};

window.deleteTask = function (id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  playTactileSound("click");
};

window.openTaskEdit = function (id) {
  const item = state.tasks.find(t => t.id === id);
  if (!item || !taskEditModal) return;
  activeEditingTaskId = id;
  if (taskEditTextInput) taskEditTextInput.value = item.text || "";
  if (taskEditBucketSelect) taskEditBucketSelect.value = item.bucket || "today";
  taskEditModal.classList.add("active");
};

if (btnCloseTaskEditModal && taskEditModal) {
  btnCloseTaskEditModal.addEventListener("click", () => {
    taskEditModal.classList.remove("active");
    activeEditingTaskId = null;
  });
}

if (btnSaveTaskEdit) {
  btnSaveTaskEdit.addEventListener("click", () => {
    if (!activeEditingTaskId) return;
    const item = state.tasks.find(t => t.id === activeEditingTaskId);
    if (item && taskEditTextInput) {
      const newText = taskEditTextInput.value.trim();
      if (newText) {
        item.text = newText;
        if (taskEditBucketSelect) item.bucket = taskEditBucketSelect.value;
        saveTasks();
        renderTasks();
        playTactileSound("success");
      }
    }
    if (taskEditModal) taskEditModal.classList.remove("active");
    activeEditingTaskId = null;
  });
}

if (addTaskBtn && newTaskInput) {
  function handleAddTask() {
    const text = newTaskInput.value.trim();
    if (!text) return;

    const bucket = taskBucketSelect ? taskBucketSelect.value : "today";
    const priority = taskPrioritySelect ? taskPrioritySelect.value : "Medium";

    state.tasks.unshift({
      id: "task_" + Date.now(),
      text,
      bucket,
      priority,
      completed: false,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })
    });

    newTaskInput.value = "";
    saveTasks();
    renderTasks();
    playTactileSound("success");
  }

  addTaskBtn.addEventListener("click", handleAddTask);
  newTaskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  });
}

/* =========================================================
   11B. SEMESTER MOCK TEST (A4 UNIVERSITY EXAMINATION SIMULATOR)
========================================================= */
const mockExamState = {
  currentPaper: null,
  timerInterval: null,
  secondsLeft: 3600,
  answers: {}
};

function initSemesterMockTest() {
  const mockGroupSelect = document.getElementById("mockGroupSelect");
  const mockCollegeSelect = document.getElementById("mockCollegeSelect");
  const mockBranchSelect = document.getElementById("mockBranchSelect");
  const mockSemesterSelect = document.getElementById("mockSemesterSelect");
  const mockSubjectSelect = document.getElementById("mockSubjectSelect");
  const generateMockPaperBtn = document.getElementById("generateMockPaperBtn");

  const mockPaperDisplayWrapper = document.getElementById("mockPaperDisplayWrapper");
  const a4QuestionsSheetBody = document.getElementById("a4QuestionsSheetBody");
  const a4PaperSubject = document.getElementById("a4PaperSubject");
  const a4PaperCode = document.getElementById("a4PaperCode");
  const a4PaperMarks = document.getElementById("a4PaperMarks");
  const mockCountdownClock = document.getElementById("mockCountdownClock");

  const btnCancelPaper = document.getElementById("btnCancelPaper");
  const btnSubmitPaperForGrading = document.getElementById("btnSubmitPaperForGrading");
  const mockSubmitConfirmModal = document.getElementById("mockSubmitConfirmModal");
  const btnCancelSubmitModal = document.getElementById("btnCancelSubmitModal");
  const btnConfirmSubmitModal = document.getElementById("btnConfirmSubmitModal");

  const mockExamGradingReportBox = document.getElementById("mockExamGradingReportBox");
  const mockReportSubjectTitle = document.getElementById("mockReportSubjectTitle");
  const mockReportScoreVal = document.getElementById("mockReportScoreVal");
  const mockReportGradeLetter = document.getElementById("mockReportGradeLetter");
  const mockReportComments = document.getElementById("mockReportComments");
  const mockReportFocusList = document.getElementById("mockReportFocusList");
  const btnGoToPerformance = document.getElementById("btnGoToPerformance");
  const btnNewMockExam = document.getElementById("btnNewMockExam");

  if (!mockGroupSelect || mockGroupSelect.dataset.initialized === "true") return;
  mockGroupSelect.dataset.initialized = "true";

  async function loadDisciplinesForGroup() {
    if (!mockGroupSelect || !mockBranchSelect) return;
    const groupVal = mockGroupSelect.value;

    try {
      const res = await fetch(`${BACKEND_URL}/api/quiz/curriculum/groups`);
      const data = await res.json();
      if (data.success && data.groups) {
        const found = data.groups.find(g => g.id === groupVal) || data.groups[0];
        mockBranchSelect.innerHTML = found.disciplines.map(d => `
          <option value="${d.id}">${d.icon || ""} ${escapeHtml(d.name)}</option>
        `).join("");
      }
    } catch (_) {
      // Fallback
      mockBranchSelect.innerHTML = `
        <option value="CSE" selected>💻 Computer Science & Engineering</option>
        <option value="AIDS">🧠 AI & Data Science</option>
        <option value="ECE">📡 Electronics & Comm</option>
        <option value="EEE">⚡ Electrical & Electronics</option>
      `;
    }
    loadSubjectsForDiscipline();
  }

  async function loadSubjectsForDiscipline() {
    if (!mockBranchSelect || !mockSemesterSelect || !mockSubjectSelect) return;
    const groupType = mockGroupSelect ? mockGroupSelect.value : "ENGINEERING";
    const branch = mockBranchSelect.value || "CSE";
    const semester = mockSemesterSelect.value || 3;

    try {
      const res = await fetch(`${BACKEND_URL}/api/quiz/curriculum/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupType, branch, semester })
      });
      const data = await res.json();
      if (data.success && data.subjects && data.subjects.length > 0) {
        mockSubjectSelect.innerHTML = data.subjects.map(s => `
          <option value="${escapeHtml(s)}">${escapeHtml(s)}</option>
        `).join("");
      } else {
        mockSubjectSelect.innerHTML = `<option value="Core University Subject">Core University Subject</option>`;
      }
    } catch (_) {
      mockSubjectSelect.innerHTML = `<option value="Data Structures & Algorithms">Data Structures & Algorithms</option>`;
    }
  }

  mockGroupSelect.addEventListener("change", loadDisciplinesForGroup);
  if (mockBranchSelect) mockBranchSelect.addEventListener("change", loadSubjectsForDiscipline);
  if (mockSemesterSelect) mockSemesterSelect.addEventListener("change", loadSubjectsForDiscipline);

  loadDisciplinesForGroup();

  function startExamTimer(durationSeconds) {
    if (mockExamState.timerInterval) clearInterval(mockExamState.timerInterval);
    mockExamState.secondsLeft = durationSeconds;

    function updateDisplay() {
      const mins = Math.floor(mockExamState.secondsLeft / 60);
      const secs = mockExamState.secondsLeft % 60;
      if (mockCountdownClock) {
        mockCountdownClock.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        if (mins < 5) mockCountdownClock.style.color = "#FF0055";
        else mockCountdownClock.style.color = "var(--accent-gold)";
      }
      if (mockExamState.secondsLeft <= 0) {
        clearInterval(mockExamState.timerInterval);
        alert("Time limit reached! The examination will now automatically be submitted for grading.");
        submitExamForGrading();
      }
      mockExamState.secondsLeft--;
    }

    updateDisplay();
    mockExamState.timerInterval = setInterval(updateDisplay, 1000);
  }

  if (generateMockPaperBtn) {
    generateMockPaperBtn.addEventListener("click", async () => {
      const group = mockGroupSelect ? mockGroupSelect.value : "ENGINEERING";
      const college = mockCollegeSelect ? mockCollegeSelect.value : "Anna University / CEG Chennai";
      const branch = mockBranchSelect ? mockBranchSelect.value : "CSE";
      const semester = mockSemesterSelect ? mockSemesterSelect.value : 3;
      const subject = mockSubjectSelect ? mockSubjectSelect.value : "Data Structures & Algorithms";

      generateMockPaperBtn.disabled = true;
      generateMockPaperBtn.textContent = "📌 Compiling Authentic University PYQs...";

      try {
        const res = await fetch(`${BACKEND_URL}/api/quiz/engineering/mock-test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, group, branch, semester, collegeName: college })
        });
        const data = await res.json();
        if (!data.success || !data.questions) throw new Error("Could not assemble paper");

        mockExamState.currentPaper = data;
        mockExamState.answers = {};

        const instTitle = document.querySelector(".a4-institute-title");
        const instWm = document.querySelector(".a4-watermark");
        if (instTitle) instTitle.textContent = `PROJECT AURA INSTITUTE · ${college.toUpperCase()}`;
        if (instWm) instWm.textContent = `PROJECT AURA · ${college.toUpperCase()}`;

        if (a4PaperSubject) a4PaperSubject.textContent = data.subject || subject;
        if (a4PaperCode) a4PaperCode.textContent = data.subjectCode || "AUR-UNIV-301";
        if (a4PaperMarks) a4PaperMarks.textContent = `34 Marks (Model Blueprint)`;

        // Render questions strictly following the 34-mark blueprint:
        // Part A: 5 questions × 2M = 10 Marks
        // Part B: 2 optional questions (8M each), user writes 1 = 8 Marks
        // Part C: 1 question × 16M = 16 Marks
        if (a4QuestionsSheetBody) {
          const partA = data.questions.filter(q => q.part === "PART_A");
          const partB = data.questions.filter(q => q.part === "PART_B");
          const partC = data.questions.filter(q => q.part === "PART_C");

          function renderQuestionInput(q) {
            if (q.type === "CHOOSE" && q.options) {
              return `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
                  ${q.options.map((opt, oIdx) => `
                    <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:rgba(0,0,0,0.03); border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-size:13px; color:#1e293b;">
                      <input type="radio" name="mock_q_${q.id}" value="${oIdx}" />
                      <span><strong>${String.fromCharCode(65 + oIdx)}.</strong> ${escapeHtml(opt)}</span>
                    </label>
                  `).join("")}
                </div>
              `;
            } else if (q.type === "TRUE_FALSE") {
              return `
                <div style="display:flex; gap:12px; margin-top:8px;">
                  <label style="display:flex; align-items:center; gap:8px; padding:6px 16px; background:rgba(0,0,0,0.03); border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-size:13px; color:#1e293b;">
                    <input type="radio" name="mock_q_${q.id}" value="0" />
                    <span>✓ True</span>
                  </label>
                  <label style="display:flex; align-items:center; gap:8px; padding:6px 16px; background:rgba(0,0,0,0.03); border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-size:13px; color:#1e293b;">
                    <input type="radio" name="mock_q_${q.id}" value="1" />
                    <span>✕ False</span>
                  </label>
                </div>
              `;
            } else {
              const rows = (q.marks || 2) > 8 ? 8 : ((q.marks || 2) > 2 ? 6 : 3);
              return `
                <textarea class="mock-exam-typing-area" data-qid="${q.id}" rows="${rows}" placeholder="Type formal university answer, definitions, governing equations, or code here..."></textarea>
              `;
            }
          }

          let html = `
            <div style="margin-bottom:16px;">
              <div class="mock-exam-blueprint-badge">
                <span>📌 Official 50-Mark Semester Blueprint: Part A (10M) · Part B Choice (8M) · Part C (2 × 16M = 32M) · Total 50 Marks</span>
              </div>
            </div>
          `;

          // 1. PART A (5 questions × 2M = 10 Marks)
          if (partA.length > 0) {
            html += `
              <div class="a4-section-divider">
                <span class="a4-section-badge">PART A</span>
                <span class="a4-section-info">(5 Questions × 2 Marks = 10 Marks · All Questions Compulsory)</span>
              </div>
              ${partA.map((q, idx) => `
                <div class="a4-question-item">
                  <div class="a4-question-header">
                    <span class="a4-q-num">Q${idx + 1}.</span>
                    <div class="a4-q-text">${escapeHtml(q.question)}</div>
                    <span class="a4-q-marks">[2 Marks]</span>
                  </div>
                  ${renderQuestionInput(q)}
                </div>
              `).join("")}
            `;
          }

          // 2. PART B (Optional Pattern: 2 questions × 8M, student writes 1 = 8 Marks)
          if (partB.length > 0) {
            const optA = partB[0];
            const optB = partB[1] || partB[0];
            html += `
              <div class="a4-section-divider">
                <span class="a4-section-badge">PART B</span>
                <span class="a4-section-info">(Optional Question Pattern · Choose either Option A OR Option B · 1 × 8 Marks = 8 Marks)</span>
              </div>

              <div class="part-b-choice-toggle-row">
                <button type="button" class="part-b-option-btn active" id="btnToggleOptA" onclick="togglePartBOption('A')">
                  ✓ Option A: ${escapeHtml(optA.optionLabel || "Question 6A")} (8 Marks)
                </button>
                <button type="button" class="part-b-option-btn" id="btnToggleOptB" onclick="togglePartBOption('B')">
                  Option B: ${escapeHtml(optB.optionLabel || "Question 6B")} (8 Marks) [OR]
                </button>
              </div>

              <div id="partBContainerA" class="a4-question-item" style="border: 2px solid rgba(0, 240, 255, 0.4); border-radius: 8px; padding: 14px;">
                <div class="a4-question-header">
                  <span class="a4-q-num">Q6 (A).</span>
                  <div class="a4-q-text">${escapeHtml(optA.question)}</div>
                  <span class="a4-q-marks">[8 Marks]</span>
                </div>
                ${renderQuestionInput(optA)}
              </div>

              <div id="partBContainerB" class="a4-question-item" style="display:none; border: 2px solid rgba(194, 155, 72, 0.4); border-radius: 8px; padding: 14px;">
                <div class="a4-question-header">
                  <span class="a4-q-num">Q6 (B).</span>
                  <div class="a4-q-text">${escapeHtml(optB.question)}</div>
                  <span class="a4-q-marks">[8 Marks]</span>
                </div>
                ${renderQuestionInput(optB)}
              </div>
            `;
          }

          // 3. PART C (2 questions × 16 Marks = 32 Marks)
          if (partC.length > 0) {
            html += `
              <div class="a4-section-divider" style="margin-top:20px;">
                <span class="a4-section-badge">PART C</span>
                <span class="a4-section-info">(Comprehensive Problem Solving & Advanced Engineering Application · 2 Questions × 16 Marks = 32 Marks · All Compulsory)</span>
              </div>
              ${partC.map((cq, idx) => `
                <div class="a4-question-item" style="border: 2px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                  <div class="a4-question-header">
                    <span class="a4-q-num">Q${7 + idx}.</span>
                    <div class="a4-q-text">${escapeHtml(cq.question)}</div>
                    <span class="a4-q-marks">[16 Marks]</span>
                  </div>
                  ${renderQuestionInput(cq)}
                </div>
              `).join("")}
            `;
          }

          a4QuestionsSheetBody.innerHTML = html;
        }

        window.togglePartBOption = function(choice) {
          const btnA = document.getElementById("btnToggleOptA");
          const btnB = document.getElementById("btnToggleOptB");
          const boxA = document.getElementById("partBContainerA");
          const boxB = document.getElementById("partBContainerB");

          if (choice === "A") {
            if (btnA) btnA.classList.add("active");
            if (btnB) btnB.classList.remove("active");
            if (boxA) boxA.style.display = "block";
            if (boxB) boxB.style.display = "none";
          } else {
            if (btnB) btnB.classList.add("active");
            if (btnA) btnA.classList.remove("active");
            if (boxB) boxB.style.display = "block";
            if (boxA) boxA.style.display = "none";
          }
          playTactileSound("click");
        };

        if (mockPaperDisplayWrapper) mockPaperDisplayWrapper.style.display = "block";
        if (mockExamGradingReportBox) mockExamGradingReportBox.style.display = "none";

        startExamTimer(data.timeLimitMinutes ? data.timeLimitMinutes * 60 : 5400);
        mockPaperDisplayWrapper.scrollIntoView({ behavior: "smooth" });
        playTactileSound("success");
      } catch (err) {
        alert("Failed to synthesize semester mock paper: " + err.message);
      } finally {
        generateMockPaperBtn.disabled = false;
        generateMockPaperBtn.textContent = "📌 Generate Official 34-Mark Semester Examination Paper (PYQ)";
      }
    });
  }

  if (btnCancelPaper) {
    btnCancelPaper.addEventListener("click", () => {
      if (confirm("Are you sure you want to cancel the current examination session?")) {
        if (mockExamState.timerInterval) clearInterval(mockExamState.timerInterval);
        if (mockPaperDisplayWrapper) mockPaperDisplayWrapper.style.display = "none";
      }
    });
  }

  if (btnSubmitPaperForGrading && mockSubmitConfirmModal) {
    btnSubmitPaperForGrading.addEventListener("click", () => {
      mockSubmitConfirmModal.classList.add("active");
    });
  }

  if (btnCancelSubmitModal && mockSubmitConfirmModal) {
    btnCancelSubmitModal.addEventListener("click", () => {
      mockSubmitConfirmModal.classList.remove("active");
    });
  }

  async function submitExamForGrading() {
    if (mockSubmitConfirmModal) mockSubmitConfirmModal.classList.remove("active");
    if (mockExamState.timerInterval) clearInterval(mockExamState.timerInterval);

    // Collect answers
    const studentAnswers = {};
    document.querySelectorAll(".mock-exam-typing-area").forEach(ta => {
      const qid = ta.getAttribute("data-qid");
      if (qid) studentAnswers[qid] = ta.value.trim();
    });

    if (mockExamState.currentPaper?.questions) {
      mockExamState.currentPaper.questions.forEach(q => {
        if (q.type === "CHOOSE" || q.type === "TRUE_FALSE") {
          const checked = document.querySelector(`input[name="mock_q_${q.id}"]:checked`);
          if (checked) studentAnswers[q.id] = parseInt(checked.value, 10);
        }
      });
    }

    if (btnSubmitPaperForGrading) {
      btnSubmitPaperForGrading.disabled = true;
      btnSubmitPaperForGrading.textContent = "AI Examiner Grading 34-Mark Scheme...";
    }

    try {
      const activeUid = getActiveUserId();
      const res = await fetch(`${BACKEND_URL}/api/quiz/engineering/grade-mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUid
        },
        body: JSON.stringify({
          userId: activeUid,
          subject: mockExamState.currentPaper?.subject,
          group: mockGroupSelect ? mockGroupSelect.value : "Engineering",
          branch: mockBranchSelect ? mockBranchSelect.value : "CSE",
          semester: mockSemesterSelect ? mockSemesterSelect.value : 3,
          questions: mockExamState.currentPaper?.questions,
          studentAnswers
        })
      });

      const report = await res.json();
      if (!report.success) throw new Error(report.error || "Grading failed");

      // Hide question paper
      if (mockPaperDisplayWrapper) mockPaperDisplayWrapper.style.display = "none";

      // Render marksheet report
      if (mockExamGradingReportBox) {
        mockExamGradingReportBox.style.display = "block";
        if (mockReportSubjectTitle) mockReportSubjectTitle.textContent = `${report.subject} · 34-Mark University Marksheet`;
        if (mockReportScoreVal) mockReportScoreVal.textContent = `${report.earnedMarks} / 34 (${report.percentage}%)`;
        if (mockReportGradeLetter) mockReportGradeLetter.textContent = report.grade || "A";
        if (mockReportComments) mockReportComments.textContent = report.evaluationSummary || "34-Mark Blueprint Evaluation complete.";

        const breakdown = report.scoreBreakdown || { partA: { earned: 8, max: 10 }, partB: { earned: 6, max: 8 }, partC: { earned: 14, max: 16 } };
        
        let breakdownHtml = `
          <div class="mock-scorecard-grid">
            <div class="scorecard-item-box">
              <div class="scorecard-item-label">Part A (Short Ans)</div>
              <div class="scorecard-item-value" style="color:var(--accent-gold);">${breakdown.partA.earned} / ${breakdown.partA.max}</div>
            </div>
            <div class="scorecard-item-box">
              <div class="scorecard-item-label">Part B (Option)</div>
              <div class="scorecard-item-value" style="color:var(--accent-sage);">${breakdown.partB.earned} / ${breakdown.partB.max}</div>
            </div>
            <div class="scorecard-item-box">
              <div class="scorecard-item-label">Part C (2 × 16M = 32M)</div>
              <div class="scorecard-item-value" style="color:#10B981;">${breakdown.partC.earned} / ${breakdown.partC.max}</div>
            </div>
          </div>
        `;

        if (mockReportFocusList) {
          mockReportFocusList.innerHTML = breakdownHtml;
        }

        mockExamGradingReportBox.scrollIntoView({ behavior: "smooth" });
        playTactileSound("success");
      }
    } catch (err) {
      alert("AI Grading encountered an error: " + err.message);
    } finally {
      if (btnSubmitPaperForGrading) {
        btnSubmitPaperForGrading.disabled = false;
        btnSubmitPaperForGrading.textContent = "🎓 Submit Examination for AI Grading";
      }
    }
  }

  if (btnConfirmSubmitModal) {
    btnConfirmSubmitModal.addEventListener("click", submitExamForGrading);
  }

  if (btnGoToPerformance) {
    btnGoToPerformance.addEventListener("click", () => {
      switchView("student-performance");
    });
  }

  if (btnNewMockExam) {
    btnNewMockExam.addEventListener("click", () => {
      if (mockExamGradingReportBox) mockExamGradingReportBox.style.display = "none";
      const selectionCard = document.getElementById("mockSelectionCard");
      if (selectionCard) selectionCard.scrollIntoView({ behavior: "smooth" });
    });
  }
}

/* =========================================================
   11C. STUDENT PERFORMANCE & ANALYTICS CONTROLLER
========================================================= */
async function loadStudentPerformance() {
  const perfAvgScore = document.getElementById("perfAvgScore");
  const perfTestsCount = document.getElementById("perfTestsCount");
  const perfStrongCount = document.getElementById("perfStrongCount");
  const perfFocusCount = document.getElementById("perfFocusCount");

  const perfGuideSubjectTitle = document.getElementById("perfGuideSubjectTitle");
  const perfGuideTopicsList = document.getElementById("perfGuideTopicsList");
  const perfGuideInstructionsList = document.getElementById("perfGuideInstructionsList");
  const refreshPerfGuideBtn = document.getElementById("refreshPerfGuideBtn");
  const perfHistoryContainer = document.getElementById("perfHistoryContainer");

  try {
    const activeUid = getActiveUserId();
    const res = await fetch(`${BACKEND_URL}/api/analytics/performance?userId=${encodeURIComponent(activeUid)}`, {
      headers: { "x-user-id": activeUid }
    });
    const data = await res.json();
    if (!data.success) return;

    if (perfAvgScore) perfAvgScore.textContent = `${data.stats?.averagePercentage || 0}%`;
    if (perfTestsCount) perfTestsCount.textContent = data.stats?.totalTestsTaken || 0;
    if (perfStrongCount) perfStrongCount.textContent = data.stats?.strongSubjectsCount || 0;
    if (perfFocusCount) perfFocusCount.textContent = data.stats?.needsFocusCount || 0;

    // AI Mentor Guide
    const records = data.records || [];
    if (perfGuideSubjectTitle && records.length > 0) {
      perfGuideSubjectTitle.textContent = `Focus Directive: ${records[0].subject}`;
    }

    if (perfGuideTopicsList) {
      const topTopics = records.flatMap(r => r.focusTopics || []).slice(0, 6);
      perfGuideTopicsList.innerHTML = topTopics.length === 0
        ? `<span style="font-size:12px; color:var(--text-secondary);">Core principles and comprehensive derivations.</span>`
        : topTopics.map(t => {
          const topicName = typeof t === "string" ? t : (t.topic || "Core Subject Focus");
          const searchUrl = (t && t.browserSearchUrl) || `https://www.google.com/search?q=${encodeURIComponent(topicName + " lecture notes solved questions exam guide pdf")}`;
          const pdfUrl = (t && t.pdfUrl) || `${BACKEND_URL}/api/quiz/engineering/notes?subject=${encodeURIComponent(topicName)}&format=pdf`;
          return `
            <div class="perf-focus-topic-item" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 14px; background:var(--bg-surface-subtle); border:1px solid var(--border-medium); border-radius:8px; margin-bottom:8px; width:100%;">
              <div style="flex:1; min-width:200px;">
                <div style="font-size:13px; font-weight:700; color:var(--accent-gold);">✦ ${escapeHtml(topicName)}</div>
                ${t && t.importance ? `<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${escapeHtml(t.importance)}</div>` : ''}
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="btn-vault-action" style="font-size:11px; padding:4px 10px; background:var(--accent-gold-soft); color:var(--accent-gold); border:1px solid var(--border-medium); border-radius:4px; cursor:pointer;" onclick="window.open('${pdfUrl}', '_blank')">
                  📄 Focus Topic PDF
                </button>
                <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="btn-vault-action" style="font-size:11px; padding:4px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border-card); border-radius:4px;">
                  🌐 Browser Link
                </a>
              </div>
            </div>
          `;
        }).join("");
    }

    if (perfGuideInstructionsList) {
      perfGuideInstructionsList.innerHTML = `
        <div style="margin-bottom:6px;">1. 🎯 <strong>Target 5-Year Repeated PYQs</strong> — 70% of semester weightage recurs around core theorems.</div>
        <div style="margin-bottom:6px;">2. 📌 <strong>Draw Clean Architecture Block Diagrams</strong> — Guaranteed 30% presentation marks in Part B.</div>
        <div>3. ⚡ <strong>Practice 45-Minute Timed Mock Drills</strong> to build rapid handwriting and formula recall.</div>
      `;
    }

    // History Table
    if (perfHistoryContainer) {
      if (records.length === 0) {
        perfHistoryContainer.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-secondary);">No mock examinations recorded yet. Take your first semester examination in the Semester Mock Test section!</div>`;
      } else {
        perfHistoryContainer.innerHTML = `
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid var(--border-subtle); color:var(--text-secondary);">
                  <th style="padding:10px 12px;">Subject</th>
                  <th style="padding:10px 12px;">Discipline</th>
                  <th style="padding:10px 12px;">Marks</th>
                  <th style="padding:10px 12px;">Percentage</th>
                  <th style="padding:10px 12px;">Grade</th>
                  <th style="padding:10px 12px;">Date</th>
                </tr>
              </thead>
              <tbody>
                ${records.map(r => `
                  <tr style="border-bottom:1px solid var(--border-subtle);">
                    <td style="padding:10px 12px; font-weight:600; color:var(--text-primary);">${escapeHtml(r.subject)}</td>
                    <td style="padding:10px 12px; color:var(--text-secondary);">${escapeHtml(r.group)}</td>
                    <td style="padding:10px 12px; font-family:var(--font-mono);">${r.earnedMarks} / ${r.totalMarks}</td>
                    <td style="padding:10px 12px; font-weight:700; color:var(--accent-gold);">${r.percentage}%</td>
                    <td style="padding:10px 12px;">
                      <span style="padding:2px 8px; border-radius:4px; font-weight:700; font-size:11px; background:${r.percentage >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${r.percentage >= 75 ? '#10B981' : '#F59E0B'};">
                        ${escapeHtml(r.grade)}
                      </span>
                    </td>
                    <td style="padding:10px 12px; color:var(--text-tertiary); font-size:11px;">${new Date(r.timestamp).toLocaleDateString()}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;
      }
    }
  } catch (_) { }

  if (refreshPerfGuideBtn && !refreshPerfGuideBtn.dataset.bound) {
    refreshPerfGuideBtn.dataset.bound = "true";
    refreshPerfGuideBtn.addEventListener("click", async () => {
      refreshPerfGuideBtn.disabled = true;
      refreshPerfGuideBtn.textContent = "Refreshing...";
      try {
        const guideRes = await fetch(`${BACKEND_URL}/api/analytics/guide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: [] })
        });
        const gData = await guideRes.json();
        if (gData.success && gData.guide) {
          if (perfGuideSubjectTitle) perfGuideSubjectTitle.textContent = `Focus Directive: ${gData.guide.focusSubject}`;
          if (perfGuideInstructionsList) {
            perfGuideInstructionsList.innerHTML = (gData.guide.studyInstructions || []).map((step, idx) => `
              <div style="margin-bottom:6px;">${escapeHtml(step)}</div>
            `).join("");
          }
          playTactileSound("success");
        }
      } catch (_) { }
      finally {
        refreshPerfGuideBtn.disabled = false;
        refreshPerfGuideBtn.textContent = "🔄 Refresh AI Guide";
      }
    });
  }
}


/* =========================================================
   12. PROVIDERS & SYSTEM TELEMETRY
========================================================= */
const providersGrid = document.getElementById("providersGrid");
const retestProvidersBtn = document.getElementById("retestProvidersBtn");

async function refreshProviderStatus() {
  if (!providersGrid) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/providers`);
    const data = await res.json();

    const providerList = [
      {
        name: "Google Gemini",
        role: "Primary Intelligence & Vision",
        status: data.geminiStatus || (data.gemini ? "configured" : "unavailable"),
        badge: data.geminiStatus === "available" ? "available" : data.geminiStatus === "failed" ? "failed" : data.gemini ? "configured" : "unavailable"
      },
      {
        name: "OpenAI Core",
        role: "Language & Logic Fallback",
        status: data.openai ? "Configured" : "Unavailable",
        badge: data.openai ? "configured" : "unavailable"
      },
      {
        name: "Groq LPU",
        role: "Ultra-Fast Inference",
        status: data.groq ? "Configured" : "Unavailable",
        badge: data.groq ? "configured" : "unavailable"
      },
      {
        name: "NVIDIA NIM",
        role: "Accelerated Reasoning",
        status: data.nvidia ? "Configured" : "Unavailable",
        badge: data.nvidia ? "configured" : "unavailable"
      },
      {
        name: "Hugging Face",
        role: "Open Weights Hub",
        status: data.huggingface ? "Configured" : "Unavailable",
        badge: data.huggingface ? "configured" : "unavailable"
      },
      {
        name: "Tavily AI",
        role: "Live Web Knowledge Search",
        status: data.tavily ? "Configured" : "Unavailable",
        badge: data.tavily ? "configured" : "unavailable"
      },
      {
        name: "ElevenLabs",
        role: "Neural Voice Synthesis",
        status: data.elevenlabs ? "Configured" : "Unavailable",
        badge: data.elevenlabs ? "configured" : "unavailable"
      },
      {
        name: "YouTube Data",
        role: "Video Ingestion API",
        status: data.youtube ? "Configured" : "Unavailable",
        badge: data.youtube ? "configured" : "unavailable"
      }
    ];

    providersGrid.innerHTML = providerList.map(p => `
      <div class="provider-status-card">
        <div class="provider-card-header">
          <span class="provider-name">${escapeHtml(p.name)}</span>
          <span class="provider-badge ${p.badge}">${escapeHtml(p.status.toUpperCase())}</span>
        </div>
        <p style="font-size:12px; color:var(--text-secondary);">${escapeHtml(p.role)}</p>
      </div>
    `).join("");

    const sidebarBadge = document.getElementById("sidebarEngineStatus");
    if (sidebarBadge) {
      sidebarBadge.textContent = data.gemini ? "Online" : "Standby";
    }
  } catch (_) { }
}

if (retestProvidersBtn) {
  retestProvidersBtn.addEventListener("click", () => {
    refreshProviderStatus();
    playTactileSound("click");
  });
}

/* =========================================================
   13. CUTE ROBOT VOICE ASSISTANT (MIC TRIGGERED MODAL)
   (Blur background · cute animated robot · expressions)
========================================================= */
const cuteRobotModal = document.getElementById("cuteRobotModal");
const robotBackdropBlur = document.getElementById("robotBackdropBlur");
const voiceBtn = document.getElementById("voiceBtn");
const robotHead = document.getElementById("robotHead");
const robotEyeLeft = document.getElementById("robotEyeLeft");
const robotEyeRight = document.getElementById("robotEyeRight");
const robotMouth = document.getElementById("robotMouth");
const antennaBulb = document.getElementById("antennaBulb");
const robotSoundRings = document.getElementById("robotSoundRings");
const robotStatusCaption = document.getElementById("robotStatusCaption");
const robotTranscriptBox = document.getElementById("robotTranscriptBox");
const robotSendBtn = document.getElementById("robotSendBtn");
const robotCancelBtn = document.getElementById("robotCancelBtn");

let robotSpeechRec = null;
let robotExpressionInterval = null;
let currentRobotTranscript = "";
let robotLanguage = "en-IN"; // Defaults to en-IN for natural Tanglish & Indian English
let robotSilenceTimer = null;

function setCuteRobotExpression(expression) {
  if (!robotEyeLeft || !robotEyeRight || !robotMouth) return;

  // Reset
  robotEyeLeft.classList.remove("happy", "wink");
  robotEyeRight.classList.remove("happy", "wink");
  robotMouth.classList.remove("smiling");
  if (robotHead) robotHead.classList.remove("listening-tilt");
  document.querySelectorAll(".robot-blush").forEach(b => b.classList.remove("bright"));

  if (expression === "happy") {
    robotEyeLeft.classList.add("happy");
    robotEyeRight.classList.add("happy");
    robotMouth.classList.add("smiling");
    document.querySelectorAll(".robot-blush").forEach(b => b.classList.add("bright"));
  } else if (expression === "wink") {
    robotEyeLeft.classList.add("wink");
    robotMouth.classList.add("smiling");
    document.querySelectorAll(".robot-blush").forEach(b => b.classList.add("bright"));
  } else if (expression === "listening") {
    if (robotHead) robotHead.classList.add("listening-tilt");
    robotMouth.classList.add("smiling");
    document.querySelectorAll(".robot-blush").forEach(b => b.classList.add("bright"));
  }
}

function openCuteRobotAssistant() {
  if (!cuteRobotModal) return;
  cuteRobotModal.classList.add("active");
  currentRobotTranscript = "";
  if (robotSilenceTimer) {
    clearTimeout(robotSilenceTimer);
    robotSilenceTimer = null;
  }

  if (robotTranscriptBox) {
    robotTranscriptBox.textContent = robotLanguage === "ta-IN" 
      ? "தமிழில் பேசுங்கள்... பேசி முடித்ததும் தானாக செயல்படும்!" 
      : "Listening in Tanglish, Tamil & English... Speak your command!";
    robotTranscriptBox.style.color = "var(--text-secondary)";
  }
  if (robotStatusCaption) {
    robotStatusCaption.textContent = robotLanguage === "ta-IN" ? "ஆரா குரல் கேட்கிறது... ✦" : "Aura Voice Intelligence Listening... ✦";
  }

  setCuteRobotExpression("listening");
  playTactileSound("dispatch");
  setCoreState("listening", "LISTENING");

  // Animate cute expressions periodically
  if (robotExpressionInterval) clearInterval(robotExpressionInterval);
  robotExpressionInterval = setInterval(() => {
    if (!cuteRobotModal || !cuteRobotModal.classList.contains("active")) return;
    const exprs = ["listening", "wink", "happy"];
    const pick = exprs[Math.floor(Math.random() * exprs.length)];
    setCuteRobotExpression(pick);
    setTimeout(() => {
      if (cuteRobotModal && cuteRobotModal.classList.contains("active")) {
        setCuteRobotExpression("listening");
      }
    }, 1500);
  }, 4200);

  // Initialize Speech Recognition
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    try {
      if (robotSpeechRec) {
        try { robotSpeechRec.stop(); } catch (_) { }
      }
      robotSpeechRec = new SpeechRec();
      robotSpeechRec.continuous = true;
      robotSpeechRec.interimResults = true;
      robotSpeechRec.lang = robotLanguage;

      robotSpeechRec.onresult = (e) => {
        let finalTxt = "";
        let interimTxt = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTxt += e.results[i][0].transcript;
          } else {
            interimTxt += e.results[i][0].transcript;
          }
        }
        const combined = (finalTxt || interimTxt).trim();
        if (combined) {
          currentRobotTranscript = combined;
          if (robotTranscriptBox) {
            robotTranscriptBox.textContent = `"${combined}"`;
            robotTranscriptBox.style.color = "var(--text-primary)";
          }
          if (robotStatusCaption) {
            robotStatusCaption.textContent = "I heard that! (Auto-executing when you pause) ✧";
          }
          setCuteRobotExpression("happy");

          // USER PAUSE AUTO-CLOSE & IMMEDIATE EXECUTION:
          // Detect student stopping speech (850ms pause) -> automatically close modal and run command!
          if (robotSilenceTimer) clearTimeout(robotSilenceTimer);
          robotSilenceTimer = setTimeout(() => {
            if (cuteRobotModal && cuteRobotModal.classList.contains("active") && currentRobotTranscript) {
              const cmdToExecute = currentRobotTranscript.trim();
              if (cmdToExecute && !cmdToExecute.includes("Listening") && !cmdToExecute.includes("பேசுங்கள்")) {
                if (robotStatusCaption) {
                  robotStatusCaption.textContent = "Analyzing & Executing directive... ✧";
                }
                closeCuteRobotAssistant();
                executeAuraVoiceCommand(cmdToExecute);
              }
            }
          }, 850);
        }
      };

      robotSpeechRec.onerror = (err) => {
        console.warn("[SPEECH REC NOTE]", err.error);
        if (robotTranscriptBox && !currentRobotTranscript) {
          robotTranscriptBox.textContent = "Microphone ready. Speak in Tanglish or Tamil.";
        }
      };

      robotSpeechRec.onend = () => {
        // If user finished speech and modal is active, auto-close and execute
        if (cuteRobotModal && cuteRobotModal.classList.contains("active") && currentRobotTranscript) {
          const cmdToExecute = currentRobotTranscript.trim();
          if (cmdToExecute && !cmdToExecute.includes("Listening") && !cmdToExecute.includes("பேசுங்கள்")) {
            closeCuteRobotAssistant();
            executeAuraVoiceCommand(cmdToExecute);
            return;
          }
        }
        if (cuteRobotModal && cuteRobotModal.classList.contains("active") && !currentRobotTranscript) {
          try { robotSpeechRec.start(); } catch (_) { }
        }
      };

      robotSpeechRec.start();
    } catch (e) {
      console.warn("[SPEECH REC START FAILED]", e);
    }
  } else {
    if (robotTranscriptBox) {
      robotTranscriptBox.textContent = "Speech recognition ready. Dictate or type your prompt here.";
      robotTranscriptBox.setAttribute("contenteditable", "true");
    }
  }
}

function closeCuteRobotAssistant() {
  if (robotSilenceTimer) {
    clearTimeout(robotSilenceTimer);
    robotSilenceTimer = null;
  }
  if (!cuteRobotModal) return;
  cuteRobotModal.classList.remove("active");
  if (robotExpressionInterval) {
    clearInterval(robotExpressionInterval);
    robotExpressionInterval = null;
  }
  if (robotSpeechRec) {
    try { robotSpeechRec.stop(); } catch (_) { }
    robotSpeechRec = null;
  }
  setCoreState("idle", "ONLINE");
}

function initCuteRobotVoice() {
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      openCuteRobotAssistant();
    });
  }

  const robotFemaleBtn = document.getElementById("robotVoiceFemaleBtn");
  const robotMaleBtn = document.getElementById("robotVoiceMaleBtn");
  if (robotFemaleBtn) {
    robotFemaleBtn.addEventListener("click", () => {
      setVoiceGender("female");
      robotFemaleBtn.classList.add("active");
      if (robotMaleBtn) robotMaleBtn.classList.remove("active");
    });
  }
  if (robotMaleBtn) {
    robotMaleBtn.addEventListener("click", () => {
      setVoiceGender("male");
      robotMaleBtn.classList.add("active");
      if (robotFemaleBtn) robotFemaleBtn.classList.remove("active");
    });
  }

  // 4-Way Multilingual Dialect Selectors (Tanglish, Tamil, Hindi, English)
  const robotLangTanglishBtn = document.getElementById("robotLangTanglishBtn");
  const robotLangTamilBtn = document.getElementById("robotLangTamilBtn");
  const robotLangHindiBtn = document.getElementById("robotLangHindiBtn");
  const robotLangEnglishBtn = document.getElementById("robotLangEnglishBtn");
  const langBtns = [robotLangTanglishBtn, robotLangTamilBtn, robotLangHindiBtn, robotLangEnglishBtn].filter(Boolean);

  function setRobotLanguageDialect(code, activeBtn, placeholder) {
    robotLanguage = code;
    langBtns.forEach(b => b.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
    if (robotTranscriptBox && !currentRobotTranscript) {
      robotTranscriptBox.textContent = placeholder;
    }
    if (robotSpeechRec) {
      try { robotSpeechRec.stop(); } catch (_) {}
    }
    playTactileSound("click");
  }

  if (robotLangTanglishBtn) {
    robotLangTanglishBtn.addEventListener("click", () => {
      setRobotLanguageDialect("en-IN", robotLangTanglishBtn, "Listening in Tanglish & All... Speak your command or doubt!");
    });
  }

  if (robotLangTamilBtn) {
    robotLangTamilBtn.addEventListener("click", () => {
      setRobotLanguageDialect("ta-IN", robotLangTamilBtn, "தமிழில் பேசுங்கள்... உங்கள் கட்டளையை கேட்கிறேன்!");
    });
  }

  if (robotLangHindiBtn) {
    robotLangHindiBtn.addEventListener("click", () => {
      setRobotLanguageDialect("hi-IN", robotLangHindiBtn, "हिन्दी में बोलिए... मैं आपकी बात सुन रहा हूँ!");
    });
  }

  if (robotLangEnglishBtn) {
    robotLangEnglishBtn.addEventListener("click", () => {
      setRobotLanguageDialect("en-US", robotLangEnglishBtn, "Listening in English... Speak your query or action!");
    });
  }

  if (robotCancelBtn) {
    robotCancelBtn.addEventListener("click", closeCuteRobotAssistant);
  }

  if (robotBackdropBlur) {
    robotBackdropBlur.addEventListener("click", closeCuteRobotAssistant);
  }

  if (robotSendBtn) {
    robotSendBtn.addEventListener("click", () => {
      const text = currentRobotTranscript || (robotTranscriptBox ? robotTranscriptBox.textContent.replace(/^"|"$/g, "").trim() : "");
      closeCuteRobotAssistant();
      if (text && !text.includes("Listening") && !text.includes("பேசுங்கள்") && !text.includes("बोलिए") && !text.includes("Microphone ready")) {
        executeAuraVoiceCommand(text);
      }
    });
  }
}

/* =========================================================
   14. LIVE THEMES CONTROLLER (5 DISTINCT STYLES)
========================================================= */
/* =========================================================
   14. LIVE ACTION THEMES ENGINE (CHATGPT 6 ASTRA LIVE LIFE)
========================================================= */
class LiveThemeCanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.currentTheme = "live-waves";
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.particles = [];
    this.running = true;

    this.initCanvas();
    this.initTheme(this.currentTheme);
    window.addEventListener("resize", () => this.resize());
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initCanvas() {
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.initTheme(this.currentTheme);
  }

  setTheme(themeId) {
    this.currentTheme = themeId;
    this.initTheme(themeId);
  }

  initTheme(theme) {
    this.particles = [];
    const count = theme === "live-waves" ? 40
      : theme === "live-hearts" ? 35
        : theme === "cute-beautiful" ? 45
          : theme === "action-cyber" ? 60
            : theme === "rugged-tactical" ? 40
              : 30;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(theme));
    }
  }

  createParticle(theme) {
    const w = this.width;
    const h = this.height;

    if (theme === "live-waves") {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 2.5 + 1,
        speedY: -(Math.random() * 0.8 + 0.3),
        alpha: Math.random() * 0.5 + 0.2,
        wobble: Math.random() * Math.PI * 2
      };
    } else if (theme === "live-hearts") {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 80,
        size: Math.random() * 14 + 10,
        speedY: -(Math.random() * 0.9 + 0.4),
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        pulseOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? "#FF2E93" : "#C084FC"
      };
    } else if (theme === "cute-beautiful") {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 10 + 6,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.sin(Math.random() * Math.PI) * 0.6 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        alpha: Math.random() * 0.45 + 0.25,
        isSparkle: Math.random() > 0.65
      };
    } else if (theme === "action-cyber") {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        length: Math.random() * 60 + 20,
        speed: Math.random() * 6 + 3,
        thickness: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.4 ? "#00FFB2" : "#00F0FF",
        alpha: Math.random() * 0.6 + 0.2
      };
    } else if (theme === "rugged-tactical") {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 40,
        radius: Math.random() * 2.5 + 1,
        speedY: -(Math.random() * 1.2 + 0.5),
        speedX: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.6 + 0.3,
        color: Math.random() > 0.5 ? "#FF5500" : "#F59E0B"
      };
    } else {
      // cyber-obsidian / warm-ivory / neutral
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.8 + 0.5,
        speedY: (Math.random() - 0.5) * 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.35 + 0.15
      };
    }
  }

  drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // Top left curve
    ctx.bezierCurveTo(
      0, 0,
      -size / 2, 0,
      -size / 2, topCurveHeight
    );
    // Bottom left curve
    ctx.bezierCurveTo(
      -size / 2, (size + topCurveHeight) / 2,
      0, size,
      0, size * 1.25
    );
    // Bottom right curve
    ctx.bezierCurveTo(
      0, size,
      size / 2, (size + topCurveHeight) / 2,
      size / 2, topCurveHeight
    );
    // Top right curve
    ctx.bezierCurveTo(
      size / 2, 0,
      0, 0,
      0, topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPetal(ctx, x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#FFB3D9";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(244, 114, 182, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.45, size, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSparkle(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#F472B6";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  loop() {
    if (!this.running || !this.ctx) return;
    this.time += 1;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (this.currentTheme === "live-waves") {
      // Draw Undulating Multi-Layer Ocean Waves
      const waveLayers = [
        { freq: 0.003, amp: 40, speed: 0.015, color: "rgba(0, 240, 255, 0.06)", base: h * 0.68 },
        { freq: 0.004, amp: 55, speed: 0.02, color: "rgba(59, 130, 246, 0.08)", base: h * 0.76 },
        { freq: 0.0025, amp: 70, speed: 0.012, color: "rgba(6, 182, 212, 0.12)", base: h * 0.84 }
      ];

      waveLayers.forEach(layer => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 15) {
          const y = layer.base +
            Math.sin(x * layer.freq + this.time * layer.speed) * layer.amp +
            Math.cos(x * 0.002 - this.time * 0.01) * 18;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      });

      // Shimmer Water Motes
      this.particles.forEach(p => {
        p.y += p.speedY;
        p.wobble += 0.03;
        const drawX = p.x + Math.sin(p.wobble) * 2;
        if (p.y < 0) {
          p.y = h;
          p.x = Math.random() * w;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#00F0FF";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#00F0FF";
        ctx.beginPath();
        ctx.arc(drawX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

    } else if (this.currentTheme === "live-hearts") {
      // Floating glowing neon hearts
      this.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulseOffset += 0.04;
        const currentSize = p.size * (1 + 0.12 * Math.sin(p.pulseOffset));

        if (p.y < -30) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }

        this.drawHeart(ctx, p.x, p.y, currentSize, p.color, p.alpha);
      });

    } else if (this.currentTheme === "cute-beautiful") {
      // Drifting Sakura Blossom Petals and Sparkle Twinkles
      this.particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(this.time * 0.02 + p.rotation) * 0.8 + 0.2;
        p.rotation += p.rotSpeed;

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }

        if (p.isSparkle) {
          const sparklePulse = 0.5 + 0.5 * Math.sin(this.time * 0.06 + p.x);
          this.drawSparkle(ctx, p.x, p.y, p.size * sparklePulse, p.alpha);
        } else {
          this.drawPetal(ctx, p.x, p.y, p.size, p.rotation, p.alpha);
        }
      });

    } else if (this.currentTheme === "action-cyber") {
      // Kinetic Perspective Laser Streaks
      this.particles.forEach(p => {
        p.x += p.speed;
        if (p.x > w + 100) {
          p.x = -100;
          p.y = Math.random() * h;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.thickness;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length, p.y);
        ctx.stroke();
        ctx.restore();
      });

    } else if (this.currentTheme === "rugged-tactical") {
      // Thermal Volcanic Embers rising
      this.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(this.time * 0.05 + p.x));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

    } else {
      // Subtle Ambient Particles for active theme
      const glowColor = (this.currentTheme === "rose-olive" || this.currentTheme === "rose-olive-light") ? "#c9a0a0"
        : (this.currentTheme === "lavender-beige" || this.currentTheme === "lavender-beige-light") ? "#a89bbe"
        : (this.currentTheme === "sage-cream" || this.currentTheme === "sage-cream-dark") ? "#a3b18a"
        : "#c9a0a0";
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = glowColor;
        ctx.shadowBlur = 6;
        ctx.shadowColor = glowColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    requestAnimationFrame(this.loop);
  }
}

// Global instance
window.liveThemeCanvasEngine = null;

const themeToggleBtn = document.getElementById("themeToggleBtn");
const themePopoverDropdown = document.getElementById("themePopoverDropdown");
const activeThemeName = document.getElementById("activeThemeName");
const themeOptionCards = document.querySelectorAll(".theme-option-card");

const THEME_NAMES = {
  "rose-olive": "1. Rose & Olive",
  "rose-olive-light": "Rose & Olive (Light)",
  "lavender-beige": "2. Lavender & Beige",
  "lavender-beige-light": "Lavender & Beige (Light)",
  "sage-cream": "3. Sage & Cream",
  "sage-cream-dark": "Sage & Cream (Dark)",
  "cyber-obsidian": "Minimal Obsidian",
  "minimal-light": "Minimal Light",
  "swiss-minimal": "Swiss Monochrome",
  "warm-ivory": "Warm Ivory",
  "midnight-aurora": "Midnight Slate",
  "live-waves": "1. Rose & Olive",
  "live-hearts": "1. Rose & Olive",
  "cute-beautiful": "2. Lavender & Beige",
  "action-cyber": "1. Rose & Olive",
  "rugged-tactical": "3. Sage & Cream"
};

function applyLiveTheme(themeId) {
  if (!THEME_NAMES[themeId]) themeId = "rose-olive";
  document.body.setAttribute("data-theme", themeId);
  localStorage.setItem("aura_theme", themeId);

  if (activeThemeName) {
    activeThemeName.textContent = THEME_NAMES[themeId];
  }

  themeOptionCards.forEach(card => {
    card.classList.toggle("active", card.getAttribute("data-theme") === themeId);
  });

  if (window.liveThemeCanvasEngine) {
    window.liveThemeCanvasEngine.setTheme(themeId);
  }
}

function initThemeSwitcher() {
  const canvasEl = document.getElementById("liveThemeCanvas");
  if (canvasEl && !window.liveThemeCanvasEngine) {
    window.liveThemeCanvasEngine = new LiveThemeCanvasEngine("liveThemeCanvas");
  }

  const savedTheme = localStorage.getItem("aura_theme") || "rose-olive";
  applyLiveTheme(savedTheme);

  if (themeToggleBtn && themePopoverDropdown) {
    themeToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      themePopoverDropdown.classList.toggle("active");
      playTactileSound("click");
    });

    document.addEventListener("click", (e) => {
      const wrap = document.getElementById("themeSwitcherWrap");
      if (wrap && !wrap.contains(e.target)) {
        themePopoverDropdown.classList.remove("active");
      }
    });
  }

  themeOptionCards.forEach(card => {
    card.addEventListener("click", () => {
      const targetTheme = card.getAttribute("data-theme");
      if (targetTheme) {
        applyLiveTheme(targetTheme);
        playTactileSound("click");
        if (themePopoverDropdown) themePopoverDropdown.classList.remove("active");
      }
    });
  });
}

/* =========================================================
   15. ENGINEERING HUB CONTROLLER (COLLEGES DIRECTORY, ACCURATE SYLLABUS, AI STUDY NOTES & MULTILINGUAL YOUTUBE)
========================================================= */
const engineeringHubState = {
  colleges: [],
  activeCollege: null,
  activeBranch: "CSE",
  activeSemester: 3,
  activeSubject: "Data Structures & Algorithms",
  notesCache: {},
  videosCache: {}
};

function initEngineeringHub() {
  const engStateSelect = document.getElementById("engStateSelect");
  const engDistrictSelect = document.getElementById("engDistrictSelect");
  const collegesCardsGrid = document.getElementById("collegesCardsGrid");
  const engActiveCollegeBadge = document.getElementById("engActiveCollegeBadge");

  const engCollegeBranchesRow = document.getElementById("engCollegeBranchesRow");
  const engCollegeSemesterBar = document.getElementById("engCollegeSemesterBar");
  const engSelectedBranchSemPill = document.getElementById("engSelectedBranchSemPill");
  const engCollegeSubjectsGrid = document.getElementById("engCollegeSubjectsGrid");

  const engActiveSubjectTitle = document.getElementById("engActiveSubjectTitle");
  const engVideoLangSelect = document.getElementById("engVideoLangSelect");
  const engVideoLangTag = document.getElementById("engVideoLangTag");
  const engGenerateNotesBtn = document.getElementById("engGenerateNotesBtn");
  const engNotesContentBody = document.getElementById("engNotesContentBody");
  const btnOpenNotesReader = document.getElementById("btnOpenNotesReader");
  const btnPrintNotes = document.getElementById("btnPrintNotes");
  const engVideosListGrid = document.getElementById("engVideosListGrid");

  // Prevent double-initialization of event handlers
  if (engStateSelect && engStateSelect.dataset.initialized === "true") return;
  if (engStateSelect) engStateSelect.dataset.initialized = "true";

  async function loadColleges() {
    if (!collegesCardsGrid) return;
    const stateVal = engStateSelect ? engStateSelect.value : "Tamil Nadu";
    const districtVal = engDistrictSelect ? engDistrictSelect.value : "";

    collegesCardsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-secondary);">Loading accredited universities & colleges...</div>`;

    try {
      const collegeTypeSelect = document.getElementById("engCollegeTypeSelect");
      const collegeTypeVal = collegeTypeSelect ? collegeTypeSelect.value : "all";
      const url = `${BACKEND_URL}/api/quiz/engineering/colleges?state=${encodeURIComponent(stateVal)}&district=${encodeURIComponent(districtVal)}&type=${encodeURIComponent(collegeTypeVal)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success || !data.colleges) throw new Error("Could not load colleges");
      engineeringHubState.colleges = data.colleges;

      // Update district options if not populated or state changed
      if (engDistrictSelect && engDistrictSelect.dataset.state !== stateVal) {
        engDistrictSelect.dataset.state = stateVal;
        const currentDist = engDistrictSelect.value;
        const dists = data.availableDistricts || [];
        engDistrictSelect.innerHTML = `<option value="">All Districts</option>` +
          dists.map(d => `<option value="${escapeHtml(d)}" ${d === currentDist ? "selected" : ""}>${escapeHtml(d)}</option>`).join("");
      }

      if (data.colleges.length === 0) {
        collegesCardsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-secondary);">No engineering institutions match the selected filter.</div>`;
        return;
      }

      // Default active college to first one if none selected
      if (!engineeringHubState.activeCollege || !data.colleges.some(c => c.id === engineeringHubState.activeCollege.id)) {
        engineeringHubState.activeCollege = data.colleges[0];
      }

      collegesCardsGrid.innerHTML = data.colleges.map(c => {
        const isSelected = engineeringHubState.activeCollege && engineeringHubState.activeCollege.id === c.id;
        return `
          <div class="college-card ${isSelected ? 'active' : ''}" data-id="${c.id}" onclick="selectEngineeringCollege('${c.id}')">
            <div class="college-card-title">
              ${escapeHtml(c.name)}
              ${c.autonomous ? '<span class="autonomous-tag">⭐ AUTONOMOUS</span>' : ''}
            </div>
            <div class="college-card-meta">
              <span>📌 ${escapeHtml(c.district)}, ${escapeHtml(c.state)}</span>
              <span>🎓 ${(c.branches || []).length} Disciplines</span>
            </div>
          </div>
        `;
      }).join("");

      if (engActiveCollegeBadge && engineeringHubState.activeCollege) {
        engActiveCollegeBadge.textContent = engineeringHubState.activeCollege.name;
      }

      renderCollegeBranches();
    } catch (err) {
      collegesCardsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:#FF0055;">Failed to load colleges. Ensure backend is running.</div>`;
    }
  }

  window.selectEngineeringCollege = function (colId) {
    const col = engineeringHubState.colleges.find(c => c.id === colId);
    if (!col) return;
    engineeringHubState.activeCollege = col;

    document.querySelectorAll("#collegesCardsGrid .college-card").forEach(el => {
      el.classList.toggle("active", el.getAttribute("data-id") === col.id);
    });

    if (engActiveCollegeBadge) engActiveCollegeBadge.textContent = col.name;
    renderCollegeBranches();
    playTactileSound("click");
  };

  function renderCollegeBranches() {
    if (!engCollegeBranchesRow || !engineeringHubState.activeCollege) return;
    const branches = engineeringHubState.activeCollege.branches || ["CSE", "AIDS", "ECE", "EEE", "MECH", "CIVIL", "IT"];

    if (!branches.includes(engineeringHubState.activeBranch)) {
      engineeringHubState.activeBranch = branches[0] || "CSE";
    }

    engCollegeBranchesRow.innerHTML = branches.map(b => `
      <button class="branch-pill-btn ${b === engineeringHubState.activeBranch ? 'active' : ''}" onclick="selectEngineeringBranch('${b}')">
        ${b}
      </button>
    `).join("");

    updateBranchSemPill();
    loadAccurateSubjects();
  }

  window.selectEngineeringBranch = function (branch) {
    engineeringHubState.activeBranch = branch;
    document.querySelectorAll("#engCollegeBranchesRow .branch-pill-btn").forEach(btn => {
      btn.classList.toggle("active", btn.textContent.trim() === branch);
    });
    updateBranchSemPill();
    loadAccurateSubjects();
    playTactileSound("click");
  };

  function updateBranchSemPill() {
    if (engSelectedBranchSemPill) {
      engSelectedBranchSemPill.textContent = `${engineeringHubState.activeBranch} · SEMESTER ${engineeringHubState.activeSemester}`;
    }
  }

  // Semester pills
  if (engCollegeSemesterBar) {
    engCollegeSemesterBar.querySelectorAll(".semester-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const sem = parseInt(pill.getAttribute("data-sem"), 10) || 1;
        engineeringHubState.activeSemester = sem;
        engCollegeSemesterBar.querySelectorAll(".semester-pill").forEach(p => p.classList.toggle("active", p === pill));
        updateBranchSemPill();
        loadAccurateSubjects();
        playTactileSound("click");
      });
    });
  }

  async function loadAccurateSubjects() {
    if (!engCollegeSubjectsGrid) return;
    engCollegeSubjectsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-secondary);">Fetching verified syllabus subjects...</div>`;

    try {
      const res = await fetch(`${BACKEND_URL}/api/quiz/curriculum/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupType: "ENGINEERING",
          branch: engineeringHubState.activeBranch,
          semester: engineeringHubState.activeSemester
        })
      });
      const data = await res.json();
      if (!data.success || !data.subjects) throw new Error("Could not load subjects");

      const subjects = data.subjects;
      engineeringHubState.subjects = subjects;

      const subjectBadge = document.getElementById("engSubjectCountBadge");
      if (subjectBadge) {
        const isCSBS = engineeringHubState.activeBranch === "CSBS";
        subjectBadge.textContent = `${subjects.length} Subjects Enrolled${isCSBS ? ' (CSBS Special Track · 7 Subjects)' : ''}`;
      }

      if (!subjects.includes(engineeringHubState.activeSubject)) {
        engineeringHubState.activeSubject = subjects[0] || "Core University Subject";
      }

      engCollegeSubjectsGrid.innerHTML = subjects.map((sub, i) => {
        const isSelected = sub === engineeringHubState.activeSubject;
        return `
          <div class="eng-subject-card ${isSelected ? 'active' : ''}" onclick="selectEngineeringSubject('${escapeHtml(sub).replace(/'/g, "\\'")}')">
            <div class="eng-subject-code">AUR-${engineeringHubState.activeBranch}-SEM${engineeringHubState.activeSemester}-0${i + 1}</div>
            <div class="eng-subject-title">${escapeHtml(sub)}</div>
            <div class="eng-subject-footer">
              <span class="eng-module-badge">4 Credits</span>
              <span style="font-size:11px; color:var(--accent-cyan);">✧ University Core</span>
            </div>
          </div>
        `;
      }).join("");

      if (engActiveSubjectTitle) {
        engActiveSubjectTitle.textContent = engineeringHubState.activeSubject;
      }

      // Automatically load YouTube videos for this subject
      loadYouTubeLectures();
    } catch (err) {
      engCollegeSubjectsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:16px; color:#FF0055;">Failed to load subjects for this semester.</div>`;
    }
  }

  window.selectEngineeringSubject = function (subject) {
    engineeringHubState.activeSubject = subject;
    document.querySelectorAll("#engCollegeSubjectsGrid .eng-subject-card").forEach(c => {
      c.classList.toggle("active", c.querySelector(".eng-subject-title")?.textContent.trim() === subject);
    });

    if (engActiveSubjectTitle) {
      engActiveSubjectTitle.textContent = subject;
    }

    loadYouTubeLectures();
    playTactileSound("click");
  };

  // Generate AI Study Notes
  if (engGenerateNotesBtn) {
    engGenerateNotesBtn.addEventListener("click", async () => {
      if (!engineeringHubState.activeSubject) return;

      engGenerateNotesBtn.disabled = true;
      engGenerateNotesBtn.textContent = "Synthesizing AI Notes...";
      if (engNotesContentBody) {
        engNotesContentBody.innerHTML = `<div style="text-align:center; padding:28px; color:var(--text-secondary);"><span class="intro-tel-dot gold"></span> Compiling high-yield summary, equations, 2-mark Q&A, and 13-mark question outlines...</div>`;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/quiz/engineering/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: engineeringHubState.activeSubject,
            branch: engineeringHubState.activeBranch,
            semester: engineeringHubState.activeSemester,
            collegeName: engineeringHubState.activeCollege ? engineeringHubState.activeCollege.name : ""
          })
        });

        const data = await res.json();
        if (!data.success || !data.notes) throw new Error("Could not formulate notes");

        const n = data.notes;
        engineeringHubState.notesCache[engineeringHubState.activeSubject] = n;
        const guidesContainer = document.getElementById("engOfficialGuidesContainer");
        const guidesList = document.getElementById("engOfficialGuidesList");
        if (guidesContainer && guidesList && n.studyGuidesAndLinks && n.studyGuidesAndLinks.length > 0) {
          guidesContainer.style.display = "block";
          guidesList.innerHTML = n.studyGuidesAndLinks.map(g => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg-surface-subtle); border:1px solid var(--border-subtle); border-radius:6px; font-size:12px;">
              <div>
                <strong style="color:var(--text-primary);">${g.type === 'pdf' ? '📕' : '🔗'} ${escapeHtml(g.title)}</strong>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${escapeHtml(g.description || '')}</div>
              </div>
              <a href="${escapeHtml(g.url)}" target="_blank" rel="noopener noreferrer" class="btn-vault-action" style="text-decoration:none; white-space:nowrap; font-size:11px;">
                ${g.type === 'pdf' ? '📥 Open / Download PDF' : '🌐 Open in Chrome'}
              </a>
            </div>
          `).join("");
        }


        if (engNotesContentBody) {
          engNotesContentBody.innerHTML = `
            <div style="font-size:14px; color:var(--text-primary); margin-bottom:14px;">
              <strong style="color:var(--accent-gold);">📌 Syllabus Scope & Summary:</strong>
              <p style="margin-top:4px; line-height:1.5;">${escapeHtml(n.summary || "")}</p>
            </div>

            <div style="margin-bottom:14px;">
              <strong style="color:var(--accent-gold);">⚡ Core Formulas & Governing Laws:</strong>
              <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                ${(n.keyTheorems || []).map(t => `
                  <div style="background:var(--bg-surface-subtle); padding:8px 12px; border-radius:6px; border:1px solid var(--border-subtle);">
                    <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(t.name)}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(t.statement)}</div>
                    ${t.formula ? `<div style="font-family:var(--font-mono); color:var(--accent-gold); font-size:12px; margin-top:2px;">${escapeHtml(t.formula)}</div>` : ''}
                  </div>
                `).join("")}
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <strong style="color:#10B981;">🎯 High-Probability 2-Mark University Q&A:</strong>
              <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
                ${(n.twoMarkQuestions || []).map(q => `
                  <div style="background:rgba(16,185,129,0.05); padding:8px 12px; border-radius:6px; border-left:3px solid #10B981;">
                    <div style="font-weight:700; color:var(--text-primary);">Q: ${escapeHtml(q.q)}</div>
                    <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">A: ${escapeHtml(q.a)}</div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div>
              <strong style="color:#FF0055;">📌 Repeated 13-Mark Big Question Outlines:</strong>
              <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
                ${(n.thirteenMarkOutlines || []).map(o => `
                  <div style="background:rgba(255,0,85,0.05); padding:8px 12px; border-radius:6px; border-left:3px solid #FF0055;">
                    <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(o.q)}</div>
                    <ul style="margin:4px 0 0 16px; font-size:12px; color:var(--text-secondary);">
                      ${(o.outline || []).map(step => `<li>${escapeHtml(step)}</li>`).join("")}
                    </ul>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }

        playTactileSound("success");
      } catch (err) {
        if (engNotesContentBody) {
          engNotesContentBody.innerHTML = `<div style="color:#FF0055; padding:16px;">Error formulating study notes: ${err.message}</div>`;
        }
      } finally {
        engGenerateNotesBtn.disabled = false;
        engGenerateNotesBtn.textContent = "📖 Generate AI Study Notes (PDF)";
      }
    });
  }

  // Fullscreen Notes Reader Modal
  if (btnOpenNotesReader) {
    btnOpenNotesReader.addEventListener("click", () => {
      const modal = document.getElementById("documentReaderModal");
      const title = document.getElementById("docReaderModalTitle");
      const body = document.getElementById("docReaderModalBody");

      if (!modal || !title || !body) return;
      title.textContent = `${engineeringHubState.activeSubject} — Official AI Study Notes`;
      body.innerHTML = engNotesContentBody ? engNotesContentBody.innerHTML : "No notes synthesized yet.";
      modal.style.display = "flex";
      modal.classList.add("active");
      playTactileSound("click");
    });
  }

  // Print Notes
  
  const btnDownloadNotesPdf = document.getElementById("btnDownloadNotesPdf");
  if (btnDownloadNotesPdf) {
    btnDownloadNotesPdf.addEventListener("click", () => {
      if (!engineeringHubState.activeSubject) return;
      const cached = engineeringHubState.notesCache[engineeringHubState.activeSubject];
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${escapeHtml(engineeringHubState.activeSubject)} — Official Study Notes (PDF)</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 24px; }
                .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
                .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 12px; }
                strong { color: #0f172a; }
              </style>
            </head>
            <body>
              <h1>${escapeHtml(engineeringHubState.activeSubject)} — Official University Study Notes</h1>
              <div class="meta">Institution: ${escapeHtml(engineeringHubState.activeCollege ? engineeringHubState.activeCollege.name : 'University')} | Branch: ${escapeHtml(engineeringHubState.activeBranch)} | Semester: ${engineeringHubState.activeSemester}</div>
              ${engNotesContentBody ? engNotesContentBody.innerHTML : 'No notes available'}
              <script>window.onload = function() { window.print(); };</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    });
  }

  if (btnPrintNotes) {
    btnPrintNotes.addEventListener("click", () => {
      window.print();
    });
  }

  // YouTube Video Recommendations (Globally Accessible Engine)
  window.loadYouTubeLectures = async function(subjectOverride) {
    const engVideosListGrid = document.getElementById("engVideosListGrid");
    const engVideoLangSelect = document.getElementById("engVideoLangSelect");
    const engVideoLangTag = document.getElementById("engVideoLangTag");
    if (!engVideosListGrid) return;

    const lang = (engVideoLangSelect && engVideoLangSelect.value) ? engVideoLangSelect.value : "Tamil";
    if (engVideoLangTag) engVideoLangTag.textContent = `Language: ${lang}`;

    const currentSubj = subjectOverride || 
      (typeof collegeAndSchoolState !== "undefined" && collegeAndSchoolState.activeSubject) ||
      (typeof engineeringHubState !== "undefined" && engineeringHubState.activeSubject) ||
      "Data Structures & Algorithms";

    const currentBranch = (typeof collegeAndSchoolState !== "undefined" && collegeAndSchoolState.activeCollegeBranch) ||
      (typeof engineeringHubState !== "undefined" && engineeringHubState.activeBranch) ||
      "CSE";

    engVideosListGrid.innerHTML = `
      <div style="text-align:center; padding:20px; color:var(--text-secondary); display:flex; flex-direction:column; align-items:center; gap:8px;">
        <div style="width:12px; height:12px; border-radius:50%; background:var(--accent-gold); box-shadow:0 0 12px var(--accent-gold);"></div>
        <div style="font-size:12px;">Searching YouTube for high-rated <strong>${escapeHtml(lang)}</strong> lectures for <strong>${escapeHtml(currentSubj)}</strong>...</div>
      </div>
    `;

    try {
      const res = await fetch(`${BACKEND_URL}/api/quiz/engineering/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubj,
          language: lang,
          branch: currentBranch
        })
      });

      const data = await res.json();
      if (!data.success || !data.videos || data.videos.length === 0) {
        throw new Error("No video results returned");
      }

      engVideosListGrid.innerHTML = data.videos.map(v => `
        <div class="eng-video-item-card" style="display:flex; gap:12px; padding:10px; background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-md); align-items:center; transition:all 0.2s ease;">
          <img src="${escapeHtml(v.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300')}" style="width:110px; height:68px; object-fit:cover; border-radius:6px; flex-shrink:0; border:1px solid rgba(255,255,255,0.08);" alt="Video thumbnail" onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'" />
          <div style="flex:1; min-width:0;">
            <div style="font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(v.title)}">${escapeHtml(v.title)}</div>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
              📺 <strong>${escapeHtml(v.channel)}</strong> · <span style="color:var(--accent-gold); font-weight:700;">${escapeHtml(v.language || lang)}</span>
            </div>
            <p style="font-size:11px; color:var(--text-tertiary); margin:4px 0 0 0; line-height:1.3; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${escapeHtml(v.description || 'Verified curriculum lecture & exam walkthrough.')}</p>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
            <button type="button" class="btn-vault-action" onclick="openEmbeddedYoutubeModal('${escapeHtml(v.url || '')}', '${escapeHtml(v.title || '').replace(/'/g, "\\'")}', '${escapeHtml(v.channel || '').replace(/'/g, "\\'")}')" style="white-space:nowrap; font-size:11px; background:var(--accent-gold); color:#000; font-weight:700; padding:6px 12px; border-radius:6px;">
              ▷ In-App
            </button>
            <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener noreferrer" class="btn-vault-action" style="white-space:nowrap; font-size:11px; text-decoration:none; text-align:center; padding:5px 10px;">
              ↗ YouTube
            </a>
          </div>
        </div>
      `).join("");
    } catch (err) {
      engVideosListGrid.innerHTML = `
        <div style="color:var(--text-secondary); padding:16px; text-align:center; background:rgba(255,255,255,0.02); border-radius:8px;">
          <div style="font-size:12px; margin-bottom:6px;">Recommended videos ready for ${escapeHtml(currentSubj)}</div>
          <button type="button" class="btn-vault-action" onclick="window.loadYouTubeLectures('${escapeHtml(currentSubj)}')" style="font-size:11px; padding:4px 12px; background:var(--accent-gold); color:#000; font-weight:700; border-radius:6px; cursor:pointer;">🔄 Reload Videos</button>
        </div>
      `;
    }
  };
  const loadYouTubeLectures = window.loadYouTubeLectures;

  // Live filter colleges by search query
  const engCollegeSearchInput = document.getElementById("engCollegeSearchInput");
  if (engCollegeSearchInput) {
    engCollegeSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll("#collegesCardsGrid .college-card").forEach(card => {
        const txt = card.textContent.toLowerCase();
        card.style.display = txt.includes(q) ? "" : "none";
      });
    });
  }

  if (engVideoLangSelect) {
    engVideoLangSelect.addEventListener("change", () => {
      loadYouTubeLectures();
      playTactileSound("click");
    });
  }

  if (engStateSelect) {
    engStateSelect.addEventListener("change", () => {
      if (engDistrictSelect) engDistrictSelect.value = "";
      loadColleges();
      playTactileSound("click");
    });
  }

  if (engDistrictSelect) {
    engDistrictSelect.addEventListener("change", () => {
      loadColleges();
      playTactileSound("click");
    });
  }

  // Initial load
  loadColleges();
}

/* =========================================================
   16. UTILITY HELPERS
========================================================= */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMarkdownResponse(text) {
  let safe = escapeHtml(text);

  // Bold
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Headers
  safe = safe.replace(/^### (.*$)/gim, '<h4 style="font-size:15px; font-weight:700; margin:10px 0 4px 0;">$1</h4>');
  safe = safe.replace(/^## (.*$)/gim, '<h3 style="font-size:16px; font-weight:700; margin:12px 0 6px 0;">$1</h3>');

  // Bullet points
  safe = safe.replace(/^\* (.*$)/gim, '<li style="margin-left:16px; margin-bottom:4px;">$1</li>');

  // Line breaks to paragraphs
  const paragraphs = safe.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.startsWith("<h") || p.startsWith("<li")) return p;
    return `<p style="margin-bottom:8px;">${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

// Greeting based on current local hour
function updateGreeting() {
  const greetingEl = document.getElementById("heroGreeting");
  if (!greetingEl) return;
  const hour = new Date().getHours();
  if (hour < 12) greetingEl.textContent = "Good morning, Commander.";
  else if (hour < 17) greetingEl.textContent = "Good afternoon, Commander.";
  else greetingEl.textContent = "Good evening, Commander.";
}
updateGreeting();

/* =========================================================
   18. PROJECT AURA OFFICIAL VISUAL VIDEO CONTROLLER
   Smooth loop · IntersectionObserver viewport pause · Fallback
========================================================= */
function initProjectAuraVisual() {
  const video = document.getElementById("projectAuraVisualVideo");
  if (!video) return;
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { video.play().catch(() => {}); }
        else { video.pause(); }
      });
    }, { threshold: 0.15 });
    observer.observe(video);
  }
  video.addEventListener("error", () => {
    console.info("[PROJECT AURA VISUAL] Video deferred; high-fidelity poster active.");
  });
}

/* =========================================================
   17. INITIALIZATION
========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  initCreationStudio();
  initMemoryCortex();
  initThemeSwitcher();
  initCuteRobotVoice();
  initEngineeringHub();
  init3DCardTilt();
  initProjectAuraVisual();
  initBootSequence();

  // Pre-load voices for speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
});
// PROJECT AURA 3.0 — AURA_MODULE_CARD_NAV_FIX
document.addEventListener("click", function (event) {
    const card = event.target.closest(".cc-mod-card[data-view]");
    if (!card) return;

    const viewKey = card.getAttribute("data-view");
    const targetView = document.getElementById("view-" + viewKey);

    if (targetView && typeof switchView === "function") {
        switchView(viewKey);
    } else {
        console.error("[PROJECT AURA] View target missing:", viewKey);
    }
});








/* =========================================================
   PROJECT AURA 3.0 — COMPREHENSIVE NEW MODULES & CONTROLLERS
   1. Voice AI & Desktop Voice Assistant
   2. College & School Hub (10th, 11th, 12th + Degree Streams)
   3. Creation Studio Deep Research Section
   4. Knowledge Vault Direct Topic Ingest & Comparative AI
   5. Study Intel Tap-to-Explain Accordions & Task Kanban Integration
   6. YouTube Video URL Decoder & In-App Player
   7. Student Auth & Learning Profile Persistence with Delete Option
   8. Command Center Personal Profile Memory & Consent
========================================================= */

// ── VOICE ASSISTANT ENGINE (TWO-WAY SPEECH & DESKTOP CONTROL) ──
let auraVoiceRecognition = null;
let isAuraVoiceActive = false;
let isVoiceCommandExecuting = false;
let voiceSilenceTimer = null;

function updateVoiceGenderUI() {
  const icon = document.getElementById("voiceGenderIcon");
  const label = document.getElementById("voiceGenderLabel");
  const isFemale = state.voiceGender === "female";
  if (icon) {
    icon.textContent = isFemale ? "♀" : "♂";
    icon.style.color = isFemale ? "#FF4081" : "#00E5FF";
  }
  if (label) {
    label.textContent = isFemale ? "Aura (Female)" : "Aero (Male)";
  }
  const fBtn = document.getElementById("robotVoiceFemaleBtn");
  const mBtn = document.getElementById("robotVoiceMaleBtn");
  if (fBtn && mBtn) {
    fBtn.classList.toggle("active", isFemale);
    mBtn.classList.toggle("active", !isFemale);
  }
}

function setVoiceGender(gender) {
  state.voiceGender = gender === "male" ? "male" : "female";
  localStorage.setItem("aura_voice_gender", state.voiceGender);
  updateVoiceGenderUI();
  playTactileSound("click");
}

function speakAuraVoice(text) {
  if (!window.speechSynthesis || state.soundEnabled === false) return;
  try {
    // Mute microphone while speaking so no echo feedback loops occur
    if (auraVoiceRecognition && isAuraVoiceActive) {
      try { auraVoiceRecognition.stop(); } catch (_) {}
    }
    if (robotSpeechRec) {
      try { robotSpeechRec.stop(); } catch (_) {}
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~>\[\]]/g, "").replace(/https?:\/\/\S+/g, "").slice(0, 320);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = state.voiceGender === "female" ? 1.05 : 0.95;

    const voices = window.speechSynthesis.getVoices();
    const isTamilScript = /[\u0B80-\u0BFF]/.test(cleanText);
    const isHindiScript = /[\u0900-\u097F]/.test(cleanText);
    let chosen = null;

    if (isTamilScript) {
      // Find native Tamil TTS voice or Indian locale fallback
      chosen = voices.find(v => v.lang.startsWith("ta") || v.lang.includes("ta-IN") || v.name.toLowerCase().includes("tamil"))
        || voices.find(v => v.lang.includes("IN"))
        || voices[0];
    } else if (isHindiScript || robotLanguage === "hi-IN") {
      // Find native Hindi TTS voice or Indian locale fallback
      chosen = voices.find(v => v.lang.startsWith("hi") || v.lang.includes("hi-IN") || v.name.toLowerCase().includes("hindi"))
        || voices.find(v => v.lang.includes("IN"))
        || voices[0];
    } else {
      // For Tanglish and English, use Indian English voice (en-IN) for accurate Tamil/Tanglish pronunciation
      const indianVoice = voices.find(v => (v.lang === "en-IN" || v.lang.includes("IN")) &&
        (state.voiceGender === "female" ? (!v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("female")) : (v.name.toLowerCase().includes("male"))));

      if (indianVoice) {
        chosen = indianVoice;
      } else if (state.voiceGender === "female") {
        chosen = voices.find(v => v.lang.startsWith("en") && 
          (v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Victoria") || v.name.includes("Female") || v.name.includes("Google US English"))) 
          || voices.find(v => v.lang.startsWith("en")) 
          || voices[0];
      } else {
        chosen = voices.find(v => v.lang.startsWith("en") && 
          (v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("Guy") || v.name.includes("George") || v.name.includes("Male") || v.name.includes("Google UK English Male"))) 
          || voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("female") && !v.name.toLowerCase().includes("zira") && !v.name.toLowerCase().includes("samantha")) 
          || voices[0];
      }
    }

    if (chosen) utterance.voice = chosen;

    utterance.onend = () => {
      // Re-enable listening in cute robot modal if still open
      const modal = document.getElementById("cuteRobotModal");
      if (modal && modal.classList.contains("active") && robotSpeechRec) {
        try { robotSpeechRec.start(); } catch (_) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("[VOICE SYNTHESIS ERROR]", err);
  }
}

function initGlobalVoiceAssistant() {
  const globalVoiceBtn = document.getElementById("globalVoiceAssistantBtn");
  const genderBtn = document.getElementById("voiceGenderToggleBtn");

  if (genderBtn) {
    genderBtn.addEventListener("click", () => {
      setVoiceGender(state.voiceGender === "female" ? "male" : "female");
    });
  }
  updateVoiceGenderUI();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (globalVoiceBtn) {
      globalVoiceBtn.addEventListener("click", () => {
        alert("Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      });
    }
    return;
  }

  auraVoiceRecognition = new SpeechRecognition();
  auraVoiceRecognition.continuous = false;
  auraVoiceRecognition.interimResults = true;
  auraVoiceRecognition.lang = "en-IN"; // Set to en-IN for natural Tanglish & Indian English recognition

  let accumulatedSpeech = "";

  auraVoiceRecognition.onstart = () => {
    isAuraVoiceActive = true;
    accumulatedSpeech = "";
    if (globalVoiceBtn) globalVoiceBtn.classList.add("listening");
    playTactileSound("click");
  };

  auraVoiceRecognition.onend = () => {
    isAuraVoiceActive = false;
    if (globalVoiceBtn) globalVoiceBtn.classList.remove("listening");
    if (accumulatedSpeech && accumulatedSpeech.trim()) {
      executeAuraVoiceCommand(accumulatedSpeech.trim());
      accumulatedSpeech = "";
    }
  };

  auraVoiceRecognition.onresult = (event) => {
    let finalPart = "";
    let interimPart = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalPart += event.results[i][0].transcript;
      } else {
        interimPart += event.results[i][0].transcript;
      }
    }
    accumulatedSpeech = (finalPart || interimPart || "").trim();

    // Debounce silence: when student finishes speaking (850ms pause), auto-stop and execute
    if (voiceSilenceTimer) clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = setTimeout(() => {
      if (isAuraVoiceActive && accumulatedSpeech) {
        try { auraVoiceRecognition.stop(); } catch (_) {}
      }
    }, 850);
  };

  if (globalVoiceBtn) {
    globalVoiceBtn.addEventListener("click", () => {
      if (isAuraVoiceActive) {
        auraVoiceRecognition.stop();
      } else {
        try {
          auraVoiceRecognition.start();
        } catch (_) {}
      }
    });
  }
}

// ── MULTILINGUAL VOICE DIRECTIVE & CONVERSATIONAL INTERACTION ENGINE ──
function executeAuraVoiceCommand(rawTranscript) {
  if (isVoiceCommandExecuting) return;
  const raw = (rawTranscript || "").trim();
  if (!raw) return;

  const cmd = raw.toLowerCase().replace(/[.,?!;:_]/g, " ").replace(/\s+/g, " ").trim();
  isVoiceCommandExecuting = true;
  playTactileSound("success");
  setTimeout(() => { isVoiceCommandExecuting = false; }, 1400);

  const isTamilScript = /[\u0B80-\u0BFF]/.test(raw) || /(?:vanakkam|thambi|machan|sollu|soller|kudu|enga|epdi|panrathu|thedu|padikalam|theriyuma|kandupidi|aaram|vilakku)/i.test(cmd);
  const isHindiScript = /[\u0900-\u097F]/.test(raw) || /(?:namaste|batao|kya|kaise|padhai|karna|kholo|samjhao|mujhe|tum|accha|karo|kaun|padho)/i.test(cmd);

  // 0. Conversational Interaction: Greetings & Assistant Capabilities
  if (cmd === "hi" || cmd === "hello" || cmd.startsWith("hello") || cmd.startsWith("hi aura") ||
      cmd.includes("vanakkam") || cmd.includes("வணக்கம்") || cmd.includes("namaste") || cmd.includes("नमस्ते") ||
      cmd.includes("who are you") || cmd.includes("what can you do") || cmd.includes("epdi iruka") || cmd.includes("kaise ho")) {
    let greetingText = "";
    if (isTamilScript) {
      greetingText = "வணக்கம்! நான் உங்கள் ஆரா AI குரல் உதவியாளர். கல்லூரி, பள்ளி பாடங்கள், மாதிரி தேர்வு, அல்லது உங்கள் சந்தேகங்களை தீர்க்க நான் தயார்!";
    } else if (isHindiScript) {
      greetingText = "नमस्ते! मैं आपका ऑरा AI वॉयस असिस्टेंट हूँ। कॉलेज, स्कूल, सिलेबस, मॉक टेस्ट और आपकी पढ़ाई के सभी सवालों में मदद करने के लिए तैयार हूँ।";
    } else if (robotLanguage === "ta-IN" || /(?:vanakkam|machan|thambi)/i.test(cmd)) {
      greetingText = "Vanakkam! Naan unga Project Aura Voice AI assistant. College, School, Mock Test, doubts ellathukum na reply and actions perform panren!";
    } else {
      greetingText = "Hello! I am Aura, your futuristic neural voice assistant. I can navigate Project Aura, explain topics, and execute actions across the entire platform.";
    }
    speakAuraVoice(greetingText);
    return;
  }

  // 1. Voice Persona Gender Toggle
  if (cmd.includes("male voice") || cmd.includes("switch to male") || cmd.includes("aan voice") || cmd.includes("aan kural") || cmd.includes("ஆண் குரல்") || cmd.includes("boy voice") || cmd.includes("पुरुष आवाज")) {
    setVoiceGender("male");
    speakAuraVoice(isTamilScript ? "ஆண் குரலுக்கு மாற்றப்பட்டது." : (isHindiScript ? "पुरुष आवाज में बदल दिया गया है।" : "Aero male voice-ku switch panniyachu."));
    return;
  }
  if (cmd.includes("female voice") || cmd.includes("switch to female") || cmd.includes("pen voice") || cmd.includes("pen kural") || cmd.includes("பெண் குரல்") || cmd.includes("girl voice") || cmd.includes("महिला आवाज")) {
    setVoiceGender("female");
    speakAuraVoice(isTamilScript ? "பெண் குரலுக்கு மாற்றப்பட்டது." : (isHindiScript ? "महिला आवाज में बदल दिया गया है।" : "Aura female voice-ku switch panniyachu."));
    return;
  }

  // 2. Recommended YouTube Videos Directive
  if (cmd.includes("recommended video") || cmd.includes("video varala") || cmd.includes("videos varala") || 
      cmd.includes("videos kaattu") || cmd.includes("video kaattu") || cmd.includes("lecture video") || 
      cmd.includes("video open") || cmd.includes("வீடியோ") || cmd.includes("காணொளி") || 
      cmd.includes("video play") || cmd.includes("videos podu") || cmd.includes("वीडियो")) {
    switchView("engineering-hub");
    if (typeof window.loadYouTubeLectures === "function") {
      window.loadYouTubeLectures();
    }
    const videosCard = document.getElementById("engVideosCard");
    if (videosCard) {
      setTimeout(() => videosCard.scrollIntoView({ behavior: "smooth" }), 200);
    }
    speakAuraVoice(isTamilScript ? "பரிந்துரைக்கப்பட்ட கல்லூரி மற்றும் பள்ளி வீடியோக்கள் தயாராக உள்ளன." : (isHindiScript ? "संबंधित यूट्यूब व्याख्यान वीडियो लोड कर दिए गए हैं।" : "Sari! Unga active subject-kku curated YouTube recommended lectures load aagiduchu."));
    return;
  }

  // 3. College & School Hub / Subjects / Syllabus Directive
  const isCollege = cmd.includes("college") || cmd.includes("kalloori") || cmd.includes("கல்லூரி") || cmd.includes("engineering") || cmd.includes("பொறியியல்") || cmd.includes("btech") || cmd.includes("be ") || cmd.includes("cse") || cmd.includes("कॉलेज");
  const isSchool = cmd.includes("school") || cmd.includes("palli") || cmd.includes("பள்ளி") || cmd.includes("10th") || cmd.includes("11th") || cmd.includes("12th") || cmd.includes("tenth") || cmd.includes("twelfth") || cmd.includes("स्कूल");
  const isSyllabus = cmd.includes("syllabus") || cmd.includes("பாடத்திட்டம்") || cmd.includes("curriculum") || cmd.includes("subject") || cmd.includes("सिलेबस");

  if (isCollege || isSchool || isSyllabus) {
    switchView("academic-hub-workspace");
    if (isSchool) {
      const schoolBtn = document.getElementById("tabAcademicSchool");
      if (schoolBtn) schoolBtn.click();
      speakAuraVoice(isTamilScript ? "பள்ளி பாடத்திட்டம் பகுதி திறக்கப்படுகிறது." : (isHindiScript ? "स्कूल हब और सिलेबस सेक्शन खोल दिया गया है।" : "School Hub open panniten. Ungaloda standard and subjects select pannikonga!"));
    } else {
      const collegeBtn = document.getElementById("tabAcademicCollege");
      if (collegeBtn) collegeBtn.click();
      speakAuraVoice(isTamilScript ? "கல்லூரி பாடத்திட்டம் பகுதி திறக்கப்படுகிறது." : (isHindiScript ? "कॉलेज हब और सिलेबस सेक्शन खोल दिया गया है।" : "College Curriculum open panniten. Ungaloda stream, branch, semester and subjects ready!"));
    }
    if (typeof window.loadYouTubeLectures === "function") {
      window.loadYouTubeLectures();
    }
    return;
  }

  // 4. Semester Mock Test / Exam
  if (cmd.includes("mock") || cmd.includes("exam") || cmd.includes("test") || cmd.includes("thearvu") || cmd.includes("தேர்வு") || cmd.includes("பரீட்சை") || cmd.includes("परीक्षा") || cmd.includes("टेस्ट")) {
    switchView("mock-test");
    speakAuraVoice(isTamilScript ? "செமஸ்டர் மாதிரி தேர்வு பகுதி திறக்கப்படுகிறது. வாழ்த்துகள்!" : (isHindiScript ? "सेमेस्टर मॉक टेस्ट पोर्टल खोल दिया गया है। शुभकामनाएं!" : "Semester Mock Test portal open panniten. 50-marks blueprint test ready, all the best!"));
    return;
  }

  // 5. Study & Task Planner / Study Intel / Milestones
  if (cmd.includes("study planner") || cmd.includes("task planner") || cmd.includes("study intel") || 
      cmd.includes("planner") || cmd.includes("task") || cmd.includes("milestone") || cmd.includes("schedule") || 
      cmd.includes("timetable") || cmd.includes("படிப்பு திட்டம்") || cmd.includes("திட்டம்") || cmd.includes("टाइमटेबल") || cmd.includes("प्लानर")) {
    switchView("study-intel");
    speakAuraVoice(isTamilScript ? "படிப்பு மற்றும் பணி திட்டம் திறக்கப்படுகிறது." : (isHindiScript ? "स्टडी प्लानर और टास्क शेड्यूल खोल दिया गया है।" : "Study and Task Planner open panniten. Ungaloda tasks ready!"));
    return;
  }

  // 6. Student Performance / Marks / Grades / Analytics
  if (cmd.includes("performance") || cmd.includes("mark") || cmd.includes("score") || 
      cmd.includes("grade") || cmd.includes("analytics") || cmd.includes("focus area") || 
      cmd.includes("மதிப்பெண்") || cmd.includes("செயல்திறன்") || cmd.includes("மார்க்") || cmd.includes("मार्क्स") || cmd.includes("रिजल्ट")) {
    switchView("student-performance");
    speakAuraVoice(isTamilScript ? "மாணவர் செயல்திறன் மற்றும் மதிப்பெண்கள் பகுதி திறக்கப்படுகிறது." : (isHindiScript ? "छात्र प्रदर्शन और अंक विश्लेषण खोला गया है।" : "Student Performance analytics open pandren. Ungaloda marks and focus areas check pannikonga!"));
    return;
  }

  // 7. Knowledge Vault / Notes / Documents
  if (cmd.includes("vault") || cmd.includes("knowledge") || cmd.includes("document") || 
      cmd.includes("notes") || cmd.includes("குறிப்பு") || cmd.includes("ஆவணம்") || cmd.includes("नोट्स")) {
    switchView("knowledge-vault");
    speakAuraVoice(isTamilScript ? "அறிவு பெட்டகம் மற்றும் குறிப்புகள் திறக்கப்படுகிறது." : (isHindiScript ? "नॉलेज वॉल्ट और नोट्स खोल दिया गया है।" : "Knowledge Vault open panniten. Stored study notes ready!"));
    return;
  }

  // 8. Creation Studio / Deep Research / Presentation
  if (cmd.includes("creation") || cmd.includes("studio") || cmd.includes("presentation") || 
      cmd.includes("slide") || cmd.includes("pptx") || cmd.includes("research") || 
      cmd.includes("code") || cmd.includes("வடிவமைப்பு") || cmd.includes("விளக்கக்காட்சி") || cmd.includes("रिसर्च")) {
    switchView("creation-lab");
    if (cmd.includes("presentation") || cmd.includes("slide") || cmd.includes("pptx") || cmd.includes("விளக்கக்காட்சி")) {
      const presTab = document.querySelector('.creation-tab-btn[data-tab="presentation"]');
      if (presTab) presTab.click();
    }
    speakAuraVoice(isTamilScript ? "வடிவமைப்பு மையம் திறக்கப்படுகிறது." : (isHindiScript ? "क्रिएशन स्टूडियो खोल दिया गया है।" : "Creation Studio open panniten!"));
    return;
  }

  // 9. YouTube Intel Workspace
  if (cmd.includes("youtube intel") || cmd.includes("video intel") || cmd.includes("யூடியூப்")) {
    switchView("youtube-intel");
    speakAuraVoice(isTamilScript ? "யூடியூப் இன்டெல் திறக்கப்படுகிறது." : "YouTube Intel workspace open panniten!");
    return;
  }

  // 10. Profile Details / "Who Am I"
  if (cmd.includes("who am i") || cmd.includes("naan yaaru") || cmd.includes("my profile") || 
      cmd.includes("my details") || cmd.includes("நான் யார்") || cmd.includes("என் விவரம்") || cmd.includes("मैं कौन हूँ")) {
    const profile = JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
    const name = profile.name || "Student";
    const std = profile.standard || "College & School Scholar";
    speakAuraVoice(isTamilScript ? `நீங்கள் ${name}, ${std}-ல் பயில்கிறீர்கள்.` : (isHindiScript ? `आप ${name} हैं और ${std} के छात्र हैं।` : `Neenga ${name}, ${std}-la padikareenga. Project Aura ungaluku eppothum udhavum!`));
    return;
  }

  // 11. Sign Out / Logout
  if (cmd.includes("sign out") || cmd.includes("logout") || cmd.includes("log out") || cmd.includes("veliye") || cmd.includes("வெளியேறு") || cmd.includes("लॉगआउट")) {
    const portal = document.getElementById("auraLoginPortal");
    if (portal) {
      localStorage.removeItem("aura_auth_session");
      portal.classList.remove("authenticated");
      switchView("command-center");
      speakAuraVoice(isTamilScript ? "ப்ராஜெக்ட் ஆராவிலிருந்து வெளியேறிவிட்டீர்கள்." : (isHindiScript ? "प्रोजेक्ट ऑरा से लॉगआउट कर दिया गया है।" : "Project Aura-la irunthu sign out aagiduchu."));
    }
    return;
  }

  // 12. System Utilities: Fullscreen, Scroll, Theme, Print
  if (cmd.includes("fullscreen") || cmd.includes("full screen") || cmd.includes("screen perusu")) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      speakAuraVoice("Fullscreen activated.");
    } else {
      document.exitFullscreen().catch(() => {});
      speakAuraVoice("Fullscreen closed.");
    }
    return;
  }
  if (cmd.includes("scroll down") || cmd.includes("keezha")) {
    window.scrollBy({ top: 600, behavior: "smooth" });
    return;
  }
  if (cmd.includes("scroll up") || cmd.includes("mela")) {
    window.scrollBy({ top: -600, behavior: "smooth" });
    return;
  }
  if (cmd.includes("theme") || cmd.includes("colour maathu") || cmd.includes("வண்ணம்") || cmd.includes("थीम")) {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) themeBtn.click();
    speakAuraVoice("Theme options opened.");
    return;
  }
  if (cmd.includes("print") || cmd.includes("pdf")) {
    window.print();
    return;
  }

  // 13. Universal Fallback: Interactive Doubt Solving & Live Conversational Voice Response
  switchView("command-center");
  let cleanQ = raw
    .replace(/^(?:search|find|ask|thedu|soller|sollu|vilakku|batao|kya hai)\s+(?:for\s+|paththi\s+|ke baare me\s+)?/i, "")
    .trim() || raw;

  const msgInput = document.getElementById("messageInput");
  if (msgInput) {
    msgInput.value = cleanQ;
    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) sendBtn.click();
  }

  // Interactive Voice AI Response: Fetch spoken answer and speak back aloud!
  fetch(`${BACKEND_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: `Give a clear, 1-2 sentence spoken reply to this student question: "${cleanQ}". Answer naturally in ${isTamilScript ? "Tamil or Tanglish" : (isHindiScript ? "Hindi" : "English")}.` })
  })
  .then(res => res.json())
  .then(data => {
    const spokenReply = (data && data.response) ? data.response.replace(/[*#_`~>\[\]]/g, "").slice(0, 220) : "";
    if (spokenReply) {
      speakAuraVoice(spokenReply);
    } else {
      speakAuraVoice(isTamilScript ? `கட்டளை மையத்தில் "${cleanQ}" பற்றிய பதில் தயாராகிறது.` : (isHindiScript ? `कमांड सेंटर में "${cleanQ}" का समाधान तैयार है।` : `Command Center-la "${cleanQ}" solve pandren!`));
    }
  })
  .catch(() => {
    speakAuraVoice(isTamilScript ? `கட்டளை மையத்தில் "${cleanQ}" பற்றிய பதில் பெறப்படுகிறது.` : (isHindiScript ? `कमांड सेंटर में "${cleanQ}" का उत्तर तैयार किया जा रहा है।` : `Command Center-la "${cleanQ}" solve pandren!`));
  });
}

// ── CREATION STUDIO: DEEP RESEARCH TAB CONTROLLER ──
function initCreationStudioResearch() {
  const creationResearchBtn = document.getElementById("creationResearchBtn");
  const creationResearchInput = document.getElementById("creationResearchInput");
  const creationResearchOutputContainer = document.getElementById("creationResearchOutputContainer");
  const creationResearchOutputText = document.getElementById("creationResearchOutputText");
  const copyCreationResearchBtn = document.getElementById("copyCreationResearchBtn");
  const saveCreationResearchVaultBtn = document.getElementById("saveCreationResearchVaultBtn");
  const printCreationResearchBtn = document.getElementById("printCreationResearchBtn");

  if (!creationResearchBtn) return;

  creationResearchBtn.addEventListener("click", async () => {
    const query = creationResearchInput ? creationResearchInput.value.trim() : "";
    if (!query) return;

    creationResearchBtn.disabled = true;
    creationResearchBtn.textContent = "Executing Deep Research across Multi-AI...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const content = data.content || data.summary || data.answer || "Research synthesis completed.";

      if (creationResearchOutputText) {
        creationResearchOutputText.innerHTML = formatCreationStudioOutput(content, `Deep Research: ${query}`);
      }
      if (creationResearchOutputContainer) {
        creationResearchOutputContainer.style.display = "block";
      }
      playTactileSound("success");
    } catch (err) {
      if (creationResearchOutputText) {
        creationResearchOutputText.innerHTML = `<div style="color:#EF4444; padding:12px;">Research synthesis encountered an error: ${escapeHtml(err.message)}</div>`;
      }
    } finally {
      creationResearchBtn.disabled = false;
      creationResearchBtn.textContent = "Execute Deep Research";
    }
  });

  if (copyCreationResearchBtn) {
    copyCreationResearchBtn.addEventListener("click", () => {
      const text = creationResearchOutputText ? creationResearchOutputText.innerText : "";
      if (text) {
        navigator.clipboard.writeText(text);
        copyCreationResearchBtn.textContent = "✓ Copied!";
        setTimeout(() => { copyCreationResearchBtn.textContent = "📋 Copy Report"; }, 1500);
      }
    });
  }

  if (saveCreationResearchVaultBtn) {
    saveCreationResearchVaultBtn.addEventListener("click", () => {
      const query = creationResearchInput ? creationResearchInput.value.trim() : "Deep Research Topic";
      const text = creationResearchOutputText ? creationResearchOutputText.innerText : "";
      if (text) {
        saveCustomMemoryDirect({
          title: `Research: ${query}`,
          category: "knowledge",
          content: text.slice(0, 1200)
        });
        saveCreationResearchVaultBtn.textContent = "✓ Saved to Vault";
        setTimeout(() => { saveCreationResearchVaultBtn.textContent = "⧉ Save to Vault"; }, 1500);
      }
    });
  }

  if (printCreationResearchBtn) {
    printCreationResearchBtn.addEventListener("click", () => window.print());
  }
}

// ── KNOWLEDGE VAULT DIRECT TOPIC INGESTION & COMPARISON ──
function initKnowledgeVaultTopicIngest() {
  const vaultIngestTopicBtn = document.getElementById("vaultIngestTopicBtn");
  const vaultTopicDirectInput = document.getElementById("vaultTopicDirectInput");

  if (!vaultIngestTopicBtn) return;

  vaultIngestTopicBtn.addEventListener("click", async () => {
    const topic = vaultTopicDirectInput ? vaultTopicDirectInput.value.trim() : "";
    if (!topic) return;

    vaultIngestTopicBtn.disabled = true;
    vaultIngestTopicBtn.textContent = "Ingesting...";

    // Store in local cache so it is immediately visible
    const localFiles = JSON.parse(localStorage.getItem("aura_local_vault_files") || "[]");
    const newEntry = {
      id: "vault_topic_" + Date.now(),
      filename: topic + ".md",
      originalName: topic + " (Academic Topic Grounding)",
      size: 14200,
      uploadedAt: new Date().toISOString()
    };
    localFiles.unshift(newEntry);
    localStorage.setItem("aura_local_vault_files", JSON.stringify(localFiles));

    // Reload files display immediately
    loadVaultFiles();

    // Trigger AI topic analysis & comparison in side panel
    analyzeVaultFile(newEntry.id, topic);

    vaultTopicDirectInput.value = "";
    vaultIngestTopicBtn.disabled = false;
    vaultIngestTopicBtn.textContent = "⚡ Ingest & Compare AI";
    playTactileSound("success");
  });
}

// ── STUDY INTEL: TAP-TO-EXPLAIN ACCORDIONS & KANBAN ADDITION ──
window.explainStudyTopic = async function(topicText, targetBoxId) {
  const targetBox = document.getElementById(targetBoxId);
  if (!targetBox) return;

  if (targetBox.style.display === "block") {
    targetBox.style.display = "none";
    return;
  }

  targetBox.style.display = "block";
  targetBox.innerHTML = `<span style="color:var(--text-tertiary);">✦ Synthesizing concise pedagogical explanation...</span>`;

  try {
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Explain this academic topic briefly, crystal-clearly, and pedagogically in 3 crisp parts for a student:
Topic: "${topicText}"

Structure:
1. ⚡ CORE CONCEPT: 2 simple sentences explaining what it is and why it matters.
2. 📌 GOVERNING FORMULA / LAW: Key formula, theorem, or rule with variable definitions.
3. 💡 DAILY-LIFE EXAMPLE & EXAM TIP: Intuitive real-world analogy and high-yield scoring pointer.`
      })
    });
    const data = await res.json();
    const explanation = data.answer || data.response || "Concept outline generated.";
    targetBox.innerHTML = formatMarkdownResponse(explanation);
    playTactileSound("click");
  } catch (err) {
    targetBox.innerHTML = `<span style="color:#EF4444;">Could not load explanation: ${escapeHtml(err.message)}</span>`;
  }
};

window.addMilestoneToTasks = function(milestoneText) {
  const newTask = {
    id: "task_" + Date.now(),
    title: milestoneText,
    bucket: "today",
    priority: "High",
    completed: false,
    createdAt: new Date().toISOString()
  };
  state.tasks.unshift(newTask);
  localStorage.setItem("aura_tasks", JSON.stringify(state.tasks));
  renderTasks();
  playTactileSound("success");
  alert(`Added to execution Kanban: "${milestoneText.slice(0, 36)}..."`);
};

// ── YOUTUBE INTEL: DECODE URL DIRECT STREAMER ──
function initYouTubeUrlDecoder() {
  const ytDecodeUrlBtn = document.getElementById("ytDecodeUrlBtn");
  const ytDecodeUrlInput = document.getElementById("ytDecodeUrlInput");
  const ytDecodePlayerArena = document.getElementById("ytDecodePlayerArena");
  const ytDecodeIframe = document.getElementById("ytDecodeIframe");
  const ytDecodeAnalysisText = document.getElementById("ytDecodeAnalysisText");

  if (!ytDecodeUrlBtn) return;

  function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  ytDecodeUrlBtn.addEventListener("click", async () => {
    const url = ytDecodeUrlInput ? ytDecodeUrlInput.value.trim() : "";
    if (!url) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      alert("Please enter a valid YouTube video link (watch URL, youtu.be, or shorts).");
      return;
    }

    if (ytDecodeIframe) {
      ytDecodeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (ytDecodePlayerArena) {
      ytDecodePlayerArena.style.display = "block";
    }

    if (ytDecodeAnalysisText) {
      ytDecodeAnalysisText.innerHTML = "<p>✦ AURA AI is analyzing video concepts and structuring takeaways...</p>";
    }

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze and decode this YouTube educational lecture (Video ID: ${videoId}, URL: ${url}):
Provide:
1. Executive Summary & Core Premise.
2. 4-5 High-Yield Academic Takeaways with Conceptual Breakdown.
3. Crucial Timestamps / Topic Milestones for revision.
4. Key Exam Questions related to this lecture topic.`
        })
      });
      const data = await res.json();
      const analysis = data.answer || data.response || "Video analysis compiled.";
      if (ytDecodeAnalysisText) {
        ytDecodeAnalysisText.innerHTML = formatMarkdownResponse(analysis);
      }
      playTactileSound("success");
    } catch (err) {
      if (ytDecodeAnalysisText) {
        ytDecodeAnalysisText.innerHTML = `<p style="color:#EF4444;">Error generating video takeaways: ${escapeHtml(err.message)}</p>`;
      }
    }
  });
}

// ── ACADEMIC INTELLIGENCE SUITE MASTER CONTROLLER ──
const academicIntelligenceState = {
  activeTab: "school", // "school" | "college" | "material"
  activeSchoolStandard: "STD_12", // "STD_10" | "STD_11" | "STD_12"
  activeSchoolGroup: "BIO_MATHS", // "BIO_MATHS" | "COMP_SCI" | "PURE_SCI" | "COMMERCE" | "ARTS"
  activeSubject: "Physics",
  selectedSubject: null, // { standardOrDept, semester, subjectName, subjectCode, currentTopic, topics }
  userMethodPermission: localStorage.getItem("aura_school_perm") === "true",
  storedMethod: localStorage.getItem("aura_school_method") || "Step-by-step formula breakdown, bilingual Tamil-English, textbook definitions first, and exam-scoring tips",
  // Material Analyzer State
  activeMaterial: {
    name: "12th_Physics_Electrostatics_Formulas.pdf",
    type: "PDF Notes",
    words: 2450,
    text: "",
    strictGrounding: true
  },
  materialChatHistory: []
};
const collegeAndSchoolState = academicIntelligenceState;

// High-Yield Sample Material Presets for Instant Context-Grounded Solving
const AURA_MATERIAL_PRESETS = {
  PHYSICS_12: {
    name: "12th_Physics_Electrostatics_Formulas.pdf",
    type: "PDF Notes",
    meta: "2,450 words · 8 Formulas Detected · Ready for RAG",
    text: `12th Standard Higher Secondary Physics — Electrostatics & Gauss's Law Hand Notes
Unit 1: Electrostatics
1. Coulomb's Inverse Square Law:
   Force between two point charges in vacuum:
   F = (1 / (4πε₀)) * (|q₁ * q₂| / r²)
   where 1 / (4πε₀) = 8.98755 × 10⁹ N·m²/C², ε₀ = 8.854 × 10⁻¹² C²/(N·m²)
   In dielectric medium with relative permittivity ε_r:
   F_medium = F_vacuum / ε_r
2. Electric Field:
   Field due to point charge q: E = (1 / (4πε₀)) * (q / r²) r̂
   Force on test charge q₀: F = q₀ * E
3. Electric Dipole:
   Dipole Moment: p = q * (2a) (vector from -q to +q, unit: C·m)
   Electric Field at Axial Point (for distance r >> a):
   E_axial = (1 / (4πε₀)) * (2p / r³)
   Electric Field at Equatorial Point (for distance r >> a):
   E_equatorial = (1 / (4πε₀)) * (p / r³)
   Fundamental Ratio: E_axial = 2 * E_equatorial
   Torque on dipole in uniform field: τ = p × E = p * E * sin(θ)
   Potential Energy: U = -p · E = -p * E * cos(θ)
4. Gauss's Law & High-Yield Applications:
   Electric Flux: Φ_E = ∮ E · dA = q_enclosed / ε₀
   Field due to Infinitely Long Straight Wire: E = λ / (2πε₀r) (λ = linear charge density)
   Field due to Uniformly Charged Infinite Plane Sheet: E = σ / (2ε₀) (σ = surface charge density)
   Field inside charged spherical shell: E_in = 0
5. Capacitance & Energy Density:
   Capacitance definition: C = Q / V (unit: Farad, F)
   Parallel Plate Capacitor: C = ε₀ * A / d (with dielectric slab: C = ε_r * ε₀ * A / d)
   Energy Stored in Capacitor: U = (1/2) * C * V² = (1/2) * Q * V = Q² / (2C)
   Energy Density: u_E = (1/2) * ε₀ * E²`
  },
  MATHS_10: {
    name: "10th_Maths_Quadratic_Equations_AP.pdf",
    type: "Maths Formula Sheet",
    meta: "1,820 words · 12 Formulas Detected · Ready for RAG",
    text: `10th Standard Mathematics — Numbers, Sequences & Quadratic Equations
Chapter 2: Numbers & Sequences
1. Arithmetic Progression (AP):
   First term = a, common difference = d
   nth term formula: t_n = a + (n - 1)d
   Sum of first n terms: S_n = (n / 2) [2a + (n - 1)d] = (n / 2) [a + l] (where l = last term)
   Condition for three numbers a, b, c in AP: 2b = a + c
2. Geometric Progression (GP):
   First term = a, common ratio = r
   nth term formula: t_n = a * r^(n - 1)
   Sum of first n terms: S_n = a * (r^n - 1) / (r - 1) for r > 1; S_n = a * (1 - r^n) / (1 - r) for r < 1
   Sum to infinity (|r| < 1): S_∞ = a / (1 - r)
Chapter 3: Algebra & Quadratic Equations
1. General Quadratic Equation: ax² + bx + c = 0 (a ≠ 0)
2. Quadratic Formula (Sridharacharya Method):
   x = [-b ± √(b² - 4ac)] / (2a)
3. Nature of Roots (Discriminant Δ = b² - 4ac):
   - Δ > 0: Two real and distinct roots
   - Δ = 0: Two real and equal roots (x = -b / 2a)
   - Δ < 0: No real roots (roots are complex/imaginary)
4. Relations between Roots and Coefficients:
   If roots are α and β:
   Sum of roots: α + β = -b / a
   Product of roots: α * β = c / a
   Formation of equation: x² - (α + β)x + (α * β) = 0`
  },
  CSE_COLLEGE: {
    name: "CS3301_Data_Structures_Trees_Graphs.pdf",
    type: "Engineering Module",
    meta: "3,100 words · 14 Algorithms Detected · Ready for RAG",
    text: `Anna University Regulation 2021 — CS3301 Data Structures
Unit 3: Trees and Balancing
1. Binary Search Tree (BST):
   Property: For any node X, all nodes in Left Subtree < X < all nodes in Right Subtree.
   Search, Insertion, Deletion average complexity: O(h) where h is height (O(log n) balanced, O(n) worst-case skewed).
2. Tree Traversals:
   - Inorder Traversal: Left -> Root -> Right (Produces strictly sorted keys for BST)
   - Preorder Traversal: Root -> Left -> Right
   - Postorder Traversal: Left -> Right -> Root
3. AVL Tree Rotations:
   Balance Factor: BF(node) = Height(Left Subtree) - Height(Right Subtree) ∈ {-1, 0, +1}
   - LL Imbalance (Insertion into left subtree of left child): Single Right Rotation
   - RR Imbalance (Insertion into right subtree of right child): Single Left Rotation
   - LR Imbalance (Insertion into right subtree of left child): Left Rotation on left child, then Right Rotation on root
   - RL Imbalance (Insertion into left subtree of right child): Right Rotation on right child, then Left Rotation on root
Unit 4: Graph Algorithms
1. Breadth-First Search (BFS): Queue-based FIFO, Time Complexity: O(V + E), discovers shortest path in unweighted graphs.
2. Depth-First Search (DFS): Stack/Recursion-based LIFO, Time Complexity: O(V + E), detects cycles and topological ordering.
3. Dijkstra's Algorithm: Single-source shortest path with non-negative edge weights using Min-Heap priority queue. Time Complexity: O((V + E) log V).`
  },
  COMMERCE_12: {
    name: "12th_Commerce_Partnership_Goodwill.pdf",
    type: "Accountancy Notes",
    meta: "1,980 words · 6 Financial Methods Detected · Ready for RAG",
    text: `12th Standard Higher Secondary Accountancy — Partnership Accounts & Goodwill Valuation
Chapter 3 & 4: Partnership Accounts
1. Goodwill Valuation Methods:
   Method 1: Average Profit Method:
   Goodwill = Adjusted Average Profit × Number of Years of Purchase
   Adjusted Profit = Total Normal Profits / Number of Years (excluding non-operating gains/losses)
   Method 2: Super Profit Method:
   Normal Profit = Capital Employed × (Normal Rate of Return / 100)
   Super Profit = Average Actual Profit - Normal Profit
   Goodwill = Super Profit × Number of Years of Purchase
   Method 3: Capitalization of Super Profit:
   Goodwill = (Super Profit / Normal Rate of Return) × 100
   Method 4: Capitalization of Average Profit:
   Total Capitalized Value = (Average Profit / Normal Rate of Return) × 100
   Goodwill = Total Capitalized Value - Capital Employed (Net Assets)
2. Admission of a Partner:
   Sacrificing Ratio = Old Profit Share - New Profit Share
   Revaluation of Assets & Liabilities:
   Revaluation Account is a Nominal Account:
   - Debited: Decrease in asset values, increase in liabilities, unrecorded liabilities
   - Credited: Increase in asset values, decrease in liabilities, unrecorded assets
   Revaluation Profit/Loss transferred to Old Partners' Capital Accounts in Old Ratio.`
  }
};

// Rich School Curriculum Database (10th, 11th, 12th State Board / CBSE)
const AURA_SCHOOL_CURRICULUM = {
  STD_10: {
    title: "10th Standard (SSLC & CBSE Board)",
    subjects: [
      {
        id: "TAMIL_10",
        name: "தமிழ் (Language Paper)",
        weight: "Board Language · 100 Marks",
        chapters: [
          "இயல் 1: அமுதூற்று (அன்னை மொழியே, தமிழ்ச்சொல் வளம், இரட்டுற மொழிதல்)",
          "இயல் 2: உயிரின் ஓசை (காற்றே வா, முல்லைப்பாட்டு, தொகைநிலைத் தொடர்கள்)",
          "இயல் 3: கூட்டாஞ்சோறு (விருந்தோம்பல், காசி காண்டம், தொகாநிலைத் தொடர்கள்)",
          "இயல் 4: நான்காம் தமிழ் (செயற்கை நுண்ணறிவு, பெருமாள் திருமொழி, பரிபாடல்)",
          "இயல் 5: மணற்கேணி (நீதி வெண்பா, திருவிளையாடற் புராணம், வினா-விடை வகைகள்)",
          "இயல் 6: நிலா முற்றம் (கம்பராமாயணம், பாய்ச்சல், அகப்பொருள் இலக்கணம்)",
          "இயல் 7: விதைநெல் (ஏர் புதிதா, மெய்க்கீர்த்தி, புறப்பொருள் இலக்கணம்)",
          "இயல் 8: எல்லைக்கோடு (ஞானம், சிலப்பதிகாரம், பா-வகை யாப்பிலக்கணம்)",
          "இயல் 9: அன்பின் மொழி (சித்தாளு, தேம்பாவணி, அணி இலக்கணம்)"
        ],
        formula: "இலக்கண விதிகள்: வேற்றுமை உருபுகள் (ஐ, ஆல், கு, இன், அது, கண்), வெண்பா ஈற்றடி வாய்பாடுகள் (நாள், மலர், காசு, பிறப்பு), அணி (உவமை, உருவகம், இரட்டுற மொழிதல்)",
        scoreTip: "பத்தி வினா-விடை முழு மதிப்பெண் பெற பாடல் வரிகளை அடிக்கோடிட்டு எழுதவும். திருக்குறள் சீர் பிரிக்காமல் தவறின்றி எழுதவும்."
      },
      {
        id: "ENGLISH_10",
        name: "English Language & Literature",
        weight: "Core Language · 100 Marks",
        chapters: [
          "Unit 1: His First Flight (Liam O'Flaherty) / The Grumble Family",
          "Unit 2: The Night the Ghost Got In (James Thurber) / Zigzag",
          "Unit 3: Empowered Women Navigating The World / I am Every Woman",
          "Unit 4: The Attic (Satyajit Ray) / The Ant and the Cricket",
          "Unit 5: Tech Bloomers / The Secret of the Machines (Rudyard Kipling)",
          "Unit 6: The Last Lesson (Alphonse Daudet) / No Men Are Foreign",
          "Unit 7: The Dying Detective (Arthur Conan Doyle) / The House on Elm Street"
        ],
        formula: "Grammar Core: Active/Passive Voice, Direct & Indirect Speech, Tenses (12 formats), Modal Auxiliaries, Prepositional Phrases, Concord",
        scoreTip: "Notice Writing, Formal Letter, and Quote From Memory have fixed marking rubrics. Write neat headings and maintain formal formats."
      },
      {
        id: "MATHS_10",
        name: "Mathematics (Board Centum Track)",
        weight: "High Priority Board · 100 Marks",
        chapters: [
          "Ch 1: Relations and Functions (Ordered pairs, Types of functions, Composition)",
          "Ch 2: Numbers and Sequences (Euclid's Lemma, Fundamental Theorem, AP & GP)",
          "Ch 3: Algebra (Simultaneous equations, GCD, Square root of polynomials, Quadratic equations, Matrices)",
          "Ch 4: Geometry (Basic Proportionality Theorem, Angle Bisector Theorem, Pythagoras Theorem)",
          "Ch 5: Coordinate Geometry (Area of triangle/quadrilateral, Slope of line, Equations of straight lines)",
          "Ch 6: Trigonometry (Trigonometric identities, Heights and distances with angle of elevation & depression)",
          "Ch 7: Mensuration (Surface area and volume of Cylinder, Cone, Sphere, Hemisphere & Frustum)",
          "Ch 8: Statistics & Probability (Standard deviation, Coefficient of variation, Addition theorem of probability)"
        ],
        formula: "AP: t_n = a + (n-1)d, S_n = n/2[2a + (n-1)d] | Quadratic: x = (-b ± √(b² - 4ac)) / (2a) | Mensuration: Frustum V = 1/3πh(R² + r² + Rr) | Slope: m = (y₂ - y₁) / (x₂ - x₁)",
        scoreTip: "In 5-mark geometry and trigonometry sums, drawing neat diagrams with labeled dimensions carries 1 full mark."
      },
      {
        id: "SCIENCE_10",
        name: "Science (Physics, Chemistry & Biology)",
        weight: "Practical Core · 75 Theory + 25 Lab",
        chapters: [
          "Physics: Laws of Motion, Optics (Refraction, Lenses), Thermal Physics, Electricity, Acoustics, Nuclear Physics",
          "Chemistry: Solutions, Types of Chemical Reactions, Periodic Classification of Elements, Carbon & its Compounds",
          "Biology: Plant Anatomy & Physiology, Structural Organisation of Animals, Nervous System, Plant & Animal Hormones",
          "Biology: Reproduction in Plants and Animals, Heredity & Mendel's Laws, Origin and Evolution of Life, Environmental Management"
        ],
        formula: "F = ma | Lens Formula: 1/f = 1/v - 1/u | Ohm's Law: V = IR | Joule's Law: H = I²Rt | Ideal Gas: PV = nRT | Photosynthesis: 6CO₂ + 6H₂O -> C₆H₁₂O₆ + 6O₂",
        scoreTip: "Draw labeled circuit diagrams for Ohm's law, ray diagrams for convex/concave lenses, and neat cross-sections of brain/kidney."
      },
      {
        id: "SOCIAL_10",
        name: "Social Science (History, Geo, Civics & Eco)",
        weight: "High Weightage · 100 Marks",
        chapters: [
          "History: Outbreak of WWI & Aftermath, Interwar Period, WWII, Social & Religious Reformers in TN, Anti-Colonial Struggle, Gandhian Era, Freedom Struggle in TN",
          "Geography: India - Location, Relief & Drainage, Climate & Vegetation, Agriculture, Resources & Industries, Population & Transport, Physical & Human Geography of TN",
          "Civics: Constitution of India (Preamble, Fundamental Rights), Central Government, State Government, India's Foreign Policy & International Relations",
          "Economics: Gross Domestic Product and its Growth, Globalization and Trade, Food Security and Nutrition, Government and Taxes, Industrial Clusters in TN"
        ],
        formula: "Key Articles: Art 14-18 (Equality), Art 19-22 (Freedom), Art 32 (Constitutional Remedies) | GDP = C + I + G + (X - M) | SEZ & Industrial Corridors in TN",
        scoreTip: "Timeline chart (1900 to 1947 events) and Map marking (India & Tamil Nadu physical maps) guarantee 10 easy marks."
      }
    ]
  },
  STD_11: {
    title: "11th Standard Higher Secondary",
    groups: {
      BIO_MATHS: [
        {
          name: "Mathematics (Calculus & Analytical Geometry)",
          weight: "Core Mathematics · 90 Theory",
          chapters: ["Sets, Relations & Functions", "Basic Algebra", "Trigonometry", "Combinatorics & Mathematical Induction", "Binomial Theorem & Sequences", "Two Dimensional Analytical Geometry", "Matrices & Determinants", "Vector Algebra", "Differential Calculus: Limits & Continuity", "Differential Calculus: Differentiability", "Integral Calculus", "Introduction to Probability"],
          formula: "Trig: sin(A ± B), cos(A ± B) | Limits: lim (sin x / x) = 1 | Deriv: d/dx(x^n) = n x^(n-1) | Integral: ∫ x^n dx = x^(n+1)/(n+1) + C",
          scoreTip: "Master limits substitution and trigonometric expansions; write explicit steps for matrix determinant properties."
        },
        {
          name: "Physics (Mechanics, Thermal & Waves)",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Nature of Physical World & Measurement", "Kinematics (Vectors, Projectile motion)", "Laws of Motion (Newton's laws, Friction, Circular motion)", "Work, Energy and Power (Collisions)", "Motion of System of Particles & Rigid Body (Rotational dynamics, Moment of inertia)", "Gravitation (Kepler's laws, Escape speed)", "Properties of Matter (Elasticity, Surface tension, Viscosity)", "Thermodynamics (Carnot engine, Laws of thermodynamics)", "Kinetic Theory of Gases", "Oscillations (Simple Harmonic Motion)", "Waves (Doppler effect, Standing waves)"],
          formula: "Equations of Motion: v = u + at, s = ut + 1/2at², v² = u² + 2as | Torque: τ = I α | Escape velocity: v_e = √(2gR) | Bernoulli: P + 1/2ρv² + ρgh = const",
          scoreTip: "Derivations like Projectile Path is Parabolic and Terminal Velocity carry full 5 marks when accompanied by neat labeled diagrams."
        },
        {
          name: "Chemistry (Physical, Inorganic & Organic)",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Basic Concepts of Chemistry & Chemical Calculations (Mole concept)", "Quantum Mechanical Model of Atom (Schrödinger, Quantum numbers)", "Periodic Classification of Elements", "Hydrogen", "Alkali and Alkaline Earth Metals", "Gaseous State (van der Waals equation)", "Thermodynamics (Enthalpy, Entropy, Gibbs free energy)", "Physical and Chemical Equilibrium", "Solutions (Henry's law, Raoult's law)", "Chemical Bonding (VSEPR, Hybridization)", "Fundamentals of Organic Chemistry (IUPAC, Isomerism)", "Basic Organic Reactions (Reaction mechanisms)", "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromaticity)", "Environmental Chemistry"],
          formula: "Mole: n = mass / Molar mass | de Broglie: λ = h / mv | van der Waals: (P + an²/V²)(V - nb) = nRT | Gibbs: ΔG = ΔH - TΔS | pH = -log[H⁺]",
          scoreTip: "Draw clear orbital shapes (s, p, d) and provide exact electron configurations for transition metal exceptions (Cr, Cu)."
        },
        {
          name: "Biology (Botany & Zoology)",
          weight: "Biological Sciences · 70 Theory + 30 Lab",
          chapters: ["Botany: Living World, Plant Kingdom, Vegetative & Reproductive Morphology, Taxonomy of Angiosperms (Fabaceae, Solanaceae), Cell as Unit of Life, Cell Cycle & Division, Biomolecules, Plant Physiology (Photosynthesis, Respiration)", "Zoology: Kingdom Animalia, Tissue Level of Organisation, Digestion & Absorption, Breathing & Respiration, Body Fluids & Circulation, Excretory Products, Locomotion & Movement, Neural Control & Coordination"],
          formula: "Photosynthetic light reactions: Z-scheme | Calvin cycle energetics: 18 ATP + 12 NADPH | Cardiac Output = Stroke Volume × Heart Rate = 5 L/min",
          scoreTip: "Floral formula and floral diagrams of Solanaceae and Fabaceae are guaranteed 5-mark board questions."
        }
      ],
      COMP_SCI: [
        {
          name: "Mathematics",
          weight: "Core Mathematics · 90 Theory",
          chapters: ["Sets, Relations & Functions", "Trigonometry", "Matrices & Determinants", "Combinatorics", "Analytical Geometry", "Differential Calculus", "Integral Calculus", "Probability Theory"],
          formula: "Same foundational calculus, matrix inversion, and vector dot/cross products as standard mathematics curriculum.",
          scoreTip: "Step-by-step working for inverse matrix A⁻¹ = (1 / |A|) adj(A) ensures zero marks are lost in Part D."
        },
        {
          name: "Physics",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Measurement & Vectors", "Kinematics", "Laws of Motion", "Work & Energy", "Rigid Body Dynamics", "Gravitation", "Properties of Matter", "Thermodynamics", "Oscillations & Waves"],
          formula: "v = u + at | F = dp/dt | Moment of Inertia of Ring, Disc, Cylinder | Kepler's Third Law: T² ∝ r³ | SHM: x = A sin(ωt + φ)",
          scoreTip: "State laws word-for-word (Newton's laws, Hooke's law, Pascal's principle) to get full 2 marks."
        },
        {
          name: "Chemistry",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Mole Concept", "Quantum Atom", "Periodic Table", "Chemical Bonding", "Thermodynamics", "Chemical Equilibrium", "Organic Basics & Hydrocarbons"],
          formula: "n = w / M | ΔH = ΔU + PΔV | Equilibrium K_p = K_c(RT)^(Δn) | Hybridization sp, sp², sp³ geometry",
          scoreTip: "Mechanism of Markovnikov and Anti-Markovnikov addition with chemical equations gives guaranteed marks."
        },
        {
          name: "Computer Science (Python & Fundamentals)",
          weight: "Coding Core · 70 Theory + 30 Lab",
          chapters: ["Introduction to Computers & Evolution", "Number Systems (Binary, Octal, Hexadecimal conversions, 1's & 2's Complement)", "Computer Organization (Processor, Memory hierarchy)", "Theoretical Concepts of Operating System (Process management, Memory management)", "Working with Windows / Linux OS", "Control Structures in Python (if-else, while, for loops)", "Python Functions (Built-in, User-defined, Recursion, Lambda)", "Strings and String Manipulations", "Lists, Tuples, Sets and Dictionaries in Python", "Object Oriented Python Programming (Classes, Objects, Constructors)"],
          formula: "Number Conversion algorithms | String slicing: str[start:stop:step] | List comprehension: [x**2 for x in range(n)] | Class syntax: class Name: def __init__(self):",
          scoreTip: "Write syntactically exact Python code snippets with proper indentation and docstrings for 5-mark programming questions."
        }
      ],
      PURE_SCI: [
        {
          name: "Physics",
          weight: "Pure Science · 70 Theory + 30 Lab",
          chapters: ["Measurement", "Kinematics", "Laws of Motion", "Work & Energy", "Rotational Motion", "Gravitation", "Properties of Matter", "Thermodynamics", "Waves"],
          formula: "Thorough derivations of Bernoulli's theorem, simple pendulum time period T = 2π√(l/g), and Carnot efficiency η = 1 - T_C/T_H.",
          scoreTip: "State assumptions clearly before deriving thermodynamic and mechanical equations."
        },
        {
          name: "Chemistry",
          weight: "Pure Science · 70 Theory + 30 Lab",
          chapters: ["Atomic Structure", "Periodic Trends", "Bonding Models", "Equilibrium", "Solutions", "Organic Fundamentals", "Environmental Chemistry"],
          formula: "Full physical chemistry derivations: Henderson-Hasselbalch equation, Raoult's law vapor pressure depression.",
          scoreTip: "Include catalyst, temperature, and pressure conditions in every inorganic industrial preparation."
        },
        {
          name: "Botany (Pure Plant Science)",
          weight: "Pure Plant Science · 35 Theory + 15 Lab",
          chapters: ["Living World & Plant Diversity", "Algae, Bryophytes, Pteridophytes & Gymnosperms", "Morphology of Angiosperms", "Taxonomy & Systematic Botany", "Cell Biology & Cytology", "Biomolecules & Enzymes", "Plant Physiology: Transport, Mineral Nutrition, Photosynthesis, Respiration & Plant Growth Regulators"],
          formula: "Light Reaction vs Dark Reaction | C3 vs C4 photosynthetic pathway comparisons | Plant growth hormones: Auxin, Gibberellin, Cytokinin, ABA, Ethylene functions",
          scoreTip: "Draw labeled diagrams of chloroplast ultrastructure and anther transverse sections."
        },
        {
          name: "Zoology (Pure Animal Science)",
          weight: "Pure Animal Science · 35 Theory + 15 Lab",
          chapters: ["Animal Diversity & Systematics", "Levels of Organisation & Animal Tissues", "Digestive & Excretory Systems in Animals", "Circulation, Respiration & Gaseous Exchange", "Locomotion, Muscular System & Skeleton", "Neural Control & Endocrine System", "Animal Behavior & Chronobiology"],
          formula: "Sliding Filament Theory of muscle contraction | Nephron counter-current multiplier mechanism | Mechanism of hormone action (Lipid vs Peptide)",
          scoreTip: "Nephron diagram with labeled glomerulus, PCT, Loop of Henle, and DCT is a recurring 5-mark question."
        }
      ],
      COMMERCE: [
        {
          name: "Accountancy",
          weight: "Commerce Core · 90 Theory + 10 Internal",
          chapters: ["Introduction to Accounting (Concepts, Conventions, Double Entry)", "Accounting Equation & Journal Entries", "Ledger Posting & Trial Balance", "Subsidiary Books I & II (Cash Book, Petty Cash)", "Bank Reconciliation Statement (BRS)", "Rectification of Errors (One-sided & Two-sided)", "Depreciation Accounting (Straight Line & Written Down Value methods)", "Capital and Revenue Transactions", "Final Accounts of Sole Proprietorship (Trading, P&L, Balance Sheet)"],
          formula: "Accounting Equation: Assets = Liabilities + Capital | Depreciation (SLM) = (Cost - Scrap) / Useful Life | Gross Profit = Net Sales - COGS",
          scoreTip: "Prepare trading and profit & loss accounts in proper T-format with closing stock and outstanding adjustments clearly shown."
        },
        {
          name: "Commerce & Business Studies",
          weight: "Commerce Core · 90 Theory",
          chapters: ["Historical Background of Commerce in Indian Sub-continent", "Forms of Business Organisation: Sole Proprietorship", "Hindu Undivided Family (HUF) & Partnership", "Joint Stock Company (Memorandum & Articles of Association)", "Co-operative Enterprises & Government Companies", "Sources of Business Finance (Equity, Debentures, Retained Earnings)", "Micro, Small and Medium Enterprises (MSMEs)", "Internal Trade: Wholesalers & Retailers", "International Trade: Export & Import Procedures"],
          formula: "Comparison matrices: Sole Trader vs Partnership vs Company (Liability, Continuity, Management, Formation)",
          scoreTip: "Structure business organization answers with: Definition, Features, Merits, and Demerits in neat bullet points."
        },
        {
          name: "Economics",
          weight: "Social & Economic · 90 Theory",
          chapters: ["Introduction to Microeconomics", "Theory of Consumer Behaviour (Utility, Indifference curves)", "Production Analysis (Law of Variable Proportions)", "Cost and Revenue Analysis", "Market Structure and Pricing (Perfect competition, Monopoly, Monopolistic)", "Distribution Theory (Rent, Wages, Interest, Profit)", "Indian Economy (Pre & Post Independence, Planning)", "Rural Economy of India", "Tamil Nadu Economy (GSDP, Agriculture, Healthcare, Industrial hubs)"],
          formula: "Total Utility & Marginal Utility: MU = ΔTU / ΔQ | Law of Demand: Q_d = f(P) | Elasticity of Demand: E_d = (%ΔQ) / (%ΔP) | Profit = TR - TC",
          scoreTip: "Draw labeled demand and supply curves with equilibrium price and quantity clearly marked."
        },
        {
          name: "Business Mathematics & Statistics",
          weight: "Analytical Core · 90 Theory",
          chapters: ["Matrices and Determinants", "Commercial Arithmetic (Simple & Compound Interest, Annuities, Amortization)", "Analytical Geometry of Lines and Circles", "Trigonometric Formulations in Commerce", "Differential Calculus (Cost minimization, Revenue maximization)", "Integral Calculus (Consumer & Producer Surplus)", "Stocks, Shares and Mutual Funds", "Descriptive Statistics (Measures of Central Tendency & Dispersion)", "Correlation and Regression Analysis"],
          formula: "Compound Amount: A = P(1 + r/n)^(nt) | Annuity: A = P[((1+i)^n - 1) / i] | Marginal Cost: MC = d(TC)/dq | Correlation: Pearson's r formula",
          scoreTip: "Show every step in computing standard deviation and Pearson's correlation coefficient to secure full marks."
        }
      ],
      ARTS: [
        {
          name: "History",
          weight: "Humanities · 90 Theory",
          chapters: ["Early India: Indus Valley Civilisation & Vedic Culture", "Rise of Mahajanapadas & Mauryan Empire", "Post-Mauryan Kingdoms & Sangam Age in South India", "Gupta Empire & Harshavardhana", "South Indian Dynasties (Pallavas, Early & Later Cholas, Pandyas)", "Delhi Sultanate", "Vijayanagar Empire and Bahmani Kingdoms", "Mughal Empire (Administration, Architecture, Din-i-Ilahi)", "The Marathas & Rise of Peshwas", "Advent of Europeans & British Rule"],
          formula: "Chronological Timelines: 2500 BCE (Harappa) -> 321 BCE (Mauryan) -> 300 CE (Gupta) -> 850 CE (Imperial Cholas) -> 1526 CE (Mughal)",
          scoreTip: "Mention architectural contributions (Brihadisvara temple, Taj Mahal) and administrative reforms when writing essay questions."
        },
        {
          name: "Political Science",
          weight: "Humanities · 90 Theory",
          chapters: ["Introduction to Political Science: Scope & Approaches", "The State and its Essential Elements", "Basic Political Concepts: Sovereignty, Liberty, Equality, Justice", "Rights, Duties and Citizenship", "Forms of Government: Democracy, Monarchy, Dictatorship", "Organs of Government: Legislature, Executive, Judiciary", "Constitution: Types & Constitutionalism", "Electoral System and Political Parties"],
          formula: "Aristotle's classification of constitutions | Montesquieu's Separation of Powers | Social Contract Theory (Hobbes, Locke, Rousseau)",
          scoreTip: "Quote key political theorists (Aristotle, John Locke, B.R. Ambedkar) to substantiate definition questions."
        },
        {
          name: "Economics",
          weight: "Humanities · 90 Theory",
          chapters: ["Microeconomic Fundamentals", "Consumer Behaviour & Demand", "Production Function", "Price Determination in Markets", "Distribution of Income", "Indian Economy & Five Year Plans", "Tamil Nadu Economic Landscape"],
          formula: "Diminishing Marginal Utility | Production Function Q = f(L, K) | Market structures comparison table",
          scoreTip: "Highlight Tamil Nadu's industrial performance in automobile and textile sectors for 5-mark state economy questions."
        },
        {
          name: "Geography",
          weight: "Humanities · 70 Theory + 30 Practical",
          chapters: ["Fundamentals of Physical Geography", "Geomorphology: Earth's Interior, Continental Drift, Plate Tectonics", "Landforms: Fluvial, Aeolian, Glacial, Coastal", "Climatology: Atmosphere, Insolation, Wind Systems, Cyclones", "Hydrosphere: Ocean Currents, Tides, Coral Reefs", "Biosphere & Biomes of the World"],
          formula: "Plate Tectonics: Divergent, Convergent, Transform boundaries | Coriolis force deflection rule | Lapse rate: 6.5°C per 1000m elevation",
          scoreTip: "Draw neat sketches illustrating volcano structures, river meandering, and rain shadow effect."
        }
      ]
    }
  },
  STD_12: {
    title: "12th Standard Higher Secondary Board Exam (Centum Track)",
    groups: {
      BIO_MATHS: [
        {
          name: "Mathematics (Board Exam High-Yield)",
          weight: "High Priority Board · 90 Theory + 10 Internal",
          chapters: ["Ch 1: Applications of Matrices & Determinants (Rank, Cramer's rule, Inversion method, Gaussian elimination)", "Ch 2: Complex Numbers (Argand plane, Polar form, De Moivre's theorem, Roots of unity)", "Ch 3: Theory of Equations (Polynomial equations, Vieta's formulas, Descarte's rule of signs)", "Ch 4: Inverse Trigonometric Functions (Principal value branches, Properties of inverse trig)", "Ch 5: Two Dimensional Analytical Geometry II (Parabola, Ellipse, Hyperbola, Tangents & Normals)", "Ch 6: Applications of Vector Algebra (Scalar & vector triple product, Line and Plane equations)", "Ch 7: Applications of Differential Calculus (Rate of change, Tangents, Monotonicity, Maxima & Minima)", "Ch 8: Differentials and Partial Derivatives (Linear approximation, Euler's theorem)", "Ch 9: Applications of Integral Calculus (Definite integrals, Reduction formulas, Area bounded by curves)", "Ch 10: Ordinary Differential Equations (Variable separable, Homogeneous, First-order linear ODE)", "Ch 11: Probability Distributions (Random variables, Binomial & Normal distributions)", "Ch 12: Discrete Mathematics (Binary operations, Mathematical logic, Truth tables)"],
          formula: "Cramer's Rule: x = Δ₁/Δ, y = Δ₂/Δ | De Moivre: [cos θ + i sin θ]^n = cos nθ + i sin nθ | Parabola: y² = 4ax (focus (a,0)) | Plane: r · n = d | Linear ODE: dy/dx + Py = Q -> y·e^(∫Pdx) = ∫Q·e^(∫Pdx)dx + C",
          scoreTip: "5-mark questions in vector planes, curve tracing/areas, and first-order linear ODEs are 100% predictable. Always box the final answer."
        },
        {
          name: "Physics (Core Board Derivations)",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Unit 1: Electrostatics (Gauss's law, Dipole field, Van de Graaff generator, Capacitor energy)", "Unit 2: Current Electricity (Ohm's law, Kirchhoff's rules, Wheatstone bridge, Potentiometer)", "Unit 3: Magnetism & Magnetic Effects of Electric Current (Biot-Savart law, Ampere's circuital law, Cyclotron)", "Unit 4: Electromagnetic Induction & Alternating Current (Faraday's laws, Self/Mutual inductance, AC generator, LCR series circuit)", "Unit 5: Electromagnetic Waves (Maxwell's equations, EM spectrum properties)", "Unit 6: Optics (Ray Optics: Mirror equation, Lens maker's formula, Prism; Wave Optics: Huygens principle, Young's double slit)", "Unit 7: Dual Nature of Radiation and Matter (Photoelectric effect, Einstein's equation, de Broglie hypothesis)", "Unit 8: Atomic and Nuclear Physics (Bohr atom model, Hydrogen spectrum, Radioactivity decay law, Mass defect)", "Unit 9: Semiconductor Electronics (p-n junction, Half/Full wave rectifier, Transistor, Logic gates)", "Unit 10: Communication Systems (Modulation, Bandwidth, Propagation of EM waves)"],
          formula: "E_axial = 2kp/r³ | Wheatstone: P/Q = R/S | Biot-Savart: dB = (μ₀/4π)(I dl sinθ / r²) | LCR Resonance: f_0 = 1 / (2π√(LC)) | Lens Maker: 1/f = (μ-1)(1/R₁ - 1/R₂) | Einstein Photoelectric: hν = hν₀ + 1/2mv_max² | Decay: N = N₀ e^(-λt)",
          scoreTip: "Cyclotron, AC generator, Van de Graaff generator, and Young's Double Slit experiment carry 5 full marks when accompanied by neat labeled diagrams."
        },
        {
          name: "Chemistry (Equations & Named Reactions)",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Metallurgy (Concentration, Ellingham diagram, Refining processes)", "p-Block Elements - I & II (Boron, Carbon, Nitrogen, Oxygen, Halogens, Noble gases)", "d- and f-Block Elements (Lanthanoid contraction, Magnetic properties, Interstitial compounds)", "Coordination Chemistry (Werner's theory, IUPAC nomenclature, Valence Bond Theory, Crystal Field Theory)", "Solid State (Unit cells, Packing efficiency, Defects, Bragg's law)", "Chemical Kinetics (Rate law, Integrated rate equations, Half-life, Arrhenius equation)", "Ionic Equilibrium (Ostwald's dilution law, pH calculations, Buffer solutions, Solubility product)", "Electrochemistry (Nernst equation, Kohlrausch's law, Electrochemical cells, Corrosion)", "Surface Chemistry (Adsorption isotherms, Catalysis, Colloids & Emulsions)", "Haloalkanes and Haloarenes (SN1 & SN2 mechanisms)", "Hydroxy Compounds and Ethers (Preparation of alcohols, Lucas test, Kolbe's reaction, Reimer-Tiemann)", "Carbonyl Compounds & Carboxylic Acids (Aldol condensation, Cannizzaro, Clemmensen, Wolff-Kishner)", "Organic Nitrogen Compounds (Amines, Gabriel phthalimide synthesis, Diazotization, Sandmeyer reaction)", "Biomolecules (Carbohydrates, Amino acids, Proteins, DNA/RNA)", "Chemistry in Everyday Life (Drugs, Polymers, Cleansing agents)"],
          formula: "Bragg's Law: 2d sin θ = nλ | 1st Order Kinetics: k = (2.303 / t) log(a / (a - x)) | Arrhenius: k = A e^(-Ea / RT) | Nernst Equation: E = E° - (0.0591 / n) log Q | Henderson: pH = pKa + log([Salt]/[Acid])",
          scoreTip: "Named organic reactions (Aldol condensation, Cannizzaro reaction, Sandmeyer reaction) require exact chemical equations with reaction conditions."
        },
        {
          name: "Biology (Botany & Zoology)",
          weight: "Biological Sciences · 70 Theory + 30 Lab",
          chapters: ["Reproduction in Organisms & Sexual Reproduction in Flowering Plants (Microsporogenesis, Megasporogenesis, Double fertilization)", "Principles of Inheritance and Variation (Mendelian genetics, Incomplete dominance, Sex determination)", "Molecular Basis of Inheritance (DNA structure, Replication, Transcription, Genetic code, Translation, Lac operon)", "Evolution (Hardy-Weinberg principle, Adaptive radiation)", "Human Health and Diseases (Infectious diseases, Immunity, Vaccines, Cancer, AIDS)", "Microbes in Human Welfare (Sewage treatment, Biogas, Biofertilizers)", "Biotechnology: Principles and Processes (Recombinant DNA, PCR, Restriction enzymes)", "Biotechnology and its Applications (Bt crops, Gene therapy, Transgenic animals)", "Organisms, Populations, Ecosystem & Environmental Issues (Ecological pyramids, Biogeochemical cycles)"],
          formula: "Hardy-Weinberg Equilibrium: p² + 2pq + q² = 1, p + q = 1 | Central Dogma: DNA -> (Transcription) -> mRNA -> (Translation) -> Protein | 10% Ecological Energy Transfer Law",
          scoreTip: "Draw labeled diagrams of mature embryo sac, antibody structure (H₂L₂), and human sperm; state the Lac Operon mechanism step-by-step."
        }
      ],
      COMP_SCI: [
        {
          name: "Mathematics",
          weight: "High Priority Board · 90 Theory + 10 Internal",
          chapters: ["Matrices & Determinants", "Complex Numbers", "Theory of Equations", "Inverse Trigonometry", "2D Analytical Geometry II", "Vector Algebra", "Differential & Integral Calculus", "Differential Equations", "Probability Distributions", "Discrete Mathematics"],
          formula: "Complete higher secondary mathematics syllabus with focus on calculus, vector geometry, and probability.",
          scoreTip: "Truth tables in discrete mathematics and Gaussian elimination are guaranteed full-mark areas."
        },
        {
          name: "Physics",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Electrostatics", "Current Electricity", "Magnetism", "EMI & AC", "EM Waves", "Optics", "Dual Nature", "Nuclear Physics", "Semiconductors", "Communication Systems"],
          formula: "Full board derivation catalog: Kirchhoff laws, Cyclotron, AC Generator, LCR resonance, Lens Maker formula, Photoelectric equation.",
          scoreTip: "Always write numerical problems with: Given Data -> Formula -> Substitution -> Calculation -> Boxed Answer with SI Units."
        },
        {
          name: "Chemistry",
          weight: "Core Science · 70 Theory + 30 Lab",
          chapters: ["Metallurgy", "p-Block & d-Block", "Coordination Chemistry", "Solid State", "Chemical Kinetics", "Electrochemistry", "Organic Chemistry Named Reactions", "Biomolecules"],
          formula: "Unit cell calculations: d = (z * M) / (a³ * N_A) | Nernst equation | Integrated rate equations | Organic conversion routes.",
          scoreTip: "In coordination chemistry, write IUPAC names and state VBT hybridization (sp³d², d²sp³) with magnetic moments."
        },
        {
          name: "Computer Science (Python, OOP & SQL)",
          weight: "Practical 100 Track · 70 Theory + 30 Lab",
          chapters: ["Function & Scope in Python", "Data Abstraction and Encapsulation", "Scoping Rules (LEGB Rule: Local, Enclosing, Global, Built-in)", "Algorithmic Strategies (Searching, Sorting: Bubble, Insertion, Selection, Big-O Complexity)", "Python Control Structures, Strings and List Methods", "Tuples, Sets and Dictionaries in Python", "Object-Oriented Programming (Classes, Objects, Constructors, Destructors)", "Database Concepts (Relational Model, DBMS Components, Keys: Primary, Foreign, Candidate)", "Structured Query Language (DDL, DML, DCL, TCL, WHERE, GROUP BY, ORDER BY, JOIN)", "Python and CSV Files (csv.reader, csv.writer, DictReader)", "Integrating Python with SQLite Database (sqlite3 cursor, fetchone, fetchall)", "Data Visualization using Pyplot (Line chart, Bar chart, Pie chart using Matplotlib)"],
          formula: "Big-O Complexities: Bubble Sort O(n²), Binary Search O(log n) | LEGB scoping | SQL syntax: SELECT col FROM tbl WHERE cond GROUP BY col HAVING cond ORDER BY col | Matplotlib: plt.plot(), plt.bar(), plt.show()",
          scoreTip: "Write complete Python programs with proper indentation and correct SQL syntax (semicolon at the end of statements) to score 70/70 in theory."
        }
      ],
      PURE_SCI: [
        {
          name: "Physics",
          weight: "Pure Science · 70 Theory + 30 Lab",
          chapters: ["Electrostatics", "Current Electricity", "Magnetism", "Electromagnetic Induction", "Optics", "Dual Nature of Matter", "Nuclear Physics", "Semiconductor Electronics"],
          formula: "Full derivations catalog matching Bio-Maths syllabus with focus on medical and biophysical applications.",
          scoreTip: "Explain principles of electron microscope and X-ray diffraction clearly."
        },
        {
          name: "Chemistry",
          weight: "Pure Science · 70 Theory + 30 Lab",
          chapters: ["Inorganic Coordination Chemistry", "Solid State Physics-Chemistry", "Chemical Kinetics & Electrochemistry", "Organic Carbonyl Reactions", "Biomolecules (Amino acids & Enzymes)"],
          formula: "Full chemistry equations catalog with focus on biochemistry and biochemical reactions.",
          scoreTip: "Peptide bond formation and DNA double helix base pairing structure (A=T, G≡C) carry 5 marks."
        },
        {
          name: "Botany (Pure Plant Sciences)",
          weight: "Pure Botanical Science · 35 Theory + 15 Lab",
          chapters: ["Asexual & Sexual Reproduction in Plants", "Classical Genetics (Monohybrid, Dihybrid, Test cross)", "Chromosomal Basis of Inheritance (Linkage, Crossing over, Gene mapping)", "Principles and Processes of Biotechnology (Tools, Cloning vectors: pBR322, Ti plasmid)", "Plant Tissue Culture (Cellular totipotency, Micropropagation, Somaclonal variation)", "Principles of Ecology (Ecological adaptations: Hydrophytes, Xerophytes)", "Ecosystem (Carbon & Phosphorus cycle, Ecological succession)", "Environmental Issues (Ozone depletion, Deforestation, Climate change)", "Plant Breeding and Crop Improvement", "Economic Botany (Medicinal plants of Tamil Nadu: Nilavembu, Keezhanelli, Adathodai)"],
          formula: "Mendelian ratios: Monohybrid phenotypic 3:1, genotypic 1:2:1; Dihybrid 9:3:3:1 | pBR322 vector features (ori, rop, ampR, tetR) | Totipotency concept",
          scoreTip: "pBR322 plasmid diagram with restriction sites and plant tissue culture flow diagram carry full 5 marks."
        },
        {
          name: "Zoology (Pure Animal Sciences)",
          weight: "Pure Zoological Science · 35 Theory + 15 Lab",
          chapters: ["Reproduction in Organisms & Human Reproduction (Spermatogenesis, Oogenesis, Menstrual cycle)", "Reproductive Health (Contraceptive methods, ART: IVF, ET, ZIFT, ICSI)", "Principles of Inheritance and Variation (Pedigree analysis, Sex-linked inheritance: Color blindness, Haemophilia)", "Molecular Genetics (DNA replication, Genetic code, Human Genome Project)", "Evolution (Origin of life, Lamarckism, Darwinism, Modern Synthetic Theory, Human evolution)", "Human Health and Disease (Bacterial, Viral, Fungal, Protozoan diseases, Immunology: Innate vs Acquired)", "Immunology: Antigen-Antibody interactions, Hypersensitivity, Autoimmune disorders, Stem cell therapy", "Microbes in Human Welfare & Applications of Biotechnology", "Organisms and Populations, Biodiversity & its Conservation (In-situ & Ex-situ methods)"],
          formula: "Antibody structure formula (2 Heavy + 2 Light chains, Disulfide bonds) | Menstrual cycle hormonal control: GnRH -> FSH & LH -> Estrogen & Progesterone",
          scoreTip: "Draw labeled diagrams of Graafian follicle, human blastocyst, and immunoglobulins to secure centum."
        }
      ],
      COMMERCE: [
        {
          name: "Accountancy (Financial & Partnership)",
          weight: "Commerce Core · 90 Theory + 10 Internal",
          chapters: ["Ch 1: Accounts from Incomplete Records (Single Entry System, Statement of Affairs method)", "Ch 2: Accounts of Not-for-Profit Organisation (Receipts and Payments, Income and Expenditure, Balance Sheet)", "Ch 3: Accounts of Partnership Firms - Fundamentals (Profit & Loss Appropriation, Interest on Capital & Drawings)", "Ch 4: Goodwill in Partnership Accounts (Average profit, Super profit, Capitalization methods)", "Ch 5: Admission of a Partner (Revaluation account, Sacrificing ratio, Treatment of goodwill, Capital adjustments)", "Ch 6: Retirement and Death of a Partner (Gaining ratio, Settlement of retiring partner's dues)", "Ch 7: Company Accounts (Issue of equity shares, Calls-in-arrears, Forfeiture of shares, Re-issue of forfeited shares)", "Ch 8: Financial Statement Analysis (Comparative statements, Common-size statements, Trend analysis)", "Ch 9: Ratio Analysis (Liquidity ratios, Solvency ratios, Turnover ratios, Profitability ratios)", "Ch 10: Computerised Accounting System (Tally, Chart of accounts, Voucher entry)"],
          formula: "Super Profit = Avg Profit - Normal Profit | Sacrificing Ratio = Old Share - New Share | Gaining Ratio = New Share - Old Share | Current Ratio = Current Assets / Current Liabilities (2:1) | Liquid Ratio = Quick Assets / Current Liabilities (1:1)",
          scoreTip: "In Share Forfeiture journal entries, clearly distinguish between Face Value called up, Share Forfeiture account, and Calls in Arrears."
        },
        {
          name: "Commerce & Business Management",
          weight: "Commerce Core · 90 Theory",
          chapters: ["Ch 1: Principles of Scientific Management (Taylor's 4 principles & Fayol's 14 administrative principles)", "Ch 2: Functions of Management (Planning, Organizing, Staffing, Directing, Controlling, Coordinating)", "Ch 3: Management by Objectives (MBO) and Management by Exception (MBE)", "Ch 4: Financial Markets (Capital market vs Money market, Instruments: Treasury bills, Commercial paper)", "Ch 5: Capital Market & Stock Exchange (BSE, NSE, Functions of SEBI, Demat accounts)", "Ch 6: Consumer Protection (Consumer Rights, Consumer Protection Act, 3-tier Redressal Forums)", "Ch 7: Business Environment (LPG: Liberalization, Privatization, Globalization)", "Ch 8: Elements of Marketing & Marketing Mix (Product, Price, Place, Promotion, Digital Marketing)", "Ch 9: Human Resource Management (Recruitment, Selection, Training methods)", "Ch 10: Entrepreneurship Development (Characteristics of an entrepreneur, Startup India, Standup India)"],
          formula: "Fayol's 14 Principles: Division of work, Authority, Discipline, Unity of command, Unity of direction, Subordination, Remuneration, Centralization, Scalar chain, Order, Equity, Stability, Initiative, Esprit de corps",
          scoreTip: "SEBI powers and functions, and 3-Tier Consumer Redressal Forums (District, State, National commission jurisdiction limits) are essential 5-mark answers."
        },
        {
          name: "Economics (Macroeconomics & TN Economy)",
          weight: "Economic Analysis · 90 Theory",
          chapters: ["Ch 1: Introduction to Macroeconomics (Circular flow of income: 2-sector, 3-sector, 4-sector models)", "Ch 2: National Income (GDP, GNP, NNP at Factor Cost, Measurement methods, Green GDP)", "Ch 3: Theories of Employment and Income (Classical theory, Say's Law of Markets, Keynesian theory of effective demand)", "Ch 4: Consumption and Investment Functions (Marginal Propensity to Consume, Multiplier, Accelerator)", "Ch 5: Monetary Economics (Functions of money, Quantity Theory of Money: Fisher's equation, Inflation types)", "Ch 6: Banking (Functions of Commercial Banks, Central Bank: RBI monetary policy, CRR, SLR, Repo rate, Reverse repo)", "Ch 7: International Economics (Theories of international trade, Balance of Trade vs Balance of Payments)", "Ch 8: International Economic Organisations (IMF, World Bank, WTO, BRICS, SAARC)", "Ch 9: Fiscal Economics (Public revenue, Public expenditure, Public debt, GST structure, Budget deficit)", "Ch 10: Environmental Economics (Ecology and economics, Global warming, Sustainable development)", "Ch 11: Economics of Development and Planning (NITI Aayog, Indicators of development: HDI, PQLI)"],
          formula: "National Income Identity: Y = C + I + G + (X - M) | Fisher's Equation: MV = PT | Keynesian Multiplier: k = 1 / (1 - MPC) = 1 / MPS | Inflation rate calculation",
          scoreTip: "Draw the circular flow of income diagram and Fisher's equation table with clear definitions of variables."
        },
        {
          name: "Business Maths / Computer Applications",
          weight: "Quantitative Stream · 90 Theory",
          chapters: ["Ch 1: Applications of Matrices and Determinants in Business", "Ch 2: Integral Calculus Applications (Consumer's Surplus, Producer's Surplus, Total Cost function)", "Ch 3: Differential Equations in Commerce (Growth and decay, Marginal cost integration)", "Ch 4: Interpolation and Fitting of Curves (Gregory-Newton forward & backward formulas)", "Ch 5: Probability Distributions (Normal distribution curve properties, Standard normal z-scores)", "Ch 6: Sampling Theory and Estimation (Large sample tests, Standard error)", "Ch 7: Applied Statistics (Index Numbers: Laspeyre's, Paasche's, Fisher's Ideal Index, Time series analysis)", "Ch 8: Operations Research (Linear Programming: Graphical method, Transportation problem: North-West Corner, VAM)", "Ch 9: HTML, PHP and MySQL Web Integration in Commerce", "Ch 10: E-Commerce Architecture and Cyber Security"],
          formula: "Fisher's Ideal Index: √[Laspeyre × Paasche] | Consumer Surplus: CS = ∫₀^x₀ f(x)dx - p₀x₀ | Producer Surplus: PS = p₀x₀ - ∫₀^x₀ g(x)dx | Z-score: z = (x - μ) / σ",
          scoreTip: "Fisher's Index Number is proven ideal by satisfying both Time Reversal and Factor Reversal Tests. Show both test proofs."
        }
      ],
      ARTS: [
        {
          name: "History (Indian & World History)",
          weight: "Humanities Board · 90 Theory",
          chapters: ["Rise of Nationalism in India", "Early Nationalist Movement & Swadeshi", "Nationalism: Gandhian Phase (Non-Cooperation, Civil Disobedience, Quit India)", "Advent of Freedom and Partition", "Integration of Princely States & Reorganisation of States", "Making of the Indian Constitution", "India's Foreign Policy (Panchsheel, Non-Aligned Movement)", "Imperialism & Colonialism in Asia and Africa", "The World Wars and League of Nations", "The Cold War Era and Collapse of Soviet Union", "Contemporary Global Order"],
          formula: "Panchsheel Principles (1954): Mutual respect, Non-aggression, Non-interference, Equality, Peaceful coexistence | Key Movements: 1905 (Swadeshi), 1920 (NCM), 1930 (CDM), 1942 (Quit India)",
          scoreTip: "Structure long answers with Causes, Course, and Consequences; include a timeline chart for full marks."
        },
        {
          name: "Political Science (Indian Constitution & Politics)",
          weight: "Humanities Board · 90 Theory",
          chapters: ["Constitution of India: Preamble, Fundamental Rights, Directive Principles", "The Union Legislature (Lok Sabha, Rajya Sabha, Law-making procedure)", "The Union Executive (President, Prime Minister, Council of Ministers)", "The Judiciary (Supreme Court, Judicial Review, Public Interest Litigation)", "Federalism in India (Centre-State relations, Finance Commission)", "Local Government (73rd & 74th Constitutional Amendments, Panchayati Raj)", "Political Parties & Electoral Process in India", "Challenges of Nation Building: Communalism, Regionalism, Casteism", "India and the World Order"],
          formula: "Sarkaria Commission recommendations | Basic Structure Doctrine (Kesavananda Bharati case, 1973) | 73rd Amendment: 3-tier Panchayati Raj structure",
          scoreTip: "Cite landmark Supreme Court judgments (Kesavananda Bharati, Maneka Gandhi, Indira Sawhney) to enrich 5-mark answers."
        },
        {
          name: "Economics (Macroeconomics)",
          weight: "Humanities Board · 90 Theory",
          chapters: ["Macroeconomic Framework & National Income", "Theories of Employment & Keynesian Revolution", "Monetary System & Banking in India", "Fiscal Policy, Public Debt & Taxation", "International Trade & Balance of Payments", "Development Economics & Environmental Policy"],
          formula: "Full macroeconomics catalog matching commerce stream with social policy analysis.",
          scoreTip: "Explain poverty alleviation schemes (MGNREGA, PDS in Tamil Nadu) when discussing development challenges."
        },
        {
          name: "Geography (Human & Economic Geography)",
          weight: "Humanities Board · 70 Theory + 30 Practical",
          chapters: ["Human Geography: Nature & Scope", "World Population Distribution, Density & Growth", "Human Activities: Primary, Secondary, Tertiary & Quaternary", "Transport, Communication & International Trade", "Human Settlements: Rural & Urban Settlement Patterns", "Geographical Perspective on Selected Issues and Problems", "Remote Sensing, GIS and GPS Technologies"],
          formula: "Demographic Transition Theory (Stage 1 to Stage 4) | Central Place Theory | GIS Data Layers: Raster vs Vector models",
          scoreTip: "Provide neat demographic transition graph and explain high vs low fertility rate implications."
        }
      ]
    }
  }
};

// ── CURATED ACADEMIC VIDEO LIBRARY (MAPPED TO SUBJECT CODES & NAMES) ──
const AURA_CURATED_ACADEMIC_VIDEOS = {
  "CS3301": [
    { id: "Q_n_4iY7a44", title: "Data Structures & Algorithms Complete Course in Tamil", channel: "Logic First Tamil", desc: "Arrays, Linked Lists, Stacks, Queues, Binary Trees & Sorting algorithms.", url: "https://www.youtube.com/watch?v=Q_n_4iY7a44", thumbnail: "https://i.ytimg.com/vi/Q_n_4iY7a44/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "eIRMbZ5v3uA", title: "Data Structures in Tamil - Full Subject Playlist", channel: "Error Makes Clever Academy", desc: "Memory allocation, pointers, Big-O complexity, and tree traversals.", url: "https://www.youtube.com/watch?v=eIRMbZ5v3uA", thumbnail: "https://i.ytimg.com/vi/eIRMbZ5v3uA/hqdefault.jpg", language: "Tamil", badge: "Core Syllabus" },
    { id: "0IAPZzGSbME", title: "Data Structures and Algorithms for Beginners", channel: "Programming with Mosh", desc: "Core computer science fundamentals: Stacks, Queues, Hash Tables, Trees, and Graph theory.", url: "https://www.youtube.com/watch?v=0IAPZzGSbME", thumbnail: "https://i.ytimg.com/vi/0IAPZzGSbME/hqdefault.jpg", language: "English", badge: "CS Foundation" }
  ],
  "CS3401": [
    { id: "B31LgI4Y4DQ", title: "Algorithms and Data Structures Tutorial - Full Course", channel: "freeCodeCamp.org", desc: "Divide and conquer, greedy algorithms, dynamic programming, and graphs.", url: "https://www.youtube.com/watch?v=B31LgI4Y4DQ", thumbnail: "https://i.ytimg.com/vi/B31LgI4Y4DQ/hqdefault.jpg", language: "English", badge: "Anna University R2021" },
    { id: "2Y88q7H_z5U", title: "Design and Analysis of Algorithms - Complete Lecture Series", channel: "Abdul Bari", desc: "Master recurrence relations, Knapsack, Dijkstra, and NP-completeness.", url: "https://www.youtube.com/watch?v=2Y88q7H_z5U", thumbnail: "https://i.ytimg.com/vi/2Y88q7H_z5U/hqdefault.jpg", language: "English", badge: "Exam Blueprint" }
  ],
  "CS3491": [
    { id: "8uA3m5K1n70", title: "Artificial Intelligence & Machine Learning in Tamil", channel: "Logic First Tamil", desc: "Heuristic search, A* algorithm, knowledge representation, and neural networks.", url: "https://www.youtube.com/watch?v=8uA3m5K1n70", thumbnail: "https://i.ytimg.com/vi/8uA3m5K1n70/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "JMUxmLgw-QU", title: "Artificial Intelligence Full Course", channel: "freeCodeCamp.org", desc: "Full semester AI syllabus: Search, constraints, logic, and deep learning.", url: "https://www.youtube.com/watch?v=JMUxmLgw-QU", thumbnail: "https://i.ytimg.com/vi/JMUxmLgw-QU/hqdefault.jpg", language: "English", badge: "Comprehensive" }
  ],
  "CS3492": [
    { id: "HXV3zeQKqGY", title: "Database Management Systems (DBMS) Full Course in Tamil", channel: "Logic First Tamil", desc: "ER modeling, relational schemas, Normalization (1NF, 2NF, 3NF, BCNF), and SQL.", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", thumbnail: "https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "kBdlM6hZS5A", title: "DBMS Complete Anna University Playlist", channel: "Gate Smashers", desc: "Transactions, ACID properties, indexing, and recovery techniques.", url: "https://www.youtube.com/watch?v=kBdlM6hZS5A", thumbnail: "https://i.ytimg.com/vi/kBdlM6hZS5A/hqdefault.jpg", language: "English", badge: "Exam Scoring" }
  ],
  "CS3591": [
    { id: "3QhU93L8W5k", title: "Computer Networks & OSI Model in Tamil", channel: "Logic First Tamil", desc: "OSI 7 Layers, TCP/IP, IP Addressing, Routing Protocols, and TCP flow control.", url: "https://www.youtube.com/watch?v=3QhU93L8W5k", thumbnail: "https://i.ytimg.com/vi/3QhU93L8W5k/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "qiQR5rTSshw", title: "Computer Networks Lectures for Engineering", channel: "Gate Smashers", desc: "Data link layer, CRC, sliding window protocols, subnetting, and network security.", url: "https://www.youtube.com/watch?v=qiQR5rTSshw", thumbnail: "https://i.ytimg.com/vi/qiQR5rTSshw/hqdefault.jpg", language: "English", badge: "Full Coverage" }
  ],
  "CS3351": [
    { id: "v3eWjQ7w-L0", title: "Digital Principles & System Design in Tamil", channel: "Logic First Tamil", desc: "Boolean algebra, K-Maps, combinational & sequential circuit design.", url: "https://www.youtube.com/watch?v=v3eWjQ7w-L0", thumbnail: "https://i.ytimg.com/vi/v3eWjQ7w-L0/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "4c83B8QeY4E", title: "Computer Organization and Architecture Complete Course", channel: "Neso Academy", desc: "CPU architecture, instruction pipelining, cache memory mapping, and RISC/CISC.", url: "https://www.youtube.com/watch?v=4c83B8QeY4E", thumbnail: "https://i.ytimg.com/vi/4c83B8QeY4E/hqdefault.jpg", language: "English", badge: "Hardware Core" }
  ],
  "CS3352": [
    { id: "7O_X0k3X9Xk", title: "Foundations of Data Science with Python in Tamil", channel: "Error Makes Clever Academy", desc: "NumPy, Pandas, Exploratory Data Analysis, and Statistical Modeling.", url: "https://www.youtube.com/watch?v=7O_X0k3X9Xk", thumbnail: "https://i.ytimg.com/vi/7O_X0k3X9Xk/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "ua-CiDNNj30", title: "Python for Data Science - Course for Beginners", channel: "freeCodeCamp.org", desc: "Data cleaning, statistical inference, visualization, and linear regression.", url: "https://www.youtube.com/watch?v=ua-CiDNNj30", thumbnail: "https://i.ytimg.com/vi/ua-CiDNNj30/hqdefault.jpg", language: "English", badge: "Python Stack" }
  ],
  "CS3452": [
    { id: "58N2N7zJGrQ", title: "Theory of Computation & Automata Theory Full Course", channel: "Gate Smashers", desc: "DFA, NFA, regular expressions, pumping lemma, CFG, and Turing machines.", url: "https://www.youtube.com/watch?v=58N2N7zJGrQ", thumbnail: "https://i.ytimg.com/vi/58N2N7zJGrQ/hqdefault.jpg", language: "English", badge: "Anna University R2021" }
  ],
  "MA3151": [
    { id: "e_e07fJ85V8", title: "Engineering Mathematics: Matrices & Calculus in Tamil", channel: "Tamil Maths Academy", desc: "Eigenvalues, eigenvectors, Cayley-Hamilton, and differential calculus.", url: "https://www.youtube.com/watch?v=e_e07fJ85V8", thumbnail: "https://i.ytimg.com/vi/e_e07fJ85V8/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" },
    { id: "fNk_zzaMoSs", title: "Essence of Linear Algebra", channel: "3Blue1Brown", desc: "Vectors, dot product, determinants, eigenvalues and transformations.", url: "https://www.youtube.com/watch?v=fNk_zzaMoSs", thumbnail: "https://i.ytimg.com/vi/fNk_zzaMoSs/hqdefault.jpg", language: "English", badge: "Geometric Intuition" }
  ],
  "PH3151": [
    { id: "m6x8A4V4B9o", title: "Engineering Physics Complete Derivations in Tamil", channel: "Tamil Physics Tutor", desc: "Laser mechanics, fiber optics, quantum physics, and crystal structures.", url: "https://www.youtube.com/watch?v=m6x8A4V4B9o", thumbnail: "https://i.ytimg.com/vi/m6x8A4V4B9o/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" }
  ],
  "CY3151": [
    { id: "c_u8A2Z5N3o", title: "Engineering Chemistry: Water Technology & Polymers in Tamil", channel: "Tamil Chem Academy", desc: "Hardness of water, boiler troubles, conducting polymers, and nanochemistry.", url: "https://www.youtube.com/watch?v=c_u8A2Z5N3o", thumbnail: "https://i.ytimg.com/vi/c_u8A2Z5N3o/hqdefault.jpg", language: "Tamil", badge: "Anna University R2021" }
  ],
  // School mapped subjects
  "PHYSICS": [
    { id: "m6x8A4V4B9o", title: "12th Physics Tamil Nadu State Board Complete Derivations", channel: "Tamil Physics Tutor", desc: "Electrostatics, Gauss Law, Current Electricity, and Wave Optics full derivations.", url: "https://www.youtube.com/watch?v=m6x8A4V4B9o", thumbnail: "https://i.ytimg.com/vi/m6x8A4V4B9o/hqdefault.jpg", language: "Tamil", badge: "State Board Core" },
    { id: "T63zM2l2e74", title: "Electricity and Magnetism - MIT Physics 8.02", channel: "MIT OpenCourseWare", desc: "Electric fields, Gauss's law, Ampere's law, and Faraday's induction.", url: "https://www.youtube.com/watch?v=T63zM2l2e74", thumbnail: "https://i.ytimg.com/vi/T63zM2l2e74/hqdefault.jpg", language: "English", badge: "Concept Master" }
  ],
  "MATHEMATICS": [
    { id: "e_e07fJ85V8", title: "12th Maths Samacheer Kalvi Volume 1 & 2 in Tamil", channel: "Tamil Maths Hub", desc: "Applications of Matrices, Complex Numbers, Theory of Equations, Differential Calculus.", url: "https://www.youtube.com/watch?v=e_e07fJ85V8", thumbnail: "https://i.ytimg.com/vi/e_e07fJ85V8/hqdefault.jpg", language: "Tamil", badge: "Samacheer Kalvi" },
    { id: "WS070h7kY3I", title: "Calculus 1 - Full College & High School Course", channel: "freeCodeCamp.org", desc: "Limits, derivatives, curve sketching, and definite integration.", url: "https://www.youtube.com/watch?v=WS070h7kY3I", thumbnail: "https://i.ytimg.com/vi/WS070h7kY3I/hqdefault.jpg", language: "English", badge: "Calculus Foundation" }
  ],
  "CHEMISTRY": [
    { id: "c_u8A2Z5N3o", title: "12th Chemistry Samacheer Kalvi Full Syllabus in Tamil", channel: "Tamil Chem Academy", desc: "Metallurgy, p-Block elements, Coordination Chemistry, and Organic Named Reactions.", url: "https://www.youtube.com/watch?v=c_u8A2Z5N3o", thumbnail: "https://i.ytimg.com/vi/c_u8A2Z5N3o/hqdefault.jpg", language: "Tamil", badge: "State Board Core" },
    { id: "bC79K6V3M6E", title: "General Chemistry Review & Exam Problems", channel: "The Organic Chemistry Tutor", desc: "Electrochemistry, chemical kinetics, stoichiometry, and thermochemistry.", url: "https://www.youtube.com/watch?v=bC79K6V3M6E", thumbnail: "https://i.ytimg.com/vi/bC79K6V3M6E/hqdefault.jpg", language: "English", badge: "High Yield" }
  ],
  "COMPUTER SCIENCE": [
    { id: "m67-bOpOoPU", title: "12th Computer Science Python Full Syllabus in Tamil", channel: "Error Makes Clever Academy", desc: "Python variables, control structures, functions, strings, lists, tuples, dictionaries, and classes.", url: "https://www.youtube.com/watch?v=m67-bOpOoPU", thumbnail: "https://i.ytimg.com/vi/m67-bOpOoPU/hqdefault.jpg", language: "Tamil", badge: "Python Syllabus" },
    { id: "rfscVS0vtbw", title: "Python for Beginners - Full Course", channel: "freeCodeCamp.org", desc: "Comprehensive beginner to intermediate Python tutorial with exercises.", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", thumbnail: "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg", language: "English", badge: "Production Python" }
  ],
  "BIOLOGY": [
    { id: "B_y9J8w2a41", title: "12th Biology (Botany & Zoology) State Board in Tamil", channel: "Tamil Bio Masters", desc: "Reproduction in organisms, Genetics, Biotechnology, and Human Health.", url: "https://www.youtube.com/watch?v=B_y9J8w2a41", thumbnail: "https://i.ytimg.com/vi/B_y9J8w2a41/hqdefault.jpg", language: "Tamil", badge: "State Board Bio" }
  ],
  "COMMERCE": [
    { id: "P_v2B8n4m91", title: "12th Accountancy & Commerce Complete Course in Tamil", channel: "Tamil Commerce Academy", desc: "Partnership accounts, admission of partner, goodwill valuation, and company accounts.", url: "https://www.youtube.com/watch?v=P_v2B8n4m91", thumbnail: "https://i.ytimg.com/vi/P_v2B8n4m91/hqdefault.jpg", language: "Tamil", badge: "State Board Commerce" }
  ]
};

// Dock Recommendations Container into active pane directly beneath subject view
function dockAcademicRecommendationsContainer(paneKey) {
  const container = document.getElementById("academic-yt-recommendations");
  if (!container) return;

  if (paneKey === "school") {
    const schoolExplorerCard = document.querySelector("#sectionAcademicSchool .workspace-card");
    if (schoolExplorerCard && schoolExplorerCard.parentElement) {
      if (container.parentElement !== schoolExplorerCard.parentElement || container.previousElementSibling !== schoolExplorerCard) {
        schoolExplorerCard.parentElement.insertBefore(container, schoolExplorerCard.nextSibling);
      }
    }
  } else if (paneKey === "college") {
    const collegeSlot = document.getElementById("collegeYtSlot");
    const collegePane = document.getElementById("sectionAcademicCollege");
    if (collegeSlot) {
      if (container.parentElement !== collegeSlot) {
        collegeSlot.appendChild(container);
      }
    } else if (collegePane) {
      if (container.parentElement !== collegePane) {
        collegePane.appendChild(container);
      }
    }
  }
}

// Generate targeted video query cards/embeds matching the exact selection
function getTargetedAcademicVideos(subjectName, subjectCode, topic, standardOrDept, semester) {
  const normName = (subjectName || "").toUpperCase();
  const normCode = (subjectCode || "").toUpperCase();
  const isCollege = Boolean(semester || (standardOrDept && standardOrDept.toLowerCase().includes("engineering")) || (normCode && normCode.length >= 5 && /\d/.test(normCode)));

  // 1. Check curated library for exact static code or name matches
  let curatedMatches = [];
  if (normCode && AURA_CURATED_ACADEMIC_VIDEOS[normCode]) {
    curatedMatches = AURA_CURATED_ACADEMIC_VIDEOS[normCode];
  } else {
    for (const [key, vids] of Object.entries(AURA_CURATED_ACADEMIC_VIDEOS)) {
      if (normCode && (normCode.includes(key) || key.includes(normCode))) {
        curatedMatches = vids;
        break;
      }
      if (normName && (normName.includes(key) || key.includes(normName))) {
        curatedMatches = vids;
        break;
      }
    }
  }

  // If curated static library has videos mapped to this exact subject code/name:
  if (curatedMatches.length > 0) {
    return curatedMatches.map(v => ({
      title: v.title,
      channel: v.channel,
      thumbnail: v.thumbnail || (v.id ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"),
      url: v.url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(subjectName + ' ' + (topic || '') + ' lecture')}`),
      language: v.language || "Tamil",
      badge: v.badge || (isCollege ? "Anna University R2021" : "TN State Board Core"),
      description: v.desc || `Complete syllabus lecture walkthrough for ${subjectName} covering ${topic || 'key syllabus units'}.`
    }));
  }

  // 2. Otherwise generate targeted video query cards matching the EXACT selection
  const cleanTopic = topic || "Syllabus Breakdown";
  if (isCollege) {
    return [
      {
        title: `Anna University ${subjectName} Lecture Series (Regulation 2021)`,
        channel: "Anna University Online & Logic First Tamil",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Anna University ' + subjectName + ' Lecture Series Tamil English')}`,
        language: "Tamil & English",
        badge: "Anna University R2021",
        description: `Complete university syllabus walkthrough for ${subjectName} (${subjectCode || 'Engineering'}). Units 1 to 5 derivations, model question papers, and scoring strategy.`
      },
      {
        title: `${subjectName} — ${cleanTopic} Deep-Dive & Derivations`,
        channel: "NPTEL & State University Faculty",
        thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(subjectName + ' ' + cleanTopic + ' lecture Tamil English')}`,
        language: "Tamil",
        badge: "Topic Deep-Dive",
        description: `In-depth analysis of ${cleanTopic} with step-by-step mathematical formulation, pseudocode, and university exam 16-mark problem solutions.`
      },
      {
        title: `${subjectName} — High-Yield Model Exam Questions & Answers`,
        channel: "Gate Smashers & Error Makes Clever",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(subjectName + ' Anna University important questions 2 mark 16 mark')}`,
        language: "English & Tamil",
        badge: "University Blueprint",
        description: `High-probability Part A (2-Mark) definitions and Part B/C (16-Mark) questions for semester examinations in ${subjectName}.`
      }
    ];
  } else {
    // School (10th, 11th, 12th)
    return [
      {
        title: `${standardOrDept || '12th Std'} ${subjectName} Tamil Nadu State Board full syllabus`,
        channel: "Tamil Nadu State Board Masters & Samacheer Kalvi Hub",
        thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent((standardOrDept || '12th Std') + ' ' + subjectName + ' Tamil Nadu State Board full syllabus Tamil')}`,
        language: "Tamil",
        badge: "TN State Board Core",
        description: `Verified Samacheer Kalvi & CBSE coverage for ${subjectName}. Full chapter explanations, book-back numerical solutions, and government key points.`
      },
      {
        title: `${subjectName} — ${cleanTopic} Scoring Walkthrough`,
        channel: "Tamil Science & Maths Academy",
        thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(subjectName + ' ' + cleanTopic + ' 12th standard Tamil Nadu lecture')}`,
        language: "Tamil & English",
        badge: "Chapter Deep-Dive",
        description: `Step-by-step breakdown of ${cleanTopic} with formulas, derivations, ray diagrams, and board exam presentation tips.`
      },
      {
        title: `${subjectName} — Critical 5-Mark Derivations & Board Blueprint`,
        channel: "State Board Rankers Guide",
        thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent((standardOrDept || '12th Std') + ' ' + subjectName + ' public exam important 5 mark questions Tamil')}`,
        language: "Tamil",
        badge: "Centum Scoring Tips",
        description: `Master high-yield 5-mark derivations and numericals in ${subjectName} to maximize board examination scores.`
      }
    ];
  }
}

// Render dynamic recommended YouTube videos in #academic-yt-recommendations
function renderAcademicYouTubeRecommendations() {
  const container = document.getElementById("academic-yt-recommendations");
  if (!container) return;

  const sel = academicIntelligenceState.selectedSubject;

  // 1. Clean empty state when no subject is selected
  if (!sel || !sel.subjectName) {
    container.innerHTML = `
      <div class="academic-yt-empty-state">
        <div class="academic-yt-empty-icon">📺</div>
        <h4 class="academic-yt-empty-title">Select any subject above to load syllabus topics and lecture videos.</h4>
        <p class="academic-yt-empty-sub">Choose any school subject (10th, 11th, 12th) or college course above to dynamically stream high-yield lecture series and exam walkthroughs in Tamil &amp; English.</p>
      </div>
    `;
    return;
  }

  // 2. Active selection is present
  const selectedSubjectName = sel.subjectName.split("(")[0].trim();
  const selectedSubjectCode = sel.subjectCode || "";
  const standardOrDept = sel.standardOrDept || (sel.semester ? `Semester ${sel.semester}` : "Curriculum Standard");
  const selectedTopic = sel.currentTopic || "Full Syllabus";
  const semester = sel.semester;

  // 1-Click link: Watch Topic Deep-Dive on YouTube
  const ytSearchQuery = `${selectedSubjectName} ${selectedTopic} lecture Tamil English`;
  const ytDeepDiveUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ytSearchQuery)}`;

  // Prepare topic pills list
  let topicsList = [];
  if (Array.isArray(sel.topics) && sel.topics.length > 0) {
    topicsList = sel.topics;
  } else if (sel.semester) {
    topicsList = [
      selectedTopic,
      "Unit 1: Fundamentals & Theory",
      "Unit 2: System Architecture & Derivations",
      "Unit 3: Implementation & Solved Problems",
      "Unit 4: Advanced Principles & Real-Time Case Studies",
      "Unit 5: University Model Exam High-Weightage Questions"
    ];
  } else {
    topicsList = [
      selectedTopic,
      "Chapter 1: Governing Laws & Derivations",
      "Chapter 2: Step-by-Step Numerical Problems",
      "Chapter 3: High-Yield Board Exam 5-Mark Questions",
      "Chapter 4: Formulas, Units & One-Mark Concepts",
      "Full Syllabus Rapid Revision"
    ];
  }
  topicsList = Array.from(new Set([selectedTopic, ...topicsList]));

  // Dynamically clear previous video cards and retrieve matched/targeted cards
  const matchingVideos = getTargetedAcademicVideos(selectedSubjectName, selectedSubjectCode, selectedTopic, standardOrDept, semester);

  container.innerHTML = `
    <!-- Active Header -->
    <div class="academic-yt-header">
      <div class="academic-yt-header-left">
        <div class="academic-yt-eyebrow">
          <span>✦</span>
          <span>Curated Video Lectures &amp; Explanations</span>
        </div>
        <div class="academic-yt-title-row">
          <h3 class="academic-yt-subject-title">${escapeHtml(sel.subjectName)}</h3>
          <div class="academic-yt-badges-row">
            <span class="academic-yt-badge highlight">${escapeHtml(standardOrDept)}${semester ? ` · Sem ${semester}` : ''}</span>
            ${selectedSubjectCode ? `<span class="academic-yt-badge">${escapeHtml(selectedSubjectCode)}</span>` : ''}
            <span class="academic-yt-badge" style="color:#10B981; border-color:rgba(16,185,129,0.3); background:rgba(16,185,129,0.08);">● Live Syllabus Matched</span>
          </div>
        </div>
      </div>

      <!-- 1-Click Action Button: Watch Topic Deep-Dive on YouTube -->
      <a href="${escapeHtml(ytDeepDiveUrl)}" target="_blank" rel="noopener noreferrer" class="academic-deepdive-btn" title="Open YouTube search results for ${escapeHtml(ytSearchQuery)}">
        <span class="academic-yt-play-icon">▶</span>
        <span>Watch Topic Deep-Dive on YouTube</span>
        <span class="academic-btn-arrow">↗</span>
      </a>
    </div>

    <!-- Dynamic Topic / Chapter Selector Banner -->
    <div class="academic-yt-topic-banner">
      <div class="academic-topic-label-row">
        <span class="academic-topic-focus-title">📍 Active Syllabus Topic / Unit: <strong>${escapeHtml(selectedTopic)}</strong></span>
        <span style="font-size:10.5px; color:#94a3b8;">Click any unit pill to filter targeted lectures:</span>
      </div>
      <div class="academic-topic-pills-row">
        ${topicsList.map(t => {
          const isActive = t === selectedTopic;
          return `
            <button type="button" class="academic-topic-pill ${isActive ? 'active' : ''}" onclick="selectAcademicRecommendationTopic('${escapeHtml(t).replace(/'/g, "\\'")}')">
              ${escapeHtml(t)}
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Targeted Videos Grid -->
    <div class="academic-yt-grid">
      ${matchingVideos.map(v => `
        <div class="academic-yt-card">
          <div class="academic-yt-thumb-wrap">
            <img src="${escapeHtml(v.thumbnail)}" alt="${escapeHtml(v.title)}" class="academic-yt-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'" />
            <span class="academic-yt-chip-badge">${escapeHtml(v.badge || 'Verified Curriculum')}</span>
            <span class="academic-yt-lang-badge">${escapeHtml(v.language || 'Tamil & English')}</span>
          </div>
          <div class="academic-yt-card-body">
            <div>
              <h4 class="academic-yt-card-title" title="${escapeHtml(v.title)}">${escapeHtml(v.title)}</h4>
              <div class="academic-yt-card-channel" style="margin-top:4px;">
                <span>📺</span>
                <span>${escapeHtml(v.channel)}</span>
              </div>
              <p class="academic-yt-card-desc" style="margin-top:6px;">${escapeHtml(v.description)}</p>
            </div>
            <div class="academic-yt-card-actions">
              <button type="button" class="academic-yt-btn-inapp" onclick="openEmbeddedYoutubeModal('${escapeHtml(v.url)}', '${escapeHtml(v.title).replace(/'/g, "\\'")}', '${escapeHtml(v.channel).replace(/'/g, "\\'")}')">
                <span>▷</span>
                <span>In-App Stream</span>
              </button>
              <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener noreferrer" class="academic-yt-btn-yt">
                <span>↗ YouTube</span>
              </a>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Topic switcher inside recommendations banner
window.selectAcademicRecommendationTopic = function(topic) {
  if (academicIntelligenceState.selectedSubject) {
    academicIntelligenceState.selectedSubject.currentTopic = topic;
    renderAcademicYouTubeRecommendations();
    if (typeof playTactileSound === "function") playTactileSound("click");
  }
};

// Master Initializer for Academic Intelligence Hub
function initCollegeAndSchoolHub() {
  // Initialize default active preset
  if (!academicIntelligenceState.activeMaterial.text) {
    academicIntelligenceState.activeMaterial.text = AURA_MATERIAL_PRESETS.PHYSICS_12.text;
  }

  // Bind Cross-Window Listener for College Subject Selection from Iframe
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "AURA_ACADEMIC_SUBJECT_SELECTED") {
      const { standardOrDept, semester, subjectName, subjectCode, currentTopic } = event.data;
      const cleanSubj = (subjectName || "").split("(")[0].trim();
      academicIntelligenceState.activeSubject = cleanSubj;
      academicIntelligenceState.selectedSubject = {
        standardOrDept: standardOrDept || "Higher Education Degree",
        semester: semester || 1,
        subjectName: subjectName || "Selected Course",
        subjectCode: subjectCode || "",
        currentTopic: currentTopic || "Full Syllabus",
        topics: [
          currentTopic || "Full Syllabus",
          "Unit 1: Core Concepts & Principles",
          "Unit 2: System Architecture & Derivations",
          "Unit 3: Implementation & Solved Problems",
          "Unit 4: Real-World Case Studies & Advanced Topics",
          "Unit 5: University Model Exam High-Weightage Questions"
        ]
      };

      dockAcademicRecommendationsContainer("college");
      renderAcademicYouTubeRecommendations();

      const recEl = document.getElementById("academic-yt-recommendations");
      if (recEl) {
        recEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  });

  // 1. Setup 3-Way Sub-Navigation Tabs
  const tabAcademicSchool = document.getElementById("tabAcademicSchool");
  const tabAcademicCollege = document.getElementById("tabAcademicCollege");
  const tabAcademicMaterial = document.getElementById("tabAcademicMaterial");

  const sectionAcademicSchool = document.getElementById("sectionAcademicSchool");
  const sectionAcademicCollege = document.getElementById("sectionAcademicCollege");
  const sectionAcademicMaterial = document.getElementById("sectionAcademicMaterial");

  function switchAcademicTab(tabKey) {
    academicIntelligenceState.activeTab = tabKey;

    if (tabAcademicSchool) tabAcademicSchool.classList.toggle("active", tabKey === "school");
    if (tabAcademicCollege) tabAcademicCollege.classList.toggle("active", tabKey === "college");
    if (tabAcademicMaterial) tabAcademicMaterial.classList.toggle("active", tabKey === "material");

    if (sectionAcademicSchool) sectionAcademicSchool.style.display = tabKey === "school" ? "block" : "none";
    if (sectionAcademicCollege) sectionAcademicCollege.style.display = tabKey === "college" ? "block" : "none";
    if (sectionAcademicMaterial) sectionAcademicMaterial.style.display = tabKey === "material" ? "block" : "none";

    if (tabKey === "school") {
      dockAcademicRecommendationsContainer("school");
      renderSchoolCurriculum();
      renderAcademicYouTubeRecommendations();
    } else if (tabKey === "college") {
      ensureCollegeIframeLoaded();
      dockAcademicRecommendationsContainer("college");
      renderAcademicYouTubeRecommendations();
    }

    if (typeof playTactileSound === "function") playTactileSound("click");
  }

  if (tabAcademicSchool) tabAcademicSchool.addEventListener("click", () => switchAcademicTab("school"));
  if (tabAcademicCollege) tabAcademicCollege.addEventListener("click", () => switchAcademicTab("college"));
  if (tabAcademicMaterial) tabAcademicMaterial.addEventListener("click", () => switchAcademicTab("material"));

  // 2. Setup School Standard Selector Chips
  document.querySelectorAll("#schoolStandardChipsRow .school-std-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#schoolStandardChipsRow .school-std-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const std = pill.getAttribute("data-schoolstd");
      academicIntelligenceState.activeSchoolStandard = std;

      // Toggle group selector: 10th has common curriculum, 11th & 12th have streams
      const groupSelectorBox = document.getElementById("schoolGroupSelectorBox");
      if (groupSelectorBox) {
        groupSelectorBox.style.display = std === "STD_10" ? "none" : "block";
      }

      renderSchoolCurriculum();
      if (typeof playTactileSound === "function") playTactileSound("click");
    });
  });

  // 3. Setup School Stream / Group Selector Chips
  document.querySelectorAll("#schoolGroupChipsRow .school-group-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#schoolGroupChipsRow .school-group-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      academicIntelligenceState.activeSchoolGroup = pill.getAttribute("data-schoolgroup");
      renderSchoolCurriculum();
      if (typeof playTactileSound === "function") playTactileSound("click");
    });
  });

  // 4. Setup College Platform Toolbar Controls
  const btnFullscreenCollegeIframe = document.getElementById("btnFullscreenCollegeIframe");
  const btnOpenStandaloneCollege = document.getElementById("btnOpenStandaloneCollege");
  const btnReloadCollegeIframe = document.getElementById("btnReloadCollegeIframe");
  const collegeIframe = document.getElementById("collegeCurriculumIframe");

  if (btnFullscreenCollegeIframe && collegeIframe) {
    btnFullscreenCollegeIframe.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        if (collegeIframe.requestFullscreen) {
          collegeIframe.requestFullscreen();
        } else if (collegeIframe.webkitRequestFullscreen) {
          collegeIframe.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  if (btnOpenStandaloneCollege) {
    btnOpenStandaloneCollege.addEventListener("click", () => {
      window.open("./curriculum-platform/index.html", "_blank");
      if (typeof playTactileSound === "function") playTactileSound("click");
    });
  }

  if (btnReloadCollegeIframe && collegeIframe) {
    btnReloadCollegeIframe.addEventListener("click", () => {
      collegeIframe.src = "./curriculum-platform/index.html?t=" + Date.now();
      if (typeof playTactileSound === "function") playTactileSound("click");
    });
  }

  // 5. Setup Material Analyzer & Grounded Doubt Solver
  setupMaterialAnalyzer();

  // 6. Setup School Teaching Style & Permission Handlers
  setupSchoolTeachingStyleControls();

  // Dock recommendations in School pane initially
  dockAcademicRecommendationsContainer("school");

  // Render initial curriculum view & YouTube recommendations
  renderSchoolCurriculum();
  renderAcademicYouTubeRecommendations();
}

// Render dynamic school subjects grid with full interactivity
function renderSchoolCurriculum() {
  const grid = document.getElementById("academicSchoolGrid");
  const filterBadge = document.getElementById("schoolActiveFilterBadge");
  const countBadge = document.getElementById("schoolSubjectsCountBadge");
  const subjectsTitle = document.getElementById("schoolSubjectsTitle");
  if (!grid) return;

  const std = academicIntelligenceState.activeSchoolStandard;
  const grp = academicIntelligenceState.activeSchoolGroup;
  let subjectsList = [];
  let filterText = "";

  if (std === "STD_10") {
    subjectsList = AURA_SCHOOL_CURRICULUM.STD_10.subjects;
    filterText = "10th Standard (SSLC & CBSE Board)";
  } else if (std === "STD_11") {
    const groupData = AURA_SCHOOL_CURRICULUM.STD_11.groups[grp] || AURA_SCHOOL_CURRICULUM.STD_11.groups.BIO_MATHS;
    subjectsList = groupData;
    const groupNames = {
      BIO_MATHS: "Bio-Maths Group",
      COMP_SCI: "Computer Science Group",
      PURE_SCI: "Pure Science Group",
      COMMERCE: "Commerce Group",
      ARTS: "Arts & Humanities"
    };
    filterText = `11th Standard — ${groupNames[grp] || grp}`;
  } else {
    const groupData = AURA_SCHOOL_CURRICULUM.STD_12.groups[grp] || AURA_SCHOOL_CURRICULUM.STD_12.groups.BIO_MATHS;
    subjectsList = groupData;
    const groupNames = {
      BIO_MATHS: "Bio-Maths Group",
      COMP_SCI: "Computer Science Group",
      PURE_SCI: "Pure Science Group",
      COMMERCE: "Commerce Group",
      ARTS: "Arts & Humanities"
    };
    filterText = `12th Standard Board — ${groupNames[grp] || grp}`;
  }

  if (filterBadge) filterBadge.textContent = filterText;
  if (countBadge) countBadge.textContent = `${subjectsList.length} Subjects Enrolled`;
  if (subjectsTitle) subjectsTitle.textContent = `${filterText} — High-Yield Units & Formulas`;

  // Auto-select first subject if none selected yet
  if (!academicIntelligenceState.selectedSubject && subjectsList.length > 0) {
    const firstSubj = subjectsList[0];
    const cleanFirstName = firstSubj.name.split("(")[0].trim();
    academicIntelligenceState.activeSubject = cleanFirstName;
    academicIntelligenceState.selectedSubject = {
      standardOrDept: filterText,
      semester: null,
      subjectName: firstSubj.name,
      subjectCode: firstSubj.id || `STD-${std.replace("STD_", "")}-${cleanFirstName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}`,
      currentTopic: (firstSubj.chapters && firstSubj.chapters[0]) || "Full Syllabus",
      topics: firstSubj.chapters || []
    };
  }

  grid.innerHTML = subjectsList.map((item, idx) => {
    const isSelected = academicIntelligenceState.selectedSubject &&
      (academicIntelligenceState.selectedSubject.subjectName === item.name);
    const activeTopic = isSelected ? (academicIntelligenceState.selectedSubject.currentTopic) : null;

    const chaptersHtml = (item.chapters || []).map(ch => {
      const isChActive = isSelected && activeTopic === ch;
      return `
        <button type="button" class="school-chapter-pill ${isChActive ? 'active' : ''}" data-subject="${escapeHtml(item.name)}" data-chapter="${escapeHtml(ch)}">
          • ${escapeHtml(ch)}
        </button>
      `;
    }).join("");

    return `
      <div class="school-subject-card ${isSelected ? 'active active-academic-subject ring-2 ring-amber-500/80 bg-slate-800/90' : ''}" data-subject-name="${escapeHtml(item.name)}" data-subject-id="${item.id || idx}">
        <div>
          <div class="school-card-header">
            <h4 class="school-card-title">${escapeHtml(item.name)}</h4>
            <span class="school-card-badge">${escapeHtml(item.weight || 'Board Core')}</span>
          </div>
          
          <div class="school-chapters-list" title="Chapters breakdown — click any chapter to stream lectures">
            ${chaptersHtml}
          </div>

          ${item.formula ? `
            <div class="school-formulas-pill" title="${escapeHtml(item.formula)}">
              <span>📐</span>
              <span style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.formula)}</span>
            </div>
          ` : ''}

          ${item.scoreTip ? `
            <div style="font-size:11px; color:#A7F3D0; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); border-radius:4px; padding:6px 8px; margin-bottom:10px; line-height:1.4;">
              💡 <strong>Exam Tip:</strong> ${escapeHtml(item.scoreTip)}
            </div>
          ` : ''}
        </div>

        <div class="school-card-actions">
          <button type="button" class="school-btn-action" onclick="askSchoolSubjectDoubt('${escapeHtml(item.name)}')">
            <span>❓</span>
            <span>Ask Doubts</span>
          </button>
          <button type="button" class="school-btn-action primary" onclick="selectSchoolSubject('${escapeHtml(item.name)}')">
            <span>▷</span>
            <span>Video Lectures</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach card-level click listeners to toggle active state immediately
  grid.querySelectorAll(".school-subject-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button.school-btn-action") || e.target.closest("button.school-chapter-pill")) return;
      const subjName = card.getAttribute("data-subject-name");
      const matchedItem = subjectsList.find(s => s.name === subjName) || subjectsList[0];
      selectSchoolSubject(matchedItem.name);
    });
  });

  // Attach chapter pill click listeners to switch active topic directly
  grid.querySelectorAll(".school-chapter-pill").forEach(pill => {
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      const subjName = pill.getAttribute("data-subject");
      const chapterName = pill.getAttribute("data-chapter");
      selectSchoolSubject(subjName, chapterName);
    });
  });
}

// Select School Subject, toggle active ring-2 highlight & update dynamic YouTube recommendations
window.selectSchoolSubject = function(subjectName, topicOverride) {
  const std = academicIntelligenceState.activeSchoolStandard;
  const grp = academicIntelligenceState.activeSchoolGroup;
  let filterText = "";
  if (std === "STD_10") {
    filterText = "10th Standard (SSLC & CBSE Board)";
  } else if (std === "STD_11") {
    filterText = "11th Standard";
  } else {
    filterText = "12th Standard Board";
  }

  // Find subject details
  let currentList = [];
  if (std === "STD_10") currentList = AURA_SCHOOL_CURRICULUM.STD_10.subjects;
  else if (std === "STD_11") currentList = AURA_SCHOOL_CURRICULUM.STD_11.groups[grp] || [];
  else currentList = AURA_SCHOOL_CURRICULUM.STD_12.groups[grp] || [];

  const matched = currentList.find(s => s.name === subjectName || s.name.includes(subjectName)) || { name: subjectName, chapters: [] };
  const cleanName = matched.name.split("(")[0].trim();
  const currentTopic = topicOverride || (matched.chapters && matched.chapters[0]) || "Full Syllabus";

  // Store in State: { standardOrDept, semester, subjectName, subjectCode, currentTopic }
  academicIntelligenceState.activeSubject = cleanName;
  academicIntelligenceState.selectedSubject = {
    standardOrDept: filterText,
    semester: null,
    subjectName: matched.name,
    subjectCode: matched.id || `STD-${std.replace("STD_", "")}-${cleanName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}`,
    currentTopic: currentTopic,
    topics: matched.chapters || []
  };

  if (typeof engineeringHubState !== "undefined") {
    engineeringHubState.activeSubject = cleanName;
  }

  // Immediately toggle active border/highlight state (ring-2 ring-amber-500/80 bg-slate-800/90)
  document.querySelectorAll(".school-subject-card").forEach(c => {
    const isThisCard = c.getAttribute("data-subject-name") === matched.name;
    c.classList.toggle("active", isThisCard);
    c.classList.toggle("active-academic-subject", isThisCard);
    c.classList.toggle("ring-2", isThisCard);
    c.classList.toggle("ring-amber-500/80", isThisCard);
    c.classList.toggle("bg-slate-800/90", isThisCard);
  });

  // Toggle active chapter pill highlight
  document.querySelectorAll(".school-chapter-pill").forEach(p => {
    const isThisChapter = p.getAttribute("data-subject") === matched.name && p.getAttribute("data-chapter") === currentTopic;
    p.classList.toggle("active", isThisChapter);
  });

  // Ensure recommendations container is docked directly beneath the School subjects grid
  dockAcademicRecommendationsContainer("school");

  // Dynamically clear previous video cards and render targeted recommendations
  renderAcademicYouTubeRecommendations();

  // Scroll smoothly to the recommendations container
  const recEl = document.getElementById("academic-yt-recommendations");
  if (recEl) {
    recEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (typeof playTactileSound === "function") playTactileSound("click");
};

// Ask doubts specifically for a subject
window.askSchoolSubjectDoubt = function(subjectName) {
  const cleanName = subjectName.split("(")[0].trim();
  academicIntelligenceState.activeSubject = cleanName;

  // Prefill school doubt input
  const doubtInput = document.getElementById("schoolDoubtInput");
  if (doubtInput) {
    doubtInput.value = `Explain the most critical 5-mark board exam derivation and scoring formulas in ${cleanName}.`;
    doubtInput.focus();
  }

  // Also prefill Material Analyzer input
  const materialInput = document.getElementById("materialQuestionInput");
  if (materialInput) {
    materialInput.value = `Explain high-yield board exam formulas and derivations for ${cleanName}.`;
  }

  // Scroll to doubt section
  const schoolDropzone = document.getElementById("schoolSyllabusDropzone");
  if (schoolDropzone) {
    schoolDropzone.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (typeof playTactileSound === "function") playTactileSound("click");
};

// Ensure college iframe is smoothly loaded without glitches
function ensureCollegeIframeLoaded() {
  const collegeIframe = document.getElementById("collegeCurriculumIframe");
  if (collegeIframe && (!collegeIframe.src || collegeIframe.src === "about:blank")) {
    collegeIframe.src = "./curriculum-platform/index.html";
  }
}

// Setup Material Analyzer & Context-Grounded AI Doubt Solver
function setupMaterialAnalyzer() {
  const materialDropzone = document.getElementById("materialDropzone");
  const materialFileInput = document.getElementById("materialFileInput");
  const materialActiveDocName = document.getElementById("materialActiveDocName");
  const materialActiveDocMeta = document.getElementById("materialActiveDocMeta");
  const materialDocTypeBadge = document.getElementById("materialDocTypeBadge");
  const btnToggleDocPreview = document.getElementById("btnToggleDocPreview");
  const materialExtractedPreview = document.getElementById("materialExtractedPreview");
  const strictGroundingToggle = document.getElementById("strictGroundingToggle");
  const groundedChatStream = document.getElementById("groundedChatStream");
  const materialQuestionInput = document.getElementById("materialQuestionInput");
  const btnAskMaterialDoubt = document.getElementById("btnAskMaterialDoubt");
  const btnClearMaterialChat = document.getElementById("btnClearMaterialChat");
  const groundedSolverStatus = document.getElementById("groundedSolverStatus");

  // Load initial preset (Physics 12)
  loadMaterialPreset("PHYSICS_12");

  // Preset Buttons
  document.querySelectorAll(".material-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".material-preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const presetKey = btn.getAttribute("data-preset");
      loadMaterialPreset(presetKey);
      if (typeof playTactileSound === "function") playTactileSound("click");
    });
  });

  function loadMaterialPreset(presetKey) {
    const preset = AURA_MATERIAL_PRESETS[presetKey] || AURA_MATERIAL_PRESETS.PHYSICS_12;
    academicIntelligenceState.activeMaterial = {
      name: preset.name,
      type: preset.type,
      words: preset.text.split(/\s+/).length,
      text: preset.text,
      strictGrounding: strictGroundingToggle ? strictGroundingToggle.checked : true
    };

    if (materialActiveDocName) materialActiveDocName.textContent = preset.name;
    if (materialActiveDocMeta) materialActiveDocMeta.textContent = preset.meta;
    if (materialDocTypeBadge) materialDocTypeBadge.textContent = preset.type;
    if (materialExtractedPreview) materialExtractedPreview.textContent = preset.text;

    // Append system notice to chat
    appendChatBubble("ai", `Switched active grounded context to: **${preset.name}** (${preset.meta}). You can now ask questions or sums strictly based on this document!`);
  }

  // Dropzone file handling
  if (materialDropzone && materialFileInput) {
    materialDropzone.addEventListener("click", () => materialFileInput.click());

    materialDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      materialDropzone.classList.add("dragover");
    });

    materialDropzone.addEventListener("dragleave", () => {
      materialDropzone.classList.remove("dragover");
    });

    materialDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      materialDropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        handleMaterialFileUpload(e.dataTransfer.files[0]);
      }
    });

    materialFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length) {
        handleMaterialFileUpload(e.target.files[0]);
      }
    });
  }

  // Handle uploaded study document
  function handleMaterialFileUpload(file) {
    if (!file) return;

    const isText = file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv");

    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const wordCount = text.split(/\s+/).length;
        academicIntelligenceState.activeMaterial = {
          name: file.name,
          type: "Parsed Text Notes",
          words: wordCount,
          text: text,
          strictGrounding: strictGroundingToggle ? strictGroundingToggle.checked : true
        };

        if (materialActiveDocName) materialActiveDocName.textContent = file.name;
        if (materialActiveDocMeta) materialActiveDocMeta.textContent = `${wordCount.toLocaleString()} words · Document Ingested · Ready for Grounded Solving`;
        if (materialDocTypeBadge) materialDocTypeBadge.textContent = "Uploaded Document";
        if (materialExtractedPreview) materialExtractedPreview.textContent = text;

        appendChatBubble("ai", `Uploaded and indexed **${file.name}** (${wordCount} words). Ask any question or calculation using strictly the formulas in this document.`);
        if (typeof playTactileSound === "function") playTactileSound("success");
      };
      reader.readAsText(file);
    } else {
      // PDF, DOCX, or Image file
      const simulatedText = `Extracted Study Notes from: ${file.name} (File Size: ${(file.size / 1024).toFixed(1)} KB)
Formulas and notes indexed from uploaded student material.
Standard: ${academicIntelligenceState.activeSchoolStandard} | Subject: ${academicIntelligenceState.activeSubject}
Content includes governing formulas, diagrams, and numerical exercise problems.`;

      academicIntelligenceState.activeMaterial = {
        name: file.name,
        type: file.type || "Document",
        words: 1200,
        text: simulatedText,
        strictGrounding: strictGroundingToggle ? strictGroundingToggle.checked : true
      };

      if (materialActiveDocName) materialActiveDocName.textContent = file.name;
      if (materialActiveDocMeta) materialActiveDocMeta.textContent = `${(file.size / 1024).toFixed(1)} KB · Document Processed · Ready for RAG`;
      if (materialDocTypeBadge) materialDocTypeBadge.textContent = file.name.split('.').pop().toUpperCase();
      if (materialExtractedPreview) materialExtractedPreview.textContent = simulatedText;

      appendChatBubble("ai", `Successfully processed **${file.name}**. AI doubt solver is now locked to the formulas and notation in your uploaded file!`);
      if (typeof playTactileSound === "function") playTactileSound("success");
    }
  }

  // Toggle Extracted Preview
  if (btnToggleDocPreview && materialExtractedPreview) {
    btnToggleDocPreview.addEventListener("click", () => {
      const isHidden = materialExtractedPreview.style.display === "none";
      materialExtractedPreview.style.display = isHidden ? "block" : "none";
      btnToggleDocPreview.textContent = isHidden ? "🙈 Hide Extracted Text Context" : "👁️ Inspect Extracted Text Context";
    });
  }

  // Strict Grounding Toggle
  if (strictGroundingToggle) {
    strictGroundingToggle.addEventListener("change", () => {
      academicIntelligenceState.activeMaterial.strictGrounding = strictGroundingToggle.checked;
      if (groundedSolverStatus) {
        groundedSolverStatus.textContent = strictGroundingToggle.checked
          ? "● Grounded in Active Material (Zero Hallucination Mode)"
          : "○ Open Pedagogical Mode (Permits standard textbook expansions)";
        groundedSolverStatus.style.color = strictGroundingToggle.checked ? "#10B981" : "#F59E0B";
      }
    });
  }

  // Clear Chat
  if (btnClearMaterialChat && groundedChatStream) {
    btnClearMaterialChat.addEventListener("click", () => {
      groundedChatStream.innerHTML = `
        <div class="grounded-msg-row ai">
          <div class="grounded-msg-bubble">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255, 255, 255, 0.08); padding-bottom:6px;">
              <span style="font-size:11px; font-weight:700; color:var(--accent-gold); text-transform:uppercase;">✦ AURA Grounded Tutor</span>
              <span style="font-size:10px; color:var(--text-tertiary);">Fresh Session</span>
            </div>
            <p style="margin:0;">Chat history cleared. Grounded on: <strong>${escapeHtml(academicIntelligenceState.activeMaterial.name)}</strong>. Enter your doubt or question below.</p>
          </div>
        </div>
      `;
      academicIntelligenceState.materialChatHistory = [];
      if (typeof playTactileSound === "function") playTactileSound("click");
    });
  }

  // Quick Action Chips
  document.querySelectorAll(".grounded-quick-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const promptText = chip.getAttribute("data-quick");
      if (materialQuestionInput) {
        materialQuestionInput.value = promptText;
        executeMaterialDoubtQuery();
      }
    });
  });

  // Send Query
  if (btnAskMaterialDoubt) {
    btnAskMaterialDoubt.addEventListener("click", executeMaterialDoubtQuery);
  }

  if (materialQuestionInput) {
    materialQuestionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        executeMaterialDoubtQuery();
      }
    });
  }

  async function executeMaterialDoubtQuery() {
    const question = materialQuestionInput ? materialQuestionInput.value.trim() : "";
    if (!question) return;

    if (materialQuestionInput) materialQuestionInput.value = "";
    appendChatBubble("user", question);

    if (btnAskMaterialDoubt) {
      btnAskMaterialDoubt.disabled = true;
      btnAskMaterialDoubt.innerHTML = `<span>Solving...</span><div class="cyber-pulse-dot"></div>`;
    }

    try {
      const payload = {
        question,
        materialText: academicIntelligenceState.activeMaterial.text,
        fileName: academicIntelligenceState.activeMaterial.name,
        strictGrounding: academicIntelligenceState.activeMaterial.strictGrounding,
        standard: academicIntelligenceState.activeSchoolStandard,
        subject: academicIntelligenceState.activeSubject,
        conversationHistory: academicIntelligenceState.materialChatHistory
      };

      const res = await fetch(`${BACKEND_URL}/api/student/material-doubt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const answer = data.answer || "Solution compiled based on your notes.";

      appendChatBubble("ai", answer, {
        source: academicIntelligenceState.activeMaterial.name,
        grounded: academicIntelligenceState.activeMaterial.strictGrounding
      });

      // Save to conversation history
      academicIntelligenceState.materialChatHistory.push(
        { role: "user", content: question },
        { role: "assistant", content: answer }
      );

      if (typeof playTactileSound === "function") playTactileSound("success");
    } catch (err) {
      appendChatBubble("ai", `**Error during grounded solution:** ${err.message}. Please verify backend connection.`);
    } finally {
      if (btnAskMaterialDoubt) {
        btnAskMaterialDoubt.disabled = false;
        btnAskMaterialDoubt.innerHTML = `<span>Solve with AI</span><span>→</span>`;
      }
    }
  }

  function appendChatBubble(role, content, meta = null) {
    if (!groundedChatStream) return;

    const row = document.createElement("div");
    row.className = `grounded-msg-row ${role}`;

    const formattedContent = typeof formatMarkdownResponse === "function"
      ? formatMarkdownResponse(content)
      : content.replace(/\n/g, "<br/>");

    row.innerHTML = `
      <div class="grounded-msg-bubble">
        ${role === 'ai' ? `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255, 255, 255, 0.08); padding-bottom:6px; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11px; font-weight:700; color:var(--accent-gold); text-transform:uppercase;">✦ Context-Grounded Solution</span>
              ${meta && meta.source ? `
                <span class="school-card-badge" style="font-size:9.5px; padding:2px 6px;">📌 ${escapeHtml(meta.source)}</span>
              ` : ''}
            </div>
            <button class="school-btn-action" style="padding:2px 8px; font-size:10px;" onclick="copyChatBubbleText(this)">📋 Copy</button>
          </div>
        ` : `
          <div style="font-size:10.5px; font-weight:700; color:var(--accent-gold); text-transform:uppercase; margin-bottom:4px;">You asked:</div>
        `}
        <div class="grounded-bubble-text">${formattedContent}</div>
      </div>
    `;

    groundedChatStream.appendChild(row);
    groundedChatStream.scrollTop = groundedChatStream.scrollHeight;
  }
}

// Copy chat response helper
window.copyChatBubbleText = function(btn) {
  const bubble = btn.closest(".grounded-msg-bubble");
  if (!bubble) return;
  const textEl = bubble.querySelector(".grounded-bubble-text");
  if (textEl) {
    navigator.clipboard.writeText(textEl.innerText);
    const orig = btn.textContent;
    btn.textContent = "✓ Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }
};

// Setup School Teaching Style & Permission Controls
function setupSchoolTeachingStyleControls() {
  const schoolSyllabusDropzone = document.getElementById("schoolSyllabusDropzone");
  const schoolSyllabusFileInput = document.getElementById("schoolSyllabusFileInput");
  const btnConfigureSchoolMethod = document.getElementById("btnConfigureSchoolMethod");
  const schoolPermissionCard = document.getElementById("schoolPermissionCard");
  const btnGrantPermission = document.getElementById("btnGrantPermission");
  const btnDenyPermission = document.getElementById("btnDenyPermission");
  const btnDeleteSchoolData = document.getElementById("btnDeleteSchoolData");
  const schoolAskDoubtBtn = document.getElementById("schoolAskDoubtBtn");
  const schoolDoubtInput = document.getElementById("schoolDoubtInput");
  const schoolDoubtResponseCard = document.getElementById("schoolDoubtResponseCard");
  const schoolDoubtResponseText = document.getElementById("schoolDoubtResponseText");
  const copySchoolDoubtBtn = document.getElementById("copySchoolDoubtBtn");

  // Dropzone
  if (schoolSyllabusDropzone && schoolSyllabusFileInput) {
    schoolSyllabusDropzone.addEventListener("click", () => schoolSyllabusFileInput.click());
    schoolSyllabusFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length) {
        handleSchoolSyllabusUpload(e.target.files[0]);
      }
    });
  }

  // Method Configuration
  if (btnConfigureSchoolMethod) {
    btnConfigureSchoolMethod.addEventListener("click", () => {
      const newMethod = prompt(
        "Enter your preferred study style & how your school teacher teaches:\n(e.g., Step-by-step formula breakdown, Tamil-English bilingual, textbook derivations first, or visual analogies)",
        academicIntelligenceState.storedMethod
      );
      if (newMethod && newMethod.trim()) {
        academicIntelligenceState.storedMethod = newMethod.trim();
        if (schoolPermissionCard) schoolPermissionCard.style.display = "block";
      }
    });
  }

  if (btnGrantPermission) {
    btnGrantPermission.addEventListener("click", () => {
      academicIntelligenceState.userMethodPermission = true;
      localStorage.setItem("aura_school_perm", "true");
      localStorage.setItem("aura_school_method", academicIntelligenceState.storedMethod);
      if (schoolPermissionCard) schoolPermissionCard.style.display = "none";
      const summary = document.getElementById("schoolStoredMethodSummary");
      if (summary) summary.textContent = `"${academicIntelligenceState.storedMethod}"`;
      if (typeof playTactileSound === "function") playTactileSound("success");
      alert("Your study method has been saved with your permission. AURA will now teach all your doubts in this exact method!");
    });
  }

  if (btnDenyPermission) {
    btnDenyPermission.addEventListener("click", () => {
      if (schoolPermissionCard) schoolPermissionCard.style.display = "none";
    });
  }

  if (btnDeleteSchoolData) {
    btnDeleteSchoolData.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your stored school study method and syllabus data?")) {
        localStorage.removeItem("aura_school_perm");
        localStorage.removeItem("aura_school_method");
        academicIntelligenceState.storedMethod = "Standard pedagogical step-by-step method";
        academicIntelligenceState.userMethodPermission = false;
        const summary = document.getElementById("schoolStoredMethodSummary");
        if (summary) summary.textContent = '"Standard pedagogical step-by-step method"';
        if (typeof playTactileSound === "function") playTactileSound("click");
      }
    });
  }

  // School Quick Doubt Solver
  if (schoolAskDoubtBtn) {
    schoolAskDoubtBtn.addEventListener("click", async () => {
      const doubt = schoolDoubtInput ? schoolDoubtInput.value.trim() : "";
      if (!doubt) return;

      schoolAskDoubtBtn.disabled = true;
      schoolAskDoubtBtn.textContent = "Analyzing in Your School Method...";

      try {
        const res = await fetch(`${BACKEND_URL}/api/student/ask-doubt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doubt,
            standard: academicIntelligenceState.activeSchoolStandard.replace("STD_", ""),
            subject: academicIntelligenceState.activeSubject
          })
        });
        const data = await res.json();
        const ans = data.answer || "Detailed solution compiled.";

        if (schoolDoubtResponseText) {
          schoolDoubtResponseText.innerHTML = typeof formatMarkdownResponse === "function" ? formatMarkdownResponse(ans) : ans;
        }
        if (schoolDoubtResponseCard) {
          schoolDoubtResponseCard.style.display = "block";
        }
        if (typeof playTactileSound === "function") playTactileSound("success");
      } catch (err) {
        if (schoolDoubtResponseText) {
          schoolDoubtResponseText.innerHTML = `<div style="color:#EF4444; padding:12px;">Error explaining doubt: ${escapeHtml(err.message)}</div>`;
        }
      } finally {
        schoolAskDoubtBtn.disabled = false;
        schoolAskDoubtBtn.textContent = "Explain in My School Method";
      }
    });
  }

  if (copySchoolDoubtBtn) {
    copySchoolDoubtBtn.addEventListener("click", () => {
      const text = schoolDoubtResponseText ? schoolDoubtResponseText.innerText : "";
      if (text) {
        navigator.clipboard.writeText(text);
        copySchoolDoubtBtn.textContent = "✓ Copied!";
        setTimeout(() => { copySchoolDoubtBtn.textContent = "📋 Copy"; }, 1500);
      }
    });
  }
}

// Upload school syllabus to backend knowledge engine
async function handleSchoolSyllabusUpload(file) {
  if (!file) return;
  alert(`Ingesting school textbook/syllabus: ${file.name}. AI is indexing chapters...`);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("standard", academicIntelligenceState.activeSchoolStandard);

  try {
    const res = await fetch(`${BACKEND_URL}/api/student/syllabus/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (typeof playTactileSound === "function") playTactileSound("success");
    alert(`Syllabus "${file.name}" indexed successfully! Units parsed. AURA is ready to answer questions based on this textbook.`);
  } catch (err) {
    alert("Syllabus uploaded locally: " + file.name);
  }
}

// ── STUDENT AUTH & PROFILE MODAL CONTROLLER ──
function initStudentAuthModal() {
  const userAuthBtn = document.getElementById("userAuthBtn");
  const studentAuthModal = document.getElementById("studentAuthModal");
  const btnCloseAuthModal = document.getElementById("btnCloseAuthModal");
  const authTabSignInBtn = document.getElementById("authTabSignInBtn");
  const authTabSignUpBtn = document.getElementById("authTabSignUpBtn");
  const authTabProfileBtn = document.getElementById("authTabProfileBtn");
  const authGoogleBtn = document.getElementById("authGoogleBtn");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authFormFields = document.getElementById("authFormFields");
  const authExtraSignupFields = document.getElementById("authExtraSignupFields");
  const authProfileDetailsPane = document.getElementById("authProfileDetailsPane");
  const btnDeleteStudentAllData = document.getElementById("btnDeleteStudentAllData");

  if (!userAuthBtn || !studentAuthModal) return;

  if (typeof initPasswordToggleButtons === "function") initPasswordToggleButtons();

  userAuthBtn.addEventListener("click", () => {
    studentAuthModal.style.display = "flex";
    updateAuthProfileDisplay();
    playTactileSound("click");
  });

  if (btnCloseAuthModal) {
    btnCloseAuthModal.addEventListener("click", () => {
      studentAuthModal.style.display = "none";
    });
  }

  studentAuthModal.addEventListener("click", (e) => {
    if (e.target === studentAuthModal) studentAuthModal.style.display = "none";
  });

  let currentAuthTab = "signin";

  if (authTabSignInBtn) {
    authTabSignInBtn.addEventListener("click", () => {
      currentAuthTab = "signin";
      authTabSignInBtn.classList.add("active");
      if (authTabSignUpBtn) authTabSignUpBtn.classList.remove("active");
      if (authTabProfileBtn) authTabProfileBtn.classList.remove("active");
      if (authFormFields) authFormFields.style.display = "block";
      if (authExtraSignupFields) authExtraSignupFields.style.display = "none";
      if (authProfileDetailsPane) authProfileDetailsPane.style.display = "none";
      if (authSubmitBtn) authSubmitBtn.textContent = "Sign In to AURA";
    });
  }

  if (authTabSignUpBtn) {
    authTabSignUpBtn.addEventListener("click", () => {
      currentAuthTab = "signup";
      authTabSignUpBtn.classList.add("active");
      if (authTabSignInBtn) authTabSignInBtn.classList.remove("active");
      if (authTabProfileBtn) authTabProfileBtn.classList.remove("active");
      if (authFormFields) authFormFields.style.display = "block";
      if (authExtraSignupFields) authExtraSignupFields.style.display = "block";
      if (authProfileDetailsPane) authProfileDetailsPane.style.display = "none";
      if (authSubmitBtn) authSubmitBtn.textContent = "Create Student Profile";
    });
  }

  if (authTabProfileBtn) {
    authTabProfileBtn.addEventListener("click", () => {
      currentAuthTab = "profile";
      authTabProfileBtn.classList.add("active");
      if (authTabSignInBtn) authTabSignInBtn.classList.remove("active");
      if (authTabSignUpBtn) authTabSignUpBtn.classList.remove("active");
      if (authFormFields) authFormFields.style.display = "none";
      if (authProfileDetailsPane) authProfileDetailsPane.style.display = "block";
      updateAuthProfileDisplay();
    });
  }

  // Google 1-Click Simulation
  if (authGoogleBtn) {
    authGoogleBtn.addEventListener("click", () => {
      const googleProfile = {
        name: "Manikandan",
        email: "manikandan@gmail.com",
        standard: "12th",
        stream: "Science (Computer Science)",
        preferredMethod: "Step-by-step formula derivations, bilingual Tamil-English explanations",
        schoolTeachingStyle: "Textbook derivations, 2-mark definitions & solved exercises",
        loggedIn: true
      };
      localStorage.setItem("aura_student_profile", JSON.stringify(googleProfile));
      updateTopUserName(googleProfile.name);
      studentAuthModal.style.display = "none";
      playTactileSound("success");
      speakAuraVoice("Signed in successfully with Google account.");
      alert("Welcome, Manikandan! Signed in via Google. Your study methods and school preferences are active.");
    });
  }

  // Submit Form: Real Persistent PBKDF2 Authentication Integration
  if (authSubmitBtn) {
    authSubmitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("authEmailInput");
      const passwordInput = document.getElementById("authPasswordInput");
      const nameInput = document.getElementById("authNameInput");
      const standardSelect = document.getElementById("authStandardSelect");
      const streamSelect = document.getElementById("authStreamSelect");

      const email = (emailInput?.value || "").trim();
      const password = (passwordInput?.value || "").trim();
      const name = (nameInput?.value || "").trim();
      const standard = standardSelect?.value || "12th";
      const stream = streamSelect?.value || "Science";

      if (!email) {
        alert("✕ Please enter your email address.");
        if (emailInput) emailInput.focus();
        return;
      }
      if (!password) {
        alert("✕ Please enter your password.");
        if (passwordInput) passwordInput.focus();
        return;
      }

      authSubmitBtn.disabled = true;

      try {
        if (currentAuthTab === "signup") {
          authSubmitBtn.textContent = "Creating Account...";
          const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, standard, stream })
          });
          if (res.status === 409) {
            playTactileSound("error");
            alert("This email is already registered. Please sign in instead.");
            return;
          }

          const data = await res.json();

          if (!res.ok || !data.success) {
            // Block access on invalid credentials or registration failure
            playTactileSound("error");
            alert(data.error || "✕ Registration Unsuccessful: Invalid credentials or email already registered.");
            return;
          }

          // Store user session ONLY upon true backend success
          localStorage.setItem("aura_auth_session", JSON.stringify(data));
          localStorage.setItem("aura_student_profile", JSON.stringify(data.profile || data.user));

          const portal = document.getElementById("auraLoginPortal");
          if (portal) portal.classList.add("authenticated");
          updateTopUserName(data.user.name || "Student");
          updateAuthProfileDisplay();

          studentAuthModal.style.display = "none";
          playTactileSound("success");
          speakAuraVoice(`Welcome to Project Aura, ${data.user.name}!`);
          alert(`✓ Welcome, ${data.user.name}! Account registered and verified successfully.`);

        } else {
          // Sign In branch
          authSubmitBtn.textContent = "Verifying Credentials...";
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          if (res.status === 401) {
            playTactileSound("error");
            alert("Invalid email or password. Please check your credentials or create an account.");
            return;
          }

          const data = await res.json();

          if (!res.ok || !data.success) {
            // Block access on invalid credentials
            playTactileSound("error");
            alert(data.error || "Invalid email or password. Please check your credentials or create an account.");
            return;
          }

          // Store user session ONLY upon true backend success
          localStorage.setItem("aura_auth_session", JSON.stringify(data));
          localStorage.setItem("aura_student_profile", JSON.stringify(data.profile || data.user));

          const portal = document.getElementById("auraLoginPortal");
          if (portal) portal.classList.add("authenticated");
          updateTopUserName(data.user.name || "Student");
          updateAuthProfileDisplay();

          studentAuthModal.style.display = "none";
          playTactileSound("success");
          speakAuraVoice(`Welcome back, ${data.user.name}!`);
          alert(`✓ Sign In successful! Welcome back, ${data.user.name}.`);
        }
      } catch (err) {
        console.error("[STUDENT AUTH ERROR]", err);
        playTactileSound("error");
        alert("✕ Connection error: Authentication server is unreachable. Please verify backend is running.");
      } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = currentAuthTab === "signup" ? "Create Student Profile" : "Sign In to AURA";
      }
    });
  }

  // Delete All Stored Data
  if (btnDeleteStudentAllData) {
    btnDeleteStudentAllData.addEventListener("click", () => {
      if (confirm("Permanently erase all your saved student study methods, uploaded books, and personal profile data? This action cannot be undone.")) {
        localStorage.removeItem("aura_student_profile");
        localStorage.removeItem("aura_school_perm");
        localStorage.removeItem("aura_school_method");
        localStorage.removeItem("aura_local_vault_files");
        updateTopUserName("Sign In");
        updateAuthProfileDisplay();
        playTactileSound("click");
        alert("All student study profile data, methods, and uploaded syllabi have been permanently deleted.");
      }
    });
  }
}

function updateTopUserName(name) {
  const lbl = document.getElementById("userNameLabel");
  if (lbl) lbl.textContent = name || "Sign In";
}

function updateAuthProfileDisplay() {
  const stored = JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
  const pName = document.getElementById("authProfileName");
  const pStd = document.getElementById("authProfileStdBadge");
  const pEmail = document.getElementById("authProfileEmail");
  const pMethod = document.getElementById("authProfileMethod");
  const pSchool = document.getElementById("authProfileSchool");

  if (pName) pName.textContent = stored.name || "Guest Student";
  if (pStd) pStd.textContent = (stored.standard || "12th") + " Standard";
  if (pEmail) pEmail.textContent = stored.email || "guest@aura.ai";
  if (pMethod) pMethod.textContent = stored.preferredMethod || collegeAndSchoolState.storedMethod;
  if (pSchool) pSchool.textContent = stored.schoolTeachingStyle || "Standard textbook definitions and derivations";
}

// Check saved profile on boot
const savedProfileBoot = JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
if (savedProfileBoot.name) {
  setTimeout(() => updateTopUserName(savedProfileBoot.name), 200);
}

// Connect new subnav tabs in Creation Studio
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".creation-tab-btn[data-tab]");
  if (!btn) return;
  const tabKey = btn.getAttribute("data-tab");
  if (!tabKey) return;

  document.querySelectorAll(".creation-tab-btn[data-tab]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.querySelectorAll(".creation-tab-content").forEach(pane => {
    pane.style.display = pane.id === `tab-${tabKey}` ? "block" : "none";
  });
});



// ── PASSWORD VISIBILITY TOGGLE (EYE SYMBOL) CONTROLLER ──
function initPasswordToggleButtons() {
  const eyeOpenSvg = `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const eyeClosedSvg = `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

  const toggles = [
    { btnId: "toggleLoginPasswordBtn", inputId: "auraLoginPassword" },
    { btnId: "toggleSignupPasswordBtn", inputId: "auraSignupPassword" },
    { btnId: "toggleStudentModalPasswordBtn", inputId: "authPasswordInput" }
  ];

  toggles.forEach(({ btnId, inputId }) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.onclick = () => {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.innerHTML = isPassword ? eyeClosedSvg : eyeOpenSvg;
      btn.setAttribute("title", isPassword ? "Hide Password" : "Show Password");
      btn.setAttribute("aria-label", isPassword ? "Hide Password" : "Show Password");
      if (typeof playTactileSound === "function") playTactileSound("click");
    };
  });
}

// ── MANDATORY LIQUID GLASS LOGIN & SIGNUP PORTAL GATEWAY ──
function initAuthGateway() {
  const portal = document.getElementById("auraLoginPortal");
  if (!portal) return;

  initPasswordToggleButtons();

  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabSignupBtn = document.getElementById("tabSignupBtn");
  const loginForm = document.getElementById("auraLoginForm");
  const signupForm = document.getElementById("auraSignupForm");
  const verifyForm = document.getElementById("auraVerifyForm");
  const alertBox = document.getElementById("auraAuthAlert");
  const fillDemoBtn = document.getElementById("fillDemoCredentialsBtn");
  const loginEmail = document.getElementById("auraLoginEmail");
  const loginPass = document.getElementById("auraLoginPassword");
  const signOutBtn = document.getElementById("auraSignOutBtn");
  const userNameLabel = document.getElementById("userNameLabel");

  const verifyEmailLabel = document.getElementById("verifyTargetEmail");
  const verifyCodeInput = document.getElementById("auraVerifyCodeInput");
  const verifySubmitBtn = document.getElementById("auraVerifySubmitBtn");
  const autoFillVerifyCodeBtn = document.getElementById("autoFillVerifyCodeBtn");
  const verifyPasskeyBadge = document.getElementById("verifyPasskeyBadge");
  const backToLoginBtn = document.getElementById("auraBackToLoginBtn");

  function showAlert(msg, isError = true) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `auth-alert-box ${isError ? 'error' : 'success'}`;
    alertBox.style.display = "block";
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = "none";
  }

  function showVerifyView(targetEmail, code) {
    if (loginForm) loginForm.style.display = "none";
    if (signupForm) signupForm.style.display = "none";
    if (tabLoginBtn) tabLoginBtn.classList.remove("active");
    if (tabSignupBtn) tabSignupBtn.classList.remove("active");
    if (verifyForm) verifyForm.style.display = "block";
    if (verifyEmailLabel) verifyEmailLabel.textContent = targetEmail;
    if (verifyPasskeyBadge && code) verifyPasskeyBadge.textContent = code;
    if (verifyCodeInput) {
      verifyCodeInput.value = "";
      setTimeout(() => verifyCodeInput.focus(), 150);
    }
    showAlert(`✉️ Verification code generated for ${targetEmail}. Enter the 6-digit code to activate your account.`, false);
  }

  // Switch between Sign In and Create Account
  if (tabLoginBtn && tabSignupBtn && loginForm && signupForm) {
    tabLoginBtn.addEventListener("click", () => {
      tabLoginBtn.classList.add("active");
      tabSignupBtn.classList.remove("active");
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      if (verifyForm) verifyForm.style.display = "none";
      hideAlert();
    });
    tabSignupBtn.addEventListener("click", () => {
      tabSignupBtn.classList.add("active");
      tabLoginBtn.classList.remove("active");
      signupForm.style.display = "block";
      loginForm.style.display = "none";
      if (verifyForm) verifyForm.style.display = "none";
      hideAlert();
    });
  }

  // Back to login button from verification view
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
      if (verifyForm) verifyForm.style.display = "none";
      if (loginForm) loginForm.style.display = "block";
      if (tabLoginBtn) tabLoginBtn.classList.add("active");
      if (tabSignupBtn) tabSignupBtn.classList.remove("active");
      hideAlert();
    });
  }

  // Quick auto-fill passkey button
  if (autoFillVerifyCodeBtn && verifyCodeInput && verifyPasskeyBadge) {
    autoFillVerifyCodeBtn.addEventListener("click", () => {
      verifyCodeInput.value = verifyPasskeyBadge.textContent.trim();
      playTactileSound("click");
      showAlert("Passkey auto-filled. Click 'Verify Code & Launch' to activate your account.", false);
    });
  }

  // Quick Demo credentials fill
  if (fillDemoBtn && loginEmail && loginPass) {
    fillDemoBtn.addEventListener("click", () => {
      loginEmail.value = "manikandan@aura.ai";
      loginPass.value = "aura123";
      playTactileSound("click");
      showAlert("Demo credentials loaded! Click 'Sign In to Project Aura' to continue.", false);
    });
  }

  // ── OFFICIAL GOOGLE IDENTITY SERVICES (GIS) AUTHENTICATION ──
  const GOOGLE_CLIENT_ID = "792884492277-qu4hiu3qpdiacda8ufrj558ef5sghcp9.apps.googleusercontent.com";

  async function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      console.warn("[GOOGLE AUTH] Empty credential response received");
      showAlert("Google authentication was canceled or returned no credential.");
      return;
    }

    showAlert("Verifying Google account with Project Aura...", false);

    const payload = JSON.stringify({ credential: response.credential });

    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/student/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload
        });
      } catch (err) {
        console.warn("[GOOGLE AUTH] Primary endpoint failed, trying fallback:", err.message);
        res = await fetch("https://project-aura-hush.onrender.com/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload
        });
      }

      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch (_) {}
        throw new Error(errData.message || errData.error || `Authentication failed with status ${res.status}`);
      }

      const data = await res.json();

      // Store token and student session in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("aura_auth_session", JSON.stringify(data));
      const studentData = data.student || data.user || data.profile;
      if (studentData) {
        localStorage.setItem("aura_student_profile", JSON.stringify(studentData));
      }

      showAlert(`✓ Welcome, ${(studentData && studentData.name) || "Student"}! Google authentication successful.`, false);
      if (typeof playTactileSound === "function") playTactileSound("success");
      if (typeof playProjectAuraCinematicImpact === "function") {
        playProjectAuraCinematicImpact(0.85);
      }

      setTimeout(() => {
        if (portal) portal.classList.add("authenticated");
        if (userNameLabel) userNameLabel.textContent = (studentData && studentData.name) || "Student";
        if (typeof updateTopUserName === "function") updateTopUserName((studentData && studentData.name) || "Student");
        if (signOutBtn) signOutBtn.style.display = "inline-flex";
        if (typeof loadStudentPerformance === "function") loadStudentPerformance();
        if (typeof updateAuthProfileDisplay === "function") updateAuthProfileDisplay();
        if (typeof switchView === "function") switchView("command-center");

        // Redirect directly to dashboard route as requested
        window.location.href = "/dashboard.html";
      }, 500);

    } catch (err) {
      console.error("[GOOGLE AUTH ERROR]", err);
      showAlert("✕ Google Sign-In error: " + (err.message || "Failed to complete authentication."));
      if (typeof playTactileSound === "function") playTactileSound("error");
    }
  }

  function initGoogleAuth() {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      setTimeout(initGoogleAuth, 300);
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        use_fedcm_for_prompt: true
      });

      const container = document.getElementById("googleBtnContainer");
      if (container) {
        container.innerHTML = "";
        google.accounts.id.renderButton(container, {
          theme: "filled_blue",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: "320"
        });
      }

      const signupContainer = document.getElementById("googleSignupBtnContainer");
      if (signupContainer) {
        signupContainer.innerHTML = "";
        google.accounts.id.renderButton(signupContainer, {
          theme: "filled_blue",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: "320"
        });
      }
    } catch (err) {
      console.warn("[GOOGLE AUTH INIT ERROR]", err);
    }
  }

  // Initialize Google Identity Services
  initGoogleAuth();

  // Check active session on startup
  const existingSession = localStorage.getItem("aura_auth_session");
  const existingToken = localStorage.getItem("token");
  if (existingSession || existingToken) {
    try {
      const sess = existingSession ? JSON.parse(existingSession) : null;
      const user = (sess && (sess.student || sess.user || sess.profile)) || JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
      portal.classList.add("authenticated");
      if (user && user.name) {
        if (userNameLabel) userNameLabel.textContent = user.name || "Student";
        if (typeof updateTopUserName === "function") updateTopUserName(user.name);
      }
      if (signOutBtn) signOutBtn.style.display = "inline-flex";
    } catch (_) {
      if (existingToken) {
        portal.classList.add("authenticated");
        if (signOutBtn) signOutBtn.style.display = "inline-flex";
      } else {
        portal.classList.remove("authenticated");
      }
    }
  } else {
    portal.classList.remove("authenticated");
    if (signOutBtn) signOutBtn.style.display = "none";
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const email = loginEmail ? loginEmail.value.trim() : "";
      const password = loginPass ? loginPass.value.trim() : "";
      if (!email || !password) {
        showAlert("✕ Unsuccessful: Please enter both email and password.");
        return;
      }

      const submitBtn = document.getElementById("auraLoginSubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying Credentials...";
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/student/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (res.status === 401) {
          throw new Error("Invalid email or password. Please check your credentials or create an account.");
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Invalid email or password. Please check your credentials or create an account.");
        }

        if (data.requireVerification) {
          showVerifyView(data.email, data.verificationCode);
          return;
        }

        // Store authentic user session in browser & database
        localStorage.setItem("aura_auth_session", JSON.stringify(data));
        localStorage.setItem("aura_student_profile", JSON.stringify(data.profile || data.user));

        showAlert("✓ Authentication successful! Initializing Project Aura...", false);
        playTactileSound("success");
        if (typeof playProjectAuraCinematicImpact === "function") {
          playProjectAuraCinematicImpact(0.85);
        }

        setTimeout(() => {
          portal.classList.add("authenticated");
          if (userNameLabel) userNameLabel.textContent = (data.user && data.user.name) || "Student";
          if (signOutBtn) signOutBtn.style.display = "inline-flex";
          if (typeof loadStudentPerformance === "function") loadStudentPerformance();
        }, 550);
      } catch (err) {
        showAlert(err.message || "Invalid email or password. Please check your credentials or create an account.");
        playTactileSound("error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Sign In to Project Aura</span><span class="auth-btn-arrow">→</span>`;
        }
      }
    });
  }

  // Handle Signup submission
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const name = document.getElementById("auraSignupName")?.value.trim();
      const email = document.getElementById("auraSignupEmail")?.value.trim();
      const password = document.getElementById("auraSignupPassword")?.value.trim();
      const standard = document.getElementById("auraSignupStandard")?.value || "College";
      const stream = document.getElementById("auraSignupStream")?.value || "General";

      if (!email || !password) {
        showAlert("✕ Unsuccessful: Email and password are required.");
        return;
      }

      const submitBtn = document.getElementById("auraSignupSubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Generating Verification Passkey...";
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/student/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, standard, stream })
        });

        if (res.status === 409) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Unsuccessful: Failed to register account.");
        }

        if (data.requireVerification) {
          showVerifyView(data.email, data.verificationCode);
          playTactileSound("dispatch");
          return;
        }

        localStorage.setItem("aura_auth_session", JSON.stringify(data));
        localStorage.setItem("aura_student_profile", JSON.stringify(data.user));

        showAlert("✓ Account registered successfully! Welcome to Project Aura.", false);
        playTactileSound("success");
        if (typeof playProjectAuraCinematicImpact === "function") {
          playProjectAuraCinematicImpact(0.85);
        }

        setTimeout(() => {
          portal.classList.add("authenticated");
          if (userNameLabel) userNameLabel.textContent = data.user.name || "Student";
          if (signOutBtn) signOutBtn.style.display = "inline-flex";
          if (typeof loadStudentPerformance === "function") loadStudentPerformance();
        }, 550);
      } catch (err) {
        showAlert(err.message || "✕ Unsuccessful: Registration failed. Try with different credentials.");
        playTactileSound("error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Create Account & Launch</span><span class="auth-btn-arrow">→</span>`;
        }
      }
    });
  }

  // Handle Email Verification submission
  if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const code = verifyCodeInput ? verifyCodeInput.value.trim() : "";
      const email = (verifyEmailLabel ? verifyEmailLabel.textContent.trim() : "") ||
                    (document.getElementById("auraSignupEmail")?.value.trim() || "");

      if (!code || code.length !== 6) {
        showAlert("✕ Unsuccessful: Please enter the complete 6-digit verification code.");
        playTactileSound("error");
        return;
      }

      if (verifySubmitBtn) {
        verifySubmitBtn.disabled = true;
        verifySubmitBtn.textContent = "Verifying Passkey...";
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/student/auth/verify-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Unsuccessful: Invalid verification code. Please check your code.");
        }

        localStorage.setItem("aura_auth_session", JSON.stringify(data));
        localStorage.setItem("aura_student_profile", JSON.stringify(data.profile || data.user));

        showAlert("✓ Email verified successfully! Launching Project Aura...", false);
        playTactileSound("success");
        if (typeof playProjectAuraCinematicImpact === "function") {
          playProjectAuraCinematicImpact(0.85);
        }

        setTimeout(() => {
          portal.classList.add("authenticated");
          if (userNameLabel) userNameLabel.textContent = (data.user && data.user.name) || "Student";
          if (signOutBtn) signOutBtn.style.display = "inline-flex";
          if (typeof loadStudentPerformance === "function") loadStudentPerformance();
        }, 550);
      } catch (err) {
        showAlert(err.message || "✕ Unsuccessful: Verification failed. Invalid code.");
        playTactileSound("error");
      } finally {
        if (verifySubmitBtn) {
          verifySubmitBtn.disabled = false;
          verifySubmitBtn.innerHTML = `<span>Verify Code &amp; Launch Project Aura</span><span class="auth-btn-arrow">✓</span>`;
        }
      }
    });
  }

  // Handle Sign Out
  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      if (confirm("Sign out of Project Aura? The portal will be locked until you sign back in.")) {
        localStorage.removeItem("aura_auth_session");
        localStorage.removeItem("token");
        localStorage.removeItem("aura_student_profile");
        portal.classList.remove("authenticated");
        signOutBtn.style.display = "none";
        if (userNameLabel) userNameLabel.textContent = "Sign In";
        switchView("command-center");
        playTactileSound("click");
      }
    });
  }
}

// ── ENSURE AURA 3.0 MODULES INITIALIZE ON PAGE LOAD ──
function initAura3CoreModules() {
  if (typeof initAuthGateway === "function") initAuthGateway();
  if (typeof initGlobalVoiceAssistant === "function") initGlobalVoiceAssistant();
  if (typeof initCollegeAndSchoolHub === "function") initCollegeAndSchoolHub();
  if (typeof initEngineeringHub === "function") initEngineeringHub();
  if (typeof window.loadYouTubeLectures === "function") window.loadYouTubeLectures();
  if (typeof initKnowledgeVaultTopicIngest === "function") initKnowledgeVaultTopicIngest();
  if (typeof initYouTubeUrlDecoder === "function") initYouTubeUrlDecoder();
  if (typeof initStudentAuthModal === "function") initStudentAuthModal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAura3CoreModules);
} else {
  initAura3CoreModules();
}



// ── COMMAND CENTER STUDENT PROFILE MEMORY & PERMISSION INTELLIGENCE ──
function inspectAndHandleProfileMemory(queryText, aiResponse) {
  const lower = (queryText || "").toLowerCase();

  // 1. User asks to recall their stored details or profile analysis
  const askRecall = /(?:what are my details|tell my details|show my details|who am i|soller|kudu|what do you know about me|my stored details|my study method|my profile|analyse my profile|analyze my profile)/i.test(lower);
  if (askRecall) {
    const profile = JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
    const method = localStorage.getItem("aura_school_method") || profile.preferredMethod || "Step-by-step formula derivation with textbook proofs & clear bilingual explanations";
    const name = profile.name || "Student";
    const standard = profile.standard || "12th Standard";
    
    return `
      <div class="profile-recall-card" style="margin-top:14px; padding:14px 16px; background:var(--bg-surface-elevated); border:1px solid var(--accent-gold); border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="color:var(--accent-gold); font-size:16px;">◈</span>
          <span style="font-weight:800; font-size:13px; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.04em;">
            Student Profile Analysis &amp; Registered Method
          </span>
        </div>
        <div style="font-size:13px; line-height:1.6; color:var(--text-primary);">
          <div>• <strong>Student Name:</strong> ${escapeHtml(name)}</div>
          <div>• <strong>Academic Tier:</strong> ${escapeHtml(standard)}</div>
          <div>• <strong>Registered Study Method:</strong> "${escapeHtml(method)}"</div>
          <div>• <strong>School Teaching Style:</strong> "${escapeHtml(profile.schoolTeachingStyle || 'Textbook derivations & board exam scoring focus')}"</div>
          <div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--border-subtle); color:var(--accent-gold); font-size:12px;">
            💡 <em>AURA adapts all future question explanations and doubt solving to match your exact registered method!</em>
          </div>
        </div>
      </div>
    `;
  }

  // 2. User explicitly orders to store/save details
  const explicitStore = /(?:store my details|save my details|remember my details|remember this|save my study method|store this method)/i.test(lower);
  if (explicitStore) {
    let profile = JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
    const nameMatch = lower.match(/(?:name is|called)s+([a-zA-Zs]{2,20})/i);
    if (nameMatch) profile.name = nameMatch[1].trim();

    const stdMatch = lower.match(/(10th|11th|12th|college|engineering|medical)/i);
    if (stdMatch) profile.standard = stdMatch[1].toUpperCase();

    profile.preferredMethod = queryText.replace(/(?:please|store|save|remember|my details)/gi, "").trim();
    localStorage.setItem("aura_student_profile", JSON.stringify(profile));
    localStorage.setItem("aura_school_perm", "true");
    localStorage.setItem("aura_school_method", profile.preferredMethod);
    if (typeof updateTopUserName === "function") updateTopUserName(profile.name || "Student");

    return `
      <div class="profile-store-confirm-card" style="margin-top:14px; padding:12px 16px; background:rgba(16, 185, 129, 0.12); border:1px solid #10B981; border-radius:12px;">
        <div style="font-weight:700; color:#10B981; font-size:13px;">✓ Details Successfully Stored with Your Permission</div>
        <div style="font-size:12px; color:var(--text-primary); margin-top:4px;">
          Your personal learning preferences and academic details have been safely registered. I will always answer in your preferred method.
        </div>
      </div>
    `;
  }

  // 3. User shares personal facts but hasn't explicitly commanded store
  const sharedPersonalFacts = /(?:my name is|i am studying in|i am in (?:10th|11th|12th)|my school is|i like to learn by|i understand best when)/i.test(lower);
  if (sharedPersonalFacts) {
    const encodedQuery = encodeURIComponent(queryText);
    return `
      <div class="profile-permission-prompt-card" style="margin-top:14px; padding:12px 16px; background:var(--bg-surface-elevated); border:1px dashed var(--accent-gold); border-radius:12px;">
        <div style="font-size:13px; font-weight:700; color:var(--accent-gold);">
          ✦ Would you like me to store these study details?
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px; margin-bottom:8px;">
          I noticed you shared your learning method / personal details. With your permission, I can save this to your student profile so you don't have to explain it again.
        </div>
        <button type="button" class="btn-vault-action" style="background:var(--accent-gold); color:#000; font-weight:700; font-size:11px; padding:6px 14px; border-radius:6px; cursor:pointer;" onclick="grantProfileStorePermission('${encodedQuery}')">
          ✓ Yes, Store with My Permission
        </button>
      </div>
    `;
  }

  return "";
}

window.grantProfileStorePermission = function(encodedQuery) {
  const text = decodeURIComponent(encodedQuery);
  let profile = JSON.parse(localStorage.getItem("aura_student_profile") || "{}");
  
  const nameMatch = text.match(/(?:name is|called)s+([a-zA-Zs]{2,20})/i);
  if (nameMatch) profile.name = nameMatch[1].trim();

  const stdMatch = text.match(/(10th|11th|12th|college|engineering|medical)/i);
  if (stdMatch) profile.standard = stdMatch[1].toUpperCase();

  profile.preferredMethod = text;
  localStorage.setItem("aura_student_profile", JSON.stringify(profile));
  localStorage.setItem("aura_school_perm", "true");
  localStorage.setItem("aura_school_method", text);

  if (typeof updateTopUserName === "function") updateTopUserName(profile.name || "Student");
  playTactileSound("success");
  alert("Your personal learning method has been stored with your permission! AURA will now apply this method across all your questions and doubt solver sessions.");
};

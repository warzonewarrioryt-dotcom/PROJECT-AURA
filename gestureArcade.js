/* =========================================================
   PROJECT AURA 3.0 — AURA GESTURE ARCADE & NEURO-GYM
   Architecture: Real-Time Hand Landmark Tracking & Game Engine
   Powered by: Google MediaPipe Hands CDN & HTML5 High-DPI Canvas
   Features: 11 Exhaustive Games across 4 Categories + Simulator Fallback
========================================================= */

"use strict";

(function () {
  // ── SOUND SYNTHESIS ENGINE (Web Audio API) ──
  class ArcadeAudioSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) this.ctx = new AudioClass();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    playTone(freq, type = "sine", duration = 0.15, gainVal = 0.18) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (_) {}
    }

    playPop() { this.playTone(520, "triangle", 0.09, 0.22); }
    playSlice() { this.playTone(880, "sawtooth", 0.08, 0.15); }
    playStrike() { this.playTone(180, "square", 0.12, 0.25); }
    playScore() { this.playTone(659.25, "sine", 0.15, 0.2); }
    playWin() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        setTimeout(() => this.playTone(f, "triangle", 0.22, 0.2), i * 80);
      });
    }
    playWrong() { this.playTone(130, "sawtooth", 0.25, 0.2); }
    playPianoNote(index) {
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
      const freq = scale[Math.min(index, scale.length - 1)];
      this.playTone(freq, "sine", 0.45, 0.25);
    }
  }

  const audio = new ArcadeAudioSynth();

  // ── GAME ROSTER DATA ──
  const GAME_ROSTER = [
    // A. Brain & Academic Gym
    {
      id: "formula-slicer",
      title: "Formula Slicer",
      category: "brain",
      categoryName: "Brain & Academic",
      icon: "⚔️",
      accent: "#00f0ff",
      gestureBadge: "Swipe Blade",
      gestureIcon: "🖐️",
      difficulty: "Medium",
      diffClass: "diff-medium",
      desc: "Fast-flying math solutions! Swipe your hand blade to cut the correct algebraic results while dodging false answers."
    },
    {
      id: "periodic-collector",
      title: "Periodic Collector",
      category: "brain",
      categoryName: "Brain & Academic",
      icon: "🧪",
      accent: "#10b981",
      gestureBadge: "Cup Hand / Palm",
      gestureIcon: "🤲",
      difficulty: "Easy",
      diffClass: "diff-easy",
      desc: "Chemical elements rain from above. Position your open cupped palm to guide the magnetic beaker and harvest targeted elements."
    },
    {
      id: "equation-balance",
      title: "Equation Balance",
      category: "brain",
      categoryName: "Brain & Academic",
      icon: "⚖️",
      accent: "#f59e0b",
      gestureBadge: "Dual Hand Heights",
      gestureIcon: "👐",
      difficulty: "Hard",
      diffClass: "diff-hard",
      desc: "Equilibrium physics scale! Balance linear algebraic equations by independently adjusting your Left and Right hand elevations."
    },

    // B. Reflex & Arcade Action
    {
      id: "neon-pong",
      title: "Aura Neon Pong",
      category: "reflex",
      categoryName: "Reflex & Arcade",
      icon: "🏓",
      accent: "#00f0ff",
      gestureBadge: "Vertical Palm",
      gestureIcon: "✋",
      difficulty: "Medium",
      diffClass: "diff-medium",
      desc: "Futuristic neon pong. Glide your palm vertically to steer your glowing energy paddle against a self-adapting neural AI."
    },
    {
      id: "target-pop",
      title: "Target Pop",
      category: "reflex",
      categoryName: "Reflex & Arcade",
      icon: "🎯",
      accent: "#ec4899",
      gestureBadge: "Index + Thumb Pinch",
      gestureIcon: "🤏",
      difficulty: "Medium",
      diffClass: "diff-medium",
      desc: "Timed bubble clusters appear in cyberspace. Move your index crosshair and pinch your thumb and index together to pop targets!"
    },
    {
      id: "asteroid-steer",
      title: "Asteroid Hand Steer",
      category: "reflex",
      categoryName: "Reflex & Arcade",
      icon: "🚀",
      accent: "#f59e0b",
      gestureBadge: "Flat Hand Tilt",
      gestureIcon: "📐",
      difficulty: "Hard",
      diffClass: "diff-hard",
      desc: "Cosmic void starship navigation. Tilt your flat hand left and right to steer through asteroid fields and warp energy rings."
    },
    {
      id: "shadow-strike",
      title: "Shadow Strike",
      category: "reflex",
      categoryName: "Reflex & Arcade",
      icon: "⚡",
      accent: "#ef4444",
      gestureBadge: "Punch / Chop",
      gestureIcon: "✊",
      difficulty: "Pro",
      diffClass: "diff-pro",
      desc: "Rapid-fire reflex targets! Execute swift punches and karate chops toward on-screen holographic threat nodes before they vanish."
    },

    // C. Strategy & Precision
    {
      id: "finger-maze",
      title: "Finger Maze Runner",
      category: "strategy",
      categoryName: "Strategy & Precision",
      icon: "🌀",
      accent: "#8b5cf6",
      gestureBadge: "Fingertip Tracer",
      gestureIcon: "☝️",
      difficulty: "Hard",
      diffClass: "diff-hard",
      desc: "Electrified cyber labyrinth. Guide your index fingertip through narrow neon pathways from Start to Exit without contacting walls."
    },
    {
      id: "rock-paper-scissors",
      title: "Rock-Paper-Scissors AI",
      category: "strategy",
      categoryName: "Strategy & Precision",
      icon: "✊",
      accent: "#00f0ff",
      gestureBadge: "Classifier ✊✋✌️",
      gestureIcon: "✌️",
      difficulty: "Easy",
      diffClass: "diff-easy",
      desc: "Neural gesture recognition! Show Rock, Paper, or Scissors to your webcam in timed battle rounds against Project Aura AI."
    },
    {
      id: "zen-stargazer",
      title: "Zen Stargazer",
      category: "strategy",
      categoryName: "Strategy & Precision",
      icon: "✨",
      accent: "#38bdf8",
      gestureBadge: "Star Dot Tracer",
      gestureIcon: "⭐",
      difficulty: "Medium",
      diffClass: "diff-medium",
      desc: "Cosmic constellation mapping. Trace glowing interstellar stars in sequential order using your index finger to form celestial art."
    },

    // D. Rhythm & Audio
    {
      id: "air-piano",
      title: "Air Piano / Beat Tapper",
      category: "rhythm",
      categoryName: "Rhythm & Audio",
      icon: "🎹",
      accent: "#10b981",
      gestureBadge: "5-Finger Piano",
      gestureIcon: "🎶",
      difficulty: "Easy",
      diffClass: "diff-easy",
      desc: "Air synthesizer! 5-finger landmarks map to harmonic pentatonic scale keys. Play melodies in free mode or hit rhythmic beats."
    }
  ];

  // ── HIGH SCORE STORAGE ──
  function getHighScores() {
    try {
      return JSON.parse(localStorage.getItem("aura_arcade_highscores") || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveHighScore(gameId, score) {
    const scores = getHighScores();
    if (!scores[gameId] || score > scores[gameId]) {
      scores[gameId] = score;
      localStorage.setItem("aura_arcade_highscores", JSON.stringify(scores));
      updateHubStats();
      return true;
    }
    return false;
  }

  // ── MASTER TRACKING STATE ──
  const trackingState = {
    cameraActive: false,
    simulatorMode: false,
    cameraInitialized: false,
    handsDetector: null,
    cameraStream: null,
    lastFrameTime: performance.now(),
    fps: 60,
    fpsHistory: [],
    
    // Detected Hand Landmarks
    // Hand 1 (Primary):
    hand1: {
      detected: false,
      handedness: "Right",
      landmarks: null,
      palmX: 0.5,
      palmY: 0.5,
      indexTipX: 0.5,
      indexTipY: 0.5,
      thumbTipX: 0.5,
      thumbTipY: 0.5,
      isPinching: false,
      pinchDist: 1.0,
      tiltAngle: 0, // In degrees
      isFist: false,
      isOpenPalm: false,
      isScissors: false,
      velocity: 0,
      lastX: 0.5,
      lastY: 0.5,
      fingerHeights: [0.5, 0.5, 0.5, 0.5, 0.5] // Thumb to pinky
    },
    // Hand 2 (Secondary, for dual-hand balance):
    hand2: {
      detected: false,
      handedness: "Left",
      landmarks: null,
      palmX: 0.25,
      palmY: 0.5
    },

    // Mouse / Touch Simulation
    simMouseX: 0.5,
    simMouseY: 0.5,
    simIsDown: false,
    simTilt: 0,
    simHand2Y: 0.5
  };

  // ── MEDIAPIPE HANDS INITIALIZATION ──
  function initMediaPipeHands() {
    if (typeof window.Hands === "undefined") {
      console.warn("[GESTURE ARCADE] MediaPipe Hands CDN not loaded. Fallback to simulator mode available.");
      return false;
    }

    try {
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onHandResults);
      trackingState.handsDetector = hands;
      return true;
    } catch (err) {
      console.error("[GESTURE ARCADE] MediaPipe Init Error:", err);
      return false;
    }
  }

  // ── WEBCAM START & CAMERA UTILS PIPELINE ──
  async function startWebcam() {
    const video = document.getElementById("gestureWebcamVideo");
    if (!video) return;

    if (!trackingState.handsDetector) {
      const ok = initMediaPipeHands();
      if (!ok) {
        enableSimulatorMode();
        return;
      }
    }

    try {
      if (typeof window.Camera !== "undefined") {
        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (trackingState.handsDetector && video.readyState >= 2) {
              await trackingState.handsDetector.send({ image: video });
            }
          },
          width: 640,
          height: 480
        });
        await camera.start();
        trackingState.cameraActive = true;
        trackingState.cameraStream = camera;
      } else {
        // Native getUserMedia Fallback
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
        });
        video.srcObject = stream;
        await video.play();
        trackingState.cameraActive = true;

        const processFrame = async () => {
          if (trackingState.cameraActive && trackingState.handsDetector && video.readyState >= 2) {
            await trackingState.handsDetector.send({ image: video });
            requestAnimationFrame(processFrame);
          }
        };
        requestAnimationFrame(processFrame);
      }

      updateWebcamStatusUI(true, "🟢 Camera Active (60 FPS)");
    } catch (err) {
      console.warn("[GESTURE ARCADE] Webcam access denied or unavailable:", err.message);
      enableSimulatorMode("Camera access blocked. Simulator Mode active.");
    }
  }

  function stopWebcam() {
    trackingState.cameraActive = false;
    const video = document.getElementById("gestureWebcamVideo");
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    updateWebcamStatusUI(false, "⚪ Camera Standby");
  }

  function enableSimulatorMode(reason) {
    trackingState.simulatorMode = true;
    updateWebcamStatusUI(false, "🖱️ Simulator Mode (Active)");
    const simBadge = document.getElementById("arcadeSimModeBtn");
    if (simBadge) simBadge.classList.add("active-sim");
    if (reason) console.info("[GESTURE ARCADE]", reason);
  }

  function toggleSimulatorMode() {
    trackingState.simulatorMode = !trackingState.simulatorMode;
    const simBadge = document.getElementById("arcadeSimModeBtn");
    if (trackingState.simulatorMode) {
      if (simBadge) simBadge.classList.add("active-sim");
      updateWebcamStatusUI(false, "🖱️ Simulator Mode (Active)");
    } else {
      if (simBadge) simBadge.classList.remove("active-sim");
      startWebcam();
    }
  }

  function updateWebcamStatusUI(isActive, label) {
    const statusText = document.getElementById("arcadeCamStatusLabel");
    const statusDot = document.getElementById("arcadeCamStatusDot");
    if (statusText) statusText.textContent = label;
    if (statusDot) {
      statusDot.className = "arcade-status-dot " + (isActive ? "active" : (trackingState.simulatorMode ? "standby" : ""));
    }
  }

  // ── MEDIAPIPE RESULTS PROCESSOR & CLASSIFIER ──
  function onHandResults(results) {
    calculateFPS();

    const skeletonCanvas = document.getElementById("gestureSkeletonCanvas");
    let ctx = null;
    if (skeletonCanvas) {
      if (skeletonCanvas.width !== skeletonCanvas.clientWidth) {
        skeletonCanvas.width = skeletonCanvas.clientWidth || 320;
        skeletonCanvas.height = skeletonCanvas.clientHeight || 240;
      }
      ctx = skeletonCanvas.getContext("2d");
      ctx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
    }

    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      trackingState.hand1.detected = false;
      trackingState.hand2.detected = false;
      updateCornerHudLabel("Searching for hands...");
      return;
    }

    // Process Primary Hand (Hand 0)
    const landmarks1 = results.multiHandLandmarks[0];
    const handedness1 = results.multiHandedness && results.multiHandedness[0] ? results.multiHandedness[0].label : "Right";
    processSingleHand(landmarks1, handedness1, trackingState.hand1, ctx, skeletonCanvas);

    // Process Secondary Hand if present (Hand 1)
    if (results.multiHandLandmarks.length > 1) {
      const landmarks2 = results.multiHandLandmarks[1];
      const handedness2 = results.multiHandedness && results.multiHandedness[1] ? results.multiHandedness[1].label : "Left";
      processSingleHand(landmarks2, handedness2, trackingState.hand2, ctx, skeletonCanvas, true);
    } else {
      trackingState.hand2.detected = false;
    }

    // Update Corner HUD Label
    const h1 = trackingState.hand1;
    let gestureName = "Tracking";
    if (h1.isPinching) gestureName = "Pinch 🤏";
    else if (h1.isFist) gestureName = "Fist ✊";
    else if (h1.isScissors) gestureName = "Scissors ✌️";
    else if (h1.isOpenPalm) gestureName = "Open Palm ✋";

    updateCornerHudLabel(`${h1.handedness} Hand: ${gestureName}`);
  }

  function processSingleHand(lm, handedness, stateObj, ctx, canvas, isSecond = false) {
    stateObj.detected = true;
    stateObj.handedness = handedness;
    stateObj.landmarks = lm;

    // Mirrored coordinates: x = 1 - lm[i].x
    const wrist = lm[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const middleTip = lm[12];
    const ringTip = lm[16];
    const pinkyTip = lm[20];

    const indexPip = lm[6];
    const middlePip = lm[10];
    const ringPip = lm[14];
    const pinkyPip = lm[18];

    // Compute coordinates (mirrored horizontally)
    stateObj.palmX = 1 - lm[9].x;
    stateObj.palmY = lm[9].y;
    stateObj.indexTipX = 1 - indexTip.x;
    stateObj.indexTipY = indexTip.y;
    stateObj.thumbTipX = 1 - thumbTip.x;
    stateObj.thumbTipY = thumbTip.y;

    // Velocity estimation
    const dx = stateObj.palmX - stateObj.lastX;
    const dy = stateObj.palmY - stateObj.lastY;
    stateObj.velocity = Math.sqrt(dx * dx + dy * dy);
    stateObj.lastX = stateObj.palmX;
    stateObj.lastY = stateObj.palmY;

    // Pinch distance (Thumb tip to Index tip in 3D Euclidean distance)
    const pinchDx = thumbTip.x - indexTip.x;
    const pinchDy = thumbTip.y - indexTip.y;
    const pinchDz = (thumbTip.z || 0) - (indexTip.z || 0);
    stateObj.pinchDist = Math.sqrt(pinchDx * pinchDx + pinchDy * pinchDy + pinchDz * pinchDz);
    stateObj.isPinching = stateObj.pinchDist < 0.085;

    // Hand Tilt angle (wrist landmark 0 to middle mcp landmark 9)
    const angleRad = Math.atan2(lm[9].y - wrist.y, lm[9].x - wrist.x);
    stateObj.tiltAngle = (angleRad * 180) / Math.PI;

    // Finger extensions test
    const indexExtended = indexTip.y < indexPip.y;
    const middleExtended = middleTip.y < middlePip.y;
    const ringExtended = ringTip.y < ringPip.y;
    const pinkyExtended = pinkyTip.y < pinkyPip.y;

    stateObj.isFist = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
    stateObj.isOpenPalm = indexExtended && middleExtended && ringExtended && pinkyExtended;
    stateObj.isScissors = indexExtended && middleExtended && !ringExtended && !pinkyExtended;

    // 5-Finger Heights
    stateObj.fingerHeights = [thumbTip.y, indexTip.y, middleTip.y, ringTip.y, pinkyTip.y];

    // Draw Skeleton on Corner HUD
    if (ctx && canvas) {
      drawHandSkeleton(ctx, canvas, lm, stateObj.isPinching || stateObj.isFist, isSecond);
    }
  }

  function drawHandSkeleton(ctx, canvas, lm, isAction, isSecond) {
    const w = canvas.width;
    const h = canvas.height;

    // Connections between landmarks (MediaPipe Hand topology)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [9, 13], [13, 14], [14, 15], [15, 16],// Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17]                               // Palm Base
    ];

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isAction ? "#f59e0b" : (isSecond ? "#00f0ff" : "#10b981");
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;

    // Draw Bone Lines
    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(lm[i].x * w, lm[i].y * h);
      ctx.lineTo(lm[j].x * w, lm[j].y * h);
      ctx.stroke();
    });

    // Draw Joints
    for (let i = 0; i < lm.length; i++) {
      ctx.beginPath();
      const r = (i === 4 || i === 8 || i === 12 || i === 16 || i === 20) ? 5 : 3;
      ctx.arc(lm[i].x * w, lm[i].y * h, r, 0, Math.PI * 2);
      ctx.fillStyle = (i === 4 || i === 8) && isAction ? "#f59e0b" : "#ffffff";
      ctx.fill();
    }

    ctx.restore();
  }

  function updateCornerHudLabel(text) {
    const label = document.getElementById("cornerHudGestureLabel");
    if (label) label.textContent = text;
  }

  function calculateFPS() {
    const now = performance.now();
    const delta = now - trackingState.lastFrameTime;
    trackingState.lastFrameTime = now;
    if (delta > 0) {
      const instantFps = 1000 / delta;
      trackingState.fpsHistory.push(instantFps);
      if (trackingState.fpsHistory.length > 15) trackingState.fpsHistory.shift();
      const avg = trackingState.fpsHistory.reduce((a, b) => a + b, 0) / trackingState.fpsHistory.length;
      trackingState.fps = Math.round(avg);
      const fpsEl = document.getElementById("arenaFpsDisplay");
      if (fpsEl) fpsEl.textContent = `${trackingState.fps} FPS`;
    }
  }

  // ── GAME RUNTIME & ARENA ENGINE ──
  let activeGameInstance = null;
  let activeGameAnimationId = null;

  class BaseGame {
    constructor(canvas, arenaState) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.arenaState = arenaState;
      this.score = 0;
      this.multiplier = 1;
      this.streak = 0;
      this.isPaused = false;
      this.isOver = false;
      this.particles = [];
      this.lastTick = performance.now();
      this.resize();
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width || 800;
      this.height = rect.height || 600;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }

    getPointerPos() {
      if (trackingState.simulatorMode || !trackingState.hand1.detected) {
        return {
          x: trackingState.simMouseX * this.width,
          y: trackingState.simMouseY * this.height,
          rawX: trackingState.simMouseX,
          rawY: trackingState.simMouseY,
          isTrigger: trackingState.simIsDown,
          tilt: trackingState.simTilt,
          hand2Y: trackingState.simHand2Y * this.height
        };
      }
      const h1 = trackingState.hand1;
      const h2 = trackingState.hand2;
      return {
        x: h1.indexTipX * this.width,
        y: h1.indexTipY * this.height,
        palmX: h1.palmX * this.width,
        palmY: h1.palmY * this.height,
        rawX: h1.indexTipX,
        rawY: h1.indexTipY,
        isTrigger: h1.isPinching || h1.velocity > 0.08 || h1.isFist,
        isPinch: h1.isPinching,
        isFist: h1.isFist,
        isOpenPalm: h1.isOpenPalm,
        isScissors: h1.isScissors,
        tilt: h1.tiltAngle,
        velocity: h1.velocity,
        fingerHeights: h1.fingerHeights,
        hand2Y: h2.detected ? h2.palmY * this.height : (trackingState.simHand2Y * this.height)
      };
    }

    addScore(pts) {
      this.streak++;
      if (this.streak > 12) this.multiplier = 8;
      else if (this.streak > 7) this.multiplier = 4;
      else if (this.streak > 3) this.multiplier = 2;
      else this.multiplier = 1;

      this.score += pts * this.multiplier;
      this.updateHud();
    }

    resetStreak() {
      this.streak = 0;
      this.multiplier = 1;
      this.updateHud();
    }

    updateHud() {
      const scoreEl = document.getElementById("arenaScoreDisplay");
      const multEl = document.getElementById("arenaMultiplierDisplay");
      if (scoreEl) scoreEl.textContent = this.score;
      if (multEl) multEl.textContent = `x${this.multiplier}`;
    }

    spawnParticles(x, y, color = "#00f0ff", count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          color,
          alpha: 1.0,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    drawParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    gameOver(title = "GAME COMPLETED") {
      this.isOver = true;
      audio.playWin();
      saveHighScore(this.arenaState.id, this.score);
      showArenaDialog(title, this.score);
    }
  }

  // ── 1. FORMULA SLICER (Brain & Academic) ──
  class FormulaSlicerGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.items = [];
      this.trail = [];
      this.targetEquation = "";
      this.correctAnswer = 0;
      this.nextEquation();
      this.spawnTimer = 0;
    }

    nextEquation() {
      const a = Math.floor(Math.random() * 12) + 2;
      const b = Math.floor(Math.random() * 12) + 2;
      const op = Math.random() > 0.4 ? "×" : "+";
      this.correctAnswer = op === "×" ? a * b : a + b;
      this.targetEquation = `Solve: ${a} ${op} ${b} = ?`;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = `🎯 ${this.targetEquation} (Slice correct result!)`;
    }

    update(dt) {
      const p = this.getPointerPos();

      // Update slice trail
      this.trail.push({ x: p.x, y: p.y, time: performance.now() });
      if (this.trail.length > 12) this.trail.shift();

      // Spawn equation answer bubbles
      this.spawnTimer += dt;
      if (this.spawnTimer > 1.4) {
        this.spawnTimer = 0;
        const isCorrect = Math.random() > 0.45;
        const val = isCorrect ? this.correctAnswer : this.correctAnswer + (Math.floor(Math.random() * 9) + 1) * (Math.random() > 0.5 ? 1 : -1);
        this.items.push({
          x: Math.random() * (this.width - 120) + 60,
          y: this.height + 30,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 4 + 7),
          val,
          isCorrect,
          radius: 36,
          sliced: false
        });
      }

      // Update flying items
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        item.x += item.vx;
        item.y += item.vy;
        item.vy += 0.15; // Gravity

        // Check slice collision with fast moving blade
        if (!item.sliced && this.trail.length > 2) {
          const dist = Math.hypot(p.x - item.x, p.y - item.y);
          const isMovingFast = (p.velocity && p.velocity > 0.02) || trackingState.simIsDown;

          if (dist < item.radius + 15 && isMovingFast) {
            item.sliced = true;
            if (item.isCorrect) {
              audio.playSlice();
              this.spawnParticles(item.x, item.y, "#00f0ff", 24);
              this.addScore(100);
              this.nextEquation();
            } else {
              audio.playWrong();
              this.spawnParticles(item.x, item.y, "#ef4444", 24);
              this.resetStreak();
            }
          }
        }

        if (item.y > this.height + 80) {
          this.items.splice(i, 1);
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw flying answer orbs
      this.items.forEach(item => {
        if (item.sliced) return;
        this.ctx.save();
        this.ctx.shadowColor = item.isCorrect ? "#00f0ff" : "#f59e0b";
        this.ctx.shadowBlur = 16;
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        this.ctx.strokeStyle = item.isCorrect ? "#00f0ff" : "#f59e0b";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 20px 'JetBrains Mono', monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(item.val, item.x, item.y);
        this.ctx.restore();
      });

      // Draw Neon Blade Trail
      if (this.trail.length > 1) {
        this.ctx.save();
        this.ctx.strokeStyle = "#00f0ff";
        this.ctx.shadowColor = "#00f0ff";
        this.ctx.shadowBlur = 18;
        this.ctx.lineCap = "round";
        for (let i = 1; i < this.trail.length; i++) {
          this.ctx.lineWidth = i * 1.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
          this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      this.drawParticles();
    }
  }

  // ── 2. PERIODIC COLLECTOR (Brain & Academic) ──
  class PeriodicCollectorGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.elements = [];
      this.targetSeries = "Precious Elements (Au, Ag, Pt)";
      this.targets = ["Au", "Ag", "Pt"];
      this.hazards = ["U", "Pu", "Pb"];
      this.beakerWidth = 110;
      this.beakerHeight = 50;
      this.beakerX = this.width / 2;
      this.spawnTimer = 0;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "🧪 Catch Au, Ag, Pt in beaker! Avoid radioactive U & Pu.";
    }

    update(dt) {
      const p = this.getPointerPos();
      const targetX = p.palmX || p.x;
      this.beakerX += (targetX - this.beakerX) * 0.2; // Smooth tracking

      this.spawnTimer += dt;
      if (this.spawnTimer > 0.9) {
        this.spawnTimer = 0;
        const all = [...this.targets, ...this.hazards, "Fe", "Cu", "Zn"];
        const sym = all[Math.floor(Math.random() * all.length)];
        const isTarget = this.targets.includes(sym);
        const isHazard = this.hazards.includes(sym);

        this.elements.push({
          x: Math.random() * (this.width - 80) + 40,
          y: -20,
          vy: Math.random() * 2 + 3,
          sym,
          isTarget,
          isHazard
        });
      }

      const beakerY = this.height - 70;
      for (let i = this.elements.length - 1; i >= 0; i--) {
        const el = this.elements[i];
        el.y += el.vy;

        // Catch collision
        if (el.y >= beakerY && el.y <= beakerY + this.beakerHeight && Math.abs(el.x - this.beakerX) < this.beakerWidth / 2) {
          if (el.isTarget) {
            audio.playScore();
            this.spawnParticles(el.x, el.y, "#10b981", 16);
            this.addScore(150);
          } else if (el.isHazard) {
            audio.playWrong();
            this.spawnParticles(el.x, el.y, "#ef4444", 20);
            this.resetStreak();
          } else {
            this.addScore(25);
          }
          this.elements.splice(i, 1);
          continue;
        }

        if (el.y > this.height + 30) {
          this.elements.splice(i, 1);
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw Beaker
      const beakerY = this.height - 70;
      this.ctx.save();
      this.ctx.strokeStyle = "#10b981";
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = "#10b981";
      this.ctx.shadowBlur = 16;
      this.ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      this.ctx.beginPath();
      this.ctx.roundRect(this.beakerX - this.beakerWidth / 2, beakerY, this.beakerWidth, this.beakerHeight, [0, 0, 16, 16]);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = "#10b981";
      this.ctx.font = "bold 13px 'JetBrains Mono', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("🧪 BEAKER", this.beakerX, beakerY + 30);
      this.ctx.restore();

      // Draw Falling Elements
      this.elements.forEach(el => {
        this.ctx.save();
        const color = el.isTarget ? "#10b981" : (el.isHazard ? "#ef4444" : "#94a3b8");
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(el.x, el.y, 24, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = color;
        this.ctx.font = "bold 16px 'JetBrains Mono', monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(el.sym, el.x, el.y);
        this.ctx.restore();
      });

      this.drawParticles();
    }
  }

  // ── 3. EQUATION BALANCE (Brain & Academic) ──
  class EquationBalanceGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.targetVal = 6;
      this.equationText = "Balance: 3x + 6 = 24  =>  x = 6";
      this.balanceHoldTime = 0;
      this.scaleAngle = 0;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "⚖️ Raise/lower Left & Right hands to level the scale!";
    }

    update(dt) {
      const p = this.getPointerPos();
      const leftY = p.y;
      const rightY = p.hand2Y;

      // Delta height drives scale tilt
      const diff = (leftY - rightY) / this.height;
      this.scaleAngle += (diff * 0.8 - this.scaleAngle) * 0.15;

      // Balance check
      if (Math.abs(this.scaleAngle) < 0.05) {
        this.balanceHoldTime += dt;
        if (this.balanceHoldTime > 2.0) {
          audio.playWin();
          this.spawnParticles(this.width / 2, this.height / 2, "#f59e0b", 30);
          this.addScore(250);
          this.balanceHoldTime = 0;
          this.nextPuzzle();
        }
      } else {
        this.balanceHoldTime = Math.max(0, this.balanceHoldTime - dt * 2);
      }
    }

    nextPuzzle() {
      const x = Math.floor(Math.random() * 8) + 2;
      const a = Math.floor(Math.random() * 4) + 2;
      const b = Math.floor(Math.random() * 10) + 2;
      const total = a * x + b;
      this.equationText = `Balance: ${a}x + ${b} = ${total}  =>  Hold Level!`;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = `⚖️ ${this.equationText}`;
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      const cx = this.width / 2;
      const cy = this.height / 2 + 40;
      const beamLen = Math.min(this.width * 0.55, 360);

      this.ctx.save();
      // Draw Central Fulcrum
      this.ctx.fillStyle = "#334155";
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(cx - 30, cy + 80);
      this.ctx.lineTo(cx + 30, cy + 80);
      this.ctx.closePath();
      this.ctx.fill();

      // Draw Rotating Beam
      this.ctx.translate(cx, cy);
      this.ctx.rotate(this.scaleAngle);

      this.ctx.strokeStyle = Math.abs(this.scaleAngle) < 0.05 ? "#10b981" : "#f59e0b";
      this.ctx.shadowColor = this.ctx.strokeStyle;
      this.ctx.shadowBlur = 14;
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(-beamLen / 2, 0);
      this.ctx.lineTo(beamLen / 2, 0);
      this.ctx.stroke();

      // Left & Right Scale Pans
      [-beamLen / 2, beamLen / 2].forEach((xPos, idx) => {
        this.ctx.beginPath();
        this.ctx.moveTo(xPos, 0);
        this.ctx.lineTo(xPos, 60);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(xPos, 60, 40, 0, Math.PI);
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 13px 'JetBrains Mono', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(idx === 0 ? "LEFT HAND" : "RIGHT HAND", xPos, 80);
      });

      this.ctx.restore();

      // Balance Meter
      const meterWidth = 240;
      const meterX = cx - meterWidth / 2;
      const meterY = 80;
      this.ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
      this.ctx.strokeStyle = "#475569";
      this.ctx.roundRect(meterX, meterY, meterWidth, 18, 9);
      this.ctx.fill();
      this.ctx.stroke();

      const holdProgress = Math.min(1.0, this.balanceHoldTime / 2.0);
      this.ctx.fillStyle = "#10b981";
      this.ctx.roundRect(meterX, meterY, meterWidth * holdProgress, 18, 9);
      this.ctx.fill();

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 13px 'JetBrains Mono', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(holdProgress > 0 ? `HOLDING LEVEL: ${Math.round(holdProgress * 100)}%` : "LEVEL THE BALANCE BEAM", cx, meterY - 10);

      this.drawParticles();
    }
  }

  // ── 4. AURA NEON PONG (Reflex & Arcade) ──
  class NeonPongGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.paddleHeight = 110;
      this.paddleWidth = 14;
      this.playerY = this.height / 2;
      this.aiY = this.height / 2;
      this.ballX = this.width / 2;
      this.ballY = this.height / 2;
      this.ballVx = 5;
      this.ballVy = 3;
      this.ballRadius = 9;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "🏓 Move your palm vertically to return the neon ball!";
    }

    update(dt) {
      const p = this.getPointerPos();
      const targetY = p.palmY || p.y;
      this.playerY += (targetY - this.playerY) * 0.25;

      // Ball Physics
      this.ballX += this.ballVx;
      this.ballY += this.ballVy;

      // Wall Bounces
      if (this.ballY <= this.ballRadius || this.ballY >= this.height - this.ballRadius) {
        this.ballVy *= -1;
        audio.playPop();
        this.spawnParticles(this.ballX, this.ballY, "#00f0ff", 6);
      }

      // AI Tracking
      const aiSpeed = 3.6;
      if (this.aiY + this.paddleHeight / 2 < this.ballY) this.aiY += aiSpeed;
      else this.aiY -= aiSpeed;

      // Player Paddle Hit
      const pPaddleX = 35;
      if (this.ballX - this.ballRadius <= pPaddleX + this.paddleWidth && this.ballX >= pPaddleX) {
        if (this.ballY >= this.playerY - this.paddleHeight / 2 && this.ballY <= this.playerY + this.paddleHeight / 2) {
          this.ballVx = Math.abs(this.ballVx) * 1.05; // Accelerate
          audio.playPop();
          this.spawnParticles(this.ballX, this.ballY, "#00f0ff", 14);
          this.addScore(50);
        }
      }

      // AI Paddle Hit
      const aiPaddleX = this.width - 35 - this.paddleWidth;
      if (this.ballX + this.ballRadius >= aiPaddleX && this.ballX <= aiPaddleX + this.paddleWidth) {
        if (this.ballY >= this.aiY - this.paddleHeight / 2 && this.ballY <= this.aiY + this.paddleHeight / 2) {
          this.ballVx = -Math.abs(this.ballVx);
          audio.playPop();
          this.spawnParticles(this.ballX, this.ballY, "#ec4899", 10);
        }
      }

      // Goal Scored
      if (this.ballX < 0) {
        audio.playWrong();
        this.resetStreak();
        this.resetBall(1);
      } else if (this.ballX > this.width) {
        audio.playScore();
        this.addScore(200);
        this.resetBall(-1);
      }
    }

    resetBall(dir) {
      this.ballX = this.width / 2;
      this.ballY = this.height / 2;
      this.ballVx = dir * 5;
      this.ballVy = (Math.random() - 0.5) * 6;
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Center Line
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      this.ctx.setLineDash([8, 8]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.width / 2, 0);
      this.ctx.lineTo(this.width / 2, this.height);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Player Paddle
      this.ctx.save();
      this.ctx.fillStyle = "#00f0ff";
      this.ctx.shadowColor = "#00f0ff";
      this.ctx.shadowBlur = 18;
      this.ctx.beginPath();
      this.ctx.roundRect(35, this.playerY - this.paddleHeight / 2, this.paddleWidth, this.paddleHeight, 6);
      this.ctx.fill();

      // AI Paddle
      this.ctx.fillStyle = "#ec4899";
      this.ctx.shadowColor = "#ec4899";
      this.ctx.beginPath();
      this.ctx.roundRect(this.width - 35 - this.paddleWidth, this.aiY - this.paddleHeight / 2, this.paddleWidth, this.paddleHeight, 6);
      this.ctx.fill();

      // Neon Ball
      this.ctx.fillStyle = "#ffffff";
      this.ctx.shadowColor = "#00f0ff";
      this.ctx.shadowBlur = 20;
      this.ctx.beginPath();
      this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      this.drawParticles();
    }
  }

  // ── 5. TARGET POP (Reflex & Arcade) ──
  class TargetPopGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.targets = [];
      this.spawnTimer = 0;
      this.wasPinching = false;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "🎯 Move index finger & pinch thumb+index to pop glowing targets!";
    }

    update(dt) {
      const p = this.getPointerPos();

      this.spawnTimer += dt;
      if (this.spawnTimer > 0.8) {
        this.spawnTimer = 0;
        this.targets.push({
          x: Math.random() * (this.width - 120) + 60,
          y: Math.random() * (this.height - 120) + 60,
          radius: 36,
          life: 2.5,
          maxLife: 2.5
        });
      }

      const justPinched = p.isTrigger && !this.wasPinching;
      this.wasPinching = p.isTrigger;

      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        t.life -= dt;

        if (justPinched) {
          const dist = Math.hypot(p.x - t.x, p.y - t.y);
          if (dist < t.radius) {
            audio.playPop();
            this.spawnParticles(t.x, t.y, "#ec4899", 20);
            this.addScore(100);
            this.targets.splice(i, 1);
            continue;
          }
        }

        if (t.life <= 0) {
          this.targets.splice(i, 1);
          this.resetStreak();
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const p = this.getPointerPos();

      // Draw Targets
      this.targets.forEach(t => {
        const pct = t.life / t.maxLife;
        this.ctx.save();
        this.ctx.strokeStyle = "#ec4899";
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = "#ec4899";
        this.ctx.shadowBlur = 14;
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, t.radius * pct, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(236, 72, 153, 0.25)";
        this.ctx.fill();
        this.ctx.restore();
      });

      // Draw Index Reticle Crosshair
      this.ctx.save();
      this.ctx.strokeStyle = p.isTrigger ? "#f59e0b" : "#00f0ff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.isTrigger ? 12 : 20, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      this.drawParticles();
    }
  }

  // ── 6. ASTEROID HAND STEER (Reflex & Arcade) ──
  class AsteroidSteerGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.shipX = this.width / 2;
      this.shipY = this.height - 90;
      this.asteroids = [];
      this.stars = [];
      for (let i = 0; i < 40; i++) {
        this.stars.push({ x: Math.random() * this.width, y: Math.random() * this.height, speed: Math.random() * 3 + 1 });
      }
      this.spawnTimer = 0;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "🚀 Tilt your flat hand left/right to steer ship through asteroid field!";
    }

    update(dt) {
      const p = this.getPointerPos();

      // Tilt steering
      const tiltNorm = Math.max(-1, Math.min(1, p.tilt / 30));
      this.shipX += tiltNorm * 7;
      this.shipX = Math.max(30, Math.min(this.width - 30, this.shipX));

      // Stars warp
      this.stars.forEach(s => {
        s.y += s.speed;
        if (s.y > this.height) s.y = 0;
      });

      this.spawnTimer += dt;
      if (this.spawnTimer > 0.6) {
        this.spawnTimer = 0;
        this.asteroids.push({
          x: Math.random() * (this.width - 60) + 30,
          y: -30,
          vy: Math.random() * 3 + 4,
          radius: Math.random() * 16 + 18
        });
      }

      for (let i = this.asteroids.length - 1; i >= 0; i--) {
        const a = this.asteroids[i];
        a.y += a.vy;

        // Ship collision
        const dist = Math.hypot(this.shipX - a.x, this.shipY - a.y);
        if (dist < a.radius + 18) {
          audio.playStrike();
          this.spawnParticles(this.shipX, this.shipY, "#ef4444", 24);
          this.resetStreak();
          this.asteroids.splice(i, 1);
          continue;
        }

        if (a.y > this.height + 40) {
          this.addScore(20);
          this.asteroids.splice(i, 1);
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Starfield
      this.ctx.fillStyle = "#ffffff";
      this.stars.forEach(s => {
        this.ctx.fillRect(s.x, s.y, 1.5, 1.5);
      });

      // Asteroids
      this.asteroids.forEach(a => {
        this.ctx.save();
        this.ctx.fillStyle = "#334155";
        this.ctx.strokeStyle = "#f59e0b";
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = "#f59e0b";
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      });

      // Spaceship
      this.ctx.save();
      this.ctx.translate(this.shipX, this.shipY);
      this.ctx.fillStyle = "#00f0ff";
      this.ctx.shadowColor = "#00f0ff";
      this.ctx.shadowBlur = 18;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -22);
      this.ctx.lineTo(-16, 16);
      this.ctx.lineTo(16, 16);
      this.ctx.closePath();
      this.ctx.fill();

      // Engine Thruster
      this.ctx.fillStyle = "#f59e0b";
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 16);
      this.ctx.lineTo(0, 26 + Math.random() * 8);
      this.ctx.lineTo(6, 16);
      this.ctx.fill();
      this.ctx.restore();

      this.drawParticles();
    }
  }

  // ── 7. SHADOW STRIKE (Reflex & Arcade) ──
  class ShadowStrikeGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.enemies = [];
      this.spawnTimer = 0;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "⚡ Execute fast punches / chops on threat nodes before they vanish!";
    }

    update(dt) {
      const p = this.getPointerPos();

      this.spawnTimer += dt;
      if (this.spawnTimer > 1.0) {
        this.spawnTimer = 0;
        this.enemies.push({
          x: Math.random() * (this.width - 160) + 80,
          y: Math.random() * (this.height - 160) + 80,
          timer: 1.2,
          maxTimer: 1.2
        });
      }

      const isStriking = (p.velocity && p.velocity > 0.05) || p.isFist || trackingState.simIsDown;

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.timer -= dt;

        if (isStriking) {
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist < 45) {
            audio.playStrike();
            this.spawnParticles(e.x, e.y, "#ef4444", 24);
            this.addScore(150);
            this.enemies.splice(i, 1);
            continue;
          }
        }

        if (e.timer <= 0) {
          this.enemies.splice(i, 1);
          this.resetStreak();
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const p = this.getPointerPos();

      this.enemies.forEach(e => {
        const pct = e.timer / e.maxTimer;
        this.ctx.save();
        this.ctx.strokeStyle = "#ef4444";
        this.ctx.shadowColor = "#ef4444";
        this.ctx.shadowBlur = 18;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(e.x - 35, e.y - 35, 70, 70);

        this.ctx.fillStyle = `rgba(239, 68, 68, ${pct * 0.4})`;
        this.ctx.fillRect(e.x - 35, e.y - 35, 70, 70);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 18px 'JetBrains Mono', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("STRIKE!", e.x, e.y + 6);
        this.ctx.restore();
      });

      // Glove Reticle
      this.ctx.save();
      this.ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      this.drawParticles();
    }
  }

  // ── 8. FINGER MAZE RUNNER (Strategy & Precision) ──
  class FingerMazeRunnerGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.trail = [];
      this.checkpoints = [
        { x: 80, y: 100, label: "START", passed: false },
        { x: 300, y: 100, passed: false },
        { x: 300, y: 450, passed: false },
        { x: 600, y: 450, passed: false },
        { x: 600, y: 180, passed: false },
        { x: 750, y: 180, label: "EXIT", passed: false }
      ];
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "🌀 Guide your index finger along the circuit path without straying!";
    }

    update() {
      const p = this.getPointerPos();
      this.trail.push({ x: p.x, y: p.y });
      if (this.trail.length > 25) this.trail.shift();

      // Check checkpoints
      this.checkpoints.forEach((cp, idx) => {
        if (!cp.passed && Math.hypot(p.x - cp.x, p.y - cp.y) < 30) {
          cp.passed = true;
          audio.playScore();
          this.spawnParticles(cp.x, cp.y, "#8b5cf6", 14);
          this.addScore(100);

          if (idx === this.checkpoints.length - 1) {
            this.gameOver("LABYRINTH CLEARED!");
          }
        }
      });
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw Path Corridor
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
      this.ctx.lineWidth = 55;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.beginPath();
      this.checkpoints.forEach((cp, i) => {
        if (i === 0) this.ctx.moveTo(cp.x, cp.y);
        else this.ctx.lineTo(cp.x, cp.y);
      });
      this.ctx.stroke();

      // Center Guide Wire
      this.ctx.strokeStyle = "#8b5cf6";
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = "#8b5cf6";
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();

      // Draw Checkpoints
      this.checkpoints.forEach(cp => {
        this.ctx.beginPath();
        this.ctx.arc(cp.x, cp.y, 16, 0, Math.PI * 2);
        this.ctx.fillStyle = cp.passed ? "#10b981" : "#8b5cf6";
        this.ctx.fill();

        if (cp.label) {
          this.ctx.fillStyle = "#ffffff";
          this.ctx.font = "bold 13px 'JetBrains Mono', monospace";
          this.ctx.fillText(cp.label, cp.x - 18, cp.y - 24);
        }
      });
      this.ctx.restore();

      // Fingertip Tracer
      const p = this.getPointerPos();
      this.ctx.save();
      this.ctx.fillStyle = "#00f0ff";
      this.ctx.shadowColor = "#00f0ff";
      this.ctx.shadowBlur = 16;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      this.drawParticles();
    }
  }

  // ── 9. ROCK-PAPER-SCISSORS AI (Strategy & Precision) ──
  class RockPaperScissorsGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.roundState = "countdown"; // countdown, shoot, result
      this.timer = 3.0;
      this.aiChoice = "";
      this.userChoice = "";
      this.roundResult = "";
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "✊ Show Rock ✊, Paper ✋, or Scissors ✌️ on 'SHOOT'!";
    }

    update(dt) {
      const p = this.getPointerPos();

      // Read gesture from hand landmarks
      if (p.isFist) this.userChoice = "Rock ✊";
      else if (p.isScissors) this.userChoice = "Scissors ✌️";
      else if (p.isOpenPalm) this.userChoice = "Paper ✋";

      if (this.roundState === "countdown") {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.roundState = "result";
          const choices = ["Rock ✊", "Paper ✋", "Scissors ✌️"];
          this.aiChoice = choices[Math.floor(Math.random() * choices.length)];
          this.resolveRound();
        }
      }
    }

    resolveRound() {
      if (!this.userChoice) this.userChoice = "Paper ✋"; // Default fallback
      if (this.userChoice === this.aiChoice) {
        this.roundResult = "TIE ROUND!";
      } else if (
        (this.userChoice.includes("Rock") && this.aiChoice.includes("Scissors")) ||
        (this.userChoice.includes("Paper") && this.aiChoice.includes("Rock")) ||
        (this.userChoice.includes("Scissors") && this.aiChoice.includes("Paper"))
      ) {
        this.roundResult = "YOU WIN! +100 PTS";
        audio.playWin();
        this.addScore(100);
      } else {
        this.roundResult = "AI WINS!";
        audio.playWrong();
        this.resetStreak();
      }

      setTimeout(() => {
        this.roundState = "countdown";
        this.timer = 3.0;
      }, 2500);
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      this.ctx.save();
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ffffff";

      if (this.roundState === "countdown") {
        this.ctx.font = "bold 64px 'JetBrains Mono', monospace";
        const count = Math.ceil(this.timer);
        this.ctx.fillText(count > 0 ? count : "SHOOT!", this.width / 2, this.height / 2 - 30);

        this.ctx.font = "bold 18px 'Inter', sans-serif";
        this.ctx.fillStyle = "#94a3b8";
        this.ctx.fillText(`Your Current Gesture: ${this.userChoice || "Detecting..."}`, this.width / 2, this.height / 2 + 50);
      } else {
        this.ctx.font = "bold 32px 'JetBrains Mono', monospace";
        this.ctx.fillText(`YOU: ${this.userChoice}`, this.width * 0.3, this.height / 2 - 40);
        this.ctx.fillText(`AI: ${this.aiChoice}`, this.width * 0.7, this.height / 2 - 40);

        this.ctx.font = "bold 36px 'Inter', sans-serif";
        this.ctx.fillStyle = this.roundResult.includes("WIN") ? "#10b981" : "#f59e0b";
        this.ctx.fillText(this.roundResult, this.width / 2, this.height / 2 + 40);
      }
      this.ctx.restore();
    }
  }

  // ── 10. ZEN STARGAZER (Strategy & Precision) ──
  class ZenStargazerGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.stars = [
        { x: 180, y: 150, connected: false },
        { x: 320, y: 180, connected: false },
        { x: 440, y: 280, connected: false },
        { x: 580, y: 220, connected: false },
        { x: 680, y: 350, connected: false }
      ];
      this.currentIdx = 0;
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "✨ Connect the glowing celestial stars sequentially using finger beam!";
    }

    update() {
      const p = this.getPointerPos();
      const targetStar = this.stars[this.currentIdx];

      if (targetStar && Math.hypot(p.x - targetStar.x, p.y - targetStar.y) < 30) {
        targetStar.connected = true;
        audio.playScore();
        this.spawnParticles(targetStar.x, targetStar.y, "#38bdf8", 18);
        this.addScore(100);
        this.currentIdx++;

        if (this.currentIdx >= this.stars.length) {
          this.gameOver("CELESTIAL CONSTELLATION COMPLETE!");
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw Lines Between Connected Stars
      this.ctx.save();
      this.ctx.strokeStyle = "#38bdf8";
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = "#38bdf8";
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      for (let i = 0; i < this.currentIdx; i++) {
        if (i === 0) this.ctx.moveTo(this.stars[i].x, this.stars[i].y);
        else this.ctx.lineTo(this.stars[i].x, this.stars[i].y);
      }
      this.ctx.stroke();

      // Draw All Stars
      this.stars.forEach((s, idx) => {
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.connected ? 12 : 8, 0, Math.PI * 2);
        this.ctx.fillStyle = s.connected ? "#38bdf8" : (idx === this.currentIdx ? "#f59e0b" : "#475569");
        this.ctx.fill();
      });
      this.ctx.restore();

      this.drawParticles();
    }
  }

  // ── 11. AIR PIANO / BEAT TAPPER (Rhythm & Audio) ──
  class AirPianoGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.keys = ["C4", "D4", "E4", "G4", "A4"];
      this.keyStates = [false, false, false, false, false];
      const banner = document.getElementById("arenaInstructionBanner");
      if (banner) banner.textContent = "🎹 Tap your 5 fingers downward to play the harmonic synth piano!";
    }

    update() {
      const p = this.getPointerPos();
      const heights = p.fingerHeights || [0.5, 0.5, 0.5, 0.5, 0.5];

      heights.forEach((h, i) => {
        const isPressed = h > 0.65 || (trackingState.simIsDown && Math.floor(p.rawX * 5) === i);
        if (isPressed && !this.keyStates[i]) {
          this.keyStates[i] = true;
          audio.playPianoNote(i);
          const keyW = this.width / 5;
          this.spawnParticles(i * keyW + keyW / 2, this.height * 0.7, "#10b981", 12);
          this.addScore(25);
        } else if (!isPressed) {
          this.keyStates[i] = false;
        }
      });
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const keyW = this.width / 5;

      this.keys.forEach((k, i) => {
        const isDown = this.keyStates[i];
        this.ctx.save();
        this.ctx.fillStyle = isDown ? "rgba(16, 185, 129, 0.45)" : "rgba(15, 23, 42, 0.8)";
        this.ctx.strokeStyle = isDown ? "#10b981" : "rgba(255, 255, 255, 0.15)";
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = "#10b981";
        this.ctx.shadowBlur = isDown ? 24 : 0;
        this.ctx.beginPath();
        this.ctx.roundRect(i * keyW + 8, 40, keyW - 16, this.height - 80, 16);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = isDown ? "#10b981" : "#ffffff";
        this.ctx.font = "bold 24px 'JetBrains Mono', monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(k, i * keyW + keyW / 2, this.height - 120);
        this.ctx.restore();
      });

      this.drawParticles();
    }
  }

  // ── GAME FACTORY MAPPER ──
  function createGameInstance(gameId, canvas, arenaState) {
    switch (gameId) {
      case "formula-slicer": return new FormulaSlicerGame(canvas, arenaState);
      case "periodic-collector": return new PeriodicCollectorGame(canvas, arenaState);
      case "equation-balance": return new EquationBalanceGame(canvas, arenaState);
      case "neon-pong": return new NeonPongGame(canvas, arenaState);
      case "target-pop": return new TargetPopGame(canvas, arenaState);
      case "asteroid-steer": return new AsteroidSteerGame(canvas, arenaState);
      case "shadow-strike": return new ShadowStrikeGame(canvas, arenaState);
      case "finger-maze": return new FingerMazeRunnerGame(canvas, arenaState);
      case "rock-paper-scissors": return new RockPaperScissorsGame(canvas, arenaState);
      case "zen-stargazer": return new ZenStargazerGame(canvas, arenaState);
      case "air-piano": return new AirPianoGame(canvas, arenaState);
      default: return new NeonPongGame(canvas, arenaState);
    }
  }

  // ── ARENA LAUNCHER & CONTROLLERS ──
  function launchGameArena(gameId) {
    const gameMeta = GAME_ROSTER.find(g => g.id === gameId);
    if (!gameMeta) return;

    const arenaModal = document.getElementById("gestureGameArenaModal");
    const canvas = document.getElementById("arcadeGameCanvas");
    if (!arenaModal || !canvas) return;

    // Set UI metadata
    document.getElementById("arenaGameTitle").textContent = gameMeta.title;
    document.getElementById("arenaInstructionBanner").textContent = gameMeta.desc;
    document.getElementById("arenaScoreDisplay").textContent = "0";
    document.getElementById("arenaMultiplierDisplay").textContent = "x1";

    arenaModal.style.display = "flex";

    // Start webcam if not yet active
    if (!trackingState.cameraActive && !trackingState.simulatorMode) {
      startWebcam();
    }

    // Stop existing loop
    if (activeGameAnimationId) cancelAnimationFrame(activeGameAnimationId);

    activeGameInstance = createGameInstance(gameId, canvas, gameMeta);

    let lastTimestamp = performance.now();
    function gameLoop(now) {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (activeGameInstance && !activeGameInstance.isPaused && !activeGameInstance.isOver) {
        activeGameInstance.update(dt);
        activeGameInstance.render();
      }

      activeGameAnimationId = requestAnimationFrame(gameLoop);
    }

    activeGameAnimationId = requestAnimationFrame(gameLoop);
  }

  function closeGameArena() {
    if (activeGameAnimationId) {
      cancelAnimationFrame(activeGameAnimationId);
      activeGameAnimationId = null;
    }
    activeGameInstance = null;
    const arenaModal = document.getElementById("gestureGameArenaModal");
    if (arenaModal) arenaModal.style.display = "none";
    hideArenaDialog();
  }

  function restartCurrentGame() {
    if (activeGameInstance) {
      launchGameArena(activeGameInstance.arenaState.id);
      hideArenaDialog();
    }
  }

  function showArenaDialog(title, score) {
    const dialog = document.getElementById("arenaDialogOverlay");
    if (dialog) {
      document.getElementById("arenaDialogTitle").textContent = title;
      document.getElementById("arenaDialogScore").textContent = score;
      dialog.style.display = "flex";
    }
  }

  function hideArenaDialog() {
    const dialog = document.getElementById("arenaDialogOverlay");
    if (dialog) dialog.style.display = "none";
  }

  // ── HUB UI RENDERING & FILTERING ──
  let activeCategoryFilter = "all";

  function renderGameRoster() {
    const grid = document.getElementById("arcadeGameGrid");
    if (!grid) return;

    const highScores = getHighScores();
    const searchVal = (document.getElementById("arcadeSearchInput")?.value || "").toLowerCase().trim();

    const filtered = GAME_ROSTER.filter(g => {
      const matchCat = activeCategoryFilter === "all" || g.category === activeCategoryFilter;
      const matchSearch = !searchVal || g.title.toLowerCase().includes(searchVal) || g.desc.toLowerCase().includes(searchVal) || g.gestureBadge.toLowerCase().includes(searchVal);
      return matchCat && matchSearch;
    });

    grid.innerHTML = filtered.map(g => {
      const highScore = highScores[g.id] || 0;
      return `
        <div class="arcade-game-card" style="--card-accent: ${g.accent};">
          <div class="arcade-card-top">
            <div class="arcade-card-icon">${g.icon}</div>
            <div class="arcade-badge-cluster">
              <span class="arcade-diff-badge ${g.diffClass}">${g.difficulty}</span>
              <span class="arcade-category-tag">${g.categoryName}</span>
            </div>
          </div>

          <div>
            <h3 class="arcade-card-title">${g.title}</h3>
            <p class="arcade-card-desc">${g.desc}</p>
          </div>

          <div style="margin: 4px 0;">
            <div class="arcade-gesture-pill">
              <span class="icon">${g.gestureIcon}</span>
              <span>Req: ${g.gestureBadge}</span>
            </div>
          </div>

          <div class="arcade-card-bottom">
            <div class="arcade-highscore-badge">
              <span class="arcade-highscore-label">BEST SCORE</span>
              <span class="arcade-highscore-val">${highScore}</span>
            </div>
            <button class="btn-launch-game" data-game-id="${g.id}">
              <span>Play</span> <span>▶</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind Launch Buttons
    grid.querySelectorAll(".btn-launch-game").forEach(btn => {
      btn.addEventListener("click", () => {
        const gid = btn.getAttribute("data-game-id");
        launchGameArena(gid);
      });
    });
  }

  function updateHubStats() {
    const scores = getHighScores();
    const vals = Object.values(scores);
    const totalScore = vals.reduce((a, b) => a + b, 0);
    const mastered = vals.filter(s => s >= 500).length;

    const totalEl = document.getElementById("arcadeStatTotalScore");
    const masterEl = document.getElementById("arcadeStatMastered");
    if (totalEl) totalEl.textContent = totalScore.toLocaleString();
    if (masterEl) masterEl.textContent = `${mastered}/11`;
  }

  // ── INIT INTERACTION & CONTROLLER BINDINGS ──
  function initGestureArcadeHub() {
    renderGameRoster();
    updateHubStats();

    // Bind Category Filter Buttons
    document.querySelectorAll(".arcade-cat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".arcade-cat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategoryFilter = btn.getAttribute("data-category") || "all";
        renderGameRoster();
      });
    });

    // Search Input
    const searchInput = document.getElementById("arcadeSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => renderGameRoster());
    }

    // Header Controls
    const simBtn = document.getElementById("arcadeSimModeBtn");
    if (simBtn) simBtn.addEventListener("click", () => toggleSimulatorMode());

    const recalBtn = document.getElementById("arcadeRecalibrateBtn");
    if (recalBtn) recalBtn.addEventListener("click", () => {
      stopWebcam();
      setTimeout(startWebcam, 300);
    });

    // Arena Modal Controls
    const closeBtn = document.getElementById("btnArenaClose");
    if (closeBtn) closeBtn.addEventListener("click", closeGameArena);

    const restartBtn = document.getElementById("btnArenaRestart");
    if (restartBtn) restartBtn.addEventListener("click", restartCurrentGame);

    const dialogRestartBtn = document.getElementById("btnDialogRestart");
    if (dialogRestartBtn) dialogRestartBtn.addEventListener("click", restartCurrentGame);

    const dialogExitBtn = document.getElementById("btnDialogExit");
    if (dialogExitBtn) dialogExitBtn.addEventListener("click", closeGameArena);

    // Canvas Simulator Event Bindings (Mouse & Touch)
    const canvas = document.getElementById("arcadeGameCanvas");
    if (canvas) {
      const updateSimPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        trackingState.simMouseX = (e.clientX - rect.left) / rect.width;
        trackingState.simMouseY = (e.clientY - rect.top) / rect.height;
        if (e.shiftKey) {
          trackingState.simHand2Y = trackingState.simMouseY;
        }
      };

      canvas.addEventListener("mousemove", updateSimPos);
      canvas.addEventListener("mousedown", (e) => {
        updateSimPos(e);
        trackingState.simIsDown = true;
      });
      window.addEventListener("mouseup", () => {
        trackingState.simIsDown = false;
      });

      canvas.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) {
          const t = e.touches[0];
          const rect = canvas.getBoundingClientRect();
          trackingState.simMouseX = (t.clientX - rect.left) / rect.width;
          trackingState.simMouseY = (t.clientY - rect.top) / rect.height;
          trackingState.simIsDown = true;
        }
      });
      canvas.addEventListener("touchend", () => {
        trackingState.simIsDown = false;
      });
    }

    // Window Resize Observer for Game Canvas
    window.addEventListener("resize", () => {
      if (activeGameInstance) activeGameInstance.resize();
    });
  }

  // Export globally
  window.initGestureArcadeHub = initGestureArcadeHub;
  window.launchGameArena = launchGameArena;
})();

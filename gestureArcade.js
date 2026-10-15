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
    playLaser() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(980, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.24, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.14);
      } catch (_) {}
    }
    playExplosion() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.07));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(550, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.28);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (_) {
        this.playTone(85, "square", 0.25, 0.3);
      }
    }
    playReload() {
      [340, 480, 720].forEach((f, i) => {
        setTimeout(() => this.playTone(f, "triangle", 0.07, 0.18), i * 65);
      });
    }
    playNitro() {
      this.playTone(260, "sawtooth", 0.32, 0.22);
    }
  }

  const audio = new ArcadeAudioSynth();

  // ── GAME ROSTER DATA ──
  const GAME_ROSTER = [
    // ── FLAGSHIP HIGH-OCTANE ENGINES ──
    {
      id: "cyber-highway-racer",
      title: "Cyber Highway Racer",
      category: "reflex",
      categoryName: "Reflex & Arcade Action",
      icon: "🏎️",
      accent: "#00f0ff",
      gestureBadge: "Two-Hand Steering Wheel Tilt",
      gestureIcon: "👐",
      difficulty: "Hard",
      diffClass: "diff-hard",
      desc: "High-octane neon highway! Virtual two-hand steering wheel tilt detection. Angle your hands left/right to weave through traffic; open palm accelerates, closed fist brakes!"
    },
    {
      id: "tactical-crosshair",
      title: "Tactical Gesture Crosshair",
      category: "strategy",
      categoryName: "Strategy & Precision",
      icon: "🎯",
      accent: "#ef4444",
      gestureBadge: "Index Pointer & Pinch Snap",
      gestureIcon: "🤏",
      difficulty: "Medium",
      diffClass: "diff-medium",
      desc: "Tactical target shooting! Index finger aims the holographic red-dot laser crosshair; quick Pinch (index + thumb) or finger-gun snap triggers rapid-fire recoil shots!"
    },
    {
      id: "flight-horizon",
      title: "Aura Flight Horizon",
      category: "reflex",
      categoryName: "Reflex & Arcade Action",
      icon: "✈️",
      accent: "#10b981",
      gestureBadge: "Open Palm Bank & Elevation",
      gestureIcon: "✋",
      difficulty: "Medium",
      diffClass: "diff-medium",
      desc: "Supersonic flight simulator! Open palm elevation controls pitch and altitude, while hand bank angle rolls your jet through floating holographic sky rings."
    },
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

  // ── MASTER TRACKING STATE (HAND TRACKING WITH ROBUST LIFECYCLE & FALLBACK) ──
  const trackingState = {
    cameraActive: false,
    cameraInitialized: false,
    handsDetector: null,
    cameraStream: null,
    handsInitRetry: null,
    videoAnimId: null,
    lastFrameTime: performance.now(),
    fps: 0,
    fpsHistory: [],
    landmarks: [], // Multi-hand landmarks array for multi-hand engines

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
    // Hand 2 (Secondary, for dual-hand balance / steering):
    hand2: {
      detected: false,
      handedness: "Left",
      landmarks: null,
      palmX: 0.25,
      palmY: 0.5,
      indexTipX: 0.25,
      indexTipY: 0.5,
      thumbTipX: 0.25,
      thumbTipY: 0.5,
      isPinching: false,
      pinchDist: 1.0,
      tiltAngle: 0,
      isFist: false,
      isOpenPalm: false,
      velocity: 0,
      lastX: 0.25,
      lastY: 0.5
    }
  };

  // ── MEDIAPIPE HANDS INITIALIZATION (RELIABLE CDN WASM & BINARY RESOLUTION) ──
  function initMediaPipeHands() {
    const HandsConstructor = window.Hands || (typeof Hands !== "undefined" ? Hands : null);
    if (!HandsConstructor) {
      console.warn("[GESTURE ARCADE] MediaPipe Hands CDN script pending evaluation. Polling...");
      if (!trackingState.handsInitRetry) {
        trackingState.handsInitRetry = setInterval(() => {
          if (window.Hands || typeof Hands !== "undefined") {
            clearInterval(trackingState.handsInitRetry);
            trackingState.handsInitRetry = null;
            initMediaPipeHands();
          }
        }, 150);
      }
      return false;
    }

    if (trackingState.handsInitRetry) {
      clearInterval(trackingState.handsInitRetry);
      trackingState.handsInitRetry = null;
    }

    try {
      const hands = new HandsConstructor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });

      hands.onResults(onHandResults);
      trackingState.handsDetector = hands;
      console.log("[GESTURE ARCADE] MediaPipe Hands successfully initialized (minConfidence: 0.65).");
      return true;
    } catch (err) {
      console.error("[GESTURE ARCADE] MediaPipe Init Error:", err);
      return false;
    }
  }

  // ── WEBCAM START & CAMERA UTILS PIPELINE (WIDE-ANGLE 16:9 REPAIR) ──
  async function startWebcam() {
    const video = document.getElementById("gesture-cam") || document.getElementById("gestureWebcamVideo");
    if (!video) return;

    if (!trackingState.handsDetector) {
      initMediaPipeHands();
    }

    // Cancel existing loop before starting new one
    if (trackingState.videoAnimId) {
      cancelAnimationFrame(trackingState.videoAnimId);
      trackingState.videoAnimId = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC getUserMedia not supported in this browser context.");
      }

      // Explicit wide-angle 16:9 widescreen constraints to eliminate severe over-zoom & cropping
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
          aspectRatio: { ideal: 1.7777777778 } // 16:9 widescreen
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      video.srcObject = stream;
      await video.play();

      trackingState.cameraActive = true;
      trackingState.cameraStream = stream;

      // Hide permission prompt banner
      const banner = document.getElementById("arcadeCameraPermissionBanner");
      if (banner) banner.style.display = "none";

      updateWebcamStatusUI(true, "🟢 Camera Active");

      // Continuous low-latency frame dispatch to MediaPipe Hands
      let isFrameProcessing = false;
      const processVideoFrame = async () => {
        if (!trackingState.cameraActive) return;

        if (!trackingState.handsDetector) {
          initMediaPipeHands();
        }

        if (video.readyState >= 2 && trackingState.handsDetector && !isFrameProcessing) {
          isFrameProcessing = true;
          try {
            await trackingState.handsDetector.send({ image: video });
          } catch (e) {
            console.debug("[GESTURE ARCADE] MediaPipe send frame warning:", e);
          } finally {
            isFrameProcessing = false;
          }
        }
        if (trackingState.cameraActive) {
          trackingState.videoAnimId = requestAnimationFrame(processVideoFrame);
        }
      };

      trackingState.videoAnimId = requestAnimationFrame(processVideoFrame);
    } catch (err) {
      console.warn("[GESTURE ARCADE] Webcam access denied or unavailable:", err.message);
      trackingState.cameraActive = false;

      // Show sleek permission prompt banner
      const banner = document.getElementById("arcadeCameraPermissionBanner");
      if (banner) banner.style.display = "block";

      updateWebcamStatusUI(false, "❌ Camera Inactive / Denied — Mouse Fallback Ready");
    }
  }

  function stopWebcam() {
    trackingState.cameraActive = false;
    if (trackingState.videoAnimId) {
      cancelAnimationFrame(trackingState.videoAnimId);
      trackingState.videoAnimId = null;
    }
    const video = document.getElementById("gesture-cam") || document.getElementById("gestureWebcamVideo");
    if (video && video.srcObject) {
      try {
        video.srcObject.getTracks().forEach(t => t.stop());
      } catch (_) {}
      video.srcObject = null;
    }
    if (trackingState.cameraStream) {
      try {
        trackingState.cameraStream.getTracks().forEach(t => t.stop());
      } catch (_) {}
      trackingState.cameraStream = null;
    }
    trackingState.hand1.detected = false;
    trackingState.hand2.detected = false;
    trackingState.landmarks = [];
    trackingState.fps = 0;

    const fpsHub = document.getElementById("arcadeFpsVal");
    const lmHub = document.getElementById("arcadeLandmarksVal");
    if (fpsHub) fpsHub.textContent = "0 FPS";
    if (lmHub) lmHub.textContent = "0 Points";
    const fpsArena = document.getElementById("arenaFpsDisplay");
    if (fpsArena) fpsArena.textContent = "0 FPS";

    updateWebcamStatusUI(false, "⚪ Camera Standby");
  }

  function updateWebcamStatusUI(isActive, label) {
    const statusText = document.getElementById("arcadeCamStatusLabel");
    const statusDot = document.getElementById("arcadeCamStatusDot");
    if (statusText) statusText.textContent = label;
    if (statusDot) {
      statusDot.className = "arcade-status-dot " + (isActive ? "active" : "");
    }

    const sensorDot = document.getElementById("arcadeHandSensorDot");
    const sensorLabel = document.getElementById("arcadeHandSensorLabel");
    if (sensorDot && sensorLabel) {
      if (isActive && trackingState.hand1.detected) {
        sensorDot.className = "arcade-status-dot active";
        sensorLabel.textContent = `✋ Hand Tracking (${trackingState.hand1.handedness})`;
      } else if (isActive) {
        sensorDot.className = "arcade-status-dot active";
        sensorLabel.textContent = "✋ Camera Ready · Searching for Hand";
      } else {
        sensorDot.className = "arcade-status-dot standby";
        sensorLabel.textContent = "✋ Sensor Idle (Camera Standby)";
      }
    }
  }

  // ── MEDIAPIPE RESULTS PROCESSOR & CLASSIFIER ──
  function onHandResults(results) {
    calculateFPS();

    trackingState.landmarks = (results && results.multiHandLandmarks) ? results.multiHandLandmarks : [];
    const lmHub = document.getElementById("arcadeLandmarksVal");

    const skeletonCanvas = document.getElementById("gestureSkeletonCanvas");
    let ctx = null;
    if (skeletonCanvas) {
      if (skeletonCanvas.width !== skeletonCanvas.clientWidth || skeletonCanvas.height !== skeletonCanvas.clientHeight) {
        skeletonCanvas.width = skeletonCanvas.clientWidth || 320;
        skeletonCanvas.height = skeletonCanvas.clientHeight || 220;
      }
      ctx = skeletonCanvas.getContext("2d");
      ctx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
    }

    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      trackingState.landmarks = [];
      trackingState.hand1.detected = false;
      trackingState.hand2.detected = false;
      if (lmHub) lmHub.textContent = "0 Points";
      updateCornerHudLabel("Searching for hands...");
      return;
    }

    const totalPts = trackingState.landmarks.length * 21;
    if (lmHub) lmHub.textContent = `${totalPts} Points`;

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
    const dx = stateObj.palmX - (stateObj.lastX || stateObj.palmX);
    const dy = stateObj.palmY - (stateObj.lastY || stateObj.palmY);
    stateObj.velocity = Math.sqrt(dx * dx + dy * dy);
    stateObj.lastX = stateObj.palmX;
    stateObj.lastY = stateObj.palmY;

    // Pinch distance (Thumb tip to Index tip in 3D Euclidean distance)
    const pinchDx = thumbTip.x - indexTip.x;
    const pinchDy = thumbTip.y - indexTip.y;
    const pinchDz = (thumbTip.z || 0) - (indexTip.z || 0);
    stateObj.pinchDist = Math.sqrt(pinchDx * pinchDx + pinchDy * pinchDy + pinchDz * pinchDz);
    stateObj.isPinching = stateObj.pinchDist < 0.088;

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
    const video = document.getElementById("gesture-cam") || document.getElementById("gestureWebcamVideo");

    // Compute exact contain letterbox geometry so skeletal overlay matches the mirrored camera feed
    let drawX = (normX) => normX * w;
    let drawY = (normY) => normY * h;

    if (video && video.videoWidth && video.videoHeight) {
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = w / h;
      let renderW = w;
      let renderH = h;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > videoAspect) {
        renderH = h;
        renderW = h * videoAspect;
        offsetX = (w - renderW) / 2;
        offsetY = 0;
      } else {
        renderW = w;
        renderH = w / videoAspect;
        offsetX = 0;
        offsetY = (h - renderH) / 2;
      }
      drawX = (normX) => offsetX + normX * renderW;
      drawY = (normY) => offsetY + normY * renderH;
    }

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
      ctx.moveTo(drawX(lm[i].x), drawY(lm[i].y));
      ctx.lineTo(drawX(lm[j].x), drawY(lm[j].y));
      ctx.stroke();
    });

    // Draw Joints
    for (let i = 0; i < lm.length; i++) {
      ctx.beginPath();
      const r = (i === 4 || i === 8 || i === 12 || i === 16 || i === 20) ? 5 : 3;
      ctx.arc(drawX(lm[i].x), drawY(lm[i].y), r, 0, Math.PI * 2);
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
      const fpsHub = document.getElementById("arcadeFpsVal");
      if (fpsHub) fpsHub.textContent = `${trackingState.fps} FPS`;
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
      this.isAwaitingHands = false;
      this.isOver = false;
      this.particles = [];
      this.lastTick = performance.now();

      // Unified gesture & coordinate fields accessible by all games
      this.handX = 0.5;
      this.handY = 0.5;
      this.isPinching = false;
      this.isFist = false;
      this.isOpenPalm = false;
      this.currentGesture = "neutral";
      this.pointer = null;

      // Mouse and Keyboard fallback controls
      this.mousePos = { x: 0.5, y: 0.5, isDown: false, active: false };
      this.keysDown = {};

      this._onMouseMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.mousePos.x = Math.max(0.01, Math.min(0.99, (e.clientX - rect.left) / rect.width));
          this.mousePos.y = Math.max(0.01, Math.min(0.99, (e.clientY - rect.top) / rect.height));
          this.mousePos.active = true;
          this.isAwaitingHands = false;
        }
      };

      this._onMouseDown = () => {
        this.mousePos.isDown = true;
        this.mousePos.active = true;
        this.isAwaitingHands = false;
      };

      this._onMouseUp = () => {
        this.mousePos.isDown = false;
      };

      this._onKeyDown = (e) => {
        this.keysDown[e.key] = true;
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter"].includes(e.key)) {
          this.mousePos.active = true;
          this.isAwaitingHands = false;
        }
      };

      this._onKeyUp = (e) => {
        this.keysDown[e.key] = false;
      };

      this.canvas.addEventListener("mousemove", this._onMouseMove);
      this.canvas.addEventListener("mousedown", this._onMouseDown);
      window.addEventListener("mouseup", this._onMouseUp);
      window.addEventListener("keydown", this._onKeyDown);
      window.addEventListener("keyup", this._onKeyUp);

      this.resize();
    }

    cleanup() {
      try {
        this.canvas.removeEventListener("mousemove", this._onMouseMove);
        this.canvas.removeEventListener("mousedown", this._onMouseDown);
        window.removeEventListener("mouseup", this._onMouseUp);
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
      } catch (_) {}
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

    update(dt) {
      // Base synchronization of pointer & hand gesture states
      const p = this.getPointerPos();
      this.pointer = p;
      if (!p.detected) {
        this.isAwaitingHands = true;
        return false;
      }
      this.isAwaitingHands = false;
      this.handX = p.rawX;
      this.handY = p.rawY;
      this.isPinching = p.isPinch;
      this.isFist = p.isFist;
      this.isOpenPalm = p.isOpenPalm;
      this.currentGesture = p.isPinch ? "pinch" : (p.isFist ? "fist" : (p.isOpenPalm ? "palm" : "neutral"));
      return true;
    }

    getPointerPos() {
      // 1. If hand tracking is active and hand is detected, use hand tracking
      if (trackingState.hand1 && trackingState.hand1.detected) {
        const h1 = trackingState.hand1;
        const h2 = trackingState.hand2;
        return {
          detected: true,
          fallbackMode: false,
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
          hand2Y: h2 && h2.detected ? h2.palmY * this.height : (this.height * 0.5),
          twoHandsDetected: Boolean(h1.detected && h2 && h2.detected)
        };
      }

      // 2. Otherwise, check for mouse / keyboard fallback
      if (this.mousePos.active) {
        if (this.keysDown["ArrowLeft"]) this.mousePos.x = Math.max(0.02, this.mousePos.x - 0.02);
        if (this.keysDown["ArrowRight"]) this.mousePos.x = Math.min(0.98, this.mousePos.x + 0.02);
        if (this.keysDown["ArrowUp"]) this.mousePos.y = Math.max(0.02, this.mousePos.y - 0.02);
        if (this.keysDown["ArrowDown"]) this.mousePos.y = Math.min(0.98, this.mousePos.y + 0.02);

        const isTrigger = this.mousePos.isDown || Boolean(this.keysDown[" "] || this.keysDown["Enter"]);
        return {
          detected: true,
          fallbackMode: true,
          x: this.mousePos.x * this.width,
          y: this.mousePos.y * this.height,
          palmX: this.mousePos.x * this.width,
          palmY: this.mousePos.y * this.height,
          rawX: this.mousePos.x,
          rawY: this.mousePos.y,
          isTrigger: isTrigger,
          isPinch: isTrigger,
          isFist: Boolean(this.keysDown["f"] || this.keysDown["F"]),
          isOpenPalm: !isTrigger,
          isScissors: Boolean(this.keysDown["s"] || this.keysDown["S"]),
          tilt: (this.mousePos.x - 0.5) * 60,
          velocity: 0.1,
          fingerHeights: [0.5, 0.5, 0.5, 0.5, 0.5],
          hand2Y: (1 - this.mousePos.y) * this.height,
          twoHandsDetected: true
        };
      }

      // 3. Neither hand nor mouse active yet:
      return {
        detected: false,
        fallbackMode: false,
        x: this.width * 0.5,
        y: this.height * 0.5,
        palmX: this.width * 0.5,
        palmY: this.height * 0.5,
        rawX: 0.5,
        rawY: 0.5,
        isTrigger: false,
        isPinch: false,
        isFist: false,
        isOpenPalm: false,
        isScissors: false,
        tilt: 0,
        velocity: 0,
        fingerHeights: [0.5, 0.5, 0.5, 0.5, 0.5],
        hand2Y: this.height * 0.5,
        twoHandsDetected: false
      };
    }

    drawAwaitingHandsOverlay() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const time = performance.now() / 1000;

      ctx.save();

      // Cyber Frosted Glass Backdrop
      ctx.fillStyle = "rgba(6, 9, 16, 0.84)";
      ctx.fillRect(0, 0, w, h);

      // Cyber Perspective Grid Scanlines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vertical Sweeping Laser Beam
      const scanY = ((time * 0.6) % 1) * h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
      scanGrad.addColorStop(0, "rgba(0, 240, 255, 0)");
      scanGrad.addColorStop(0.5, "rgba(0, 240, 255, 0.35)");
      scanGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 35, w, 70);

      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Holographic Scanner Brackets
      const boxW = Math.min(540, w * 0.88);
      const boxH = Math.min(270, h * 0.62);
      const boxX = (w - boxW) / 2;
      const boxY = (h - boxH) / 2;
      const cornerLen = 36;

      ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 16;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + cornerLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + cornerLen, boxY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - cornerLen, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + boxH - cornerLen);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX + cornerLen, boxY + boxH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Center Holographic Hand Graphic with Pulsing Radar Rings
      const iconY = boxY + 68;
      const pulse = 0.75 + Math.sin(time * 4) * 0.25;

      ctx.save();
      ctx.translate(w / 2, iconY);
      ctx.fillStyle = `rgba(0, 240, 255, ${pulse * 0.18})`;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 240, 255, ${pulse})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 18 * pulse;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();

      // Outer radar pulse
      const outerR = 44 + ((time * 30) % 25);
      const outerAlpha = Math.max(0, 1 - (outerR - 44) / 25);
      ctx.strokeStyle = `rgba(0, 240, 255, ${outerAlpha * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, outerR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = "36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✋", 0, 0);
      ctx.restore();

      // Primary Warning Heading
      ctx.textAlign = "center";
      ctx.fillStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 18;
      ctx.font = "bold 22px 'JetBrains Mono', monospace";
      ctx.fillText("AWAITING HAND SENSORS", w / 2, boxY + 150);
      ctx.shadowBlur = 0;

      // Subtitle Instructions (Exact Prompt Requirement)
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 16px 'Outfit', sans-serif";
      ctx.fillText("Place hands in front of camera", w / 2, boxY + 182);

      // System telemetry subtext
      ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText("SHOW HANDS TO CAMERA OR MOVE MOUSE / USE ARROW KEYS TO PLAY", w / 2, boxY + 218);

      ctx.restore();
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

    addMultiplier(delta) {
      if (delta > 0) {
        this.streak += delta;
      } else {
        this.resetStreak();
      }
      if (this.streak > 12) this.multiplier = 8;
      else if (this.streak > 7) this.multiplier = 4;
      else if (this.streak > 3) this.multiplier = 2;
      else this.multiplier = 1;
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

    endGame(score) {
      this.gameOver("MISSION FINISHED");
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
          const isMovingFast = (p.velocity && p.velocity > 0.02) || p.isTrigger;

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

      const isStriking = (p.velocity && p.velocity > 0.05) || p.isFist;

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
        const isPressed = h > 0.65;
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

  // =========================================================
  // 1. CYBER HIGHWAY RACER (Two-Hand Steering Wheel Tilt Engine)
  // =========================================================
  class CyberHighwayRacerGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.playerX = 0; // -1 (left road shoulder) to +1 (right road shoulder)
      this.speed = 140; // km/h
      this.maxSpeed = 220;
      this.minSpeed = 50;
      this.nitroSpeed = 290;
      this.distance = 0;
      this.steeringAngle = 0; // in degrees
      this.targetSteer = 0;
      this.steerMode = "CALIBRATING";
      this.nitroFuel = 100;
      this.nitroActive = false;
      this.isBraking = false;
      this.shieldActive = true;
      this.shieldPulse = 0;
      this.roadZ = 0;
      this.roadCurve = 0;
      this.targetCurve = 0;
      this.curveTimer = 0;
      this.obstacles = [];
      this.powerups = [];
      this.speedLines = [];
      this.exhaustParticles = [];
      this.floatingTexts = [];
      this.screenShake = 0;

      // Initialize road speed lines
      for (let i = 0; i < 45; i++) {
        this.speedLines.push({
          x: (Math.random() - 0.5) * this.width * 1.6,
          y: Math.random() * this.height,
          len: 35 + Math.random() * 110,
          speed: 500 + Math.random() * 700
        });
      }
    }

    update(dt) {
      if (!super.update(dt)) return; // Pauses on lost hand tracking

      // Screen shake decay
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - 26 * dt);
      }

      // Smooth highway curvature simulation
      this.curveTimer += dt;
      if (this.curveTimer > 4.5) {
        this.curveTimer = 0;
        this.targetCurve = (Math.random() - 0.5) * 0.75;
      }
      this.roadCurve += (this.targetCurve - this.roadCurve) * 1.25 * dt;

      // Two-Hand Steering Wheel Tilt & Motion Tracking (STRICTLY GESTURE DRIVEN)
      let isBraking = false;
      let isAccelerating = false;
      let targetSteer = 0;

      if (trackingState.hand1.detected && trackingState.hand2.detected) {
        // Dual-Hand Virtual Steering Wheel
        const h1 = trackingState.hand1;
        const h2 = trackingState.hand2;
        const leftHand = h1.palmX < h2.palmX ? h1 : h2;
        const rightHand = h1.palmX < h2.palmX ? h2 : h1;

        const dy = (rightHand.palmY - leftHand.palmY) * this.height;
        const dx = (rightHand.palmX - leftHand.palmX) * this.width;
        const angleRad = Math.atan2(dy, Math.max(30, dx));
        this.steeringAngle = angleRad * (180 / Math.PI);

        // Normalize steering (-32 deg left to +32 deg right)
        targetSteer = Math.max(-1, Math.min(1, this.steeringAngle / 24));
        this.steerMode = "👐 DUAL-HAND VIRTUAL WHEEL";

        // Dual Hand Fist = Regenerative Braking
        if (h1.isFist || h2.isFist) {
          isBraking = true;
        }

        // Dual Open Palms = Turbo Nitro Boost
        if (h1.isOpenPalm && h2.isOpenPalm) {
          isAccelerating = true;
        }
      } else if (trackingState.hand1.detected) {
        // Single Hand Tilt & Lateral Movement
        const h = trackingState.hand1;
        this.steeringAngle = h.tiltAngle || ((h.palmX - 0.5) * 55);
        targetSteer = Math.max(-1, Math.min(1, (h.palmX - 0.5) * 2.4));
        this.steerMode = "✋ SINGLE-HAND TILT";

        if (h.isFist) {
          isBraking = true;
        } else if (h.isOpenPalm || h.isPinching) {
          isAccelerating = true;
        }
      } else {
        targetSteer = 0;
        this.steeringAngle = 0;
        this.steerMode = "AWAITING SENSORS";
      }

      this.isBraking = isBraking;

      // Smooth steering interpolation
      this.playerX += (targetSteer - this.playerX) * 9.5 * dt;
      this.playerX = Math.max(-0.9, Math.min(0.9, this.playerX));

      // Speed & Nitro Physics
      if (isBraking) {
        this.speed = Math.max(this.minSpeed, this.speed - 170 * dt);
        this.nitroActive = false;
      } else if (isAccelerating && this.nitroFuel > 5) {
        this.nitroActive = true;
        this.speed = Math.min(this.nitroSpeed, this.speed + 130 * dt);
        this.nitroFuel = Math.max(0, this.nitroFuel - 28 * dt);
        if (Math.random() < 0.1) audio.playNitro();
      } else {
        this.nitroActive = false;
        this.speed += (160 - this.speed) * 3 * dt;
        this.nitroFuel = Math.min(100, this.nitroFuel + 12 * dt);
      }

      this.distance += (this.speed / 3.6) * dt;
      this.roadZ = (this.roadZ + this.speed * 4.6 * dt) % 200;
      this.shieldPulse = (this.shieldPulse + dt * 4.5) % (Math.PI * 2);

      // Spawn oncoming traffic (Cruisers & Heavy Cyber Trucks)
      if (Math.random() < 0.034 * (this.speed / 100)) {
        const laneIndices = [-0.62, -0.21, 0.21, 0.62];
        const lane = laneIndices[Math.floor(Math.random() * laneIndices.length)];
        const isTruck = Math.random() > 0.65;
        this.obstacles.push({
          x: lane,
          z: 1000,
          type: isTruck ? "truck" : "cruiser",
          color: isTruck ? "#f59e0b" : (Math.random() > 0.5 ? "#ef4444" : "#ec4899"),
          laneChangeSpeed: (Math.random() - 0.5) * 0.16
        });
      }

      // Spawn Power-Ups (Nitro, Shields, Energy Cores)
      if (Math.random() < 0.02) {
        const types = ["nitro", "shield", "core"];
        const powerType = types[Math.floor(Math.random() * types.length)];
        this.powerups.push({
          x: (Math.random() - 0.5) * 1.3,
          z: 1000,
          type: powerType,
          rot: 0
        });
      }

      // Update oncoming obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.z -= this.speed * 4.8 * dt;
        obs.x += obs.laneChangeSpeed * dt;
        obs.x = Math.max(-0.75, Math.min(0.75, obs.x));

        // Near-player collision window
        if (obs.z < 110 && obs.z > 20) {
          const laneDiff = Math.abs(obs.x - this.playerX);
          const hitThreshold = obs.type === "truck" ? 0.32 : 0.26;

          if (laneDiff < hitThreshold) {
            // Collision triggered
            if (this.shieldActive) {
              // Shield absorbs the crash!
              this.shieldActive = false;
              audio.playScore();
              this.screenShake = 12;
              this.spawnParticles(this.width * 0.5 + this.playerX * (this.width * 0.4), this.height * 0.85, "#00f0ff", 28);
              this.floatingTexts.push({
                text: "SHIELD DEFLECTED!",
                color: "#00f0ff",
                x: this.width * 0.5,
                y: this.height * 0.7,
                life: 1.2
              });
              this.obstacles.splice(i, 1);
              continue;
            } else {
              // High-speed impact!
              audio.playWrong();
              this.screenShake = 24;
              this.resetStreak();
              this.speed = Math.max(50, this.speed - 90);
              this.spawnParticles(this.width * 0.5 + this.playerX * (this.width * 0.4), this.height * 0.85, "#ef4444", 36);
              this.floatingTexts.push({
                text: "CRASH! -90 KM/H",
                color: "#ef4444",
                x: this.width * 0.5,
                y: this.height * 0.7,
                life: 1.2
              });
              this.obstacles.splice(i, 1);
              continue;
            }
          }
        }

        // Passed vehicle check
        if (obs.z <= 0) {
          const laneDiff = Math.abs(obs.x - this.playerX);
          if (laneDiff < 0.38) {
            // Close shave / near miss bonus
            audio.playScore();
            this.screenShake = 6;
            this.addScore(150);
            this.addMultiplier(1);
            this.floatingTexts.push({
              text: "⚡ NEAR MISS! +150",
              color: "#f59e0b",
              x: this.width * 0.5 + this.playerX * (this.width * 0.35),
              y: this.height * 0.76,
              life: 1.0
            });
          } else {
            this.addScore(30);
          }
          this.obstacles.splice(i, 1);
        }
      }

      // Update powerups
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const pUp = this.powerups[i];
        pUp.z -= this.speed * 4.8 * dt;
        pUp.rot += dt * 3.5;

        if (pUp.z < 110 && pUp.z > 20 && Math.abs(pUp.x - this.playerX) < 0.35) {
          audio.playPop();
          if (pUp.type === "nitro") {
            this.nitroFuel = 100;
            this.addScore(120);
            this.floatingTexts.push({ text: "⚡ NITRO REFILLED!", color: "#00f0ff", x: this.width * 0.5, y: this.height * 0.72, life: 1.0 });
          } else if (pUp.type === "shield") {
            this.shieldActive = true;
            this.addScore(150);
            this.floatingTexts.push({ text: "🛡️ CYBER SHIELD ACTIVE!", color: "#10b981", x: this.width * 0.5, y: this.height * 0.72, life: 1.0 });
          } else {
            this.addScore(250);
            this.addMultiplier(2);
            this.floatingTexts.push({ text: "💎 ENERGY CORE +250!", color: "#c084fc", x: this.width * 0.5, y: this.height * 0.72, life: 1.0 });
          }
          this.powerups.splice(i, 1);
          continue;
        }

        if (pUp.z <= 0) this.powerups.splice(i, 1);
      }

      // Speed lines animation
      this.speedLines.forEach(l => {
        l.y += l.speed * (this.speed / 100) * dt;
        if (l.y > this.height) {
          l.y = -l.len;
          l.x = (Math.random() - 0.5) * this.width * 1.6;
        }
      });

      // Exhaust particle generation
      if (Math.random() < (this.nitroActive ? 0.95 : 0.45)) {
        const playerScreenX = this.width * 0.5 + (this.playerX * (this.width * 0.4));
        const playerScreenY = this.height * 0.86;
        this.exhaustParticles.push({
          x: playerScreenX + (Math.random() - 0.5) * 26,
          y: playerScreenY + 24,
          vx: (Math.random() - 0.5) * 44,
          vy: Math.random() * 90 + 130,
          color: this.nitroActive ? (Math.random() > 0.5 ? "#f59e0b" : "#ff007f") : "#00f0ff",
          size: this.nitroActive ? 7 : 3.5,
          life: 0.35
        });
      }

      for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
        const ep = this.exhaustParticles[i];
        ep.x += ep.vx * dt;
        ep.y += ep.vy * dt;
        ep.life -= dt;
        if (ep.life <= 0) this.exhaustParticles.splice(i, 1);
      }

      // Update floating combat texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 42 * dt;
        ft.life -= dt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const horizonY = h * 0.43;

      ctx.save();

      // Screen shake translation
      if (this.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
      }

      // ── 1. COSMIC SYNTHWAVE SKY WITH NEON HORIZON ──
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, "#010206");
      skyGrad.addColorStop(0.55, "#0b051a");
      skyGrad.addColorStop(1, "#260938");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Distant Synthwave Horizon Sun with Horizontal Raster Scanlines
      const sunY = horizonY - 14;
      const sunRadius = 78;
      const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY);
      sunGrad.addColorStop(0, "#ff007f");
      sunGrad.addColorStop(0.5, "#f59e0b");
      sunGrad.addColorStop(1, "#ffe580");
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = "#ff007f";
      ctx.shadowBlur = 32;
      ctx.beginPath();
      ctx.arc(w * 0.5 + this.roadCurve * 70, sunY, sunRadius, Math.PI, 0);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sun horizontal raster blinds
      ctx.fillStyle = "#0b051a";
      for (let s = 0; s < 6; s++) {
        const stripeY = sunY - 6 - s * 12;
        ctx.fillRect(w * 0.5 - sunRadius + this.roadCurve * 70, stripeY, sunRadius * 2, 2.5 + s * 0.8);
      }

      // Parallax Distant Cyber Mountains Grid
      ctx.strokeStyle = "rgba(236, 72, 153, 0.22)";
      ctx.lineWidth = 1;
      const mountainCenter = w * 0.5 + this.roadCurve * 40;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(mountainCenter - 260, horizonY - 45);
      ctx.lineTo(mountainCenter - 140, horizonY - 15);
      ctx.lineTo(mountainCenter - 40, horizonY - 55);
      ctx.lineTo(mountainCenter + 80, horizonY - 20);
      ctx.lineTo(mountainCenter + 220, horizonY - 50);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      // Cyberpunk City Skyline Silhouettes with Glowing Windows & Neon Beacons
      for (let b = 0; b < 20; b++) {
        const bw = w / 20;
        const bh = 18 + ((b * 47) % 65);
        const bx = b * bw;
        ctx.fillStyle = "#080b18";
        ctx.fillRect(bx, horizonY - bh, bw - 2, bh);

        // Tower antenna beacons
        if (b % 3 === 0) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx + bw * 0.5, horizonY - bh);
          ctx.lineTo(bx + bw * 0.5, horizonY - bh - 16);
          ctx.stroke();

          ctx.fillStyle = "#ef4444";
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(bx + bw * 0.5, horizonY - bh - 16, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ── 2. ROAD SHOULDERS WITH PERSPECTIVE CYBER GRID ──
      const roadCenterHorizon = w * 0.5 + this.roadCurve * 140;

      // Road shoulder surface
      ctx.fillStyle = "#04050a";
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Cyber grid lines on road shoulders
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1;
      for (let x = -w; x < w * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(roadCenterHorizon, horizonY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal perspective grid lines moving with roadZ
      for (let z = 0; z < 12; z++) {
        const pz = (z * 24 + (this.roadZ % 24)) / 288;
        const lineY = horizonY + Math.pow(pz, 2.2) * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }

      // ── 3. 3D PERSPECTIVE ROAD SURFACE WITH CURVATURE ──
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      roadGrad.addColorStop(0, "#0c101d");
      roadGrad.addColorStop(0.5, "#080b14");
      roadGrad.addColorStop(1, "#030408");
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(roadCenterHorizon - w * 0.15, horizonY);
      ctx.lineTo(roadCenterHorizon + w * 0.15, horizonY);
      ctx.lineTo(w * 0.98, h);
      ctx.lineTo(w * 0.02, h);
      ctx.closePath();
      ctx.fill();

      // Glowing Neon Guardrail Beams & Laser Barriers
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(roadCenterHorizon - w * 0.15, horizonY);
      ctx.lineTo(w * 0.02, h);
      ctx.stroke();

      ctx.strokeStyle = "#ff007f";
      ctx.shadowColor = "#ff007f";
      ctx.beginPath();
      ctx.moveTo(roadCenterHorizon + w * 0.15, horizonY);
      ctx.lineTo(w * 0.98, h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Road Edge 3D Perspective Neon Pylons
      for (let py = 0; py < 8; py++) {
        const pz = (py * 32 + (this.roadZ % 32)) / 256;
        const curScale = Math.pow(pz, 2.2);
        const curY = horizonY + curScale * (h - horizonY);
        const pylonH = 45 * curScale;

        // Left pylon
        const leftX = roadCenterHorizon - w * 0.15 + (w * 0.02 - (roadCenterHorizon - w * 0.15)) * curScale;
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(leftX - 2 * curScale, curY - pylonH, 4 * curScale, pylonH);

        // Right pylon
        const rightX = roadCenterHorizon + w * 0.15 + (w * 0.98 - (roadCenterHorizon + w * 0.15)) * curScale;
        ctx.fillStyle = "#ff007f";
        ctx.fillRect(rightX - 2 * curScale, curY - pylonH, 4 * curScale, pylonH);
      }

      // 4-Lane Dashed Road Dividers with Speed Movement
      [-0.45, 0, 0.45].forEach(laneOffset => {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([20, 24]);
        ctx.lineDashOffset = -this.roadZ * 2.2;
        ctx.beginPath();
        ctx.moveTo(roadCenterHorizon + laneOffset * (w * 0.13), horizonY);
        ctx.lineTo(w * (0.5 + laneOffset * 0.48), h);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Speed lines passing by
      ctx.strokeStyle = this.nitroActive ? "rgba(255, 0, 128, 0.55)" : "rgba(0, 240, 255, 0.28)";
      ctx.lineWidth = this.nitroActive ? 2.5 : 1.2;
      this.speedLines.forEach(l => {
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.len);
        ctx.stroke();
      });

      // ── 4. RENDER ONCOMING VEHICLES ──
      this.obstacles.slice().sort((a, b) => b.z - a.z).forEach(obs => {
        const scale = (1000 - obs.z) / 1000;
        if (scale <= 0.01) return;

        const curY = horizonY + (h - horizonY) * scale;
        const curHorizonX = roadCenterHorizon + (obs.x * (w * 0.13));
        const curBottomX = w * 0.5 + (obs.x * (w * 0.46));
        const curX = curHorizonX + (curBottomX - curHorizonX) * scale;

        const carW = (obs.type === "truck" ? 86 : 64) * scale;
        const carH = (obs.type === "truck" ? 52 : 36) * scale;

        ctx.save();
        ctx.translate(curX, curY - carH);

        // Vehicle Chassis
        ctx.fillStyle = obs.color;
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 12 * scale;
        ctx.fillRect(-carW * 0.5, 0, carW, carH);
        ctx.shadowBlur = 0;

        // Cabin windshield
        ctx.fillStyle = "#070c18";
        ctx.fillRect(-carW * 0.36, carH * 0.15, carW * 0.72, carH * 0.38);

        // Rear glowing brake lightbar
        ctx.fillStyle = "#ff0033";
        ctx.shadowColor = "#ff0033";
        ctx.shadowBlur = 12 * scale;
        ctx.fillRect(-carW * 0.46, carH * 0.65, carW * 0.92, 5 * scale);
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // ── 5. RENDER 3D ROTATING POWERUP CRYSTALS ──
      this.powerups.forEach(pUp => {
        const scale = (1000 - pUp.z) / 1000;
        if (scale <= 0.01) return;

        const curY = horizonY + (h - horizonY) * scale;
        const curX = w * 0.5 + (pUp.x * (w * 0.45 * scale));
        const rad = 18 * scale;
        const color = pUp.type === "nitro" ? "#00f0ff" : (pUp.type === "shield" ? "#10b981" : "#c084fc");

        ctx.save();
        ctx.translate(curX, curY - rad);
        ctx.rotate(pUp.rot);

        // Diamond wireframe
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(0, -rad);
        ctx.lineTo(rad, 0);
        ctx.lineTo(0, rad);
        ctx.lineTo(-rad, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // ── 6. RENDER EXHAUST PARTICLES ──
      this.exhaustParticles.forEach(ep => {
        ctx.fillStyle = ep.color;
        ctx.shadowColor = ep.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── 7. RENDER PLAYER CYBER SUPERCAR ──
      const playerScreenX = w * 0.5 + (this.playerX * (w * 0.4));
      const playerScreenY = h * 0.85;
      const pW = 94;
      const pH = 48;

      ctx.save();
      ctx.translate(playerScreenX, playerScreenY);
      ctx.rotate((this.steeringAngle * Math.PI / 180) * 0.32);

      // Volumetric Headlight Beams Illumination
      const beamGrad = ctx.createLinearGradient(0, -pH, 0, -pH - 180);
      beamGrad.addColorStop(0, "rgba(0, 240, 255, 0.42)");
      beamGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = beamGrad;

      // Left beam
      ctx.beginPath();
      ctx.moveTo(-pW * 0.35, -pH);
      ctx.lineTo(-pW * 0.85, -pH - 180);
      ctx.lineTo(-pW * 0.1, -pH - 180);
      ctx.closePath();
      ctx.fill();

      // Right beam
      ctx.beginPath();
      ctx.moveTo(pW * 0.35, -pH);
      ctx.lineTo(pW * 0.1, -pH - 180);
      ctx.lineTo(pW * 0.85, -pH - 180);
      ctx.closePath();
      ctx.fill();

      // Multi-Layer Underglow Bloom
      const underglowGrad = ctx.createRadialGradient(0, 4, 10, 0, 4, pW * 0.65);
      underglowGrad.addColorStop(0, this.nitroActive ? "rgba(255, 0, 128, 0.65)" : "rgba(0, 240, 255, 0.55)");
      underglowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = underglowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 4, pW * 0.65, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Aerodynamic Chassis Base
      ctx.fillStyle = "#0c1322";
      ctx.strokeStyle = this.nitroActive ? "#ff007f" : "#00f0ff";
      ctx.lineWidth = 2.8;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(-pW * 0.5, 0);
      ctx.lineTo(-pW * 0.42, -pH * 0.72);
      ctx.lineTo(-pW * 0.28, -pH);
      ctx.lineTo(pW * 0.28, -pH);
      ctx.lineTo(pW * 0.42, -pH * 0.72);
      ctx.lineTo(pW * 0.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cockpit Windshield Glass
      ctx.fillStyle = "#18243b";
      ctx.beginPath();
      ctx.moveTo(-pW * 0.26, -pH * 0.88);
      ctx.lineTo(-pW * 0.34, -pH * 0.4);
      ctx.lineTo(pW * 0.34, -pH * 0.4);
      ctx.lineTo(pW * 0.26, -pH * 0.88);
      ctx.closePath();
      ctx.fill();

      // Rear Spoiler / Fin Wing
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(-pW * 0.46, -4, pW * 0.92, 5);

      // Tail Lights / Brake Lightbar
      ctx.fillStyle = this.isBraking ? "#ff0033" : "#ff2255";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = this.isBraking ? 20 : 10;
      ctx.fillRect(-pW * 0.44, -2, pW * 0.88, this.isBraking ? 7 : 4);
      ctx.shadowBlur = 0;

      // Active Cyber Shield Lattice Bubble
      if (this.shieldActive) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.45 + Math.sin(this.shieldPulse) * 0.28})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(0, -pH * 0.5, pW * 0.7, pH * 0.92, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // ── 8. RENDER FLOATING COMBAT TEXTS ──
      this.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 14;
        ctx.font = "bold 18px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // ── 9. HOLOGRAPHIC 3D STEERING WHEEL HUD (BOTTOM RIGHT) ──
      const wheelX = w - 95;
      const wheelY = h - 95;
      ctx.save();
      ctx.translate(wheelX, wheelY);

      // Outer glow rim
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Rotated Wheel Rim
      ctx.rotate((this.steeringAngle * Math.PI / 180));
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Center Hub
      ctx.fillStyle = "rgba(14, 19, 32, 0.92)";
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spoke bars
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(-46, -3, 92, 6);
      ctx.fillRect(-3, 0, 6, 46);

      // Hand Sensor Grip Nodes
      ctx.fillStyle = trackingState.hand1.detected ? "#10b981" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(-50, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = trackingState.hand2.detected ? "#10b981" : (trackingState.hand1.detected ? "#94a3b8" : "#f59e0b");
      ctx.beginPath();
      ctx.arc(50, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Telemetry Labels
      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(this.steeringAngle)}° TILT`, wheelX, wheelY + 70);
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(this.steerMode, wheelX, wheelY + 84);

      // ── 10. TOP SPEEDOMETER & TELEMETRY HUD ──
      ctx.textAlign = "left";
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 28px 'JetBrains Mono', monospace";
      ctx.fillText(`${Math.round(this.speed)} KM/H`, 28, 44);

      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
      ctx.fillText(`DIST: ${(this.distance / 1000).toFixed(2)} KM | SHIELD: ${this.shieldActive ? "ACTIVE 🛡️" : "DEPLETED ⚠️"}`, 28, 68);

      // Nitro Fuel Gauge Bar
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(28, 80, 150, 9);
      ctx.fillStyle = this.nitroActive ? "#ff007f" : "#00f0ff";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillRect(28, 80, 150 * (this.nitroFuel / 100), 9);
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  // =========================================================
  // 2. TACTICAL GESTURE CROSSHAIR (Target Shooting Engine)
  // =========================================================
  class TacticalCrosshairGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.crosshairX = this.width / 2;
      this.crosshairY = this.height / 2;
      this.targets = [];
      this.bulletHoles = [];
      this.particles = [];
      this.laserBeams = [];
      this.floatingTexts = [];
      this.recoil = 0;
      this.blasterRecoil = 0;
      this.ammo = 8;
      this.maxAmmo = 8;
      this.wasPinching = false;
      this.wasReloading = false;
      this.timer = 45;
      this.spawnTimer = 0;
      this.radarAngle = 0;
      this.shotsFired = 0;
      this.shotsHit = 0;
      this.headshots = 0;
      this.hoveredTarget = null;

      // Spawn initial balanced targets
      for (let i = 0; i < 5; i++) {
        this.spawnTarget();
      }
    }

    spawnTarget() {
      const types = ["drone", "bullseye", "stealth", "civilian"];
      const randType = types[Math.floor(Math.random() * types.length)];
      const rad = randType === "bullseye" ? 34 : (randType === "civilian" ? 30 : 28);

      this.targets.push({
        x: rad + 40 + Math.random() * (this.width - rad * 2 - 80),
        y: rad + 60 + Math.random() * (this.height - rad * 2 - 140),
        radius: rad,
        life: randType === "civilian" ? 5.5 : 4.2,
        maxLife: randType === "civilian" ? 5.5 : 4.2,
        type: randType,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        rotorAngle: 0
      });
    }

    update(dt) {
      if (!super.update(dt)) return; // Pauses physics on lost hand tracking

      this.timer -= dt;
      if (this.timer <= 0) {
        this.endGame(this.score);
        return;
      }

      this.radarAngle = (this.radarAngle + dt * 2.2) % (Math.PI * 2);

      // Smooth Crosshair Tracking to Index Fingertip Landmark
      const p = this.pointer || this.getPointerPos();
      const targetX = (p.rawX != null ? p.rawX : 0.5) * this.width;
      const targetY = (p.rawY != null ? p.rawY : 0.5) * this.height;

      this.crosshairX += (targetX - this.crosshairX) * 24 * dt;
      this.crosshairY += (targetY - this.crosshairY) * 24 * dt;

      // Check hovered target for Tactical Lock-On
      this.hoveredTarget = null;
      const aimY = this.crosshairY - this.recoil;
      for (const t of this.targets) {
        const dist = Math.hypot(this.crosshairX - t.x, aimY - t.y);
        if (dist <= t.radius) {
          this.hoveredTarget = t;
          break;
        }
      }

      // Shoot Trigger strictly on Pinch Snap (Index + Thumb)
      const isPinching = p.isPinch || p.isTrigger;
      if (isPinching && !this.wasPinching) {
        this.shoot();
      }
      this.wasPinching = isPinching;

      // Gesture Reload strictly on Open Palm
      const isReloading = p.isOpenPalm;
      if (isReloading && !this.wasReloading && this.ammo < this.maxAmmo) {
        this.reload();
      }
      this.wasReloading = isReloading;

      // Recoil Recovery
      this.recoil = Math.max(0, this.recoil - 50 * dt);
      this.blasterRecoil = Math.max(0, this.blasterRecoil - 60 * dt);

      // Target Spawner & Lifecycles
      this.spawnTimer += dt;
      if (this.spawnTimer > 1.1 && this.targets.length < 6) {
        this.spawnTarget();
        this.spawnTimer = 0;
      }

      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        t.life -= dt;
        t.rotorAngle = (t.rotorAngle + dt * 14) % (Math.PI * 2);

        // Boundary bounce
        if (t.x < t.radius + 30 || t.x > this.width - t.radius - 30) t.vx *= -1;
        if (t.y < t.radius + 60 || t.y > this.height - t.radius - 90) t.vy *= -1;

        if (t.life <= 0) {
          this.targets.splice(i, 1);
        }
      }

      // Particle physics
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }

      // Laser tracer fade
      for (let i = this.laserBeams.length - 1; i >= 0; i--) {
        const lb = this.laserBeams[i];
        lb.life -= dt;
        if (lb.life <= 0) this.laserBeams.splice(i, 1);
      }

      // Bullet holes fade
      for (let i = this.bulletHoles.length - 1; i >= 0; i--) {
        const bh = this.bulletHoles[i];
        bh.life -= dt;
        if (bh.life <= 0) this.bulletHoles.splice(i, 1);
      }

      // Floating text rise & fade
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 46 * dt;
        ft.life -= dt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    shoot() {
      if (this.ammo <= 0) {
        audio.playWrong();
        this.floatingTexts.push({
          text: "OUT OF AMMO! RELOAD ✋",
          color: "#ef4444",
          x: this.crosshairX,
          y: this.crosshairY - 30,
          life: 0.85
        });
        return;
      }

      this.ammo--;
      this.shotsFired++;
      this.recoil = 24;
      this.blasterRecoil = 32;
      audio.playLaser();

      const shotY = this.crosshairY - this.recoil;

      // Laser Tracer from blaster muzzle
      this.laserBeams.push({
        x1: this.width * 0.88,
        y1: this.height,
        x2: this.crosshairX,
        y2: shotY,
        life: 0.14
      });

      // Hit collision test
      let hit = false;
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        const dist = Math.hypot(this.crosshairX - t.x, shotY - t.y);

        if (dist <= t.radius) {
          hit = true;
          this.shotsHit++;

          if (t.type === "civilian") {
            // Friendly Fire Penalty!
            audio.playWrong();
            this.addScore(-150);
            this.resetStreak();
            this.floatingTexts.push({
              text: "⚠️ FRIENDLY FIRE! -150",
              color: "#ef4444",
              x: t.x,
              y: t.y,
              life: 1.2
            });
          } else {
            const isCritical = dist < t.radius * 0.35;
            if (isCritical) {
              this.headshots++;
              audio.playExplosion();
              audio.playScore();
              this.addScore(250);
              this.addMultiplier(1);
              this.timer = Math.min(60, this.timer + 1.5); // Bonus time on headshot
              this.floatingTexts.push({
                text: "🎯 CRITICAL HEADSHOT! +250",
                color: "#f59e0b",
                x: t.x,
                y: t.y,
                life: 1.2
              });
            } else {
              audio.playPop();
              this.addScore(100);
              this.addMultiplier(1);
              this.floatingTexts.push({
                text: "+100 HIT!",
                color: "#00f0ff",
                x: t.x,
                y: t.y,
                life: 1.0
              });
            }

            // Explosion sparks
            for (let k = 0; k < 28; k++) {
              this.particles.push({
                x: t.x,
                y: t.y,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 400,
                color: isCritical ? "#f59e0b" : "#ef4444",
                life: 0.5 + Math.random() * 0.28
              });
            }
          }

          this.targets.splice(i, 1);
          break;
        }
      }

      if (!hit) {
        this.resetStreak();
        this.bulletHoles.push({
          x: this.crosshairX,
          y: shotY,
          life: 8.0
        });
      }
    }

    reload() {
      this.ammo = this.maxAmmo;
      audio.playReload();
      this.floatingTexts.push({
        text: "⚡ MAGAZINE RELOADED",
        color: "#10b981",
        x: this.crosshairX,
        y: this.crosshairY - 30,
        life: 0.95
      });
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // ── 1. 3D CYBER TACTICAL SHOOTING RANGE CHAMBER ──
      ctx.fillStyle = "#06080e";
      ctx.fillRect(0, 0, w, h);

      // Perspective Wall Grid Lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Radar Sweep Cone
      ctx.save();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.14)";
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.5);
      ctx.lineTo(w * 0.5 + Math.cos(this.radarAngle) * w * 0.7, h * 0.5 + Math.sin(this.radarAngle) * w * 0.7);
      ctx.stroke();
      ctx.restore();

      // Scorch Marks / Bullet Holes
      this.bulletHoles.forEach(bh => {
        ctx.save();
        ctx.fillStyle = "rgba(239, 68, 68, 0.65)";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Laser Tracer Beams
      this.laserBeams.forEach(lb => {
        ctx.save();
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(lb.x1, lb.y1);
        ctx.lineTo(lb.x2, lb.y2);
        ctx.stroke();

        // White hot core
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lb.x1, lb.y1);
        ctx.lineTo(lb.x2, lb.y2);
        ctx.stroke();
        ctx.restore();
      });

      // ── 2. RENDER TARGET ENTITIES ──
      this.targets.forEach(t => {
        ctx.save();
        ctx.translate(t.x, t.y);

        if (t.type === "drone") {
          // Tactical Drone Body
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2.8;
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Dual spinning rotor arms
          ctx.rotate(t.rotorAngle);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-t.radius * 1.35, 0);
          ctx.lineTo(t.radius * 1.35, 0);
          ctx.moveTo(0, -t.radius * 1.35);
          ctx.lineTo(0, t.radius * 1.35);
          ctx.stroke();

          // Red Drone Core with optical eye lens
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(0, 0, t.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (t.type === "bullseye") {
          // Concentric Golden Target
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
          ctx.beginPath();
          ctx.arc(0, 0, t.radius * 0.7, 0, Math.PI * 2);
          ctx.stroke();

          // Golden Bullseye Core (Critical)
          ctx.fillStyle = "#f59e0b";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else if (t.type === "stealth") {
          // Stealth Interceptor
          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 2.8;
          ctx.shadowColor = "#c084fc";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, -t.radius);
          ctx.lineTo(t.radius, 0);
          ctx.lineTo(0, t.radius);
          ctx.lineTo(-t.radius, 0);
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = "rgba(192, 132, 252, 0.4)";
          ctx.fill();
        } else {
          // Friendly Civilian Hologram (Do Not Shoot)
          ctx.strokeStyle = "#00f0ff";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
          ctx.fill();

          ctx.fillStyle = "#00f0ff";
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText("CIVILIAN", 0, 3);
        }

        // Life Countdown Ring
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, t.radius + 7, 0, (t.life / t.maxLife) * Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // Explosion Sparks
      this.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Floating Combat Texts
      this.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 12;
        ctx.font = "bold 16px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // ── 3. RENDER 3D FUTURISTIC HEAVY BLASTER CANNON (BOTTOM RIGHT) ──
      ctx.save();
      const gunBaseX = w * 0.88;
      const gunBaseY = h + this.blasterRecoil;
      ctx.translate(gunBaseX, gunBaseY);

      // Blaster chassis barrel
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(-12, -75);
      ctx.lineTo(12, -75);
      ctx.lineTo(28, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Energy power core slit
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 12;
      ctx.fillRect(-4, -60, 8, 35);
      ctx.shadowBlur = 0;

      ctx.restore();

      // ── 4. RENDER TACTICAL SMART LASER CROSSHAIR ──
      const chX = this.crosshairX;
      const chY = this.crosshairY - this.recoil;
      const isLocked = this.hoveredTarget && this.hoveredTarget.type !== "civilian";
      const isFriendlyWarning = this.hoveredTarget && this.hoveredTarget.type === "civilian";
      const reticleColor = isFriendlyWarning ? "#00f0ff" : (isLocked ? "#10b981" : "#ef4444");

      ctx.save();
      ctx.strokeStyle = reticleColor;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = reticleColor;
      ctx.shadowBlur = 12;

      // Outer Range Ring
      ctx.beginPath();
      ctx.arc(chX, chY, isLocked ? 28 : 22, 0, Math.PI * 2);
      ctx.stroke();

      // Precision Crossbars
      ctx.beginPath();
      ctx.moveTo(chX - 36, chY);
      ctx.lineTo(chX - 8, chY);
      ctx.moveTo(chX + 8, chY);
      ctx.lineTo(chX + 36, chY);
      ctx.moveTo(chX, chY - 36);
      ctx.lineTo(chX, chY - 8);
      ctx.moveTo(chX, chY + 8);
      ctx.lineTo(chX, chY + 36);
      ctx.stroke();

      // Center Laser Dot
      ctx.fillStyle = reticleColor;
      ctx.beginPath();
      ctx.arc(chX, chY, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Target Lock Status Tag
      if (isLocked) {
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillText("TARGET LOCKED [PINCH SNAP TO FIRE]", chX + 34, chY - 14);
      } else if (isFriendlyWarning) {
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillText("NO FIRE - FRIENDLY", chX + 34, chY - 14);
      }

      ctx.restore();

      // ── 5. TELEMETRY HUD (STRICTLY PURE GESTURE) ──
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 16px 'JetBrains Mono', monospace";
      ctx.fillText(`AMMO: ${"▮".repeat(this.ammo)}${"▯".repeat(this.maxAmmo - this.ammo)}`, 28, 44);
      ctx.fillText(`TIME: ${Math.max(0, Math.ceil(this.timer))}s`, w - 140, 44);

      const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 100;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
      ctx.fillText(`ACCURACY: ${acc}% | HEADSHOTS: ${this.headshots} | 🤏 PINCH TO FIRE · ✋ OPEN PALM TO RELOAD`, 28, 68);
    }
  }

  // =========================================================
  // 3. AURA FLIGHT HORIZON (Sky Rings Flight Simulator)
  // =========================================================
  class FlightHorizonGame extends BaseGame {
    constructor(canvas, arenaState) {
      super(canvas, arenaState);
      this.planeX = this.width / 2;
      this.planeY = this.height / 2;
      this.planeRoll = 0; // roll angle in rad
      this.rings = [];
      this.clouds = [];
      this.contrailParticles = [];
      this.score = 0;
      this.timer = 60;
      this.flightSpeed = 280;

      // Spawn initial rings
      for (let i = 0; i < 6; i++) {
        this.rings.push({
          x: (Math.random() - 0.5) * this.width * 0.7,
          y: (Math.random() - 0.5) * this.height * 0.6,
          z: 300 + i * 220,
          passed: false,
          color: i % 2 === 0 ? "#00f0ff" : "#f59e0b"
        });
      }
    }

    update(dt) {
      super.update(dt);
      this.timer -= dt;
      if (this.timer <= 0) {
        this.endGame(this.score);
        return;
      }

      // Open Palm coordinates control jet flight position & roll:
      const targetX = this.handX * this.width;
      const targetY = this.handY * this.height;

      // Roll angle from horizontal displacement or wrist-middle vector
      let targetRoll = (this.handX - 0.5) * 0.9;
      if (trackingState.landmarks && trackingState.landmarks.length > 0) {
        const wrist = trackingState.landmarks[0][0];
        const mcp = trackingState.landmarks[0][9];
        targetRoll = (mcp.x - wrist.x) * 2.2;
      }

      this.planeX += (targetX - this.planeX) * 7 * dt;
      this.planeY += (targetY - this.planeY) * 7 * dt;
      this.planeRoll += (targetRoll - this.planeRoll) * 6 * dt;

      // Update rings moving toward camera
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.z -= this.flightSpeed * dt;

        // Plane passes through ring
        if (r.z <= 60 && !r.passed) {
          const screenX = this.width * 0.5 + r.x;
          const screenY = this.height * 0.5 + r.y;
          const dist = Math.hypot(this.planeX - screenX, this.planeY - screenY);

          if (dist < 75) {
            audio.playScore();
            this.addScore(200);
            this.addMultiplier(1);
          } else {
            audio.playWrong();
            this.addMultiplier(-1);
          }
          r.passed = true;
        }

        if (r.z <= 0) {
          this.rings.splice(i, 1);
          this.rings.push({
            x: (Math.random() - 0.5) * this.width * 0.75,
            y: (Math.random() - 0.5) * this.height * 0.65,
            z: 1400,
            passed: false,
            color: Math.random() > 0.5 ? "#00f0ff" : "#f59e0b"
          });
        }
      }

      // Contrail particles behind wings
      this.contrailParticles.push({
        x: this.planeX - 35,
        y: this.planeY,
        life: 0.35
      });
      this.contrailParticles.push({
        x: this.planeX + 35,
        y: this.planeY,
        life: 0.35
      });

      for (let i = this.contrailParticles.length - 1; i >= 0; i--) {
        const p = this.contrailParticles[i];
        p.life -= dt;
        if (p.life <= 0) this.contrailParticles.splice(i, 1);
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // Stratospheric sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#030614");
      sky.addColorStop(0.6, "#091738");
      sky.addColorStop(1, "#182c58");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Render 3D Perspective Sky Rings
      this.rings.slice().sort((a, b) => b.z - a.z).forEach(r => {
        const scale = 300 / Math.max(10, r.z);
        const ringScreenX = w * 0.5 + r.x * scale;
        const ringScreenY = h * 0.5 + r.y * scale;
        const radius = 65 * scale;

        ctx.strokeStyle = r.color;
        ctx.lineWidth = Math.max(2, 5 * scale);
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ringScreenX, ringScreenY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Contrail smoke
      this.contrailParticles.forEach(p => {
        ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player Supersonic Jet
      ctx.save();
      ctx.translate(this.planeX, this.planeY);
      ctx.rotate(this.planeRoll);

      // Jet Delta Wings
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(0, -32); // Nose
      ctx.lineTo(42, 22);  // Right Wing
      ctx.lineTo(14, 16);  // Right Body
      ctx.lineTo(0, 26);   // Tail
      ctx.lineTo(-14, 16); // Left Body
      ctx.lineTo(-42, 22); // Left Wing
      ctx.closePath();
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cockpit Canopy
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.ellipse(0, -8, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jet Thruster Glow
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, 24, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // HUD Telemetry
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 16px 'JetBrains Mono', monospace";
      ctx.fillText(`TIME: ${Math.max(0, Math.ceil(this.timer))}s`, 28, 44);
      ctx.fillText(`ALTITUDE: 14,200 FT`, w - 210, 44);
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("OPEN PALM TO PITCH & BANK JET THROUGH RINGS", 28, 68);
    }
  }

  // ── GAME FACTORY MAPPER ──
  function createGameInstance(gameId, canvas, arenaState) {
    switch (gameId) {
      case "cyber-highway-racer": return new CyberHighwayRacerGame(canvas, arenaState);
      case "tactical-crosshair": return new TacticalCrosshairGame(canvas, arenaState);
      case "flight-horizon": return new FlightHorizonGame(canvas, arenaState);
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
    if (!trackingState.cameraActive) {
      startWebcam();
    }

    // Stop existing loop
    if (activeGameAnimationId) cancelAnimationFrame(activeGameAnimationId);

    activeGameInstance = createGameInstance(gameId, canvas, gameMeta);

    let lastTimestamp = performance.now();
    function gameLoop(now) {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (activeGameInstance && !activeGameInstance.isOver) {
        if (!activeGameInstance.isPaused) {
          activeGameInstance.update(dt);
        }
        activeGameInstance.render();
        if (activeGameInstance.isAwaitingHands) {
          activeGameInstance.drawAwaitingHandsOverlay();
        }
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
    if (activeGameInstance && typeof activeGameInstance.cleanup === "function") {
      activeGameInstance.cleanup();
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
    const recalBtn = document.getElementById("arcadeRecalibrateBtn");
    if (recalBtn) recalBtn.addEventListener("click", () => {
      stopWebcam();
      setTimeout(startWebcam, 300);
    });

    const reenableBtn = document.getElementById("btnReenableCamera");
    if (reenableBtn) reenableBtn.addEventListener("click", () => {
      stopWebcam();
      setTimeout(startWebcam, 100);
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

    // Window Resize Observer for Game Canvas
    window.addEventListener("resize", () => {
      if (activeGameInstance) activeGameInstance.resize();
    });
  }

  function cleanupGestureArcadeHub() {
    closeGameArena();
    stopWebcam();
  }

  // Export globally
  window.initGestureArcadeHub = initGestureArcadeHub;
  window.launchGameArena = launchGameArena;
  window.cleanupGestureArcadeHub = cleanupGestureArcadeHub;
  window.closeGestureGameArena = closeGameArena;
})();

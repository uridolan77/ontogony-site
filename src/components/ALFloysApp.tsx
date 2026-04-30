// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, MousePointer2, Paintbrush,
  Activity, Zap, Loader2, Plus, Minus, Move, ChevronLeft, ChevronRight, X,
  Grid3X3, Layers, RefreshCcw, Moon, Crosshair, Pin, PinOff, GripHorizontal, Sparkles, Volume2
} from 'lucide-react';

// --- STYLES FOR NATIVE RANGE SLIDERS ---
const globalStyles = `
  input[type=range].custom-slider {
    -webkit-appearance: none;
    background: transparent;
    width: 100%;
  }
  input[type=range].custom-slider:focus {
    outline: none;
  }
  input[type=range].custom-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 1px;
    cursor: pointer;
    background: #e4e4e7;
  }
  input[type=range].custom-slider::-webkit-slider-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #a1a1aa;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -5.5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  input[type=range].custom-slider:focus::-webkit-slider-thumb {
    border-color: #2563eb;
  }
  input[type=range].lenia-slider::-webkit-slider-thumb { border-color: #2563eb; background: #2563eb; }
  input[type=range].physarum-slider::-webkit-slider-thumb { border-color: #9333ea; background: #9333ea; }
  input[type=range].turing-slider::-webkit-slider-thumb { border-color: #ec4899; background: #ec4899; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- GEMINI API INTEGRATION ---
const callGemini = async (systemPrompt, userPrompt, useJSON = false, retries = 5) => {
  const apiKey = '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  if (useJSON) {
      payload.generationConfig = { responseMimeType: 'application/json' };
  }

  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No text in response');
      return useJSON ? JSON.parse(text) : text;
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }
};

const MAX_PARTICLES = 10000;
const SPECIES_COLORS = ['#16a34a', '#d97706', '#e11d48', '#2563eb', '#9333ea', '#f97316'];

const WALKTHROUGHS = {
  boids: [
    { text: "Welcome to Flocking. We start with particles moving randomly. They have no rules and ignore each other completely.", setup: (e) => { e.setPreset('boids'); e.params.boids.alignment = 0; e.params.boids.cohesion = 0; e.params.boids.repulsion = 0; e.params.boids.vision = 36; } },
    { text: "Rule 1: Alignment. We give them a simple rule: steer towards the average heading of your neighbors. Notice how they form organized 'highways'.", setup: (e) => { e.params.boids.alignment = 1.0; e.params.boids.cohesion = 0; e.params.boids.repulsion = 0; } },
    { text: 'Rule 2: Cohesion. Now we tell them to steer toward the center of mass of their local group. They begin to clump together, but they collide and overlap.', setup: (e) => { e.params.boids.alignment = 1.0; e.params.boids.cohesion = 0.7; e.params.boids.repulsion = 0; } },
    { text: 'Rule 3: Separation. We add repulsion to give them personal space. The balance of these 3 simple, local rules creates the complex, emergent global behavior of a flock.', setup: (e) => { e.params.boids.alignment = 1.0; e.params.boids.cohesion = 0.7; e.params.boids.repulsion = 1.5; e.params.boids.vision = 36; } }
  ],
  ecosystem: [
    { text: 'This is a Lotka-Volterra energy model. Plants (green) grow spontaneously. Herbivores (amber) eat plants. Carnivores (red) eat herbivores. If they eat enough, they reproduce. If they do not, they starve.', setup: (e) => { e.setPreset('ecosystem'); e.params.ecosys.mutationRate = 0.0; } },
    { text: "EVOLUTION: We've enabled Genetic Drift. Every time a creature reproduces, its Speed and Vision mutate slightly. We've tied their Speed gene to their Color Hue.", setup: (e) => { e.params.ecosys.mutationRate = 0.15; } },
    { text: 'Watch Darwinian evolution happen live. Faster, brighter yellow herbivores might outrun predators, while slower, darker ones get eaten. Over generations, the predominant colors of the species will shift based on who survives.', setup: (e) => { e.params.ecosys.mutationRate = 0.2; } }
  ],
  lenia: [
    { text: "Lenia is a continuous cellular automaton. Unlike Conway's Game of Life, space, time, and states are continuous. Particles interact using a smooth Gaussian kernel.", setup: (e) => { e.setPreset('lenia'); e.params.lenia.mu = 0.15; e.params.lenia.sigma = 0.017; } },
    { text: 'Growth mu determines the ideal distance for attraction, while sigma determines the strictness. A tiny shift breaks the balance, dissolving the ordered blobs into a chaotic, writhing mass.', setup: (e) => { e.params.lenia.sigma = 0.035; } }
  ],
  physarum: [
    { text: 'Physarum simulates Slime Mold. Each particle moves blindly forward, depositing a chemical pheromone trail onto a hidden grid below it.', setup: (e) => { e.setPreset('physarum'); e.params.physarum.sensorAngle = 0; } },
    { text: 'The particles have three antennae (forward, left, right). When we increase the sensor angle, they begin turning toward the strongest pheromone scent.', setup: (e) => { e.params.physarum.sensorAngle = 0.78; } },
    { text: 'SLIME WARS: We have introduced a rival species (Orange). Particles are violently repelled by the rival pheromones, creating an emergent fight for territorial dominance.', setup: (e) => { e.params.physarum.decay = 0.95; } }
  ],
  turing: [
    { text: 'Alan Turing proposed this Reaction-Diffusion model to explain how leopards get their spots and zebras get their stripes.', setup: (e) => { e.setPreset('turing'); e.params.turing.feed = 0.055; e.params.turing.kill = 0.062; } },
    { text: 'It consists of two chemicals. A is continuously fed into the system, while B kills A and replicates itself.', setup: (e) => { e.params.turing.feed = 0.055; e.params.turing.kill = 0.062; } },
    { text: 'By slightly adjusting the Feed and Kill rates, the emergent shapes drastically transform from spots to complex brain-coral labyrinths, or even self-replicating solitary cells.', setup: (e) => { e.params.turing.feed = 0.036; e.params.turing.kill = 0.060; } }
  ]
};

class SonificationEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.drones = {};
    this.enabled = false;
    this.lastEventTimes = {};
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.enabled = true;
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.15;
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.master.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    this.drones.base = this.ctx.createOscillator();
    this.drones.base.type = 'sine';
    this.drones.base.frequency.value = 55;
    this.drones.baseGain = this.ctx.createGain();
    this.drones.baseGain.gain.value = 0;
    this.drones.base.connect(this.drones.baseGain).connect(this.master);
    this.drones.base.start();

    this.drones.high = this.ctx.createOscillator();
    this.drones.high.type = 'triangle';
    this.drones.high.frequency.value = 220;
    this.drones.highGain = this.ctx.createGain();
    this.drones.highGain.gain.value = 0;
    this.drones.high.connect(this.drones.highGain).connect(this.master);
    this.drones.high.start();

    this.enabled = true;
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
    this.enabled = false;
  }

  playEvent(type, intensity = 1.0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.lastEventTimes[type] && now - this.lastEventTimes[type] < 0.04) return;
    this.lastEventTimes[type] = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.master);

    if (type === 'eat') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08 * Math.min(1.5, intensity), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'birth') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330 + Math.random() * 100, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04 * intensity, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'bounce') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06 * intensity, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  update(stats) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const popRatio = Math.min(1.0, stats.pop / 10000);
    this.drones.baseGain.gain.setTargetAtTime(popRatio * 0.6, now, 0.5);
    this.drones.base.frequency.setTargetAtTime(55 + popRatio * 20, now, 0.5);

    const speedRatio = Math.min(1.0, stats.speed / 5.0);
    this.drones.highGain.gain.setTargetAtTime(speedRatio * 0.15, now, 0.2);
    this.drones.high.frequency.setTargetAtTime(220 + speedRatio * 440, now, 0.2);
  }
}

class AILifeEngine {
  constructor(width, height) {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
    this.alive = new Uint8Array(MAX_PARTICLES);
    this.x = new Float32Array(MAX_PARTICLES);
    this.y = new Float32Array(MAX_PARTICLES);
    this.vx = new Float32Array(MAX_PARTICLES);
    this.vy = new Float32Array(MAX_PARTICLES);
    this.species = new Uint8Array(MAX_PARTICLES);
    this.energy = new Float32Array(MAX_PARTICLES);
    this.genesSpeed = new Float32Array(MAX_PARTICLES);
    this.genesVision = new Float32Array(MAX_PARTICLES);
    this.genesSize = new Float32Array(MAX_PARTICLES);
    this.hue = new Float32Array(MAX_PARTICLES);
    this.age = new Float32Array(MAX_PARTICLES);
    this.generation = new Uint16Array(MAX_PARTICLES);
    this.targetId = new Int32Array(MAX_PARTICLES).fill(-1);
    this.audioQueue = [];
    this.avgSpeed = 0;
    this.trackedId = -1;
    this.camera = { x: this.width / 2, y: this.height / 2, zoom: 1.0 };
    this.mode = 'boids';
    this.params = {
      boids: { pop: 1200, species: 4, speed: 2.6, repulsion: 1.5, alignment: 1.0, cohesion: 0.7, vision: 36, friction: 0.02 },
      ecosys: { plantGrowth: 0.04, plantCap: 600, baseHerbVision: 60, baseCarnVision: 90, baseHerbSpeed: 1.4, baseCarnSpeed: 1.9, herbRepro: 90, carnRepro: 140, mutationRate: 0.1 },
      lenia: { mu: 0.15, sigma: 0.017, kernel: 11, dt: 0.10 },
      physarum: { pop: 6000, speed: 2.0, sensorDist: 15, sensorAngle: 0.78, rotAngle: 0.78, decay: 0.95 },
      turing: { feed: 0.055, kill: 0.062, da: 1.0, db: 0.5, dt: 1.0 }
    };
    this.popCounts = [0, 0, 0, 0, 0, 0];
    this.history = [[], [], [], [], [], []];
    this.tickCount = 0;
    this.gridScale = 3;
    this.initPhysarumGrid();
    this.initTerrainGrid();
    this.initTuringGrid();
    this.setPreset('boids');
  }

  resize(w, h) {
    w = Math.max(1, Math.floor(w));
    h = Math.max(1, Math.floor(h));
    if (this.width === w && this.height === h) return;
    const oldTerrain = this.terrain;
    const oldC = this.tCols;
    const oldR = this.tRows;
    this.width = w;
    this.height = h;
    const oldTrailA = this.trailGridA;
    const oldTrailB = this.trailGridB;
    const oldPW = this.gridW;
    const oldPH = this.gridH;
    const oldTuringA = this.tA;
    const oldTuringB = this.tB;
    const oldTW = this.turingW;
    const oldTH = this.turingH;
    this.initPhysarumGrid();
    this.initTerrainGrid();
    this.initTuringGrid();
    if (oldTerrain) {
      for (let y = 0; y < Math.min(oldR, this.tRows); y++) {
        for (let x = 0; x < Math.min(oldC, this.tCols); x++) {
          this.terrain[x + y * this.tCols] = oldTerrain[x + y * oldC];
        }
      }
      this.terrainNeedsUpdate = true;
    }
    if (oldTrailA && oldTrailB) {
      for (let y = 0; y < Math.min(oldPH, this.gridH); y++) {
        for (let x = 0; x < Math.min(oldPW, this.gridW); x++) {
          this.trailGridA[x + y * this.gridW] = oldTrailA[x + y * oldPW];
          this.trailGridB[x + y * this.gridW] = oldTrailB[x + y * oldPW];
        }
      }
    }
    if (oldTuringA && oldTuringB) {
      for (let y = 0; y < Math.min(oldTH, this.turingH); y++) {
        for (let x = 0; x < Math.min(oldTW, this.turingW); x++) {
          this.tA[x + y * this.turingW] = oldTuringA[x + y * oldTW];
          this.tB[x + y * this.turingW] = oldTuringB[x + y * oldTW];
        }
      }
    }
  }

  initPhysarumGrid() {
    this.gridW = Math.max(1, Math.ceil(this.width / this.gridScale));
    this.gridH = Math.max(1, Math.ceil(this.height / this.gridScale));
    this.trailGridA = new Float32Array(this.gridW * this.gridH);
    this.trailGridNextA = new Float32Array(this.gridW * this.gridH);
    this.trailGridB = new Float32Array(this.gridW * this.gridH);
    this.trailGridNextB = new Float32Array(this.gridW * this.gridH);
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.gridW;
    this.offscreenCanvas.height = this.gridH;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    this.imgData = this.offscreenCtx.createImageData(this.gridW, this.gridH);
  }

  initTerrainGrid() {
    this.terrainGridScale = 5;
    this.tCols = Math.max(1, Math.ceil(this.width / this.terrainGridScale));
    this.tRows = Math.max(1, Math.ceil(this.height / this.terrainGridScale));
    this.terrain = new Uint8Array(this.tCols * this.tRows);
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = this.width;
    this.terrainCanvas.height = this.height;
    this.terrainCtx = this.terrainCanvas.getContext('2d');
    this.terrainNeedsUpdate = true;
    this.lastDark = null;
  }

  initTuringGrid() {
    this.turingScale = 2;
    this.turingW = Math.max(1, Math.ceil(this.width / this.turingScale));
    this.turingH = Math.max(1, Math.ceil(this.height / this.turingScale));
    const size = this.turingW * this.turingH;
    this.tA = new Float32Array(size).fill(1.0);
    this.tB = new Float32Array(size).fill(0.0);
    this.nextTA = new Float32Array(size);
    this.nextTB = new Float32Array(size);
    this.turingCanvas = document.createElement('canvas');
    this.turingCanvas.width = this.turingW;
    this.turingCanvas.height = this.turingH;
    this.turingCtx = this.turingCanvas.getContext('2d', { willReadFrequently: true });
    this.turingImgData = this.turingCtx.createImageData(this.turingW, this.turingH);
  }

  getTerrain(px, py) {
    if (!this.terrain) return 0;
    let gx = Math.floor(px / this.terrainGridScale);
    let gy = Math.floor(py / this.terrainGridScale);
    gx = ((gx % this.tCols) + this.tCols) % this.tCols;
    gy = ((gy % this.tRows) + this.tRows) % this.tRows;
    return this.terrain[gx + gy * this.tCols];
  }

  updateTerrainCanvas(isDark) {
    if (!this.terrainNeedsUpdate && this.lastDark === isDark) return;
    this.terrainCtx.clearRect(0, 0, this.width, this.height);
    for (let y = 0; y < this.tRows; y++) {
      for (let x = 0; x < this.tCols; x++) {
        let t = this.terrain[x + y * this.tCols];
        if (t === 1) {
          this.terrainCtx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.6)';
          this.terrainCtx.fillRect(x * this.terrainGridScale, y * this.terrainGridScale, this.terrainGridScale, this.terrainGridScale);
        } else if (t === 2) {
          this.terrainCtx.fillStyle = isDark ? 'rgba(146, 64, 14, 0.4)' : 'rgba(146, 64, 14, 0.3)';
          this.terrainCtx.fillRect(x * this.terrainGridScale, y * this.terrainGridScale, this.terrainGridScale, this.terrainGridScale);
        }
      }
    }
    this.terrainNeedsUpdate = false;
    this.lastDark = isDark;
  }

  clearTerrain() {
    if (this.terrain) {
      this.terrain.fill(0);
      this.terrainNeedsUpdate = true;
    }
  }

  getSeed() {
    const data = { m: this.mode, p: this.params[this.mode] };
    return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  loadSeed(seedStr) {
    try {
      let base64 = seedStr.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const data = JSON.parse(atob(base64));
      if (data.m && this.params[data.m]) {
        this.mode = data.m;
        this.params[data.m] = { ...this.params[data.m], ...data.p };
        this.setPreset(this.mode);
      }
    } catch (e) {
      console.error('Invalid seed:', e);
    }
  }

  clearAll() {
    this.alive.fill(0);
    this.popCounts.fill(0);
    this.trackedId = -1;
    this.audioQueue = [];
    this.avgSpeed = 0;
  }

  spawn(species, px, py, initialEnergy = 100, parentIdx = -1) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!this.alive[i]) {
        this.alive[i] = 1;
        this.species[i] = species;
        this.x[i] = px;
        this.y[i] = py;
        this.energy[i] = initialEnergy;
        this.age[i] = 0;
        this.generation[i] = parentIdx !== -1 ? this.generation[parentIdx] + 1 : 0;
        this.targetId[i] = -1;
        if (this.mode === 'physarum') {
          this.vx[i] = Math.random() * Math.PI * 2;
          this.vy[i] = 0;
        } else {
          this.vx[i] = (Math.random() - 0.5) * 2;
          this.vy[i] = (Math.random() - 0.5) * 2;
        }
        return;
      }
    }
  }

  initRandom(pop, maxSpecies) {
    this.clearAll();
    for (let i = 0; i < pop; i++) {
      this.spawn(Math.floor(Math.random() * maxSpecies), Math.random() * this.width, Math.random() * this.height, 50 + Math.random() * 50);
    }
  }

  setPreset(preset) {
    this.mode = preset;
    this.trackedId = -1;
    this.clearTerrain();
    if (preset === 'boids') {
      this.initRandom(this.params.boids.pop, this.params.boids.species);
    } else if (preset === 'physarum') {
      this.clearAll();
      this.trailGridA.fill(0);
      this.trailGridNextA.fill(0);
      this.trailGridB.fill(0);
      this.trailGridNextB.fill(0);
      for (let i = 0; i < this.params.physarum.pop; i++) {
        const isTeamA = Math.random() > 0.5;
        const species = isTeamA ? 4 : 5;
        const angle = Math.random() * Math.PI * 2;
        const cx = isTeamA ? this.width * 0.3 : this.width * 0.7;
        const r = Math.random() * Math.min(this.width, this.height) * 0.2;
        this.spawn(species, cx + Math.cos(angle) * r, this.height / 2 + Math.sin(angle) * r, 100);
      }
    } else if (preset === 'turing') {
      this.clearAll();
      this.tA.fill(1.0);
      this.tB.fill(0.0);
      const cx = Math.floor(this.turingW / 2);
      const cy = Math.floor(this.turingH / 2);
      const r = 10;
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (y > 0 && y < this.turingH && x > 0 && x < this.turingW) {
            this.tB[x + y * this.turingW] = 1.0;
          }
        }
      }
    } else {
      this.initRandom(800, 4);
    }
  }

  randomizeParams() {
    if (this.mode === 'boids') {
      this.params.boids.pop = Math.floor(Math.random() * 60) * 100 + 100;
      this.params.boids.species = Math.floor(Math.random() * 4) + 1;
      this.params.boids.speed = 0.1 + Math.random() * 4.9;
      this.params.boids.repulsion = Math.random() * 3.0;
      this.params.boids.alignment = Math.random() * 2.0;
      this.params.boids.cohesion = Math.random() * 2.0;
      this.params.boids.vision = Math.floor(Math.random() * 91) + 10;
      this.params.boids.friction = Math.random() * 0.1;
      this.initRandom(this.params.boids.pop, this.params.boids.species);
    } else if (this.mode === 'physarum') {
      this.params.physarum.pop = Math.floor(Math.random() * 90) * 100 + 1000;
      this.params.physarum.speed = 0.5 + Math.random() * 4.5;
      this.params.physarum.sensorDist = Math.floor(Math.random() * 30) + 5;
      this.params.physarum.sensorAngle = Math.random() * Math.PI;
      this.params.physarum.rotAngle = Math.random() * Math.PI;
      this.params.physarum.decay = 0.8 + Math.random() * 0.19;
      this.setPreset('physarum');
    } else if (this.mode === 'turing') {
      this.params.turing.feed = 0.02 + Math.random() * 0.06;
      this.params.turing.kill = 0.04 + Math.random() * 0.04;
      this.params.turing.da = 0.5 + Math.random() * 1.5;
      this.params.turing.db = 0.2 + Math.random() * 0.8;
      this.setPreset('turing');
    }
  }

  update(mouse) {
    const mode = this.mode;
    this.popCounts.fill(0);
    let totalSpeedSq = 0;
    let activeCount = 0;
    let camTargetX = this.width / 2;
    let camTargetY = this.height / 2;
    let camTargetZoom = 1.0;
    if (this.trackedId !== -1 && mode !== 'turing') {
      if (!this.alive[this.trackedId]) {
        this.trackedId = -1;
      } else {
        camTargetX = this.x[this.trackedId];
        camTargetY = this.y[this.trackedId];
        camTargetZoom = 2.5;
      }
    }
    let dxCam = camTargetX - this.camera.x;
    let dyCam = camTargetY - this.camera.y;
    if (dxCam > this.width / 2) this.camera.x += this.width;
    else if (dxCam < -this.width / 2) this.camera.x -= this.width;
    if (dyCam > this.height / 2) this.camera.y += this.height;
    else if (dyCam < -this.height / 2) this.camera.y -= this.height;
    this.camera.x += (camTargetX - this.camera.x) * 0.1;
    this.camera.y += (camTargetY - this.camera.y) * 0.1;
    this.camera.zoom += (camTargetZoom - this.camera.zoom) * 0.1;

    if (mode === 'turing') {
      const p = this.params.turing;
      const w = this.turingW;
      const h = this.turingH;
      let tA = this.tA;
      let tB = this.tB;
      let nextTA = this.nextTA;
      let nextTB = this.nextTB;
      for (let iter = 0; iter < 4; iter++) {
        for (let y = 1; y < h - 1; y++) {
          let row = y * w;
          let rowUp = (y - 1) * w;
          let rowDn = (y + 1) * w;
          for (let x = 1; x < w - 1; x++) {
            let i = row + x;
            let a = tA[i];
            let b = tB[i];
            let sumA = a * -1 + (tA[i - 1] + tA[i + 1] + tA[rowUp + x] + tA[rowDn + x]) * 0.2 + (tA[rowUp + x - 1] + tA[rowUp + x + 1] + tA[rowDn + x - 1] + tA[rowDn + x + 1]) * 0.05;
            let sumB = b * -1 + (tB[i - 1] + tB[i + 1] + tB[rowUp + x] + tB[rowDn + x]) * 0.2 + (tB[rowUp + x - 1] + tB[rowUp + x + 1] + tB[rowDn + x - 1] + tB[rowDn + x + 1]) * 0.05;
            let ab2 = a * b * b;
            nextTA[i] = a + (p.da * sumA - ab2 + p.feed * (1 - a)) * p.dt;
            nextTB[i] = b + (p.db * sumB + ab2 - (p.kill + p.feed) * b) * p.dt;
          }
        }
        let temp = tA; tA = nextTA; nextTA = temp;
        temp = tB; tB = nextTB; nextTB = temp;
      }
      this.tA = tA;
      this.tB = tB;
      this.nextTA = nextTA;
      this.nextTB = nextTB;
      if (mouse.active && mouse.tool === 'brush') {
        let brushRad = 15;
        let cx = Math.floor(mouse.x / this.turingScale);
        let cy = Math.floor(mouse.y / this.turingScale);
        let tRad = Math.ceil(brushRad / this.turingScale);
        for (let dy = -tRad; dy <= tRad; dy++) {
          for (let dx = -tRad; dx <= tRad; dx++) {
            if (dx * dx + dy * dy <= tRad * tRad) {
              let nx = cx + dx;
              let ny = cy + dy;
              if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1) {
                this.tB[nx + ny * w] = 1.0;
              }
            }
          }
        }
      }
      let totalB = 0;
      for (let i = 0; i < tB.length; i += 20) totalB += tB[i];
      this.avgSpeed = totalB / (tB.length / 20);
      return;
    }

    if (mode === 'physarum') {
      const p = this.params.physarum;
      const w = this.gridW;
      const h = this.gridH;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let sumA = 0;
          let sumB = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              let nx = x + dx;
              let ny = y + dy;
              if (nx < 0) nx = w - 1; else if (nx >= w) nx = 0;
              if (ny < 0) ny = h - 1; else if (ny >= h) ny = 0;
              let idx = nx + ny * w;
              sumA += this.trailGridA[idx];
              sumB += this.trailGridB[idx];
            }
          }
          this.trailGridNextA[x + y * w] = (sumA / 9) * p.decay;
          this.trailGridNextB[x + y * w] = (sumB / 9) * p.decay;
        }
      }
      let tempA = this.trailGridA; this.trailGridA = this.trailGridNextA; this.trailGridNextA = tempA;
      let tempB = this.trailGridB; this.trailGridB = this.trailGridNextB; this.trailGridNextB = tempB;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!this.alive[i]) continue;
        this.popCounts[this.species[i]]++;
        this.age[i]++;
        totalSpeedSq += p.speed * p.speed;
        activeCount++;
        const isA = this.species[i] === 4;
        const ownGrid = isA ? this.trailGridA : this.trailGridB;
        const rivalGrid = isA ? this.trailGridB : this.trailGridA;
        let angle = this.vx[i];
        const sense = (theta) => {
          let sx = this.x[i] + Math.cos(theta) * p.sensorDist;
          let sy = this.y[i] + Math.sin(theta) * p.sensorDist;
          if (this.getTerrain(sx, sy) === 1) return -9999;
          if (sx < 0) sx += this.width; else if (sx >= this.width) sx -= this.width;
          if (sy < 0) sy += this.height; else if (sy >= this.height) sy -= this.height;
          let gx = Math.max(0, Math.min(w - 1, Math.floor(sx / this.gridScale)));
          let gy = Math.max(0, Math.min(h - 1, Math.floor(sy / this.gridScale)));
          let idx = gx + gy * w;
          return ownGrid[idx] - rivalGrid[idx] * 3.0;
        };
        let sF = sense(angle);
        let sL = sense(angle - p.sensorAngle);
        let sR = sense(angle + p.sensorAngle);
        if (sF > sL && sF > sR) {
        } else if (sF < sL && sF < sR) {
          angle += Math.random() < 0.5 ? p.rotAngle : -p.rotAngle;
        } else if (sL > sR) {
          angle -= p.rotAngle;
        } else if (sR > sL) {
          angle += p.rotAngle;
        }
        this.vx[i] = angle;
        let nx = this.x[i] + Math.cos(angle) * p.speed;
        let ny = this.y[i] + Math.sin(angle) * p.speed;
        let terr = this.getTerrain(nx, ny);
        if (terr === 1) {
          this.vx[i] = angle + Math.PI * 0.75 + Math.random() * 0.5;
          if (this.audioQueue.length < 20) this.audioQueue.push({ type: 'bounce', intensity: 0.3 });
        } else {
          if (terr === 2) {
            nx = this.x[i] + Math.cos(angle) * p.speed * 0.3;
            ny = this.y[i] + Math.sin(angle) * p.speed * 0.3;
          }
          this.x[i] = nx;
          this.y[i] = ny;
        }
        if (this.x[i] < 0) this.x[i] += this.width; else if (this.x[i] >= this.width) this.x[i] -= this.width;
        if (this.y[i] < 0) this.y[i] += this.height; else if (this.y[i] >= this.height) this.y[i] -= this.height;
        let gx = Math.max(0, Math.min(w - 1, Math.floor(this.x[i] / this.gridScale)));
        let gy = Math.max(0, Math.min(h - 1, Math.floor(this.y[i] / this.gridScale)));
        ownGrid[gx + gy * w] = Math.min(1.0, ownGrid[gx + gy * w] + 0.5);
      }
      if (mouse.active && mouse.tool === 'brush') {
        if (mouse.brushSpecies >= 6) {
          let val = mouse.brushSpecies === 6 ? 1 : (mouse.brushSpecies === 7 ? 2 : 0);
          let brushRad = 25;
          let cx = Math.floor(mouse.x / this.terrainGridScale);
          let cy = Math.floor(mouse.y / this.terrainGridScale);
          let tRad = Math.ceil(brushRad / this.terrainGridScale);
          for (let dy = -tRad; dy <= tRad; dy++) {
            for (let dx = -tRad; dx <= tRad; dx++) {
              if (dx * dx + dy * dy <= tRad * tRad) {
                let nx = cx + dx;
                let ny = cy + dy;
                nx = ((nx % this.tCols) + this.tCols) % this.tCols;
                ny = ((ny % this.tRows) + this.tRows) % this.tRows;
                this.terrain[nx + ny * this.tCols] = val;
              }
            }
          }
          this.terrainNeedsUpdate = true;
        } else {
          for (let k = 0; k < 10; k++) this.spawn(mouse.brushSpecies, mouse.x + (Math.random() - 0.5) * 30, mouse.y + (Math.random() - 0.5) * 30, 100);
        }
      }
      this.avgSpeed = activeCount > 0 ? Math.sqrt(totalSpeedSq / activeCount) : 0;
      this.tickCount++;
      if (this.tickCount % 5 === 0) {
        this.history[4].push(this.popCounts[4]);
        if (this.history[4].length > 100) this.history[4].shift();
        this.history[5].push(this.popCounts[5]);
        if (this.history[5].length > 100) this.history[5].shift();
      }
      return;
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!this.alive[i]) continue;
      this.x[i] += this.vx[i];
      this.y[i] += this.vy[i];
      if (this.x[i] < 0) this.x[i] += this.width; if (this.x[i] >= this.width) this.x[i] -= this.width;
      if (this.y[i] < 0) this.y[i] += this.height; if (this.y[i] >= this.height) this.y[i] -= this.height;
      totalSpeedSq += this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i];
      activeCount++;
    }
    this.avgSpeed = activeCount > 0 ? Math.sqrt(totalSpeedSq / activeCount) : 0;
    this.tickCount++;
  }

  draw(ctx, overlays) {
    ctx.fillStyle = overlays.dark ? 'rgba(10, 10, 12, 0.15)' : 'rgba(252, 252, 252, 0.1)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    const getWrapped = (px, py) => {
      let dx = px - this.camera.x;
      let dy = py - this.camera.y;
      if (dx > this.width / 2) px -= this.width; else if (dx < -this.width / 2) px += this.width;
      if (dy > this.height / 2) py -= this.height; else if (dy < -this.height / 2) py += this.height;
      return { x: px, y: py };
    };

    if (overlays.grid) {
      ctx.strokeStyle = overlays.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1 / this.camera.zoom;
      ctx.beginPath();
      let startX = Math.floor((this.camera.x - this.width / this.camera.zoom) / 40) * 40;
      let endX = this.camera.x + this.width / this.camera.zoom;
      let startY = Math.floor((this.camera.y - this.height / this.camera.zoom) / 40) * 40;
      let endY = this.camera.y + this.height / this.camera.zoom;
      for (let x = startX; x <= endX; x += 40) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
      for (let y = startY; y <= endY; y += 40) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
      ctx.stroke();
    }

    if (this.mode === 'turing') {
      const data = this.turingImgData.data;
      const len = this.tA.length;
      for (let i = 0; i < len; i++) {
        let val = Math.min(1, Math.max(0, this.tB[i] * 2.0));
        let idx = i * 4;
        data[idx] = 252 + (30 - 252) * val;
        data[idx + 1] = 252 + (58 - 252) * val;
        data[idx + 2] = 252 + (138 - 252) * val;
        data[idx + 3] = 255;
      }
      this.turingCtx.putImageData(this.turingImgData, 0, 0);
      ctx.imageSmoothingEnabled = false;
      for (let ox of [-this.width, 0, this.width]) {
        for (let oy of [-this.height, 0, this.height]) {
          ctx.drawImage(this.turingCanvas, ox, oy, this.width, this.height);
        }
      }
      ctx.restore();
      return;
    }

    if (this.mode === 'physarum') {
      const data = this.imgData.data;
      for (let i = 0; i < this.trailGridA.length; i++) {
        let valA = this.trailGridA[i];
        let valB = this.trailGridB[i];
        let idx = i * 4;
        let r = Math.min(255, valA * 147 + valB * 249);
        let g = Math.min(255, valA * 51 + valB * 115);
        let b = Math.min(255, valA * 234 + valB * 22);
        let a = Math.max(valA, valB);
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = a > 0.05 ? a * 200 : 0;
      }
      this.offscreenCtx.putImageData(this.imgData, 0, 0);
      ctx.imageSmoothingEnabled = true;
      for (let ox of [-this.width, 0, this.width]) {
        for (let oy of [-this.height, 0, this.height]) {
          ctx.drawImage(this.offscreenCanvas, ox, oy, this.width, this.height);
        }
      }
      ctx.beginPath();
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (this.alive[i] && (this.species[i] === 4 || this.species[i] === 5)) {
          ctx.fillStyle = SPECIES_COLORS[this.species[i]];
          let pos = getWrapped(this.x[i], this.y[i]);
          ctx.fillRect(pos.x - 1, pos.y - 1, 2, 2);
        }
      }
      ctx.restore();
      return;
    }

    for (let s = 0; s < 4; s++) {
      ctx.fillStyle = SPECIES_COLORS[s];
      ctx.beginPath();
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (this.alive[i] && this.species[i] === s) {
          let pos = getWrapped(this.x[i], this.y[i]);
          ctx.moveTo(pos.x, pos.y);
          ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }

    ctx.restore();
  }

  clone() {
    const c = new AILifeEngine(this.width, this.height);
    c.mode = this.mode;
    c.params = JSON.parse(JSON.stringify(this.params));
    c.trackedId = this.trackedId;
    c.camera = JSON.parse(JSON.stringify(this.camera));
    c.alive = new Uint8Array(this.alive);
    c.x = new Float32Array(this.x);
    c.y = new Float32Array(this.y);
    c.vx = new Float32Array(this.vx);
    c.vy = new Float32Array(this.vy);
    c.species = new Uint8Array(this.species);
    c.energy = new Float32Array(this.energy);
    c.genesSpeed = new Float32Array(this.genesSpeed);
    c.genesVision = new Float32Array(this.genesVision);
    c.genesSize = new Float32Array(this.genesSize);
    c.hue = new Float32Array(this.hue);
    c.age = new Float32Array(this.age);
    c.generation = new Uint16Array(this.generation);
    c.targetId = new Int32Array(this.targetId);
    c.popCounts = [...this.popCounts];
    c.history = this.history.map((arr) => [...arr]);
    c.tickCount = this.tickCount;
    c.audioQueue = [];
    c.avgSpeed = this.avgSpeed;
    return c;
  }
}

const InfoTooltip = ({ text }) => (
  <div className="relative group inline-flex items-center ml-2 z-50">
    <div className="w-[14px] h-[14px] rounded-full border border-zinc-300 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-400 cursor-help group-hover:bg-zinc-200 group-hover:text-zinc-600 group-hover:border-zinc-400 transition-colors">?</div>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-zinc-900 text-white text-[11px] leading-relaxed rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity font-sans tracking-normal normal-case font-normal z-50 text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
    </div>
  </div>
);

const SectionHeader = ({ title, num, tooltip }) => (
  <div className="flex justify-between items-end mb-4 border-b border-zinc-200 pb-1">
    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center">
      {title}
      {tooltip && <InfoTooltip text={tooltip} />}
    </h3>
    <span className="text-[9px] font-mono text-zinc-300">{num}</span>
  </div>
);

const Slider = ({ label, value, min, max, step, onChange, format = (v) => v.toFixed(2), tooltip, variant = 'default' }) => (
  <div className="flex flex-col gap-1 mb-4">
    <div className="flex justify-between items-end">
      <label className="text-[11px] text-zinc-600 tracking-wide font-sans flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <span className="text-[10px] font-mono font-bold text-zinc-900">{format(value)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className={`custom-slider mt-1 ${variant === 'blue' ? 'lenia-slider' : variant === 'purple' ? 'physarum-slider' : variant === 'pink' ? 'turing-slider' : ''}`} />
  </div>
);

const TelemetryChart = ({ history }) => {
  const maxVal = Math.max(...history.flat(), 10);
  return (
    <div className="w-full h-16 bg-zinc-50/50 rounded border border-zinc-200 relative overflow-hidden flex items-end">
      <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
        {history.map((series, sIdx) => {
          if (series.length < 2) return null;
          const len = Math.max(1, series.length - 1);
          const points = series.map((val, i) => `${(i / len) * 100},${40 - (val / maxVal) * 40}`).join(' L ');
          return <path key={sIdx} d={`M ${points}`} fill="none" stroke={SPECIES_COLORS[sIdx]} strokeWidth="1.5" strokeLinejoin="round" />;
        })}
      </svg>
    </div>
  );
};

const DistributionChart = ({ engine, dark }) => {
  const bins = new Array(20).fill(0);
  if (engine && engine.mode !== 'turing') {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (engine.alive[i]) {
        let speed = Math.sqrt(engine.vx[i] * engine.vx[i] + engine.vy[i] * engine.vy[i]);
        let maxS = engine.params.boids?.speed || 5.0;
        let idx = Math.max(0, Math.min(19, Math.floor((speed / maxS) * 20)));
        bins[idx]++;
      }
    }
  }
  const maxBin = Math.max(...bins, 1);
  return (
    <div className={`h-8 rounded flex items-end px-1 gap-0.5 border overflow-hidden ${dark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'}`}>
      {bins.map((val, i) => (
        <div key={i} className={`flex-1 rounded-t-sm transition-all duration-300 ${dark ? 'bg-zinc-500' : 'bg-blue-400 opacity-80'}`} style={{ height: `${Math.max(5, (val / maxBin) * 100)}%` }} />
      ))}
    </div>
  );
};

const WalkthroughModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-[#fdfdfd] border border-zinc-200 rounded-xl shadow-2xl p-8 max-w-5xl w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded border border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
          <X size={16} />
        </button>
        <div className="mb-8">
          <span className="font-mono text-[10px] text-blue-600 uppercase tracking-widest">Guided Walkthroughs</span>
          <h2 className="font-serif text-4xl mt-2 text-zinc-900 tracking-tight">Pick a scenario</h2>
          <p className="text-zinc-500 text-sm mt-2">Each tour drives the simulation and highlights the controls in play. ESC to exit, left or right arrows to step.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['boids', 'ecosystem', 'lenia', 'physarum', 'turing'].map((mode) => (
            <button key={mode} onClick={() => onSelect(mode)} className="border border-zinc-200 rounded-lg overflow-hidden bg-white flex flex-col group cursor-pointer hover:border-blue-400 transition-colors p-4 text-left">
              <h3 className="font-serif text-lg mb-2">{mode === 'ecosystem' ? 'Ecosys' : mode.charAt(0).toUpperCase() + mode.slice(1)}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed flex-1">Explore the {mode} simulation with guided steps.</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ALFloysApp() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasBRef = useRef(null);
  const [engine, setEngine] = useState(null);
  const [engineB, setEngineB] = useState(null);
  const [activeEngineId, setActiveEngineId] = useState('A');
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);
  const [tick, setTick] = useState(0);
  const [tool, setTool] = useState('force');
  const [brushSpecies, setBrushSpecies] = useState(0);
  const mouseRef = useRef({ active: false, x: 0, y: 0, rawX: 0, rawY: 0, tool: 'force', isRepel: false, brushSpecies: 0 });
  const [overlays, setOverlays] = useState({ heatmap: false, grid: true, dark: false, abCompare: false, floatingPanel: false, audio: false });
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [walkthrough, setWalkthrough] = useState(null);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [narrative, setNarrative] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingParams, setIsGeneratingParams] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);
  const [seedCopied, setSeedCopied] = useState(false);
  const audioEngineRef = useRef(new SonificationEngine());
  const [panelPos, setPanelPos] = useState({ x: 0, y: 80 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialPanelX: 0, initialPanelY: 0 });

  useEffect(() => {
    setPanelPos({ x: window.innerWidth - 340, y: 80 });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const w = Math.max(1, Math.floor(containerRef.current.clientWidth));
    const h = Math.max(1, Math.floor(containerRef.current.clientHeight));
    const eng = new AILifeEngine(w, h);
    if (window.location.hash) eng.loadSeed(window.location.hash.substring(1));
    setEngine(eng);
  }, []);

  useEffect(() => {
    let animId;
    const loop = () => {
      const now = performance.now();
      framesRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastTimeRef.current = now;
        setTick((t) => t + 1);
      }
      mouseRef.current.tool = tool;
      mouseRef.current.brushSpecies = brushSpecies;
      if (engine && canvasRef.current) {
        const mouse = { ...mouseRef.current, active: mouseRef.current.active };
        mouse.x = (mouse.rawX - engine.width / 2) / engine.camera.zoom + engine.camera.x;
        mouse.y = (mouse.rawY - engine.height / 2) / engine.camera.zoom + engine.camera.y;
        if (isPlaying) engine.update(mouse);
        engine.draw(canvasRef.current.getContext('2d'), overlays);
        if (overlays.audio) {
          const ae = audioEngineRef.current;
          if (!ae.enabled) ae.init();
          while (engine.audioQueue.length > 0) {
            const ev = engine.audioQueue.pop();
            ae.playEvent(ev.type, ev.intensity);
          }
          ae.update({ pop: engine.popCounts.reduce((a, b) => a + b, 0), speed: engine.avgSpeed });
        } else if (audioEngineRef.current.enabled) {
          audioEngineRef.current.suspend();
          engine.audioQueue = [];
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [engine, isPlaying, tool, brushSpecies, overlays]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!walkthrough) return;
      if (e.key === 'Escape') setWalkthrough(null);
      if (e.key === 'ArrowRight' && walkthroughStep < WALKTHROUGHS[walkthrough].length - 1) setWalkthroughStep((s) => s + 1);
      if (e.key === 'ArrowLeft' && walkthroughStep > 0) setWalkthroughStep((s) => s - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [walkthrough, walkthroughStep]);

  useEffect(() => {
    if (walkthrough && engine) {
      const stepData = WALKTHROUGHS[walkthrough][walkthroughStep];
      if (stepData?.setup) {
        stepData.setup(engine);
        setTick((t) => t + 1);
      }
    }
  }, [walkthrough, walkthroughStep, engine]);

  const handlePointer = useCallback((e, isDown) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.rawX = e.clientX - rect.left;
    mouseRef.current.rawY = e.clientY - rect.top;
    if (isDown !== undefined) {
      mouseRef.current.active = isDown;
      mouseRef.current.isRepel = e.button === 2 || e.shiftKey;
    }
  }, []);

  const handleAIGenerateParams = async () => {
    if (!engine || !aiPrompt.trim()) return;
    setIsGeneratingParams(true);
    try {
      const newParams = await callGemini('Return a JSON object with boids, physarum, or turing params based on the user request.', `User request: ${aiPrompt}`, true);
      if (newParams && typeof newParams === 'object') {
        Object.assign(engine.params[engine.mode], newParams);
        engine.setPreset(engine.mode);
        setTick((t) => t + 1);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('AI Generation failed', err);
    } finally {
      setIsGeneratingParams(false);
    }
  };

  const handleAnalyzeSimulation = async () => {
    if (!engine) return;
    setIsAnalyzing(true);
    try {
      const text = await callGemini('Describe the current artificial life simulation in 2 short cinematic sentences.', `Mode: ${engine.mode}. Population: ${engine.popCounts.reduce((a, b) => a + b, 0)}. Avg speed: ${engine.avgSpeed}.`, false);
      setNarrative(text);
    } catch (err) {
      setNarrative('The simulation is too chaotic to analyze right now.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySeed = () => {
    if (!engine) return;
    const seed = engine.getSeed();
    const url = new URL(window.location.href);
    url.hash = seed;
    navigator.clipboard?.writeText(url.toString()).then(() => {
      setSeedCopied(true);
      setTimeout(() => setSeedCopied(false), 2000);
    }).catch(() => {});
  };

  const currEngine = engine;

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans relative transition-colors duration-700 ${overlays.dark ? 'bg-[#0a0a0c] text-zinc-300' : 'bg-[#fcfcfc] text-zinc-900'} selection:bg-blue-100`}>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair z-0 flex" onPointerDown={(e) => handlePointer(e, true)} onPointerMove={(e) => handlePointer(e)} onPointerUp={(e) => handlePointer(e, false)} onPointerLeave={(e) => handlePointer(e, false)} onContextMenu={(e) => e.preventDefault()}>
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          {engine && <canvas ref={canvasRef} width={engine.width} height={engine.height} className="absolute h-full max-w-none" style={{ width: '100%', left: '0%' }} />}
        </div>
      </div>

      {engine && currEngine && (
        <>
          <div className={`absolute top-0 left-0 right-0 h-14 backdrop-blur border-b z-10 flex items-center justify-between px-6 transition-colors duration-700 pointer-events-none ${overlays.dark ? 'bg-[#0a0a0c]/60 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
            <div className="flex items-center gap-12">
              <div className="font-serif text-lg tracking-tight flex items-baseline gap-2 pointer-events-auto">
                <span className="text-blue-600 font-sans font-bold">AL.Floys</span>
                <span className="font-mono text-[9px] text-zinc-400 tracking-widest uppercase">v1.4 - 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-6 pointer-events-auto">
              <button onClick={() => setShowWalkthroughModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 rounded transition-colors">Walkthrough</button>
              <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 items-center">
                <button onClick={handleCopySeed} className="hover:text-zinc-600 transition-colors flex items-center gap-1 cursor-pointer" title="Copy Shareable Link">Seed <span className={seedCopied ? 'text-green-500 font-bold' : 'text-zinc-900'}>{seedCopied ? 'COPIED!' : currEngine.getSeed().substring(0, 6).toUpperCase()}</span></button>
                {currEngine.mode !== 'turing' && <span>N <span className="text-zinc-900">{currEngine.popCounts.reduce((a, b) => a + b, 0)}</span></span>}
                <span>FPS <span className="text-zinc-900">{fps}</span></span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE</span>
              </div>
            </div>
          </div>

          <div className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-lg border shadow-sm p-1.5 flex flex-col gap-1 z-10 transition-colors ${overlays.dark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <button className={`p-2 rounded ${overlays.dark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`} title="Pan Camera"><Move size={16} strokeWidth={1.5} /></button>
            <button onClick={() => setTool('brush')} className={`p-2 rounded ${tool === 'brush' ? (overlays.dark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900') : (overlays.dark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100')}`} title="Paint Brush"><Paintbrush size={16} strokeWidth={1.5} /></button>
            <button onClick={() => setTool('force')} className={`p-2 rounded ${tool === 'force' ? (overlays.dark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900') : (overlays.dark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100')}`} title="Force Field"><MousePointer2 size={16} strokeWidth={1.5} /></button>
          </div>

          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border shadow-lg px-6 py-2.5 flex items-center gap-6 z-10 transition-colors ${overlays.dark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className={`flex items-center gap-4 ${overlays.dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <button onClick={() => { engine.setPreset(engine.mode); setTick((t) => t + 1); }} className={overlays.dark ? 'hover:text-white' : 'hover:text-zinc-900'}><SkipBack size={16} strokeWidth={1.5} /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className={`w-8 h-8 flex items-center justify-center rounded-full hover:scale-105 transition-transform shadow-sm ${overlays.dark ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white'}`}>
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={() => { if (!isPlaying) { engine.update(mouseRef.current); setTick((t) => t + 1); } }} className={overlays.dark ? 'hover:text-white' : 'hover:text-zinc-900'}><SkipForward size={16} strokeWidth={1.5} /></button>
            </div>
          </div>

          <div className={`absolute right-0 top-14 bottom-0 w-80 backdrop-blur border-l z-10 overflow-y-auto scrollbar-hide py-6 px-8 flex flex-col gap-6 shadow-2xl transition-colors duration-700 ${overlays.dark ? 'bg-[#0a0a0c]/80 border-zinc-800 text-zinc-300' : 'bg-[#fdfdfd]/95 border-zinc-200'}`}>
            <div>
              <SectionHeader title="Simulation" num="01" tooltip="Select the underlying physics simulation kernel." />
              <div className="grid grid-cols-2 gap-2">
                {['boids', 'physarum', 'turing'].map((mode) => (
                  <button key={mode} onClick={() => { engine.setPreset(mode); setTick((t) => t + 1); }} className={`flex flex-col items-center justify-center py-3 border rounded relative transition-all ${engine.mode === mode ? (overlays.dark ? 'border-zinc-500 bg-zinc-800 border-2' : 'border-zinc-900 bg-zinc-50 border-2') : (overlays.dark ? 'border-zinc-800 bg-[#0f0f12] hover:border-zinc-600' : 'border-zinc-200 bg-white hover:border-zinc-300')} ${mode === 'turing' ? 'col-span-2' : ''}`}>
                    <span className={`font-mono text-[8px] uppercase tracking-widest font-bold ${engine.mode === mode && overlays.dark ? 'text-zinc-200' : 'text-zinc-500'}`}>{mode.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`pb-6 border-b ${overlays.dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <SectionHeader title="AI Prompt-to-Physics" num="02" tooltip="Describe a simulation state, and the Gemini LLM will configure the parameters to match it." />
              <div className="flex gap-2">
                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAIGenerateParams(); }} placeholder={'e.g. "make them frantic"'} className={`flex-1 text-[11px] px-3 py-2 rounded border focus:outline-none transition-colors ${overlays.dark ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-blue-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500'}`} />
                <button onClick={handleAIGenerateParams} disabled={isGeneratingParams || !aiPrompt.trim()} className={`px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center transition-colors disabled:opacity-50 ${overlays.dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{isGeneratingParams ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}</button>
              </div>
            </div>

            <div className={`pb-6 border-b ${overlays.dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <SectionHeader title="Parameters" num="03" tooltip="Adjust the active simulation parameters." />
              {currEngine.mode === 'boids' && (
                <>
                  <Slider label="Population" value={currEngine.params.boids.pop} min={100} max={MAX_PARTICLES} step={100} onChange={(v) => { currEngine.params.boids.pop = v; currEngine.setPreset('boids'); setTick((t) => t + 1); }} format={(v) => v.toLocaleString()} />
                  <Slider label="Max speed" value={currEngine.params.boids.speed} min={0.1} max={5.0} step={0.1} onChange={(v) => { currEngine.params.boids.speed = v; setTick((t) => t + 1); }} />
                </>
              )}
              {currEngine.mode === 'physarum' && (
                <>
                  <Slider label="Population" value={currEngine.params.physarum.pop} min={1000} max={10000} step={500} onChange={(v) => { currEngine.params.physarum.pop = v; currEngine.setPreset('physarum'); setTick((t) => t + 1); }} format={(v) => v.toLocaleString()} variant="purple" />
                  <Slider label="Speed" value={currEngine.params.physarum.speed} min={0.5} max={5.0} step={0.1} onChange={(v) => { currEngine.params.physarum.speed = v; setTick((t) => t + 1); }} variant="purple" />
                </>
              )}
              {currEngine.mode === 'turing' && (
                <>
                  <Slider label="Feed Rate" value={currEngine.params.turing.feed} min={0.01} max={0.1} step={0.001} onChange={(v) => { currEngine.params.turing.feed = v; setTick((t) => t + 1); }} format={(v) => v.toFixed(3)} variant="pink" />
                  <Slider label="Kill Rate" value={currEngine.params.turing.kill} min={0.01} max={0.1} step={0.001} onChange={(v) => { currEngine.params.turing.kill = v; setTick((t) => t + 1); }} format={(v) => v.toFixed(3)} variant="pink" />
                </>
              )}
            </div>

            <div className={`pb-6 border-b ${overlays.dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center">Brush <InfoTooltip text="Paint entities or chemicals directly onto the simulation canvas." /></h3>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">04 FORCE</span>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => setTool('brush')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-colors ${tool === 'brush' ? (overlays.dark ? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-900 text-white') : (overlays.dark ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50')}`}>Paint</button>
              </div>
            </div>

            <div className={`pb-6 border-b ${overlays.dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <SectionHeader title="Telemetry" num="05" tooltip="Live graphs and simple distribution." />
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Distribution</label>
              <DistributionChart engine={currEngine} dark={overlays.dark} />
              <button onClick={handleAnalyzeSimulation} disabled={isAnalyzing} className={`mt-4 w-full text-[9px] font-mono font-bold uppercase tracking-widest py-2 rounded transition-colors flex justify-center items-center gap-1.5 ${overlays.dark ? 'bg-zinc-800 text-blue-400 hover:bg-zinc-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{isAnalyzing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI Analysis</button>
              {narrative && <div className={`mt-3 text-[10px] leading-relaxed font-serif italic border-l-2 pl-2 ${overlays.dark ? 'text-zinc-400 border-zinc-700' : 'text-zinc-600 border-zinc-200'}`}>"{narrative}"</div>}
            </div>

            <div>
              <SectionHeader title="Overlays" num="06" tooltip="Visual debugging and analysis layers." />
              <div className="flex flex-col gap-3">
                <label className="flex justify-between items-center cursor-pointer group"><span className={`text-[11px] font-sans flex items-center gap-1.5 transition-colors ${overlays.dark ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}><Moon size={12} /> Cinematic Dark Mode</span><div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${overlays.dark ? 'bg-blue-600' : 'bg-zinc-200'}`} onClick={() => setOverlays((o) => ({ ...o, dark: !o.dark }))}><div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${overlays.dark ? 'translate-x-4' : 'translate-x-0'}`} /></div></label>
                <label className="flex justify-between items-center cursor-pointer group"><span className={`text-[11px] font-sans transition-colors ${overlays.dark ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Reference grid</span><div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${overlays.grid ? 'bg-blue-600' : (overlays.dark ? 'bg-zinc-700' : 'bg-zinc-200')}`} onClick={() => setOverlays((o) => ({ ...o, grid: !o.grid }))}><div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${overlays.grid ? 'translate-x-4' : 'translate-x-0'}`} /></div></label>
                <label className="flex justify-between items-center cursor-pointer group mt-2 pt-3 border-t border-zinc-200"><span className={`text-[11px] font-sans flex items-center gap-1.5 transition-colors font-bold ${overlays.dark ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-900'}`}><Volume2 size={12} /> Procedural Audio</span><div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${overlays.audio ? 'bg-green-500' : (overlays.dark ? 'bg-zinc-700' : 'bg-zinc-200')}`} onClick={() => setOverlays((o) => ({ ...o, audio: !o.audio }))}><div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${overlays.audio ? 'translate-x-4' : 'translate-x-0'}`} /></div></label>
              </div>
            </div>
          </div>

          <WalkthroughModal isOpen={showWalkthroughModal} onClose={() => setShowWalkthroughModal(false)} onSelect={(mode) => { setWalkthrough(mode); setWalkthroughStep(0); setShowWalkthroughModal(false); }} />

          {walkthrough && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur border border-zinc-700 text-white p-5 rounded-xl shadow-2xl flex items-center gap-8 z-40 max-w-2xl w-full">
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">Interactive Tour Step {walkthroughStep + 1} of {WALKTHROUGHS[walkthrough].length}</div>
                <p className="text-sm font-serif leading-relaxed text-zinc-100">{WALKTHROUGHS[walkthrough][walkthroughStep].text}</p>
              </div>
              <div className="flex items-center gap-2 border-l border-zinc-700 pl-6">
                <button onClick={() => setWalkthroughStep((s) => s - 1)} disabled={walkthroughStep === 0} className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={() => setWalkthroughStep((s) => s + 1)} disabled={walkthroughStep === WALKTHROUGHS[walkthrough].length - 1} className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight size={20} /></button>
                <div className="w-[1px] h-6 bg-zinc-700 mx-2" />
                <button onClick={() => setWalkthrough(null)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors"><X size={20} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
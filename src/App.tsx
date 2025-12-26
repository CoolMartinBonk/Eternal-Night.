/*
import { useEffect, useRef } from 'react';

class Vibes {
  audioCtx: AudioContext | null = null;
  vol: GainNode | null = null;
  echo: ConvolverNode | null = null;

  wake() {
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.vol = this.audioCtx.createGain();
    this.vol.gain.value = 0.7;
    this.vol.connect(this.audioCtx.destination);
    this.echo = this.makeEcho();
    this.echo.connect(this.vol);
    this.hum();
  }

  makeEcho() {
    const c = this.audioCtx!.createConvolver();
    const len = this.audioCtx!.sampleRate * 4;
    const buf = this.audioCtx!.createBuffer(2, len, this.audioCtx!.sampleRate);
    [0, 1].forEach(ch => {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    });
    c.buffer = buf;
    return c;
  }

  drone(hz: number, dur: number, when: number) {
    const o = this.audioCtx!.createOscillator();
    const g = this.audioCtx!.createGain();
    const f = this.audioCtx!.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 300;
    o.type = 'sine'; o.frequency.value = hz;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.12, when + dur * 0.4);
    g.gain.linearRampToValueAtTime(0.12, when + dur * 0.6);
    g.gain.linearRampToValueAtTime(0, when + dur);
    o.connect(f); f.connect(g); g.connect(this.echo!);
    o.start(when); o.stop(when + dur);
  }

  ding(hz: number, when: number) {
    const o = this.audioCtx!.createOscillator();
    const g = this.audioCtx!.createGain();
    o.type = 'sine'; o.frequency.value = hz;
    g.gain.setValueAtTime(0.03, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 6);
    o.connect(g); g.connect(this.echo!);
    o.start(when); o.stop(when + 6);
  }

  hum() {
    const t = this.audioCtx!.currentTime;
    this.drone(45, 25, t);
    this.drone(67.5, 25, t + 1);
    this.drone(90, 25, t + 2);
    const bells = [392, 440, 523.25, 587.33, 659.25, 783.99];
    for (let i = 0; i < 6; i++) this.ding(bells[~~(Math.random() * 6)], t + Math.random() * 20);
    setTimeout(() => this.hum(), 22000);
  }
}

class Sparkle {
  cx: HTMLCanvasElement;
  floor: number;
  x = 0; y = 0; sz = 0; bright = 0; pace = 0; offset = 0;
  rgb = { r: 255, g: 255, b: 255 };
  now = 0;

  constructor(cx: HTMLCanvasElement, floor: number) {
    this.cx = cx; this.floor = floor; this.spawn();
  }

  spawn() {
    this.x = Math.random() * this.cx.width;
    this.y = Math.random() * this.floor * 0.98;
    this.sz = Math.random() * 1.8 + 0.3;
    this.bright = Math.random() * 0.7 + 0.3;
    this.pace = Math.random() * 0.05 + 0.02;
    this.offset = Math.random() * 10000;
    const palette = [
      { r: 255, g: 255, b: 255 }, { r: 255, g: 252, b: 248 },
      { r: 248, g: 250, b: 255 }, { r: 255, g: 245, b: 238 },
      { r: 235, g: 245, b: 255 }, { r: 255, g: 240, b: 230 }
    ];
    this.rgb = palette[~~(Math.random() * 6)];
  }

  tick(t: number) {
    const n = t + this.offset;
    this.now = 0.45 + Math.sin(n * this.pace) * 0.3 + Math.sin(n * this.pace * 2.7 + 1.3) * 0.15 + Math.sin(n * this.pace * 0.3 + 2.1) * 0.1;
  }

  render(g: CanvasRenderingContext2D) {
    const a = this.bright * this.now;
    const r = this.sz * (0.75 + this.now * 0.25);
    const grad = g.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 6);
    grad.addColorStop(0, `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${a * 0.9})`);
    grad.addColorStop(0.1, `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${a * 0.5})`);
    grad.addColorStop(0.3, `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${a * 0.15})`);
    grad.addColorStop(0.6, `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${a * 0.03})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.beginPath(); g.arc(this.x, this.y, r * 6, 0, Math.PI * 2); g.fillStyle = grad; g.fill();
    g.beginPath(); g.arc(this.x, this.y, r * 0.4, 0, Math.PI * 2); g.fillStyle = `rgba(255,255,255,${a * 0.95})`; g.fill();
  }
}

class Meteor {
  cx: HTMLCanvasElement;
  floor: number;
  alive = false;
  x = 0; y = 0; tail = 0; spd = 0; ang = 0; fade = 0;

  constructor(cx: HTMLCanvasElement, floor: number) { this.cx = cx; this.floor = floor; }

  launch() {
    this.x = Math.random() * this.cx.width * 0.6;
    this.y = Math.random() * this.floor * 0.5;
    this.tail = Math.random() * 120 + 60;
    this.spd = Math.random() * 12 + 8;
    this.ang = Math.PI / 4 + Math.random() * 0.4 - 0.2;
    this.fade = 1; this.alive = true;
  }

  tick() {
    if (!this.alive) return;
    this.x += Math.cos(this.ang) * this.spd;
    this.y += Math.sin(this.ang) * this.spd;
    this.fade -= 0.008;
    if (this.fade <= 0 || this.x > this.cx.width || this.y > this.floor) this.alive = false;
  }

  render(g: CanvasRenderingContext2D) {
    if (!this.alive) return;
    const tx = this.x - Math.cos(this.ang) * this.tail;
    const ty = this.y - Math.sin(this.ang) * this.tail;
    const grad = g.createLinearGradient(tx, ty, this.x, this.y);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.6, `rgba(255,255,255,${this.fade * 0.3})`);
    grad.addColorStop(1, `rgba(255,255,255,${this.fade * 0.8})`);
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(this.x, this.y);
    g.strokeStyle = grad; g.lineWidth = 1.2; g.stroke();
  }
}

class NightScene {
  cvs: HTMLCanvasElement;
  pen: CanvasRenderingContext2D;
  audio = new Vibes();
  dots: Sparkle[] = [];
  streaks: Meteor[] = [];
  tick = 0;
  floor = 0;

  constructor(cvs: HTMLCanvasElement) {
    this.cvs = cvs;
    this.pen = cvs.getContext('2d')!;
    this.fit();
    window.addEventListener('resize', () => this.fit());
    this.scatter();
    for (let i = 0; i < 3; i++) this.streaks.push(new Meteor(this.cvs, this.floor));
  }

  fit() {
    this.cvs.width = window.innerWidth;
    this.cvs.height = window.innerHeight;
    this.floor = this.cvs.height * 0.9;
  }

  scatter() {
    const n = ~~((this.cvs.width * this.cvs.height) / 1200);
    for (let i = 0; i < n; i++) this.dots.push(new Sparkle(this.cvs, this.floor));
  }

  sky() {
    const g = this.pen.createLinearGradient(0, 0, 0, this.floor);
    g.addColorStop(0, '#000205'); g.addColorStop(0.4, '#010408');
    g.addColorStop(0.7, '#02050a'); g.addColorStop(1, '#03060c');
    this.pen.fillStyle = g;
    this.pen.fillRect(0, 0, this.cvs.width, this.floor);
  }

  land() {
    const w = this.cvs.width, h = this.cvs.height, y = this.floor, p = this.pen;

    const hz = p.createLinearGradient(0, y - 30, 0, y + 10);
    hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(0.7, 'rgba(5,4,8,0.5)'); hz.addColorStop(1, '#04030a');
    p.fillStyle = hz; p.fillRect(0, y - 30, w, 40);

    const base = p.createLinearGradient(0, y, 0, h);
    base.addColorStop(0, '#04030a'); base.addColorStop(1, '#010102');
    p.fillStyle = base; p.fillRect(0, y, w, h - y);

    const mtn = (x1: number, x2: number, peak: number, col: string) => {
      const cx = (x1 + x2) / 2;
      p.beginPath(); p.moveTo(x1, y);
      p.bezierCurveTo(x1 + (cx - x1) * 0.5, y - peak * 0.6, cx - (cx - x1) * 0.3, y - peak, cx, y - peak);
      p.bezierCurveTo(cx + (x2 - cx) * 0.3, y - peak, x2 - (x2 - cx) * 0.5, y - peak * 0.6, x2, y);
      p.closePath(); p.fillStyle = col; p.fill();
    };

    mtn(w * 0.15, w * 0.90, h * 0.48, '#08070d');

    p.beginPath(); p.moveTo(-w * 0.05, y);
    p.bezierCurveTo(w * 0.02, y - h * 0.2, w * 0.08, y - h * 0.32, w * 0.12, y - h * 0.32);
    p.bezierCurveTo(w * 0.18, y - h * 0.32, w * 0.28, y - h * 0.18, w * 0.40, y - h * 0.08);
    p.quadraticCurveTo(w * 0.55, y + h * 0.01, w * 0.72, y + 2);
    p.lineTo(-w * 0.05, y + 2); p.closePath();
    const mg = p.createLinearGradient(0, y - h * 0.32, 0, y);
    mg.addColorStop(0, '#06050b'); mg.addColorStop(1, '#05040a');
    p.fillStyle = mg; p.fill();

    mtn(w * 0.68, w * 1.1, h * 0.32, '#030206');
  }

  tent() {
    const x = this.cvs.width * 0.72, y = this.floor + 2, tw = 36, th = 18;
    const pulse = Math.sin(this.tick * 0.0008) * 0.06 + 0.94;
    const flick = Math.sin(this.tick * 0.005) * 0.015 + Math.sin(this.tick * 0.011) * 0.01;
    const glow = pulse + flick;
    const gcx = x - tw * 0.12, gcy = y - th * 0.25;
    const p = this.pen;

    for (let i = 0; i < 4; i++) {
      const r = 100 - i * 20, a = 0.006 * glow * (1 - i * 0.2);
      const g = p.createRadialGradient(gcx, gcy, 0, gcx, gcy, r);
      g.addColorStop(0, `rgba(255,200,120,${a * 1.8})`);
      g.addColorStop(0.2, `rgba(255,175,90,${a})`);
      g.addColorStop(0.4, `rgba(255,150,70,${a * 0.5})`);
      g.addColorStop(0.7, `rgba(255,120,50,${a * 0.15})`);
      g.addColorStop(1, 'rgba(255,100,30,0)');
      p.fillStyle = g; p.beginPath(); p.arc(gcx, gcy, r, 0, Math.PI * 2); p.fill();
    }

    for (let i = 0; i < 3; i++) {
      const r = 50 - i * 12, a = 0.02 * glow * (1 - i * 0.25);
      const g = p.createRadialGradient(gcx, gcy, 0, gcx, gcy, r);
      g.addColorStop(0, `rgba(255,220,150,${a * 1.3})`);
      g.addColorStop(0.3, `rgba(255,195,120,${a * 0.7})`);
      g.addColorStop(0.6, `rgba(255,170,90,${a * 0.3})`);
      g.addColorStop(1, 'rgba(255,140,60,0)');
      p.fillStyle = g; p.beginPath(); p.arc(gcx, gcy, r, 0, Math.PI * 2); p.fill();
    }

    for (let i = 0; i < 3; i++) {
      const rx = 60 - i * 15, ry = 8 - i * 2, a = 0.015 * glow * (1 - i * 0.25);
      const g = p.createRadialGradient(gcx, y + 2, 0, gcx, y + 2, rx);
      g.addColorStop(0, `rgba(255,185,110,${a})`);
      g.addColorStop(0.4, `rgba(255,155,80,${a * 0.4})`);
      g.addColorStop(0.7, `rgba(255,125,55,${a * 0.15})`);
      g.addColorStop(1, 'rgba(255,100,40,0)');
      p.save(); p.scale(1, ry / rx); p.fillStyle = g;
      p.beginPath(); p.arc(gcx, (y + 2) * (rx / ry), rx, 0, Math.PI * 2); p.fill(); p.restore();
    }

    p.save();
    const b = 0.5 + Math.sin(this.tick * 0.0015) * 0.04 + flick;
    const px = x - tw * 0.08, py = y - th;

    const lg = p.createLinearGradient(x - tw * 0.5, y, px, y);
    lg.addColorStop(0, `rgba(55,42,25,${b * 0.7})`);
    lg.addColorStop(0.3, `rgba(130,95,50,${b * 0.9})`);
    lg.addColorStop(0.7, `rgba(110,80,42,${b * 0.85})`);
    lg.addColorStop(1, `rgba(85,60,32,${b * 0.75})`);
    p.beginPath(); p.moveTo(x - tw * 0.5, y);
    p.bezierCurveTo(x - tw * 0.48, y - th * 0.55, x - tw * 0.32, y - th * 0.92, px, py);
    p.lineTo(px, y); p.closePath(); p.fillStyle = lg; p.fill();

    const rg = p.createLinearGradient(px, y, x + tw * 0.45, y);
    rg.addColorStop(0, `rgba(60,45,28,${b * 0.65})`);
    rg.addColorStop(0.5, `rgba(38,30,18,${b * 0.55})`);
    rg.addColorStop(1, `rgba(22,18,12,${b * 0.45})`);
    p.beginPath(); p.moveTo(px, y); p.lineTo(px, py);
    p.bezierCurveTo(x + tw * 0.18, y - th * 0.88, x + tw * 0.38, y - th * 0.45, x + tw * 0.45, y);
    p.closePath(); p.fillStyle = rg; p.fill();

    const dcx = x - tw * 0.28, dw = 7, dh = th * 0.5;
    p.beginPath(); p.moveTo(dcx - dw * 0.4, y);
    p.bezierCurveTo(dcx - dw * 0.45, y - dh * 0.55, dcx - dw * 0.15, y - dh * 0.92, dcx + dw * 0.2, y - dh * 0.85);
    p.bezierCurveTo(dcx + dw * 0.45, y - dh * 0.65, dcx + dw * 0.5, y - dh * 0.2, dcx + dw * 0.38, y);
    p.closePath();
    const dg = p.createRadialGradient(dcx, y - dh * 0.38, 0, dcx, y - dh * 0.38, dh * 0.55);
    dg.addColorStop(0, `rgba(255,245,210,${b * 0.85})`);
    dg.addColorStop(0.3, `rgba(255,215,150,${b * 0.75})`);
    dg.addColorStop(0.65, `rgba(255,180,110,${b * 0.6})`);
    dg.addColorStop(1, `rgba(210,145,75,${b * 0.45})`);
    p.fillStyle = dg; p.fill();

    const cg = p.createRadialGradient(dcx, y - dh * 0.32, 0, dcx, y - dh * 0.32, 4);
    cg.addColorStop(0, `rgba(255,252,230,${0.4 * glow})`);
    cg.addColorStop(0.6, `rgba(255,240,200,${0.15 * glow})`);
    cg.addColorStop(1, 'rgba(255,220,160,0)');
    p.fillStyle = cg; p.beginPath(); p.arc(dcx, y - dh * 0.32, 4, 0, Math.PI * 2); p.fill();
    p.restore();
  }

  shadow() {
    const cx = this.cvs.width / 2, cy = this.cvs.height / 2, r = this.cvs.height;
    const g = this.pen.createRadialGradient(cx, cy, r * 0.25, cx, cy, r);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, 'rgba(0,0,0,0.05)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    this.pen.fillStyle = g; this.pen.fillRect(0, 0, this.cvs.width, this.cvs.height);
  }

  step() {
    this.tick++;
    this.dots.forEach(d => d.tick(this.tick));
    this.streaks.forEach(s => s.tick());
    if (Math.random() < 0.001) {
      const idle = this.streaks.find(s => !s.alive);
      if (idle) idle.launch();
    }
  }

  paint() {
    this.pen.fillStyle = '#000';
    this.pen.fillRect(0, 0, this.cvs.width, this.cvs.height);
    this.sky();
    this.dots.forEach(d => d.render(this.pen));
    this.streaks.forEach(s => s.render(this.pen));
    this.land();
    this.tent();
    this.shadow();
  }

  loop() {
    this.step();
    this.paint();
    requestAnimationFrame(() => this.loop());
  }

  go() {
    this.audio.wake();
    this.loop();
  }
}

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<NightScene | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    world.current = new NightScene(canvas.current);
    world.current.loop();
    const enableAudio = () => {
      world.current?.audio.wake();
      document.body.removeEventListener('click', enableAudio);
      document.body.removeEventListener('keydown', enableAudio);
    };

    document.body.addEventListener('click', enableAudio);
    document.body.addEventListener('keydown', enableAudio);

    return () => {
      document.body.removeEventListener('click', enableAudio);
      document.body.removeEventListener('keydown', enableAudio);
    };
  }, []);

  return (
    <>
      {}
      <canvas ref={canvas} style={{ display: 'block' }} />
    </>
  );
}
*/
import { useEffect, useRef } from 'react';

class Vibes {
  audioCtx: AudioContext | null = null;
  vol: GainNode | null = null;
  echo: ConvolverNode | null = null;

  wake() {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.audioCtx) this.audioCtx = new Ctx();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    
    if (!this.vol) {
        this.vol = this.audioCtx.createGain();
        this.vol.gain.value = 0.7;
        this.vol.connect(this.audioCtx.destination);
        this.echo = this.makeEcho();
        this.echo.connect(this.vol);
        this.hum();
    }
  }

  makeEcho() {
    const c = this.audioCtx!.createConvolver();
    const len = this.audioCtx!.sampleRate * 4;
    const buf = this.audioCtx!.createBuffer(2, len, this.audioCtx!.sampleRate);
    [0, 1].forEach(ch => {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    });
    c.buffer = buf;
    return c;
  }

  drone(hz: number, dur: number, when: number) {
    const o = this.audioCtx!.createOscillator();
    const g = this.audioCtx!.createGain();
    const f = this.audioCtx!.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 300;
    o.type = 'sine'; o.frequency.value = hz;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.12, when + dur * 0.4);
    g.gain.linearRampToValueAtTime(0.12, when + dur * 0.6);
    g.gain.linearRampToValueAtTime(0, when + dur);
    o.connect(f); f.connect(g); g.connect(this.echo!);
    o.start(when); o.stop(when + dur);
  }

  ding(hz: number, when: number) {
    const o = this.audioCtx!.createOscillator();
    const g = this.audioCtx!.createGain();
    o.type = 'sine'; o.frequency.value = hz;
    g.gain.setValueAtTime(0.03, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 6);
    o.connect(g); g.connect(this.echo!);
    o.start(when); o.stop(when + 6);
  }

  hum() {
    const t = this.audioCtx!.currentTime;
    this.drone(45, 25, t);
    this.drone(67.5, 25, t + 1);
    this.drone(90, 25, t + 2);
    const bells = [392, 440, 523.25, 587.33, 659.25, 783.99];
    for (let i = 0; i < 6; i++) this.ding(bells[~~(Math.random() * 6)], t + Math.random() * 20);
    setTimeout(() => this.hum(), 30000);
  }
}

class StarCache {
  static canvases: HTMLCanvasElement[] = [];
  static size = 32;

  static init() {
    const palette = [
      { r: 255, g: 255, b: 255 }, { r: 255, g: 252, b: 248 },
      { r: 248, g: 250, b: 255 }, { r: 255, g: 245, b: 238 },
      { r: 235, g: 245, b: 255 }, { r: 255, g: 240, b: 230 }
    ];
    
    this.canvases = palette.map(color => {
      const cvs = document.createElement('canvas');
      cvs.width = this.size;
      cvs.height = this.size;
      const ctx = cvs.getContext('2d')!;
      const center = this.size / 2;
      
      const g = ctx.createRadialGradient(center, center, 0, center, center, center);
      g.addColorStop(0, `rgba(${color.r},${color.g},${color.b}, 1)`);
      g.addColorStop(0.1, `rgba(${color.r},${color.g},${color.b}, 0.8)`);
      g.addColorStop(0.4, `rgba(${color.r},${color.g},${color.b}, 0.2)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.size, this.size);
      
      ctx.beginPath();
      ctx.arc(center, center, this.size * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,0.9)`;
      ctx.fill();

      return cvs;
    });
  }

  static get(index: number) {
    if (this.canvases.length === 0) this.init();
    return this.canvases[index % this.canvases.length];
  }
}

class Sparkle {
  cx: HTMLCanvasElement;
  floor: number;
  x = 0; y = 0; sz = 0; bright = 0; pace = 0; offset = 0;
  now = 0;
  typeIndex = 0;

  constructor(cx: HTMLCanvasElement, floor: number) {
    this.cx = cx; this.floor = floor; this.spawn();
  }

  spawn() {
    this.x = Math.random() * this.cx.width;
    this.y = Math.random() * this.floor * 0.98;
    this.sz = Math.random() * 1.8 + 0.3;
    this.bright = Math.random() * 0.7 + 0.3;
    this.pace = Math.random() * 0.005 + 0.002; 
    this.offset = Math.random() * 10000;
    this.typeIndex = ~~(Math.random() * 6);
  }

  tick(t: number) {
    const n = t + this.offset;
    this.now = 0.5 + Math.sin(n * this.pace) * 0.5;
  }

  render(g: CanvasRenderingContext2D) {
    const alpha = this.bright * this.now;
    if (alpha < 0.01) return;

    const img = StarCache.get(this.typeIndex);
    const size = this.sz * 8; 

    g.globalAlpha = alpha; 
    g.drawImage(img, this.x - size/2, this.y - size/2, size, size);
    g.globalAlpha = 1.0;
  }
}

class Meteor {
  cx: HTMLCanvasElement;
  floor: number;
  alive = false;
  x = 0; y = 0; tail = 0; spd = 0; ang = 0; fade = 0;

  constructor(cx: HTMLCanvasElement, floor: number) { this.cx = cx; this.floor = floor; }

  launch() {
    this.x = Math.random() * this.cx.width * 0.6;
    this.y = Math.random() * this.floor * 0.5;
    this.tail = Math.random() * 120 + 60;
    this.spd = Math.random() * 12 + 8;
    this.ang = Math.PI / 4 + Math.random() * 0.4 - 0.2;
    this.fade = 1; this.alive = true;
  }

  tick() {
    if (!this.alive) return;
    this.x += Math.cos(this.ang) * this.spd;
    this.y += Math.sin(this.ang) * this.spd;
    this.fade -= 0.008;
    if (this.fade <= 0 || this.x > this.cx.width || this.y > this.floor) this.alive = false;
  }

  render(g: CanvasRenderingContext2D) {
    if (!this.alive) return;
    const tx = this.x - Math.cos(this.ang) * this.tail;
    const ty = this.y - Math.sin(this.ang) * this.tail;
    const grad = g.createLinearGradient(tx, ty, this.x, this.y);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.6, `rgba(255,255,255,${this.fade * 0.3})`);
    grad.addColorStop(1, `rgba(255,255,255,${this.fade * 0.8})`);
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(this.x, this.y);
    g.strokeStyle = grad; g.lineWidth = 1.2; g.stroke();
  }
}

class NightScene {
  cvs: HTMLCanvasElement;
  pen: CanvasRenderingContext2D;
  skyCanvas: HTMLCanvasElement;
  skyPen: CanvasRenderingContext2D;
  
  landCanvas: HTMLCanvasElement;
  landPen: CanvasRenderingContext2D;

  audio = new Vibes();
  dots: Sparkle[] = [];
  streaks: Meteor[] = [];
  tick = 0;
  floor = 0;

  constructor(cvs: HTMLCanvasElement) {
    StarCache.init();
    this.cvs = cvs;
    this.pen = cvs.getContext('2d', { alpha: false })!; 
    
    this.skyCanvas = document.createElement('canvas');
    this.skyPen = this.skyCanvas.getContext('2d')!;
    
    this.landCanvas = document.createElement('canvas');
    this.landPen = this.landCanvas.getContext('2d')!;

    this.fit();
    
    let resizeTimer: any;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.fit(), 100);
    });

    this.scatter();
    for (let i = 0; i < 3; i++) this.streaks.push(new Meteor(this.cvs, this.floor));
  }

  fit() {
    this.cvs.width = window.innerWidth;
    this.cvs.height = window.innerHeight;
    
    this.skyCanvas.width = this.cvs.width;
    this.skyCanvas.height = this.cvs.height;
    
    this.landCanvas.width = this.cvs.width;
    this.landCanvas.height = this.cvs.height;

    this.floor = this.cvs.height * 0.9;
    
    this.scatter(); 
    this.bakeLayers();
  }

  scatter() {
    this.dots = [];
    const n = ~~((this.cvs.width * this.cvs.height) / 1200);
    for (let i = 0; i < n; i++) this.dots.push(new Sparkle(this.cvs, this.floor));
  }

  bakeLayers() {
    const w = this.cvs.width;
    const h = this.cvs.height;
    const y = this.floor;
    const sp = this.skyPen;
    const g = sp.createLinearGradient(0, 0, 0, y);
    g.addColorStop(0, '#000205'); g.addColorStop(0.4, '#010408');
    g.addColorStop(0.7, '#02050a'); g.addColorStop(1, '#03060c');
    sp.fillStyle = g; 
    sp.fillRect(0, 0, w, h);

    const lp = this.landPen;
    lp.clearRect(0, 0, w, h);

    const hz = lp.createLinearGradient(0, y - 30, 0, y + 10);
    hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(0.7, 'rgba(5,4,8,0.5)'); hz.addColorStop(1, '#04030a');
    lp.fillStyle = hz; lp.fillRect(0, y - 30, w, 40);

    const base = lp.createLinearGradient(0, y, 0, h);
    base.addColorStop(0, '#04030a'); base.addColorStop(1, '#010102');
    lp.fillStyle = base; lp.fillRect(0, y, w, h - y);

    const mtn = (x1: number, x2: number, peak: number, col: string) => {
      const cx = (x1 + x2) / 2;
      lp.beginPath(); lp.moveTo(x1, y);
      lp.bezierCurveTo(x1 + (cx - x1) * 0.5, y - peak * 0.6, cx - (cx - x1) * 0.3, y - peak, cx, y - peak);
      lp.bezierCurveTo(cx + (x2 - cx) * 0.3, y - peak, x2 - (x2 - cx) * 0.5, y - peak * 0.6, x2, y);
      lp.closePath(); lp.fillStyle = col; lp.fill();
    };

    mtn(w * 0.15, w * 0.90, h * 0.48, '#08070d');

    lp.beginPath(); lp.moveTo(-w * 0.05, y);
    lp.bezierCurveTo(w * 0.02, y - h * 0.2, w * 0.08, y - h * 0.32, w * 0.12, y - h * 0.32);
    lp.bezierCurveTo(w * 0.18, y - h * 0.32, w * 0.28, y - h * 0.18, w * 0.40, y - h * 0.08);
    lp.quadraticCurveTo(w * 0.55, y + h * 0.01, w * 0.72, y + 2);
    lp.lineTo(-w * 0.05, y + 2); lp.closePath();
    const mg = lp.createLinearGradient(0, y - h * 0.32, 0, y);
    mg.addColorStop(0, '#06050b'); mg.addColorStop(1, '#05040a');
    lp.fillStyle = mg; lp.fill();

    mtn(w * 0.68, w * 1.1, h * 0.32, '#030206');
  }

  tent() {
    const x = this.cvs.width * 0.72, y = this.floor + 2, tw = 36, th = 18;
    const pulse = Math.sin(this.tick * 0.0008) * 0.06 + 0.94;
    const flick = Math.sin(this.tick * 0.005) * 0.015 + Math.sin(this.tick * 0.011) * 0.01;
    const glow = pulse + flick;
    const gcx = x - tw * 0.12, gcy = y - th * 0.25;
    const p = this.pen;

    for (let i = 0; i < 4; i++) {
      const r = 100 - i * 20, a = 0.006 * glow * (1 - i * 0.2);
      const g = p.createRadialGradient(gcx, gcy, 0, gcx, gcy, r);
      g.addColorStop(0, `rgba(255,200,120,${a * 1.8})`);
      g.addColorStop(0.2, `rgba(255,175,90,${a})`);
      g.addColorStop(0.4, `rgba(255,150,70,${a * 0.5})`);
      g.addColorStop(0.7, `rgba(255,120,50,${a * 0.15})`);
      g.addColorStop(1, 'rgba(255,100,30,0)');
      p.fillStyle = g; p.beginPath(); p.arc(gcx, gcy, r, 0, Math.PI * 2); p.fill();
    }

    for (let i = 0; i < 3; i++) {
      const r = 50 - i * 12, a = 0.02 * glow * (1 - i * 0.25);
      const g = p.createRadialGradient(gcx, gcy, 0, gcx, gcy, r);
      g.addColorStop(0, `rgba(255,220,150,${a * 1.3})`);
      g.addColorStop(0.3, `rgba(255,195,120,${a * 0.7})`);
      g.addColorStop(0.6, `rgba(255,170,90,${a * 0.3})`);
      g.addColorStop(1, 'rgba(255,140,60,0)');
      p.fillStyle = g; p.beginPath(); p.arc(gcx, gcy, r, 0, Math.PI * 2); p.fill();
    }

    for (let i = 0; i < 3; i++) {
      const rx = 60 - i * 15, ry = 8 - i * 2, a = 0.015 * glow * (1 - i * 0.25);
      const g = p.createRadialGradient(gcx, y + 2, 0, gcx, y + 2, rx);
      g.addColorStop(0, `rgba(255,185,110,${a})`);
      g.addColorStop(0.4, `rgba(255,155,80,${a * 0.4})`);
      g.addColorStop(0.7, `rgba(255,125,55,${a * 0.15})`);
      g.addColorStop(1, 'rgba(255,100,40,0)');
      p.save(); p.scale(1, ry / rx); p.fillStyle = g;
      p.beginPath(); p.arc(gcx, (y + 2) * (rx / ry), rx, 0, Math.PI * 2); p.fill(); p.restore();
    }

    p.save();
    const b = 0.5 + Math.sin(this.tick * 0.0015) * 0.04 + flick;
    const px = x - tw * 0.08, py = y - th;

    const lg = p.createLinearGradient(x - tw * 0.5, y, px, y);
    lg.addColorStop(0, `rgba(55,42,25,${b * 0.7})`);
    lg.addColorStop(0.3, `rgba(130,95,50,${b * 0.9})`);
    lg.addColorStop(0.7, `rgba(110,80,42,${b * 0.85})`);
    lg.addColorStop(1, `rgba(85,60,32,${b * 0.75})`);
    p.beginPath(); p.moveTo(x - tw * 0.5, y);
    p.bezierCurveTo(x - tw * 0.48, y - th * 0.55, x - tw * 0.32, y - th * 0.92, px, py);
    p.lineTo(px, y); p.closePath(); p.fillStyle = lg; p.fill();

    const rg = p.createLinearGradient(px, y, x + tw * 0.45, y);
    rg.addColorStop(0, `rgba(60,45,28,${b * 0.65})`);
    rg.addColorStop(0.5, `rgba(38,30,18,${b * 0.55})`);
    rg.addColorStop(1, `rgba(22,18,12,${b * 0.45})`);
    p.beginPath(); p.moveTo(px, y); p.lineTo(px, py);
    p.bezierCurveTo(x + tw * 0.18, y - th * 0.88, x + tw * 0.38, y - th * 0.45, x + tw * 0.45, y);
    p.closePath(); p.fillStyle = rg; p.fill();

    const dcx = x - tw * 0.28, dw = 7, dh = th * 0.5;
    p.beginPath(); p.moveTo(dcx - dw * 0.4, y);
    p.bezierCurveTo(dcx - dw * 0.45, y - dh * 0.55, dcx - dw * 0.15, y - dh * 0.92, dcx + dw * 0.2, y - dh * 0.85);
    p.bezierCurveTo(dcx + dw * 0.45, y - dh * 0.65, dcx + dw * 0.5, y - dh * 0.2, dcx + dw * 0.38, y);
    p.closePath();
    const dg = p.createRadialGradient(dcx, y - dh * 0.38, 0, dcx, y - dh * 0.38, dh * 0.55);
    dg.addColorStop(0, `rgba(255,245,210,${b * 0.85})`);
    dg.addColorStop(0.3, `rgba(255,215,150,${b * 0.75})`);
    dg.addColorStop(0.65, `rgba(255,180,110,${b * 0.6})`);
    dg.addColorStop(1, `rgba(210,145,75,${b * 0.45})`);
    p.fillStyle = dg; p.fill();

    const cg = p.createRadialGradient(dcx, y - dh * 0.32, 0, dcx, y - dh * 0.32, 4);
    cg.addColorStop(0, `rgba(255,252,230,${0.4 * glow})`);
    cg.addColorStop(0.6, `rgba(255,240,200,${0.15 * glow})`);
    cg.addColorStop(1, 'rgba(255,220,160,0)');
    p.fillStyle = cg; p.beginPath(); p.arc(dcx, y - dh * 0.32, 4, 0, Math.PI * 2); p.fill();
    p.restore();
  }

  shadow() {
    const cx = this.cvs.width / 2, cy = this.cvs.height / 2, r = this.cvs.height;
    const g = this.pen.createRadialGradient(cx, cy, r * 0.25, cx, cy, r);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, 'rgba(0,0,0,0.05)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    this.pen.fillStyle = g; this.pen.fillRect(0, 0, this.cvs.width, this.cvs.height);
  }

  step() {
    this.tick++;
    this.dots.forEach(d => d.tick(this.tick));
    this.streaks.forEach(s => s.tick());
    if (Math.random() < 0.001) {
      const idle = this.streaks.find(s => !s.alive);
      if (idle) idle.launch();
    }
  }

  paint() {
    this.pen.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.pen.drawImage(this.skyCanvas, 0, 0);
    this.dots.forEach(d => d.render(this.pen));
    this.streaks.forEach(s => s.render(this.pen));
    this.pen.drawImage(this.landCanvas, 0, 0);
    this.tent();
    this.shadow();
  }

  loop() {
    this.step();
    this.paint();
    requestAnimationFrame(() => this.loop());
  }

  go() {
    this.audio.wake();
    this.loop();
  }
}

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<NightScene | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    world.current = new NightScene(canvas.current);
    world.current.go();

    const enableAudio = () => {
      world.current?.audio.wake();
      document.body.removeEventListener('click', enableAudio);
      document.body.removeEventListener('keydown', enableAudio);
    };
    document.body.addEventListener('click', enableAudio);
    document.body.addEventListener('keydown', enableAudio);

    return () => {
      document.body.removeEventListener('click', enableAudio);
      document.body.removeEventListener('keydown', enableAudio);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} style={{ display: 'block' }} />
    </>
  );
}
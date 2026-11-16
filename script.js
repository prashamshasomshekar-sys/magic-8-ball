const FONT = '"Mochiy Pop One", system-ui, sans-serif';

// ---------- Setup ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 0, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.insertBefore(renderer.domElement, document.getElementById('fx'));

// ---------- Textures drawn on canvases ----------
function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}
const dotTex = canvasTex(64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.25, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
// 4-point anime sparkle
function drawSparkle(g, s, color) {
  const c = s / 2, k = s * 0.055;
  const gr = g.createRadialGradient(c, c, 0, c, c, c * 0.5);
  gr.addColorStop(0, color.replace('1)', '.6)')); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(c, s * 0.03);
  g.quadraticCurveTo(c + k, c - k, s * 0.97, c);
  g.quadraticCurveTo(c + k, c + k, c, s * 0.97);
  g.quadraticCurveTo(c - k, c + k, s * 0.03, c);
  g.quadraticCurveTo(c - k, c - k, c, s * 0.03);
  g.fill();
}
const sparkleTex = canvasTex(128, (g, s) => drawSparkle(g, s, 'rgba(255,255,255,1)'));
const pinkSparkleTex = canvasTex(128, (g, s) => drawSparkle(g, s, 'rgba(255,225,150,1)'));
// glowing firefly / light mote
const petalTex = canvasTex(64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.2, 'rgba(255,225,140,.9)');
  gr.addColorStop(0.5, 'rgba(255,200,100,.25)'); gr.addColorStop(1, 'rgba(255,200,100,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});

// ---------- Sky: twinkling dots, big sparkles, moon, petals ----------
function makeStars(count, size, minR, maxR) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const tints = [[1, 1, 1], [0.8, 0.95, 1], [0.8, 0.9, 1], [1, 0.95, 0.75]];
  for (let i = 0; i < count; i++) {
    const r = minR + Math.random() * (maxR - minR);
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
    const t = tints[(Math.random() * tints.length) | 0], b = 0.5 + Math.random() * 0.5;
    col.set([t[0] * b, t[1] * b, t[2] * b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
}
const starLayers = [
  { pts: makeStars(5000, 2.5, 300, 900), speed: 0.004, tw: 1.4, ph: 0 },
  { pts: makeStars(1200, 5, 250, 800), speed: 0.007, tw: 2.3, ph: 2 },
];
starLayers.forEach(l => scene.add(l.pts));

const sparkles = [];
for (let i = 0; i < 45; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: Math.random() < 0.35 ? pinkSparkleTex : sparkleTex,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  s.position.set((Math.random() - 0.5) * 120, (Math.random() - 0.3) * 60, -40 - Math.random() * 30);
  s.userData = { base: 1 + Math.random() * 2.5, sp: 1 + Math.random() * 3, ph: Math.random() * 6.28 };
  sparkles.push(s); scene.add(s);
}

// cel-shaded crescent moon
const moon = new THREE.Sprite(new THREE.SpriteMaterial({
  map: canvasTex(256, (g) => {
    const gr = g.createRadialGradient(128, 128, 40, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,240,200,.35)'); gr.addColorStop(1, 'rgba(200,220,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    // crescent = full disc with an offset disc cut out
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const m = c.getContext('2d');
    m.fillStyle = '#fff4cf'; m.beginPath(); m.arc(128, 128, 60, 0, 7); m.fill();
    m.globalCompositeOperation = 'destination-out';
    m.beginPath(); m.arc(156, 108, 54, 0, 7); m.fill();
    g.drawImage(c, 0, 0);
  }),
  transparent: true, depthWrite: false
}));
moon.scale.set(22, 22, 1);
moon.position.set(28, 16, -70);
scene.add(moon);

const petals = [];
function resetPetal(p, top) {
  p.position.set((Math.random() - 0.5) * 16, top ? -6 - Math.random() * 2 : (Math.random() - 0.5) * 12, -6 + Math.random() * 8.5);
  p.userData = { vy: 0.12 + Math.random() * 0.2, sway: 0.4 + Math.random() * 0.8, ph: Math.random() * 6.28, spin: 0 };
}
for (let i = 0; i < 45; i++) {
  const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: petalTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const sc = 0.15 + Math.random() * 0.2;
  p.scale.set(sc, sc, 1);
  resetPetal(p, false);
  petals.push(p); scene.add(p);
}

// shooting stars
const shooters = [];
let nextShooter = 1.5;
function spawnShooter() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array([1, 0.9, 0.97, 0, 0, 0]), 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkleTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  head.scale.set(5, 5, 1);
  scene.add(line, head);
  shooters.push({
    line, head, life: 0, maxLife: 1 + Math.random() * 0.5,
    start: new THREE.Vector3(10 + Math.random() * 90, 15 + Math.random() * 35, -100 - Math.random() * 40),
    dir: new THREE.Vector3(-1, -0.35 - Math.random() * 0.4, 0).normalize(),
    speed: 80 + Math.random() * 60, len: 14 + Math.random() * 10
  });
}

// pink aura behind the ball
const glow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: canvasTex(128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(110,190,255,.55)'); gr.addColorStop(0.45, 'rgba(80,120,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
}));
glow.scale.set(9, 9, 1);
glow.position.z = -2;
scene.add(glow);

// ---------- Lights (toon shading uses these to make hard bands) ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 0.9);
key.position.set(-4, 5, 6);
scene.add(key);
const rimPink = new THREE.DirectionalLight(0xffc98a, 0.7);
rimPink.position.set(6, -2, -2);
scene.add(rimPink);
const rimCyan = new THREE.DirectionalLight(0x6fd8ff, 0.6);
rimCyan.position.set(-6, -3, -1);
scene.add(rimCyan);

const toonRamp = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.LuminanceFormat);
toonRamp.minFilter = toonRamp.magFilter = THREE.NearestFilter;
toonRamp.needsUpdate = true;
// darker ramp so the ball body reads as black with subtle cel bands
const darkRamp = new THREE.DataTexture(new Uint8Array([18, 45, 110]), 3, 1, THREE.LuminanceFormat);
darkRamp.minFilter = darkRamp.magFilter = THREE.NearestFilter;
darkRamp.needsUpdate = true;

// ---------- The 8 ball ----------
const R = 1.6;
const floater = new THREE.Group();
const ball = new THREE.Group();
floater.add(ball);
scene.add(floater);

const BALL_COLOR = 0x050506;
const body = new THREE.Mesh(
  new THREE.SphereGeometry(R, 96, 96),
  new THREE.MeshToonMaterial({ color: 0x08080a, gradientMap: darkRamp })
);
ball.add(body);
// thick anime outline (inverted hull)
ball.add(new THREE.Mesh(
  new THREE.SphereGeometry(R * 1.04, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0x0d0620, side: THREE.BackSide })
));

function capGeometry(r, angle, front) {
  const g = new THREE.SphereGeometry(r, 64, 20, 0, Math.PI * 2, 0, angle);
  g.rotateX(front ? Math.PI / 2 : -Math.PI / 2);
  const a = r * Math.sin(angle), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    uv.setXY(i, (front ? 1 : -1) * p.getX(i) / (2 * a) + 0.5, p.getY(i) / (2 * a) + 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

// front "8"
const eightCanvas = document.createElement('canvas');
eightCanvas.width = eightCanvas.height = 512;
function drawEight() {
  const g = eightCanvas.getContext('2d');
  g.fillStyle = '#' + BALL_COLOR.toString(16).padStart(6, '0'); g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#fffaf2'; g.strokeStyle = '#0d0620'; g.lineWidth = 16;
  g.beginPath(); g.arc(256, 256, 226, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#d8e4ff';   // soft cel shadow on the lower right of the disc
  g.save(); g.beginPath(); g.arc(256, 256, 218, 0, 7); g.clip();
  g.beginPath(); g.arc(300, 300, 230, 0, 7); g.arc(256, 256, 260, 0, 7, true); g.fill(); g.restore();
  g.font = `330px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 14; g.strokeStyle = '#0d0620'; g.fillStyle = '#111116';
  g.strokeText('8', 256, 270); g.fillText('8', 256, 270);
  eightTex.needsUpdate = true;
}
const eightTex = new THREE.CanvasTexture(eightCanvas);
eightTex.encoding = THREE.sRGBEncoding;
eightTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
ball.add(new THREE.Mesh(capGeometry(R * 1.003, 0.52, true), new THREE.MeshToonMaterial({ map: eightTex, gradientMap: toonRamp })));

// back: answer window (flat, no shading — like an anime screen)
const winCanvas = document.createElement('canvas');
winCanvas.width = winCanvas.height = 512;
const wctx = winCanvas.getContext('2d');
const winTex = new THREE.CanvasTexture(winCanvas);
winTex.encoding = THREE.sRGBEncoding;
winTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
ball.add(new THREE.Mesh(capGeometry(R * 1.003, 0.62, false), new THREE.MeshBasicMaterial({ map: winTex })));

// anime "shine" highlight that stays put while the ball spins
const shine = new THREE.Sprite(new THREE.SpriteMaterial({
  map: canvasTex(256, (g) => {
    g.fillStyle = 'rgba(255,255,255,.92)';
    g.save(); g.translate(112, 118); g.rotate(-0.7);
    g.beginPath(); g.ellipse(0, 0, 78, 30, 0, 0, 7); g.fill(); g.restore();
    g.beginPath(); g.arc(196, 70, 17, 0, 7); g.fill();
    g.beginPath(); g.arc(60, 205, 9, 0, 7); g.fill();
  }),
  transparent: true, depthWrite: false
}));
shine.scale.set(1.25, 1.25, 1);
const SHINE_POS = new THREE.Vector3(-0.62, 0.66, 1.5);
floater.add(shine);

function wrapText(g, text, maxW) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  lines.push(line);
  return lines;
}

let answer = null;
function drawWindow(a) {
  const g = wctx;
  g.fillStyle = '#0d0620'; g.fillRect(0, 0, 512, 512);
  const liquid = g.createRadialGradient(256, 220, 10, 256, 256, 236);
  liquid.addColorStop(0, '#24408f'); liquid.addColorStop(0.75, '#112058'); liquid.addColorStop(1, '#0a1440');
  g.fillStyle = liquid;
  g.beginPath(); g.arc(256, 256, 232, 0, 7); g.fill();
  // little bubbles in the liquid
  g.fillStyle = 'rgba(180,200,255,.25)';
  [[150, 360, 10], [370, 330, 7], [330, 400, 12], [170, 150, 6], [380, 170, 9]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });

  if (a > 0 && answer) {
    const s = 0.6 + 0.4 * easeOutBack(a);
    g.save();
    g.globalAlpha = Math.min(1, a * 1.5);
    g.translate(256, 290); g.scale(s, s); g.rotate((1 - a) * 0.6); g.translate(-256, -290);
    const tri = () => { g.beginPath(); g.moveTo(100, 170); g.lineTo(412, 170); g.lineTo(256, 440); g.closePath(); };
    g.shadowColor = answer.glow; g.shadowBlur = 50;
    g.fillStyle = answer.color; tri(); g.fill();
    g.shadowBlur = 0;
    // cel shadow band on the right half
    g.save(); tri(); g.clip();
    g.fillStyle = 'rgba(20,10,80,.25)';
    g.beginPath(); g.moveTo(300, 170); g.lineTo(420, 170); g.lineTo(256, 450); g.lineTo(240, 420); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.beginPath(); g.moveTo(125, 185); g.lineTo(175, 185); g.lineTo(150, 225); g.closePath(); g.fill();
    g.restore();
    g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#0d0620'; tri(); g.stroke();

    g.font = `28px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = wrapText(g, answer.text.toUpperCase(), 190);
    const lh = 36, y0 = 250 - (lines.length - 1) * lh / 2;
    g.lineWidth = 7; g.strokeStyle = '#0d0620'; g.fillStyle = '#fff';
    lines.forEach((l, i) => { g.strokeText(l, 256, y0 + i * lh); g.fillText(l, 256, y0 + i * lh); });
    g.restore();
  }
  // glass reflection
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.save(); g.translate(180, 130); g.rotate(-0.6);
  g.beginPath(); g.ellipse(0, 0, 90, 26, 0, 0, 7); g.fill(); g.restore();
  // outline ring
  g.lineWidth = 18; g.strokeStyle = '#0d0620';
  g.beginPath(); g.arc(256, 256, 240, 0, 7); g.stroke();
  winTex.needsUpdate = true;
}

// ---------- Answers (with mood colours + kaomoji) ----------
const MOODS = {
  yes:   { color: '#5fd6ff', glow: 'rgba(90,200,255,.9)', faces: ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '٩(◕‿◕)۶', '(•̀ᴗ•́)و'] },
  maybe: { color: '#ffd36e', glow: 'rgba(255,210,110,.9)', faces: ['(・_・ヾ', '(￣～￣;)', '(・・?)'] },
  no:    { color: '#ff8a7a', glow: 'rgba(255,130,110,.9)', faces: ['(>_<)', '(；へ：)', '(・へ・)'] },
};
const ANSWERS = [
  ['It is certain', 'yes'], ['It is decidedly so', 'yes'], ['Without a doubt', 'yes'], ['Yes definitely', 'yes'],
  ['You may rely on it', 'yes'], ['As I see it, yes', 'yes'], ['Most likely', 'yes'], ['Outlook good', 'yes'],
  ['Yes', 'yes'], ['Signs point to yes', 'yes'],
  ['Reply hazy, try again', 'maybe'], ['Ask again later', 'maybe'], ['Better not tell you now', 'maybe'],
  ['Cannot predict now', 'maybe'], ['Concentrate and ask again', 'maybe'],
  ["Don't count on it", 'no'], ['My reply is no', 'no'], ['My sources say no', 'no'],
  ['Outlook not so good', 'no'], ['Very doubtful', 'no'],
].map(([text, mood]) => ({ text, mood, ...MOODS[mood] }));

// ---------- Manga FX overlay (speed lines + sound effects) ----------
const fx = document.getElementById('fx');
const fctx = fx.getContext('2d');
function sizeFx() {
  const d = Math.min(devicePixelRatio, 2);
  fx.width = innerWidth * d; fx.height = innerHeight * d;
  fctx.setTransform(d, 0, 0, d, 0, 0);
}
sizeFx();
function drawFx(k, el) {
  fctx.clearRect(0, 0, innerWidth, innerHeight);
  if (k <= 0) return;
  const cx = innerWidth / 2, cy = innerHeight / 2;
  const reach = Math.hypot(cx, cy) + 20, inner = Math.min(innerWidth, innerHeight) * 0.3;
  fctx.fillStyle = `rgba(255,255,255,${0.55 * k})`;
  for (let i = 0; i < 110; i++) {
    const a = Math.random() * Math.PI * 2;
    const r0 = inner + Math.random() * inner * 0.7, w = (1 + Math.random() * 5) / reach;
    fctx.beginPath();
    fctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    fctx.lineTo(cx + Math.cos(a - w) * reach, cy + Math.sin(a - w) * reach);
    fctx.lineTo(cx + Math.cos(a + w) * reach, cy + Math.sin(a + w) * reach);
    fctx.fill();
  }
  const sfx = (txt, x, y, rot, size) => {
    fctx.save(); fctx.translate(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8); fctx.rotate(rot);
    fctx.font = `${size}px ${FONT}`; fctx.textAlign = 'center'; fctx.lineJoin = 'round';
    fctx.globalAlpha = Math.min(1, k * 2);
    fctx.lineWidth = 10; fctx.strokeStyle = '#0c1c52'; fctx.strokeText(txt, 0, 0);
    fctx.fillStyle = '#ffe27a'; fctx.fillText(txt, 0, 0);
    fctx.restore();
  };
  const s = Math.min(innerWidth, innerHeight) / 12;
  sfx('シアク', cx - inner * 1.25, cy - inner * 0.5, -0.25, s);
  if (el > 0.35) sfx('シアク!!', cx + inner * 1.2, cy + inner * 0.55, 0.2, s);
}

// sparkle burst on reveal
const bursts = [];
function burst() {
  for (let i = 0; i < 26; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: i % 3 ? sparkleTex : pinkSparkleTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    const a = Math.random() * Math.PI * 2;
    sp.position.set(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9, 1.2);
    sp.userData = { v: new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(1.5 + Math.random() * 2.5), life: 0, size: 0.3 + Math.random() * 0.5 };
    scene.add(sp); bursts.push(sp);
  }
}

// ---------- State machine ----------
const askBtn = document.getElementById('ask');
const qInput = document.getElementById('q');
const hint = document.getElementById('hint');
let state = 'idle', t0 = 0, reveal = 0, pending = null, from = null, targetY = 0;
const now = () => performance.now() / 1000;
const setState = (s) => { state = s; t0 = now(); };
const easeOutBack = (p) => { const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;

function ask() {
  if (!['idle', 'shown'].includes(state)) return;
  do { pending = ANSWERS[(Math.random() * ANSWERS.length) | 0]; } while (pending === answer);
  const q = qInput.value.trim();
  hint.textContent = q ? `「${q}」` : 'The stars are thinking… ✧';
  askBtn.disabled = true;
  setState(reveal > 0 ? 'hiding' : 'shaking');
}
askBtn.addEventListener('click', ask);
qInput.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
addEventListener('keydown', e => {
  if (e.code === 'Space' && document.activeElement !== qInput) { e.preventDefault(); ask(); }
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const ndc = (e) => new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
renderer.domElement.addEventListener('pointermove', e => {
  mouse.copy(ndc(e));
  raycaster.setFromCamera(mouse, camera);
  renderer.domElement.style.cursor = raycaster.intersectObject(body).length ? 'pointer' : 'default';
});
renderer.domElement.addEventListener('click', e => {
  raycaster.setFromCamera(ndc(e), camera);
  if (raycaster.intersectObject(body).length) ask();
});

// ---------- Animation loop ----------
let last = now();
function animate() {
  requestAnimationFrame(animate);
  const t = now(), dt = Math.min(t - last, 0.05);
  last = t;
  const el = t - t0;

  switch (state) {
    case 'hiding':
      reveal = Math.max(0, 1 - el / 0.3);
      drawWindow(reveal);
      if (el >= 0.3) setState('shaking');
      break;
    case 'shaking': {
      const k = 1 - el / 1.4;
      ball.rotation.y += dt * (14 * k + 3);
      ball.rotation.x = Math.sin(el * 26) * 0.45 * k;
      ball.rotation.z = Math.cos(el * 19) * 0.3 * k;
      ball.position.set(Math.sin(el * 43) * 0.18 * k, Math.cos(el * 37) * 0.14 * k, 0);
      drawFx(Math.min(1, k * 1.6), el);
      if (el >= 1.4) {
        answer = pending;
        from = { x: ball.rotation.x, y: ball.rotation.y, z: ball.rotation.z, px: ball.position.x, py: ball.position.y };
        targetY = Math.ceil((from.y - Math.PI) / (Math.PI * 2)) * Math.PI * 2 + Math.PI + Math.PI * 2;
        drawFx(0);
        setState('settling');
      }
      break;
    }
    case 'settling': {
      const p = Math.min(1, el / 1.2), e = easeOutBack(p);
      ball.rotation.set(lerp(from.x, 0, e), lerp(from.y, targetY, e), lerp(from.z, 0, e));
      ball.position.set(lerp(from.px, 0, e), lerp(from.py, 0, e), 0);
      if (p >= 1) { ball.rotation.y = Math.PI; setState('revealing'); }
      break;
    }
    case 'revealing':
      reveal = Math.min(1, el / 1.1);
      drawWindow(reveal);
      if (reveal >= 1) {
        burst();
        hint.textContent = `✧ ${answer.text}! ${answer.faces[(Math.random() * answer.faces.length) | 0]} ✧`;
        setState('shown');
        askBtn.disabled = false;
      }
      break;
  }

  // bobbing + mouse tilt
  floater.position.y = Math.sin(t * 1.1) * 0.1;
  floater.rotation.y = lerp(floater.rotation.y, mouse.x * 0.3, 0.05);
  floater.rotation.x = lerp(floater.rotation.x, -mouse.y * 0.2, 0.05);
  shine.position.copy(SHINE_POS).add(ball.position);
  glow.material.opacity = 0.8 + 0.2 * Math.sin(t * 0.9);

  starLayers.forEach(l => {
    l.pts.rotation.y += l.speed * dt;
    l.pts.material.opacity = 0.65 + 0.35 * Math.sin(t * l.tw + l.ph);
  });
  sparkles.forEach(s => {
    const u = s.userData, k = Math.max(0, Math.sin(t * u.sp + u.ph));
    s.scale.setScalar(u.base * (0.3 + k));
    s.material.opacity = k;
    s.material.rotation = t * 0.3 + u.ph;
  });
  petals.forEach(p => {
    const u = p.userData;
    p.position.y += u.vy * dt;
    p.position.x += Math.sin(t * u.sway + u.ph) * 0.3 * dt;
    p.material.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * (u.sway * 2) + u.ph));
    if (p.position.y > 6.5) resetPetal(p, true);
  });
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i], u = b.userData;
    u.life += dt;
    b.position.addScaledVector(u.v, dt);
    u.v.multiplyScalar(0.94);
    b.scale.setScalar(u.size * (1 - u.life));
    b.material.rotation += dt * 3;
    if (u.life >= 1) { scene.remove(b); b.material.dispose(); bursts.splice(i, 1); }
  }

  camera.position.x = lerp(camera.position.x, mouse.x * 0.4, 0.03);
  camera.position.y = lerp(camera.position.y, mouse.y * 0.3, 0.03);
  camera.lookAt(0, 0, 0);

  nextShooter -= dt;
  if (nextShooter <= 0) { spawnShooter(); nextShooter = 2 + Math.random() * 4; }
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.life += dt;
    const head = s.start.clone().addScaledVector(s.dir, s.speed * s.life);
    const tail = head.clone().addScaledVector(s.dir, -s.len);
    s.line.geometry.attributes.position.array.set([head.x, head.y, head.z, tail.x, tail.y, tail.z]);
    s.line.geometry.attributes.position.needsUpdate = true;
    const o = Math.sin(Math.PI * s.life / s.maxLife);
    s.line.material.opacity = o;
    s.head.position.copy(head); s.head.material.opacity = o; s.head.material.rotation += dt * 4;
    if (s.life >= s.maxLife) {
      scene.remove(s.line, s.head);
      s.line.geometry.dispose(); s.line.material.dispose(); s.head.material.dispose();
      shooters.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

drawEight(); drawWindow(0);
// redraw once the anime font has loaded
document.fonts.load(`40px "Mochiy Pop One"`).then(() => { drawEight(); drawWindow(reveal); }).catch(() => {});
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  sizeFx();
});

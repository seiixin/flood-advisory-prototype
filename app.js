// Basic data
const ADVISORY_COLORS = {
  Yellow: '#FFC107',
  Orange: '#FF9800',
  Red: '#F44336',
};

// Distinct positions per advisory (normalized 0..1)
const POINTS_BY_ADVISORY = {
  Yellow: [
    { id: 'SV-6',  site: 'SV', num: 6,  name: 'SV Vehicle/Ped Entrance/Exit (#6)', x: 0.235, y: 0.620 },
    { id: 'SV-10', site: 'SV', num: 10, name: 'SVP Church Gate (#10)',            x: 0.080, y: 0.668 },
    { id: 'ST-2',  site: 'ST', num: 2,  name: 'ST Pedestrian Entrance/Exit (#2)',  x: 0.328, y: 0.293 },
    { id: 'ST-10', site: 'ST', num: 10, name: 'OZ Vehicle/Ped Entrance/Exit (#10)',x: 0.353, y: 0.762 },
    { id: 'CS-2',  site: 'CS', num: 2,  name: 'CS Vehicle/Ped Entrance/Exit (#2)', x: 0.675, y: 0.292 },
    { id: 'CS-3',  site: 'CS', num: 3,  name: 'CS Annex Service Gate (#3)',        x: 0.756, y: 0.294 },
    { id: 'CS-8',  site: 'CS', num: 8,  name: 'Chemistry Laboratory (#8)',         x: 0.857, y: 0.580 },
  ],
  Orange: [
    { id: 'SV-6',  site: 'SV', num: 6,  name: 'SV Vehicle/Ped Entrance/Exit (#6)', x: 0.210, y: 0.600 },
    { id: 'SV-10', site: 'SV', num: 10, name: 'SVP Church Gate (#10)',            x: 0.120, y: 0.650 },
    { id: 'ST-2',  site: 'ST', num: 2,  name: 'ST Pedestrian Entrance/Exit (#2)',  x: 0.370, y: 0.300 },
    { id: 'ST-10', site: 'ST', num: 10, name: 'OZ Vehicle/Ped Entrance/Exit (#10)',x: 0.380, y: 0.780 },
    { id: 'CS-2',  site: 'CS', num: 2,  name: 'CS Vehicle/Ped Entrance/Exit (#2)', x: 0.720, y: 0.300 },
    { id: 'CS-3',  site: 'CS', num: 3,  name: 'CS Annex Service Gate (#3)',        x: 0.800, y: 0.300 },
    { id: 'CS-8',  site: 'CS', num: 8,  name: 'Chemistry Laboratory (#8)',         x: 0.900, y: 0.560 },
  ],
  Red: [
    { id: 'SV-6',  site: 'SV', num: 6,  name: 'SV Vehicle/Ped Entrance/Exit (#6)', x: 0.290, y: 0.570 },
    { id: 'SV-10', site: 'SV', num: 10, name: 'SVP Church Gate (#10)',            x: 0.150, y: 0.610 },
    { id: 'ST-2',  site: 'ST', num: 2,  name: 'ST Pedestrian Entrance/Exit (#2)',  x: 0.420, y: 0.270 },
    { id: 'ST-10', site: 'ST', num: 10, name: 'OZ Vehicle/Ped Entrance/Exit (#10)',x: 0.420, y: 0.740 },
    { id: 'CS-2',  site: 'CS', num: 2,  name: 'CS Vehicle/Ped Entrance/Exit (#2)', x: 0.760, y: 0.270 },
    { id: 'CS-3',  site: 'CS', num: 3,  name: 'CS Annex Service Gate (#3)',        x: 0.840, y: 0.270 },
    { id: 'CS-8',  site: 'CS', num: 8,  name: 'Chemistry Laboratory (#8)',         x: 0.940, y: 0.530 },
  ],
};

const LEVELS = {
  Yellow: {
    'SV-6': 'Knee-level', 'SV-10': 'Gutter-deep',
    'ST-2': 'Knee-level', 'ST-10': 'Gutter-deep',
    'CS-2': 'Knee-level', 'CS-3': 'Knee-level', 'CS-8': 'Gutter-deep',
  },
  Orange: {
    'SV-6': 'Gutter-deep', 'SV-10': 'Half-tire',
    'ST-2': 'Gutter-deep', 'ST-10': 'Half-tire',
    'CS-2': 'Gutter-deep', 'CS-3': 'Half-tire', 'CS-8': 'Half-tire',
  },
  Red: {
    'SV-6': 'Half-tire', 'SV-10': 'Half-tire',
    'ST-2': 'Half-tire', 'ST-10': 'Half-tire',
    'CS-2': 'Half-tire', 'CS-3': 'Half-tire', 'CS-8': 'Half-tire',
  },
};

const app = {
  advisory: null,
  imgNatural: { w: 2048, h: 1536 },
  base: { w: 0, h: 0 },
  container: { w: 0, h: 0 },
  scale: 1.2,
  minScale: 1.1,
  maxScale: 3,
  padX: 200,
  padY: 150,
  offset: { x: 0, y: 0 },
  isPanning: false,
  dragStart: { x: 0, y: 0 },
  offsetStart: { x: 0, y: 0 },
  pinchDist0: 0,
  pinchScale0: 1,
};

// Elements
const splash = document.getElementById('splash');
const topbar = document.getElementById('topbar');
const advisoryScreen = document.getElementById('advisoryScreen');
const advisoryLabel = document.getElementById('advisoryLabel');
const btnChange = document.getElementById('btnChange');
const btnLegend = document.getElementById('btnLegend');
const sidebar = document.getElementById('sidebar');

const mapViewport = document.getElementById('mapViewport');
const mapOuter = document.getElementById('mapOuter');
const mapInner = document.getElementById('mapInner');
const campusImg = document.getElementById('campusImg');
const markers = document.getElementById('markers');

const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const zoomReset = document.getElementById('zoomReset');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalLevel = document.getElementById('modalLevel');
const closeModal = document.getElementById('closeModal');

// Helpers
function setTopbarColor(c) { topbar.style.background = c; }
function clamp(v, min, max){ return Math.min(Math.max(v, min), max); }
function contentSize(){
  return { w: app.base.w * app.scale, h: app.base.h * app.scale };
}
function clampOffsets(nx, ny){
  const { w: cw, h: ch } = contentSize();
  const maxX = Math.max(0, cw - app.container.w);
  const maxY = Math.max(0, ch - app.container.h);
  const minX = -maxX - app.padX;
  const maxXok = 0 + app.padX;
  const minY = -maxY - app.padY;
  const maxYok = 0 + app.padY;
  return { x: clamp(nx, minX, maxXok), y: clamp(ny, minY, maxYok) };
}
function applyTransform(){
  mapOuter.style.transform = `translate(${app.offset.x}px, ${app.offset.y}px)`;
  mapInner.style.transform = `scale(${app.scale})`;
}
function layout(){
  const rect = mapViewport.getBoundingClientRect();
  app.container = { w: rect.width, h: rect.height };
  // base width > viewport width for pan room
  const baseW = Math.max(app.container.w * 1.6, app.container.w);
  const baseH = baseW / (app.imgNatural.w / app.imgNatural.h);
  app.base = { w: baseW, h: baseH };
  campusImg.style.width = baseW + 'px';
  campusImg.style.height = baseH + 'px';
  markers.style.width = baseW + 'px';
  markers.style.height = baseH + 'px';

  // center content initially
  const cw = app.base.w * app.scale, ch = app.base.h * app.scale;
  app.offset.x = (app.container.w - cw)/2;
  app.offset.y = (app.container.h - ch)/2;
  applyTransform();

  // place markers
  drawMarkers();
}
function setAdvisory(a){
  app.advisory = a;
  advisoryLabel.textContent = 'Advisory: ' + a;
  setTopbarColor(ADVISORY_COLORS[a]);
  advisoryScreen.classList.add('hidden');
  drawMarkers();
}
function drawMarkers(){
  if(!app.advisory) return;
  const pts = POINTS_BY_ADVISORY[app.advisory] || [];
  markers.innerHTML = '';
  pts.forEach(p => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.left = (p.x * app.base.w - 16) + 'px';
    el.style.top  = (p.y * app.base.h - 16) + 'px';
    const level = (LEVELS[app.advisory] || {})[p.id] || '—';
    el.dataset.level = level;
    el.textContent = p.num;
    el.title = `${p.name}\n${level}`;
    el.addEventListener('click', () => {
      modalTitle.textContent = p.name;
      modalLevel.textContent = level;
      modal.classList.remove('hidden');
    });
    markers.appendChild(el);
  });
}
function openLegend(){ sidebar.classList.add('open'); }
function closeLegend(){ sidebar.classList.remove('open'); }
function toggleLegend(){ sidebar.classList.toggle('open'); }

// Events
Array.from(document.querySelectorAll('.card')).forEach(btn => {
  btn.addEventListener('click', () => setAdvisory(btn.dataset.adv));
});
btnChange.addEventListener('click', () => {
  advisoryScreen.classList.remove('hidden');
  sidebar.classList.remove('open');
});
btnLegend.addEventListener('click', toggleLegend);
closeModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.add('hidden'); });

// Pan & Zoom (mouse)
mapViewport.addEventListener('mousedown', (e) => {
  app.isPanning = true;
  app.dragStart = { x: e.clientX, y: e.clientY };
  app.offsetStart = { ...app.offset };
});
window.addEventListener('mousemove', (e) => {
  if(!app.isPanning) return;
  const nx = app.offsetStart.x + (e.clientX - app.dragStart.x);
  const ny = app.offsetStart.y + (e.clientY - app.dragStart.y);
  app.offset = clampOffsets(nx, ny);
  applyTransform();
});
window.addEventListener('mouseup', () => { app.isPanning = false; });

// Wheel zoom
mapViewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.1 : 1/1.1;
  const next = clamp(app.scale * factor, app.minScale, app.maxScale);
  app.scale = next;
  // keep offset but clamp
  app.offset = clampOffsets(app.offset.x, app.offset.y);
  applyTransform();
}, { passive: false });

// Touch (pinch + drag)
mapViewport.addEventListener('touchstart', (e) => {
  if(e.touches.length === 2){
    const [t1,t2] = e.touches;
    app.pinchDist0 = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
    app.pinchScale0 = app.scale;
  } else if (e.touches.length === 1){
    app.isPanning = true;
    const t = e.touches[0];
    app.dragStart = { x: t.clientX, y: t.clientY };
    app.offsetStart = { ...app.offset };
  }
}, { passive: false });
mapViewport.addEventListener('touchmove', (e) => {
  if(e.touches.length === 2){
    e.preventDefault();
    const [t1,t2] = e.touches;
    const d = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
    const raw = app.pinchScale0 * (d / app.pinchDist0);
    app.scale = clamp(raw, app.minScale, app.maxScale);
    app.offset = clampOffsets(app.offset.x, app.offset.y);
    applyTransform();
  } else if (e.touches.length === 1 && app.isPanning){
    const t = e.touches[0];
    const nx = app.offsetStart.x + (t.clientX - app.dragStart.x);
    const ny = app.offsetStart.y + (t.clientY - app.dragStart.y);
    app.offset = clampOffsets(nx, ny);
    applyTransform();
  }
}, { passive: false });
mapViewport.addEventListener('touchend', (e) => {
  if(e.touches.length === 0){ app.isPanning = false; }
}, { passive: false });

// Zoom buttons
zoomIn.addEventListener('click', () => {
  app.scale = clamp(app.scale * 1.2, app.minScale, app.maxScale);
  app.offset = clampOffsets(app.offset.x, app.offset.y);
  applyTransform();
});
zoomOut.addEventListener('click', () => {
  app.scale = clamp(app.scale / 1.2, app.minScale, app.maxScale);
  app.offset = clampOffsets(app.offset.x, app.offset.y);
  applyTransform();
});
zoomReset.addEventListener('click', () => {
  app.scale = 1.2;
  layout();
});

// Image load → compute natural size then layout
campusImg.addEventListener('load', () => {
  app.imgNatural = { w: campusImg.naturalWidth, h: campusImg.naturalHeight };
  layout();
});
window.addEventListener('resize', layout);

// Init
setTimeout(() => splash.remove(), 1400);

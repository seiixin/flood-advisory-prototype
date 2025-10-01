// Data
const ADVISORY_COLORS = { Yellow:'#FFC107', Orange:'#FF9800', Red:'#F44336' };

const POINTS_BY_ADVISORY = {
  Yellow: [
    { id:'SV-6',  display:'SV Gate #6',      name:'SV Vehicle/Ped Entrance/Exit (#6)', x:0.235, y:0.620 },
    { id:'SV-10', display:'SVP Church Gate', name:'SVP Church Gate (#10)',             x:0.080, y:0.668 },
    { id:'ST-2',  display:'ST Ped Gate',     name:'ST Pedestrian Entrance/Exit (#2)',  x:0.328, y:0.293 },
    { id:'ST-10', display:'OZ Veh/Ped',      name:'OZ Vehicle/Ped Entrance/Exit (#10)',x:0.353, y:0.762 },
    { id:'CS-2',  display:'CS Veh/Ped',      name:'CS Vehicle/Ped Entrance/Exit (#2)', x:0.675, y:0.292 },
    { id:'CS-3',  display:'CS Annex Gate',   name:'CS Annex Service Gate (#3)',        x:0.756, y:0.294 },
    { id:'CS-8',  display:'Chemistry Lab',   name:'Chemistry Laboratory (#8)',         x:0.857, y:0.580 },
  ],
  Orange: [
    { id:'SV-6',  display:'SV Gate #6',    name:'SV Vehicle/Ped Entrance/Exit (#6)',  x:0.210, y:0.600 },
    { id:'SV-10', display:'SVP Church',    name:'SVP Church Gate (#10)',              x:0.120, y:0.650 },
    { id:'ST-2',  display:'ST Ped Gate',   name:'ST Pedestrian Entrance/Exit (#2)',   x:0.370, y:0.300 },
    { id:'ST-10', display:'OZ Veh/Ped',    name:'OZ Vehicle/Ped Entrance/Exit (#10)', x:0.380, y:0.780 },
    { id:'CS-2',  display:'CS Veh/Ped',    name:'CS Vehicle/Ped Entrance/Exit (#2)',  x:0.720, y:0.300 },
    { id:'CS-3',  display:'CS Annex Gate', name:'CS Annex Service Gate (#3)',         x:0.800, y:0.300 },
    { id:'CS-8',  display:'Chemistry Lab', name:'Chemistry Laboratory (#8)',          x:0.900, y:0.560 },
  ],
  Red: [
    { id:'SV-6',  display:'SV Gate #6',    name:'SV Vehicle/Ped Entrance/Exit (#6)',  x:0.290, y:0.570 },
    { id:'SV-10', display:'SVP Church',    name:'SVP Church Gate (#10)',              x:0.150, y:0.610 },
    { id:'ST-2',  display:'ST Ped Gate',   name:'ST Pedestrian Entrance/Exit (#2)',   x:0.420, y:0.270 },
    { id:'ST-10', display:'OZ Veh/Ped',    name:'OZ Vehicle/Ped Entrance/Exit (#10)', x:0.420, y:0.740 },
    { id:'CS-2',  display:'CS Veh/Ped',    name:'CS Vehicle/Ped Entrance/Exit (#2)',  x:0.760, y:0.270 },
    { id:'CS-3',  display:'CS Annex Gate', name:'CS Annex Service Gate (#3)',         x:0.840, y:0.270 },
    { id:'CS-8',  display:'Chemistry Lab', name:'Chemistry Laboratory (#8)',          x:0.940, y:0.530 },
  ],
};

const LEVELS = {
  Yellow: { 'SV-6':'Knee-level','SV-10':'Gutter-deep','ST-2':'Knee-level','ST-10':'Gutter-deep','CS-2':'Knee-level','CS-3':'Knee-level','CS-8':'Gutter-deep' },
  Orange: { 'SV-6':'Gutter-deep','SV-10':'Half-tire','ST-2':'Gutter-deep','ST-10':'Half-tire','CS-2':'Gutter-deep','CS-3':'Half-tire','CS-8':'Half-tire' },
  Red:    { 'SV-6':'Half-tire','SV-10':'Half-tire','ST-2':'Half-tire','ST-10':'Half-tire','CS-2':'Half-tire','CS-3':'Half-tire','CS-8':'Half-tire' },
};

// Elements
const colorBar = document.getElementById('colorBar');
const advisoryScreen = document.getElementById('advisoryScreen');
const advisoryLabel = document.getElementById('advisoryLabel');
const instruction = document.getElementById('instruction');
const btnChange = document.getElementById('btnChange');

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
const levelImg = document.getElementById('levelImg');
const closeModal = document.getElementById('closeModal');

// App state for pan/zoom
const app = {
  advisory:null,
  imgNatural:{w:2048,h:1536},
  base:{w:0,h:0},
  container:{w:0,h:0},
  scale:1.05,
  minScale:1.0,
  maxScale:3,
  padX:200, padY:150,
  offset:{x:0,y:0},
  panning:false,
  dragStart:{x:0,y:0},
  offsetStart:{x:0,y:0},
  pinch0:0, scale0:1,
};

function clamp(v,min,max){return Math.min(Math.max(v,min),max);}
function contentSize(){return {w:app.base.w*app.scale, h:app.base.h*app.scale};}
function clampOffsets(nx,ny){
  const {w:cw,h:ch} = contentSize();
  const maxX = Math.max(0, cw - app.container.w);
  const maxY = Math.max(0, ch - app.container.h);
  const minX = -maxX - app.padX, maxXok = app.padX;
  const minY = -maxY - app.padY, maxYok = app.padY;
  return {x:clamp(nx,minX,maxXok), y:clamp(ny,minY,maxYok)};
}
function applyTransform(){
  mapOuter.style.transform = `translate(${app.offset.x}px, ${app.offset.y}px)`;
  mapInner.style.transform = `scale(${app.scale})`;
}
function layout(){
  const r = mapViewport.getBoundingClientRect();
  app.container = {w:r.width, h:r.height};
  const baseW = Math.max(app.container.w*1.6, app.container.w);
  const baseH = baseW / (app.imgNatural.w/app.imgNatural.h);
  app.base = {w:baseW, h:baseH};
  campusImg.style.width = baseW+'px'; campusImg.style.height = baseH+'px';
  markers.style.width = baseW+'px'; markers.style.height = baseH+'px';
  // center content
  const cw = app.base.w*app.scale, ch = app.base.h*app.scale;
  app.offset.x = (app.container.w - cw)/2;
  app.offset.y = (app.container.h - ch)/2;
  applyTransform();
  drawMarkers();
}

function setAdvisory(a){
  // Always hide modal when switching advisory
  try{ modal.classList.add('hidden'); }catch(e){}

  app.advisory = a;
  advisoryLabel.textContent = 'Advisory: ' + a;
  colorBar.style.background = ADVISORY_COLORS[a];
  advisoryScreen.classList.add('hidden');
  // show instruction temporarily
  instruction.classList.remove('hidden');
  setTimeout(()=>instruction.classList.add('hidden'), 3500);
  // reset zoom to zoomed-out view
  app.scale = 1.05;
  layout();
}

function levelToImg(level){
  if(level==='Half-tire') return 'assets/halftire.svg';
  if(level==='Gutter-deep') return 'assets/gutter.svg';
  return 'assets/knee.svg';
}

function drawMarkers(){
  if(!app.advisory) return;
  const pts = POINTS_BY_ADVISORY[app.advisory] || [];
  markers.innerHTML = '';
  pts.forEach(p => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.left = (p.x * app.base.w) + 'px';
    el.style.top  = (p.y * app.base.h) + 'px';
    const level = (LEVELS[app.advisory] || {})[p.id] || '—';
    el.dataset.level = level;
    el.textContent = p.display;
    el.addEventListener('click', () => focusGate(p, level));
    markers.appendChild(el);
  });
}

function focusGate(p, level){
  // zoom to the gate and open modal
  const targetScale = Math.max(2.0, app.scale*1.6);
  app.scale = clamp(targetScale, app.minScale, app.maxScale);
  // center the gate
  const cx = p.x * app.base.w * app.scale;
  const cy = p.y * app.base.h * app.scale;
  app.offset.x = app.container.w/2 - cx;
  app.offset.y = app.container.h/2 - cy;
  app.offset = clampOffsets(app.offset.x, app.offset.y);
  applyTransform();
  // show modal
  modalTitle.textContent = p.name;
  modalLevel.textContent = level;
  levelImg.src = levelToImg(level);
  modal.classList.remove('hidden');
}

// Controls & events
Array.from(document.querySelectorAll('.card')).forEach(btn => {
  btn.addEventListener('click', () => setAdvisory(btn.dataset.adv));
});
btnChange.addEventListener('click', () => {
  advisoryScreen.classList.remove('hidden');
  try{ modal.classList.add('hidden'); }catch(e){}
});

const viewport = mapViewport;
viewport.addEventListener('mousedown', (e)=>{ app.panning=true; app.dragStart={x:e.clientX,y:e.clientY}; app.offsetStart={...app.offset}; });
window.addEventListener('mousemove', (e)=>{ if(!app.panning) return; const nx=app.offsetStart.x+(e.clientX-app.dragStart.x); const ny=app.offsetStart.y+(e.clientY-app.dragStart.y); app.offset=clampOffsets(nx,ny); applyTransform(); });
window.addEventListener('mouseup', ()=>{ app.panning=false; });

viewport.addEventListener('wheel', (e)=>{
  e.preventDefault();
  const factor = e.deltaY<0?1.1:1/1.1;
  app.scale = clamp(app.scale*factor, app.minScale, app.maxScale);
  app.offset = clampOffsets(app.offset.x, app.offset.y);
  applyTransform();
},{passive:false});

viewport.addEventListener('touchstart', (e)=>{
  if(e.touches.length===2){ const [t1,t2]=e.touches; app.pinch0=Math.hypot(t1.pageX-t2.pageX, t1.pageY-t2.pageY); app.scale0=app.scale; }
  else if(e.touches.length===1){ app.panning=true; const t=e.touches[0]; app.dragStart={x:t.clientX,y:t.clientY}; app.offsetStart={...app.offset}; }
},{passive:false});
viewport.addEventListener('touchmove', (e)=>{
  if(e.touches.length===2){ e.preventDefault(); const [t1,t2]=e.touches; const d=Math.hypot(t1.pageX-t2.pageX, t1.pageY-t2.pageY); app.scale = clamp(app.scale0*(d/app.pinch0), app.minScale, app.maxScale); app.offset=clampOffsets(app.offset.x, app.offset.y); applyTransform(); }
  else if(e.touches.length===1 && app.panning){ const t=e.touches[0]; const nx=app.offsetStart.x+(t.clientX-app.dragStart.x); const ny=app.offsetStart.y+(t.clientY-app.dragStart.y); app.offset=clampOffsets(nx,ny); applyTransform(); }
},{passive:false});
viewport.addEventListener('touchend', (e)=>{ if(e.touches.length===0) app.panning=false; },{passive:false});

zoomIn.addEventListener('click', ()=>{ app.scale = clamp(app.scale*1.2, app.minScale, app.maxScale); app.offset=clampOffsets(app.offset.x, app.offset.y); applyTransform(); });
zoomOut.addEventListener('click', ()=>{ app.scale = clamp(app.scale/1.2, app.minScale, app.maxScale); app.offset=clampOffsets(app.offset.x, app.offset.y); applyTransform(); });
zoomReset.addEventListener('click', ()=>{ app.scale=1.05; layout(); });

// Image load then layout
campusImg.addEventListener('load', ()=>{ app.imgNatural={w:campusImg.naturalWidth,h:campusImg.naturalHeight}; layout(); });
window.addEventListener('resize', layout);

// Splash remove
setTimeout(()=>{ const s=document.getElementById('splash'); s&&s.remove(); }, 1200);

modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.classList.add('hidden'); });


function closeModalNow(){
  modal.classList.add('hidden');
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-close="true"]');
  if(btn){ e.preventDefault(); e.stopPropagation(); closeModalNow(); }
});
modal.addEventListener('mousedown', (e) => { if(e.target === modal) closeModalNow(); });
modal.addEventListener('click', (e) => { if(e.target === modal) closeModalNow(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModalNow(); });


document.addEventListener('DOMContentLoaded', ()=>{ try{ modal.classList.add('hidden'); }catch(e){} });

/* Ilustraciones vectoriales generadas para cada vehículo (sin fotos externas).
   Cada silueta depende del tipo de carrocería y varía color, llantas y detalles según el modelo. */
(function(){
let UID = 0;
const COLORES = ["#b3202a","#1f4fa0","#b9bec5","#2a2d33","#e9ebee","#7d8287","#1f4d3a","#e0b21a","#d9661f","#1e2a44","#5e1a24","#4a90c8","#3d6b4f","#8a6d3b"];
const COLOR_MARCA = {"Kawasaki":"#4fae32","KTM":"#ee6b12","Ducati":"#c8102e","Yamaha":"#2346a8","Honda":"#c8102e","Suzuki":"#1f5bb5","Husqvarna":"#e8e8e8","Aprilia":"#1a1a1a","Triumph":"#2a2d33","Ferrari":"#c8102e","Alpine":"#1f4fa0","Lotus":"#e0b21a"};

function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.max(0,Math.min(255,Math.round(r+amt*255)));g=Math.max(0,Math.min(255,Math.round(g+amt*255)));b=Math.max(0,Math.min(255,Math.round(b+amt*255)));
  return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function smooth(pts){ // curva suave que pasa cerca de los puntos
  let d=`M${pts[0][0]},${pts[0][1]} L${(pts[0][0]+pts[1][0])/2},${(pts[0][1]+pts[1][1])/2}`;
  for(let i=1;i<pts.length-1;i++){const m=[(pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2];d+=` Q${pts[i][0]},${pts[i][1]} ${m[0]},${m[1]}`;}
  const l=pts[pts.length-1];d+=` L${l[0]},${l[1]}`;return d;}

const CAR = {
 sedan:{r:24,w:[95,295],sill:128,top:[[37,128],[34,112],[44,100],[125,92],[172,61],[250,59],[302,87],[358,91],[365,104],[363,128]],win:[[133,91],[174,66],[247,64],[291,89]],pil:[212]},
 hatch:{r:23,w:[90,282],sill:128,top:[[37,128],[34,112],[45,101],[120,94],[165,63],[268,61],[328,76],[338,100],[337,128]],win:[[128,93],[168,68],[265,66],[318,82],[320,90]],pil:[215]},
 coupe:{r:24,w:[97,297],sill:126,top:[[37,126],[34,110],[48,99],[140,92],[192,65],[244,63],[312,86],[360,91],[366,104],[364,126]],win:[[148,91],[195,69],[241,68],[298,88]],pil:[]},
 wagon:{r:24,w:[95,295],sill:128,top:[[37,128],[34,112],[44,100],[125,92],[172,61],[326,60],[356,80],[364,104],[363,128]],win:[[133,91],[174,66],[322,65],[350,86]],pil:[212,282]},
 suv:{r:29,w:[97,297],sill:121,top:[[37,121],[32,100],[44,85],[120,79],[160,47],[318,45],[352,64],[359,96],[357,121]],win:[[128,79],[163,52],[314,51],[347,76]],pil:[218,282]},
 roadster:{r:23,w:[95,293],sill:124,top:[[37,124],[34,110],[48,100],[168,92],[192,71],[200,71],[208,90],[298,89],[360,91],[365,104],[362,124]],win:[[175,92],[193,74],[198,74],[203,90]],pil:[],roll:true},
 super:{r:24,w:[92,300],sill:122,top:[[37,122],[33,108],[62,97],[150,89],[200,61],[252,61],[332,83],[366,87],[367,106],[364,122]],win:[[158,88],[203,65],[248,65],[316,84]],pil:[],intake:true},
 pickup:{r:29,w:[97,300],sill:121,top:[[37,121],[32,100],[44,85],[120,79],[156,49],[226,47],[234,78],[364,78],[365,121]],win:[[128,79],[159,53],[222,52],[228,79]],pil:[192],bed:true},
 mini:{r:21,w:[84,262],sill:128,top:[[40,128],[37,110],[50,100],[105,95],[140,62],[268,60],[300,70],[310,100],[308,128]],win:[[112,94],[143,67],[265,65],[296,90]],pil:[200]}
};

function rim(cx,cy,r,style,uid){
  let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1d21"/><circle cx="${cx}" cy="${cy}" r="${r*0.68}" fill="url(#rim${uid})"/>`;
  const n=[5,6,10,7,5][style%5];
  for(let i=0;i<n;i++){const a=i*2*Math.PI/n;const x2=cx+Math.cos(a)*r*0.64,y2=cy+Math.sin(a)*r*0.64;
    s+=`<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#3a3e45" stroke-width="${style%5===2?1.4:style%5===4?4:2.6}" stroke-linecap="round"/>`;}
  s+=`<circle cx="${cx}" cy="${cy}" r="${r*0.16}" fill="#5a5f67"/>`;
  return s;
}

function car(v, opts={}){
  const uid=++UID; const h=hash(v.id);
  const T=CAR[v.body]||CAR.sedan;
  const color=v.col||((COLOR_MARCA[v.marca]&&h%3===0)?COLOR_MARCA[v.marca]:COLORES[h%COLORES.length]); const light=shade(color,0.18), dark=shade(color,-0.22);
  const ground=150, r=T.r;
  let bottom=""; const ws=[...T.w].sort((a,b)=>b-a);
  const last=T.top[T.top.length-1]; bottom=` L${last[0]},${T.sill}`;
  ws.forEach(cx=>{const R=r+5;bottom+=` L${cx+R},${T.sill} A${R},${R} 0 0 0 ${cx-R},${T.sill}`;});
  bottom+=` L${T.top[0][0]},${T.sill} Z`;
  const body=smooth(T.top)+bottom;
  const win=smooth([...T.win,T.win[0]]);
  let s=`<svg viewBox="0 0 400 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustración de ${v.marca} ${v.modelo}">
  <defs><linearGradient id="b${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
  <linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb4c8"/><stop offset="1" stop-color="#2b3644"/></linearGradient>
  <radialGradient id="rim${uid}"><stop offset="0" stop-color="#e3e6ea"/><stop offset="1" stop-color="#8d939b"/></radialGradient></defs>
  <ellipse cx="200" cy="${ground+2}" rx="175" ry="7" fill="#000" opacity=".18"/>`;
  if(T.bed) s+=`<rect x="236" y="78" width="126" height="6" fill="${dark}"/>`;
  s+=`<path d="${body}" fill="url(#b${uid})" stroke="${dark}" stroke-width="1"/>`;
  s+=`<path d="${win}" fill="url(#g${uid})" opacity=".95"/>`;
  T.pil.forEach(x=>{s+=`<line x1="${x}" y1="${T.win[0][1]-30}" x2="${x}" y2="${T.sill-6}" stroke="${dark}" stroke-width="${x===T.pil[0]?3:2}" opacity=".8"/>`;});
  if(!T.pil.length && v.body!=="roadster") s+=`<line x1="${(T.win[1][0]+T.win[2][0])/2+20}" y1="${T.win[1][1]+26}" x2="${(T.win[1][0]+T.win[2][0])/2+20}" y2="${T.sill-6}" stroke="${dark}" stroke-width="1.4" opacity=".7"/>`;
  // línea de carácter
  s+=`<path d="M${T.top[2][0]+6},${T.top[2][1]+10} L${T.top[T.top.length-3][0]},${T.top[T.top.length-3][1]+10}" stroke="${light}" stroke-width="1.5" opacity=".7" fill="none"/>`;
  // faros y pilotos
  s+=`<path d="M${T.top[1][0]+3},${T.top[1][1]-2} l14,-4 l2,6 l-15,3 z" fill="#f4f1d8" stroke="${dark}" stroke-width=".8"/>`;
  const tl=T.top[T.top.length-2]; s+=`<rect x="${tl[0]-8}" y="${tl[1]+2}" width="8" height="7" rx="1.5" fill="#c8202a"/>`;
  // retrovisor
  s+=`<path d="M${T.win[0][0]+2},${T.win[0][1]-3} l10,-4 l2,5 z" fill="${dark}"/>`;
  if(T.roll){s+=`<path d="M210,90 q4,-22 16,-22 q12,0 14,22" fill="none" stroke="#2a2d33" stroke-width="4"/>`;}
  if(T.intake){s+=`<path d="M232,108 l40,-6 l-2,12 l-36,2 z" fill="#1b1d21" opacity=".75"/>`;}
  if(v.tags&&v.tags.includes("circ")&&["sedan","coupe","hatch","super"].includes(v.body)){const tx=T.top[T.top.length-3];s+=`<path d="M${tx[0]-6},${tx[1]-2} l-4,-10 l34,-2 l2,6 z" fill="${dark}"/>`;}
  if(h%4===0&&v.tags&&v.tags.includes("dep")){s+=`<path d="M${T.top[2][0]+20},${T.top[2][1]-1} L${T.top[3][0]},${T.top[3][1]-1}" stroke="#fff" stroke-width="5" opacity=".55"/>`;}
  T.w.forEach(cx=>{s+=rim(cx,ground-r,r,h>>3,uid);});
  s+=`</svg>`;return s;
}

const MOTO = {
 naked:{fr:38,rr:38,head:[148,52],tankTop:44,seat:56,fair:false},
 sport:{fr:37,rr:38,head:[150,52],tankTop:46,seat:52,fair:"sport"},
 trail:{fr:42,rr:38,head:[146,40],tankTop:40,seat:48,fair:"trail"},
 touring:{fr:38,rr:38,head:[146,44],tankTop:42,seat:52,fair:"tour"},
 custom:{fr:38,rr:38,head:[150,48],tankTop:58,seat:74,fair:false,custom:true},
 retro:{fr:38,rr:38,head:[148,52],tankTop:46,seat:58,fair:false,retro:true},
 motard:{fr:36,rr:36,head:[146,42],tankTop:46,seat:50,fair:false,motard:true},
 scooter:{fr:28,rr:28,head:[140,44],tankTop:60,seat:66,fair:"scoot"}
};
function moto(v){
  const uid=++UID;const h=hash(v.id);const T=MOTO[v.body]||MOTO.naked;
  const color=v.col||COLOR_MARCA[v.marca]||COLORES[h%COLORES.length];const light=shade(color,0.18),dark=shade(color,-0.25);
  const ground=150, fx=105, rx=292, fy=ground-T.fr, ry=ground-T.rr;
  const frame="#2b2e34";
  let s=`<svg viewBox="0 0 400 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustración de ${v.marca} ${v.modelo}">
  <defs><linearGradient id="b${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
  <radialGradient id="rim${uid}"><stop offset="0" stop-color="#d8dbe0"/><stop offset="1" stop-color="#7d838c"/></radialGradient></defs>
  <ellipse cx="200" cy="${ground+2}" rx="150" ry="6" fill="#000" opacity=".18"/>`;
  const wheel=(cx,cy,r,spoked)=>{let w=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1d21"/><circle cx="${cx}" cy="${cy}" r="${r*0.74}" fill="none" stroke="url(#rim${uid})" stroke-width="3"/>`;
    if(spoked){for(let i=0;i<18;i++){const a=i*Math.PI/9;w+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*r*0.72).toFixed(1)}" y2="${(cy+Math.sin(a)*r*0.72).toFixed(1)}" stroke="#9aa0a8" stroke-width=".7"/>`;}}
    else{for(let i=0;i<3;i++){const a=i*2*Math.PI/3+((h%5)/5);w+=`<path d="M${cx},${cy} L${(cx+Math.cos(a-0.12)*r*0.72).toFixed(1)},${(cy+Math.sin(a-0.12)*r*0.72).toFixed(1)} L${(cx+Math.cos(a+0.12)*r*0.72).toFixed(1)},${(cy+Math.sin(a+0.12)*r*0.72).toFixed(1)} Z" fill="#454a52"/>`;}}
    w+=`<circle cx="${cx}" cy="${cy}" r="${r*0.45}" fill="none" stroke="#a9aeb5" stroke-width="2.5" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="4" fill="#5a5f67"/>`;return w;};
  const spoked=T.retro||v.body==="trail"||T.motard;
  const hd=T.head;
  // basculante y horquilla
  s+=`<path d="M${rx},${ry} L232,${ry-14}" stroke="${frame}" stroke-width="7" stroke-linecap="round"/>`;
  s+=`<path d="M${fx},${fy} L${hd[0]-4},${hd[1]+6}" stroke="#c4c8ce" stroke-width="6" stroke-linecap="round"/>`;
  // ruedas
  s+=wheel(rx,ry,T.rr,spoked)+wheel(fx,fy,T.fr,spoked);
  // disco delantero
  s+=`<circle cx="${fx}" cy="${fy}" r="${T.fr*0.5}" fill="none" stroke="#c9ccd1" stroke-width="3" opacity=".9"/>`;
  // motor
  if(T.fair!=="scoot"){
    s+=`<path d="M172,${ground-62} L230,${ground-66} L238,${ground-36} L214,${ground-22} L178,${ground-26} Z" fill="#3c4048"/>`;
    s+=`<path d="M178,${ground-60} l20,-2 l0,30 l-20,2 z" fill="#575c65"/><path d="M204,${ground-62} l20,-2 l2,30 l-20,2 z" fill="#575c65"/>`;
    // chasis
    s+=`<path d="M${hd[0]},${hd[1]+4} L236,${ground-70} L236,${ground-40}" stroke="${frame}" stroke-width="6" fill="none" stroke-linejoin="round"/>`;
    // escape
    if(v.body==="sport"||(h%2===0&&!T.custom&&!T.retro)) s+=`<path d="M214,${ground-24} L268,${ground-36} L300,${ground-56} l8,8 L272,${ground-26} Z" fill="#6d727a"/>`;
    else s+=`<path d="M190,${ground-24} L300,${ground-30} l6,10 L192,${ground-16} Z" fill="#b5b9bf"/>`;
  }
  // depósito, asiento y colín
  if(T.fair==="scoot"){
    s+=`<path d="M128,40 L150,40 L160,110 L250,110 L262,78 L330,72 L340,92 L320,118 L150,124 L132,110 Z" fill="url(#b${uid})" stroke="${dark}"/>`;
    s+=`<path d="M246,74 Q290,60 330,66 L330,74 L248,82 Z" fill="#202227"/>`;
    s+=`<path d="M136,40 l-6,-22 l10,0 l8,22 z" fill="#aac4d8" opacity=".7"/>`;
  } else {
    const tt=T.tankTop;
    s+=`<path d="M${hd[0]+8},${tt+14} Q${hd[0]+20},${tt-4} 190,${tt} Q222,${tt} 236,${tt+16} L236,${tt+30} L${hd[0]+16},${tt+34} Z" fill="url(#b${uid})" stroke="${dark}"/>`;
    s+=`<path d="M232,${T.seat} Q262,${T.seat-6} 300,${T.seat-4} L304,${T.seat+6} L236,${T.seat+12} Z" fill="#202227"/>`;
    if(!T.custom) s+=`<path d="M296,${T.seat-6} L336,${T.seat-16} L334,${T.seat-8} L300,${T.seat+8} Z" fill="url(#b${uid})"/>`;
    s+=`<rect x="330" y="${T.seat-14}" width="7" height="5" rx="1" fill="#c8202a"/>`;
  }
  // carenados
  if(T.fair==="sport"){
    s+=`<path d="M100,72 Q112,46 152,40 L176,44 L182,96 L232,112 L214,124 L170,124 Q132,110 112,94 Z" fill="url(#b${uid})" stroke="${dark}"/>`;
    s+=`<path d="M150,40 L132,30 L170,38 Z" fill="#9fb4c8" opacity=".75"/>`;
    s+=`<path d="M108,70 l18,-6 l2,6 l-18,5 z" fill="#f4f1d8"/>`;
    s+=`<path d="M150,${ground-42} l40,0" stroke="${light}" stroke-width="3"/>`;
  } else if(T.fair==="trail"||T.fair==="tour"){
    s+=`<path d="M118,62 L150,34 L176,44 L176,90 L138,84 Z" fill="url(#b${uid})" stroke="${dark}"/>`;
    s+=`<path d="M148,34 L138,8 L156,10 L166,38 Z" fill="#a9c0d4" opacity=".7"/>`;
    s+=`<path d="M122,60 l14,-6 l2,8 l-14,4 z" fill="#f4f1d8"/>`;
    if(v.body==="trail") s+=`<path d="M86,${fy-T.fr-6} L132,${fy-T.fr-2} L122,${fy-T.fr+4} L84,${fy-T.fr} Z" fill="${color}"/>`;
    if(T.fair==="tour") s+=`<rect x="300" y="${T.seat+4}" width="46" height="34" rx="6" fill="${dark}"/>`;
  } else if(T.fair!=="scoot"){
    // faro
    if(T.retro||T.custom) s+=`<circle cx="${hd[0]-10}" cy="${hd[1]+8}" r="11" fill="#f4f1d8" stroke="#8d939b" stroke-width="3"/>`;
    else s+=`<path d="M${hd[0]-22},${hd[1]+2} l16,-6 l6,12 l-14,10 z" fill="#f4f1d8" stroke="${dark}"/>`;
    if(T.motard) s+=`<path d="M86,${fy-T.fr-4} L130,${fy-T.fr-2} L120,${fy-T.fr+4} L86,${fy-T.fr+2} Z" fill="${color}"/>`;
  }
  // manillar
  s+=`<path d="M${hd[0]-2},${hd[1]} l${T.fair==="sport"?6:-4},-12 l14,-2" stroke="${frame}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s+=`</svg>`;return s;
}

/* Diagrama de disposición de cilindros para la sección de mecánica */
function motor(arq){
  const c=(x,y,r=13)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r*0.45}" fill="var(--accent)"/>`;
  let s=`<svg viewBox="0 0 260 120" class="diag" role="img" aria-label="Disposición de cilindros ${arq}">`;
  const map={L1:1,L3:3,L4:4,L5:5,L6:6,P2:2};
  if(map[arq]){const n=map[arq];const w=n*34;const x0=130-w/2+17;s+=`<rect x="${x0-24}" y="34" width="${w+14}" height="52" rx="8" fill="none" stroke="var(--muted)" stroke-dasharray="4 3"/>`;
    for(let i=0;i<n;i++)s+=c(x0+i*34-7,60);
    s+=`<text x="130" y="110" text-anchor="middle" class="dt">${n===1?"Monocilíndrico":n===2?"Bicilíndrico en paralelo":n+" cilindros en línea"}</text>`;}
  else if(/^V(\d+)/.test(arq)){const n=parseInt(arq.slice(1));const half=n/2;const w=half*30;
    for(let i=0;i<half;i++){s+=c(130-w/2+15+i*30,38,11);s+=c(130-w/2+30+i*30,80,11);}
    s+=`<path d="M60,104 L130,60 L200,104" fill="none" stroke="var(--muted)" stroke-dasharray="4 3"/><text x="130" y="116" text-anchor="middle" class="dt">${n} cilindros en V (dos bancadas)</text>`;}
  else if(/^B(\d)/.test(arq)){const n=parseInt(arq.slice(1));const half=n/2;
    for(let i=0;i<half;i++){s+=`<rect x="${20}" y="${20+i*(70/half)}" width="80" height="${60/half}" rx="5" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><rect x="160" y="${20+i*(70/half)}" width="80" height="${60/half}" rx="5" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>`;}
    s+=`<rect x="105" y="30" width="50" height="50" rx="25" fill="var(--accent)" opacity=".85"/><text x="130" y="110" text-anchor="middle" class="dt">Bóxer: ${n} cilindros horizontales enfrentados</text>`;}
  else if(arq==="R2"){s+=`<path d="M70,30 L110,90 L40,90 Z" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><path d="M190,30 L230,90 L160,90 Z" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><text x="130" y="112" text-anchor="middle" class="dt">Rotativo: 2 rotores triangulares</text>`;}
  else if(arq==="EV"){s+=`<rect x="20" y="70" width="220" height="24" rx="4" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>`;for(let i=0;i<10;i++)s+=`<rect x="${26+i*21.5}" y="74" width="17" height="16" fill="var(--accent)" opacity=".6"/>`;s+=`<circle cx="130" cy="38" r="22" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><circle cx="130" cy="38" r="8" fill="var(--accent)"/><text x="130" y="112" text-anchor="middle" class="dt">Motor eléctrico + batería en el suelo</text>`;}
  s+=`</svg>`;return s;
}

/* Diagramas de técnicas */
function tecnica(tipo){
  if(tipo==="trazada") return `<svg viewBox="0 0 320 200" class="diag" role="img" aria-label="Trazada de una curva">
   <path d="M40,190 L40,90 Q40,20 110,20 L300,20" fill="none" stroke="var(--muted)" stroke-width="2"/>
   <path d="M110,190 L110,100 Q110,80 130,80 L300,80" fill="none" stroke="var(--muted)" stroke-width="2"/>
   <path d="M98,190 L96,130 Q100,58 126,40 Q160,30 300,58" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="1 0"/>
   <path d="M60,190 L58,110 Q62,30 150,26 L300,30" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6 5" opacity=".6"/>
   <circle cx="98" cy="160" r="5" fill="var(--ink)"/><text x="118" y="164" class="dt">Frena en recto</text>
   <circle cx="104" cy="96" r="5" fill="var(--accent)"/><text x="122" y="112" class="dt">Gira (tarde)</text>
   <circle cx="126" cy="40" r="5" fill="var(--accent)"/><text x="150" y="56" class="dt">Vértice tardío</text>
   <circle cx="250" cy="48" r="5" fill="var(--accent)"/><text x="218" y="74" class="dt">Acelera y abre</text>
   <text x="12" y="14" class="dt" fill="var(--muted)">Línea roja: vértice tardío · discontinua: vértice temprano</text></svg>`;
  if(tipo==="frenada") return `<svg viewBox="0 0 320 170" class="diag" role="img" aria-label="Presión de freno en el tiempo">
   <line x1="40" y1="140" x2="300" y2="140" stroke="var(--muted)"/><line x1="40" y1="20" x2="40" y2="140" stroke="var(--muted)"/>
   <text x="300" y="158" text-anchor="end" class="dt">tiempo</text><text x="46" y="18" class="dt">presión de freno</text>
   <path d="M40,140 L60,140 L66,90 L80,92 L90,40 L210,44 Q240,60 250,120 L262,140 L300,140" fill="none" stroke="var(--accent)" stroke-width="3.5"/>
   <path d="M40,140 L60,140 L62,30 L210,30 L212,140" fill="none" stroke="var(--ink)" stroke-dasharray="5 4" opacity=".55"/>
   <text x="70" y="106" class="dt">1 · carga</text><text x="120" y="60" class="dt">2 · presión fuerte</text><text x="218" y="104" class="dt">3 · suelta poco a poco</text>
   <text x="160" y="24" class="dt" fill="var(--muted)">discontinua: frenazo de golpe (peor)</text></svg>`;
  if(tipo==="pesos") return `<svg viewBox="0 0 320 170" class="diag" role="img" aria-label="Transferencia de pesos">
   <rect x="80" y="70" width="160" height="40" rx="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>
   <circle cx="110" cy="114" r="14" fill="var(--ink)"/><circle cx="210" cy="114" r="14" fill="var(--ink)"/>
   <path d="M160,60 L100,40" stroke="var(--accent)" stroke-width="4" marker-end="url(#ar)"/><text x="40" y="34" class="dt">Frenar: peso adelante</text>
   <path d="M160,60 L220,40" stroke="var(--ink)" stroke-width="3" marker-end="url(#ar2)"/><text x="196" y="30" class="dt">Acelerar: peso atrás</text>
   <text x="160" y="155" text-anchor="middle" class="dt">Más peso sobre una rueda = más agarre en esa rueda</text>
   <defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/></marker></defs></svg>`;
  if(tipo==="contramanillar") return `<svg viewBox="0 0 320 170" class="diag" role="img" aria-label="Contramanillar visto desde arriba">
   <line x1="80" y1="80" x2="240" y2="80" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
   <rect x="150" y="70" width="20" height="70" rx="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>
   <path d="M232,96 L232,46" stroke="var(--accent)" stroke-width="4" marker-end="url(#ar3)"/>
   <text x="200" y="36" class="dt">Empuja el puño derecho</text>
   <path d="M160,150 Q220,150 260,120" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="6 4" marker-end="url(#ar3)"/>
   <text x="100" y="166" class="dt">→ la moto se inclina y gira a la derecha</text>
   <defs><marker id="ar3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs></svg>`;
  return "";
}

window.ILU = {car, moto, motor, tecnica, vehiculo:v=>v.tipo==="moto"?moto(v):car(v)};
})();

/* Kilómetro Cero · aplicación principal (vanilla JS, sin dependencias) */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const fmt=(n,d=0)=>Number(n).toLocaleString("es-ES",{maximumFractionDigits:d,minimumFractionDigits:d});
const eur=n=>fmt(Math.round(n))+" €";
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const store={get(k,d){try{const v=localStorage.getItem("kc_"+k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem("kc_"+k,JSON.stringify(v));}catch(e){}}};
const AHORA=2026;

/* ---------- Datos ---------- */
const MOTORES={};
window.MOTORES_TXT.trim().split("\n").forEach(l=>{const f=l.split("|");if(f.length<12)return;
  const [code,nombre,comb,arq,cc,dist,asp,fiab,desc,fallos,mant,dc]=f;
  MOTORES[code]={code,nombre,comb,arq,cc:+cc,dist,asp,fiab:+fiab,desc,fallos:fallos.split(";").filter(Boolean),mant:mant.split(";").filter(Boolean),dcost:dc.trim()==="-"?null:dc.split("/").map(Number)};});
function parseVeh(txt,tipo){return txt.trim().split("\n").filter(l=>l.includes("|")).map(l=>{
  const [marca,modelo,gen,anos,body,precio,tags,desc,fallos,vers]=l.split("|");
  const [a1,a2]=anos.split("-");const [p1,p2]=precio.split("-").map(Number);
  const versiones=vers.split("~").map(s=>{const x=s.split(",");return{n:x[0],cv:+x[1],nm:+x[2],motor:x[3],peso:+x[4],acc:+x[5],vmax:+x[6],cons:+x[7],trac:x[8],caja:x[9]};});
  return{id:slug(`${marca} ${modelo} ${gen}`),tipo,marca,modelo,gen,anos,desde:+a1,hasta:a2==="hoy"?AHORA:+a2,actual:a2==="hoy",body,pmin:p1,pmax:p2,tags:tags.split(",").filter(Boolean),desc,fallos:fallos.split(";").filter(Boolean),vers:versiones};});}
const VEH=[...parseVeh(window.COCHES_TXT,"coche"),...parseVeh(window.MOTOS_TXT,"moto")];
const BYID=Object.fromEntries(VEH.map(v=>[v.id,v]));
const P=window.PUNTOS, RUTAS=window.RUTAS;

/* ---------- Diccionarios ---------- */
const TAGN={dep:"Deportivo",circ:"Circuito",fiab:"Fiable",barato:"Barato de mantener",prac:"Práctico",clas:"Clásico",conf:"Confort",ruta:"Viajes",off:"Campo",urb:"Ciudad",efic:"Eficiente",lujo:"Premium",novel:"Para noveles",tun:"Preparación",fam:"Familiar",a2:"A2 directa",a2l:"Limitable A2","125":"Carnet B (125)"};
const BODYN={hatch:"Compacto",sedan:"Berlina",coupe:"Coupé",wagon:"Familiar",suv:"SUV / 4x4",roadster:"Descapotable",super:"Superdeportivo",pickup:"Pick-up",mini:"Urbano",naked:"Naked",sport:"Deportiva",trail:"Trail",touring:"Turismo / sport-tourer",custom:"Custom",retro:"Neoclásica",motard:"Supermotard",scooter:"Scooter"};
const TRAC={D:"Delantera",T:"Trasera (propulsión)",4:"Total (4x4)",C:"Cadena",K:"Cardán",B:"Correa"};
const CAJA={M4:"Manual 4 vel.",M5:"Manual 5 vel.",M6:"Manual 6 vel.",A:"Automática",DCT:"Doble embrague",CVT:"Automática CVT",SMG:"Manual robotizada SMG"};
const COMB={g:"Gasolina",d:"Diésel",e:"Eléctrico",h:"Híbrido"};
const DIST={cadena:"Cadena","correa":"Correa","correa-aceite":"Correa bañada en aceite","-":"No tiene (rotativo)","engranajes":"Engranajes"};
const ASP={atmo:"Atmosférico",turbo:"Turbo",biturbo:"Biturbo",compresor:"Compresor","-":"—"};
const PREMIUM=["BMW","Audi","Mercedes-Benz","Alfa Romeo","Lexus","Mini","Land Rover","Jeep","Tesla","Ducati","Triumph","Harley-Davidson","MV Agusta","Aprilia"];
const EXOTIC=["Porsche","Ferrari","Lotus","Chevrolet","Nissan GT-R"];
const JAP=["Toyota","Honda","Mazda","Dacia","Suzuki","Hyundai","Kia","Yamaha","Kawasaki","Subaru"];
const brandF=v=>EXOTIC.includes(v.marca)||v.tags.includes("lujo")&&v.tipo==="coche"&&v.pmin>40000?2.3:PREMIUM.includes(v.marca)?1.3:JAP.includes(v.marca)?0.85:1;

/* ---------- Utilidades de vehículo ---------- */
const vname=v=>`${v.marca} ${v.modelo}`;
const top=v=>v.vers.reduce((a,b)=>b.cv>a.cv?b:a,v.vers[0]);
const cvRange=v=>{const c=v.vers.map(x=>x.cv);const a=Math.min(...c),b=Math.max(...c);return a===b?`${fmt(a,a%1?1:0)} cv`:`${fmt(a,a%1?1:0)}-${fmt(b,b%1?1:0)} cv`;};
const kgcv=x=>x.peso/x.cv;
function a2info(v,ver){
  if(v.tipo!=="moto")return null;
  if(v.tags.includes("125")||ver.cv<=15.5)return{t:"125",txt:"Se puede llevar con carnet B y 3 años de antigüedad (solo en España)."};
  if(ver.cv<=47.6)return{t:"a2",txt:"Apta para A2 de serie (hasta 35 kW)."};
  if(ver.cv<=95.2||v.tags.includes("a2l"))return{t:"a2l",txt:"Se puede limitar a 35 kW para el carnet A2 (kit oficial y anotación en la ficha técnica). Con el A la liberas."};
  return{t:"A",txt:"Necesita carnet A (más de 70 kW de origen, no se puede limitar)."};
}
function anioRef(v){return Math.min(v.hasta,Math.round((v.desde+v.hasta)/2));}
function pic(v,big){const f=(window.FOTOS||{})[v.id];if(!f)return ILU.vehiculo(v);
  return `<img class="foto${big?" big":""}" src="fotos/${v.id}.jpg" alt="Foto de ${esc(vname(v))} ${esc(v.gen)}" loading="lazy" decoding="async">`;}
function credito(v){const f=(window.FOTOS||{})[v.id];if(!f)return "Ilustración generada (no es una foto del modelo real)";
  return `Foto: ${esc(f.autor||"autor desconocido")} · ${esc(f.licencia||"")} · <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.fuente||"Wikimedia Commons")}</a>`;}
function gl(term,txt){return `<button type="button" class="gl" data-g="${esc(term)}">${esc(txt||term)}</button>`;}
function tagsHTML(v,max=3){
  const pri=["a2","a2l","125","dep","fiab","clas","circ","barato","prac","novel","efic","ruta","off"];
  const t=pri.filter(x=>v.tags.includes(x)).slice(0,max);
  return t.map(x=>`<span class="tag ${x==="a2"||x==="a2l"?"a2":""}">${TAGN[x]}</span>`).join("");
}
function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1800);}

/* ---------- Estado persistente ---------- */
let favs=store.get("fav",[]);
let cmp=store.get("cmp",[]).filter(c=>BYID[c.id]);
function saveCmp(){store.set("cmp",cmp);const b=$("#cmpn");b.textContent=cmp.length;b.hidden=!cmp.length;}
function addCmp(id,vi=0){if(cmp.find(c=>c.id===id&&c.vi===vi)){toast("Ya está en el comparador");return;}
  if(cmp.length>=5){toast("Máximo 5 vehículos: quita uno primero");return;}cmp.push({id,vi});saveCmp();toast("Añadido al comparador");}

/* ---------- Glosario emergente ---------- */
document.addEventListener("click",e=>{const g=e.target.closest(".gl");if(g){e.preventDefault();const k=g.dataset.g;
  $("#sheett").textContent=k;$("#sheetp").textContent=window.GLOSARIO[k]||"";$("#sheet").hidden=false;return;}
  if(!e.target.closest("#sheet"))$("#sheet").hidden=true;});
$("#sheetx").addEventListener("click",()=>$("#sheet").hidden=true);

/* ---------- Router ---------- */
const app=$("#app");
const VIEWS={inicio:vInicio,catalogo:vCatalogo,comparar:vComparar,rutas:vRutas,disenar:vDisenar,perfil:vPerfil,quiz:vQuiz,tecnicas:vTecnicas,glosario:vGlosario};
function route(){
  const h=(location.hash||"#inicio").slice(1);
  let view=h, arg=null;
  if(h.startsWith("v-")){view="ficha";arg=h.slice(2);}
  else if(h.startsWith("ruta-")){view="rutas";arg=h.slice(5);}
  $$("#nav a").forEach(a=>a.classList.toggle("on",a.dataset.v===view||(view==="ficha"&&a.dataset.v==="catalogo")));
  if(view==="ficha"&&BYID[arg])vFicha(BYID[arg]);
  else (VIEWS[view]||vInicio)(arg);
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);

/* =====================================================================
   INICIO
   ===================================================================== */
function vInicio(){
  const nC=VEH.filter(v=>v.tipo==="coche"), nM=VEH.filter(v=>v.tipo==="moto");
  const nVer=VEH.reduce((a,v)=>a+v.vers.length,0);
  const hero=BYID["bmw-serie-3-e46"]||VEH[0], heroM=BYID["yamaha-mt-07-rm04-rm33"]||nM[0];
  const test=store.get("test",null);
  const recs=test?recomendar(test.ax,test.meta).slice(0,4):[];
  const fv=favs.map(id=>BYID[id]).filter(Boolean);
  app.innerHTML=`
  <section class="hero">
    <div>
      <div class="eyebrow">Coches · Motos · Rutas desde la sierra de Madrid</div>
      <h1>Todo lo que quieres saber antes de arrancar.</h1>
      <p class="lead">Fichas de cada generación con fallos típicos y qué mirar antes de comprar, un simulador de lo que te costará de verdad, mecánica explicada sin tecnicismos y rutas de curvas por Madrid, Segovia, Ávila, Guadalajara, Toledo y Cuenca.</p>
      <div class="row" style="margin-top:20px"><a class="btn pri" href="#catalogo">Explorar el catálogo</a><a class="btn" href="#perfil">Hacer el test de perfil</a></div>
      <div class="stats">
        <div><b>${nC.length}</b><span>generaciones de coches</span></div>
        <div><b>${nM.length}</b><span>generaciones de motos</span></div>
        <div><b>${nVer}</b><span>versiones con datos</span></div>
        <div><b>${RUTAS.length}</b><span>rutas por la zona centro</span></div>
      </div>
    </div>
    <div class="art">
      <a href="#v-${hero.id}" aria-label="${esc(vname(hero))}">${pic(hero)}</a><div class="road"></div>
      <a href="#v-${heroM.id}" aria-label="${esc(vname(heroM))}">${pic(heroM)}</a><div class="road"></div>
    </div>
  </section>
  <section>
    <div class="tiles">
      ${[["C","Catálogo","Busca por marca, tipo, precio o carnet. Cada modelo tiene ficha completa.","#catalogo"],
         ["5","Comparador","Hasta 5 vehículos cara a cara con explicación de quién gana y por qué.","#comparar"],
         ["R","Rutas",`${RUTAS.length} rutas de puertos y pueblos con avisos y perfil de altitud.`,"#rutas"],
         ["+","Diseñador de rutas","Toca puertos y pueblos en el mapa y crea tu propia ruta.","#disenar"],
         ["?","Test de perfil","20 preguntas para saber qué tipo de conductor eres y qué te encaja.","#perfil"],
         ["Q","Quiz","Pon a prueba lo que sabes de mecánica, conducción y normativa.","#quiz"],
         ["T","Técnicas","Trazada, frenada, punta-tacón, contramanillar y más, paso a paso.","#tecnicas"],
         ["G","Glosario","Par, bimasa, FAP, A2... todo explicado en una línea.","#glosario"]]
        .map(t=>`<a class="tile" href="${t[3]}"><h3><span class="signbox">${t[0]}</span>${t[1]}</h3><p>${t[2]}</p></a>`).join("")}
    </div>
  </section>
  ${recs.length?`<section><div class="row" style="justify-content:space-between"><h2>Para tu perfil: ${esc(test.arq.n)}</h2><a href="#perfil">Ver resultado completo</a></div><div class="grid g4" style="margin-top:14px">${recs.map(r=>vcard(r.v)).join("")}</div></section>`:""}
  ${fv.length?`<section><h2>Tus favoritos</h2><div class="grid g4" style="margin-top:14px">${fv.map(vcard).join("")}</div></section>`:""}
  <section><h2>Modelos para empezar</h2><p class="muted" style="margin-top:6px">Una selección de propulsión, nakeds para A2 y clásicos que no fallan.</p>
    <div class="grid g4" style="margin-top:14px">${["bmw-serie-3-e46","bmw-m3-e46","mazda-mx-5-nb","toyota-gt86-gr86-zn6-zn8","yamaha-mt-07-rm04-rm33","kawasaki-z650-er650h-k","ktm-790-890-duke-tu1-tu5","triumph-street-triple-765-rs-r"].map(id=>BYID[id]).filter(Boolean).map(vcard).join("")}</div>
  </section>`;
}

function vcard(v){
  const t=top(v);
  return `<a class="vcard" href="#v-${v.id}"><div class="pic">${pic(v)}</div><div class="bd">
   <div class="mk">${esc(v.marca)} · ${BODYN[v.body]||v.body}</div>
   <h3>${esc(v.modelo)}<small>${esc(v.gen)}</small></h3>
   <div class="tags">${tagsHTML(v)}</div>
   <div class="meta"><span class="mono">${v.anos.replace("-","–")}</span><span class="mono">${cvRange(v)}</span><span class="mono">${v.pmin>=1000?fmt(v.pmin/1000,v.pmin%1000?1:0)+"k":v.pmin}–${fmt(v.pmax/1000,v.pmax%1000?1:0)}k €</span></div>
  </div></a>`;
}

/* =====================================================================
   CATÁLOGO
   ===================================================================== */
let CF=store.get("cf",{q:"",tipo:"todos",body:"",marca:"",pmax:0,tags:[],orden:"marca",n:36});
function vCatalogo(){
  const marcas=[...new Set(VEH.filter(v=>CF.tipo==="todos"||v.tipo===CF.tipo).map(v=>v.marca))].sort();
  const bodies=[...new Set(VEH.filter(v=>CF.tipo==="todos"||v.tipo===CF.tipo).map(v=>v.body))];
  const tagOpts=CF.tipo==="moto"?["a2","a2l","125","dep","fiab","barato","novel","ruta","off","clas","urb"]:["dep","circ","fiab","barato","clas","prac","novel","efic","ruta","off","fam","tun"];
  app.innerHTML=`
  <div class="eyebrow">Catálogo</div><h1 style="font-size:clamp(2rem,5vw,3rem)">Coches y motos por generaciones</h1>
  <p class="muted" style="margin-top:8px;max-width:70ch">Cada tarjeta es una generación completa (por ejemplo el BMW Serie 3 E46 de 1998 a 2006) con todas sus versiones de motor. Toca una para ver ficha, fallos, costes y mecánica.</p>
  <div class="panel stack" style="margin-top:18px">
    <div class="filters">
      <label class="f q">Buscar<input type="search" id="fq" placeholder="Ej.: E46, MT-07, Golf GTI, diésel…" value="${esc(CF.q)}"></label>
      <label class="f">Tipo<select id="ftipo"><option value="todos">Todos</option><option value="coche">Coches</option><option value="moto">Motos</option></select></label>
      <label class="f">Carrocería<select id="fbody"><option value="">Todas</option>${bodies.map(b=>`<option value="${b}">${BODYN[b]}</option>`).join("")}</select></label>
      <label class="f">Marca<select id="fmarca"><option value="">Todas</option>${marcas.map(m=>`<option>${esc(m)}</option>`).join("")}</select></label>
      <label class="f">Ordenar<select id="forden"><option value="marca">Marca</option><option value="cv">Más potentes</option><option value="precio">Más baratos</option><option value="nuevo">Más nuevos</option><option value="kgcv">Mejor peso/potencia</option></select></label>
    </div>
    <div class="row"><label class="f" style="flex:1;min-width:220px">Precio máximo de compra: <b id="fpv" style="color:var(--ink)">${CF.pmax?eur(CF.pmax):"sin límite"}</b><input type="range" id="fpmax" min="0" max="60000" step="1000" value="${CF.pmax||60000}"></label></div>
    <div class="chips" id="ftags">${tagOpts.map(t=>`<button type="button" class="chip ${CF.tags.includes(t)?"on":""}" data-t="${t}">${TAGN[t]}</button>`).join("")}</div>
  </div>
  <div class="row" style="justify-content:space-between;margin:18px 0 10px"><span class="count" id="fcount"></span><button class="btn sm" id="freset" type="button">Quitar filtros</button></div>
  <div class="grid g4" id="flist"></div>
  <div style="text-align:center;margin-top:20px"><button class="btn" id="fmore" type="button">Ver más</button></div>`;
  $("#ftipo").value=CF.tipo;$("#fbody").value=CF.body;$("#fmarca").value=CF.marca;$("#forden").value=CF.orden;
  const upd=()=>{store.set("cf",CF);listCat();};
  $("#fq").addEventListener("input",e=>{CF.q=e.target.value;CF.n=36;upd();});
  $("#ftipo").addEventListener("change",e=>{CF.tipo=e.target.value;CF.body="";CF.marca="";CF.tags=[];CF.n=36;store.set("cf",CF);vCatalogo();});
  $("#fbody").addEventListener("change",e=>{CF.body=e.target.value;CF.n=36;upd();});
  $("#fmarca").addEventListener("change",e=>{CF.marca=e.target.value;CF.n=36;upd();});
  $("#forden").addEventListener("change",e=>{CF.orden=e.target.value;upd();});
  $("#fpmax").addEventListener("input",e=>{const v=+e.target.value;CF.pmax=v>=60000?0:v;$("#fpv").textContent=CF.pmax?eur(CF.pmax):"sin límite";CF.n=36;upd();});
  $("#ftags").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;const t=b.dataset.t;CF.tags=CF.tags.includes(t)?CF.tags.filter(x=>x!==t):[...CF.tags,t];b.classList.toggle("on");CF.n=36;upd();});
  $("#freset").addEventListener("click",()=>{CF={q:"",tipo:"todos",body:"",marca:"",pmax:0,tags:[],orden:"marca",n:36};store.set("cf",CF);vCatalogo();});
  $("#fmore").addEventListener("click",()=>{CF.n+=36;listCat();});
  listCat();
}
function filtrar(){
  const q=CF.q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  let r=VEH.filter(v=>{
    if(CF.tipo!=="todos"&&v.tipo!==CF.tipo)return false;
    if(CF.body&&v.body!==CF.body)return false;
    if(CF.marca&&v.marca!==CF.marca)return false;
    if(CF.pmax&&v.pmin>CF.pmax)return false;
    if(CF.tags.length&&!CF.tags.every(t=>v.tags.includes(t)))return false;
    if(q){const hay=(v.marca+" "+v.modelo+" "+v.gen+" "+v.vers.map(x=>x.n+" "+(MOTORES[x.motor]?.nombre||"")+" "+COMB[MOTORES[x.motor]?.comb]).join(" ")+" "+BODYN[v.body]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
      if(!q.split(/\s+/).every(w=>hay.includes(w)))return false;}
    return true;});
  const o=CF.orden;
  r.sort(o==="cv"?(a,b)=>top(b).cv-top(a).cv:o==="precio"?(a,b)=>a.pmin-b.pmin:o==="nuevo"?(a,b)=>b.desde-a.desde:o==="kgcv"?(a,b)=>kgcv(top(a))-kgcv(top(b)):(a,b)=>(a.marca+a.modelo+a.desde).localeCompare(b.marca+b.modelo+b.desde));
  return r;
}
function listCat(){const r=filtrar();$("#fcount").textContent=`${r.length} generaciones`;
  $("#flist").innerHTML=r.length?r.slice(0,CF.n).map(vcard).join(""):`<div class="panel" style="grid-column:1/-1">No hay resultados con esos filtros. Prueba a quitar alguna etiqueta o subir el precio.</div>`;
  $("#fmore").hidden=r.length<=CF.n;}

/* =====================================================================
   FICHA DE VEHÍCULO
   ===================================================================== */
let FT={tab:"ficha",vi:0};
function vFicha(v){
  if(FT.id!==v.id)FT={tab:"ficha",vi:0,id:v.id};
  const isFav=favs.includes(v.id);
  const others=VEH.filter(x=>x.marca===v.marca&&x.modelo===v.modelo&&x.id!==v.id).sort((a,b)=>a.desde-b.desde);
  app.innerHTML=`
  <a href="#catalogo" class="muted" style="text-decoration:none">← Volver al catálogo</a>
  <div class="fhead" style="margin-top:12px">
    <div>
      <div class="eyebrow">${esc(v.marca)} · ${BODYN[v.body]} · ${v.tipo==="moto"?"Moto":"Coche"}</div>
      <h1 style="font-size:clamp(2.2rem,5.5vw,3.6rem)">${esc(v.modelo)} <span style="color:var(--accent)">${esc(v.gen)}</span></h1>
      <p class="mono muted" style="margin-top:6px">${v.anos.replace("-"," – ")} · ${v.vers.length} versi${v.vers.length>1?"ones":"ón"} · ${eur(v.pmin)} – ${eur(v.pmax)} usado</p>
      <p style="margin-top:12px;font-size:1.08rem;max-width:62ch">${esc(v.desc)}</p>
      <div class="tags" style="margin-top:12px;display:flex;gap:5px;flex-wrap:wrap">${v.tags.map(t=>`<span class="tag ${t==="a2"||t==="a2l"?"a2":""}">${TAGN[t]||t}</span>`).join("")}</div>
      <div class="row" style="margin-top:16px">
        <button class="btn pri" id="addcmp" type="button">Añadir al comparador</button>
        <button class="btn" id="fav" type="button" aria-pressed="${isFav}">${isFav?"★ En favoritos":"☆ Guardar en favoritos"}</button>
      </div>
      ${others.length?`<p style="margin-top:14px;font-size:.92rem" class="muted">Otras generaciones: ${others.map(o=>`<a href="#v-${o.id}">${esc(o.gen)} (${o.desde})</a>`).join(" · ")}</p>`:""}
    </div>
    <div class="pic">${pic(v,true)}<p class="muted" style="font-size:.78rem;text-align:center;margin-top:6px">${credito(v)}</p></div>
  </div>
  <section style="margin-top:28px">
    <div class="eyebrow" style="margin-bottom:8px">Elige versión</div>
    <div class="chips" id="vsel">${v.vers.map((x,i)=>`<button type="button" class="chip ${i===FT.vi?"on":""}" data-i="${i}">${esc(x.n)} · ${fmt(x.cv,x.cv%1?1:0)} cv</button>`).join("")}</div>
    <div class="tabs" role="tablist" style="margin-top:18px">
      ${[["ficha","Ficha técnica"],["compra","Antes de comprar"],["costes","Simulador de costes"],["mecanica","Mecánica"]].map(t=>`<button type="button" role="tab" data-t="${t[0]}" class="${FT.tab===t[0]?"on":""}">${t[1]}</button>`).join("")}
    </div>
    <div id="tabc" style="margin-top:20px"></div>
  </section>`;
  $("#addcmp").addEventListener("click",()=>addCmp(v.id,FT.vi));
  $("#fav").addEventListener("click",()=>{favs=favs.includes(v.id)?favs.filter(x=>x!==v.id):[...favs,v.id];store.set("fav",favs);vFicha(v);});
  $("#vsel").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;FT.vi=+b.dataset.i;$$("#vsel .chip").forEach(c=>c.classList.toggle("on",c===b));renderTab(v);});
  $$(".tabs button").forEach(b=>b.addEventListener("click",()=>{FT.tab=b.dataset.t;$$(".tabs button").forEach(x=>x.classList.toggle("on",x===b));renderTab(v);}));
  renderTab(v);
}
function renderTab(v){const ver=v.vers[FT.vi]||v.vers[0];const el=$("#tabc");
  ({ficha:tabFicha,compra:tabCompra,costes:tabCostes,mecanica:tabMecanica})[FT.tab](v,ver,el);}

function interpretar(v,ver){
  const k=kgcv(ver);const out=[];
  if(v.tipo==="coche"){
    out.push(k<4?"Prestaciones de superdeportivo: acelera como muy pocos vehículos en la carretera.":k<6?"Muy rápido: adelantamientos instantáneos y ritmo de deportivo serio.":k<8?"Deportivo: la aceleración se nota de verdad y los adelantamientos son fáciles.":k<11?"Ágil: más que suficiente para disfrutar en puertos.":k<14?"Normal: cumple sin alardes. Para adelantar hay que planificar.":"Tranquilo: pensado para moverse con calma.");
    if(ver.cv>300)out.push("Mucha potencia para alguien con poca experiencia: un curso de conducción deportiva te ayudará a aprovecharla con seguridad.");
    if(ver.trac==="T")out.push("Al ser de propulsión, con lluvia o gas brusco en curva la trasera puede deslizar. Es más divertido, pero exige suavidad.");
    if(ver.trac==="4")out.push("La tracción total le da mucho agarre al salir de las curvas y en mojado o nieve.");
  } else {
    out.push(k<1.3?"Potencia de superbike: exige mucha experiencia y es mejor disfrutarla en circuito.":k<2?"Muy rápida: aceleración brutal en cualquier marcha.":k<3?"Ágil y con empuje de sobra para la sierra.":k<4.5?"Ideal para aprender: suficiente para disfrutar sin sustos.":"Tranquila: perfecta para ciudad y para coger soltura.");
    const a=a2info(v,ver);out.push(a.txt);
  }
  const m=MOTORES[ver.motor];if(m&&m.fiab<=2)out.push(`Ojo: el motor ${m.nombre} tiene fallos conocidos. Revisa la pestaña “Antes de comprar”.`);
  return out;
}
function tabFicha(v,ver,el){
  const m=MOTORES[ver.motor]||{};const k=kgcv(ver);const isEV=m.comb==="e";
  const sp=(key,val,unit,expl,meter)=>`<div class="spec"><span class="k">${key}</span><span class="v mono">${val}<small>${unit||""}</small></span>${meter!=null?`<div class="meter"><i style="width:${clamp(meter)*100}%"></i></div>`:""}<span class="x">${expl}</span></div>`;
  const kw=ver.cv/1.36;
  el.innerHTML=`
  <div class="grid g2">
   <div class="callout red"><h4>Qué significa en la práctica</h4><ul style="margin:8px 0 0;padding-left:20px">${interpretar(v,ver).map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
   <div class="callout"><h4>${esc(ver.n)} en una frase</h4><p style="margin-top:6px">Motor ${esc(m.nombre||ver.motor)} (${ASP[m.asp]||""} ${COMB[m.comb]?.toLowerCase()||""}), ${fmt(ver.cv,ver.cv%1?1:0)} cv, tracción ${TRAC[ver.trac]?.toLowerCase()}, cambio ${(CAJA[ver.caja]||ver.caja).toLowerCase().replace(/\.$/,"")}. Cada caballo mueve ${fmt(k,1)} kg.</p></div>
  </div>
  <div class="specs" style="margin-top:16px">
   ${sp(gl("cv","Potencia"),fmt(ver.cv,ver.cv%1?1:0),"cv",`${fmt(kw,1)} ${gl("kW","kW")}. Marca la velocidad punta y el empuje arriba.`,Math.log(ver.cv/10)/Math.log(80))}
   ${sp(gl("par","Par"),fmt(ver.nm,ver.nm%1?1:0),"Nm",ver.nm/(m.cc||1000)*1000>(v.tipo==="moto"?110:150)?"Mucho par para su tamaño: empuja con fuerza desde abajo, sin tener que estirar marchas.":"Par normal: le gusta subir de vueltas para dar lo mejor.",clamp(ver.nm/(v.tipo==="moto"?150:700)))}
   ${sp("Peso",fmt(ver.peso),"kg",v.tipo==="moto"?(ver.peso<180?"Ligera: fácil de mover parado y de tumbar.":ver.peso<215?"Peso medio: maniobrable.":"Pesada: cuesta en maniobras lentas."):(ver.peso<1150?"Muy ligero: ágil y frena en poco espacio.":ver.peso<1450?"Peso contenido.":ver.peso<1750?"Peso medio-alto: se nota en curvas lentas.":"Pesado: más inercia en curvas y frenadas."),clamp(ver.peso/(v.tipo==="moto"?300:2400)))}
   ${sp(gl("peso/potencia","Peso / potencia"),fmt(k,1),"kg/cv","Cuanto más bajo, más rápido acelera. Es el dato más importante para saber si un vehículo “corre”.",clamp(1-(k-(v.tipo==="moto"?1:3))/(v.tipo==="moto"?6:14)))}
   ${sp("0 a 100 km/h",fmt(ver.acc,1),"s",ver.acc<4?"Aceleración de superdeportivo.":ver.acc<6?"Muy rápida.":ver.acc<8?"Rápida.":ver.acc<11?"Normal.":"Tranquila.",clamp(1-(ver.acc-2.5)/13))}
   ${sp("Velocidad máxima",fmt(ver.vmax),"km/h","Dato de homologación. En carretera el límite es 90-120 km/h.",clamp(ver.vmax/320))}
   ${sp("Consumo medio",fmt(ver.cons,1),isEV?"kWh/100":"l/100",isEV?`Unos ${eur(ver.cons*0.2)} cada 100 km cargando en casa.`:`Aprox. ${eur(ver.cons*(m.comb==="d"?1.52:1.6))} cada 100 km. En conducción alegre por puertos súmale un 20-30 %.`,clamp(1-ver.cons/16))}
   ${sp(v.tipo==="moto"?gl("cardán","Transmisión final"):"Tracción",TRAC[ver.trac]||ver.trac,"",v.tipo==="moto"?(ver.trac==="C"?"Cadena: ligera y eficiente; hay que engrasarla.":ver.trac==="K"?"Cardán: casi sin mantenimiento.":"Correa: limpia y silenciosa."):(ver.trac==="T"?`${gl("propulsión","Propulsión")}: tacto puro, equilibrio y posibilidad de derrapar.`:ver.trac==="D"?`${gl("tracción delantera","Delantera")}: segura y estable.`:`${gl("tracción total","Total")}: máximo agarre.`))}
   ${sp("Cambio",CAJA[ver.caja]||ver.caja,"",ver.caja==="DCT"?`${gl("DSG","Doble embrague")}: cambios ultrarrápidos.`:ver.caja==="CVT"?gl("CVT","Variador continuo")+": suave y eficiente.":ver.caja==="A"?"Automática de convertidor: cómoda y robusta.":ver.caja==="SMG"?"Robotizada: brusca en ciudad, rápida en circuito.":"Manual: más control e implicación.")}
   ${sp(gl("cilindrada","Motor"),m.cc?fmt(m.cc):"—",m.cc?"cc":"",`${esc(m.nombre||ver.motor)}. ${ASP[m.asp]?gl(m.asp==="atmo"?"atmosférico":"turbo",ASP[m.asp]):""} · ${gl("distribución","Distribución")}: ${DIST[m.dist]||m.dist}`)}
   ${v.tipo==="coche"&&m.cc?sp(gl("cv fiscales","CV fiscales"),fmt(cvf(m),1),"CVF","Se usan para calcular el impuesto municipal de circulación."):""}
   ${sp("Fiabilidad del motor",["","Muy delicado","Delicado","Normal","Buena","Excelente"][m.fiab]||"—","",`Valoración orientativa según fallos conocidos (${m.fiab||"?"}/5).`,(m.fiab||0)/5)}
  </div>
  <h3 style="margin-top:28px">Todas las versiones</h3>
  <div class="tbl" style="margin-top:10px"><table class="t mono"><thead><tr><th>Versión</th><th>cv</th><th>Nm</th><th>kg</th><th>kg/cv</th><th>0-100</th><th>Vmáx</th><th>Consumo</th><th>Motor</th></tr></thead><tbody>
  ${v.vers.map((x,i)=>`<tr ${i===FT.vi?'style="background:var(--chip)"':""}><td>${esc(x.n)}</td><td>${fmt(x.cv,x.cv%1?1:0)}</td><td>${fmt(x.nm,x.nm%1?1:0)}</td><td>${fmt(x.peso)}</td><td>${fmt(kgcv(x),1)}</td><td>${fmt(x.acc,1)} s</td><td>${x.vmax}</td><td>${fmt(x.cons,1)}</td><td>${esc(MOTORES[x.motor]?.nombre||x.motor)}</td></tr>`).join("")}
  </tbody></table></div>
  <p class="muted" style="margin-top:10px;font-size:.85rem">Cifras orientativas de fábrica. Pueden variar según año, mercado y equipamiento.</p>`;
}
function cvf(m){const n=parseInt((m.arq.match(/\d+/)||[4])[0])||4;if(m.arq==="R2")return 0.08*2*Math.pow(654,0.6);return 0.08*n*Math.pow(m.cc/n,0.6);}

/* ---- Antes de comprar ---- */
function checklist(v,ver){
  const m=MOTORES[ver.motor]||{};const edad=AHORA-anioRef(v);const isEV=m.comb==="e";
  const g=[];
  g.push({t:`Fallos conocidos del ${v.modelo} ${v.gen}`,c:"red",it:v.fallos});
  if(m.fallos)g.push({t:`Del motor ${m.nombre}`,c:"red",it:m.fallos});
  g.push({t:"Documentación",c:"sign",it:["Pide el informe de la DGT (cargas, embargos, ITV y kilómetros registrados en cada inspección)","Los kilómetros del cuadro deben cuadrar con las ITV y las facturas","Libro de mantenimiento y facturas (aceite, distribución, embrague)","Número de bastidor igual en la ficha técnica y en el vehículo","Si tiene modificaciones (escape, llantas, suspensión): que estén homologadas en la ficha",...(v.tipo==="moto"?["Si viene limitada para A2: certificado y anotación en la ficha técnica"]:[])]});
  if(v.tipo==="coche"){
    g.push({t:"Carrocería",c:"sign",it:["Huecos entre paneles iguales a ambos lados (si no, ha tenido golpes)","Tonos de pintura iguales entre piezas, míralo con luz lateral","Tornillos de aletas y capó sin marcas de llave (piezas desmontadas)",edad>12?"Óxido en pasos de rueda, umbrales, bajos y suelo del maletero (levanta la moqueta)":"Óxido en bajos y anclajes de suspensión","Cristales con la misma marca y año (un cristal distinto puede indicar golpe o robo)"]});
    if(!isEV)g.push({t:"Motor (pide verlo en frío)",c:"sign",it:["Arranque en frío: sin ruidos metálicos ni traqueteos los primeros segundos","Humo del escape: azul = quema aceite; blanco espeso = refrigerante; negro = inyección o turbo","Tapón de aceite sin “mayonesa” blanca (posible junta de culata)","Sin fugas de aceite o refrigerante debajo del motor","Ralentí estable y todos los testigos se apagan tras arrancar",m.asp!=="atmo"?"Turbo: sin silbidos de sirena ni humo al acelerar fuerte":"Que suba de vueltas limpio hasta cerca del corte"]});
    else g.push({t:"Batería y carga",c:"sign",it:["Informe de salud de la batería (SOH) del concesionario","Prueba la carga rápida y lenta","Autonomía real frente a la homologada","Garantía de batería restante (suelen ser 8 años)"]});
    g.push({t:"Prueba dinámica",c:"sign",it:["Embrague: si muerde muy arriba o patina en 4ª al acelerar, está gastado","Las marchas entran sin rascar, también reduciendo","En recta y frenando, el volante no tira hacia un lado","Frenos sin vibraciones en el pedal","Sin golpes de suspensión en baches ni ruidos al girar a tope","Aire acondicionado enfría en menos de un minuto"]});
    g.push({t:"Neumáticos",c:"sign",it:["Desgaste uniforme (si gasta por dentro: alineación o suspensión)","Fecha DOT: más de 6 años = cambiar aunque tengan dibujo","Misma marca y modelo en cada eje"]});
  } else {
    g.push({t:"Revisión de la moto",c:"sign",it:["Arañazos en extremos (manetas, estriberas, puños, escape, intermitentes) = caídas","Pipa de dirección: con la rueda delantera en el aire, el manillar gira suave sin puntos duros","Barras de horquilla sin aceite ni picaduras (retenes)","Kit de arrastre: si al tirar de la cadena en la parte trasera de la corona se separa mucho, está gastado","Discos de freno sin escalón marcado en el borde","Ruedas alineadas: mira desde atrás que ambas ruedas estén en línea (chasis torcido)","Rodamientos de rueda y de basculante sin holgura","Embrague: en marcha larga y a medio gas, si suben las vueltas sin acelerar, patina","Sin fugas en motor ni radiador","Llaves originales; inmovilizador y alarma funcionan"]});
  }
  if(edad>15)g.push({t:"Por edad (más de 15 años)",c:"sign",it:["Gomas, manguitos y juntas resecos o agrietados","Líquido de frenos y refrigerante cambiados recientemente","Instalación eléctrica sin empalmes caseros"]});
  return g;
}
function tabCompra(v,ver,el){
  const groups=checklist(v,ver);const key="chk_"+v.id;let st=store.get(key,{});
  const total=groups.reduce((a,g)=>a+g.it.length,0);
  const prog=()=>{const n=Object.values(st).filter(Boolean).length;$("#cprog").style.width=(n/total*100)+"%";$("#ccount").textContent=`${n} de ${total} revisados`;};
  el.innerHTML=`
  <div class="grid g2">
   <div class="callout ok"><h4>Precio razonable</h4><p style="margin-top:6px">En España suele venderse entre <b>${eur(v.pmin)}</b> y <b>${eur(v.pmax)}</b> según año, kilómetros y estado. Si lo ves mucho más barato, busca el motivo antes de ilusionarte.</p></div>
   <div class="callout"><h4>Preguntas al vendedor</h4><ul style="margin:6px 0 0;padding-left:20px"><li>¿Por qué lo vende y cuánto tiempo lo ha tenido?</li><li>¿Cuándo se cambió ${MOTORES[ver.motor]?.dist?.startsWith("correa")?"la correa de distribución":"el aceite por última vez"}?</li><li>¿Ha tenido golpes${v.tipo==="moto"?" o caídas":""}? ¿Ha ido a circuito?</li><li>¿Tiene facturas? ¿Puedo llevarlo a un taller a revisarlo?</li></ul></div>
  </div>
  <div class="panel" style="margin-top:16px">
   <div class="row" style="justify-content:space-between"><h3>Checklist de revisión</h3><span class="count" id="ccount"></span></div>
   <div class="prog" style="margin:10px 0 6px"><i id="cprog" style="width:0"></i></div>
   <p class="muted" style="font-size:.9rem">Márcalo mientras revisas el vehículo. Se guarda en este navegador.</p>
   ${groups.map((g,gi)=>`<h4 style="margin-top:20px;display:flex;align-items:center;gap:6px"><span class="sev" style="background:var(--${g.c==="red"?"accent":"sign"})"></span>${esc(g.t)}</h4>
     ${g.it.map((it,ii)=>{const k=gi+"-"+ii;return `<label class="check ${st[k]?"done":""}"><input type="checkbox" data-k="${k}" ${st[k]?"checked":""}><span>${esc(it)}</span></label>`;}).join("")}`).join("")}
   <div class="row" style="margin-top:14px"><button class="btn sm" id="creset" type="button">Desmarcar todo</button></div>
  </div>`;
  el.addEventListener("change",e=>{const c=e.target.closest("input[data-k]");if(!c)return;st[c.dataset.k]=c.checked;store.set(key,st);c.parentElement.classList.toggle("done",c.checked);prog();});
  $("#creset").addEventListener("click",()=>{st={};store.set(key,st);tabCompra(v,ver,el);});
  prog();
}

/* ---- Simulador de costes ---- */
function costeModelo(v,ver,inp){
  const m=MOTORES[ver.motor]||{};const isEV=m.comb==="e";const moto=v.tipo==="moto";
  const km=inp.km, edad=Math.max(0,AHORA-inp.anio), bf=brandF(v);
  const comb=km*ver.cons/100*inp.precioComb;
  const ageF=inp.edad<21?1.25:inp.edad<25?1:inp.edad<30?0.72:0.55;
  const segBase=moto?{terceros:220,ampliado:330,todo:900}:{terceros:550,ampliado:760,todo:1400};
  let seg=segBase[inp.cob]*ageF*(moto?1+Math.max(0,ver.cv-35)/80:1+Math.max(0,ver.cv-100)/250)*(v.tags.includes("lujo")||EXOTIC.includes(v.marca)?1.5:1);
  if(inp.cob==="todo"&&edad>8)seg*=0.75;
  let ivtm;
  if(moto){const cc=m.cc||125;ivtm=cc<=125?7:cc<=250?12:cc<=500?24:cc<=1000?48:96;}
  else{const c=cvf(m);ivtm=c<8?20:c<12?57:c<16?122:c<20?152:190;if(isEV)ivtm*=0.25;}
  const itv=moto?(edad>=4?16:0):(edad>=10?46:edad>=4?23:0);
  const mantBase=moto?(150+ver.cv*1.4)*(0.4+0.6*km/10000):(230+ver.cv*0.85)*(0.45+0.55*km/15000);
  const mant=mantBase*bf*(isEV?0.55:1);
  let distrib=0;if(m.dcost){const [ikm,iy,ic]=m.dcost;distrib=ic*bf/Math.min(ikm/Math.max(km,1),iy);}
  let neum;
  if(moto){const p=ver.cv<50?220:ver.cv<100?300:380;const life=v.body==="sport"?8000:v.body==="trail"?15000:11000;neum=p*km/life;}
  else{const p=ver.cv<120?260:ver.cv<200?400:ver.cv<300?600:ver.cv<450?850:1300;const life=(v.tags.includes("circ")||ver.cv>300)?25000:40000;neum=p*km/life*(isEV?1.2:1);}
  const fiab=m.fiab||3;const imp=(6-fiab)*(moto?70:140)*(edad>15?1.4:edad>8?1.2:0.8)*bf;
  // depreciación media anual sobre los años de tenencia
  let val=inp.precio,depTot=0;for(let y=0;y<inp.anos;y++){const a=edad+y;let pct=a<3?0.15:a<6?0.10:a<10?0.07:a<15?0.04:0.01;if(v.tags.includes("clas")&&a>=15)pct=-0.02;const d=val*pct;depTot+=d;val-=d;}
  const dep=depTot/inp.anos;
  const garaje=inp.garaje*12;
  const items=[
   ["Combustible",comb,isEV?`${fmt(ver.cons,1)} kWh/100 km × ${fmt(km)} km a ${fmt(inp.precioComb,2)} €/kWh`:`${fmt(ver.cons,1)} l/100 km × ${fmt(km)} km a ${fmt(inp.precioComb,2)} €/l`],
   ["Seguro",seg,`Estimación para ${inp.edad} años, cobertura ${inp.cob==="todo"?"todo riesgo":inp.cob==="ampliado"?"terceros ampliado":"terceros"}. Pide precio real con tu código postal.`],
   ["Impuesto (IVTM)",ivtm,moto?"Según cilindrada, tarifas de Madrid capital. Cambia según tu municipio.":`${fmt(cvf(m),1)} CV fiscales, tarifas de Madrid capital${isEV?" con bonificación del 75 %":""}.`],
   ["ITV",itv,moto?"Desde los 4 años, cada 2 años.":"De 4 a 10 años cada 2 años; desde los 10, anual."],
   ["Mantenimiento",mant,"Aceite, filtros, pastillas, líquidos y revisión anual en taller independiente."],
   ["Distribución",distrib,m.dcost?`Correa cada ${fmt(m.dcost[0])} km o ${m.dcost[1]} años (~${eur(m.dcost[2]*bf)}), repartida por año.`:"Cadena o sin distribución: sin cambio periódico."],
   ["Neumáticos",neum,"Desgaste proporcional a los km del año."],
   ["Imprevistos",imp,"Hucha para averías según la fiabilidad del motor, la edad y la marca."],
   ["Pérdida de valor",dep,dep<0?"Clásico en revalorización: puede ganar valor si se cuida.":"Lo que pierde de valor de media cada año."],
   ["Garaje / parking",garaje,"Lo que pagas al mes por aparcar."]
  ];
  const anual=items.reduce((a,x)=>a+x[1],0);
  return {items,anual,mes:anual/12,porKm:anual/Math.max(km,1),total:anual*inp.anos,valorFinal:val};
}
function defInputs(v,ver){const m=MOTORES[ver.motor]||{};return{precio:Math.round((v.pmin+v.pmax)/2/100)*100,km:v.tipo==="moto"?6000:12000,anos:3,anio:anioRef(v),edad:20,cob:"terceros",precioComb:m.comb==="e"?0.2:m.comb==="d"?1.52:1.6,garaje:0};}
function tabCostes(v,ver,el){
  const inp=Object.assign(defInputs(v,ver),store.get("cost_"+v.id,{}));
  const isEV=MOTORES[ver.motor]?.comb==="e";
  el.innerHTML=`
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));align-items:start">
   <div class="panel stack">
    <h3>Tus datos</h3>
    <label class="f">Precio de compra (€)<input type="number" id="c_precio" min="0" step="100" value="${inp.precio}"></label>
    <label class="f">Kilómetros al año: <b style="color:var(--ink)" id="c_kmv">${fmt(inp.km)} km</b><input type="range" id="c_km" min="1000" max="40000" step="500" value="${inp.km}"></label>
    <label class="f">Años que lo vas a tener: <b style="color:var(--ink)" id="c_anosv">${inp.anos}</b><input type="range" id="c_anos" min="1" max="10" value="${inp.anos}"></label>
    <div class="row"><label class="f" style="flex:1">Año del vehículo<input type="number" id="c_anio" min="${v.desde}" max="${v.hasta}" value="${inp.anio}"></label><label class="f" style="flex:1">Tu edad<input type="number" id="c_edad" min="18" max="90" value="${inp.edad}"></label></div>
    <label class="f">Seguro<select id="c_cob"><option value="terceros">Terceros</option><option value="ampliado">Terceros ampliado</option><option value="todo">Todo riesgo</option></select></label>
    <div class="row"><label class="f" style="flex:1">${isEV?"€/kWh":"€/litro"}<input type="number" id="c_pc" step="0.01" value="${inp.precioComb}"></label><label class="f" style="flex:1">Garaje €/mes<input type="number" id="c_gar" min="0" step="5" value="${inp.garaje}"></label></div>
    <button class="btn sm" id="c_reset" type="button">Volver a los valores por defecto</button>
   </div>
   <div class="stack" style="min-width:0">
    <div class="cost-out" id="c_out"></div>
    <div class="panel bars" id="c_bars"></div>
   </div>
  </div>
  <p class="muted" style="margin-top:12px;font-size:.85rem">Estimación orientativa para ${esc(ver.n)}. Los seguros para conductores jóvenes varían muchísimo: pide al menos 3 presupuestos.</p>`;
  $("#c_cob").value=inp.cob;
  const read=()=>{inp.precio=+$("#c_precio").value||0;inp.km=+$("#c_km").value;inp.anos=+$("#c_anos").value;inp.anio=+$("#c_anio").value||anioRef(v);inp.edad=+$("#c_edad").value||20;inp.cob=$("#c_cob").value;inp.precioComb=+$("#c_pc").value||0;inp.garaje=+$("#c_gar").value||0;
    $("#c_kmv").textContent=fmt(inp.km)+" km";$("#c_anosv").textContent=inp.anos;store.set("cost_"+v.id,inp);draw();};
  const draw=()=>{const r=costeModelo(v,ver,inp);const mx=Math.max(...r.items.map(x=>x[1]));
    $("#c_out").innerHTML=`<div><span>Al año</span><b class="mono">${eur(r.anual)}</b></div><div><span>Al mes</span><b class="mono">${eur(r.mes)}</b></div><div><span>Por km</span><b class="mono">${fmt(r.porKm,2)} €</b></div>`;
    $("#c_bars").innerHTML=`<h3 style="margin-bottom:8px">En qué se va el dinero cada año</h3>`+r.items.filter(x=>Math.abs(x[1])>0.5).sort((a,b)=>b[1]-a[1]).map(x=>`<div class="b"><span>${x[0]}</span><div class="t"><i style="width:${Math.max(0,x[1])/mx*100}%"></i></div><em>${eur(x[1])}</em><small>${esc(x[2])}</small></div>`).join("")+
      `<p style="margin-top:12px">En ${inp.anos} año${inp.anos>1?"s":""} te costará unos <b>${eur(r.total)}</b> (sin contar la compra) y valdrá aproximadamente <b>${eur(r.valorFinal)}</b> al venderlo.</p>`;};
  $$("input,select",el).forEach(i=>i.addEventListener("input",read));
  $("#c_reset").addEventListener("click",()=>{store.set("cost_"+v.id,{});tabCostes(v,ver,el);});
  draw();
}

/* ---- Mecánica ---- */
function tabMecanica(v,ver,el){
  const m=MOTORES[ver.motor];if(!m){el.innerHTML="<p>Sin datos del motor.</p>";return;}
  const moto=v.tipo==="moto";const isEV=m.comb==="e";
  const como=[];
  if(isEV)como.push(["Motor eléctrico","Un motor eléctrico gira gracias a imanes y bobinas. No tiene pistones, aceite de motor ni embrague. Da toda su fuerza desde 0 rpm, por eso acelera tanto al salir. Al soltar el acelerador funciona como generador y recarga la batería (frenada regenerativa)."]);
  else{
    como.push(["Ciclo de cuatro tiempos",`Cada cilindro hace cuatro pasos: admisión (entra aire${m.comb==="g"?" y gasolina":""}), compresión, explosión (${m.comb==="d"?"el gasóleo se inflama solo por la presión":"la bujía hace saltar la chispa"}) y escape. Este motor tiene ${m.arq==="R2"?"dos rotores en vez de cilindros":m.arq.replace(/\D/g,"")+" cilindros"} y ${fmt(m.cc)} cc.`]);
    if(m.asp==="turbo"||m.asp==="biturbo")como.push(["Turbo",`Los gases de escape mueven una turbina que comprime el aire de admisión. Más aire = más combustible = más potencia con menos cilindrada.${m.asp==="biturbo"?" Al tener dos turbos, uno suele trabajar a bajas vueltas y otro arriba, o uno por cada bancada.":""} Consejo: tras ir rápido, rueda suave un minuto antes de apagar para que el turbo se enfríe con aceite circulando.`]);
    else if(m.asp==="atmo")como.push(["Atmosférico","Respira aire a presión normal. La respuesta al acelerador es inmediata y la potencia aparece de forma lineal según suben las vueltas."]);
    if(m.dist==="correa")como.push(["Distribución por correa","Una correa dentada de goma sincroniza el cigüeñal con los árboles de levas. Es silenciosa y barata, pero hay que cambiarla según el libro: si se rompe, el motor suele romperse."]);
    else if(m.dist==="correa-aceite")como.push(["Correa bañada en aceite","La correa trabaja dentro del motor, mojada en aceite, para ser más silenciosa. Si se usa un aceite no homologado, se degrada y suelta trozos que pueden obstruir el circuito de engrase."]);
    else if(m.dist==="cadena")como.push(["Distribución por cadena","Una cadena metálica (como la de una bici) mueve las levas. En teoría dura toda la vida, pero si se alargan los cambios de aceite se estira y se oye un traqueteo al arrancar en frío."]);
    if(m.arq.startsWith("B"))como.push(["Motor bóxer","Los cilindros están tumbados y enfrentados. El motor es más bajo y plano, lo que baja el centro de gravedad y mejora el paso por curva."]);
    if(m.arq==="R2")como.push(["Motor rotativo Wankel","En lugar de pistones que suben y bajan, dos rotores triangulares giran dentro de una carcasa ovalada. Muy suave y compacto, pero los sellos de los vértices se desgastan y quema aceite por diseño."]);
    if(m.comb==="d")como.push(["Diésel moderno","Inyección directa a muy alta presión (common rail o inyector-bomba), turbo, "+gl("EGR")+" y "+gl("FAP")+". Mucho par y poco consumo; prefieren trayectos largos."]);
    if(m.comb==="h")como.push(["Híbrido","Un motor de gasolina y uno eléctrico trabajan juntos. En ciudad mueve mucho en eléctrico y la batería se recarga sola al frenar. No hay que enchufarlo."]);
  }
  if(moto)como.push(["Transmisión de la moto",ver.trac==="C"?"El motor mueve un piñón que, mediante la cadena, hace girar la corona de la rueda trasera. Cambiar el tamaño de piñón o corona cambia la aceleración y la velocidad punta.":ver.trac==="K"?"Un eje con engranajes en ángulo lleva el giro a la rueda trasera. No necesita engrase periódico, solo cambio de aceite del grupo final.":"Una correa dentada lleva la fuerza a la rueda trasera: limpia y silenciosa."]);
  else como.push(["Transmisión",`${ver.trac==="T"?"Propulsión: el motor delantero envía la fuerza por un eje (cardán) al diferencial trasero.":ver.trac==="D"?"Tracción delantera: motor, caja y diferencial van juntos delante.":"Tracción total: un diferencial central o embrague reparte la fuerza entre los dos ejes."} Cambio ${CAJA[ver.caja]?.toLowerCase()||ver.caja}.`]);
  const plan=moto?[["Aceite y filtro",m.mant[0]||"Cada 6.000-10.000 km o anual"],["Engrase de cadena","Cada 500-800 km y tras lluvia"],["Kit de arrastre","Cada 20.000-30.000 km"],["Líquido de frenos","Cada 2 años"],["Refrigerante","Cada 2-3 años"],["Bujías","Cada 12.000-24.000 km"],["Holgura de válvulas","Según manual (24.000-40.000 km)"],["Neumáticos","8.000-15.000 km según tipo"]]
    :[["Aceite y filtro",m.mant[0]||"Cada 10.000-15.000 km o anual"],["Filtro de aire","Cada 30.000 km"],["Filtro de habitáculo","Cada año"],["Líquido de frenos","Cada 2 años"],["Refrigerante","Cada 5 años"],...(m.comb==="g"||m.comb==="h"?[["Bujías","Cada 40.000-60.000 km"]]:[]),...(m.dcost?[["Kit de distribución",`Cada ${fmt(m.dcost[0])} km o ${m.dcost[1]} años (aprox. ${eur(m.dcost[2])})`]]:[]),["Pastillas de freno","Cada 30.000-50.000 km"],["Embrague","Suele durar 120.000-200.000 km"]];
  const extra=m.mant.slice(1);
  const mismos=VEH.filter(x=>x.id!==v.id&&x.vers.some(y=>y.motor===m.code)).slice(0,10);
  el.innerHTML=`
  <div class="grid g2" style="align-items:start">
   <div class="panel stack"><div class="eyebrow">Motor ${esc(m.code)}</div><h3>${esc(m.nombre)}</h3>${ILU.motor(m.arq)}
    <p>${esc(m.desc)}</p>
    <div class="tbl"><table class="t"><tbody>
     <tr><th>Combustible</th><td>${COMB[m.comb]}</td></tr>
     <tr><th>Arquitectura</th><td>${esc(m.arq)}</td></tr>
     <tr><th>${gl("cilindrada","Cilindrada")}</th><td class="mono">${m.cc?fmt(m.cc)+" cc":"—"}</td></tr>
     <tr><th>Alimentación</th><td>${ASP[m.asp]||"—"}</td></tr>
     <tr><th>${gl("distribución","Distribución")}</th><td>${DIST[m.dist]||m.dist}</td></tr>
     <tr><th>Fiabilidad</th><td><span class="dots">${[1,2,3,4,5].map(i=>`<i class="${i<=m.fiab?"on":""}"></i>`).join("")}</span> ${m.fiab}/5</td></tr>
    </tbody></table></div>
   </div>
   <div class="stack">${como.map(c=>`<div class="callout"><h4>${c[0]}</h4><p style="margin-top:4px">${c[1]}</p></div>`).join("")}</div>
  </div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
   <div class="panel"><h3>Plan de mantenimiento</h3><div class="tbl" style="margin-top:8px"><table class="t"><tbody>${plan.map(p=>`<tr><th>${p[0]}</th><td>${esc(p[1])}</td></tr>`).join("")}${extra.map(e=>`<tr><th>Específico</th><td>${esc(e)}</td></tr>`).join("")}</tbody></table></div></div>
   <div class="panel"><h3>Puntos débiles del motor</h3><ul style="margin:10px 0 0;padding-left:20px">${m.fallos.map(f=>`<li style="margin:6px 0">${esc(f)}</li>`).join("")}</ul>
   ${mismos.length?`<h4 style="margin-top:18px">También montan este motor</h4><p style="margin-top:6px">${mismos.map(x=>`<a href="#v-${x.id}">${esc(vname(x))} ${esc(x.gen)}</a>`).join(" · ")}</p>`:""}</div>
  </div>`;
}

/* =====================================================================
   COMPARADOR
   ===================================================================== */
const CCOL=["var(--c1)","var(--c2)","var(--c3)","var(--c4)","var(--c5)"];
function vComparar(){
  const items=cmp.map(c=>({v:BYID[c.id],ver:BYID[c.id].vers[c.vi]||BYID[c.id].vers[0],vi:c.vi})).filter(x=>x.v);
  app.innerHTML=`
  <div class="eyebrow">Comparador</div><h1 style="font-size:clamp(2rem,5vw,3rem)">Cara a cara, hasta 5</h1>
  <p class="muted" style="margin-top:8px;max-width:70ch">Busca un modelo y elige la versión. Puedes mezclar coches y motos. Las estrellas marcan el mejor de cada fila y abajo te explicamos qué significa cada diferencia.</p>
  <div class="panel" style="margin-top:16px"><div class="ac"><label class="f">Añadir vehículo<input type="search" id="cq" placeholder="Escribe marca, modelo o generación…" autocomplete="off" ${items.length>=5?"disabled":""}></label><div class="ac-list" id="cql" hidden></div></div></div>
  <div class="cmp-slots" style="margin-top:14px">${[0,1,2,3,4].map(i=>{const it=items[i];if(!it)return `<div class="slot empty">Hueco libre<br>${i===0?"Empieza buscando arriba":""}</div>`;
    return `<div class="slot"><button class="x" type="button" data-rm="${i}" aria-label="Quitar">×</button><div class="row" style="gap:6px"><span class="dot" style="background:${CCOL[i]}"></span><b style="font-size:.95rem">${esc(it.v.marca)}</b></div>
     <a href="#v-${it.v.id}">${pic(it.v)}</a><b style="font-family:var(--f-display);font-size:1.15rem;line-height:1.1">${esc(it.v.modelo)} ${esc(it.v.gen)}</b>
     <select data-ver="${i}" aria-label="Versión">${it.v.vers.map((x,j)=>`<option value="${j}" ${j===it.vi?"selected":""}>${esc(x.n)} · ${fmt(x.cv,x.cv%1?1:0)} cv</option>`).join("")}</select></div>`;}).join("")}</div>
  <div id="cres"></div>`;
  // autocompletar
  const q=$("#cq"),l=$("#cql");
  q.addEventListener("input",()=>{const s=q.value.trim().toLowerCase();if(s.length<2){l.hidden=true;return;}
    const r=VEH.filter(v=>(v.marca+" "+v.modelo+" "+v.gen).toLowerCase().includes(s)||v.vers.some(x=>x.n.toLowerCase().includes(s))).slice(0,12);
    l.innerHTML=r.map(v=>`<button type="button" data-id="${v.id}"><b>${esc(vname(v))}</b> ${esc(v.gen)} <span class="muted mono" style="font-size:.85rem">${v.anos}</span></button>`).join("")||`<p style="padding:10px" class="muted">Sin resultados</p>`;l.hidden=false;});
  l.addEventListener("click",e=>{const b=e.target.closest("button[data-id]");if(!b)return;addCmp(b.dataset.id,0);vComparar();});
  $$("[data-rm]").forEach(b=>b.addEventListener("click",()=>{cmp.splice(+b.dataset.rm,1);saveCmp();vComparar();}));
  $$("select[data-ver]").forEach(s=>s.addEventListener("change",()=>{cmp[+s.dataset.ver].vi=+s.value;saveCmp();vComparar();}));
  if(items.length<2){$("#cres").innerHTML=`<div class="callout" style="margin-top:18px"><h4>Añade al menos dos vehículos</h4><p style="margin-top:4px">Prueba por ejemplo: ${["bmw-serie-3-e46","honda-civic-ep3","mazda-mx-5-nb"].map(id=>`<button class="chip" type="button" data-q="${id}">${esc(vname(BYID[id]))} ${esc(BYID[id].gen)}</button>`).join(" ")}</p></div>`;
    $$("[data-q]").forEach(b=>b.addEventListener("click",()=>{addCmp(b.dataset.q,0);vComparar();}));return;}
  renderCmp(items);
}
function renderCmp(items){
  const cost=items.map(it=>costeModelo(it.v,it.ver,defInputs(it.v,it.ver)));
  const rows=[
   ["Potencia","cv",it=>it.ver.cv,"max",x=>fmt(x,x%1?1:0)],
   ["Par","Nm",it=>it.ver.nm,"max",x=>fmt(x,x%1?1:0)],
   ["Peso","kg",it=>it.ver.peso,"min",x=>fmt(x)],
   ["Peso / potencia","kg/cv",it=>kgcv(it.ver),"min",x=>fmt(x,2)],
   ["0-100 km/h","s",it=>it.ver.acc,"min",x=>fmt(x,1)],
   ["Velocidad máxima","km/h",it=>it.ver.vmax,"max",x=>fmt(x)],
   ["Coste de energía","€/100 km",it=>it.ver.cons*(MOTORES[it.ver.motor]?.comb==="e"?0.2:MOTORES[it.ver.motor]?.comb==="d"?1.52:1.6),"min",x=>fmt(x,2)],
   ["Precio usado medio","€",it=>(it.v.pmin+it.v.pmax)/2,"min",x=>fmt(Math.round(x))],
   ["Coste anual estimado","€/año",(it,i)=>cost[i].anual,"min",x=>fmt(Math.round(x))],
   ["Fiabilidad del motor","/5",it=>MOTORES[it.ver.motor]?.fiab||3,"max",x=>fmt(x)],
  ];
  const tbl=rows.map(r=>{const vals=items.map((it,i)=>r[2](it,i));const best=r[3]==="max"?Math.max(...vals):Math.min(...vals);const mx=Math.max(...vals.map(Math.abs));
    return `<tr><th>${r[0]} <span class="muted" style="font-weight:500;font-size:.85rem">${r[1]}</span></th>${vals.map((x,i)=>`<td class="mono ${x===best?"best":""}">${r[4](x)}<div class="bar"><i style="width:${mx?Math.abs(x)/mx*100:0}%;background:${CCOL[i]}"></i></div></td>`).join("")}</tr>`;}).join("");
  const txtRows=[["Tipo",it=>it.v.tipo==="moto"?"Moto":"Coche"],["Motor",it=>esc(MOTORES[it.ver.motor]?.nombre||it.ver.motor)],["Tracción / transmisión",it=>TRAC[it.ver.trac]],["Cambio",it=>CAJA[it.ver.caja]||it.ver.caja],["Años",it=>it.v.anos],["Carnet",it=>it.v.tipo==="moto"?({a2:"A2 directa",a2l:"Limitable A2",125:"B (125 cc)",A:"A"})[a2info(it.v,it.ver).t]:"B"]];
  // radar
  const axes=[["Aceleración",it=>clamp((14-it.ver.acc)/11.5)],["Potencia",it=>clamp(Math.log(it.ver.cv/10)/Math.log(70))],["Ligereza",it=>clamp(1-(kgcv(it.ver)-1)/14)],["Economía",(it,i)=>clamp(1-cost[i].anual/9000)],["Fiabilidad",it=>(MOTORES[it.ver.motor]?.fiab||3)/5],["Precio",it=>clamp(1-((it.v.pmin+it.v.pmax)/2)/80000)]];
  const R=110,cx=160,cy=140;const ang=i=>-Math.PI/2+i*2*Math.PI/axes.length;
  let radar=`<svg viewBox="0 0 320 290" class="diag" style="max-width:380px;margin:0 auto" role="img" aria-label="Gráfico de radar comparativo">`;
  [0.25,0.5,0.75,1].forEach(f=>{radar+=`<polygon points="${axes.map((_,i)=>`${cx+Math.cos(ang(i))*R*f},${cy+Math.sin(ang(i))*R*f}`).join(" ")}" fill="none" stroke="var(--line)"/>`;});
  axes.forEach((a,i)=>{const x=cx+Math.cos(ang(i))*(R+18),y=cy+Math.sin(ang(i))*(R+16);radar+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(ang(i))*R}" y2="${cy+Math.sin(ang(i))*R}" stroke="var(--line)"/><text x="${x}" y="${y+4}" text-anchor="middle" class="dt">${a[0]}</text>`;});
  items.forEach((it,k)=>{const pts=axes.map((a,i)=>{const s=Math.max(0.04,a[1](it,k));return `${cx+Math.cos(ang(i))*R*s},${cy+Math.sin(ang(i))*R*s}`;}).join(" ");radar+=`<polygon points="${pts}" fill="${CCOL[k]}" fill-opacity=".12" stroke="${CCOL[k]}" stroke-width="2.2"/>`;});
  radar+=`</svg>`;
  // veredicto explicado
  const nm=it=>it.ver.n.toLowerCase().includes(it.v.modelo.toLowerCase())?`${it.ver.n} (${it.v.gen})`:`${it.v.modelo} ${it.v.gen} ${it.ver.n}`;
  const by=(f,dir)=>{const s=[...items.map((it,i)=>({it,i,x:f(it,i)}))].sort((a,b)=>dir*(a.x-b.x));return s;};
  const acc=by(it=>it.ver.acc,1), kg=by(it=>kgcv(it.ver),1), co=by((it,i)=>cost[i].anual,1), fi=by(it=>MOTORES[it.ver.motor]?.fiab||3,-1), nmr=by(it=>it.ver.nm,-1);
  const diffAcc=acc[acc.length-1].x-acc[0].x;
  const ver=[
   ["Aceleración",`El <b>${esc(nm(acc[0].it))}</b> es el más rápido de 0 a 100 (${fmt(acc[0].x,1)} s)${diffAcc>0.2?`, ${fmt(diffAcc,1)} s menos que el más lento. Cada segundo de diferencia en un adelantamiento son decenas de metros de ventaja.`:". Las diferencias son mínimas: en carretera no las notarás."}`],
   ["Agilidad",`Con ${fmt(kg[0].x,1)} kg por caballo, el <b>${esc(nm(kg[0].it))}</b> tiene la mejor relación peso/potencia. Es el dato que mejor resume lo rápido que se siente: menos kilos que mover por cada caballo.`],
   ["Empuje desde abajo",`El <b>${esc(nm(nmr[0].it))}</b> tiene más par (${fmt(nmr[0].x)} Nm): saldrá con más fuerza de las curvas lentas sin necesidad de reducir.`],
   ["Bolsillo",`El más barato de mantener es el <b>${esc(nm(co[0].it))}</b>: unos ${eur(co[0].x)} al año frente a ${eur(co[co.length-1].x)} del más caro (con 20 años, seguro a terceros y kilometraje medio). Cambia los datos en la ficha de cada uno para tu caso.`],
   ["Tranquilidad",`El motor más fiable es el del <b>${esc(nm(fi[0].it))}</b> (${fi[0].x}/5).${fi[fi.length-1].x<=2?` Ojo con el ${esc(nm(fi[fi.length-1].it))}: su motor tiene fallos conocidos que debes revisar antes de comprar.`:""}`]
  ];
  const curvas=kg[0].it, diario=[...items.map((it,i)=>({it,s:(cost[i].anual/1000)*-1+(MOTORES[it.ver.motor]?.fiab||3)+(it.v.tags.includes("prac")?1.5:0)+(it.v.tags.includes("efic")?1:0)}))].sort((a,b)=>b.s-a.s)[0].it;
  $("#cres").innerHTML=`
  <section style="margin-top:22px"><div class="grid g2" style="align-items:start">
   <div class="panel"><h3>Perfil de cada uno</h3>${radar}<div class="row" style="justify-content:center;font-size:.85rem">${items.map((it,i)=>`<span><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${CCOL[i]}"></span> ${esc(it.v.modelo)}</span>`).join("")}</div><p class="muted" style="font-size:.85rem;margin-top:8px">Más área = mejor en ese aspecto. Economía y precio: más alto = más barato.</p></div>
   <div class="stack"><div class="callout red"><h4>Para curvas y diversión</h4><p style="margin-top:4px"><b>${esc(nm(curvas))}</b>: mejor relación peso/potencia del grupo.</p></div>
   <div class="callout ok"><h4>Para el día a día</h4><p style="margin-top:4px"><b>${esc(nm(diario))}</b>: el mejor equilibrio entre coste anual, fiabilidad y practicidad.</p></div>
   ${ver.map(x=>`<div class="callout"><h4>${x[0]}</h4><p style="margin-top:4px">${x[1]}</p></div>`).join("")}</div>
  </div></section>
  <section style="margin-top:24px"><h3>Datos cara a cara</h3><div class="tbl" style="margin-top:10px"><table class="t cmp-table"><thead><tr><th></th>${items.map((it,i)=>`<th style="color:${CCOL[i]}">${esc(it.v.modelo)} ${esc(it.v.gen)}<br><span class="muted" style="font-size:.85rem;font-family:var(--f-body)">${esc(it.ver.n)}</span></th>`).join("")}</tr></thead>
   <tbody>${tbl}${txtRows.map(r=>`<tr><th>${r[0]}</th>${items.map(it=>`<td>${r[1](it)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
}

/* =====================================================================
   MAPA (compartido por Rutas y Diseñador)
   ===================================================================== */
const LON0=-5.45,LON1=-1.75,LAT0=38.85,LAT1=41.5,MW=1000,MH=935;
const px=(lat,lon)=>[(lon-LON0)/(LON1-LON0)*MW,(LAT1-lat)/(LAT1-LAT0)*MH];
const MADRID_POLY=[[41.165,-3.54],[41.08,-3.40],[40.98,-3.38],[40.86,-3.40],[40.74,-3.30],[40.60,-3.22],[40.48,-3.18],[40.33,-3.06],[40.18,-3.05],[40.05,-3.15],[39.90,-3.38],[39.88,-3.60],[39.98,-3.80],[40.06,-4.08],[40.16,-4.30],[40.23,-4.50],[40.32,-4.57],[40.42,-4.45],[40.54,-4.32],[40.66,-4.25],[40.75,-4.17],[40.84,-4.02],[40.93,-3.94],[41.03,-3.83],[41.10,-3.70]];
const RIDGES=[[[40.58,-4.40],[40.72,-4.14],[40.78,-4.00],[40.84,-3.90],[40.92,-3.82],[41.00,-3.75],[41.12,-3.58],[41.20,-3.40],[41.18,-3.15]],[[40.25,-5.40],[40.28,-5.20],[40.32,-5.00],[40.33,-4.80],[40.36,-4.60]],[[40.25,-2.05],[40.40,-1.90],[40.60,-1.95]],[[39.62,-4.50],[39.60,-4.20],[39.58,-3.90]]];
const PROV=[["SEGOVIA",41.15,-4.15],["ÁVILA",40.55,-5.05],["GUADALAJARA",40.95,-2.55],["TOLEDO",39.75,-4.65],["CUENCA",40.0,-2.45],["MADRID",40.42,-3.95],["CIUDAD REAL",39.05,-3.6],["SORIA",41.42,-2.85]];
function dist(a,b){const R=6371,dLat=(b[1]-a[1])*Math.PI/180,dLon=(b[2]-a[2])*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a[1]*Math.PI/180)*Math.cos(b[1]*Math.PI/180)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
function statsRuta(ids,curv=4){
  const pts=ids.map(i=>P[i]).filter(Boolean);let km=0,up=0,maxA=0;
  for(let i=0;i<pts.length;i++){maxA=Math.max(maxA,pts[i][4]);if(i){const d=dist(pts[i-1],pts[i]);km+=d*(1.25+curv*0.05);const da=pts[i][4]-pts[i-1][4];if(da>0)up+=da;}}
  const vel=curv>=5?45:curv>=4?52:curv>=3?60:72;
  return{km,up,maxA,h:km/vel,puertos:pts.filter(p=>p[3]==="puerto").length,pts};
}
function gmaps(ids){const pts=ids.map(i=>P[i]).filter(Boolean);return "https://www.google.com/maps/dir/"+pts.map(p=>`${p[1]},${p[2]}`).join("/");}
function perfilAlt(ids){const st=statsRuta(ids);const pts=st.pts;if(pts.length<2)return "";
  let acc=[0];for(let i=1;i<pts.length;i++)acc.push(acc[i-1]+dist(pts[i-1],pts[i]));const tot=acc[acc.length-1]||1;
  const minA=Math.min(...pts.map(p=>p[4]))-100,maxA=Math.max(...pts.map(p=>p[4]))+100;const W=320,H=110,L=36,B=20;
  const xy=pts.map((p,i)=>[L+acc[i]/tot*(W-L-8),8+(1-(p[4]-minA)/(maxA-minA))*(H-B-8)]);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Perfil de altitud"><line x1="${L}" y1="${H-B}" x2="${W-8}" y2="${H-B}" stroke="var(--line)"/>
   <text x="${L-4}" y="14" text-anchor="end" class="dt" style="font-size:9px;fill:var(--muted)">${fmt(maxA-100)} m</text><text x="${L-4}" y="${H-B}" text-anchor="end" class="dt" style="font-size:9px;fill:var(--muted)">${fmt(minA+100)} m</text>
   <path d="M${xy[0][0]},${H-B} ${xy.map(p=>`L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} L${xy[xy.length-1][0]},${H-B} Z" fill="var(--accent)" fill-opacity=".15"/>
   <path d="M${xy.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")}" fill="none" stroke="var(--accent)" stroke-width="2"/>
   ${xy.map((p,i)=>pts[i][3]==="puerto"?`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--ink)"/>`:"").join("")}
   <text x="${W-8}" y="${H-5}" text-anchor="end" class="dt" style="font-size:9px;fill:var(--muted)">${fmt(statsRuta(ids).km)} km aprox.</text></svg>`;}
function mapSVG(opt){
  // opt: {routes:[{ids,col,w,op}], clickable:bool, sel:[ids]}
  let s=`<svg viewBox="0 0 ${MW} ${MH}" id="mapsvg" role="img" aria-label="Mapa esquemático de Madrid y provincias vecinas"><rect x="-2000" y="-2000" width="5000" height="5000" fill="var(--map-land)"/>`;
  s+=`<polygon points="${MADRID_POLY.map(p=>px(p[0],p[1]).join(",")).join(" ")}" fill="var(--map-madrid)" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="6 4"/>`;
  RIDGES.forEach(r=>{s+=`<polyline points="${r.map(p=>px(p[0],p[1]).join(",")).join(" ")}" fill="none" stroke="var(--map-ridge)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`;});
  PROV.forEach(p=>{const [x,y]=px(p[1],p[2]);s+=`<text x="${x}" y="${y}" text-anchor="middle" style="font-family:var(--f-display);font-size:22px;letter-spacing:.2em;fill:var(--muted);opacity:.7;font-weight:700">${p[0]}</text>`;});
  (opt.routes||[]).forEach(r=>{const pts=r.ids.map(i=>P[i]).filter(Boolean).map(p=>px(p[1],p[2]).map(n=>n.toFixed(1)).join(","));
    s+=`<polyline points="${pts.join(" ")}" fill="none" stroke="${r.col}" stroke-width="${r.w||4}" stroke-linecap="round" stroke-linejoin="round" opacity="${r.op||1}" ${r.id?`data-r="${r.id}" style="cursor:pointer"`:""}/>`;});
  Object.entries(P).forEach(([id,p])=>{const [x,y]=px(p[1],p[2]);const sel=(opt.sel||[]).includes(id);const big=p[3]==="ciudad";
    const shape=p[3]==="puerto"?`<path d="M${x},${y-8} l7,12 h-14 z" fill="${sel?"var(--accent)":"var(--ink)"}"/>`:`<circle cx="${x}" cy="${y}" r="${big?7:p[3]==="embalse"||p[3]==="mirador"?5:4.5}" fill="${sel?"var(--accent)":p[3]==="embalse"?"var(--sign)":"var(--paper)"}" stroke="var(--ink)" stroke-width="1.8"/>`;
    s+=`<g data-p="${id}" style="cursor:${opt.clickable?"pointer":"default"}">${opt.clickable?`<circle cx="${x}" cy="${y}" r="16" fill="transparent"/>`:""}${shape}${big||sel||opt.labels==="all"||(opt.labels==="puertos"&&p[3]==="puerto")?`<text x="${x+10}" y="${y+4}" style="font-size:${big?17:13}px;font-weight:${big?700:600};fill:var(--ink);paint-order:stroke;stroke:var(--map-land);stroke-width:4px">${esc(p[0])}</text>`:""}</g>`;});
  s+=`</svg>`;return s;
}
function panZoom(box){
  const svg=$("svg",box);let vb=[0,0,MW,MH];const set=()=>svg.setAttribute("viewBox",vb.map(n=>n.toFixed(1)).join(" "));
  const zoom=(f,cx=vb[0]+vb[2]/2,cy=vb[1]+vb[3]/2)=>{const w=clamp(vb[2]*f,150,MW*1.2),h=w*MH/MW;vb=[cx-(cx-vb[0])*w/vb[2],cy-(cy-vb[1])*h/vb[3],w,h];set();};
  box.insertAdjacentHTML("beforeend",`<div class="mapctl"><button type="button" data-z="in" aria-label="Acercar">+</button><button type="button" data-z="out" aria-label="Alejar">−</button><button type="button" data-z="madrid" aria-label="Centrar en la sierra de Madrid">◎</button></div><div class="maplegend">▲ puerto · ● pueblo · Contorno y distancias aproximados</div>`);
  box.addEventListener("click",e=>{const b=e.target.closest("[data-z]");if(!b)return;if(b.dataset.z==="in")zoom(0.7);else if(b.dataset.z==="out")zoom(1/0.7);else{const [x,y]=px(40.85,-3.85);vb=[x-220,y-205,440,411];set();}});
  svg.addEventListener("wheel",e=>{e.preventDefault();const r=svg.getBoundingClientRect();const cx=vb[0]+(e.clientX-r.left)/r.width*vb[2],cy=vb[1]+(e.clientY-r.top)/r.height*vb[3];zoom(e.deltaY>0?1.15:0.87,cx,cy);},{passive:false});
  let drag=null,moved=false;
  svg.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,vb:[...vb]};moved=false;});
  window.addEventListener("pointermove",e=>{if(!drag)return;const r=svg.getBoundingClientRect();const dx=(e.clientX-drag.x)/r.width*vb[2],dy=(e.clientY-drag.y)/r.height*vb[3];if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>4)moved=true;vb=[drag.vb[0]-dx,drag.vb[1]-dy,vb[2],vb[3]];set();});
  window.addEventListener("pointerup",()=>{drag=null;});
  svg.addEventListener("click",e=>{if(moved){e.stopPropagation();e.preventDefault();}},true);
  return {focus:(ids)=>{const pts=ids.map(i=>P[i]).filter(Boolean).map(p=>px(p[1],p[2]));if(!pts.length)return;const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);let w=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)*0)+140;w=Math.max(w,(Math.max(...ys)-Math.min(...ys)+140)*MW/MH,260);const h=w*MH/MW;vb=[(Math.max(...xs)+Math.min(...xs))/2-w/2,(Math.max(...ys)+Math.min(...ys))/2-h/2,w,h];set();},get vb(){return vb;},set vb(v){vb=v;set();}};
}

/* =====================================================================
   RUTAS
   ===================================================================== */
let RF={reg:"",ideal:"",sel:null};
function vRutas(arg){
  if(arg&&RUTAS.find(r=>r.id===arg))RF.sel=arg;
  const regs=[...new Set(RUTAS.flatMap(r=>r.reg))];
  app.innerHTML=`
  <div class="eyebrow">Rutas</div><h1 style="font-size:clamp(2rem,5vw,3rem)">Puertos y pueblos alrededor de Madrid</h1>
  <p class="muted" style="margin-top:8px;max-width:72ch">${RUTAS.length} rutas por la Comunidad de Madrid, Castilla y León y Castilla-La Mancha. Toca una para verla en el mapa con su perfil de altitud, paradas recomendadas y avisos. El botón de Google Maps abre la ruta real por carretera.</p>
  <div class="row" style="margin:16px 0"><div class="chips" id="rreg"><button type="button" class="chip ${!RF.reg?"on":""}" data-r="">Todas</button>${regs.map(r=>`<button type="button" class="chip ${RF.reg===r?"on":""}" data-r="${r}">${r}</button>`).join("")}</div>
   <div class="chips" id="rid">${[["","Coche y moto"],["moto","Más de moto"],["coche","Más de coche"]].map(o=>`<button type="button" class="chip ${RF.ideal===o[0]?"on":""}" data-i="${o[0]}">${o[1]}</button>`).join("")}</div></div>
  <div class="maplay"><div class="stack" style="position:sticky;top:70px"><div class="mapbox" id="rmap"></div><div id="rdet"></div></div><div class="stack" id="rlist"></div></div>`;
  $("#rreg").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;RF.reg=b.dataset.r;vRutas();});
  $("#rid").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;RF.ideal=b.dataset.i;vRutas();});
  drawRutas();
}
function drawRutas(){
  const list=RUTAS.filter(r=>(!RF.reg||r.reg.includes(RF.reg))&&(!RF.ideal||r.ideal===RF.ideal||r.ideal==="ambos"));
  const sel=RUTAS.find(r=>r.id===RF.sel);
  $("#rmap").innerHTML=mapSVG({routes:[...list.filter(r=>r.id!==RF.sel).map(r=>({ids:r.p,col:"var(--sign)",w:4,op:.45,id:r.id})),...(sel?[{ids:sel.p,col:"var(--accent)",w:7,id:sel.id}]:[])],sel:sel?sel.p:[],labels:sel?"":"none"});
  const pz=panZoom($("#rmap"));if(sel)pz.focus(sel.p);
  $("#rmap svg").addEventListener("click",e=>{const r=e.target.closest("[data-r]");if(r){RF.sel=r.dataset.r;drawRutas();}});
  $("#rlist").innerHTML=list.map(r=>{const st=statsRuta(r.p,r.curv);return `<button type="button" class="rcard ${r.id===RF.sel?"on":""}" data-id="${r.id}">
    <span class="km"><i></i><b>${fmt(st.km)}</b><small>km</small></span>
    <span style="flex:1;min-width:0"><span class="eyebrow" style="font-size:.75rem">${r.reg.join(" · ")} · ${r.ideal==="ambos"?"coche y moto":"ideal en "+r.ideal}</span><h3 style="font-size:1.2rem;margin-top:2px">${esc(r.n)}</h3>
    <span class="row" style="gap:14px;font-size:.85rem;margin-top:4px" ><span>Curvas <span class="dots">${[1,2,3,4,5].map(i=>`<i class="${i<=r.curv?"on":""}"></i>`).join("")}</span></span><span>Dificultad <span class="dots">${[1,2,3,4,5].map(i=>`<i class="${i<=r.dif?"on":""}"></i>`).join("")}</span></span><span class="mono">${st.puertos} puerto${st.puertos!==1?"s":""} · máx ${fmt(st.maxA)} m</span></span></span></button>`;}).join("")||`<p class="muted">No hay rutas con esos filtros.</p>`;
  $$("#rlist .rcard").forEach(b=>b.addEventListener("click",()=>{RF.sel=b.dataset.id;drawRutas();if(innerWidth<900)$("#rmap").scrollIntoView({behavior:"smooth"});}));
  if(sel){const st=statsRuta(sel.p,sel.curv);
    $("#rdet").innerHTML=`<div class="panel stack"><div class="row" style="justify-content:space-between"><h3>${esc(sel.n)}</h3><button class="btn sm" type="button" id="rclose">Cerrar</button></div>
     <div class="row mono" style="gap:16px;font-size:.92rem"><span><b>${fmt(st.km)}</b> km</span><span><b>${Math.floor(st.h)} h ${Math.round((st.h%1)*60)} min</b></span><span>+${fmt(st.up)} m de subida</span><span>firme ${sel.firme}/5</span></div>
     <p>${esc(sel.d)}</p>
     <div class="profile">${perfilAlt(sel.p)}</div>
     <p style="font-size:.9rem"><b>Recorrido:</b> ${sel.p.map(i=>esc(P[i][0])).join(" → ")}</p>
     <div class="grid g2" style="gap:12px"><div><h4>Paradas</h4><ul style="margin:6px 0 0;padding-left:18px">${sel.par.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><h4 style="color:var(--accent)">Avisos</h4><ul style="margin:6px 0 0;padding-left:18px">${sel.av.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div>
     <p style="font-size:.9rem"><b>Mejor época:</b> ${esc(sel.temp)}</p>
     <div class="row"><a class="btn pri" href="${gmaps(sel.p)}" target="_blank" rel="noopener">Abrir en Google Maps</a><button class="btn" type="button" id="redit">Editar en el diseñador</button></div></div>`;
    $("#rclose").addEventListener("click",()=>{RF.sel=null;drawRutas();});
    $("#redit").addEventListener("click",()=>{DZ.stops=[...sel.p];DZ.name=sel.n+" (mi versión)";store.set("dz",DZ);location.hash="disenar";});
  } else $("#rdet").innerHTML=`<p class="muted" style="font-size:.9rem">Toca una ruta de la lista o del mapa. Arrastra para moverte y usa + y − para hacer zoom.</p>`;
}

/* =====================================================================
   DISEÑADOR DE RUTAS
   ===================================================================== */
let DZ=store.get("dz",{stops:["villalba"],name:"Mi ruta",curv:4});
function vDisenar(){
  const saved=store.get("rutas",[]);
  app.innerHTML=`
  <div class="eyebrow">Diseñador de rutas</div><h1 style="font-size:clamp(2rem,5vw,3rem)">Crea tu propia ruta</h1>
  <p class="muted" style="margin-top:8px;max-width:72ch">Toca puertos (▲) y pueblos (●) en el mapa en el orden en que quieres pasar, o usa las sugerencias de puntos cercanos. Calculamos distancia, tiempo, desnivel y puertos, y te damos el enlace para navegar con Google Maps.</p>
  <div class="maplay" style="margin-top:16px">
   <div class="stack" style="position:sticky;top:70px"><div class="mapbox" id="dmap"></div><div class="panel profile" id="dprof"></div></div>
   <div class="stack">
    <div class="panel stack">
     <label class="f">Nombre de la ruta<input type="text" id="dname" value="${esc(DZ.name)}"></label>
     <label class="f">Punto de salida<select id="dstart">${Object.entries(P).sort((a,b)=>a[1][0].localeCompare(b[1][0])).map(([id,p])=>`<option value="${id}">${esc(p[0])}</option>`).join("")}</select></label>
     <label class="f">Tipo de carretera: <b style="color:var(--ink)" id="dcurvv"></b><input type="range" id="dcurv" min="1" max="5" value="${DZ.curv||4}"></label>
     <div><h4 style="margin-bottom:8px">Paradas</h4><div class="stoplist" id="dstops"></div></div>
     <div><h4 style="margin-bottom:6px">Añadir punto cercano</h4><div class="chips" id="dnear"></div></div>
     <div class="row"><button class="btn sm" type="button" id="dloop">Volver al inicio</button><button class="btn sm" type="button" id="dundo">Deshacer</button><button class="btn sm" type="button" id="dclear">Empezar de nuevo</button></div>
    </div>
    <div class="panel stack" id="dstats"></div>
    <div class="panel stack"><h3>Mis rutas guardadas</h3><div id="dsaved">${saved.length?"":`<p class="muted">Aún no has guardado ninguna.</p>`}</div></div>
   </div>
  </div>`;
  $("#dstart").value=DZ.stops[0]||"villalba";
  const curvN=["","Autovía y nacional","Curvas suaves","Curvas medias","Puertos y curvas enlazadas","Muy virada y estrecha"];
  const save=()=>store.set("dz",DZ);
  let pz=null;
  const draw=()=>{
    const ids=DZ.stops;const st=statsRuta(ids,DZ.curv);
    const vb=pz?pz.vb:null;
    $("#dmap").innerHTML=mapSVG({routes:[{ids,col:"var(--accent)",w:6}],clickable:true,sel:ids,labels:"puertos"});
    pz=panZoom($("#dmap"));if(vb)pz.vb=vb;else{const [x,y]=px(40.85,-3.85);pz.vb=[x-260,y-243,520,486];}
    $("#dmap svg").addEventListener("click",e=>{const g=e.target.closest("[data-p]");if(!g)return;DZ.stops.push(g.dataset.p);save();draw();});
    $("#dcurvv").textContent=curvN[DZ.curv];
    $("#dstops").innerHTML=ids.map((id,i)=>`<div class="stop"><span>${esc(P[id][0])} <span class="muted mono" style="font-size:.8rem">${P[id][3]==="puerto"?"▲ ":""}${fmt(P[id][4])} m</span></span>${i?`<button type="button" data-up="${i}" aria-label="Subir">↑</button><button type="button" data-del="${i}" aria-label="Quitar">×</button>`:""}</div>`).join("");
    const last=P[ids[ids.length-1]];
    const near=Object.entries(P).filter(([id])=>id!==ids[ids.length-1]).map(([id,p])=>[id,p,dist(last,p)]).sort((a,b)=>a[2]-b[2]).slice(0,8);
    $("#dnear").innerHTML=near.map(([id,p,d])=>`<button type="button" class="chip" data-add="${id}">${p[3]==="puerto"?"▲ ":""}${esc(p[0])} <span class="mono muted" style="font-size:.78rem">${fmt(d*1.3)} km</span></button>`).join("");
    const dif=Math.min(5,Math.round((DZ.curv+(st.maxA>1600?1:0)+(st.puertos>2?1:0))*0.8+0.4));
    $("#dstats").innerHTML=ids.length<2?`<p class="muted">Añade al menos otro punto para calcular la ruta.</p>`:`
      <div class="row" style="justify-content:space-between"><h3>${esc(DZ.name)}</h3><span class="km" style="width:58px"><i></i><b>${fmt(st.km)}</b><small>km aprox.</small></span></div>
      <div class="row mono" style="gap:16px"><span><b>${Math.floor(st.h)} h ${Math.round((st.h%1)*60)} min</b> conduciendo</span><span>+${fmt(st.up)} m</span><span>${st.puertos} puerto${st.puertos!==1?"s":""}</span><span>máx ${fmt(st.maxA)} m</span></div>
      <p>Nivel estimado: <span class="dots">${[1,2,3,4,5].map(i=>`<i class="${i<=dif?"on":""}"></i>`).join("")}</span> ${["","muy fácil","fácil","media","exigente","muy exigente"][dif]}. ${st.maxA>1500?"Pasa por encima de 1.500 m: en invierno revisa el estado de los puertos en la DGT. ":""}${st.km>180?"Ruta larga: planifica repostaje y descansos cada 2 horas.":""}</p>
      <p class="muted" style="font-size:.85rem">Las distancias se calculan en línea recta corregida por el tipo de carretera. Google Maps te dará la cifra exacta.</p>
      <div class="row"><a class="btn pri" href="${gmaps(ids)}" target="_blank" rel="noopener">Abrir en Google Maps</a><button class="btn" type="button" id="dsave">Guardar ruta</button><button class="btn" type="button" id="dcopy">Copiar enlace</button></div>`;
    $("#dprof").innerHTML=ids.length>1?`<h4 style="margin-bottom:6px">Perfil de altitud</h4>`+perfilAlt(ids):`<p class="muted">El perfil de altitud aparecerá al añadir puntos.</p>`;
    $("#dsave")?.addEventListener("click",()=>{const s=store.get("rutas",[]);s.unshift({name:DZ.name,stops:[...ids],curv:DZ.curv,t:Date.now()});store.set("rutas",s.slice(0,30));toast("Ruta guardada");listSaved();});
    $("#dcopy")?.addEventListener("click",()=>{const u=gmaps(ids);navigator.clipboard?.writeText(u).then(()=>toast("Enlace copiado")).catch(()=>{prompt;toast("No se pudo copiar: usa el botón de Google Maps");});});
  };
  const listSaved=()=>{const s=store.get("rutas",[]);$("#dsaved").innerHTML=s.length?s.map((r,i)=>`<div class="stop" style="counter-increment:none"><span><b>${esc(r.name)}</b> <span class="muted mono" style="font-size:.8rem">${fmt(statsRuta(r.stops,r.curv).km)} km · ${r.stops.length} puntos</span></span><button type="button" data-load="${i}">Abrir</button><button type="button" data-rmr="${i}" aria-label="Borrar">×</button></div>`).join(""):`<p class="muted">Aún no has guardado ninguna.</p>`;};
  $("#dsaved").addEventListener("click",e=>{const l=e.target.closest("[data-load]"),r=e.target.closest("[data-rmr]");const s=store.get("rutas",[]);
    if(l){const x=s[+l.dataset.load];DZ={stops:[...x.stops],name:x.name,curv:x.curv||4};save();vDisenar();}
    if(r){s.splice(+r.dataset.rmr,1);store.set("rutas",s);listSaved();}});
  $("#dstops").addEventListener("click",e=>{const d=e.target.closest("[data-del]"),u=e.target.closest("[data-up]");
    if(d){DZ.stops.splice(+d.dataset.del,1);save();draw();}
    if(u){const i=+u.dataset.up;if(i>1){[DZ.stops[i-1],DZ.stops[i]]=[DZ.stops[i],DZ.stops[i-1]];save();draw();}}});
  $("#dnear").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;DZ.stops.push(b.dataset.add);save();draw();});
  $("#dname").addEventListener("input",e=>{DZ.name=e.target.value||"Mi ruta";save();const h=$("#dstats h3");if(h)h.textContent=DZ.name;});
  $("#dstart").addEventListener("change",e=>{DZ.stops[0]=e.target.value;save();draw();});
  $("#dcurv").addEventListener("input",e=>{DZ.curv=+e.target.value;save();draw();});
  $("#dloop").addEventListener("click",()=>{if(DZ.stops.length>1&&DZ.stops[DZ.stops.length-1]!==DZ.stops[0]){DZ.stops.push(DZ.stops[0]);save();draw();}});
  $("#dundo").addEventListener("click",()=>{if(DZ.stops.length>1){DZ.stops.pop();save();draw();}});
  $("#dclear").addEventListener("click",()=>{DZ={stops:[DZ.stops[0]],name:"Mi ruta",curv:DZ.curv};save();vDisenar();});
  draw();listSaved();
}

/* =====================================================================
   TEST DE PERFIL
   ===================================================================== */
const ARQ=[
 {n:"Cazador de puertos",k:{dep:2,ruta:1,clas:0.5},d:"Lo tuyo son las carreteras de montaña: buscas un vehículo ligero, comunicativo y con buen chasis más que cifras de potencia. Disfrutas de la trazada y del sonido del motor."},
 {n:"Purista analógico",k:{dep:1.5,clas:2,tun:0.5},d:"Te gustan los coches y motos con alma: propulsión, cambio manual, seis cilindros o bicilíndricos con carácter. Prefieres sensaciones a pantallas."},
 {n:"Piloto de tandas",k:{circ:2.5,dep:1.5},d:"Quieres llevar tu vehículo al límite en un entorno seguro. Valoras frenos, neumáticos, peso y fiabilidad en uso intensivo."},
 {n:"Gran turista",k:{ruta:2,conf:2,efic:0.5},d:"Te gusta hacer kilómetros con comodidad, llegar descansado y que el vehículo sea capaz de todo sin agobios."},
 {n:"Aventurero",k:{off:2.5,ruta:1},d:"Las pistas, la nieve y los caminos te llaman. Quieres algo robusto, alto y capaz fuera del asfalto."},
 {n:"Urbanita eficiente",k:{urb:2,efic:2,prac:1},d:"Tu día a día es la ciudad: buscas consumo bajo, facilidad para aparcar y poco gasto."},
 {n:"Práctico inteligente",k:{prac:2,barato:2,fiab:1.5},d:"Quieres gastar poco, que no te dé problemas y que sirva para todo. Eliges con la cabeza, aunque con un punto de diversión."},
 {n:"Tuner de garaje",k:{tun:2.5,clas:1,dep:1},d:"Disfrutas tanto conduciendo como mejorando tu vehículo. Buscas bases baratas, conocidas y fáciles de preparar."}
];
function recomendar(ax,meta){
  const w=k=>Math.max(0,ax[k]||0);
  return VEH.map(v=>{const t=top(v);let s=0;const why=[];
    ["dep","circ","fiab","barato","prac","clas","conf","ruta","off","urb","efic","lujo","novel","tun","fam"].forEach(k=>{if(v.tags.includes(k)&&w(k)>0){s+=w(k);why.push(TAGN[k]);}});
    if(meta.budget&&v.pmin>meta.budget)s-=50;else if(meta.budget&&v.pmax<=meta.budget)why.push("Dentro de tu presupuesto");
    if(v.tipo==="moto"){if(meta.lic==="B"&&!v.tags.includes("125"))s-=40;if(meta.lic==="A2"&&!(v.tags.includes("a2")||v.tags.includes("a2l")||v.vers.some(x=>x.cv<=95.2)))s-=40;if(meta.lic==="A2"&&(v.tags.includes("a2")||v.tags.includes("a2l")))why.push("Vale para A2");}
    if(meta.novel&&(v.tipo==="coche"?t.cv>320:t.cv>130))s-=4;
    s+=(v.tipo==="moto"?(ax.moto||0):(ax.coche||0))*0.6;
    return{v,s,why:[...new Set(why)].slice(0,4)};}).sort((a,b)=>b.s-a.s);
}
let TS={i:0,ans:[]};
function vPerfil(){
  const res=store.get("test",null);
  if(res&&TS.i===0&&!TS.ans.length){mostrarPerfil(res);return;}
  const Q=window.TEST;const q=Q[TS.i];
  app.innerHTML=`<div class="eyebrow">Test de perfil de conducción</div><h1 style="font-size:clamp(2rem,5vw,3rem)">¿Qué tipo de conductor eres?</h1>
   <p class="muted" style="margin-top:8px">${Q.length} preguntas. Al final verás tu perfil y los coches y motos que mejor te encajan.</p>
   <div class="panel stack" style="margin-top:18px;max-width:760px">
    <div class="row" style="justify-content:space-between"><span class="mono muted">Pregunta ${TS.i+1} de ${Q.length}</span>${TS.i?`<button class="btn sm" type="button" id="tback">← Anterior</button>`:""}</div>
    <div class="prog"><i style="width:${TS.i/Q.length*100}%"></i></div>
    <h2 style="margin-top:8px">${esc(q.q)}</h2>
    <div class="stack">${q.o.map((o,i)=>`<button type="button" class="qopt" data-i="${i}">${esc(o[0])}</button>`).join("")}</div>
   </div>`;
  $$(".qopt").forEach(b=>b.addEventListener("click",()=>{TS.ans[TS.i]=+b.dataset.i;TS.i++;if(TS.i>=Q.length)finTest();else vPerfil();}));
  $("#tback")?.addEventListener("click",()=>{TS.i--;vPerfil();});
}
function finTest(){
  const ax={};TS.ans.forEach((a,i)=>{const o=window.TEST[i].o[a];Object.entries(o[1]).forEach(([k,v])=>ax[k]=(ax[k]||0)+v);});
  const bi=TS.ans[2];const budget=[5000,12000,25000,0][bi];
  const li=TS.ans[14];const lic=["B","A2","A2","A"][li];
  const novel=TS.ans[12]===0;
  let best=ARQ[0],bs=-1;ARQ.forEach(a=>{const s=Object.entries(a.k).reduce((t,[k,w])=>t+(ax[k]||0)*w,0);if(s>bs){bs=s;best=a;}});
  const res={ax,meta:{budget,lic,novel},arq:best,t:Date.now()};store.set("test",res);TS={i:0,ans:[]};mostrarPerfil(res);
}
function mostrarPerfil(res){
  const rec=recomendar(res.ax,res.meta);const coches=rec.filter(r=>r.v.tipo==="coche").slice(0,6),motos=rec.filter(r=>r.v.tipo==="moto").slice(0,6);
  const AXN={dep:"Deportividad",circ:"Circuito",prac:"Practicidad",fiab:"Fiabilidad",barato:"Ahorro",clas:"Clásicos",conf:"Confort",ruta:"Viajes",off:"Campo",urb:"Ciudad",efic:"Eficiencia",tun:"Preparación"};
  const mx=Math.max(1,...Object.keys(AXN).map(k=>res.ax[k]||0));
  const rc=r=>`<div class="stack" style="gap:6px">${vcard(r.v)}<p style="font-size:.85rem" class="muted">Por qué: ${r.why.length?esc(r.why.join(" · ")):"buen equilibrio general"}</p></div>`;
  app.innerHTML=`<div class="eyebrow">Tu perfil de conducción</div><h1 style="font-size:clamp(2.2rem,5.5vw,3.6rem)">${esc(res.arq.n)}</h1>
   <p style="margin-top:10px;font-size:1.1rem;max-width:65ch">${esc(res.arq.d)}</p>
   <div class="grid g2" style="margin-top:18px;align-items:start">
    <div class="panel stack"><h3>Tus ejes</h3>${Object.entries(AXN).map(([k,n])=>`<div class="axis"><span>${n}</span><div class="meter"><i style="width:${clamp((res.ax[k]||0)/mx)*100}%"></i></div><span class="mono">${res.ax[k]||0}</span></div>`).join("")}</div>
    <div class="stack"><div class="callout"><h4>Presupuesto y carnet</h4><p style="margin-top:4px">${res.meta.budget?`Compra hasta unos ${eur(res.meta.budget)}.`:"Sin límite claro de presupuesto."} ${res.meta.lic==="A2"?"En moto, solo te recomendamos modelos A2 o limitables.":res.meta.lic==="B"?"En moto, con el carnet B solo te mostramos 125 cc (necesitas 3 años de antigüedad).":"Con el A puedes llevar cualquier moto."}</p></div>
     ${res.meta.novel?`<div class="callout red"><h4>Consejo para noveles</h4><p style="margin-top:4px">Con poca experiencia, un vehículo de potencia moderada te enseñará más y te costará menos de seguro. Echa un vistazo a la sección de técnicas.</p></div>`:""}
     <div class="row"><button class="btn pri" type="button" id="tagain">Repetir el test</button><a class="btn" href="#comparar" id="tcmp">Comparar los 3 primeros coches</a></div></div>
   </div>
   <section><h2>Coches recomendados</h2><div class="grid g3" style="margin-top:14px">${coches.map(rc).join("")}</div></section>
   <section><h2>Motos recomendadas</h2><div class="grid g3" style="margin-top:14px">${motos.map(rc).join("")}</div></section>`;
  $("#tagain").addEventListener("click",()=>{store.set("test",null);TS={i:0,ans:[]};vPerfil();});
  $("#tcmp").addEventListener("click",()=>{cmp=coches.slice(0,3).map(r=>({id:r.v.id,vi:0}));saveCmp();});
}

/* =====================================================================
   QUIZ
   ===================================================================== */
let QZ=null;
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function genModelo(){const v=shuffle(VEH)[0];const ver=top(v);const opts=shuffle([v,...shuffle(VEH.filter(x=>x.tipo===v.tipo&&x.id!==v.id&&x.modelo!==v.modelo)).slice(0,3)]);
  return{cat:"¿Qué modelo es?",q:`${v.tipo==="moto"?"Moto":"Coche"} de ${v.anos.replace("-"," a ")}. Su versión más potente (${ver.n.replace(v.modelo,"").trim()||"tope de gama"}) tiene ${fmt(ver.cv,ver.cv%1?1:0)} cv y motor ${MOTORES[ver.motor]?.nombre.replace(v.marca,"").trim()}. ${v.desc.split(".")[0].replace(v.modelo,"este modelo").replace(v.marca,"la marca")}.`,
    o:opts.map(x=>`${x.marca} ${x.modelo} ${x.gen}`),c:opts.indexOf(v),e:`Era el ${vname(v)} ${v.gen}.`,pic:v};}
function genDuelo(){const tipo=Math.random()<0.5?"coche":"moto";const [a,b]=shuffle(VEH.filter(x=>x.tipo===tipo)).slice(0,2);const va=shuffle(a.vers)[0],vb=shuffle(b.vers)[0];
  if(va.acc===vb.acc)return genDuelo();const ok=va.acc<vb.acc?0:1;
  return{cat:"Duelo",q:"¿Cuál acelera antes de 0 a 100 km/h?",o:[`${a.marca} ${a.modelo} ${va.n}`,`${b.marca} ${b.modelo} ${vb.n}`],c:ok,e:`${a.modelo} ${va.n}: ${fmt(va.acc,1)} s (${fmt(kgcv(va),1)} kg/cv). ${b.modelo} ${vb.n}: ${fmt(vb.acc,1)} s (${fmt(kgcv(vb),1)} kg/cv). Normalmente gana el que tiene menos kilos por caballo.`};}
function vQuiz(){
  const best=store.get("qbest",{});
  if(!QZ){app.innerHTML=`<div class="eyebrow">Quiz</div><h1 style="font-size:clamp(2rem,5vw,3rem)">¿Cuánto sabes de coches y motos?</h1>
   <p class="muted" style="margin-top:8px">Rondas de 10 preguntas. Después de cada respuesta verás la explicación.</p>
   <div class="grid g3" style="margin-top:18px">${[["mix","Mezcla de todo","Preguntas de mecánica, conducción, normativa e historia."],["mecánica","Mecánica","Turbo, distribución, diferenciales y fallos típicos."],["conducción","Conducción","Trazadas, frenadas y técnicas."],["normativa","Normativa","Carnets, límites y DGT."],["modelo","¿Qué modelo es?","Adivina el vehículo por sus datos y su silueta."],["duelo","Duelos","¿Cuál acelera más? Aprende a leer el peso/potencia."]].map(m=>`<button type="button" class="tile" data-m="${m[0]}" style="text-align:left;cursor:pointer;font:inherit"><h3>${m[1]}</h3><p>${m[2]}</p><span class="mono muted" style="font-size:.85rem">Mejor: ${best[m[0]]??"–"}/10</span></button>`).join("")}</div>`;
   $$("[data-m]").forEach(b=>b.addEventListener("click",()=>{const m=b.dataset.m;let qs;
     if(m==="modelo")qs=Array.from({length:10},genModelo);else if(m==="duelo")qs=Array.from({length:10},genDuelo);
     else{let bank=window.QUIZ.filter(q=>m==="mix"||q[0]===m||(m==="mecánica"&&q[0]==="motos")||(m==="normativa"&&q[0]==="historia"));qs=shuffle(bank).slice(0,10).map(q=>({cat:q[0],q:q[1],o:q[2],c:q[3],e:q[4]}));
       if(m==="mix")qs=shuffle([...qs.slice(0,7),genModelo(),genDuelo(),genModelo()]);}
     QZ={m,qs,i:0,ok:0,ans:null};vQuiz();}));return;}
  const q=QZ.qs[QZ.i];
  app.innerHTML=`<div class="row" style="justify-content:space-between"><span class="eyebrow">${esc(q.cat)}</span><button class="btn sm" type="button" id="qexit">Salir</button></div>
   <div class="panel stack" style="margin-top:12px;max-width:760px">
    <div class="row" style="justify-content:space-between"><span class="mono muted">Pregunta ${QZ.i+1} de ${QZ.qs.length}</span><span class="mono">Aciertos: <b>${QZ.ok}</b></span></div>
    <div class="prog"><i style="width:${QZ.i/QZ.qs.length*100}%"></i></div>
    ${q.pic?`<div style="max-width:380px;filter:brightness(0) opacity(.75)">${ILU.vehiculo(q.pic)}</div>`:""}
    <h2 style="font-size:clamp(1.3rem,3vw,1.8rem)">${esc(q.q)}</h2>
    <div class="stack" id="qo">${q.o.map((o,i)=>`<button type="button" class="qopt" data-i="${i}">${esc(o)}</button>`).join("")}</div>
    <div id="qexp"></div></div>`;
  $("#qexit").addEventListener("click",()=>{QZ=null;vQuiz();});
  $$("#qo .qopt").forEach(b=>b.addEventListener("click",()=>{const i=+b.dataset.i;const ok=i===q.c;if(ok)QZ.ok++;
    $$("#qo .qopt").forEach((x,j)=>{x.disabled=true;if(j===q.c)x.classList.add("right");else if(j===i)x.classList.add("wrong");});
    $("#qexp").innerHTML=`<div class="callout ${ok?"ok":"red"}"><h4>${ok?"¡Correcto!":"No era esa"}</h4><p style="margin-top:4px">${esc(q.e)}</p>${q.pic?`<p style="margin-top:6px"><a href="#v-${q.pic.id}">Ver la ficha del ${esc(vname(q.pic))}</a></p>`:""}</div><div class="row" style="margin-top:12px"><button class="btn pri" type="button" id="qnext">${QZ.i+1<QZ.qs.length?"Siguiente":"Ver resultado"}</button></div>`;
    $("#qnext").addEventListener("click",()=>{QZ.i++;if(QZ.i>=QZ.qs.length){const b=store.get("qbest",{});b[QZ.m]=Math.max(b[QZ.m]||0,QZ.ok);store.set("qbest",b);
      app.innerHTML=`<div class="panel stack" style="max-width:640px;margin:0 auto;text-align:center"><div class="eyebrow">Resultado</div><h1>${QZ.ok}/10</h1><p>${QZ.ok>=9?"Nivel jefe de taller.":QZ.ok>=7?"Muy bien: sabes de lo que hablas.":QZ.ok>=5?"Aprobado. Repasa las técnicas y el glosario.":"Hay margen de mejora: la sección de mecánica de cada ficha te ayudará."}</p><div class="row" style="justify-content:center"><button class="btn pri" type="button" id="qagain">Otra ronda</button><button class="btn" type="button" id="qmenu">Elegir modo</button></div></div>`;
      const m=QZ.m;$("#qagain").addEventListener("click",()=>{QZ=null;vQuiz();$(`[data-m="${m}"]`)?.click();});$("#qmenu").addEventListener("click",()=>{QZ=null;vQuiz();});}else vQuiz();});}));
}

/* =====================================================================
   TÉCNICAS Y GLOSARIO
   ===================================================================== */
let TF="";
function vTecnicas(){
  const list=window.TECNICAS.filter(t=>!TF||t.para===TF||t.para==="ambos");
  app.innerHTML=`<div class="eyebrow">Técnicas de conducción</div><h1 style="font-size:clamp(2rem,5vw,3rem)">Conduce mejor, paso a paso</h1>
   <p class="muted" style="margin-top:8px;max-width:72ch">Cada técnica explica qué es, por qué funciona, cómo hacerla, los errores típicos y un ejercicio para practicar. Practica lo avanzado en circuito o en un curso, nunca en vía abierta.</p>
   <div class="chips" style="margin:16px 0" id="tf">${[["","Todas"],["coche","Coche"],["moto","Moto"]].map(o=>`<button type="button" class="chip ${TF===o[0]?"on":""}" data-f="${o[0]}">${o[1]}</button>`).join("")}</div>
   <div class="stack">${list.map(t=>`<details class="tech"><summary><span class="signbox" style="background:${t.para==="moto"?"var(--accent)":t.para==="coche"?"var(--sign)":"var(--ink)"};color:var(--bg)">${t.niv}</span><span style="flex:1"><span class="eyebrow" style="font-size:.75rem">${t.para==="ambos"?"Coche y moto":t.para==="moto"?"Moto":"Coche"} · nivel ${["","básico","medio","avanzado"][t.niv]}</span><h3 style="margin-top:2px">${esc(t.t)}</h3><p class="muted" style="margin-top:4px">${esc(t.res)}</p></span></summary>
     <div class="in"><div class="stack">${t.txt.map(p=>`<p>${esc(p)}</p>`).join("")}${t.dia?ILU.tecnica(t.dia):""}</div>
     <div class="stack"><div><h4>Cómo hacerlo</h4><ol>${t.pasos.map(p=>`<li>${esc(p)}</li>`).join("")}</ol></div><div><h4 style="color:var(--accent)">Errores típicos</h4><ul>${t.err.map(p=>`<li>${esc(p)}</li>`).join("")}</ul></div><div class="callout ok"><h4>Ejercicio</h4><p style="margin-top:4px">${esc(t.ej)}</p></div></div></div></details>`).join("")}</div>`;
  $("#tf").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;TF=b.dataset.f;vTecnicas();});
}
function vGlosario(){
  const items=Object.entries(window.GLOSARIO).sort((a,b)=>a[0].localeCompare(b[0]));
  app.innerHTML=`<div class="eyebrow">Glosario</div><h1 style="font-size:clamp(2rem,5vw,3rem)">Palabras técnicas, explicadas</h1>
   <p class="muted" style="margin-top:8px">En toda la web, las palabras con subrayado punteado se pueden tocar para ver su explicación.</p>
   <label class="f" style="margin:16px 0;max-width:420px">Buscar<input type="search" id="gq" placeholder="Ej.: par, bimasa, A2…"></label>
   <div class="grid g2" id="gl">${items.map(([k,v])=>`<div class="panel" data-k="${esc(k.toLowerCase())}"><h3 style="text-transform:capitalize">${esc(k)}</h3><p style="margin-top:6px">${esc(v)}</p></div>`).join("")}</div>`;
  $("#gq").addEventListener("input",e=>{const q=e.target.value.toLowerCase();$$("#gl .panel").forEach(p=>p.hidden=q&&!p.dataset.k.includes(q)&&!p.textContent.toLowerCase().includes(q));});
}

/* ---------- Arranque ---------- */
saveCmp();
route();
})();

(() => {
  const KEY="miranda-features-v1";
  let state;
  try{state=JSON.parse(localStorage.getItem(KEY))||{};}catch{state={};}
  state.favorites=Array.isArray(state.favorites)?state.favorites:[];
  state.days=Array.isArray(state.days)?state.days:[];
  state.rareSeen=Number(state.rareSeen)||0;
  state.cinemaRuns=Number(state.cinemaRuns)||0;
  const today=new Date().toISOString().slice(0,10);
  if(!state.days.includes(today))state.days.push(today);
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
  save();

  const scenes=[...document.querySelectorAll(".scene")];
  if(scenes.length!==23)return;
  const sceneInfo=scenes.map((scene,index)=>({
    id:scene.dataset.sceneId||String(index),
    index,
    title:scene.dataset.originalTitle||String(scene.dataset.title||"Capítulo").replace(/^\d{2}\/23 · /,"")
  }));

  function toast(html){
    let t=document.querySelector(".feature-toast");
    if(!t){t=document.createElement("div");t.className="feature-toast";document.body.appendChild(t);}
    t.innerHTML=html;t.classList.add("show");
    clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2000);
  }

  // Hub.
  const hub=document.createElement("div");hub.className="feature-hub";
  hub.innerHTML='<button type="button" id="favoriteHub" aria-label="Ver favoritos" title="Favoritos">♡<span class="feature-count" id="favoriteCount">0</span></button><button type="button" id="cinemaHub" aria-label="Reproducir modo cine" title="Modo cine">▶</button><button type="button" id="backupHub" aria-label="Copia de progreso" title="Copia de progreso">↥</button>';
  document.body.appendChild(hub);

  // Favorite each of the 23 chapters.
  scenes.forEach(infoScene=>{
    const id=infoScene.dataset.sceneId;
    const b=document.createElement("button");
    b.type="button";b.className="scene-favorite";b.dataset.favorite=id;
    b.setAttribute("aria-label","Marcar capítulo como favorito");b.title="Guardar este capítulo";
    b.textContent="♡";
    b.addEventListener("click",()=>{
      const exists=state.favorites.includes(id);
      state.favorites=exists?state.favorites.filter(x=>x!==id):[...state.favorites,id];
      save();renderFavorites();
      toast(exists?"Quitado de favoritos":"<strong>Favorito guardado</strong> ♡");
    });
    infoScene.appendChild(b);
  });

  function syncFavoriteButtons(){
    document.querySelectorAll(".scene-favorite").forEach(b=>{
      const saved=state.favorites.includes(b.dataset.favorite);
      b.classList.toggle("saved",saved);b.textContent=saved?"♥":"♡";
      b.setAttribute("aria-label",saved?"Quitar capítulo de favoritos":"Marcar capítulo como favorito");
    });
    const count=document.getElementById("favoriteCount");if(count)count.textContent=state.favorites.length;
  }

  // Favorites drawer.
  const favDrawer=document.createElement("div");favDrawer.className="feature-drawer hidden";favDrawer.id="favoriteDrawer";
  favDrawer.innerHTML='<div class="feature-card"><div class="feature-card-head"><div><small>Mi selección</small><strong>Capítulos favoritos</strong></div><button class="feature-close" type="button" aria-label="Cerrar">×</button></div><div class="favorite-list" id="favoriteList"></div></div>';
  document.body.appendChild(favDrawer);
  function renderFavorites(){
    syncFavoriteButtons();
    const list=document.getElementById("favoriteList");if(!list)return;
    const selected=sceneInfo.filter(s=>state.favorites.includes(s.id));
    if(!selected.length){list.innerHTML='<div class="favorite-empty">Todavía no has guardado ningún capítulo. Toca el ♡ que aparece en cualquiera de las 23 páginas.</div>';return;}
    list.innerHTML="";
    selected.forEach(item=>{
      const row=document.createElement("div");row.className="favorite-item";
      row.innerHTML='<span class="favorite-num">'+String(item.index+1).padStart(2,"0")+'</span><div><strong>'+item.title+'</strong><small>Capítulo '+(item.index+1)+' de 23</small></div><div class="favorite-actions"></div>';
      const actions=row.querySelector(".favorite-actions");
      const go=document.createElement("button");go.type="button";go.textContent="Ir";go.addEventListener("click",()=>{window.mirandaShowScene?.(item.index);favDrawer.classList.add("hidden");});
      const del=document.createElement("button");del.type="button";del.textContent="Quitar";del.addEventListener("click",()=>{state.favorites=state.favorites.filter(x=>x!==item.id);save();renderFavorites();});
      actions.append(go,del);list.appendChild(row);
    });
  }
  renderFavorites();
  document.getElementById("favoriteHub").addEventListener("click",()=>favDrawer.classList.remove("hidden"));
  favDrawer.querySelector(".feature-close").addEventListener("click",()=>favDrawer.classList.add("hidden"));
  favDrawer.addEventListener("click",e=>{if(e.target===favDrawer)favDrawer.classList.add("hidden");});

  // Backup / restore drawer.
  const backupDrawer=document.createElement("div");backupDrawer.className="feature-drawer hidden";backupDrawer.id="backupDrawer";
  backupDrawer.innerHTML='<div class="feature-card"><div class="feature-card-head"><div><small>Progreso local</small><strong>Copia de seguridad</strong></div><button class="feature-close" type="button" aria-label="Cerrar">×</button></div><div class="backup-panel"><div class="backup-info">Exporta logros, planes, favoritos, capítulos visitados y secretos encontrados. El archivo solo contiene datos de esta experiencia guardados en este navegador.</div><div class="backup-buttons"><button type="button" id="exportProgress">↓ Exportar progreso</button><label class="backup-file-label">↑ Restaurar copia<input type="file" id="importProgress" accept="application/json,.json"></label></div><div class="backup-danger">Al restaurar una copia se reemplazará el progreso local actual de la experiencia.</div></div></div>';
  document.body.appendChild(backupDrawer);
  document.getElementById("backupHub").addEventListener("click",()=>backupDrawer.classList.remove("hidden"));
  backupDrawer.querySelector(".feature-close").addEventListener("click",()=>backupDrawer.classList.add("hidden"));
  backupDrawer.addEventListener("click",e=>{if(e.target===backupDrawer)backupDrawer.classList.add("hidden");});

  const PROGRESS_KEYS=[
    "miranda-exploration-v1","miranda-special-v1","miranda-ultimate-v1","miranda-force-birthday",
    "miranda-plans-v1","miranda-23-details-v1","miranda-microdetails-v1","miranda-features-v1"
  ];
  document.getElementById("exportProgress").addEventListener("click",()=>{
    const values={};
    PROGRESS_KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)values[k]=v;});
    const payload={type:"sorpresa-miranda-backup",version:1,exportedAt:new Date().toISOString(),data:values};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="sorpresa-miranda-progreso-"+today+".json";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),600);toast("<strong>Copia exportada</strong> ✦");
  });
  document.getElementById("importProgress").addEventListener("change",async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const parsed=JSON.parse(await file.text());
      if(parsed?.type!=="sorpresa-miranda-backup"||!parsed.data||typeof parsed.data!=="object")throw new Error("Formato no válido");
      PROGRESS_KEYS.forEach(k=>localStorage.removeItem(k));
      for(const [k,v] of Object.entries(parsed.data)){
        if(PROGRESS_KEYS.includes(k)&&typeof v==="string")localStorage.setItem(k,v);
      }
      toast("<strong>Copia restaurada.</strong> Recargando…");
      setTimeout(()=>location.reload(),700);
    }catch{
      toast("Ese archivo no parece una copia válida de esta experiencia.");
      e.target.value="";
    }
  });

  // Cinema mode.
  const controller=document.createElement("div");controller.className="cinema-controller hidden";
  controller.innerHTML='<div class="cinema-top"><div class="cinema-title"><small>Modo cine · 23 capítulos</small><strong id="cinemaSceneName">Preparado</strong></div><div class="cinema-controls"><button id="cinemaPrev" type="button" aria-label="Anterior">‹</button><button id="cinemaPause" type="button" aria-label="Pausa">Ⅱ</button><button id="cinemaNext" type="button" aria-label="Siguiente">›</button><button id="cinemaStop" type="button" aria-label="Salir">×</button></div></div><div class="cinema-progress"><span id="cinemaProgressBar"></span></div>';
  document.body.appendChild(controller);
  let cinemaIndex=0,cinemaPaused=false,cinemaTimer=null,progressTimer=null,startedAt=0;
  const DURATION=5200;
  function cinemaName(){
    const info=sceneInfo[cinemaIndex];
    document.getElementById("cinemaSceneName").textContent=String(cinemaIndex+1).padStart(2,"0")+"/23 · "+info.title;
  }
  function clearCinemaTimers(){clearTimeout(cinemaTimer);clearInterval(progressTimer);}
  function runCinemaFrame(){
    clearCinemaTimers();
    window.mirandaShowScene?.(cinemaIndex);cinemaName();
    const bar=document.getElementById("cinemaProgressBar");bar.style.width="0%";startedAt=Date.now();
    if(cinemaPaused)return;
    progressTimer=setInterval(()=>{
      const pct=Math.min(100,(Date.now()-startedAt)/DURATION*100);bar.style.width=pct+"%";
    },100);
    cinemaTimer=setTimeout(()=>{
      if(cinemaIndex>=scenes.length-1){stopCinema();return;}
      cinemaIndex++;runCinemaFrame();
    },DURATION);
  }
  function startCinema(){
    state.cinemaRuns+=1;save();cinemaIndex=0;cinemaPaused=false;
    document.body.classList.add("cinema-mode");controller.classList.remove("hidden");
    document.getElementById("cinemaPause").textContent="Ⅱ";runCinemaFrame();
  }
  function stopCinema(){
    clearCinemaTimers();document.body.classList.remove("cinema-mode");controller.classList.add("hidden");
    cinemaPaused=false;document.getElementById("cinemaProgressBar").style.width="0%";
  }
  function moveCinema(delta){cinemaIndex=Math.max(0,Math.min(22,cinemaIndex+delta));runCinemaFrame();}
  document.getElementById("cinemaHub").addEventListener("click",startCinema);
  document.getElementById("cinemaStop").addEventListener("click",stopCinema);
  document.getElementById("cinemaPrev").addEventListener("click",()=>moveCinema(-1));
  document.getElementById("cinemaNext").addEventListener("click",()=>moveCinema(1));
  document.getElementById("cinemaPause").addEventListener("click",()=>{
    cinemaPaused=!cinemaPaused;
    document.getElementById("cinemaPause").textContent=cinemaPaused?"▶":"Ⅱ";
    if(cinemaPaused)clearCinemaTimers();else runCinemaFrame();
  });

  // Rare event: exactly a 1/23 chance on a genuine scene change, max once per session.
  let rareThisSession=false,lastActive="";
  const rareMessages=[
    ["✦","Evento improbable","Acabas de activar una casualidad 1 entre 23.","No desbloquea nada importante. Precisamente por eso es especial."],
    ["☾","Pequeña anomalía","Esta pantalla ha decidido comportarse diferente hoy.","Probabilidad oficial: 1/23. Probabilidad de que el cálculo impresione a alguien: menor."],
    ["◇","Momento raro","El azar se acordó de pasar por aquí.","Puedes fingir que estaba preparado desde el principio."],
    ["♡","Casualidad bonita","Entre 23 posibilidades ha salido esta.","Guárdala como una de esas pequeñas cosas que aparecen sin avisar."]
  ];
  function activeSceneChanged(){
    const active=scenes.find(s=>s.classList.contains("active"));if(!active)return;
    const id=active.dataset.sceneId;if(id===lastActive)return;lastActive=id;
    if(rareThisSession||document.body.classList.contains("cinema-mode"))return;
    if(Math.floor(Math.random()*23)!==22)return;
    rareThisSession=true;state.rareSeen+=1;save();
    const msg=rareMessages[Math.floor(Math.random()*rareMessages.length)];
    const overlay=document.createElement("div");overlay.className="rare-event";
    overlay.innerHTML='<div class="rare-event-card"><span class="rare-symbol">'+msg[0]+'</span><small>'+msg[1]+'</small><strong>'+msg[2]+'</strong><p>'+msg[3]+'</p><button class="secondary" type="button">Vale, ha sido raro</button></div>';
    document.body.appendChild(overlay);
    overlay.querySelector("button").addEventListener("click",()=>overlay.remove());
  }
  scenes.forEach(s=>new MutationObserver(activeSceneChanged).observe(s,{attributes:true,attributeFilter:["class"]}));
  activeSceneChanged();

  // Final statistics, computed from all persistent modules.
  function parse(k,fallback={}){try{return JSON.parse(localStorage.getItem(k))||fallback;}catch{return fallback;}}
  function buildStats(){
    const exploration=parse("miranda-exploration-v1",{achievements:[]});
    const chapters=parse("miranda-23-details-v1",{found:[]});
    const micro=parse("miranda-microdetails-v1",{visited:[],tokens:[]});
    const plans=parse("miranda-plans-v1",{plans:[]});
    const special=parse("miranda-special-v1",{bingo:[]});
    const ultimate=parse("miranda-ultimate-v1",{visits:0});
    const achievements=Array.isArray(exploration.achievements)?exploration.achievements.length:0;
    const details=Array.isArray(chapters.found)?chapters.found.length:0;
    const visited=Array.isArray(micro.visited)?micro.visited.length:0;
    const tokens=Array.isArray(micro.tokens)?micro.tokens.length:0;
    const planList=Array.isArray(plans.plans)?plans.plans:[];
    const donePlans=planList.filter(p=>p.status==="done").length;
    const scheduled=planList.filter(p=>p.status==="scheduled").length;
    const bingo=Array.isArray(special.bingo)?special.bingo.length:0;
    return {achievements,details,visited,tokens,plans:planList.length,donePlans,scheduled,bingo,visits:Number(ultimate.visits)||0,favorites:state.favorites.length,days:state.days.length,rare:state.rareSeen,cinema:state.cinemaRuns};
  }
  const finale=document.querySelector('[data-scene-id="finale"] #finalContent');
  const statsBox=document.createElement("div");statsBox.className="final-stats";statsBox.id="finalStats";
  const restart=document.getElementById("restartButton");restart?.insertAdjacentElement("beforebegin",statsBox);
  function renderStats(){
    const s=buildStats();
    const scoreParts=[s.visited+"/23 capítulos visitados",s.details+"/23 detalles",s.achievements+"/16 logros",s.tokens+"/5 mini secretos"];
    statsBox.innerHTML='<div class="final-stats-head"><div><small>Resumen de la aventura</small><strong>Tu recorrido por la Edición 23</strong></div><span>'+s.days+' día(s) distinto(s)</span></div>'+
      '<div class="final-stats-grid">'+
        '<div class="final-stat"><strong>'+s.visited+'</strong><small>capítulos visitados</small></div>'+
        '<div class="final-stat"><strong>'+s.achievements+'</strong><small>logros conseguidos</small></div>'+
        '<div class="final-stat"><strong>'+s.favorites+'</strong><small>capítulos favoritos</small></div>'+
        '<div class="final-stat"><strong>'+s.plans+'</strong><small>planes guardados</small></div>'+
        '<div class="final-stat"><strong>'+s.details+'</strong><small>detalles 23/23</small></div>'+
        '<div class="final-stat"><strong>'+s.tokens+'</strong><small>mini secretos</small></div>'+
        '<div class="final-stat"><strong>'+s.scheduled+'</strong><small>planes con fecha</small></div>'+
        '<div class="final-stat"><strong>'+s.donePlans+'</strong><small>planes realizados</small></div>'+
      '</div><div class="final-stats-line">'+scoreParts.join(" · ")+'<br><b>'+s.rare+'</b> evento(s) raro(s) encontrado(s) · <b>'+s.cinema+'</b> reproducción(es) en modo cine.</div>';
  }
  renderStats();
  if(finale)new MutationObserver(renderStats).observe(finale,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("storage",renderStats);
})();
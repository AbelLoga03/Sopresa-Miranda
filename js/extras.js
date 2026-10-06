(() => {
  const ACHIEVEMENTS = [
    {id:"easter",name:"Ojo curioso",hint:"Encuentra el easter egg"},
    {id:"stars",name:"Cazadora de estrellas",hint:"Enciende toda la constelación"},
    {id:"scratch",name:"Bajo la superficie",hint:"Descubre la tarjeta secreta"},
    {id:"vault",name:"Llave correcta",hint:"Abre la caja fuerte"},
    {id:"doors",name:"Tres caminos",hint:"Abre las tres puertas"},
    {id:"mood",name:"Para cada momento",hint:"Elige un estado de ánimo"},
    {id:"explorer",name:"Exploradora",hint:"Desbloquea el archivo secreto"},
    {id:"puzzle",name:"Pieza a pieza",hint:"Completa el puzzle"},
    {id:"bingo",name:"Lista completa",hint:"Completa el bingo"},
    {id:"credits",name:"Hasta los créditos",hint:"Reproduce los créditos finales"},
    {id:"forbidden",name:"No sabes obedecer",hint:"Pulsa lo que no debías"}
  ];

  const DAILY = [
    "Un día normal puede acabar siendo uno de los recuerdos favoritos.",
    "Hoy también cuenta como parte de la historia.",
    "Las mejores cosas suelen estar en los pequeños detalles.",
    "Todavía quedan muchas fotos que no existen.",
    "Un recuerdo bonito no necesita ser perfecto.",
    "Hay sitios que se vuelven especiales por la persona que estaba contigo.",
    "Esta web cambiará mucho cuando tenga vuestra historia de verdad."
  ];

  const MOODS = {
    happy:"Entonces guarda este momento. Los días buenos también merecen recordarse.",
    tired:"Hoy toca un plan tranquilo: descansar, algo rico y cero prisas.",
    bored:"Buen momento para usar la ruleta de planes y dejar que decida por vosotros.",
    blue:"Aquí pondremos algo que pueda sacarte una sonrisa cuando el día no acompañe."
  };

  const key = "miranda-exploration-v1";
  let state;
  try { state = JSON.parse(localStorage.getItem(key)) || {}; } catch { state = {}; }
  state.achievements = Array.isArray(state.achievements) ? state.achievements : [];
  state.stars = Array.isArray(state.stars) ? state.stars : [];
  state.doors = Array.isArray(state.doors) ? state.doors : [];

  function save(){ try { localStorage.setItem(key,JSON.stringify(state)); } catch {} }
  function has(id){ return state.achievements.includes(id); }

  const toast=document.createElement("div");
  toast.className="achievement-toast";
  toast.setAttribute("aria-live","polite");
  document.body.appendChild(toast);
  let toastTimer;
  function notify(text){
    toast.textContent="✦ Logro: "+text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove("show"),2200);
  }

  function unlock(id){
    if(has(id)) return;
    const item=ACHIEVEMENTS.find(x=>x.id===id);
    if(!item) return;
    state.achievements.push(id); save(); renderProgress(); notify(item.name);
    if(state.achievements.length>=7 && !has("explorer")){
      state.achievements.push("explorer"); save(); renderProgress(); notify("Archivo secreto desbloqueado");
    }
  }

  const panel=document.getElementById("explorePanel");
  const toggle=document.getElementById("exploreToggle");
  document.getElementById("exploreClose").addEventListener("click",()=>{panel.classList.add("hidden");toggle.setAttribute("aria-expanded","false");});
  toggle.addEventListener("click",()=>{
    const opening=panel.classList.contains("hidden");
    panel.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded",String(opening));
  });

  function renderProgress(){
    const count=state.achievements.length;
    document.getElementById("exploreCounter").textContent=count+" / "+ACHIEVEMENTS.length;
    document.getElementById("secretProgressBar").style.width=(count/ACHIEVEMENTS.length*100)+"%";
    document.getElementById("secretProgressText").textContent=count>=5?"El archivo secreto ya puede abrirse.":"Encuentra secretos y completa pequeñas misiones.";
    const grid=document.getElementById("badgeGrid");
    grid.innerHTML="";
    ACHIEVEMENTS.forEach(a=>{
      const div=document.createElement("div");
      div.className="badge "+(has(a.id)?"unlocked":"");
      div.innerHTML="<strong>"+a.name+"</strong>"+(has(a.id)?"Descubierto":a.hint);
      grid.appendChild(div);
    });
    const archiveBtn=document.getElementById("archiveButton");
    const archiveStatus=document.getElementById("archiveStatus");
    if(archiveBtn){
      const ok=state.achievements.length>=7;
      archiveBtn.disabled=!ok;
      archiveBtn.textContent=ok?"Abrir archivo":"Necesitas 7 logros";
      archiveStatus.textContent=ok?"Disponible":"Bloqueado";
    }
  }
  renderProgress();

  // Greeting + memory of the day
  const hour=new Date().getHours();
  document.getElementById("timeGreeting").textContent=hour<12?"Buenos días ✦":hour<20?"Buenas tardes ✦":"Buenas noches ✦";
  const epochDay=Math.floor(Date.now()/86400000);
  document.getElementById("dailyMemory").textContent=DAILY[epochDay%DAILY.length];

  // Hook into original easter egg modal.
  const secretModal=document.getElementById("secretModal");
  if(secretModal){
    const obs=new MutationObserver(()=>{ if(!secretModal.classList.contains("hidden")) unlock("easter"); });
    obs.observe(secretModal,{attributes:true,attributeFilter:["class"]});
  }

  // Constellation discovery
  const stars=[...document.querySelectorAll(".constellation-star")];
  stars.forEach((star,index)=>{
    if(state.stars.includes(index)) star.classList.add("discovered");
    star.addEventListener("click",()=>{
      if(!state.stars.includes(index)){state.stars.push(index);save();}
      star.classList.add("discovered");
      if(state.stars.length>=stars.length){
        document.getElementById("constellation").classList.add("complete");
        document.getElementById("constellationReveal").innerHTML='Has encendido todas las estrellas.<div class="secret-word">M ✦ A</div>';
        unlock("stars");
      }
    });
  });
  if(state.stars.length>=stars.length) document.getElementById("constellation").classList.add("complete");

  // Scratch card
  const canvas=document.getElementById("scratchCanvas");
  const stage=document.getElementById("scratchStage");
  const ctx=canvas.getContext("2d");
  let scratching=false, scratched=0;
  function setupCanvas(){
    const r=stage.getBoundingClientRect();
    if (r.width < 20 || r.height < 20) return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.floor(r.width*dpr));
    canvas.height=Math.max(1,Math.floor(r.height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.globalCompositeOperation="source-over";
    ctx.fillStyle="#77656e";
    ctx.fillRect(0,0,r.width,r.height);
    ctx.fillStyle="rgba(255,255,255,.65)";
    ctx.font="600 16px Inter, sans-serif";
    ctx.textAlign="center";
    ctx.fillText("Rasca aquí ✦",r.width/2,r.height/2);
    ctx.globalCompositeOperation="destination-out";
  }
  function scratch(e){
    if(!scratching)return;
    const r=canvas.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    ctx.beginPath();ctx.arc(x,y,24,0,Math.PI*2);ctx.fill();
    scratched++;
    if(scratched>35){canvas.style.opacity=".18";unlock("scratch");}
  }
  setupCanvas();
  const secretScene=document.querySelector('[data-scene-id="secrets"]');
  if(secretScene){
    const sceneObserver=new MutationObserver(()=>{
      if(secretScene.classList.contains("active") && !has("scratch")) requestAnimationFrame(setupCanvas);
    });
    sceneObserver.observe(secretScene,{attributes:true,attributeFilter:["class"]});
  }
  window.addEventListener("resize",()=>{if(!has("scratch"))setupCanvas();});
  canvas.addEventListener("pointerdown",e=>{scratching=true;canvas.setPointerCapture(e.pointerId);scratch(e);});
  canvas.addEventListener("pointermove",scratch);
  canvas.addEventListener("pointerup",()=>scratching=false);
  canvas.addEventListener("pointercancel",()=>scratching=false);
  document.getElementById("scratchReveal").addEventListener("click",()=>{canvas.style.opacity="0";canvas.style.pointerEvents="none";unlock("scratch");});
  if(has("scratch")){canvas.style.opacity="0";canvas.style.pointerEvents="none";}

  // Vault
  document.getElementById("vaultButton").addEventListener("click",()=>{
    const value=document.getElementById("vaultInput").value.trim().toLowerCase();
    const result=document.getElementById("vaultResult");
    if(value==="miranda"){
      result.textContent="Abierta ✦ Aquí podremos esconder un mensaje especial.";
      unlock("vault");
    }else result.textContent="Esa no era la llave. Prueba con la pista.";
  });
  document.getElementById("vaultInput").addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("vaultButton").click();});

  // Doors
  const doors=[...document.querySelectorAll(".door-card")];
  doors.forEach((door,index)=>{
    if(state.doors.includes(index))door.classList.add("opened");
    door.addEventListener("click",()=>{
      door.classList.add("opened");
      document.getElementById("doorReveal").textContent=door.dataset.door;
      if(!state.doors.includes(index)){state.doors.push(index);save();}
      if(state.doors.length>=doors.length)unlock("doors");
    });
  });

  // Mood
  document.querySelectorAll(".mood-card").forEach(card=>{
    card.addEventListener("click",()=>{
      document.querySelectorAll(".mood-card").forEach(x=>x.classList.remove("active"));
      card.classList.add("active");
      document.querySelector("#moodMessage p").textContent=MOODS[card.dataset.mood]||"Aquí irá un mensaje especial.";
      unlock("mood");
    });
  });

  // Secret archive
  document.getElementById("archiveButton").addEventListener("click",()=>{
    if(state.achievements.length<7)return;
    document.getElementById("archiveContent").classList.remove("hidden");
    document.getElementById("archiveLock").classList.add("hidden");
    unlock("explorer");
  });

  // Track extra exploration through existing interactions.
  document.querySelectorAll(".open-when").forEach(x=>x.addEventListener("click",()=>{state.openedEnvelope=true;save();}));
  document.getElementById("spinPlan").addEventListener("click",()=>{state.usedWheel=true;save();});

  window.mirandaUnlock = unlock;
  window.mirandaRenderProgress = renderProgress;
  window.mirandaExplorationState = state;
  renderProgress();
})();
(() => {
  const KEY="miranda-ultimate-v1";
  let state;
  try{state=JSON.parse(localStorage.getItem(KEY))||{};}catch{state={};}
  state.visits=Number(state.visits)||0;
  state.choice=state.choice||null;
  state.eras=Array.isArray(state.eras)?state.eras:[];
  state.compareSeen=Array.isArray(state.compareSeen)?state.compareSeen:[];
  state.visits+=1;
  state.lastVisit=new Date().toISOString();
  try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
  const unlock=id=>{if(window.mirandaUnlock)window.mirandaUnlock(id);};

  // Returning visitor + time based appearance.
  const hour=new Date().getHours();
  if(hour>=21 || hour<6)document.body.classList.add("night-mode");
  const introLead=document.querySelector('[data-scene-id="intro"] .lead');
  if(introLead && state.visits>1){
    const note=document.createElement("div");
    note.className="returning-note";
    note.textContent=state.visits===2?"Sabía que volverías ✦":"Has vuelto "+state.visits+" veces. Algunos detalles cambian con el tiempo.";
    introLead.insertAdjacentElement("afterend",note);
  }

  // Choices that subtly alter the ending.
  const choiceMessages={
    past:"Elegiste volver atrás. Al final aparecerá una referencia a todo lo que ya habéis vivido.",
    present:"Elegiste el presente. El final recordará que no todo tiene que esperar al futuro.",
    future:"Elegiste mirar hacia delante. El final tendrá un pequeño guiño a todo lo que aún queda por hacer."
  };
  document.querySelectorAll(".choice-card").forEach(card=>{
    if(card.dataset.choice===state.choice)card.classList.add("selected");
    card.addEventListener("click",()=>{
      state.choice=card.dataset.choice;save();
      document.querySelectorAll(".choice-card").forEach(x=>x.classList.remove("selected"));
      card.classList.add("selected");
      document.getElementById("choiceResult").textContent=choiceMessages[state.choice];
      unlock("choice");
      tailorEnding();
    });
  });
  if(state.choice)document.getElementById("choiceResult").textContent=choiceMessages[state.choice];

  // Time machine.
  const eraText={
    beginning:"El comienzo guardará la primera fecha, la primera foto y cómo empezó todo.",
    moments:"Aquí aparecerán pequeñas escenas: una salida, una conversación, una risa o un sitio especial.",
    today:"Este capítulo cambia con el presente: lo que sois ahora mismo.",
    future:"Una página que todavía está en blanco para llenarla con próximos planes."
  };
  let dialTurns=0;
  document.querySelectorAll(".time-controls button").forEach((button,index)=>{
    if(state.eras.includes(button.dataset.era))button.classList.add("visited");
    button.addEventListener("click",()=>{
      document.querySelectorAll(".time-controls button").forEach(x=>x.classList.remove("active"));
      button.classList.add("active");
      document.getElementById("timeOutput").textContent=eraText[button.dataset.era];
      dialTurns+=95+index*35;
      document.getElementById("timeDial").style.transform="rotate("+dialTurns+"deg)";
      if(!state.eras.includes(button.dataset.era)){state.eras.push(button.dataset.era);save();}
      if(state.eras.length>=4)unlock("timetravel");
    });
  });

  // Time/date/progress capsules.
  const forcedBirthday=localStorage.getItem("miranda-force-birthday")==="1";
  const now=new Date();
  const birthdayOpen=forcedBirthday || (now.getMonth()===4 && now.getDate()===17);
  const nightOpen=hour>=21 || hour<6;
  const progressOpen=()=>((window.mirandaExplorationState?.achievements||[]).length>=7);
  const capsules=[
    {id:"birthdayCapsule",status:"birthdayCapsuleStatus",open:()=>birthdayOpen,message:"17 de mayo ✦ Esta cápsula puede contener el mensaje que solo aparece el día de su cumpleaños."},
    {id:"nightCapsule",status:"nightCapsuleStatus",open:()=>nightOpen,message:"Cápsula nocturna abierta ☾ Perfecta para una foto, audio o frase que solo aparezca por la noche."},
    {id:"achievementCapsule",status:"achievementCapsuleStatus",open:progressOpen,message:"Has explorado suficiente ✦ Aquí irá una recompensa por encontrar tantos secretos."}
  ];
  function refreshCapsules(){
    capsules.forEach(c=>{
      const b=document.getElementById(c.id),s=document.getElementById(c.status);
      const open=c.open();
      b?.classList.toggle("openable",open);
      if(s)s.textContent=open?"Disponible":"Bloqueada";
    });
  }
  capsules.forEach(c=>document.getElementById(c.id)?.addEventListener("click",()=>{
    if(!c.open()){document.getElementById("capsuleReveal").textContent="Todavía no se cumple la condición para abrir esta cápsula.";return;}
    document.getElementById("capsuleReveal").textContent=c.message;
    unlock("capsule");
  }));
  refreshCapsules();
  const exploreCounter=document.getElementById("exploreCounter");
  if(exploreCounter)new MutationObserver(()=>{refreshCapsules();checkLegendary();updateMystery();renderHistory();}).observe(exploreCounter,{childList:true,subtree:true});

  // Memory matching game.
  const icons=["♡","✦","☾","☀"];
  let deck=[],first=null,lock=false,moves=0,pairs=0;
  const board=document.getElementById("memoryBoard");
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function renderMemory(){
    if(!board)return;
    deck=shuffle([...icons,...icons].map((icon,i)=>({icon,id:i,matched:false})));
    first=null;lock=false;moves=0;pairs=0;board.innerHTML="";
    document.getElementById("memoryMoves").textContent="0 movimientos";
    document.getElementById("memoryPairs").textContent="0 / 4 parejas";
    deck.forEach((item,index)=>{
      const b=document.createElement("button");
      b.type="button";b.className="memory-card-game";b.textContent=item.icon;b.dataset.index=index;
      b.addEventListener("click",()=>flipMemory(b,item));
      board.appendChild(b);
    });
  }
  function flipMemory(button,item){
    if(lock||item.matched||button===first?.button||button.classList.contains("flipped"))return;
    button.classList.add("flipped");
    if(!first){first={button,item};return;}
    moves++;document.getElementById("memoryMoves").textContent=moves+" movimientos";
    if(first.item.icon===item.icon){
      first.item.matched=item.matched=true;
      first.button.classList.add("matched");button.classList.add("matched");
      pairs++;document.getElementById("memoryPairs").textContent=pairs+" / 4 parejas";
      first=null;
      if(pairs===4)unlock("memorygame");
    }else{
      lock=true;
      setTimeout(()=>{first.button.classList.remove("flipped");button.classList.remove("flipped");first=null;lock=false;},650);
    }
  }
  document.getElementById("memoryReset")?.addEventListener("click",renderMemory);
  renderMemory();

  // Before/after interactive comparison.
  const slider=document.getElementById("compareSlider");
  function applyCompare(){
    if(!slider)return;
    const v=Number(slider.value);
    document.getElementById("compareOverlay").style.width=v+"%";
    document.getElementById("compareLine").style.left=v+"%";
    if(v<=8 && !state.compareSeen.includes("before")){state.compareSeen.push("before");save();}
    if(v>=92 && !state.compareSeen.includes("after")){state.compareSeen.push("after");save();}
    if(state.compareSeen.length>=2)unlock("compare");
  }
  slider?.addEventListener("input",applyCompare);applyCompare();

  // Achievement history + mystery reveal.
  function renderHistory(){
    const box=document.getElementById("achievementHistory");
    const hist=window.mirandaExplorationState?.history||[];
    if(!box)return;
    const recent=hist.slice(-5).reverse();
    box.innerHTML=recent.length?'<span class="history-title">Últimos logros</span>'+recent.map(h=>{
      const d=new Date(h.at);const w=Number.isNaN(d.getTime())?"":d.toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
      return '<div class="history-item"><strong>'+h.name+'</strong><small>'+w+'</small></div>';
    }).join(""):'<span class="history-title">Los logros que encuentre aparecerán aquí.</span>';
  }
  function updateMystery(){
    const target=document.querySelector(".photo-card:last-child .photo-placeholder");
    if(!target)return;
    const total=(window.mirandaAchievementIds||[]).length||16;
    const count=(window.mirandaExplorationState?.achievements||[]).length;
    const ratio=Math.min(1,count/total);
    target.style.filter="blur("+(10*(1-ratio))+"px)";
    target.style.transition="filter .5s ease";
  }
  renderHistory();updateMystery();

  // Alternate final for full completion.
  function tailorEnding(){
    const p=document.querySelector("#legendaryEnding p");
    if(!p)return;
    if(state.choice==="past")p.textContent="Elegiste mirar atrás, encontraste todos los secretos y llegaste hasta aquí. Todo lo vivido también forma parte del regalo.";
    else if(state.choice==="present")p.textContent="Elegiste quedarte en el presente y aun así descubriste todo. A veces el mejor capítulo es el que está pasando ahora.";
    else if(state.choice==="future")p.textContent="Elegiste mirar al futuro y completaste cada secreto. Este final apunta a todo lo que todavía queda por vivir.";
  }
  function checkLegendary(){
    const ids=window.mirandaAchievementIds||[];
    const got=window.mirandaExplorationState?.achievements||[];
    const complete=ids.length>0 && ids.every(id=>got.includes(id));
    document.getElementById("legendaryEnding")?.classList.toggle("hidden",!complete);
    if(complete){
      const msg=document.getElementById("completionMessage");
      if(msg)msg.textContent="Has encontrado todos los secretos de la página.";
      tailorEnding();
    }
  }
  checkLegendary();tailorEnding();

  // Developer panel: only with ?dev=1.
  const params=new URLSearchParams(location.search);
  if(params.get("dev")==="1"){
    const toggle=document.getElementById("devToggle"),panel=document.getElementById("devPanel");
    toggle?.classList.remove("hidden");
    toggle?.addEventListener("click",()=>panel?.classList.toggle("hidden"));
    document.getElementById("devClose")?.addEventListener("click",()=>panel?.classList.add("hidden"));
    const birthdayBtn=document.getElementById("devBirthday");
    if(birthdayBtn)birthdayBtn.textContent=forcedBirthday?"Desactivar cumpleaños":"Simular cumpleaños";
    birthdayBtn?.addEventListener("click",()=>{
      localStorage.setItem("miranda-force-birthday",forcedBirthday?"0":"1");
      location.reload();
    });
    document.getElementById("devUnlock")?.addEventListener("click",()=>{
      (window.mirandaAchievementIds||[]).forEach(id=>window.mirandaUnlock?.(id));
      setTimeout(()=>{checkLegendary();refreshCapsules();},50);
    });
    document.getElementById("devFinal")?.addEventListener("click",()=>{
      if(window.mirandaShowScene&&window.mirandaScenes)window.mirandaShowScene(window.mirandaScenes.length-1);
    });
    document.getElementById("devReset")?.addEventListener("click",async()=>{
      ["miranda-exploration-v1","miranda-special-v1","miranda-ultimate-v1","miranda-force-birthday","miranda-plans-v1","miranda-23-details-v1","miranda-microdetails-v1","miranda-features-v1"].forEach(k=>localStorage.removeItem(k));
      if("caches" in window){try{for(const k of await caches.keys())await caches.delete(k);}catch{}}
      if("serviceWorker" in navigator){try{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();}catch{}}
      location.reload();
    });
  }
})();
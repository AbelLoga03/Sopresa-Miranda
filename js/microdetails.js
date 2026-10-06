(() => {
  const KEY="miranda-microdetails-v1";
  let state;
  try{state=JSON.parse(localStorage.getItem(KEY))||{};}catch{state={};}
  state.visited=Array.isArray(state.visited)?state.visited:[];
  state.tokens=Array.isArray(state.tokens)?state.tokens:[];
  state.footerClicks=Number(state.footerClicks)||0;
  state.editionTaps=Number(state.editionTaps)||0;
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};

  const scenes=[...document.querySelectorAll(".scene")];
  if(scenes.length!==23)return;

  // 23 tiny stars: one for each chapter.
  const dust=document.createElement("div");
  dust.className="micro-dust";
  for(let i=0;i<23;i++){
    const s=document.createElement("span");
    s.className="micro-dust-star";
    s.textContent=i%4===0?"✧":"·";
    s.style.left=(3+((i*37)%94))+"%";
    s.style.top=(5+((i*53)%88))+"%";
    s.style.setProperty("--twinkle",(3.7+(i%6)*.55)+"s");
    s.style.animationDelay=(-i*.31)+"s";
    dust.appendChild(s);
  }
  document.body.prepend(dust);

  // 23-dot navigation strip.
  const topbar=document.querySelector(".topbar");
  const strip=document.createElement("div");
  strip.className="micro-chapter-strip";
  strip.setAttribute("aria-label","Navegación rápida por los 23 capítulos");
  scenes.forEach((scene,index)=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="micro-chapter-dot";
    b.dataset.sceneId=scene.dataset.sceneId||String(index);
    b.dataset.sceneIndex=String(index);
    b.title=(index+1)+"/23 · "+(scene.dataset.originalTitle||scene.dataset.title||"Capítulo");
    b.setAttribute("aria-label",b.title);
    b.addEventListener("click",()=>window.mirandaShowScene?.(index));
    strip.appendChild(b);

    if(!scene.querySelector(".micro-visited-stamp")){
      const stamp=document.createElement("span");
      stamp.className="micro-visited-stamp";
      stamp.textContent=String(index+1).padStart(2,"0")+" / 23";
      scene.appendChild(stamp);
    }
  });
  topbar?.appendChild(strip);

  function chapterState(){
    let chapterDetails={found:[]};
    try{chapterDetails=JSON.parse(localStorage.getItem("miranda-23-details-v1"))||chapterDetails;}catch{}
    const found=Array.isArray(chapterDetails.found)?chapterDetails.found:[];
    const dots=[...strip.querySelectorAll(".micro-chapter-dot")];
    dots.forEach((dot,index)=>{
      const id=dot.dataset.sceneId;
      dot.classList.toggle("visited",state.visited.includes(id));
      dot.classList.toggle("discovered",found.includes(id));
      dot.classList.toggle("current",scenes[index].classList.contains("active"));
    });
  }

  function markActive(){
    scenes.forEach(scene=>{
      if(!scene.classList.contains("active"))return;
      const id=scene.dataset.sceneId;
      if(!state.visited.includes(id)){state.visited.push(id);save();}
    });
    chapterState();
  }
  scenes.forEach(scene=>new MutationObserver(markActive).observe(scene,{attributes:true,attributeFilter:["class"]}));
  markActive();

  // Keep dot states synced when chapter details are collected.
  const detailCounter=document.getElementById("chapterCollectCount");
  if(detailCounter)new MutationObserver(chapterState).observe(detailCounter,{childList:true,subtree:true});

  // A small deterministic "seal of the day".
  const seals=["día de descubrir algo","modo curiosidad","sello de buena idea","capítulo abierto","día de plan improvisado","edición especial","modo pequeña sorpresa"];
  const now=new Date();
  const daySeed=Number(String(now.getFullYear())+String(now.getMonth()+1).padStart(2,"0")+String(now.getDate()).padStart(2,"0"));
  const intro=scenes[0];
  if(intro && !intro.querySelector(".daily-seal")){
    const seal=document.createElement("div");
    seal.className="daily-seal";
    seal.innerHTML='<span>✦</span> Sello del día: '+seals[daySeed%seals.length];
    const countdown=intro.querySelector(".countdown-card");
    countdown?.insertAdjacentElement("afterend",seal);
  }

  // Extra countdown detail: weekends until next 17 May.
  function nextBirthday(){
    const n=new Date();
    let y=n.getFullYear();
    let d=new Date(y,4,17,0,0,0);
    if(n>d && !(n.getMonth()===4&&n.getDate()===17))d=new Date(y+1,4,17,0,0,0);
    return d;
  }
  function weekendCountUntil(target){
    const start=new Date();start.setHours(0,0,0,0);
    let count=0;
    const d=new Date(start);
    while(d<target){
      if(d.getDay()===6)count++;
      d.setDate(d.getDate()+1);
      if(count>60)break;
    }
    return count;
  }
  const countdownMsg=document.getElementById("countdownMessage");
  if(countdownMsg && !document.getElementById("countdownExtra")){
    const extra=document.createElement("p");
    extra.className="countdown-extra";extra.id="countdownExtra";
    const birthdayToday=now.getMonth()===4&&now.getDate()===17;
    extra.textContent=birthdayToday?"Hoy no hacen falta cálculos extra ✦":"Quedan aproximadamente "+weekendCountUntil(nextBirthday())+" fines de semana.";
    countdownMsg.insertAdjacentElement("afterend",extra);
  }

  // Five hidden micro-tokens across the experience.
  const tokenDefs=[
    {scene:"timeline",symbol:"◇",cls:"t1",name:"fragmento 1"},
    {scene:"gallery",symbol:"✦",cls:"t2",name:"fragmento 2"},
    {scene:"future",symbol:"☀",cls:"t3",name:"fragmento 3"},
    {scene:"doors",symbol:"☾",cls:"t4",name:"fragmento 4"},
    {scene:"beforeafter",symbol:"♡",cls:"t5",name:"fragmento 5"}
  ];

  const tokenProgress=document.createElement("div");
  tokenProgress.className="micro-secret-progress";
  document.body.appendChild(tokenProgress);

  function updateTokens(){
    tokenProgress.innerHTML='Mini secreto <strong>'+state.tokens.length+' / 5</strong>';
    document.querySelectorAll(".micro-token").forEach(t=>t.classList.toggle("found",state.tokens.includes(t.dataset.token)));
  }

  function toast(text){
    let t=document.querySelector(".micro-toast");
    if(!t){t=document.createElement("div");t.className="micro-toast";document.body.appendChild(t);}
    t.innerHTML=text;t.classList.add("show");
    clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2300);
  }

  function showTokenComplete(){
    if(document.querySelector(".micro-complete-card"))return;
    const overlay=document.createElement("div");
    overlay.className="micro-complete-card";
    overlay.innerHTML='<div class="micro-complete-inner"><div class="symbol">✦</div><small>Mini secreto completado</small><strong>5 pequeños detalles encontrados</strong><p>23 años, 23 capítulos y todavía quedan historias por añadir. Este rincón solo aparece si miras donde normalmente nadie mira.</p><button class="secondary" type="button">Seguir explorando</button></div>';
    document.body.appendChild(overlay);
    overlay.querySelector("button").addEventListener("click",()=>overlay.remove());
    overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
  }

  tokenDefs.forEach((def,index)=>{
    const scene=document.querySelector('[data-scene-id="'+def.scene+'"]');
    if(!scene)return;
    const b=document.createElement("button");
    b.type="button";
    b.className="micro-token "+def.cls;
    b.dataset.token=def.scene;
    b.textContent=def.symbol;
    b.title="¿Esto estaba aquí antes?";
    b.setAttribute("aria-label","Pequeño secreto escondido");
    b.addEventListener("click",()=>{
      if(!state.tokens.includes(def.scene)){
        state.tokens.push(def.scene);save();updateTokens();
        toast("<strong>Mini secreto "+state.tokens.length+"/5</strong> · Has encontrado "+def.name+".");
        if(state.tokens.length===5)setTimeout(showTokenComplete,350);
      }else{
        toast("Este mini secreto ya estaba encontrado ✦");
      }
    });
    scene.appendChild(b);
  });
  updateTokens();

  // Footer star reacts to curiosity.
  const footerSpans=[...document.querySelectorAll("footer span")];
  const footerStar=footerSpans.find(s=>s.textContent.trim()==="✦")||footerSpans.at(-1);
  const footerMessages=[
    "Sí, hasta el pie de página tenía algo escondido.",
    "Has vuelto a pulsar. Investigación de campo impecable.",
    "No hay botón inútil si consigue sacar una sonrisa.",
    "Dato técnico: este botón sigue sin tener una función importante.",
    "Vale, premio por insistencia: ✦ +1 punto imaginario."
  ];
  if(footerStar){
    footerStar.classList.add("footer-secret");
    footerStar.title="Parece decorativo...";
    footerStar.addEventListener("click",()=>{
      state.footerClicks+=1;save();
      toast(footerMessages[Math.min(state.footerClicks-1,footerMessages.length-1)]);
    });
  }

  // 23 taps on the large "23" unlock a deliberately silly easter egg.
  const editionNumber=document.querySelector(".edition-23 strong");
  const tapCounter=document.createElement("div");
  tapCounter.className="tap-23-counter";
  document.body.appendChild(tapCounter);
  let tapTimer=null;
  if(editionNumber){
    editionNumber.style.cursor="pointer";
    editionNumber.title="El número 23 parece sospechosamente pulsable";
    editionNumber.addEventListener("click",()=>{
      state.editionTaps=(state.editionTaps%23)+1;save();
      tapCounter.textContent=state.editionTaps+" / 23";
      tapCounter.classList.add("show");
      clearTimeout(tapTimer);tapTimer=setTimeout(()=>tapCounter.classList.remove("show"),1000);
      if(state.editionTaps===23){
        state.editionTaps=0;save();
        toast("<strong>23 pulsaciones.</strong> Confirmado: tienes más paciencia de la prevista.");
        miniFireworks();
      }
    });
  }

  function miniFireworks(){
    for(let i=0;i<23;i++){
      const s=document.createElement("span");
      s.className="chapter-mini-spark";
      s.textContent=["✦","✧","·"][i%3];
      s.style.left=(30+Math.random()*40)+"vw";
      s.style.top=(30+Math.random()*35)+"vh";
      s.style.fontSize=(.65+Math.random()*.8)+"rem";
      document.body.appendChild(s);
      setTimeout(()=>s.remove(),1300);
    }
  }

  // Make ambient detail strength reflect achievement progress.
  const achievementCounter=document.getElementById("exploreCounter");
  function progressAtmosphere(){
    const txt=achievementCounter?.textContent||"0 / 16";
    const count=parseInt(txt,10)||0;
    const ratio=Math.min(1,count/16);
    dust.style.opacity=String(.55+ratio*.45);
    document.documentElement.style.setProperty("--micro-progress",String(ratio));
  }
  if(achievementCounter)new MutationObserver(progressAtmosphere).observe(achievementCounter,{childList:true,subtree:true});
  progressAtmosphere();
})();
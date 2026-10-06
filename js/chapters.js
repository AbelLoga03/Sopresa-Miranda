(() => {
  const KEY="miranda-23-details-v1";
  let state;
  try{state=JSON.parse(localStorage.getItem(KEY))||{};}catch{state={};}
  state.found=Array.isArray(state.found)?state.found:[];
  state.favorites=Array.isArray(state.favorites)?state.favorites:[];
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};

  const chapters=[
    {id:"intro",title:"La regla número uno",desc:"Un comienzo necesita una norma absurda para ser oficial.",action:"Leer la norma",fun:"Prohibido recorrer esta web con prisas. Penalización: volver al capítulo 1."},
    {id:"timeline",title:"Detector de nostalgia",desc:"Un botón científicamente no científico para decidir si este capítulo merece una foto real.",action:"Activar detector",fun:"Nivel de nostalgia detectado: sospechosamente alto."},
    {id:"constellation",title:"Pedir un deseo",desc:"Una estrella extra para algo que todavía no ha pasado.",action:"Pedir deseo",fun:"Deseo guardado. El universo no ofrece número de seguimiento."},
    {id:"gallery",title:"La favorita provisional",desc:"Hasta que pongamos fotos reales, podemos entrenar al jurado.",action:"Elegir favorita",fun:"El jurado ha decidido. No admite reclamaciones hasta la próxima pulsación."},
    {id:"quiz",title:"Comodín de emergencia",desc:"Todo gran concurso necesita un comodín que parezca importantísimo.",action:"Usar comodín",fun:"Comodín utilizado: confiar en la primera respuesta que parecía buena."},
    {id:"numbers",title:"La estadística inútil",desc:"Porque cualquier historia mejora con un dato totalmente innecesario.",action:"Calcular dato",fun:"23 años equivalen a muchísimos desayunos. Cálculo revisado por nadie."},
    {id:"reasons",title:"Guardar una favorita",desc:"Marca la razón que más te guste cuando las personalicemos.",action:"Guardar la actual",fun:"Guardada. Las razones favoritas también merecen favoritos."},
    {id:"openwhen",title:"No sé cuál abrir",desc:"Para esos momentos en los que elegir un sobre ya es demasiado trabajo.",action:"Que el azar elija",fun:"El azar ha tomado una decisión ejecutiva."},
    {id:"future",title:"Sellar un plan",desc:"El futuro queda mucho mejor con un pequeño sello simbólico.",action:"Sellar uno",fun:"Plan sellado. Fecha de caducidad: nunca."},
    {id:"plans",title:"Modo cero excusas",desc:"La ruleta ya tiene agenda; este botón simplemente te obliga a girarla.",action:"Girar por mí",fun:"Excusas desactivadas durante aproximadamente 12 segundos."},
    {id:"secrets",title:"Nada sospechoso",desc:"Una zona secreta necesita un botón que claramente no inspire confianza.",action:"No tocar",fun:"Exacto: lo has tocado. Excelente capacidad para seguir instrucciones."},
    {id:"doors",title:"Decisión imposible",desc:"Cuando las tres puertas parecen buena idea, que decida el caos.",action:"Elegir al azar",fun:"El comité de puertas ha emitido su veredicto."},
    {id:"mood",title:"No sé qué poner",desc:"Incluso elegir un estado de ánimo puede necesitar botón aleatorio.",action:"Elegir por mí",fun:"Diagnóstico técnico completado con cero rigor científico."},
    {id:"puzzle",title:"Pista no solicitada",desc:"Una ayuda pequeña para cuando una pieza parece haberse declarado independiente.",action:"Dame una pista",fun:"La casilla vacía termina abajo a la derecha. El resto es paciencia y sospechas."},
    {id:"bingo",title:"Casilla sorpresa",desc:"Si no sabes qué plan marcar, el sistema cometerá la irresponsabilidad por ti.",action:"Marcar sorpresa",fun:"Casilla elegida por una inteligencia con dudoso criterio de ocio."},
    {id:"cinema",title:"Toma 23",desc:"Una película necesita claqueta, aunque la producción sea de presupuesto emocional.",action:"¡Acción!",fun:"Toma 23. Dirección aprueba. Producción pide otra por si acaso."},
    {id:"choices",title:"Que decida el destino",desc:"Tres caminos son demasiados para un martes cualquiera.",action:"Destino, decide",fun:"El destino ha elegido. Cualquier queja debe enviarse al departamento del azar."},
    {id:"timemachine",title:"Salto temporal aleatorio",desc:"No todas las máquinas del tiempo deberían tener un volante.",action:"Saltar",fun:"Viaje completado. Ninguna paradoja detectada... de momento."},
    {id:"capsules",title:"Escáner temporal",desc:"Comprueba qué cápsulas están tramando algo.",action:"Escanear",fun:"Escaneo completo. Algunas cosas siguen bloqueadas porque el tiempo es bastante suyo."},
    {id:"memorygame",title:"Vista privilegiada",desc:"Una ayuda de un segundo. Técnicamente no es hacer trampas si la web lo permite.",action:"Mirar 1 segundo",fun:"Has visto demasiado. Tu memoria es ahora responsabilidad tuya."},
    {id:"beforeafter",title:"Modo demostración",desc:"Deja que el deslizador haga el viaje completo por sí solo.",action:"Comparar solo",fun:"Antes → ahora. Efecto dramático añadido sin coste adicional."},
    {id:"letter",title:"Modo lectura lenta",desc:"Una carta importante merece una pausa antes de seguir.",action:"Activar pausa",fun:"Pausa activada. Este botón no sirve para leer más rápido, justo al contrario."},
    {id:"finale",title:"El capítulo 23",desc:"El último capítulo existe para comprobar si de verdad se exploró todo.",action:"Comprobar 23/23",fun:"El final sabe contar. Sorprendentemente, llegó hasta 23."}
  ];

  const sceneMap=new Map([...document.querySelectorAll(".scene")].map(s=>[s.dataset.sceneId,s]));
  const stepCounter=document.getElementById("stepCounter");
  const collection=document.createElement("span");
  collection.className="chapter-collection";
  collection.innerHTML='Detalles <strong id="chapterCollectCount">0 / 23</strong>';
  stepCounter?.insertAdjacentElement("afterend",collection);

  function updateCount(){
    const el=document.getElementById("chapterCollectCount");
    if(el)el.textContent=state.found.length+" / 23";
    document.querySelectorAll(".chapter-extra").forEach(card=>{
      card.classList.toggle("discovered",state.found.includes(card.dataset.chapterId));
      const b=card.querySelector(".chapter-discover");
      if(b)b.textContent=state.found.includes(card.dataset.chapterId)?"✓ Detalle descubierto":"✦ Descubrir detalle";
    });
    renderFinal23();
  }

  function collect(id){
    if(state.found.includes(id))return false;
    state.found.push(id);save();updateCount();sparkBurst();
    if(state.found.length===23)showCelebration();
    return true;
  }

  function sparkBurst(){
    for(let i=0;i<10;i++){
      const s=document.createElement("span");
      s.className="chapter-mini-spark";s.textContent=i%3===0?"✧":"✦";
      s.style.left=(42+Math.random()*16)+"vw";
      s.style.top=(45+Math.random()*10)+"vh";
      document.body.appendChild(s);setTimeout(()=>s.remove(),1200);
    }
  }

  function showCelebration(){
    const old=document.querySelector(".chapter-celebration");if(old)old.remove();
    const box=document.createElement("div");box.className="chapter-celebration";
    box.innerHTML="<strong>23 / 23 ✦</strong><span>Has descubierto un detalle en cada uno de los 23 capítulos.</span>";
    document.body.appendChild(box);setTimeout(()=>box.remove(),4800);
  }

  function output(card,text){
    const el=card.querySelector(".chapter-extra-output");el.textContent=text;
    card.classList.remove("chapter-flash");void card.offsetWidth;card.classList.add("chapter-flash");
  }

  chapters.forEach((chapter,index)=>{
    const scene=sceneMap.get(chapter.id);if(!scene)return;
    const card=document.createElement("div");
    card.className="chapter-extra";
    card.dataset.chapterId=chapter.id;
    card.innerHTML=
      '<div class="chapter-extra-top">'+
        '<span class="chapter-extra-number">'+String(index+1).padStart(2,"0")+'</span>'+
        '<div class="chapter-extra-copy"><small>Capítulo '+(index+1)+' de 23</small><strong>'+chapter.title+'</strong><p>'+chapter.desc+'</p></div>'+
      '</div>'+
      '<div class="chapter-extra-actions">'+
        '<button class="chapter-discover" type="button">✦ Descubrir detalle</button>'+
        '<button class="chapter-action" type="button">'+chapter.action+'</button>'+
      '</div>'+
      '<div class="chapter-extra-output" aria-live="polite"></div>';

    const actions=scene.querySelector(":scope > .actions");
    if(actions)scene.insertBefore(card,actions);else scene.appendChild(card);

    card.querySelector(".chapter-discover").addEventListener("click",()=>{
      const fresh=collect(chapter.id);
      output(card,fresh?chapter.fun:"Este detalle ya estaba descubierto. La curiosidad sigue funcionando.");
    });
    card.querySelector(".chapter-action").addEventListener("click",()=>runAction(chapter.id,card,chapter.fun,index));
  });

  function runAction(id,card,fallback,index){
    collect(id);
    if(id==="intro"){
      output(card,"Regla oficial: no vale decir «ya lo veré luego» y cerrar en el capítulo 4.");
    }else if(id==="timeline"){
      output(card,"Detector: 87% nostalgia, 9% risa y 4% «esa foto no la subas». Valores totalmente inventados.");
    }else if(id==="constellation"){
      document.querySelectorAll(".constellation-star").forEach((s,i)=>setTimeout(()=>s.classList.add("discovered"),i*80));
      output(card,"Deseo enviado al departamento de estrellas. Respuesta estimada: cuando le apetezca al universo.");
    }else if(id==="gallery"){
      const photos=[...document.querySelectorAll(".photo-card")];photos.forEach(x=>x.classList.remove("chapter-picked"));
      const p=photos[Math.floor(Math.random()*photos.length)];p?.classList.add("chapter-picked");p?.click();
      output(card,"Favorita provisional elegida. Cuando haya fotos reales, el jurado tendrá trabajo serio.");
    }else if(id==="quiz"){
      output(card,"Comodín activado: elimina mentalmente la respuesta que suene demasiado absurda. Sorprendentemente eficaz.");
    }else if(id==="numbers"){
      const approx=23*365+Math.floor(23/4);
      output(card,"Dato innecesario del día: 23 años son aproximadamente "+approx.toLocaleString("es-ES")+" días, sin contar que los cumpleaños no vienen con manual.");
    }else if(id==="reasons"){
      const text=document.getElementById("reasonText")?.textContent||"Razón actual";
      if(!state.favorites.includes(text)){state.favorites.push(text);save();}
      output(card,"Razón favorita guardada en este navegador ♡");
    }else if(id==="openwhen"){
      const opts=[...document.querySelectorAll(".open-when")];opts[Math.floor(Math.random()*opts.length)]?.click();
      output(card,"Sobre elegido por el azar. Si sale justo el que querías, fingimos que estaba planeado.");
    }else if(id==="future"){
      const cards=[...document.querySelectorAll(".future-grid article")];cards.forEach(x=>x.classList.remove("chapter-picked"));
      const chosen=cards[Math.floor(Math.random()*cards.length)];chosen?.classList.add("chapter-picked");
      output(card,"Plan futuro sellado provisionalmente ✦");
    }else if(id==="plans"){
      document.getElementById("spinPlan")?.click();output(card,"Ruleta girada. El sistema declina toda responsabilidad sobre el resultado.");
    }else if(id==="secrets"){
      output(card,"Botón claramente etiquetado como «no tocar»: pulsado con éxito. Conducta esperada.");
    }else if(id==="doors"){
      const ds=[...document.querySelectorAll(".door-card")];ds[Math.floor(Math.random()*ds.length)]?.click();output(card,"Puerta elegida. El comité del caos da el asunto por resuelto.");
    }else if(id==="mood"){
      const ms=[...document.querySelectorAll(".mood-card")];ms[Math.floor(Math.random()*ms.length)]?.click();output(card,"Estado seleccionado mediante metodología altamente cuestionable.");
    }else if(id==="puzzle"){
      output(card,"Pista: intenta llevar primero las piezas pequeñas a su zona y recuerda que el hueco final va abajo a la derecha.");
    }else if(id==="bingo"){
      const bs=[...document.querySelectorAll("#bingoGrid button:not(.marked)")];
      (bs[Math.floor(Math.random()*bs.length)]||document.querySelector("#bingoGrid button"))?.click();
      output(card,"Casilla sorpresa marcada. El azar acaba de añadir trabajo a la agenda.");
    }else if(id==="cinema"){
      let clap=card.querySelector(".clapper");
      if(!clap){clap=document.createElement("span");clap.className="clapper";clap.textContent="TOMA 23";card.querySelector(".chapter-extra-actions").appendChild(clap);}
      clap.classList.remove("clap");void clap.offsetWidth;clap.classList.add("clap");output(card,"¡Acción! Toma 23 registrada.");
    }else if(id==="choices"){
      const cs=[...document.querySelectorAll(".choice-card")];cs[Math.floor(Math.random()*cs.length)]?.click();output(card,"Destino consultado. Ha respondido sin explicar sus motivos.");
    }else if(id==="timemachine"){
      const ts=[...document.querySelectorAll(".time-controls button")];ts[Math.floor(Math.random()*ts.length)]?.click();output(card,"Salto temporal completado. Por favor, no tocar a tu yo del pasado.");
    }else if(id==="capsules"){
      const statuses=[...document.querySelectorAll(".capsule-card")].map(x=>x.classList.contains("openable")?"disponible":"bloqueada");
      output(card,"Escáner: "+statuses.filter(x=>x==="disponible").length+" cápsula(s) disponible(s) y "+statuses.filter(x=>x==="bloqueada").length+" bloqueada(s).");
    }else if(id==="memorygame"){
      const cards=[...document.querySelectorAll(".memory-card-game:not(.matched)")];cards.forEach(x=>x.classList.add("flipped"));
      setTimeout(()=>cards.forEach(x=>{if(!x.classList.contains("matched"))x.classList.remove("flipped");}),1000);
      output(card,"Vista previa concedida durante 1 segundo. La policía del memory no ha sido avisada.");
    }else if(id==="beforeafter"){
      const slider=document.getElementById("compareSlider");if(slider){
        let v=0;slider.value=0;slider.dispatchEvent(new Event("input"));
        const timer=setInterval(()=>{v+=4;slider.value=v;slider.dispatchEvent(new Event("input"));if(v>=100)clearInterval(timer);},25);
      }
      output(card,"Comparación automática en marcha: del antes al ahora sin necesidad de máquina del tiempo.");
    }else if(id==="letter"){
      output(card,"Modo lectura lenta: activado. Recomendación técnica: no leer una carta importante como si fueran términos y condiciones.");
    }else if(id==="finale"){
      output(card,state.found.length===23?"Comprobación completa: 23 de 23. Esto ya cuenta como explorar de verdad.":"Llevas "+state.found.length+" de 23 detalles. Todavía queda algo escondido.");
    }else output(card,fallback);
  }

  function renderFinal23(){
    const finale=sceneMap.get("finale");if(!finale)return;
    let box=finale.querySelector(".final-23-card");
    if(!box){
      box=document.createElement("div");box.className="final-23-card";
      const restart=finale.querySelector("#restartButton");restart?.insertAdjacentElement("beforebegin",box);
    }
    const complete=state.found.length===23;
    box.classList.toggle("locked",!complete);
    box.innerHTML=complete
      ?'<span>23 ✦</span><strong>23 capítulos completados</strong><p>Una página por cada año. Y ninguna tuvo que ser de relleno.</p>'
      :'<span>'+state.found.length+' / 23</span><strong>Quedan detalles por descubrir</strong><p>Cada capítulo tiene una pequeña sorpresa propia. Faltan '+(23-state.found.length)+'.</p>';
  }

  updateCount();
})();
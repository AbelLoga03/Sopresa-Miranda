(() => {
  const KEY="miranda-hints-v1";
  let state;
  try{state=JSON.parse(localStorage.getItem(KEY))||{};}catch{state={};}
  state.levels=state.levels&&typeof state.levels==="object"?state.levels:{};
  state.used=Number(state.used)||0;
  state.otherUsed=Number(state.otherUsed)||0;
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};

  const scenes=[...document.querySelectorAll(".scene")];
  if(scenes.length!==23)return;

  const hints={
    intro:[
      "Hay algo en esta portada que parece puramente decorativo.",
      "Mira cerca de la parte más alta del capítulo. Una estrella tiene más paciencia de la que parece.",
      "Pulsa varias veces la estrella grande de la portada. No una ni dos: insiste."
    ],
    timeline:[
      "Los recuerdos no son lo único que se puede tocar aquí.",
      "Mira por los bordes del capítulo, no solo por la línea del tiempo.",
      "Hay un pequeño símbolo escondido en esta página. Busca cerca de una esquina y tócala."
    ],
    constellation:[
      "Una estrella sola cuenta poco; una constelación completa cuenta otra historia.",
      "Prueba a despertar todas las estrellas, no solo la que más destaque.",
      "Toca las seis estrellas de la constelación. El secreto aparece cuando todas han sido descubiertas."
    ],
    gallery:[
      "A veces la foto importante no está en el centro de la atención.",
      "Mira alrededor de las polaroids y también por los laterales del capítulo.",
      "Hay un mini símbolo escondido en esta página, cerca de un lateral. Además, la última foto cambia con tu progreso."
    ],
    quiz:[
      "No todos los secretos requieren acertar preguntas.",
      "El detalle propio de este capítulo está más abajo del juego principal.",
      "Busca la tarjeta adicional del capítulo y usa su botón de descubrimiento."
    ],
    numbers:[
      "Los números visibles no son los únicos que cuentan.",
      "Baja un poco más allá de las estadísticas principales.",
      "El detalle secreto de esta página está en la tarjeta extra del capítulo, debajo del contenido principal."
    ],
    reasons:[
      "Una razón puede convertirse en algo más que texto.",
      "Prueba a guardar la razón que esté visible cuando una te guste.",
      "Usa el detalle extra de este capítulo para guardar la razón actual como favorita."
    ],
    openwhen:[
      "No hace falta decidir siempre qué sobre abrir.",
      "Hay una opción adicional que puede dejar la elección al azar.",
      "En el detalle del capítulo encontrarás un botón que elige y abre un sobre aleatorio."
    ],
    future:[
      "El futuro también tiene pequeños fragmentos escondidos.",
      "No mires solo las cuatro tarjetas: inspecciona el borde inferior y los laterales.",
      "Hay un mini símbolo oculto en esta página. Busca cerca de una zona exterior del contenido."
    ],
    plans:[
      "La ruleta guarda más cosas que un resultado al azar.",
      "Después de girar, fíjate en los botones que aparecen debajo del plan.",
      "Gira la ruleta y guarda el resultado o ponle fecha. También existe un detalle extra que puede girarla por ti."
    ],
    secrets:[
      "Esta página tiene más de una forma de demostrar curiosidad.",
      "Una parte se rasca y otra espera una palabra concreta.",
      "Rasca la tarjeta y prueba la caja fuerte. La respuesta de la caja es el nombre para quien está hecha la web."
    ],
    doors:[
      "Tres puertas significan tres oportunidades.",
      "No te conformes con abrir solo una; además hay algo pequeño escondido cerca.",
      "Abre las tres puertas para el logro y busca un mini símbolo oculto en este capítulo."
    ],
    mood:[
      "Elegir cómo te sientes ya cuenta para algo.",
      "Después de interactuar con los estados, fíjate en el archivo secreto de la parte inferior.",
      "Elige un estado de ánimo. Con suficientes logros, el archivo secreto de Miranda se vuelve accesible."
    ],
    puzzle:[
      "El hueco vacío es una pieza más del problema.",
      "Piensa en llevar la última casilla vacía hacia la esquina inferior derecha.",
      "Ordena 1–8 y deja el hueco en la última posición. Si te atascas, usa también la pista adicional del capítulo."
    ],
    bingo:[
      "Completar una sola línea no es el objetivo oculto.",
      "Las nueve casillas cuentan para el secreto de este capítulo.",
      "Marca las 9 casillas del bingo para conseguir su logro. El detalle extra también puede marcar una al azar."
    ],
    cinema:[
      "Una película no termina cuando empieza el crédito.",
      "Hay un botón específico para poner en marcha los créditos.",
      "Pulsa «Reproducir créditos». Eso desbloquea el secreto principal de este capítulo."
    ],
    choices:[
      "Aquí no hay una respuesta correcta, pero sí hace falta elegir.",
      "Cualquiera de los tres caminos sirve para que la historia recuerde tu decisión.",
      "Elige Pasado, Presente o Futuro. Esa elección modifica el texto del final."
    ],
    timemachine:[
      "Una sola época no basta para conocer toda la máquina.",
      "Haz una parada en cada uno de los cuatro momentos.",
      "Pulsa El comienzo, Los momentos, Hoy y El futuro. Visitar las cuatro etapas completa el secreto."
    ],
    capsules:[
      "Algunas cosas se abren por fecha, otras por hora y otras por progreso.",
      "Comprueba cuál de las tres cápsulas aparece como «Disponible».",
      "Abre cualquier cápsula disponible: cumpleaños, nocturna o la de logros. Basta una para el secreto."
    ],
    memorygame:[
      "Las parejas prefieren encontrarse de dos en dos.",
      "Completar las cuatro parejas desbloquea algo.",
      "Encuentra las 4 parejas del memory. El detalle extra puede enseñarte todas las cartas durante un segundo."
    ],
    beforeafter:[
      "El centro del deslizador no cuenta toda la historia.",
      "Lleva la comparación casi hasta ambos extremos.",
      "Mueve el deslizador hasta aproximadamente 0% y luego hasta 100%. También hay un mini símbolo oculto en esta página."
    ],
    letter:[
      "Aquí el secreto está más relacionado con el ritmo que con esconderse.",
      "Abre el sobre y no tengas prisa por llegar al botón final.",
      "Pulsa el sobre para abrir la carta; después aparecerá el acceso a la última sorpresa."
    ],
    finale:[
      "El final también mira lo que dejaste atrás.",
      "Comprueba el resumen: 23 capítulos, detalles, logros y mini secretos no son el mismo contador.",
      "Para verlo todo completo necesitas 23/23 detalles, todos los logros y los 5 mini secretos. El índice te ayuda a localizar lo pendiente."
    ]
  };

  const chapterOrder=scenes.map((s,i)=>({id:s.dataset.sceneId,index:i,title:s.dataset.originalTitle||String(s.dataset.title||"").replace(/^\d{2}\/23 · /,"")}));

  function parse(k,fallback={}){try{return JSON.parse(localStorage.getItem(k))||fallback;}catch{return fallback;}}
  function achieved(id){const x=parse("miranda-exploration-v1",{achievements:[]});return Array.isArray(x.achievements)&&x.achievements.includes(id);}
  function chapterFound(id){const x=parse("miranda-23-details-v1",{found:[]});return Array.isArray(x.found)&&x.found.includes(id);}
  function tokenFound(id){const x=parse("miranda-microdetails-v1",{tokens:[]});return Array.isArray(x.tokens)&&x.tokens.includes(id);}

  function resolved(id){
    const special=parse("miranda-special-v1",{bingo:[],puzzleSolved:false});
    const ultimate=parse("miranda-ultimate-v1",{choice:null,eras:[],compareSeen:[]});
    const micro=parse("miranda-microdetails-v1",{tokens:[]});
    switch(id){
      case "intro": return achieved("easter")&&chapterFound(id);
      case "timeline": return chapterFound(id)&&tokenFound("timeline");
      case "constellation": return achieved("stars")&&chapterFound(id);
      case "gallery": return chapterFound(id)&&tokenFound("gallery");
      case "quiz": case "numbers": case "reasons": case "openwhen": case "future": case "plans": case "letter":
        return chapterFound(id)&&(id!=="future"||tokenFound("future"));
      case "secrets": return achieved("scratch")&&achieved("vault")&&chapterFound(id);
      case "doors": return achieved("doors")&&tokenFound("doors")&&chapterFound(id);
      case "mood": return achieved("mood")&&chapterFound(id);
      case "puzzle": return achieved("puzzle")&&chapterFound(id);
      case "bingo": return achieved("bingo")&&chapterFound(id);
      case "cinema": return achieved("credits")&&chapterFound(id);
      case "choices": return achieved("choice")&&chapterFound(id);
      case "timemachine": return achieved("timetravel")&&chapterFound(id);
      case "capsules": return achieved("capsule")&&chapterFound(id);
      case "memorygame": return achieved("memorygame")&&chapterFound(id);
      case "beforeafter": return achieved("compare")&&tokenFound("beforeafter")&&chapterFound(id);
      case "finale":
        return chapterFound(id)&&((parse("miranda-23-details-v1",{found:[]}).found||[]).length>=23)&&((micro.tokens||[]).length>=5);
      default:return chapterFound(id);
    }
  }

  function nextUnresolved(exclude){
    const current=chapterOrder.find(x=>x.id===exclude);
    for(let step=1;step<=chapterOrder.length;step++){
      const idx=((current?.index||0)+step)%chapterOrder.length;
      const item=chapterOrder[idx];
      if(!resolved(item.id))return item;
    }
    return null;
  }

  function levelFor(id,tab){
    const key=id+":"+tab;
    return Math.max(0,Math.min(2,Number(state.levels[key])||0));
  }
  function advance(id,tab){
    const key=id+":"+tab;
    state.levels[key]=Math.min(2,levelFor(id,tab)+1);
    state.used+=1;if(tab==="other")state.otherUsed+=1;save();
  }

  function globalHintFor(target,level){
    const n=String(target.index+1).padStart(2,"0");
    const vague=[
      "Todavía queda algo pendiente en otro punto del recorrido.",
      "El radar detecta actividad en un capítulo que aún no está completamente explorado.",
      "Hay un secreto pendiente fuera de esta página."
    ];
    if(level===0)return '<span class="hint-level">Pista sutil</span><br>'+vague[target.index%vague.length]+' Prueba a revisar una zona que no suelas tocar.';
    if(level===1)return '<span class="hint-level">Pista clara</span><br>Mira de nuevo el <strong>capítulo '+n+'/23 · '+target.title+'</strong>. Allí todavía falta al menos un detalle.';
    const local=hints[target.id]?.[2]||"Revisa los botones, bordes y elementos interactivos de ese capítulo.";
    return '<span class="hint-level">Casi directa</span><br><strong>Capítulo '+n+'/23 · '+target.title+':</strong> '+local;
  }

  function renderHint(scene,panel,tab){
    const id=scene.dataset.sceneId;
    const content=panel.querySelector(".hint-content");
    const more=panel.querySelector(".hint-more");
    const usage=panel.querySelector(".hint-usage");
    panel.dataset.tab=tab;
    panel.querySelectorAll(".hint-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.hintTab===tab));
    const level=levelFor(id,tab);

    if(tab==="here"){
      if(resolved(id)){
        const next=nextUnresolved(id);
        content.innerHTML='<span class="hint-level">Capítulo resuelto</span><br>Por aquí ya has encontrado lo importante. '+(next?'El radar sí detecta algo pendiente en otro capítulo.':'No queda ningún secreto principal pendiente.');
        more.textContent=next?"Buscar otro secreto":"Todo encontrado";
        more.disabled=!next;
        more.dataset.switchOther=next?"1":"";
      }else{
        const arr=hints[id]||["Mira con calma.","Prueba los elementos interactivos.","Revisa botones y bordes."];
        content.innerHTML='<span class="hint-level">'+["Pista sutil","Pista clara","Casi directa"][level]+'</span><br>'+arr[level];
        more.textContent=level<2?"Quiero otra pista":"Pista máxima";
        more.disabled=level>=2;
        more.dataset.switchOther="";
      }
    }else{
      const target=nextUnresolved(id);
      if(!target){
        content.innerHTML='<span class="hint-level">Radar limpio</span><br>No encuentro secretos principales pendientes. Eso es bastante sospechoso… pero en el buen sentido.';
        more.disabled=true;more.textContent="Todo encontrado";
      }else{
        content.innerHTML=globalHintFor(target,level);
        more.disabled=level>=2;more.textContent=level<2?"Afinar pista":"Pista máxima";more.dataset.switchOther="";
      }
    }
    usage.textContent="Pistas usadas: "+state.used;
  }

  scenes.forEach(scene=>{
    const id=scene.dataset.sceneId;
    const button=document.createElement("button");
    button.type="button";button.className="hint-button";
    button.innerHTML='<span class="bulb">💡</span><span class="hint-label">Pista</span>';
    button.setAttribute("aria-label","Abrir pistas de este capítulo");
    scene.appendChild(button);

    const panel=document.createElement("div");
    panel.className="hint-panel hidden";
    panel.innerHTML='<div class="hint-panel-head"><div><small>Radar de secretos</small><strong>¿Necesitas una pista?</strong></div><button type="button" class="hint-close" aria-label="Cerrar">×</button></div><div class="hint-tabs"><button type="button" data-hint-tab="here" class="active">En este capítulo</button><button type="button" data-hint-tab="other">Dónde buscar después</button></div><div class="hint-content"></div><div class="hint-radar"><span>◇</span> Las pistas no desbloquean nada automáticamente</div><div class="hint-actions"><small class="hint-usage"></small><button type="button" class="hint-more">Quiero otra pista</button></div>';

    const extra=scene.querySelector(".chapter-extra");
    const actions=scene.querySelector(":scope > .actions");
    if(extra)extra.insertAdjacentElement("afterend",panel);
    else if(actions)scene.insertBefore(panel,actions);
    else scene.appendChild(panel);

    button.addEventListener("click",()=>{
      const opening=panel.classList.contains("hidden");
      document.querySelectorAll(".hint-panel").forEach(p=>p.classList.add("hidden"));
      document.querySelectorAll(".hint-button").forEach(b=>b.classList.remove("open"));
      if(opening){panel.classList.remove("hidden");button.classList.add("open");renderHint(scene,panel,"here");}
    });
    panel.querySelector(".hint-close").addEventListener("click",()=>{panel.classList.add("hidden");button.classList.remove("open");});
    panel.querySelectorAll("[data-hint-tab]").forEach(tab=>tab.addEventListener("click",()=>renderHint(scene,panel,tab.dataset.hintTab)));
    panel.querySelector(".hint-more").addEventListener("click",e=>{
      const tab=panel.dataset.tab||"here";
      if(e.currentTarget.dataset.switchOther==="1"){renderHint(scene,panel,"other");return;}
      advance(id,tab);renderHint(scene,panel,tab);
      hintToast(tab==="other"?"Radar afinado. Ahora la pista señala mejor el siguiente secreto.":"Pista afinada. Prometo no resolverlo por ti.");
    });
  });

  function hintToast(text){
    let t=document.querySelector(".hint-toast");
    if(!t){t=document.createElement("div");t.className="hint-toast";document.body.appendChild(t);}
    t.innerHTML='<strong>💡 Pista</strong><br>'+text;t.classList.add("show");
    clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2100);
  }

  // Keyboard shortcut for the active chapter: H opens its hint.
  document.addEventListener("keydown",e=>{
    if(e.key.toLowerCase()!=="h"||e.ctrlKey||e.metaKey||e.altKey||e.target.closest("input,textarea,select"))return;
    const active=scenes.find(s=>s.classList.contains("active"));
    active?.querySelector(".hint-button")?.click();
  });

  window.mirandaHintState=state;
})();
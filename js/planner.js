(() => {
  const KEY="miranda-plans-v1";
  let data;
  try{data=JSON.parse(localStorage.getItem(KEY))||{};}catch{data={};}
  data.plans=Array.isArray(data.plans)?data.plans:[];
  let currentPlan=window.mirandaCurrentPlan||"";
  let editingId=null;
  let filter="all";

  const list=document.getElementById("savedPlanList");
  const actions=document.getElementById("planActions");
  const categoryEl=document.getElementById("planCategory");
  const modal=document.getElementById("planModal");
  const modalName=document.getElementById("planModalName");
  const dateInput=document.getElementById("planDate");
  const timeInput=document.getElementById("planTime");
  const noteInput=document.getElementById("planNote");

  if(!list)return;

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}
  }

  function uid(){
    return "p"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  }

  function categoryFor(text){
    const t=text.toLowerCase();
    if(/cena|desayuno|merienda|restaurante|cafeter|helado|cocinar|galletas|postre|comida|ingredientes/.test(t))return "Comida";
    if(/playa|ruta|excurs|pueblo|mirador|escapada|viaje|turista|sitio nuevo|actividad/.test(t))return "Aventura";
    if(/peli|película|manta|casa|videojuegos|juegos de mesa|maratón/.test(t))return "Plan tranquilo";
    if(/foto|álbum|playlist|cápsula|escribir|ranking|preguntas|lista/.test(t))return "Creativo";
    if(/amanecer|atardecer|estrellas|paseo|vuelta en coche/.test(t))return "Momento especial";
    return "Plan sorpresa";
  }

  function prettyDate(date,time){
    if(!date)return "Sin fecha";
    const d=new Date(date+"T"+(time||"12:00")+":00");
    if(Number.isNaN(d.getTime()))return date;
    const opts={day:"2-digit",month:"short",year:"numeric"};
    let out=d.toLocaleDateString("es-ES",opts);
    if(time)out+=" · "+time;
    return out;
  }

  function toast(text){
    let el=document.querySelector(".plan-toast");
    if(!el){
      el=document.createElement("div");
      el.className="plan-toast";
      document.body.appendChild(el);
    }
    el.textContent=text;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer=setTimeout(()=>el.classList.remove("show"),1900);
  }

  function findSimilar(text){
    return data.plans.find(p=>p.text.trim().toLowerCase()===text.trim().toLowerCase() && p.status!=="done");
  }

  function addLater(text,source="wheel"){
    if(!text.trim())return;
    const existing=findSimilar(text);
    if(existing){
      toast("Ese plan ya está guardado ✦");
      return existing;
    }
    const item={
      id:uid(),text:text.trim(),category:categoryFor(text),status:"later",
      date:"",time:"",note:"",source,createdAt:new Date().toISOString()
    };
    data.plans.unshift(item);save();render();toast("Guardado para más adelante ♡");
    return item;
  }

  function openModal(text,id=null){
    const plan=id?data.plans.find(p=>p.id===id):null;
    editingId=id;
    modalName.textContent=text;
    dateInput.value=plan?.date||"";
    timeInput.value=plan?.time||"";
    noteInput.value=plan?.note||"";
    modal.classList.remove("hidden");
    setTimeout(()=>dateInput.focus(),30);
  }

  function closeModal(){
    modal.classList.add("hidden");
    editingId=null;
  }

  function scheduledPlan(exportCalendar=false){
    const text=modalName.textContent.trim();
    if(!text)return;
    if(!dateInput.value){
      toast("Elige una fecha primero");
      dateInput.focus();
      return;
    }
    let item=editingId?data.plans.find(p=>p.id===editingId):findSimilar(text);
    if(!item){
      item={id:uid(),text,category:categoryFor(text),createdAt:new Date().toISOString(),source:"wheel"};
      data.plans.unshift(item);
    }
    item.status="scheduled";
    item.date=dateInput.value;
    item.time=timeInput.value;
    item.note=noteInput.value.trim();
    item.updatedAt=new Date().toISOString();
    save();render();closeModal();
    toast("Plan guardado con fecha ✦");
    if(exportCalendar)downloadICS(item);
  }

  function escapeICS(value=""){
    return value.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
  }

  function icsDate(date,time,end=false){
    const compact=date.replaceAll("-","");
    if(!time)return compact;
    const hm=time.replace(":","")+"00";
    if(!end)return compact+"T"+hm;
    const d=new Date(date+"T"+time+":00");
    d.setHours(d.getHours()+2);
    const pad=n=>String(n).padStart(2,"0");
    return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"T"+pad(d.getHours())+pad(d.getMinutes())+"00";
  }

  function downloadICS(item){
    if(!item.date)return;
    const timed=!!item.time;
    const start=icsDate(item.date,item.time||"");
    const end=timed?icsDate(item.date,item.time,true):"";
    const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
    const lines=[
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Sorpresa Miranda//Planes//ES","CALSCALE:GREGORIAN",
      "BEGIN:VEVENT","UID:"+item.id+"@sorpresa-miranda","DTSTAMP:"+stamp,
      (timed?"DTSTART:"+start:"DTSTART;VALUE=DATE:"+start),
      ...(timed?["DTEND:"+end]:[]),
      "SUMMARY:"+escapeICS(item.text),
      "DESCRIPTION:"+escapeICS(item.note||"Plan guardado desde la ruleta de Miranda"),
      "END:VEVENT","END:VCALENDAR"
    ];
    const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="plan-"+item.date+".ics";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  function render(){
    const visible=data.plans.filter(p=>{
      if(filter==="all")return true;
      if(filter==="later")return p.status==="later";
      if(filter==="scheduled")return p.status==="scheduled";
      return true;
    });

    if(!visible.length){
      list.innerHTML='<div class="empty-plans">'+
        (data.plans.length?"No hay planes en este filtro.":"Todavía no hay planes guardados. Gira la ruleta y guarda alguno que os guste ✦")+
        '</div>';
      return;
    }

    list.innerHTML="";
    visible.forEach(item=>{
      const card=document.createElement("article");
      card.className="saved-plan-item"+(item.status==="done"?" done":"");

      const left=document.createElement("div");
      const meta=document.createElement("div");meta.className="saved-plan-meta";
      const cat=document.createElement("span");cat.className="saved-plan-pill";cat.textContent=item.category||categoryFor(item.text);
      meta.appendChild(cat);
      if(item.date){
        const date=document.createElement("span");date.className="saved-plan-pill dated";date.textContent=prettyDate(item.date,item.time);
        meta.appendChild(date);
      }else{
        const pending=document.createElement("span");pending.className="saved-plan-pill";pending.textContent=item.status==="done"?"Hecho":"Para más adelante";
        meta.appendChild(pending);
      }

      const title=document.createElement("strong");title.className="saved-plan-title";title.textContent=item.text;
      left.append(meta,title);
      if(item.note){
        const note=document.createElement("div");note.className="saved-plan-note";note.textContent=item.note;left.appendChild(note);
      }

      const buttons=document.createElement("div");buttons.className="saved-plan-buttons";

      if(item.status!=="done"){
        const schedule=document.createElement("button");schedule.type="button";schedule.textContent=item.date?"Cambiar fecha":"Poner fecha";
        schedule.addEventListener("click",()=>openModal(item.text,item.id));buttons.appendChild(schedule);

        if(item.date){
          const calendar=document.createElement("button");calendar.type="button";calendar.textContent="Calendario";
          calendar.addEventListener("click",()=>downloadICS(item));buttons.appendChild(calendar);
        }

        const done=document.createElement("button");done.type="button";done.textContent="✓ Hecho";
        done.addEventListener("click",()=>{item.status="done";item.completedAt=new Date().toISOString();save();render();toast("Plan marcado como hecho ✦");});
        buttons.appendChild(done);
      }else{
        const undo=document.createElement("button");undo.type="button";undo.textContent="↶ Recuperar";
        undo.addEventListener("click",()=>{item.status=item.date?"scheduled":"later";delete item.completedAt;save();render();});buttons.appendChild(undo);
      }

      const del=document.createElement("button");del.type="button";del.className="danger";del.textContent="Eliminar";
      del.addEventListener("click",()=>{data.plans=data.plans.filter(p=>p.id!==item.id);save();render();toast("Plan eliminado");});
      buttons.appendChild(del);

      card.append(left,buttons);list.appendChild(card);
    });
  }

  window.addEventListener("miranda-plan-picked",e=>{
    currentPlan=e.detail?.plan||"";
    if(currentPlan){
      categoryEl.textContent=categoryFor(currentPlan);
      actions.classList.remove("hidden");
    }
  });

  document.getElementById("savePlanLater")?.addEventListener("click",()=>{
    if(currentPlan)addLater(currentPlan);
  });

  document.getElementById("schedulePlan")?.addEventListener("click",()=>{
    if(currentPlan)openModal(currentPlan);
  });

  document.getElementById("customPlanAdd")?.addEventListener("click",()=>{
    const input=document.getElementById("customPlanInput");
    const value=input.value.trim();
    if(!value){input.focus();return;}
    addLater(value,"custom");
    input.value="";
  });

  document.getElementById("customPlanInput")?.addEventListener("keydown",e=>{
    if(e.key==="Enter")document.getElementById("customPlanAdd")?.click();
  });

  document.querySelectorAll("[data-plan-filter]").forEach(button=>{
    button.addEventListener("click",()=>{
      filter=button.dataset.planFilter;
      document.querySelectorAll("[data-plan-filter]").forEach(x=>x.classList.toggle("active",x===button));
      render();
    });
  });

  document.getElementById("planModalClose")?.addEventListener("click",closeModal);
  modal?.addEventListener("click",e=>{if(e.target===modal)closeModal();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.classList.contains("hidden"))closeModal();});
  document.getElementById("planSaveOnly")?.addEventListener("click",()=>scheduledPlan(false));
  document.getElementById("planSaveCalendar")?.addEventListener("click",()=>scheduledPlan(true));

  const today=new Date();
  const pad=n=>String(n).padStart(2,"0");
  dateInput.min=today.getFullYear()+"-"+pad(today.getMonth()+1)+"-"+pad(today.getDate());

  render();
})();
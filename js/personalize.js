(() => {
  const sprite=(window.MIRANDA_SPRITE_PARTS||[]).join("");
  if(sprite){document.documentElement.style.setProperty("--miranda-photo-sprite",`url("data:image/webp;base64,${sprite}")`);}
  const scene=document.querySelector('.scene[data-scene-id="constellation"]');
  const gallery=document.querySelector('.scene[data-scene-id="gallery"]');
  if(!scene||!gallery)return;

  // Recuerdos reales para las seis estrellas.
  const memories=[
    {title:"La casa de campo",text:"Ese viaje a su casa de campo que ya forma parte de vuestra pequeña constelación."},
    {title:"La vuelta de la playa",text:"La noche de la vuelta de la playa, un recuerdo que terminó siendo mucho más importante de lo esperado."},
    {title:"El misterioso zorro",text:"La búsqueda de aquel supuesto zorro en el matorral… que en realidad eran piedras haciendo creer que había algo allí."},
    {title:"Primera salida",text:"Aquella primera salida al cine para ver Insidious."},
    {title:"La vuelta de la feria",text:"La vuelta de la feria con su hermana y su amiga: una de esas historias que se recuerdan por todo lo que pasó."},
    {title:"Una estrella del futuro",text:"Un deseo para lo que todavía queda por construir y descubrir juntos."}
  ];
  const stars=[...scene.querySelectorAll(".constellation-star")];
  stars.forEach((star,i)=>{
    const m=memories[i];
    if(!m)return;
    star.dataset.memory=m.title+" · "+m.text;
    star.setAttribute("aria-label",m.title);
    star.addEventListener("click",()=>{
      stars.forEach(s=>s.classList.remove("memory-selected"));
      star.classList.add("memory-selected");
    });
  });

  // Pide un deseo a una de las seis estrellas.
  const reveal=document.getElementById("constellationReveal");
  if(reveal && !document.getElementById("wishCard")){
    const box=document.createElement("section");
    box.className="wish-card";
    box.id="wishCard";
    box.innerHTML=`
      <div class="wish-heading">
        <div><span class="kicker">Un cielo para pedir cosas</span><h3>Pide un deseo ✦</h3></div>
        <span class="wish-counter" id="wishCounter">0 deseos</span>
      </div>
      <p class="wish-intro">Elige una estrella, escribe algo que te gustaría que pasara algún día y déjaselo guardado. Solo se guarda en este navegador.</p>
      <div class="wish-stars" id="wishStars" aria-label="Elegir estrella">
        <button type="button" data-wish-star="1" class="active" aria-label="Estrella 1">✦</button>
        <button type="button" data-wish-star="2" aria-label="Estrella 2">✧</button>
        <button type="button" data-wish-star="3" aria-label="Estrella 3">✦</button>
        <button type="button" data-wish-star="4" aria-label="Estrella 4">✧</button>
        <button type="button" data-wish-star="5" aria-label="Estrella 5">✦</button>
        <button type="button" data-wish-star="6" aria-label="Estrella 6">✧</button>
      </div>
      <label class="wish-input-wrap" for="wishInput">
        <span>Si pudieras pedirle algo a esta estrella…</span>
        <textarea id="wishInput" rows="3" maxlength="220" placeholder="Escribe aquí tu deseo…"></textarea>
      </label>
      <div class="wish-actions">
        <button class="primary" id="saveWish" type="button">Guardar deseo ✦</button>
        <button class="secondary" id="randomWishStar" type="button">Que el cielo elija estrella</button>
      </div>
      <div class="wish-list" id="wishList"></div>
    `;
    reveal.insertAdjacentElement("afterend",box);

    const KEY="miranda-wishes-v1";
    let data;try{data=JSON.parse(localStorage.getItem(KEY))||{}}catch{data={}};
    data.items=Array.isArray(data.items)?data.items:[];
    let chosen=1;
    const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
    const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

    function pick(n){
      chosen=n;
      box.querySelectorAll("[data-wish-star]").forEach(b=>b.classList.toggle("active",Number(b.dataset.wishStar)===n));
      stars[n-1]?.classList.add("wish-pulse");
      setTimeout(()=>stars[n-1]?.classList.remove("wish-pulse"),700);
    }
    function render(){
      const list=document.getElementById("wishList");
      document.getElementById("wishCounter").textContent=data.items.length+" "+(data.items.length===1?"deseo":"deseos");
      if(!data.items.length){
        list.innerHTML='<div class="wish-empty">Todavía no hay ninguno. La primera estrella está esperando.</div>';
        return;
      }
      list.innerHTML=data.items.map((w,i)=>'<article class="saved-wish"><span>'+(Number(w.star)%2?"✦":"✧")+'</span><div><small>Estrella '+w.star+'</small><strong>'+esc(w.text)+'</strong></div><button type="button" data-delete-wish="'+i+'" aria-label="Eliminar deseo">×</button></article>').join("");
      list.querySelectorAll("[data-delete-wish]").forEach(b=>b.addEventListener("click",()=>{
        data.items.splice(Number(b.dataset.deleteWish),1);save();render();
      }));
    }
    box.querySelectorAll("[data-wish-star]").forEach(b=>b.addEventListener("click",()=>pick(Number(b.dataset.wishStar))));
    document.getElementById("randomWishStar").addEventListener("click",()=>pick(1+Math.floor(Math.random()*6)));
    document.getElementById("saveWish").addEventListener("click",()=>{
      const input=document.getElementById("wishInput");
      const text=input.value.trim();
      if(!text){
        input.focus();
        input.classList.add("wish-shake");
        setTimeout(()=>input.classList.remove("wish-shake"),400);
        return;
      }
      data.items.unshift({star:chosen,text,at:new Date().toISOString()});
      data.items=data.items.slice(0,18);save();input.value="";render();
      reveal.textContent="Deseo guardado en la estrella "+chosen+". Ahora le toca al universo hacer su parte ✦";
      stars[chosen-1]?.classList.add("wish-saved");
      setTimeout(()=>stars[chosen-1]?.classList.remove("wish-saved"),1100);
    });
    render();
  }

  // Galería real: 16 fotos del ZIP, ordenadas como un pequeño carrete.
  const photoGrid=document.getElementById("photoGrid");
  const photos=[
    ["Entre flores","Un comienzo tranquilo para el carrete: una foto entre flores y naturaleza."],
    ["Una sonrisa en el coche","De esas fotos espontáneas que terminan quedándose."],
    ["Bajo el sol","Un retrato sencillo, sin necesitar nada más."],
    ["Con buena compañía","Un momento acompañado que merecía entrar en el álbum."],
    ["Luces de noche","El coche, las luces y una foto con ambiente completamente distinto."],
    ["Un recuerdo juntos","Una de las pocas que no necesita demasiada explicación para destacar."],
    ["Música y feria","Una foto que encaja perfectamente con la historia de cómo os conocisteis alrededor de la música."],
    ["Un rincón de cuento","Una de las fotos más curiosas del carrete."],
    ["Otra entre flores","Porque una sola foto de ese sitio no parecía suficiente."],
    ["Una de esas miradas","Retrato cercano para cambiar el ritmo de la galería."],
    ["Modo payasa activado","Porque una galería perfecta sin alguna foto graciosa sería demasiado seria."],
    ["Con el coche","Una foto con bastante personalidad."],
    ["Otra versión","Parecida, pero suficientemente diferente como para quedarse también."],
    ["Una noche especial","Una foto nocturna para la parte final del carrete."],
    ["Esa mirada","Un pequeño detalle convertido en una foto completa."],
    ["Final navideño","Y para cerrar: una foto imposible de colocar en otro sitio sin que robe protagonismo."]
  ];
  if(photoGrid){
    const rotations=["rotate-left","rotate-right-soft","rotate-left-soft","rotate-right"];
    photoGrid.innerHTML=photos.map((p,i)=>`
      <button class="polaroid photo-card ${rotations[i%rotations.length]}" type="button" data-caption="${p[1].replace(/"/g,"&quot;")}">
        <div class="photo-placeholder miranda-photo miranda-photo-${i+1}" role="img" aria-label="${p[0]}"></div>
        <p>${p[0]}</p>
        <small class="photo-number">${String(i+1).padStart(2,"0")} / 16</small>
      </button>
    `).join("");
    photoGrid.querySelectorAll(".photo-card").forEach(button=>{
      button.addEventListener("click",()=>{
        document.getElementById("photoReveal").textContent=button.dataset.caption;
        photoGrid.querySelectorAll(".photo-card").forEach(c=>c.classList.remove("selected"));
        button.classList.add("selected");
      });
    });
    const count=document.getElementById("photoCount");
    if(count)count.textContent="16";
    const label=count?.nextElementSibling;if(label)label.textContent="fotos guardadas en este carrete";
  }
})();
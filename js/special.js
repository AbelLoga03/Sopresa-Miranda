(() => {
  const specialKey="miranda-special-v1";
  let state;
  try{state=JSON.parse(localStorage.getItem(specialKey))||{};}catch{state={};}
  state.bingo=Array.isArray(state.bingo)?state.bingo:[];
  state.puzzleSolved=!!state.puzzleSolved;
  state.noPressCount=Number(state.noPressCount)||0;
  function save(){try{localStorage.setItem(specialKey,JSON.stringify(state));}catch{}}
  function unlock(id){ if(window.mirandaUnlock) window.mirandaUnlock(id); }

  // Birthday mode: active every 17 May.
  const now=new Date();
  const isBirthday=now.getMonth()===4 && now.getDate()===17;
  if(isBirthday){
    document.body.classList.add("birthday-mode");
    document.getElementById("birthdayBanner")?.classList.remove("hidden");
    const launch=()=>{
      for(let i=0;i<42;i++){
        const p=document.createElement("span");
        p.className="secret-confetti";
        p.textContent=["✦","·","♡","✧"][Math.floor(Math.random()*4)];
        p.style.left=(Math.random()*100)+"vw";
        p.style.animationDelay=(Math.random()*1.6)+"s";
        p.style.animationDuration=(2.6+Math.random()*2)+"s";
        p.style.opacity=.45+Math.random()*.5;
        document.body.appendChild(p);
        setTimeout(()=>p.remove(),5200);
      }
    };
    launch();
    setTimeout(launch,1800);
  }

  // The forbidden button.
  const noBtn=document.getElementById("doNotPress");
  const forbiddenTexts=[
    "Te dije que no pulsaras 😌",
    "Bueno… otra vez no.",
    "Esto empieza a ser sospechoso.",
    "Vale, claramente las normas no sirven.",
    "Has encontrado otro secreto ✦"
  ];
  noBtn?.addEventListener("click",()=>{
    state.noPressCount+=1; save();
    noBtn.classList.add("angry");
    setTimeout(()=>noBtn.classList.remove("angry"),300);
    const t=document.createElement("div");
    t.className="forbidden-toast";
    t.textContent=forbiddenTexts[Math.min(state.noPressCount-1,forbiddenTexts.length-1)];
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),1800);
    if(state.noPressCount>=5)unlock("forbidden");
  });

  // 3x3 sliding puzzle.
  const board=document.getElementById("puzzleBoard");
  const solved=[1,2,3,4,5,6,7,8,0];
  let tiles=[1,2,3,4,5,6,7,0,8];
  function inversions(arr){
    const a=arr.filter(Boolean);let n=0;
    for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])n++;
    return n;
  }
  function shuffled(){
    let a;
    do{a=[...solved].sort(()=>Math.random()-.5);}while(inversions(a)%2!==0 || a.every((v,i)=>v===solved[i]));
    return a;
  }
  function renderPuzzle(){
    if(!board)return;
    board.innerHTML="";
    tiles.forEach((v,i)=>{
      const b=document.createElement("button");
      b.type="button";
      b.className="puzzle-tile"+(v===0?" empty":"");
      b.textContent=v||"";
      b.setAttribute("aria-label",v?("Pieza "+v):"Hueco");
      b.addEventListener("click",()=>moveTile(i));
      board.appendChild(b);
    });
  }
  function moveTile(i){
    const empty=tiles.indexOf(0);
    const r=Math.floor(i/3),c=i%3,er=Math.floor(empty/3),ec=empty%3;
    if(Math.abs(r-er)+Math.abs(c-ec)!==1)return;
    [tiles[i],tiles[empty]]=[tiles[empty],tiles[i]];
    renderPuzzle();
    if(tiles.every((v,j)=>v===solved[j])){
      state.puzzleSolved=true;save();
      document.getElementById("puzzleTitle").textContent="Puzzle completado ✦";
      document.getElementById("puzzleStatus").textContent="Cuando pongamos una foto real, esta será la imagen que se revele al terminar.";
      unlock("puzzle");
    }
  }
  document.getElementById("shufflePuzzle")?.addEventListener("click",()=>{tiles=shuffled();renderPuzzle();document.getElementById("puzzleTitle").textContent="Una imagen por descubrir";document.getElementById("puzzleStatus").textContent="Mueve las piezas hasta dejarlas en orden.";});
  if(board){tiles=state.puzzleSolved?[...solved]:shuffled();renderPuzzle();if(state.puzzleSolved){document.getElementById("puzzleTitle").textContent="Puzzle completado ✦";document.getElementById("puzzleStatus").textContent="Ya lo resolviste en este navegador.";}}
  
  // Bingo.
  const bingo=[...document.querySelectorAll("#bingoGrid button")];
  function renderBingo(){
    bingo.forEach((b,i)=>b.classList.toggle("marked",state.bingo.includes(i)));
    const n=state.bingo.length;
    const status=document.getElementById("bingoStatus");
    if(status) status.textContent=n+" de "+bingo.length+" casillas marcadas.";
    if(n>=bingo.length)unlock("bingo");
  }
  bingo.forEach((b,i)=>b.addEventListener("click",()=>{
    if(state.bingo.includes(i))state.bingo=state.bingo.filter(x=>x!==i);else state.bingo.push(i);
    save();renderBingo();
  }));
  renderBingo();

  // Movie credits.
  const roll=document.getElementById("creditsRoll");
  document.getElementById("playCredits")?.addEventListener("click",()=>{
    roll.classList.remove("playing");
    void roll.offsetWidth;
    roll.classList.add("playing");
    unlock("credits");
  });

  // Birthday extra wording.
  if(isBirthday){
    const finale=document.querySelector('[data-scene-id="finale"] .kicker');
    if(finale)finale.textContent="17 de mayo · Edición especial";
  }
})();
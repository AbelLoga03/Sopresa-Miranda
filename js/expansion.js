(() => {
  const KEY = "miranda-expansion-v1";
  const scenes = [...document.querySelectorAll(".scene")];
  if (scenes.length !== 23) return;

  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { state = {}; }
  state.visited = Array.isArray(state.visited) ? state.visited : [];
  state.capsules = Array.isArray(state.capsules) ? state.capsules : [];
  state.randomUses = Number(state.randomUses) || 0;
  state.slotUses = Number(state.slotUses) || 0;
  state.page24Opened = Boolean(state.page24Opened);

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  };
  const parse = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const sceneInfo = scenes.map((scene, index) => ({
    id: scene.dataset.sceneId || ("scene-" + index),
    title: String(scene.dataset.originalTitle || scene.dataset.title || ("Capítulo " + (index + 1))).replace(/^\d{2}\/23 · /, ""),
    index
  }));

  function currentStats() {
    const detailState = parse("miranda-23-details-v1", { found: [] });
    const exploreState = parse("miranda-exploration-v1", { achievements: [] });
    const microState = parse("miranda-microdetails-v1", { tokens: [] });
    const details = Array.isArray(detailState.found) ? detailState.found : [];
    const achievements = Array.isArray(exploreState.achievements) ? exploreState.achievements : [];
    const tokens = Array.isArray(microState.tokens) ? microState.tokens : [];
    const achievementIds = Array.isArray(window.mirandaAchievementIds) ? window.mirandaAchievementIds : [];
    const achievementTotal = achievementIds.length || Math.max(16, achievements.length);
    const visited = [...new Set(state.visited)].filter(id => sceneInfo.some(s => s.id === id));

    const visitScore = Math.min(1, visited.length / 23);
    const detailScore = Math.min(1, details.length / 23);
    const tokenScore = Math.min(1, tokens.length / 5);
    const achievementScore = achievementTotal ? Math.min(1, achievements.length / achievementTotal) : 0;
    const percent = Math.round((visitScore * 0.25 + detailScore * 0.45 + tokenScore * 0.1 + achievementScore * 0.2) * 100);
    const page24 = details.length >= 23 && tokens.length >= 5 && achievements.length >= achievementTotal && achievementTotal > 0;

    return { visited, details, achievements, tokens, achievementTotal, percent, page24 };
  }

  function markActiveVisited() {
    const active = scenes.find(s => s.classList.contains("active"));
    if (!active) return;
    const id = active.dataset.sceneId;
    if (id && !state.visited.includes(id)) {
      state.visited.push(id);
      save();
      renderAll();
    }
  }

  const hubButton = document.createElement("button");
  hubButton.type = "button";
  hubButton.className = "miranda-hub-toggle";
  hubButton.setAttribute("aria-label", "Abrir Centro 23");
  hubButton.innerHTML = '<span>✦</span><strong>23</strong><small id="hubPercent">0%</small>';
  document.body.appendChild(hubButton);

  const hub = document.createElement("div");
  hub.className = "miranda-hub hidden";
  hub.id = "mirandaHub";
  hub.setAttribute("role", "dialog");
  hub.setAttribute("aria-modal", "true");
  hub.setAttribute("aria-label", "Centro 23");
  hub.innerHTML = `
    <div class="miranda-hub-shell">
      <div class="hub-head">
        <div><span class="kicker">Centro 23</span><h2>Todo lo que queda por descubrir</h2></div>
        <button class="hub-close" type="button" aria-label="Cerrar">×</button>
      </div>
      <div class="hub-tabs" role="tablist">
        <button type="button" class="active" data-hub-tab="map">Mapa</button>
        <button type="button" data-hub-tab="random">Sorpréndeme</button>
        <button type="button" data-hub-tab="plans">Plan imposible</button>
        <button type="button" data-hub-tab="calendar">Calendario</button>
        <button type="button" data-hub-tab="capsules">Cápsulas</button>
      </div>

      <section class="hub-panel active" data-hub-panel="map">
        <div class="hub-progress-card">
          <div class="hub-progress-top"><div><small>Exploración global</small><strong id="hubProgressValue">0%</strong></div><span id="hubProgressStatus">Todavía queda mucho escondido.</span></div>
          <div class="hub-progress-track"><span id="hubProgressBar"></span></div>
          <div class="hub-stat-grid">
            <div><strong id="hubVisited">0/23</strong><small>visitados</small></div>
            <div><strong id="hubDetails">0/23</strong><small>detalles</small></div>
            <div><strong id="hubTokens">0/5</strong><small>mini secretos</small></div>
            <div><strong id="hubAchievements">0/16</strong><small>logros</small></div>
          </div>
        </div>
        <div class="hub-map-head"><div><span class="kicker">Radar</span><h3>Mapa de los 23 capítulos</h3></div><small>✓ detalle encontrado · ◌ visitado · ? pendiente</small></div>
        <div class="chapter-map" id="chapterMap"></div>
        <div class="page24-card locked" id="page24Card">
          <span class="page24-number">24</span>
          <div><small>Página que no aparece en el recorrido</small><strong id="page24Title">La que no debía existir</strong><p id="page24Text">Completa los 23 detalles, todos los logros y los 5 mini secretos.</p></div>
          <button type="button" id="openPage24" disabled>Bloqueada</button>
        </div>
      </section>

      <section class="hub-panel" data-hub-panel="random">
        <div class="random-stage">
          <span class="random-orbit">✦</span>
          <p class="kicker">Botón anti-aburrimiento</p>
          <h3>¿No sabes qué hacer?</h3>
          <p id="randomResult">Pulsa y la web decidirá por ti.</p>
          <div class="random-actions">
            <button class="primary" type="button" id="randomPick">Estoy aburrida 🎲</button>
            <button class="secondary hidden" type="button" id="randomGo">Ir allá →</button>
          </div>
          <small id="randomMeta">Puede mandar a un juego, recuerdo, secreto, plan o pregunta.</small>
        </div>
      </section>

      <section class="hub-panel" data-hub-panel="plans">
        <div class="slot-card">
          <p class="kicker">3 piezas · 1 plan</p>
          <h3>Máquina de planes imposibles</h3>
          <p class="helper">Mezcla lugar + actividad + comida. Algunas combinaciones tendrán demasiado sentido y otras ninguno.</p>
          <div class="slot-grid">
            <div><small>Lugar</small><strong id="slotPlace">¿?</strong></div>
            <div><small>Actividad</small><strong id="slotActivity">¿?</strong></div>
            <div><small>Algo rico</small><strong id="slotFood">¿?</strong></div>
          </div>
          <div class="slot-result" id="slotResult">Gira las tres columnas para crear un plan.</div>
          <div class="slot-actions">
            <button class="primary" type="button" id="slotSpin">Crear combinación ✦</button>
            <button class="secondary hidden" type="button" id="slotSave">♡ Guardarlo en la ruleta</button>
          </div>
        </div>
      </section>

      <section class="hub-panel" data-hub-panel="calendar">
        <div class="calendar-card">
          <div class="calendar-title"><div><span class="kicker">Fechas guardadas</span><h3>Nuestro calendario</h3></div><strong>17 MAY</strong></div>
          <div class="birthday-calendar-event"><span>🎂</span><div><strong>Cumpleaños de Miranda</strong><small>17 de mayo · evento fijo de la web</small></div></div>
          <div class="calendar-list" id="hubCalendarList"></div>
          <button class="secondary" type="button" id="goPlanner">Ir a la ruleta y añadir un plan →</button>
        </div>
      </section>

      <section class="hub-panel" data-hub-panel="capsules">
        <div class="capsule-maker">
          <p class="kicker">Para otro día</p><h3>Crea una cápsula del tiempo</h3>
          <label>Mensaje<textarea id="customCapsuleText" maxlength="240" rows="4" placeholder="Escribe algo para abrir más adelante…"></textarea></label>
          <label>Fecha de apertura<input id="customCapsuleDate" type="date"></label>
          <button class="primary" type="button" id="saveCustomCapsule">Guardar cápsula</button>
          <p class="capsule-local-note">Se guarda únicamente en este navegador.</p>
        </div>
        <div class="custom-capsule-list" id="customCapsuleList"></div>
      </section>
    </div>`;
  document.body.appendChild(hub);

  const page24 = document.createElement("div");
  page24.className = "page24-overlay hidden";
  page24.setAttribute("role", "dialog");
  page24.setAttribute("aria-modal", "true");
  page24.setAttribute("aria-label", "Página 24 secreta");
  page24.innerHTML = `
    <div class="page24-stars" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div>
    <button class="page24-close" type="button" aria-label="Cerrar">×</button>
    <div class="page24-inner">
      <span class="page24-kicker">24 · ARCHIVO IMPOSIBLE</span>
      <h2>La página que no debía existir.</h2>
      <p class="page24-lead">Si estás leyendo esto es porque no te conformaste con llegar al final: encontraste lo que estaba escondido por todo el recorrido.</p>
      <div class="page24-proof">
        <span>23/23 detalles</span><span>5/5 mini secretos</span><span>todos los logros</span>
      </div>
      <div class="page24-message">
        <small>Mensaje desbloqueado</small>
        <p>Esta página queda reservada para una sorpresa extra que solo aparece después de descubrirlo absolutamente todo. Puedes convertirla en una foto, una pista para un regalo físico, un vídeo o un último mensaje especial.</p>
      </div>
      <button class="page24-again" type="button">Lanzar confeti secreto ✦</button>
    </div>`;
  document.body.appendChild(page24);

  const toast = document.createElement("div");
  toast.className = "hub-toast";
  document.body.appendChild(toast);
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function openHub(tab) {
    hub.classList.remove("hidden");
    document.body.classList.add("hub-open");
    switchTab(tab || "map");
    renderAll();
  }
  function closeHub() {
    hub.classList.add("hidden");
    document.body.classList.remove("hub-open");
  }
  function switchTab(name) {
    hub.querySelectorAll("[data-hub-tab]").forEach(b => b.classList.toggle("active", b.dataset.hubTab === name));
    hub.querySelectorAll("[data-hub-panel]").forEach(p => p.classList.toggle("active", p.dataset.hubPanel === name));
    if (name === "calendar") renderCalendar();
    if (name === "capsules") renderCapsules();
  }

  hubButton.addEventListener("click", () => openHub("map"));
  hub.querySelector(".hub-close").addEventListener("click", closeHub);
  hub.addEventListener("click", e => { if (e.target === hub) closeHub(); });
  hub.querySelectorAll("[data-hub-tab]").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.hubTab)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeHub();
      page24.classList.add("hidden");
    }
  });

  function goToScene(id) {
    const info = sceneInfo.find(s => s.id === id);
    if (!info) return;
    closeHub();
    if (typeof window.mirandaShowScene === "function") window.mirandaShowScene(info.index);
    else {
      scenes.forEach((s, i) => s.classList.toggle("active", i === info.index));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setTimeout(markActiveVisited, 100);
  }

  function renderMap() {
    const stats = currentStats();
    const map = document.getElementById("chapterMap");
    if (!map) return;
    map.innerHTML = sceneInfo.map(info => {
      const found = stats.details.includes(info.id);
      const visited = stats.visited.includes(info.id);
      const status = found ? "found" : visited ? "visited" : "pending";
      const icon = found ? "✓" : visited ? "◌" : "?";
      return '<button type="button" class="chapter-map-item ' + status + '" data-map-id="' + esc(info.id) + '"><span>' + String(info.index + 1).padStart(2, "0") + '</span><div><strong>' + esc(info.title) + '</strong><small>' + (found ? "Detalle encontrado" : visited ? "Visitado" : "Pendiente") + '</small></div><em>' + icon + '</em></button>';
    }).join("");
    map.querySelectorAll("[data-map-id]").forEach(btn => btn.addEventListener("click", () => goToScene(btn.dataset.mapId)));

    document.getElementById("hubProgressValue").textContent = stats.percent + "%";
    document.getElementById("hubProgressBar").style.width = stats.percent + "%";
    document.getElementById("hubPercent").textContent = stats.percent + "%";
    document.getElementById("hubVisited").textContent = stats.visited.length + "/23";
    document.getElementById("hubDetails").textContent = stats.details.length + "/23";
    document.getElementById("hubTokens").textContent = stats.tokens.length + "/5";
    document.getElementById("hubAchievements").textContent = stats.achievements.length + "/" + stats.achievementTotal;
    document.getElementById("hubProgressStatus").textContent =
      stats.percent >= 100 ? "Todo descubierto. Esto ya es sospechoso." :
      stats.percent >= 75 ? "Estás peligrosamente cerca de encontrarlo todo." :
      stats.percent >= 40 ? "Ya has encontrado bastante, pero todavía quedan rincones." :
      "Todavía queda mucho escondido.";

    const card = document.getElementById("page24Card");
    const button = document.getElementById("openPage24");
    if (stats.page24) {
      card.classList.remove("locked");
      card.classList.add("unlocked");
      button.disabled = false;
      button.textContent = "Abrir página 24 →";
      document.getElementById("page24Text").textContent = "La condición imposible se ha cumplido. Ya puedes entrar.";
    } else {
      card.classList.add("locked");
      card.classList.remove("unlocked");
      button.disabled = true;
      button.textContent = "Bloqueada";
      document.getElementById("page24Text").textContent =
        "Faltan " + Math.max(0, 23 - stats.details.length) + " detalles, " +
        Math.max(0, 5 - stats.tokens.length) + " mini secretos y " +
        Math.max(0, stats.achievementTotal - stats.achievements.length) + " logros.";
    }
  }

  function secretConfetti() {
    const symbols = ["✦","✧","♡","·"];
    for (let i = 0; i < 42; i++) {
      const s = document.createElement("span");
      s.className = "page24-confetti";
      s.textContent = symbols[i % symbols.length];
      s.style.left = (5 + Math.random() * 90) + "vw";
      s.style.setProperty("--drift", ((Math.random() - .5) * 220) + "px");
      s.style.animationDelay = (Math.random() * .45) + "s";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 3400);
    }
  }

  document.getElementById("openPage24").addEventListener("click", () => {
    if (!currentStats().page24) return;
    closeHub();
    state.page24Opened = true;
    save();
    page24.classList.remove("hidden");
    secretConfetti();
  });
  page24.querySelector(".page24-close").addEventListener("click", () => page24.classList.add("hidden"));
  page24.querySelector(".page24-again").addEventListener("click", secretConfetti);

  const randomIdeas = [
    { type: "Juego", text: "Intenta completar el puzzle sin usar ninguna pista.", scene: "puzzle" },
    { type: "Juego", text: "Ve al memory y trata de mejorar tu número de movimientos.", scene: "memorygame" },
    { type: "Recuerdo", text: "Abre una foto al azar y cuenta la historia completa de ese momento.", scene: "gallery" },
    { type: "Recuerdo", text: "Elige una estrella de la constelación y conviértela en un recuerdo real.", scene: "constellation" },
    { type: "Misterio", text: "Revisa el mapa y entra en el primer capítulo que todavía aparezca pendiente.", scene: "__pending__" },
    { type: "Plan", text: "Crea ahora mismo un plan absurdo con la máquina de tres piezas.", tab: "plans" },
    { type: "Plan", text: "Gira la ruleta una vez y acepta el resultado sin repetir.", scene: "plans" },
    { type: "Pregunta", text: "¿Qué momento de este año guardarías si solo pudieras conservar uno?" },
    { type: "Pregunta", text: "¿Qué sitio elegirías para una escapada improvisada mañana mismo?" },
    { type: "Pregunta", text: "¿Qué pequeño detalle te hace pensar inmediatamente en la otra persona?" },
    { type: "Secreto", text: "Busca una pista en el capítulo que menos hayas explorado.", scene: "__pending__" },
    { type: "Reto", text: "Marca una casilla del bingo que de verdad quieras completar próximamente.", scene: "bingo" }
  ];
  let randomTarget = null;
  document.getElementById("randomPick").addEventListener("click", () => {
    state.randomUses += 1;
    save();
    const pick = randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
    randomTarget = pick;
    if (pick.scene === "__pending__") {
      const stats = currentStats();
      const pending = sceneInfo.find(s => !stats.details.includes(s.id));
      randomTarget = { ...pick, scene: pending ? pending.id : "intro" };
    }
    document.getElementById("randomResult").innerHTML = '<small>' + esc(pick.type) + '</small>' + esc(pick.text);
    const go = document.getElementById("randomGo");
    go.classList.toggle("hidden", !(randomTarget.scene || randomTarget.tab));
    document.getElementById("randomMeta").textContent = "Intento #" + state.randomUses + " · si no te gusta, el azar acepta reclamaciones.";
    renderMap();
  });
  document.getElementById("randomGo").addEventListener("click", () => {
    if (!randomTarget) return;
    if (randomTarget.tab) switchTab(randomTarget.tab);
    else if (randomTarget.scene) goToScene(randomTarget.scene);
  });

  const places = ["un mirador", "un sitio nuevo", "el centro de un pueblo", "la playa", "una cafetería nueva", "un parque tranquilo", "una carretera con buenas vistas", "casa con luces apagadas", "un rincón para ver el atardecer", "un lugar elegido al azar en el mapa"];
  const activities = ["hacer 10 fotos", "elegir una canción cada uno", "jugar a preguntas", "dar un paseo sin ruta", "hacer una mini competición absurda", "crear una lista de próximos planes", "ver el atardecer", "grabar un vídeo corto del día", "comprar algo por menos de 5 € para el otro", "inventar una historia sobre la gente que pase"];
  const foods = ["helado", "pizza", "algo dulce", "patatas", "una merienda improvisada", "chocolate", "un postre nuevo", "bebida favorita", "algo elegido con los ojos cerrados", "lo primero que apetezca"];
  let generatedPlan = "";

  function spinSlot() {
    state.slotUses += 1;
    save();
    const a = places[Math.floor(Math.random() * places.length)];
    const b = activities[Math.floor(Math.random() * activities.length)];
    const c = foods[Math.floor(Math.random() * foods.length)];
    generatedPlan = "Ir a " + a + ", " + b + " y terminar con " + c + ".";
    const ids = [["slotPlace", a], ["slotActivity", b], ["slotFood", c]];
    ids.forEach(([id, value], i) => {
      const el = document.getElementById(id);
      el.classList.remove("slot-pop");
      void el.offsetWidth;
      setTimeout(() => { el.textContent = value; el.classList.add("slot-pop"); }, i * 110);
    });
    document.getElementById("slotResult").textContent = generatedPlan;
    document.getElementById("slotSave").classList.remove("hidden");
    renderMap();
  }
  document.getElementById("slotSpin").addEventListener("click", spinSlot);
  document.getElementById("slotSave").addEventListener("click", () => {
    if (!generatedPlan) return;
    const input = document.getElementById("customPlanInput");
    const add = document.getElementById("customPlanAdd");
    if (input && add) {
      input.value = generatedPlan;
      add.click();
      showToast("Plan guardado en vuestra lista ✦");
      renderCalendar();
    } else {
      navigator.clipboard?.writeText(generatedPlan).catch(() => {});
      showToast("Plan copiado");
    }
  });

  function renderCalendar() {
    const list = document.getElementById("hubCalendarList");
    if (!list) return;
    const planState = parse("miranda-plans-v1", { plans: [] });
    const plans = Array.isArray(planState.plans) ? planState.plans : [];
    const dated = plans.filter(p => p && p.date).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    if (!dated.length) {
      list.innerHTML = '<div class="calendar-empty">Todavía no hay planes con fecha. Puedes programarlos desde la ruleta.</div>';
      return;
    }
    list.innerHTML = dated.slice(0, 12).map(p => {
      const d = new Date(String(p.date) + "T12:00:00");
      const label = Number.isNaN(d.getTime()) ? esc(p.date) : d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
      return '<div class="calendar-event"><span>' + esc(label) + '</span><div><strong>' + esc(p.text || p.name || "Plan guardado") + '</strong><small>' + esc(p.time || "Sin hora") + (p.note ? " · " + esc(p.note) : "") + '</small></div></div>';
    }).join("");
  }
  document.getElementById("goPlanner").addEventListener("click", () => goToScene("plans"));

  function capsuleStatus(capsule) {
    const now = new Date();
    const openAt = new Date(capsule.date + "T00:00:00");
    return !Number.isNaN(openAt.getTime()) && now >= openAt;
  }
  function renderCapsules() {
    const list = document.getElementById("customCapsuleList");
    if (!list) return;
    if (!state.capsules.length) {
      list.innerHTML = '<div class="capsule-empty">Todavía no has creado ninguna cápsula propia.</div>';
      return;
    }
    list.innerHTML = state.capsules.map((c, i) => {
      const open = capsuleStatus(c);
      const d = new Date(c.date + "T12:00:00");
      const label = Number.isNaN(d.getTime()) ? c.date : d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
      return '<article class="custom-capsule ' + (open ? "open" : "locked") + '"><span>' + (open ? "✦" : "◇") + '</span><div><small>' + (open ? "Disponible" : "Bloqueada hasta " + esc(label)) + '</small><strong>' + (open ? esc(c.text) : "Mensaje oculto") + '</strong></div><button type="button" data-delete-capsule="' + i + '" aria-label="Eliminar cápsula">×</button></article>';
    }).join("");
    list.querySelectorAll("[data-delete-capsule]").forEach(btn => btn.addEventListener("click", () => {
      state.capsules.splice(Number(btn.dataset.deleteCapsule), 1);
      save();
      renderCapsules();
    }));
  }
  document.getElementById("saveCustomCapsule").addEventListener("click", () => {
    const text = document.getElementById("customCapsuleText").value.trim();
    const date = document.getElementById("customCapsuleDate").value;
    if (!text || !date) { showToast("Escribe un mensaje y elige una fecha."); return; }
    state.capsules.unshift({ text, date, createdAt: new Date().toISOString() });
    state.capsules = state.capsules.slice(0, 12);
    save();
    document.getElementById("customCapsuleText").value = "";
    document.getElementById("customCapsuleDate").value = "";
    renderCapsules();
    showToast("Cápsula guardada ◇");
  });

  function renderAll() {
    renderMap();
    if (hub.querySelector('[data-hub-panel="calendar"]').classList.contains("active")) renderCalendar();
    if (hub.querySelector('[data-hub-panel="capsules"]').classList.contains("active")) renderCapsules();
  }

  const observer = new MutationObserver(() => {
    markActiveVisited();
    renderAll();
  });
  scenes.forEach(scene => observer.observe(scene, { attributes: true, attributeFilter: ["class"] }));
  window.addEventListener("storage", renderAll);
  document.addEventListener("click", () => setTimeout(renderAll, 80), true);

  markActiveVisited();
  renderAll();

  window.mirandaCenter23 = { open: openHub, render: renderAll, stats: currentStats };
})();
(() => {
  const CONFIG = {
    birthday: null, // Ejemplo: "2026-11-18T00:00:00"
    relationshipStart: null, // Ejemplo: "2025-02-14"
    reasons: [
      "Aquí aparecerá una razón personal que quieras dedicarle.",
      "Un pequeño detalle que admires de ella.",
      "Un recuerdo que siempre consiga hacerte sonreír.",
      "Algo de su forma de ser que valores especialmente.",
      "Un momento que todavía quieras vivir juntos."
    ],
    plans: [
      "Cena especial",
      "Peli + algo rico",
      "Paseo sin prisa",
      "Escapada improvisada",
      "Tarde de fotos",
      "Plan sorpresa",
      "Cocinar algo juntos",
      "Elegir un sitio nuevo"
    ],
    quiz: [
      {
        question: "¿Cuál de estos podría ser uno de vuestros primeros recuerdos?",
        options: ["El recuerdo real que añadiremos después", "Una expedición al Polo Norte", "Un viaje secreto a Marte"],
        correct: 0
      },
      {
        question: "¿Qué debería aparecer aquí en la versión final?",
        options: ["Una pregunta vuestra de verdad", "Un examen de matemáticas", "La previsión del tiempo"],
        correct: 0
      },
      {
        question: "¿Qué premio merece llegar hasta el final?",
        options: ["La sorpresa final", "Volver al principio sin ver nada", "Una pantalla en blanco"],
        correct: 0
      }
    ]
  };

  const scenes = [...document.querySelectorAll(".scene")];
  const progressBar = document.getElementById("progressBar");
  const stepCounter = document.getElementById("stepCounter");
  const chapterLabel = document.getElementById("chapterLabel");
  const visited = new Set();
  let current = 0;

  function showScene(index) {
    current = Math.max(0, Math.min(index, scenes.length - 1));
    scenes.forEach((scene, i) => scene.classList.toggle("active", i === current));
    visited.add(scenes[current].dataset.sceneId || String(current));
    progressBar.style.width = (((current + 1) / scenes.length) * 100) + "%";
    stepCounter.textContent = (current + 1) + " / " + scenes.length;
    chapterLabel.textContent = scenes[current].dataset.title || "";
    if (scenes[current].dataset.sceneId === "finale") runFinale();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".next").forEach(b => b.addEventListener("click", () => showScene(current + 1)));
  document.querySelectorAll(".prev").forEach(b => b.addEventListener("click", () => showScene(current - 1)));

  document.querySelectorAll(".memory-card").forEach(button => {
    button.addEventListener("click", () => document.getElementById("memoryReveal").textContent = button.dataset.memory);
  });

  document.querySelectorAll(".constellation-star").forEach(button => {
    button.addEventListener("click", () => document.getElementById("constellationReveal").textContent = button.dataset.memory);
  });

  document.querySelectorAll(".photo-card").forEach(button => {
    button.addEventListener("click", () => document.getElementById("photoReveal").textContent = button.dataset.caption);
  });

  document.getElementById("randomMemory").addEventListener("click", () => {
    const cards = [...document.querySelectorAll(".photo-card")];
    const chosen = cards[Math.floor(Math.random() * cards.length)];
    document.getElementById("photoReveal").textContent = chosen.dataset.caption;
    chosen.animate([{transform:"scale(1)"},{transform:"scale(1.035)"},{transform:"scale(1)"}], {duration:450});
  });

  let reasonIndex = 0;
  document.getElementById("reasonButton").addEventListener("click", () => {
    reasonIndex = (reasonIndex + 1) % CONFIG.reasons.length;
    document.getElementById("reasonText").textContent = CONFIG.reasons[reasonIndex];
  });

  document.querySelectorAll(".open-when").forEach(button => {
    button.addEventListener("click", () => document.getElementById("openWhenReveal").textContent = button.dataset.message);
  });

  let quizIndex = 0, score = 0, answered = false;
  const quizQuestion = document.getElementById("quizQuestion");
  const quizOptions = document.getElementById("quizOptions");
  const quizResult = document.getElementById("quizResult");
  const quizProgress = document.getElementById("quizProgress");
  const quizScore = document.getElementById("quizScore");
  const nextQuestion = document.getElementById("nextQuestion");

  function renderQuiz() {
    const q = CONFIG.quiz[quizIndex];
    answered = false;
    quizQuestion.textContent = q.question;
    quizProgress.textContent = "Pregunta " + (quizIndex + 1) + " de " + CONFIG.quiz.length;
    quizScore.textContent = score + " puntos";
    quizResult.textContent = "Elige una respuesta.";
    quizOptions.innerHTML = "";
    nextQuestion.classList.add("hidden");

    q.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        [...quizOptions.children].forEach((b, i) => {
          if (i === q.correct) b.classList.add("correct");
          else if (i === index) b.classList.add("wrong");
        });
        if (index === q.correct) {
          score += 1;
          quizResult.textContent = "Correcto ✦";
        } else {
          quizResult.textContent = "Casi. En la versión final habrá respuestas reales.";
        }
        quizScore.textContent = score + " puntos";
        if (quizIndex < CONFIG.quiz.length - 1) nextQuestion.classList.remove("hidden");
        else quizResult.textContent += " Resultado: " + score + "/" + CONFIG.quiz.length + ".";
      });
      quizOptions.appendChild(button);
    });
  }
  nextQuestion.addEventListener("click", () => { if (quizIndex < CONFIG.quiz.length - 1) { quizIndex += 1; renderQuiz(); }});
  renderQuiz();

  let wheelTurns = 0;
  document.getElementById("spinPlan").addEventListener("click", () => {
    const result = CONFIG.plans[Math.floor(Math.random() * CONFIG.plans.length)];
    wheelTurns += 720 + Math.floor(Math.random() * 360);
    document.getElementById("planWheel").style.transform = "rotate(" + wheelTurns + "deg)";
    document.getElementById("planResult").textContent = result;
  });

  const letterButton = document.getElementById("letterButton");
  const letter = document.getElementById("letter");
  const finalReveal = document.getElementById("finalReveal");
  letterButton.addEventListener("click", () => {
    letterButton.classList.add("open");
    letterButton.setAttribute("aria-expanded", "true");
    letter.classList.remove("hidden");
    finalReveal.classList.remove("hidden");
  });
  finalReveal.addEventListener("click", () => showScene(scenes.length - 1));

  function runFinale() {
    const count = document.getElementById("cinemaCount");
    const content = document.getElementById("finalContent");
    if (content.dataset.played) return;
    content.dataset.played = "1";
    content.classList.add("hidden");
    count.classList.remove("hidden");
    let n = 3;
    count.textContent = n;
    const timer = setInterval(() => {
      n -= 1;
      if (n > 0) count.textContent = n;
      else {
        clearInterval(timer);
        count.classList.add("hidden");
        content.classList.remove("hidden");
        document.getElementById("completionMessage").textContent =
          visited.size >= scenes.length - 1 ? "Has recorrido prácticamente toda la historia ✦" : "Has llegado hasta el final.";
      }
    }, 650);
  }

  document.getElementById("restartButton").addEventListener("click", () => {
    letterButton.classList.remove("open");
    letterButton.setAttribute("aria-expanded", "false");
    letter.classList.add("hidden");
    finalReveal.classList.add("hidden");
    document.getElementById("finalContent").removeAttribute("data-played");
    showScene(0);
  });

  function updateCountdown() {
    const message = document.getElementById("countdownMessage");
    if (!CONFIG.birthday) {
      message.textContent = "La fecha se añadirá cuando personalicemos la versión final.";
      return;
    }
    const now = new Date();
    const target = new Date(CONFIG.birthday);
    let diff = target - now;
    if (Number.isNaN(target.getTime())) return;
    if (diff <= 0) {
      document.getElementById("days").textContent = "0";
      document.getElementById("hours").textContent = "0";
      document.getElementById("minutes").textContent = "0";
      document.getElementById("seconds").textContent = "0";
      message.textContent = "Hoy es el día ✦";
      return;
    }
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const s = Math.floor(diff / 1000);
    document.getElementById("days").textContent = d;
    document.getElementById("hours").textContent = h;
    document.getElementById("minutes").textContent = m;
    document.getElementById("seconds").textContent = s;
    message.textContent = "Cada segundo acerca un poco más la sorpresa.";
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (CONFIG.relationshipStart) {
    const start = new Date(CONFIG.relationshipStart + "T00:00:00");
    const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
    document.getElementById("daysTogether").textContent = Number.isFinite(days) ? days : "—";
  }

  const secretModal = document.getElementById("secretModal");
  let secretClicks = 0, secretTimer;
  document.getElementById("secretTrigger").addEventListener("click", () => {
    secretClicks += 1;
    clearTimeout(secretTimer);
    secretTimer = setTimeout(() => secretClicks = 0, 1800);
    if (secretClicks >= 5) {
      secretClicks = 0;
      secretModal.classList.remove("hidden");
    }
  });
  document.getElementById("secretClose").addEventListener("click", () => secretModal.classList.add("hidden"));
  secretModal.addEventListener("click", e => { if (e.target === secretModal) secretModal.classList.add("hidden"); });

  document.addEventListener("pointerdown", e => {
    if (e.target.closest("input, textarea, select")) return;
    const spark = document.createElement("span");
    spark.className = "tap-spark";
    spark.textContent = Math.random() > .55 ? "✦" : "·";
    spark.style.left = e.clientX + "px";
    spark.style.top = e.clientY + "px";
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  });

  const soundToggle = document.getElementById("soundToggle");
  let audioContext = null, oscillator = null, gainNode = null;
  soundToggle.addEventListener("click", () => {
    const active = soundToggle.getAttribute("aria-pressed") === "true";
    if (active) {
      if (gainNode && audioContext) gainNode.gain.setTargetAtTime(0, audioContext.currentTime, .08);
      setTimeout(() => { if (oscillator) oscillator.stop(); oscillator=null; if(audioContext) audioContext.close(); audioContext=null; }, 150);
      soundToggle.setAttribute("aria-pressed","false");
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx(); oscillator = audioContext.createOscillator(); gainNode = audioContext.createGain();
      oscillator.type = "sine"; oscillator.frequency.value = 220; gainNode.gain.value = .01;
      oscillator.connect(gainNode); gainNode.connect(audioContext.destination); oscillator.start();
      soundToggle.setAttribute("aria-pressed","true");
    } catch { soundToggle.setAttribute("aria-pressed","false"); }
  });

  showScene(0);
})();
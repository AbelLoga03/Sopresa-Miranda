(() => {
  const scenes = [...document.querySelectorAll(".scene")];
  const progressBar = document.getElementById("progressBar");
  const stepCounter = document.getElementById("stepCounter");
  const chapterLabel = document.getElementById("chapterLabel");
  let current = 0;

  function showScene(index) {
    current = Math.max(0, Math.min(index, scenes.length - 1));
    scenes.forEach((scene, i) => scene.classList.toggle("active", i === current));
    progressBar.style.width = (((current + 1) / scenes.length) * 100) + "%";
    stepCounter.textContent = (current + 1) + " / " + scenes.length;
    chapterLabel.textContent = scenes[current].dataset.title || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".next").forEach(button => {
    button.addEventListener("click", () => showScene(current + 1));
  });

  document.querySelectorAll(".prev").forEach(button => {
    button.addEventListener("click", () => showScene(current - 1));
  });

  document.querySelectorAll(".memory-card").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("memoryReveal").textContent = button.dataset.memory;
    });
  });

  document.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".quiz-option").forEach(option => option.classList.remove("correct"));
      const result = document.getElementById("quizResult");
      if (button.dataset.correct === "true") {
        button.classList.add("correct");
        result.textContent = "Correcto ✨ En la versión final pondremos aquí una pregunta vuestra de verdad.";
      } else {
        result.textContent = "No era esa 😄. La respuesta real la personalizaremos después.";
      }
    });
  });

  const reasons = [
    "Aquí aparecerá una razón personal que quieras dedicarle.",
    "Un pequeño detalle que admires de ella.",
    "Un recuerdo que siempre consiga hacerte sonreír.",
    "Algo de su forma de ser que valores especialmente.",
    "Un momento que todavía quieras vivir juntos."
  ];
  let reasonIndex = 0;
  document.getElementById("reasonButton").addEventListener("click", () => {
    reasonIndex = (reasonIndex + 1) % reasons.length;
    document.getElementById("reasonText").textContent = reasons[reasonIndex];
  });

  document.querySelectorAll(".open-when").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("openWhenReveal").textContent = button.dataset.message;
    });
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

  document.getElementById("restartButton").addEventListener("click", () => {
    letterButton.classList.remove("open");
    letterButton.setAttribute("aria-expanded", "false");
    letter.classList.add("hidden");
    finalReveal.classList.add("hidden");
    showScene(0);
  });

  const soundToggle = document.getElementById("soundToggle");
  let audioContext = null;
  let oscillator = null;
  let gainNode = null;

  soundToggle.addEventListener("click", () => {
    const active = soundToggle.getAttribute("aria-pressed") === "true";

    if (active) {
      if (gainNode) gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.08);
      setTimeout(() => {
        if (oscillator) oscillator.stop();
        oscillator = null;
        if (audioContext) audioContext.close();
        audioContext = null;
      }, 150);
      soundToggle.setAttribute("aria-pressed", "false");
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      audioContext = new AudioCtx();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 220;
      gainNode.gain.value = 0.012;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();

      soundToggle.setAttribute("aria-pressed", "true");
    } catch {
      soundToggle.setAttribute("aria-pressed", "false");
    }
  });

  showScene(0);
})();

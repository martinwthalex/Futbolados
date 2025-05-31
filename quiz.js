let maxTime = 60; // seconds
let timeLeft = maxTime;
let questions = [];
let remainingQuestions = [];
let currentQuestion = null;
let correctAnswers = 0;
let timer = null;
let quizActive = false;

const progressBar = document.getElementById("progress-bar");
const questionElem = document.getElementById("question");
const answerButtons = Array.from(document.getElementsByClassName("answer-button"));
const endingContainer = document.getElementById("ending-container");
const gameContainer = document.getElementById("game-container");
const finalScoreElem = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const exitBtn = document.getElementById("exit-btn");
const timeCanvas = document.getElementById("time-canvas");
const ctx = timeCanvas.getContext("2d");
const canvasWidth = timeCanvas.width;
const canvasHeight = timeCanvas.height;


const bgCanvas = document.getElementById("background-canvas");
const bgCtx = bgCanvas.getContext("2d");
let bgStadiumImg = new Image();

function setBgStadiumImgByOrientation() {
  const isMobile = window.innerWidth <= 600;
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const newSrc = (isMobile && isPortrait)
    ? "./src/img/backgrounds/stadium0_movil.jpg"
    : "./src/img/backgrounds/stadium0.jpg";
  if (bgStadiumImg.src !== window.location.origin + newSrc.replace('./', '/')) {
    bgStadiumImg.src = newSrc;
  }
}

window.addEventListener("resize", () => {
  setBgStadiumImgByOrientation();
  resizeBackgroundCanvas();
});
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    setBgStadiumImgByOrientation();
    resizeBackgroundCanvas();
  }, 100); // Espera a que el navegador actualice dimensiones
});
// Espera a que el layout esté listo antes de decidir la imagen de fondo
window.addEventListener("load", () => {
  setTimeout(() => {
    setBgStadiumImgByOrientation();
    resizeBackgroundCanvas();
  },10); // Pequeño retardo para asegurar viewport correcto en móviles
});


let confettiParticles = [];
let confettiActive = false;
const confettiStarImg = new Image();
confettiStarImg.src = "./src/sprites/star.png";


const ballSprite = new Image();
ballSprite.src = "./src/sprites/ball.png";
const BALL_FRAMES = 10;
const BALL_FRAME_WIDTH = 512;
const BALL_FRAME_HEIGHT = 512;
const BALL_FPS = 18;
let ballAnimActive = false;
let ballFrame = 0;
let ballStartTime = 0;
let ballX = 0;
let ballY = 0;
let ballScale = 1;

function resizeBackgroundCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  drawBackgroundStadium();
}

function drawBackgroundStadium() {
  // Clear
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  // Draw stadium image stretched to canvas
  if (bgStadiumImg.complete && bgStadiumImg.naturalWidth > 0) {
    bgCtx.drawImage(bgStadiumImg, 0, 0, bgCanvas.width, bgCanvas.height);
  }
}

function launchConfetti() {
  confettiParticles = [];
  confettiActive = true;
  const count = 80;
  const stadiumTop = Math.floor(bgCanvas.height * 0.32); // Aproximadamente la grada superior
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * bgCanvas.width,
      y: stadiumTop + Math.random() * 10,
      r: 18 + Math.random() * 10, // tamaño
      vx: (Math.random() - 0.5) * 2,
      vy: 0.7 + Math.random() * 1.2, 
      ay: 0.03 + Math.random() * 0.04,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2
    });
  }
  requestAnimationFrame(animateConfetti);
}

function animateConfetti() {
  drawBackgroundStadium();
  for (let p of confettiParticles) {

    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.ay;
    p.angle += p.spin;

    bgCtx.save();
    bgCtx.translate(p.x, p.y);
    bgCtx.rotate(p.angle);
    if (confettiStarImg.complete) {
      bgCtx.drawImage(confettiStarImg, -p.r/2, -p.r/2, p.r, p.r);
    }
    bgCtx.restore();
  }

  confettiParticles = confettiParticles.filter(p => p.y < bgCanvas.height + 20);
  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiActive = false;
    drawBackgroundStadium();
  }
}

function launchBallBounce() {
  ballAnimActive = true;
  ballFrame = 0;
  ballStartTime = performance.now();
  // Centra el balón en la parte baja del campo
  ballX = bgCanvas.width / 2 - BALL_FRAME_WIDTH / 4;
  ballY = bgCanvas.height * 0.7;
  ballScale = Math.min(bgCanvas.width, bgCanvas.height) / 1200; // Escala adaptativa
  requestAnimationFrame(animateBallBounce);
}

function animateBallBounce(ts) {
  // Redibuja el fondo y confetti si está activo
  drawBackgroundStadium();
  if (confettiActive) animateConfetti();

  // Calcula el frame actual
  const elapsed = ts - ballStartTime;
  const frameIdx = Math.floor(elapsed / (1000 / BALL_FPS));
  if (frameIdx >= BALL_FRAMES) {
    ballAnimActive = false;
    drawBackgroundStadium();
    if (confettiActive) animateConfetti();
    return;
  }
  ballFrame = frameIdx;

  // Calcula la posición Y para simular el bote (parábola simple)
  const bounceProgress = frameIdx / (BALL_FRAMES - 1);
  const bounceHeight = Math.sin(Math.PI * bounceProgress) * (bgCanvas.height * 0.18);
  const drawY = ballY - bounceHeight;

  // Dibuja el balón animado
  if (ballSprite.complete) {
    bgCtx.drawImage(
      ballSprite,
      ballFrame * BALL_FRAME_WIDTH, 0,
      BALL_FRAME_WIDTH, BALL_FRAME_HEIGHT,
      ballX,
      drawY,
      BALL_FRAME_WIDTH * ballScale,
      BALL_FRAME_HEIGHT * ballScale
    );
  }

  if (ballAnimActive) {
    requestAnimationFrame(animateBallBounce);
  } else {
    drawBackgroundStadium();
    if (confettiActive) animateConfetti();
  }
}

// Redibuja el fondo al cargar y al cambiar tamaño
bgStadiumImg.onload = resizeBackgroundCanvas;
window.addEventListener("resize", resizeBackgroundCanvas);
window.addEventListener("DOMContentLoaded", resizeBackgroundCanvas);

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loadQuestions() {
  const res = await fetch("./data/preguntas.json");
  questions = await res.json();
}

function showQuestion() {
  if (remainingQuestions.length === 0) {
    // Si se acaban las preguntas, volvemos a barajar (opcional: puedes terminar el juego aquí si prefieres)
    remainingQuestions = [...questions];
    shuffle(remainingQuestions);
  }
  currentQuestion = remainingQuestions.pop();
  // Shuffle options so the correct answer is not always in the same position
  const shuffledOptions = [...currentQuestion.opciones];
  shuffle(shuffledOptions);

  // Animación: fade out/in
  gameContainer.classList.add("fade");
  setTimeout(() => {
    questionElem.textContent = currentQuestion.pregunta;
    answerButtons.forEach((btn, idx) => {
      btn.textContent = shuffledOptions[idx];
      btn.disabled = false;
      btn.classList.remove("correct", "wrong");
    });
    // Quita la clase fade después de la animación
    setTimeout(() => {
      gameContainer.classList.remove("fade");
    }, 400);
  }, 180);
}

function answerFeedback(btn, isCorrect) {
  btn.classList.add(isCorrect ? "correct" : "wrong");
  if (isCorrect && !confettiActive) {
    launchConfetti();
    launchBallBounce(); // <-- Añade esto para animar el balón
    if (window.playGoal) window.playGoal();
  }
  if (!isCorrect && window.playFail) {
    window.playFail();
  }
}

function nextQuestion() {
  showQuestion();
}

function handleAnswer(idx) {
  if (!quizActive) return;
  const btn = answerButtons[idx];
  const isCorrect = btn.textContent === currentQuestion.respuesta;
  answerFeedback(btn, isCorrect);
  answerButtons.forEach(b => b.disabled = true);
  if (isCorrect) correctAnswers++;
  setTimeout(nextQuestion, 600);
}

function drawTimeBar() {
  // Clear
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate percent
  const percent = Math.max(0, timeLeft / maxTime);
  const barWidth = Math.floor(canvasWidth * percent);

  // Color: green -> yellow -> red
  let grad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  if (percent > 0.5) {
    grad.addColorStop(0, "#43e97b");
    grad.addColorStop(1, "#f9d423");
  } else {
    grad.addColorStop(0, "#f9d423");
    grad.addColorStop(1, "#ff1744");
  }

  // Draw background bar (gray)
  ctx.fillStyle = "#444";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw time bar
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, barWidth, canvasHeight);

  // Draw border
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

  // Draw time text
  ctx.font = "bold 18px Orbitron, Arial, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${timeLeft}s`, canvasWidth / 2, canvasHeight / 2);
}

function updateProgressBar() {
  drawTimeBar();
}

let musicAccelerated = false;

function startTimer() {
  musicAccelerated = false;
  if (window.setMenuMusicRate) window.setMenuMusicRate(1);
  timer = setInterval(() => {
    timeLeft--;
    updateProgressBar();

    // Música: acelera progresivamente en los últimos 15 segundos (máx 1.5x)
    if (window.setMenuMusicRate) {
      if (timeLeft <= 15 && timeLeft > 0) {
        // Progresivo: de 1x a 1.5x entre 15 y 0 segundos
        const rate = 1 + 0.5 * ((15 - timeLeft) / 15);
        window.setMenuMusicRate(Math.min(rate, 1.5));
        musicAccelerated = true;
      }
    }

    if (timeLeft <= 0) {
      if (window.setMenuMusicRate) window.setMenuMusicRate(1);
      endQuiz();
    }
  }, 1000);
}

function endQuiz() {
  quizActive = false;
  clearInterval(timer);
  gameContainer.style.display = "none";
  endingContainer.style.display = "block";
  finalScoreElem.textContent = `Respuestas correctas: ${correctAnswers}`;
  saveScore(correctAnswers);
  
  if (window.stopMenuMusic) window.stopMenuMusic();

  if (window.setMenuMusicRate) window.setMenuMusicRate(1);
}

function startQuiz() {
  correctAnswers = 0;
  timeLeft = maxTime;
  remainingQuestions = [...questions];
  shuffle(remainingQuestions);
  quizActive = true;
  updateProgressBar();
  showQuestion();
  endingContainer.style.display = "none";
  gameContainer.style.display = "block";
  clearInterval(timer);
  
  if (window.playMenuMusic && !window.isMuted()) {
    window.playMenuMusic(false);
    if (window.setMenuMusicRate) window.setMenuMusicRate(1);
  }
  startTimer();
}

answerButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => handleAnswer(idx));
});

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    startQuiz();
  });
}

if (exitBtn) {
  exitBtn.addEventListener("click", () => {
    endingContainer.style.display = "none";
    document.getElementById("menu-container").style.display = "block";
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadQuestions();
  endingContainer.style.display = "none";
  updateProgressBar();
});

window.startQuiz = startQuiz;

function saveScore(finalScore) {
  const playerName = localStorage.getItem("nombreJugador");
  const playerAvatar = localStorage.getItem("avatarJugador");
  guardarPuntuacion(playerName, playerAvatar, finalScore);
}


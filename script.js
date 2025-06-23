const board = document.getElementById("game-board");
const overlay = document.getElementById("overlay-status");
const levelInfo = document.getElementById("level-info");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const soundBtn = document.getElementById("sound-btn");
const levelSelect = document.getElementById("level-select");
const progressFill = document.getElementById("progress-fill");

const soundMatch = document.getElementById("sound-match");
const soundWrong = document.getElementById("sound-wrong");
const soundWin = document.getElementById("sound-win");
const soundTimeup = document.getElementById("sound-timeup");
const soundClick = document.getElementById("sound-click");
const soundFlip = document.getElementById("sound-flip");

const levels = [
  {
    nama: "🍎 Buah",
    gambar: ["Buah/1.jpeg", "Buah/2.jpg", "Buah/3.jpg", "Buah/4.jpg", "Buah/5.jpg", "Buah/6.jpg", "Buah/7.jpg", "Buah/8.jpg", "Buah/9.jpg", "Buah/10.jpg"]
  },
  {
    nama: "🐶 Hewan",
    gambar: ["Hewan/1.jpg", "Hewan/2.jpg", "Hewan/3.jpg", "Hewan/4.jpg", "Hewan/5.jpg", "Hewan/6.jpg", "Hewan/7.jpg", "Hewan/8.jpg", "Hewan/9.jpg", "Hewan/10.jpg"]
  },
  {
    nama: "🎒 School",
    gambar: ["School/1.jpeg", "School/2.jpeg", "School/3.jpeg", "School/4.jpeg", "School/5.jpeg", "School/6.jpeg", "School/7.jpeg", "School/8.jpeg", "School/9.jpeg", "School/10.jpeg"]
  },
  {
    nama: "🚗 Transportasi",
    gambar: ["Transportasi/1.jpeg", "Transportasi/2.jpeg", "Transportasi/3.jpeg", "Transportasi/4.jpeg", "Transportasi/5.jpeg", "Transportasi/6.jpeg", "Transportasi/7.jpeg", "Transportasi/8.jpeg", "Transportasi/9.jpeg", "Transportasi/10.jpeg"]
  },
  {
    nama: "🎵 AlatMusik",
    gambar: ["AlatMusik/1.jpeg", "AlatMusik/2.jpeg", "AlatMusik/3.jpeg", "AlatMusik/4.jpeg", "AlatMusik/5.jpeg", "AlatMusik/6.jpeg", "AlatMusik/7.jpeg", "AlatMusik/8.jpeg", "AlatMusik/9.jpeg", "AlatMusik/10.jpeg"]
  }
];

let currentLevel = 0;
let flippedCards = [];
let matchedCount = 0;
let timer;
let timeLeft = 60;
let score = 0;
let highscore = localStorage.getItem("memoryHighscore") || 0;
let isSoundOn = true;
let hasStarted = false;

highscoreDisplay.textContent = `🏆 Rekor: ${highscore}`;

levels.forEach((lvl, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = lvl.nama;
  levelSelect.appendChild(opt);
});

function startGame(levelIndex = 0) {
  clearInterval(timer);
  board.innerHTML = "";
  overlay.className = "";
  overlay.innerHTML = "";
  flippedCards = [];
  matchedCount = 0;
  currentLevel = levelIndex;
  levelSelect.value = currentLevel;
  levelInfo.textContent = "Level: " + levels[levelIndex].nama;

  timeLeft = 60;
  timerDisplay.textContent = `⏱️ ${timeLeft}`;
  score = 0;
  scoreDisplay.textContent = `⭐ Skor: ${score}`;

  updateProgressBar();
  hasStarted = false;

  const gambarList = [...levels[levelIndex].gambar, ...levels[levelIndex].gambar];
  gambarList.sort(() => 0.5 - Math.random());

  gambarList.forEach(src => {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");

    const back = document.createElement("div");
    back.classList.add("card-back");
    const img = document.createElement("img");
    img.src = "images/" + src;
    back.appendChild(img);

    cardInner.appendChild(front);
    cardInner.appendChild(back);
    card.appendChild(cardInner);

    card.onclick = () => flipCard(card);
    board.appendChild(card);
  });
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ ${timeLeft}`;
    updateProgressBar();

    if (timeLeft <= 0) {
      clearInterval(timer);
      showOverlay("game-over", `⏰ <b>Waktu Habis!</b><br><button onclick=\"hideOverlay(); startGame(${currentLevel})\">🔁 Coba Lagi</button>`);
      if (isSoundOn) soundTimeup.play();
    }
  }, 1000);
}

function updateProgressBar() {
  const percent = (timeLeft / 60) * 100;
  progressFill.style.width = percent + "%";
  if (percent <= 30) {
    progressFill.style.background = "#e74c3c"; // merah
  } else if (percent <= 60) {
    progressFill.style.background = "#f1c40f"; // kuning
  } else {
    progressFill.style.background = "#4caf50"; // hijau
  }
}

function flipCard(card) {
  if (!hasStarted) {
    hasStarted = true;
    startTimer();
  }
  if (flippedCards.length < 2 && !card.classList.contains("flipped")) {
    card.classList.add("flipped");
    flippedCards.push(card);
    if (isSoundOn) soundFlip.play(); // 🔊 Tambahan suara flip

    if (flippedCards.length === 2) {
      setTimeout(checkMatch, 600);
    }
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const img1 = card1.querySelector("img").src;
  const img2 = card2.querySelector("img").src;

  if (img1 === img2) {
    matchedCount++;
    score += 10;
    if (isSoundOn) soundMatch.play();
  } else {
    score = Math.max(0, score - 2);
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    if (isSoundOn) soundWrong.play();
  }

  scoreDisplay.textContent = `⭐ Skor: ${score}`;
  flippedCards = [];

  if (matchedCount === levels[currentLevel].gambar.length) {
    clearInterval(timer);
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("memoryHighscore", highscore);
      highscoreDisplay.textContent = `🏆 Rekor: ${highscore}`;
    }
    if (isSoundOn) soundWin.play();
    startConfetti(); 
    showOverlay("win", `🎉 <b>Level ${levels[currentLevel].nama} selesai!</b><br><button onclick=\"hideOverlay(); startGame(${(currentLevel + 1) % levels.length})\">Next Level (${levels[(currentLevel + 1) % levels.length].nama})</button>`);
  }
}

function showOverlay(type, content) {
  overlay.className = "";
  overlay.classList.add(type);
  overlay.innerHTML = `<div class="message">${content}</div>`;
  overlay.classList.add("show");
}

function hideOverlay() {
  overlay.classList.remove("show");
}

function restartGame() {
  startGame(currentLevel);
}

function toggleSound() {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? "🔊 Sound: ON" : "🔇 Sound: OFF";
}

function changeLevel() {
  startGame(Number(levelSelect.value));
}

function startConfetti() {
  const duration = 2 * 1000; // 2 detik
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// Saat halaman dibuka, cek preferensi
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

document.querySelectorAll("button, select").forEach(el => {
  el.addEventListener("click", () => {
    if (isSoundOn) soundClick.play();
  });
});

startGame(0);
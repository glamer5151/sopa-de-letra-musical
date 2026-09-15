const levels = [
  ["BADBUNNY", "ANUEL", "KAROLG", "FEID", "MORA", "OZUNA"],
  ["QUEVEDO", "TRAVIS", "DRAKE", "EMINEM", "NICKI", "DADDY", "RIDA", "MALUMA"],
  ["MYKE", "ARCANGEL", "RAUW", "YOVNG", "MILO", "TRENO", "WISIN", "YANDEL", "DUKI", "BARRIA"]
];

let currentLevel = 0;
let words = [];
const size = 12;
let grid = [], selectedCells = [], time = 300, score = 0, timerInterval;
let foundWords = [];

const directions = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];

function randomColor() {
  const colors = ["#22c55e", "#ef4444", "#3b82f6", "#eab308", "#a855f7", "#f97316", "#06b6d4", "#ec4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function mostrarJuego() {
  document.getElementById("juego").style.display = "block";
  document.getElementById("juego").scrollIntoView({ behavior: 'smooth' });
  startGame();
}

function createEmptyGrid() {
  grid = Array.from({length: size}, () => Array(size).fill(''));
}

function placeWord(word) {
  let placed = false;
  let attempts = 0;
  while (!placed && attempts < 200) {
    attempts++;
    let row = Math.floor(Math.random() * size);
    let col = Math.floor(Math.random() * size);
    let [dx, dy] = directions[Math.floor(Math.random() * directions.length)];

    let fits = true;
    for (let i = 0; i < word.length; i++) {
      let r = row + dx * i, c = col + dy * i;
      if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] && grid[r][c] !== word[i])) {
        fits = false; break;
      }
    }

    if (fits) {
      for (let i = 0; i < word.length; i++) {
        grid[row + dx * i][col + dy * i] = word[i];
      }
      placed = true;
    }
  }
}

function fillGrid() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function drawGrid() {
  const gridDiv = document.getElementById("grid");
  gridDiv.innerHTML = "";

  grid.forEach((row, i) => {
    row.forEach((letter, j) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      cell.onclick = () => selectCell(cell, i, j);
      gridDiv.appendChild(cell);
    });
  });
}

function selectCell(cell, i, j) {
  if (cell.classList.contains("selected")) {
    cell.classList.remove("selected");
    selectedCells = selectedCells.filter(c => c.cell !== cell);
    return;
  }

  cell.classList.add("selected");
  selectedCells.push({letter: grid[i][j], cell});

  checkWord();
}

function checkWord() {
  const word = selectedCells.map(c => c.letter).join("");

  words.forEach(w => {
    if (word === w && !foundWords.includes(w)) {
      let color = randomColor();

      selectedCells.forEach(c => {
        c.cell.classList.remove("selected");
        c.cell.classList.add("found");
        c.cell.style.background = color;
        c.cell.style.borderColor = color;
        c.cell.style.boxShadow = `0 0 10px ${color}`;
      });

      document.querySelectorAll("#words li").forEach(li => {
        if (li.textContent === w) {
          li.classList.add("found");
          li.style.borderColor = color;
          li.style.color = color;
          score += 10;
          document.getElementById("score").textContent = score;
        }
      });

      foundWords.push(w);
      selectedCells = [];
      updateWordCount();

      if (foundWords.length === words.length) {
        clearInterval(timerInterval);
        setTimeout(() => {
          alert(`¡Excelente! Nivel ${currentLevel + 1} completado 🎉`);
          nextLevel();
        }, 300);
      }
    }
  });

  const maxLen = Math.max(...words.map(w => w.length));
  if (selectedCells.length >= maxLen) {
    clearSelection();
  }
}

function clearSelection() {
  selectedCells.forEach(c => c.cell.classList.remove("selected"));
  selectedCells = [];
}

function updateWordCount() {
  document.getElementById("words-found-count").textContent = foundWords.length;
  document.getElementById("words-total-count").textContent = words.length;
}

function drawWords() {
  const list = document.getElementById("words");
  list.innerHTML = "";
  words.forEach(w => {
    let li = document.createElement("li");
    li.textContent = w;
    list.appendChild(li);
  });
  updateWordCount();
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    time--;

    let min = Math.floor(time / 60);
    let sec = time % 60;

    const timerEl = document.getElementById("timer");
    timerEl.textContent = `Tiempo: ${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;

    if (time <= 60) {
      timerEl.style.color = "#ef4444";
    } else {
      timerEl.style.color = "var(--accent-cyan)";
    }

    if (time <= 0) {
      clearInterval(timerInterval);
      alert("⏰ ¡Tiempo agotado! Inténtalo de nuevo.");
      startGame();
    }
  }, 1000);
}

function loadLevel() {
  words = levels[currentLevel];
  foundWords = [];
  selectedCells = [];

  document.getElementById("level-indicator").textContent = `Nivel: ${currentLevel + 1}/${levels.length}`;

  createEmptyGrid();
  words.forEach(placeWord);
  fillGrid();
  drawGrid();
  drawWords();

  time = 300;
  startTimer();
}

function nextLevel() {
  currentLevel++;

  if (currentLevel < levels.length) {
    loadLevel();
  } else {
    showWin();
  }
}

function showWin() {
  let win = document.createElement("div");
  win.className = "win-screen";
  win.innerHTML = `
    <h1>¡NIVEL MÁXIMO COMPLETADO! 🏆</h1>
    <p>Demostraste tus conocimientos en Música Urbana.<br>Puntaje Final: <strong>${score} PTS</strong></p>
    <button class="btn" onclick="location.reload()">Jugar de Nuevo</button>
  `;
  document.body.appendChild(win);
}

function startGame() {
  currentLevel = 0;
  score = 0;
  document.getElementById("score").textContent = 0;
  loadLevel();
}
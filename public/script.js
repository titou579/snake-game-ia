const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isRunning = false;
let isPaused = false;

highScoreEl.textContent = highScore;

function init() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  draw();
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food.x = Math.floor(Math.random() * COLS);
    food.y = Math.floor(Math.random() * ROWS);
    valid = !snake.some(s => s.x === food.x && s.y === food.y);
  }
}

function draw() {
  // Fond
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grille légère
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID, 0);
    ctx.lineTo(i * GRID, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * GRID);
    ctx.lineTo(canvas.width, i * GRID);
    ctx.stroke();
  }

  // Nourriture
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID + GRID / 2,
    food.y * GRID + GRID / 2,
    GRID / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Serpent
  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = '#22c55e'; // tête
    } else {
      ctx.fillStyle = '#16a34a';
    }
    ctx.fillRect(
      segment.x * GRID + 1,
      segment.y * GRID + 1,
      GRID - 2,
      GRID - 2
    );
  });
}

function update() {
  if (isPaused) return;

  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Collision murs
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endGame();
    return;
  }

  // Collision corps
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Manger
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  if (isRunning) return;
  init();
  isRunning = true;
  isPaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  pauseBtn.textContent = 'Pause';
  gameOverEl.classList.add('hidden');
  gameLoop = setInterval(update, 120);
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Reprendre' : 'Pause';
}

function endGame() {
  clearInterval(gameLoop);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove('hidden');
}

function changeDirection(newDir) {
  // Empêcher le demi-tour
  if (newDir.x === -direction.x && newDir.y === -direction.y) return;
  nextDirection = newDir;
}

// Clavier
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
    e.preventDefault();
  }

  if (key === ' ' || key === 'p') {
    if (isRunning) togglePause();
    return;
  }

  if (!isRunning) return;

  switch (key) {
    case 'arrowup':
    case 'w':
      changeDirection({ x: 0, y: -1 });
      break;
    case 'arrowdown':
    case 's':
      changeDirection({ x: 0, y: 1 });
      break;
    case 'arrowleft':
    case 'a':
      changeDirection({ x: -1, y: 0 });
      break;
    case 'arrowright':
    case 'd':
      changeDirection({ x: 1, y: 0 });
      break;
  }
});

// Boutons
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', startGame);

// Contrôles mobiles
document.querySelectorAll('.dir-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!isRunning) return;
    const dir = btn.dataset.dir;
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    changeDirection(map[dir]);
  });
});

// Initialisation
init();

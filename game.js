// ------------------ Canvas Setup ------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

// ------------------ Player Stats ------------------
let coins = 0;
let incomeMult = 1;
let incomeCost = 50;

let damage = 1;
let upgradeCost = 10;

let wave = 1;
const maxWaves = 15;

let hearts = 5;
const maxHearts = 5;

// ------------------ Player ------------------
const player = {
  x: 280,
  y: 350,
  width: 40,
  height: 20,
  speed: 4
};

let keys = {};
let shooting = false;

// ------------------ Entities ------------------
let sideShips = [];
let bullets = [];
let enemies = [];
let heartDrops = [];

const baseEnemyHP = 3;
const enemiesPerWave = 5;

// ------------------ Controls ------------------
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === "Space") shooting = true;
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
  if (e.code === "Space") shooting = false;
});

// ------------------ Shooting ------------------
setInterval(() => {
  if (!shooting) return;

  bullets.push({ x: player.x + 18, y: player.y });

  sideShips.forEach(s => {
    bullets.push({ x: s.x + 10, y: s.y });
  });
}, 120);

// ------------------ Enemy Spawning ------------------
function spawnWave() {
  if (wave > maxWaves) return;

  coins += 20; // give 20 coins each wave

  for (let i = 0; i < enemiesPerWave + wave; i++) {
    let type = "normal";
    let hp = baseEnemyHP;

    if (wave >= 10 && Math.random() < 0.25) {
      type = "ultra";
      hp *= 4;
    } else if (wave >= 5 && Math.random() < 0.35) {
      type = "super";
      hp *= 2;
    }

    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: -Math.random() * 200,
      width: 30,
      height: 20,
      hp,
      type,
      speed: 0.6 // slower enemies
    });
  }
}

// ------------------ Movement ------------------
function movePlayer() {
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;

  // Boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// ------------------ Wave Timer ------------------
let waveTimer = 0;
const waveDelay = 600; // frames (~10s at 60fps)
spawnWave(); // Spawn first wave immediately

// ------------------ Skip Wave ------------------
function skipWave() {
  wave++;
  if (wave <= maxWaves) spawnWave();
}

// ------------------ Game Loop ------------------
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();

  // --- Player ---
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // --- Side Ships ---
  sideShips.forEach((s, i) => {
    s.x = player.x + (i % 2 === 0 ? -50 : 50);
    s.y = player.y;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(s.x, s.y, 20, 15);
  });

  // --- Bullets ---
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 6;
    ctx.fillRect(b.x, b.y, 4, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // --- Enemies ---
  enemies.forEach((e, i) => {
    e.y += e.speed;

    if (e.type === "ultra") ctx.fillStyle = "purple";
    else if (e.type === "super") ctx.fillStyle = "orange";
    else ctx.fillStyle = "pink";

    ctx.fillRect(e.x, e.y, e.width, e.height);

    // If enemy reaches bottom → lose a heart
    if (e.y > canvas.height) {
      enemies.splice(i, 1);
      hearts--;
      if (hearts <= 0) {
        alert("Game Over!");
        location.reload();
      }
    }
  });

  // --- Bullet Collisions ---
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (
        b.x < e.x + e.width &&
        b.x + 4 > e.x &&
        b.y < e.y + e.height &&
        b.y + 10 > e.y
      ) {
        e.hp -= damage;
        bullets.splice(bi, 1);

        if (e.hp <= 0) {
          // 5% chance for heart drop
          if (Math.random() < 0.05) {
            heartDrops.push({ x: e.x, y: e.y, size: 15 });
          }

          enemies.splice(ei, 1);
          coins += 1 * incomeMult;
        }
      }
    });
  });

  // --- Heart Drops ---
  heartDrops.forEach((h, i) => {
    h.y += 1;
    ctx.fillStyle = "red";
    ctx.fillRect(h.x, h.y, h.size, h.size);

    // Pickup
    if (
      h.x < player.x + player.width &&
      h.x + h.size > player.x &&
      h.y < player.y + player.height &&
      h.y + h.size > player.y
    ) {
      if (hearts < maxHearts) hearts++;
      heartDrops.splice(i, 1);
    }
  });

  // --- Wave Timer ---
  waveTimer++;
  if (waveTimer >= waveDelay) {
    waveTimer = 0;
    wave++;
    if (wave <= maxWaves) spawnWave();
  }

  // --- HUD ---
  hud.innerText = `
Coins: ${coins}
Wave: ${wave}/${maxWaves}
Damage: ${damage}
Side Ships: ${sideShips.length}
Hearts: ${"❤️".repeat(hearts)}
`;

  requestAnimationFrame(update);
}

update();

// ------------------ Upgrades ------------------
function buyUpgrade() {
  if (coins >= upgradeCost) {
    coins -= upgradeCost;
    damage++;
    upgradeCost = Math.floor(upgradeCost * 3.5);
  }
}

function buySideShip() {
  if (coins >= 50) {
    coins -= 50;
    sideShips.push({ x: 0, y: 0 });
  }
}

function buyIncome() {
  if (coins >= incomeCost) {
    coins -= incomeCost;
    incomeMult *= 2;
    incomeCost *= 3;
  }
}

function buyLaser() {
  if (coins >= 300) {
    coins -= 300;
    alert("Laser upgrade coming soon!");
  }
}

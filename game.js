const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

let coins = 0;
let incomeMult = 1;
let incomeCost = 50;

let damage = 1;
let upgradeCost = 10;

let wave = 1;
const maxWaves = 15;

const player = {
  x: 280,
  y: 350,
  width: 40,
  height: 20
};

let sideShips = [];
let bullets = [];
let enemies = [];

const baseEnemyHP = 3;

// 🎮 Controls
let shooting = false;

document.addEventListener("keydown", e => {
  if (e.code === "Space") shooting = true;
});

document.addEventListener("keyup", e => {
  if (e.code === "Space") shooting = false;
});

document.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width / 2;
});

// 🔫 Shooting loop
setInterval(() => {
  if (!shooting) return;

  bullets.push({ x: player.x + 18, y: player.y });

  sideShips.forEach(s => {
    bullets.push({ x: s.x + 10, y: s.y });
  });
}, 250);

// 👾 Enemy spawner
function spawnWave() {
  enemies = [];

  if (wave === maxWaves) {
    // BOSS
    enemies.push({
      x: 250,
      y: -40,
      width: 100,
      height: 40,
      hp: baseEnemyHP * 2 * 2 * 3,
      type: "boss"
    });
    return;
  }

  for (let i = 0; i < wave + 2; i++) {
    let type = "normal";
    let hp = baseEnemyHP;

    if (wave >= 5 && Math.random() < 0.3) {
      type = "super";
      hp *= 2;
    }

    if (wave >= 10 && Math.random() < 0.2) {
      type = "ultra";
      hp *= 4;
    }

    enemies.push({
      x: Math.random() * 560,
      y: -Math.random() * 300,
      width: 30,
      height: 20,
      hp,
      type
    });
  }
}

spawnWave();

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🚀 Player
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // 🚀 Side ships
  sideShips.forEach((s, i) => {
    s.x = player.x + (i % 2 === 0 ? -50 : 50);
    s.y = player.y;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(s.x, s.y, 20, 15);
  });

  // 🔫 Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 6;
    ctx.fillRect(b.x, b.y, 4, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // 👾 Enemies
  enemies.forEach(e => {
    e.y += e.type === "boss" ? 0.5 : 1.5;

    if (e.type === "boss") ctx.fillStyle = "red";
    else if (e.type === "ultra") ctx.fillStyle = "purple";
    else if (e.type === "super") ctx.fillStyle = "orange";
    else ctx.fillStyle = "pink";

    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // 💥 Collisions
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
          enemies.splice(ei, 1);
          coins += 1 * incomeMult;
        }
      }
    });
  });

  // 🌊 Next wave
  if (enemies.length === 0) {
    wave++;
    if (wave <= maxWaves) spawnWave();
  }

  hud.innerText = `
Coins: ${coins}
Income Multiplier: x${incomeMult}
Wave: ${wave}/${maxWaves}
Damage: ${damage}
Side Ships: ${sideShips.length}
`;
  requestAnimationFrame(update);
}

update();

// 🛒 Upgrades
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

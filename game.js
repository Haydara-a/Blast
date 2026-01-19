const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

let coins = 0;
let damage = 1;
let upgradeCost = 10;
let sideShips = 0;
let laserUnlocked = false;

const player = {
  x: 280,
  y: 350,
  width: 40,
  height: 20
};

let bullets = [];
let enemies = [];
let lasers = [];

function spawnEnemy() {
  enemies.push({
    x: Math.random() * 560,
    y: -20,
    hp: 3
  });
}

setInterval(spawnEnemy, 1000);

document.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width / 2;
});

document.addEventListener("click", () => {
  shoot();
});

function shoot() {
  bullets.push({ x: player.x + 18, y: player.y });

  for (let i = 0; i < sideShips; i++) {
    bullets.push({
      x: player.x + 18 + (i % 2 === 0 ? -30 : 30),
      y: player.y
    });
  }

  if (laserUnlocked) {
    lasers.push({ x: player.x + 18, y: 0 });
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    b.y -= 6;
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  // Laser
  ctx.fillStyle = "red";
  lasers.forEach(l => {
    ctx.fillRect(l.x, l.y, 4, canvas.height);
  });

  // Enemies
  ctx.fillStyle = "pink";
  enemies.forEach(e => {
    e.y += 2;
    ctx.fillRect(e.x, e.y, 30, 20);
  });

  // Collisions
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (
        b.x < e.x + 30 &&
        b.x + 4 > e.x &&
        b.y < e.y + 20 &&
        b.y + 10 > e.y
      ) {
        e.hp -= damage;
        bullets.splice(bi, 1);
        if (e.hp <= 0) {
          enemies.splice(ei, 1);
          coins += 1;
        }
      }
    });
  });

  // Laser damage
  if (laserUnlocked) {
    enemies.forEach((e, ei) => {
      if (Math.abs(e.x - player.x) < 20) {
        enemies.splice(ei, 1);
        coins += 1;
      }
    });
  }

  hud.innerText = `
Coins: ${coins}
Damage: ${damage}
Upgrade Cost: ${upgradeCost}
Side Ships: ${sideShips}
Laser: ${laserUnlocked ? "YES" : "NO"}
`;

  requestAnimationFrame(update);
}

update();

function buyUpgrade() {
  if (coins >= upgradeCost) {
    coins -= upgradeCost;
    damage += 1;
    upgradeCost = Math.floor(upgradeCost * 3.5);
  }
}

function buySideShip() {
  if (coins >= 50) {
    coins -= 50;
    sideShips += 1;
  }
}

function buyLaser() {
  if (coins >= 300 && !laserUnlocked) {
    coins -= 300;
    laserUnlocked = true;
  }
}


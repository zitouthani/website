// === Initialisation du canvas ===
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '1';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// === Chargement de l'image du robot ===
// ⚠️ Mets ici le lien de ton image (par ex. depuis ton repo GitHub)
const robotImg = new Image();
robotImg.src = "https://github.com/zitouthani/website/raw/main/robot.png"; // adapte ce chemin

// === Tableau des mini-robots ===
const robots = [];

// === Fonction pour créer un robot à la position du clic ===
function createRobot(x, y) {
    robots.push({
        x,
        y,
        size: 24 + Math.random() * 16,
        alpha: 1,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 2
    });
}

// === Événement clic pour faire apparaître des robots ===
document.addEventListener('click', (e) => {
    for (let i = 0; i < 6; i++) {
        createRobot(e.clientX + (Math.random() * 40 - 20), e.clientY + (Math.random() * 40 - 20));
    }
});

// === Animation ===
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    robots.forEach((r, i) => {
        if (r.alpha <= 0) {
            robots.splice(i, 1);
        } else {
            r.x += r.vx;
            r.y += r.vy;
            r.alpha -= 0.02;

            if (robotImg.complete) {
                ctx.globalAlpha = r.alpha;
                ctx.drawImage(robotImg, r.x, r.y, r.size, r.size);
                ctx.globalAlpha = 1;
            }
        }
    });
    requestAnimationFrame(animate);
}

animate();

// === Ajustement du canvas lors du redimensionnement ===
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


// --- Création des robots ---
class Robot {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 10 + Math.random() * 10;
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.dx = Math.random() * 2 - 1;
    this.dy = Math.random() * 2 - 1;
  }

class Robot {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 20 + Math.random() * 20;
    this.image = new Image();
    this.image.src = "https://github.com/zitouthani/website/blob/main/robot.png?raw=true"; // 👉 ton image du robot
    this.dx = Math.random() * 2 - 1;
    this.dy = Math.random() * 2 - 1;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }

  update(mouseX, mouseY) {
    this.x += this.dx + (mouseX - this.x) * 0.001;
    this.y += this.dy + (mouseY - this.y) * 0.001;
  }
}


  
  
  
  update(mouseX, mouseY) {
    this.x += this.dx + (mouseX - this.x) * 0.001;
    this.y += this.dy + (mouseY - this.y) * 0.001;
  }
}

let robots = [];
for (let i = 0; i < 60; i++) robots.push(new Robot());

// --- Animation des robots ---
let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  robots.forEach(r => {
    r.update(mouse.x, mouse.y);
    r.draw();
  });
  requestAnimationFrame(animate);
}
animate();

// --- Explosion en cœur ---
window.addEventListener('click', e => {
  for (let i = 0; i < robots.length; i++) {
    const r = robots[i];
    if (Math.hypot(r.x - e.clientX, r.y - e.clientY) < r.size) {
      // remplace le robot par un cœur scintillant
      hearts.push(new Heart(e.clientX, e.clientY));
      robots.splice(i, 1);
      break;
    }
  }
});

// --- Cœurs scintillants ---
class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.size = 15;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.size / 15, this.size / 15);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -10, -10, -5);
    ctx.bezierCurveTo(-15, 0, -5, 10, 0, 15);
    ctx.bezierCurveTo(5, 10, 15, 0, 10, -5);
    ctx.bezierCurveTo(5, -10, 0, -3, 0, 0);
    ctx.fillStyle = `rgba(255,0,80,${this.alpha})`;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.y -= 0.5;
    this.alpha -= 0.02;
  }
}

let hearts = [];
function animateHearts() {
  hearts.forEach((h, i) => {
    h.update();
    h.draw();
    if (h.alpha <= 0) hearts.splice(i, 1);
  });
  requestAnimationFrame(animateHearts);
}
animateHearts();



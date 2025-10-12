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

// === Chargement de l'image du mini-robot ===
const robotImage = new Image();
robotImage.src = 'https://raw.githubusercontent.com/zitouthani/website/main/robot.png'; // 🔹 mets ici ton image robot (ex: raw GitHub link)

// === Classe Robot ===
class Robot {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 30 + Math.random() * 40;
    this.speedX = (Math.random() - 0.5) * 1.5;
    this.speedY = (Math.random() - 0.5) * 1.5;
    this.opacity = 0.7 + Math.random() * 0.3;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    if (robotImage.complete) {
      ctx.drawImage(robotImage, this.x, this.y, this.size, this.size);
    }
    ctx.globalAlpha = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // rebond sur les bords
    if (this.x < 0 || this.x > canvas.width - this.size) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height - this.size) this.speedY *= -1;
  }
}

// === Création et animation des mini-robots ===
let robots = [];
for (let i = 0; i < 3; i++) {
  robots.push(new Robot());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  robots.forEach(r => {
    r.update();
    r.draw();
  });
  requestAnimationFrame(animate);
}

robotImage.onload = () => {
  animate();
};

// === Ajustement sur redimensionnement ===
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


/* HTML5 Canvas Particle Engine for Floating Hearts, Petals & Confetti Explosions */
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.explosions = [];
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.createAmbientParticles(35);
    this.animate();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  createAmbientParticles(count) {
    const types = ['heart', 'star', 'petal'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 12 + 6,
        speedY: -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        type: types[Math.floor(Math.random() * types.length)],
        color: this.getRandomColor()
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(255, 75, 139, ',
      'rgba(255, 182, 193, ',
      'rgba(217, 70, 239, ',
      'rgba(244, 114, 182, ',
      'rgba(251, 207, 232, '
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Draw a smooth vector heart on canvas
  drawHeart(ctx, x, y, size, color, opacity, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);

    ctx.fillStyle = color + opacity + ')';
    ctx.shadowColor = color + '0.8)';
    ctx.shadowBlur = size * 0.8;
    ctx.fill();
    ctx.restore();
  }

  // Draw a smooth petal shape
  drawPetal(ctx, x, y, size, color, opacity, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = color + opacity + ')';
    ctx.shadowColor = color + '0.5)';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.restore();
  }

  // Draw a glowing star sparkle
  drawStar(ctx, x, y, size, color, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = color + opacity + ')';
    ctx.shadowColor = color + '1)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }

  // Trigger high velocity explosion at x, y
  triggerExplosion(x, y, count = 60) {
    const types = ['heart', 'petal', 'confetti', 'star'];
    const confettiColors = ['#ff4b8b', '#a855f7', '#3b82f6', '#ffd1dc', '#facc15', '#4ade80'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      
      this.explosions.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward boost
        gravity: 0.15,
        friction: 0.98,
        size: Math.random() * 14 + 6,
        opacity: 1,
        fadeSpeed: Math.random() * 0.015 + 0.008,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        type: types[Math.floor(Math.random() * types.length)],
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rgbaPrefix: this.getRandomColor()
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update ambient floating particles
    this.particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.3;
      p.rotation += p.rotSpeed;

      // Wrap around canvas edges
      if (p.y < -20) {
        p.y = window.innerHeight + 20;
        p.x = Math.random() * window.innerWidth;
      }
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;

      if (p.type === 'heart') {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else if (p.type === 'petal') {
        this.drawPetal(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else {
        this.drawStar(this.ctx, p.x, p.y, p.size, p.color, p.opacity);
      }
    });

    // Update explosion burst particles
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      e.vx *= e.friction;
      e.vy *= e.friction;
      e.vy += e.gravity;
      e.x += e.vx;
      e.y += e.vy;
      e.opacity -= e.fadeSpeed;
      e.rotation += e.rotSpeed;

      if (e.opacity <= 0) {
        this.explosions.splice(i, 1);
        continue;
      }

      if (e.type === 'heart') {
        this.drawHeart(this.ctx, e.x, e.y, e.size, e.rgbaPrefix, e.opacity, e.rotation);
      } else if (e.type === 'petal') {
        this.drawPetal(this.ctx, e.x, e.y, e.size, e.rgbaPrefix, e.opacity, e.rotation);
      } else if (e.type === 'confetti') {
        this.ctx.save();
        this.ctx.translate(e.x, e.y);
        this.ctx.rotate(e.rotation);
        this.ctx.fillStyle = e.color;
        this.ctx.globalAlpha = e.opacity;
        this.ctx.fillRect(-e.size / 2, -e.size / 4, e.size, e.size / 2);
        this.ctx.restore();
      } else {
        this.drawStar(this.ctx, e.x, e.y, e.size, e.rgbaPrefix, e.opacity);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

let particleSystem;
document.addEventListener('DOMContentLoaded', () => {
  particleSystem = new ParticleEngine('particles-canvas');
});

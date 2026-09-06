/**
 * script.js
 * Comportamento da página de aniversário do Cadu:
 * 1. Efeito de "terminal digitando" no hero.
 * 2. Animação de confete em canvas, disparada pelo botão "birthday.js".
 */

document.addEventListener("DOMContentLoaded", () => {
  initTerminalTyping();
  initConfetti();
});

/* ==========================================================================
   1. EFEITO DE TERMINAL DIGITANDO
   ========================================================================== */
function initTerminalTyping() {
  const outputEl = document.getElementById("terminal-output");
  if (!outputEl) return;

  // Cada linha é digitada e depois "resolvida" com destaque de sintaxe.
  const lines = [
    { text: "$ node aniversario.js --nome=Cadu", type: "command" },
    { text: "carregando dados do aniversariante...", type: "comment" },
    { text: "nome:        Cadu", type: "data" },
    { text: "idade:        18", type: "data" },
    { text: "temporada:   2026", type: "data" },
    { text: "mensagem:    Feliz aniversário! 🎉", type: "data" },
    { text: "", type: "comment" },
    { text: "> processo concluído com sucesso.", type: "comment" },
  ];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) {
    outputEl.innerHTML = lines.map(renderStaticLine).join("\n");
    return;
  }

  typeLines(outputEl, lines, 0, 0);
}

function renderStaticLine(line) {
  return `<span class="line-${lineClass(line.type)}">${escapeHtml(
    line.text
  )}</span>`;
}

function lineClass(type) {
  if (type === "command") return "key";
  if (type === "data") return "value";
  return "comment";
}

function typeLines(outputEl, lines, lineIndex, charIndex) {
  if (lineIndex >= lines.length) return;

  const currentLine = lines[lineIndex];
  const typedSoFar = currentLine.text.slice(0, charIndex);

  const renderedLines = lines
    .slice(0, lineIndex)
    .map(renderStaticLine)
    .join("\n");

  const currentRendered = `<span class="line-${lineClass(
    currentLine.type
  )}">${escapeHtml(typedSoFar)}</span>`;

  outputEl.innerHTML =
    renderedLines + (lineIndex > 0 ? "\n" : "") + currentRendered;

  if (charIndex < currentLine.text.length) {
    window.setTimeout(
      () => typeLines(outputEl, lines, lineIndex, charIndex + 1),
      18
    );
  } else {
    window.setTimeout(() => typeLines(outputEl, lines, lineIndex + 1, 0), 220);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ==========================================================================
   2. CONFETE EM CANVAS
   ========================================================================== */
function initConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const button = document.getElementById("celebrate-btn");
  if (!canvas || !button) return;

  const ctx = canvas.getContext("2d");
  const colors = ["#b7f26a", "#6fd3d9", "#ff8a65", "#eef1f6"];

  let particles = [];
  let animationFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles(originX, originY) {
    const count = 140;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: originX,
        y: originY,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 12,
        velocityY: Math.random() * -12 - 4,
        gravity: 0.35,
        drag: 0.98,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 130 + Math.random() * 40,
      });
    }
  }

  function updateAndDrawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.velocityX *= particle.drag;
      particle.velocityY = particle.velocityY * particle.drag + particle.gravity;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.rotation += particle.rotationSpeed;
      particle.life += 1;

      const opacity = Math.max(0, 1 - particle.life / particle.maxLife);

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.radius, -particle.radius * 0.4, particle.radius * 2, particle.radius * 0.8);
      ctx.restore();
    });

    particles = particles.filter((particle) => particle.life < particle.maxLife);

    if (particles.length > 0) {
      animationFrameId = window.requestAnimationFrame(updateAndDrawParticles);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameId = null;
    }
  }

  function launchConfetti(event) {
    const originX = event ? event.clientX : canvas.width / 2;
    const originY = event ? event.clientY : canvas.height / 3;

    createParticles(originX, originY);

    if (!animationFrameId) {
      animationFrameId = window.requestAnimationFrame(updateAndDrawParticles);
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  button.addEventListener("click", (event) => {
    launchConfetti(event);
  });
}

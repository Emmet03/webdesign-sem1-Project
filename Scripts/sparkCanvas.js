(function () {
  const canvas = document.getElementById("sparkCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  const sparks = [];
  const MAX = 90;
  const SPAWN_PER_FRAME = 2;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function spawn() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    sparks.push({
      x: rand(0, w),
      y: h + rand(0, 20),
      vx: rand(-0.25, 0.25),
      vy: rand(-1.6, -0.6),
      r: rand(1, 2.6),
      life: rand(50, 120),
      t: 0,
      flicker: rand(0.6, 1.0)
    });
  }

  function sparkColor(alpha, phase) {
    const warm = 200 + Math.sin(phase) * 20;
    return `rgba(255, ${warm | 0}, 140, ${alpha})`;
  }

  let rafId = 0;
  let last = performance.now();

  function draw(now) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const dt = Math.min(32, now - last);
    last = now;
    const step = dt / 16.67;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(
      w * 0.7, h * 0.2, 0,
      w * 0.7, h * 0.2, Math.max(w, h)
    );
    grad.addColorStop(0, "rgba(255,180,120,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < SPAWN_PER_FRAME; i++) spawn();
    while (sparks.length > MAX) sparks.shift();

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.t += 0.08 * step;

      s.x += s.vx * 30 * step * 0.03;
      s.y += s.vy * 30 * step * 0.03;
      s.x += Math.sin(s.t * 2) * 0.25;

      s.life -= 1 * step;
      const a = Math.max(0, Math.min(1, (s.life / 120) * s.flicker));
      const r = Math.max(0, s.r * (0.6 + a));

      ctx.beginPath();
      ctx.fillStyle = sparkColor(a * 0.9, s.t);
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 220, 170, ${a * 0.25})`;
      ctx.arc(s.x, s.y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (s.life <= 0 || s.y < -20) sparks.splice(i, 1);
    }

    rafId = requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else {
      last = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  });

  rafId = requestAnimationFrame(draw);
})();

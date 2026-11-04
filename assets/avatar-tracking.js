(() => {
  'use strict';

  const portrait = document.querySelector('[data-avatar]');
  if (!portrait) return;
  const eyes = Array.from(portrait.querySelectorAll('[data-eye]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointer = null;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    eyes.forEach(eye => eye.querySelector('[data-pupil]').removeAttribute('transform'));
  }

  function paint() {
    frame = 0;
    if (!pointer || reducedMotion.matches) return;
    const bounds = portrait.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    eyes.forEach(eye => {
      const cx = Number(eye.dataset.x);
      const cy = Number(eye.dataset.y);
      const x = bounds.left + cx / 1254 * bounds.width;
      const y = bounds.top + cy / 1254 * bounds.height;
      // Saturate smoothly at the edge of an ellipse inside each eyelid.
      const dx = (pointer.x - x) / Math.max(180, bounds.width * .65);
      const dy = (pointer.y - y) / Math.max(180, bounds.height * .65);
      const length = Math.hypot(dx, dy);
      const scale = length ? Math.tanh(length) / length : 0;
      eye.querySelector('[data-pupil]').setAttribute('transform',
        `translate(${(dx * scale * 17).toFixed(2)} ${(dy * scale * 7).toFixed(2)})`);
    });
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('scroll', reset, { passive: true });
  reducedMotion.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
})();

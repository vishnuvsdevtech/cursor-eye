/* An eye that watches back.
 *   gaze   — iris on a spring toward the pointer
 *   blink  — irregular interval, fast close, slower open
 *   pupil  — dilates with pointer speed
 *   avert  — stare for 2.5s and it looks away, then blinks
 */
(() => {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const CX = W / 2, CY = H / 2;
  const mG = document.getElementById('m-g');
  const mB = document.getElementById('m-b');
  const mS = document.getElementById('m-s');
  const mP = document.getElementById('m-p');

  let mx = CX + 300, my = CY, pmx = mx, pmy = my, speed = 0;
  let ix = 0, iy = 0, vx = 0, vy = 0;          // iris offset
  let blink = 0, nextBlink = 2.2, blinks = 0;
  let stare = 0, avert = 0, pupil = 1, t = 0;

  c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    mx = (e.clientX - r.left) * (W / r.width);
    my = (e.clientY - r.top) * (H / r.height);
    speed = Math.hypot(mx - pmx, my - pmy);
    pmx = mx; pmy = my;
  }, { passive: true });

  function frame() {
    t += 0.016;
    speed *= 0.90;

    // staring: pointer within 110px of the eye
    const near = Math.hypot(mx - CX, my - CY) < 110;
    stare = near ? stare + 0.016 : Math.max(0, stare - 0.06);
    const wantAvert = stare > 2.5;
    avert += ((wantAvert ? 1 : 0) - avert) * 0.06;

    // gaze target: pointer, or the far edge when averting
    const ang = Math.atan2(my - CY, mx - CX);
    const gx = Math.cos(ang + Math.PI * avert) * 30;
    const gy = Math.sin(ang + Math.PI * avert) * 22 * (1 - avert * 0.6);

    vx += (gx - ix) * 0.22; vx *= 0.76; ix += vx;
    vy += (gy - iy) * 0.22; vy *= 0.76; iy += vy;

    pupil += ((1 + Math.min(0.6, speed * 0.012)) - pupil) * 0.12;

    // blink scheduling
    nextBlink -= 0.016;
    if (nextBlink <= 0) { blinks++; nextBlink = 2 + Math.random() * 4; blink = 1; }
    blink *= 0.86;

    // ---- draw
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#08090b';
    ctx.fillRect(0, 0, W, H);

    // sclera
    const lid = 1 - blink;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(CX, CY, 190, 112 * lid + 2, 0, 0, 6.283);
    ctx.fillStyle = '#f2f4f8';
    ctx.fill();
    ctx.clip();

    // iris
    const iy2 = iy * 0.8;
    const grd = ctx.createRadialGradient(CX + ix, CY + iy2, 8, CX + ix, CY + iy2, 80);
    grd.addColorStop(0, '#6fd0ff');
    grd.addColorStop(0.55, '#2a7fb5');
    grd.addColorStop(1, '#123f5c');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(CX + ix, CY + iy2, 78, 0, 6.283); ctx.fill();

    // pupil
    ctx.fillStyle = '#05070a';
    ctx.beginPath(); ctx.arc(CX + ix, CY + iy2, 34 * pupil, 0, 6.283); ctx.fill();

    // catchlight
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(CX + ix - 22, CY + iy2 - 24, 9, 0, 6.283); ctx.fill();

    // lid shadow
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.fillRect(0, 0, W, CY - 90 * lid);
    ctx.restore();

    // eyelid line
    ctx.strokeStyle = 'rgba(240,245,255,.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(CX, CY, 190, 112 * lid + 2, 0, 0, 6.283); ctx.stroke();

    mG.textContent = Math.round(ix) + ', ' + Math.round(iy);
    mB.textContent = blinks;
    mS.textContent = stare.toFixed(1) + 's';
    mP.textContent = pupil.toFixed(2);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.documentElement.dataset.ready = '1';
})();

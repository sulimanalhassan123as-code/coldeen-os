import React, { useEffect, useRef, useState } from 'react';

/* A real 3D phone built from CSS. Drag (mouse or finger) to rotate it. Front = live ticket, back = cameras. */
export default function Phone3D({ ticket, face = 'front' }) {
  const el = useRef(null);
  // all motion is driven from JS so drag, buttons and the idle sway never fight each other
  const startY = String(face).toLowerCase() === 'back' ? 168 : -24;
  const st = useRef({ rx: -6, ry: startY, rz: 7, drag: false, x: 0, y: 0, vy: 0, idle: true, t0: performance.now(), smooth: false });
  const [dragging, setDragging] = useState(false);

  const apply = () => {
    if (!el.current) return;
    const s = st.current;
    el.current.style.transform = `rotateX(${s.rx}deg) rotateY(${s.ry}deg) rotateZ(${s.rz}deg)`;
  };

  const down = (e) => {
    const p = e.touches ? e.touches[0] : e;
    const s = st.current;
    s.drag = true; s.x = p.clientX; s.y = p.clientY; s.idle = false; s.vy = 0; s.smooth = false;
    if (el.current) el.current.style.transition = 'none';
    setDragging(true);
  };
  const move = (e) => {
    const s = st.current;
    if (!s.drag) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - s.x, dy = p.clientY - s.y;
    s.x = p.clientX; s.y = p.clientY;
    s.ry += dx * 0.6; s.vy = dx * 0.6;
    s.rx = Math.max(-40, Math.min(40, s.rx - dy * 0.3));
    apply();
  };
  const up = () => { st.current.drag = false; setDragging(false); };

  useEffect(() => {
    const m = (e) => move(e), u = () => up();
    window.addEventListener('mousemove', m); window.addEventListener('mouseup', u);
    window.addEventListener('touchmove', m, { passive: true }); window.addEventListener('touchend', u);
    let raf;
    const loop = (now) => {
      const s = st.current;
      if (s.idle && !s.drag) {
        // gentle idle sway so people notice it is 3D
        const k = (now - s.t0) / 1000;
        s.ry = -24 + Math.sin(k * 0.9) * 22; s.rx = -6; s.rz = 7;
        apply();
      } else if (!s.drag && Math.abs(s.vy) > 0.05) {
        s.ry += s.vy; s.vy *= 0.94; apply();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', m); window.removeEventListener('mouseup', u);
      window.removeEventListener('touchmove', m); window.removeEventListener('touchend', u);
    };
  }, []);

  const turn = (deg) => {
    const s = st.current;
    s.idle = false; s.vy = 0;
    if (el.current) el.current.style.transition = 'transform .9s cubic-bezier(.2,.8,.2,1)';
    s.ry = deg; s.rx = -6; s.rz = 7; apply();
    setTimeout(() => { if (el.current) el.current.style.transition = 'none'; }, 950);
  };
  const spin = () => {
    const s = st.current;
    s.idle = false; s.vy = 0;
    if (el.current) el.current.style.transition = 'transform 1.2s cubic-bezier(.3,.7,.2,1)';
    s.ry = s.ry + 360; apply();
    setTimeout(() => { if (el.current) el.current.style.transition = 'none'; }, 1250);
  };
  const auto = false;

  const t = ticket || {};
  return (
    <div className="stage3d">
      <div className="halo" />
      <div className="orbit" />
      <div className="orbit o2" />
      <div className="reflection" />
      <div className="floor" />
      <div className={'rot' + (dragging ? ' dragging' : '')} ref={el} onMouseDown={down} onTouchStart={down}>
        {/* FRONT */}
        <div className="face front">
          <div className="isl" />
          <div className="scr">
            <div className="tm">10:42</div>
            <div className="tag">COLDEEN · LIVE TICKET</div>
            <div className="ttl">{t.device || 'iPhone 13'} · {t.short || 'screen'}</div>
            <div className="ps on"><span className="pd">✓</span>Received</div>
            <div className="ps on"><span className="pd">✓</span>Diagnosed</div>
            <div className="ps on now"><span className="pd">●</span>Repairing</div>
            <div className="ps"><span className="pd" />Quality checks</div>
            <div className="ps"><span className="pd" />Ready for pickup</div>
            <div className="nt"><b style={{ color: 'var(--gold2)' }}>Tech note</b><br />{t.note || 'Screen fitted, running the 12-point test.'}</div>
          </div>
        </div>
        {/* BACK */}
        <div className="face back">
          <div className="cam"><div className="lens l1" /><div className="lens l2" /><div className="flash" /></div>
          <div className="logo-back">
            <svg viewBox="0 0 24 24"><path d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.1-1.66-.17-3.24.98-4.08.98-.84 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.1 1.35 10.74.9 1.3 1.97 2.75 3.38 2.7 1.36-.05 1.87-.88 3.51-.88 1.64 0 2.1.88 3.54.85 1.46-.02 2.38-1.32 3.27-2.62 1.03-1.5 1.45-2.96 1.48-3.03-.03-.01-2.84-1.09-2.92-4.32zM13.7 4.64c.75-.9 1.25-2.16 1.11-3.4-1.08.04-2.38.72-3.15 1.62-.69.8-1.3 2.08-1.14 3.3 1.2.09 2.42-.61 3.18-1.52z" /></svg>
          </div>
          <div className="bkTxt">COLDEEN CERTIFIED</div>
        </div>
      </div>

      <div className="glass done">
        <h4>{t.device || 'iPhone 13'}</h4>
        <small>{t.short === 'screen' || !t.short ? 'Screen replaced' : t.short}</small>
        <div className="ck">✓</div>
        <div className="ln">✓ 12/12 checks passed</div>
      </div>
      <div className="glass qr">
        <span>Scan to track</span>
        <QR />
      </div>

    </div>
  );
}

/* tiny deterministic QR-style pattern (visual only) */
function QR() {
  const n = 21, cells = [];
  const finder = (x, y) => (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let on;
    if (finder(x, y)) {
      const fx = x % (n - 7 < x ? 1 : 1), _ = fx;
      const lx = x < 7 ? x : x - (n - 7), ly = y < 7 ? y : y - (n - 7);
      on = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
    } else on = ((x * 7 + y * 13 + x * y) % 5) < 2;
    if (on) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />);
  }
  return <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" fill="#0b0b0d">{cells}</svg>;
}

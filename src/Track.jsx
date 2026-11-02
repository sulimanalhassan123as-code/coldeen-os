import React, { useEffect, useState } from 'react';
import { api, cedi } from './api.js';
import Frame from './Frame.jsx';
import { myTickets, prettyDay } from './live.js';

const STEPS = [
  { k: 'received', label: 'Received', hint: 'Your phone is logged at the shop' },
  { k: 'diagnosing', label: 'Diagnosed', hint: 'We found the fault and the price' },
  { k: 'repairing', label: 'Repairing', hint: 'The technician is working on it' },
  { k: 'quality', label: 'Quality checks', hint: 'Testing every function before pickup' },
  { k: 'ready', label: 'Ready for pickup', hint: 'Come and collect it' },
];
const idxOf = (st) => {
  if (st === 'cancelled') return -1;
  if (st === 'received') return 0;
  if (st === 'diagnosing' || st === 'parts') return 1;
  if (st === 'repairing') return 2;
  if (st === 'ready') return 4;
  if (st === 'collected') return 5;
  return 0;
};
const fmt = (from, to, i, idx) => {
  const a = new Date(from).getTime(), b = Math.max(a, new Date(to).getTime());
  const span = b - a;
  let t;
  if (span < 10 * 60000) t = new Date(b - (Math.min(idx, 4) - i) * 14 * 60000);
  else t = new Date(a + span * (idx <= 0 ? 0 : Math.min(1, i / idx)));
  return t.toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function Track({ initialCode, theme, setTheme }) {
  const [code, setCode] = useState(initialCode || '');
  const [job, setJob] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState([]);
  const [ticks, setTicks] = useState(0);

  useEffect(() => { setSaved(myTickets()); }, []);

  const find = async (c, quiet) => {
    const raw = String(c || code || '').trim();
    if (!raw) return;
    if (!quiet) { setErr(''); setBusy(true); }
    try {
      const r = await api.track(raw);
      setJob(r.job); setErr('');
    } catch (e) { if (!quiet) { setJob(null); setErr(e.message); } }
    if (!quiet) setBusy(false);
  };

  useEffect(() => { if (initialCode) { setCode(initialCode); find(initialCode); } }, [initialCode]); // eslint-disable-line

  // keep the open ticket live while the customer watches it
  useEffect(() => {
    if (!job || ['collected', 'cancelled'].includes(job.status)) return;
    const t = setInterval(() => { find(job.code, true); setTicks(x => x + 1); }, 15000);
    return () => clearInterval(t);
  }, [job && job.code, job && job.status]); // eslint-disable-line

  const idx = job ? idxOf(job.status) : -1;
  const wa = 'https://wa.me/233504052487?text=' + encodeURIComponent('Hello Golden Phone Repair, about my repair ' + (job ? job.code : ''));
  const base = job ? (job.created_date || new Date().toISOString()) : null;
  const chip = job ? ({ received: 'Received', diagnosing: 'Diagnosing', parts: 'Awaiting parts', repairing: 'In repair', ready: 'Ready', collected: 'Collected', cancelled: 'Cancelled' }[job.status] || job.status) : '';

  return (
    <Frame active="track" theme={theme} setTheme={setTheme}>
      <div className="s-pageHead">
        <h1>Track your repair</h1>
        <p>Type the ticket code from your receipt. It updates by itself, no app and no login.</p>
      </div>

      <div className="s-input neu-inset">
        <input placeholder="Ticket code e.g. COL-4831" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && find()} />
        <button onClick={() => find()} disabled={busy}>{busy ? '…' : 'Track'}</button>
      </div>

      {saved.length > 0 && (
        <>
          <span className="s-lab">Your tickets on this phone</span>
          <div className="s-opt2">
            {saved.map(t => (
              <button key={t.code} className={'s-pill neu-btn' + (job && job.code === t.code ? ' on' : '')} onClick={() => { setCode(t.code); find(t.code); }}>
                🎫 {t.code}
              </button>
            ))}
          </div>
        </>
      )}

      {err && (
        <div className="s-err neu-inset">
          {err}
          <div style={{ marginTop: 8 }}>
            <a style={{ color: 'var(--primary-accent)', fontWeight: 800 }} href={wa} target="_blank" rel="noreferrer">WhatsApp the shop and we will find it ›</a>
          </div>
        </div>
      )}

      {!job && !err && (
        <div className="s-ok neu-flat" style={{ marginTop: 18 }}>
          <p style={{ marginTop: 0 }}>Nothing loaded yet. Enter your code above to see exactly where your phone is.</p>
          <p style={{ marginBottom: 0 }}><a style={{ color: 'var(--primary-accent)', fontWeight: 800 }} href="#/track?code=COL-4821">See a sample ticket: COL-4821</a></p>
        </div>
      )}

      {job && (
        <div className="s-card neu-flat" style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{job.device}</div>
              <div style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--primary-accent)', letterSpacing: '.08em', marginTop: 4 }}>{job.code}</div>
              {job.service ? <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>{job.service}</div> : null}
            </div>
            <span className="s-badge neu-inset">{chip}</span>
          </div>

          <div className="s-tl" style={{ marginTop: 18 }}>
            {STEPS.map((st, i) => {
              const state = i < idx ? 'done' : i === idx ? 'now' : '';
              const when = i <= idx ? fmt(base, job.updated_date || base, i, Math.min(idx, 4)) : 'Not yet';
              return (
                <div key={st.k} className={'s-tstep ' + (i < idx || idx >= 5 ? 'done ' : '') + state}>
                  <div className="s-dot">{i < idx || idx >= 5 ? '✓' : i === idx ? '●' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <b>{st.label}</b>
                    <small>{i <= idx ? when : st.hint}</small>
                    {i === idx && job.note && idx < 5 && (
                      <div className="s-note neu-inset">
                        <img src="/img/repair.jpg" alt="" />
                        <div>
                          <b>🛠 Note from the technician</b>
                          <span>{job.note}</span>
                          <small>{job.technician ? 'Technician ' + job.technician : ''}</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {job && (
        <div className="s-quote neu-flat">
          <div className="q">👛 {job.paid ? 'Paid, thank you' : 'Quoted ' + cedi(job.quote) + ' · pay on collection'}</div>
          <div className="row">
            <button className="neu-btn pri" style={{ background: 'var(--primary-accent)', color: 'var(--on-acc)' }} onClick={() => alert('MoMo deposit will open here once payments are connected.')}>📱 Pay with MoMo</button>
            <a className="neu-btn" href={wa} target="_blank" rel="noreferrer">💬 WhatsApp</a>
          </div>
        </div>
      )}

      {job && (
        <div style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 18, lineHeight: 1.6 }}>
          ⟳ This page refreshes itself every 15 seconds{ticks ? ' (living)' : ''}.<br />
          Show it to anyone, it is the live status of the repair.
        </div>
      )}
    </Frame>
  );
}

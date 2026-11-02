import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import Frame from './Frame.jsx';
import { useLiveDays, monthGrid, isoOf, prettyDay, saveTicket, useShop } from './live.js';

const SERVICES = [
  { name: 'Screen & display', icon: '🖥️' },
  { name: 'Battery replacement', icon: '🔋' },
  { name: 'Charging & ports', icon: '🔌' },
  { name: 'Water damage', icon: '💧' },
  { name: 'Software & firmware', icon: '🧠' },
  { name: 'Not sure, check it for me', icon: '🔍' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Book({ theme, setTheme }) {
  const shop = useShop();
  const d7 = useLiveDays(8);
  const todayIso = isoOf(new Date());
  const [date, setDate] = useState(todayIso);
  const [cal, setCal] = useState(false);
  const [view, setView] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [slot, setSlot] = useState('');
  const [service, setService] = useState(SERVICES[0].name);
  const [f, setF] = useState({ name: '', phone: '', device: '', note: '' });
  const [slots, setSlots] = useState([]);
  const [closedDays, setClosedDays] = useState([]);
  const [dayClosed, setDayClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);

  // if the chosen day rolls into the past at midnight, move forward
  useEffect(() => { if (date < todayIso) setDate(todayIso); }, [todayIso]); // eslint-disable-line

  useEffect(() => {
    setSlot(''); setSlots([]); setDayClosed(false);
    api.slots(date)
      .then(r => { setSlots(r.slots); setClosedDays(r.closed_days || []); setDayClosed(!!r.closed); })
      .catch(e => setErr(e.message));
  }, [date]);

  const cells = useMemo(() => monthGrid(view.y, view.m), [view]);

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      const r = await api.book({ ...f, service, date, slot });
      const t = { ...r.ticket, date, slot, name: f.name, service };
      saveTicket(t);
      setDone(t);
      window.scrollTo(0, 0);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const waMsg = done ? `https://wa.me/${shop.wa}?text=` + encodeURIComponent(`Hello ${shop.name}, my ticket is ${done.code} for ${prettyDay(done.date)} at ${done.slot}. Name: ${done.name || ''}.`) : '#';

  const copy = async () => {
    try { await navigator.clipboard.writeText(done.code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (_) { setCopied(false); }
  };

  if (done) {
    return (
      <Frame active="book" theme={theme} setTheme={setTheme}>
        <div className="s-ticket s-ok neu-flat">
          <span className="boom">🎉</span><span className="boom">✨</span><span className="boom">🎊</span><span className="boom">⭐</span>
          <h2>You are booked</h2>
          <p style={{ marginTop: 4 }}>Your repair ticket is already open. This is the code you track with.</p>
          <div className="s-code">{done.code}</div>
          <p style={{ marginTop: 2 }}>
            <b style={{ color: 'var(--text-dark)' }}>{prettyDay(done.date)}</b> at <b style={{ color: 'var(--text-dark)' }}>{done.slot}</b><br />
            {done.service}
          </p>
          <div className="s-actions" style={{ marginTop: 18 }}>
            <a href={'#/track?code=' + done.code}>Track my repair</a>
            <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy code'}</button>
            <a href={waMsg} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
          <p style={{ marginTop: 14, fontSize: '.76rem' }}>We saved this ticket on your phone, so you can find it again under Track even if you close the app.</p>
          <a className="s-go" style={{ display: 'block', textAlign: 'center', marginTop: 8 }} href="#/">Back to homepage</a>
        </div>
      </Frame>
    );
  }

  return (
    <Frame active="book" theme={theme} setTheme={setTheme}>
      <div className="s-pageHead">
        <h1>Book your repair</h1>
        <p>Pick what is wrong and when to come. A tracking ticket is created the moment you confirm.</p>
      </div>

      <span className="s-lab">What needs fixing?</span>
      <div className="s-opt2">
        {SERVICES.map(s => (
          <button key={s.name} className={'s-pill neu-btn' + (service === s.name ? ' on' : '')} onClick={() => setService(s.name)}>{s.icon} {s.name}</button>
        ))}
      </div>

      <span className="s-lab">Choose a day</span>
      <div className="s-opt2">
        {d7.map(d => (
          <button key={d.iso} className={'s-pill neu-btn' + (date === d.iso ? ' on' : '')} onClick={() => setDate(d.iso)}>
            {d.label} {d.day} {d.mon}
          </button>
        ))}
        <button className={'s-pill neu-btn' + (cal ? ' on' : '')} onClick={() => setCal(c => !c)}>📅 Another date</button>
      </div>

      {cal && (
        <div className="s-card neu-flat" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button className="s-ic neu-btn" aria-label="Previous month" onClick={() => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })}>‹</button>
            <b style={{ fontSize: '.95rem' }}>{MONTHS[view.m]} {view.y}</b>
            <button className="s-ic neu-btn" aria-label="Next month" onClick={() => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, fontSize: '.62rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 6 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, i) => <span key={i}>{x}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
            {cells.map((c, i) => {
              if (!c) return <span key={'e' + i} />;
              const past = c.iso < todayIso;
              const isClosed = closedDays.includes(c.iso);
              const on = c.iso === date;
              return (
                <button key={c.iso} disabled={past}
                  className={'s-slot neu-btn' + (on ? ' on' : '')}
                  style={{ padding: '9px 0', fontSize: '.8rem', opacity: past ? .35 : 1, textDecoration: isClosed ? 'line-through' : 'none' }}
                  onClick={() => { setDate(c.iso); setCal(false); }}>
                  {c.d}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: 8 }}>
            Chosen: <b style={{ color: 'var(--primary-accent)' }}>{prettyDay(date)}</b>
          </div>
        </div>
      )}

      <span className="s-lab">Choose a time</span>
      {dayClosed ? (
        <div className="s-err neu-inset">The shop is closed on {prettyDay(date)}. Please pick another day.</div>
      ) : slots.length === 0 ? (
        <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0 4px' }}>Checking slots…</div>
      ) : (
        <div className="s-slots">
          {slots.map(s => (
            <button key={s.slot} className={'s-slot neu-btn' + (slot === s.slot ? ' on' : '') + (s.full ? ' full' : '')} disabled={s.full} onClick={() => setSlot(s.slot)}>
              {s.slot}{s.full ? ' full' : ` · ${s.left}`}
            </button>
          ))}
        </div>
      )}

      <span className="s-lab">Your name</span>
      <input className="s-field" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Ama Mensah" />
      <span className="s-lab">Phone number</span>
      <input className="s-field" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="e.g. 024 400 0111" inputMode="tel" />
      <span className="s-lab">Which phone? (helps us prepare the part)</span>
      <input className="s-field" value={f.device} onChange={e => setF({ ...f, device: e.target.value })} placeholder="e.g. iPhone 12" />
      <span className="s-lab">What is the fault? (optional)</span>
      <textarea className="s-field" rows={2} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="e.g. Screen cracked in the corner, touch still works" />

      {err && <div className="s-err neu-inset">{err}</div>}
      <button className="s-go" disabled={busy || !slot || dayClosed} onClick={submit}>{busy ? 'Booking…' : 'Confirm booking'}</button>
      {!slot && !dayClosed && <div style={{ fontSize: '.74rem', textAlign: 'center', marginTop: 10, color: 'var(--text-muted)', fontWeight: 700 }}>Pick a time slot to continue</div>}
    </Frame>
  );
}

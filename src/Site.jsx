import React, { useEffect, useState } from 'react';
import { api, cedi } from './api.js';
import Frame from './Frame.jsx';
import Phone3D from './Phone3D.jsx';
import { useLiveHome } from './live.js';

const go = (h) => { window.location.hash = h; };
const isPhoto = (v) => /^https?:\/\//.test(String(v || ''));

export default function Site({ theme, setTheme }) {
  const { data, err, updated, reload } = useLiveHome(12000);
  const [code, setCode] = useState('');
  const [flash, setFlash] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);

  useEffect(() => { if (installEvt === undefined) return; }, [installEvt]);
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  useEffect(() => { if (updated) { setFlash(true); const t = setTimeout(() => setFlash(false), 2600); return () => clearTimeout(t); } }, [updated]);

  const s = (data && data.settings) || {};
  const stats = (data && data.stats) || {};
  const wa = (s.whatsapp || '233504052487').replace(/[^0-9]/g, '');
  const name = s.shop_name || 'COLDEEN';

  const install = async () => {
    if (installEvt) { installEvt.prompt(); setInstallEvt(null); }
    else alert('To install: open the browser menu (three dots) and tap "Add to Home screen".');
  };
  const trackNow = () => { if (code.trim()) go('#/track?code=' + encodeURIComponent(code.trim().toUpperCase())); };

  const tanks = ['blue', 'emerald', 'violet'];
  void tanks;

  const tiles = (data ? data.services : []).map(sv => ({
    ico: sv.icon,
    name: sv.name,
    from: sv.price_from > 0 ? 'from ' + cedi(sv.price_from) : 'Ask in shop',
  }));

  const ticker = [
    stats.jobsActive ? <span key="a"><b>{stats.jobsActive}</b> repairs in progress</span> : null,
    stats.ready ? <span key="b"><b>{stats.ready}</b> ready for pickup</span> : null,
    <span key="c"><b>{stats.today ?? 0}</b> appointments today</span>,
    <span key="d">{s.hours || 'Mon to Sat · 9am to 7pm'}</span>,
    <span key="e">{s.warranty || '3-month warranty after you collect'}</span>,
  ].filter(Boolean);

  return (
    <Frame active="home" theme={theme} setTheme={setTheme} shopName={name} wa={wa} phone={s.phone || '0504052487'}>
      {flash && (
        <div className="s-notice neu-inset" style={{ borderColor: 'var(--primary-accent)' }}>
          <span className="blip" /> Updated from the shop just now
        </div>
      )}

      {s.notice ? (
        <div className="s-notice neu-flat"><span className="blip" />{s.notice}</div>
      ) : null}

      {err && (
        <div className="s-err neu-inset" style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{err}</span>
          <button className="neu-btn" style={{ padding: '8px 14px', borderRadius: 20, fontWeight: 800 }} onClick={reload}>Try again</button>
        </div>
      )}

      {/* HERO: the phone stands inside the glowing ring on a raised disc */}
      <section className="s-hero">
        <div className="s-disc neu-flat">
          <div className="s-disc-in neu-inset">
            <div className="s-ring o2" />
            <div className="s-ring" />
            <div className="s-phoneBox">
              <Phone3D ticket={{ device: s.showcase_model || 'iPhone 13', short: s.showcase_service || 'screen' }} face={s.showcase_face || 'front'} />
            </div>
          </div>
        </div>
      </section>

      <div className="s-caption">
        <h2>Your phone, <span>fixed properly.</span></h2>
        <p>Verified before you pay. Screens, batteries and boards with original-grade parts.</p>
        <div className="s-chips">
          <span className="s-chip neu-btn"><i />Workshop open</span>
          <span className="s-chip neu-btn"><b>{stats.today ?? 0}</b>&nbsp;appointments today</span>
          <span className="s-chip neu-btn">{s.turnaround || "most repairs within 24 hours"}</span>
        </div>
      </div>

      <section className="s-actions">
        <a href="#/book">Book a Repair</a>
        <a href="#/track">Track Repair</a>
        <a href={'https://wa.me/' + wa} target="_blank" rel="noreferrer">Chat with Us</a>
      </section>

      <div className="s-install">
        <button className="neu-btn" onClick={install}>📲 Install App on Your Phone</button>
      </div>

      <div className="s-ticker neu-flat">
        <div className="track">
          {[...ticker, ...ticker].map((t, i) => (
            <React.Fragment key={i}>{t}<span className="sep">•</span></React.Fragment>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section className="s-sec" id="services">
        <div className="s-title">Our services, tap to explore</div>
        <div className="s-grid3">
          {tiles.map(t => (
            <a key={t.name} className="s-tile" href="#/book">
              <span className="ico">{t.ico}</span>
              <b>{t.name}</b>
              <small>{t.from}</small>
            </a>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="s-sec">
        <div className="s-card neu-flat">
          <div className="s-title">Why {name.split(' ')[0]}</div>
          {[
            s.warranty || '3-month warranty after you collect your phone',
            'Original-grade parts, tested before you pay',
            'Pay on collection, no upfront payment',
            'Receipt on WhatsApp, live tracking from drop-off',
            'Honest diagnosis: we tell you when it is not worth fixing',
          ].map(t => (
            <div className="s-feat" key={t}><span className="tick">✓</span><span>{t}</span></div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="s-sec">
        <div className="s-title">How it works</div>
        <div className="s-steps">
          {[['1', 'Book a slot', 'Pick a service and a time. Two slots per hour so nobody waits all day.'],
            ['2', 'Get your ticket', 'A ticket code is created instantly, so you can follow the repair from minute one.'],
            ['3', 'Track & collect', 'Follow it live. Pay on collection, receipt on WhatsApp.']].map(([n, t, d]) => (
            <div className="s-step neu-flat" key={n}>
              <div className="n neu-inset">{n}</div>
              <div><b>{t}</b><span>{d}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* TRACK */}
      <section className="s-sec" id="track">
        <div className="s-title">Where is my phone?</div>
        <div className="s-input neu-inset">
          <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && trackNow()} placeholder="Ticket code e.g. COL-4831" inputMode="text" />
          <button onClick={trackNow}>Track</button>
        </div>
      </section>

      {/* DEVICES */}
      <section className="s-sec" id="devices">
        <div className="s-title">In stock today</div>
        <div className="s-scroll">
          {(data ? data.phones : []).map((p, i) => (
            <div className="s-dev neu-flat" key={i}>
              <small>{p.badge || p.brand}</small>
              <b>{p.model} · {p.storage}</b>
              <em>{p.condition}{p.note ? ' · ' + p.note : ''}</em>
              <div className="pr">{cedi(p.price)}</div>
              <em>{p.stock > 0 ? p.stock + ' in stock' : 'Sold out'}</em>
              <a className="btn neu-btn" href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${name}, I am interested in the ${p.model} ${p.storage} (${cedi(p.price)}).`)}`} target="_blank" rel="noreferrer">Ask about this phone</a>
            </div>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section className="s-sec" id="work">
        <div className="s-title">Our work</div>
        <div className="s-work">
          {(data ? data.work : []).map((w, i) => (
            <div className="w neu-flat" key={(w.id || '') + i}>
              {isPhoto(w.image_url)
                ? <img src={w.image_url} alt={w.title} loading="lazy" />
                : <div className="neu-inset" style={{ aspectRatio: '1', borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: '2.6rem' }}>{w.image_url}</div>}
              <b>{w.title}</b>
              <small>{w.service}</small>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="s-sec" id="contact">
        <div className="s-title">Find us</div>
        <div className="s-card neu-flat">
          <div className="s-feat"><span className="tick">📍</span><span>{s.address || 'Accra, Ghana'}</span></div>
          <div className="s-feat"><span className="tick">🕘</span><span>{s.hours || 'Mon to Sat, 9am to 7pm'}</span></div>
          <div className="s-feat"><span className="tick">📞</span><a href={'tel:' + (s.phone || '0504052487')}>{s.phone || '0504052487'}</a></div>
          {s.map_link ? (
            <a className="s-go" style={{ display: 'block', textAlign: 'center', marginTop: 14, padding: 14, borderRadius: 30 }} href={s.map_link} target="_blank" rel="noreferrer">🧭 Open in Maps</a>
          ) : null}
        </div>
      </section>

      <div className="s-foot">
        {name} · Mobile Shop · {s.since ? 'Since ' + s.since : 'Accra'}<br />
        <a href="#/portal" style={{ opacity: .6 }}>Owner console</a>
      </div>
    </Frame>
  );
}

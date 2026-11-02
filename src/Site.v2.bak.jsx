import React, { useEffect, useRef, useState } from 'react';
import { api, cedi } from './api.js';
import Burger from './Burger.jsx';
import Phone3D from './Phone3D.jsx';

const PHONE_IMG = ['ph-blue','ph-pink','ph-green','ph-purple'];
const Ico = {
  shield: <svg className="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5L16 9.5"/></svg>,
  gear: <svg className="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>,
  card: <svg className="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>,
  wa: <svg className="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a8 8 0 01-11.8 7L4 20l1.5-4.1A8 8 0 1120 11.5z"/><path d="M9 9c.3 2.5 2.5 4.7 5 5l1.3-1.3-1.9-1-.8.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.8-1-1.9L9 9z"/></svg>,
};

const go = (h) => { window.location.hash = h; };

export default function Site({ theme, setTheme }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [code, setCode] = useState('');
  const [splash] = useState(() => { try { if (sessionStorage.getItem('col_splash')) return false; sessionStorage.setItem('col_splash', '1'); return true; } catch (e) { return false; } });
  const loadHome = () => { setErr(''); api.home().then(setData).catch(e => setErr(e.message)); };
  useEffect(() => { loadHome(); }, []);

  const s = (data && data.settings) || {};
  const wa = (s.whatsapp || '').replace(/[^0-9]/g, '');
  const stats = (data && data.stats) || {};

  const trackNow = () => { if (code.trim()) go('#/track?code=' + encodeURIComponent(code.trim().toUpperCase())); };

  return (
    <div className="fadeIn">
      {splash && <div className="splash"><img src="/img/logo-icon.png" alt="" /><b>COLDEEN</b></div>}
      <div className="nav">
        <div className="in">
          <a className="brandLogo" href="#/"><img src="/img/logo-icon.png" alt="" />{s.shop_name || 'COLDEEN'}</a>
          <nav className="links">
            <a href="#/">Home</a>
            <a href="#services">Repairs</a>
            <a href="#devices">Devices</a>
            <a href="#/track">Track repair</a>
            <a href="#work">Our work</a>
          </nav>
          <Burger theme={theme} setTheme={setTheme} wa={wa} shopName={s.shop_name} />
        </div>
      </div>

      {err && <div className="wrap" style={{ paddingTop: 20 }}><div className="panel err" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}><span>{err}</span><button className="btn sm gold" onClick={loadHome}>Try again</button></div></div>}

      <header className="hero">
        <div className="wrap in">
          <div>
            <span className="eyebrow">{(s.tagline || 'Accra').split('·').pop().trim()} · Trusted since {s.since || '2019'}</span>
            <h1>Your phone,<br /><span className="g">fixed properly.</span><br />Verified before you pay.</h1>
            <p className="lede">
              Screens, batteries and boards repaired with original-grade parts, and a written result you can check.
              Book a slot, then follow your repair live with your ticket code.
            </p>
            <div className="ctaRow">
              <a className="btn gold" href="#/book">Book a repair →</a>
              <a className="btn outl" href="#/track?code=COL-4821">Track my repair</a>
            </div>
            <div className="statusStrip">
              <span><i />Workshop open</span>
              <span><i /><b>{stats.today ?? 14}</b>&nbsp;devices today</span>
              <span><i />Avg turnaround <b>4h</b></span>
            </div>
          </div>
          <Phone3D ticket={{ device: s.showcase_model || 'iPhone 13', short: s.showcase_service || 'screen' }} face={s.showcase_face || 'front'} />
        </div>
      </header>

      <div className="trustBar">
        <div className="in">
          <div className="tb">{Ico.shield}<div><b>{(s.warranty || '3-month warranty').replace('3 months on every repair','3-month warranty')}</b><small>Peace of mind, always.</small></div></div>
          <div className="tb">{Ico.gear}<div><b>Original-grade parts</b><small>Quality you can trust.</small></div></div>
          <div className="tb">{Ico.card}<div><b>Pay on collection</b><small>No upfront payment.</small></div></div>
          <div className="tb">{Ico.wa}<div><b>Receipt by WhatsApp</b><small>Fast. Convenient. Secure.</small></div></div>
        </div>
      </div>

      <div className="live">
        <div className="wrap in">
          <span><b>{stats.jobsActive ?? 0}</b> repairs in progress</span>
          <span><b>{stats.ready ?? 0}</b> ready for pickup</span>
          <span><b>{stats.today ?? 0}</b> appointments today</span>
          <span><span className="dot" style={{ display: 'inline-block', marginRight: 6 }} /><b>Open now</b> · {s.hours || 'Mon–Sat 9am–7pm'}</span>
        </div>
      </div>

      <section id="services">
        <div className="wrap">
          <div className="sHead">
            <div className="sTag">What we do</div>
            <h2>Repairs done with evidence, not guesswork</h2>
            <p>Every job starts with a diagnosis and ends with a written result. You see the readings before you approve the price.</p>
          </div>
          <div className="grid g3">
            {(data ? data.services : []).map((sv) => (
              <div className="card" key={sv.name}>
                <div className="ic">{sv.icon}</div>
                <h3>{sv.name}</h3>
                <p>{sv.desc}</p>
                {sv.price_from > 0 && <div className="priceFrom">from {cedi(sv.price_from)}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sHead">
            <div className="sTag">How it works</div>
            <h2>Three steps, no surprises</h2>
          </div>
          <div className="steps">
            <div className="step"><span className="n">1</span><h3>Book a slot</h3><p className="mut" style={{ marginTop: 6, fontSize: '.85rem', lineHeight: 1.6 }}>Pick a service and a time. We keep two slots per hour so nobody waits all day.</p></div>
            <div className="step"><span className="n">2</span><h3>We diagnose & quote</h3><p className="mut" style={{ marginTop: 6, fontSize: '.85rem', lineHeight: 1.6 }}>You get a ticket code and an honest price before any work starts.</p></div>
            <div className="step"><span className="n">3</span><h3>Track & collect</h3><p className="mut" style={{ marginTop: 6, fontSize: '.85rem', lineHeight: 1.6 }}>Follow the repair live. Pay on collection, with a receipt on WhatsApp.</p></div>
          </div>
        </div>
      </section>

      <section id="track" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="trackBox">
            <div className="sTag">Live tracking</div>
            <h2 style={{ marginTop: 8 }}>Where is my phone?</h2>
            <p className="mut" style={{ maxWidth: 520, lineHeight: 1.6, fontSize: '.92rem' }}>
              Enter the ticket code from your receipt and watch your repair move through the workshop — no app needed.
            </p>
            <div className="trackRow">
              <input placeholder="COL-4821" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && trackNow()} />
              <button className="btn gold" onClick={trackNow}>Track repair</button>
            </div>
            <div className="mut" style={{ fontSize: '.75rem', marginTop: 10 }}>Try the demo code <b style={{ color: 'var(--gold2)' }}>COL-4821</b></div>
          </div>
        </div>
      </section>

      <section id="brand" style={{ paddingTop: 0 }}>
        <div className="wrap logoShow">
          <div className="lg"><img src="/img/logo-full.jpg" alt="COLDEEN Phone Repair and Mobile Shop" /></div>
          <div>
            <div className="sTag">The workshop</div>
            <h2>Gold standard repairs, down to the circuit</h2>
            <ul>
              <li><i>✓</i><span>Board-level diagnosis with proper tools, not guesswork.</span></li>
              <li><i>✓</i><span>Every repair tested before you pay, and logged on your ticket.</span></li>
              <li><i>✓</i><span>3-month warranty, receipt on WhatsApp, live tracking from drop-off to collection.</span></li>
            </ul>
            <div className="ctaRow"><a className="btn gold" href="#/book">Book a repair →</a></div>
          </div>
        </div>
      </section>

      <section id="devices" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sHead">
            <div className="sTag">In stock today</div>
            <h2>Devices ready to leave the shelf</h2>
            <p>Cash prices in cedis. Every device is scanned and graded before it is listed.</p>
          </div>
          <div className="grid g3">
            {(data ? data.phones : []).map((p, i) => (
              <div className="devCard" key={p.id}>
                {p.badge && <span className="badge">{p.badge}</span>}
                <Flip img={`/img/${PHONE_IMG[i % PHONE_IMG.length]}.jpg`} />
                <div className="bm">{p.brand}</div>
                <div className="md">{p.model} · {p.storage}</div>
                <div className="mut" style={{ fontSize: '.78rem' }}>{p.condition} · {p.note}</div>
                <div className="pr">{cedi(p.price)}</div>
                <div className="st">{p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</div>
                <a className="btn sm" style={{ marginTop: 12 }} href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${s.shop_name || 'COLDEEN'}, I am interested in the ${p.model} ${p.storage} (${cedi(p.price)}).`)}`} target="_blank" rel="noreferrer">Ask about this phone</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sHead">
            <div className="sTag">Real jobs</div>
            <h2>Work that left the workshop fixed</h2>
            <p>Photos and results the shop publishes after each job. No stock pictures.</p>
          </div>
          <div className="grid g2">
            {(data ? data.work : []).map(w => (
              <div className="workCard" key={w.id}>
                <div className="workThumb">{w.image_url}</div>
                <div className="workBody">
                  <div className="sTag" style={{ fontSize: '.62rem' }}>{w.service}</div>
                  <h3 style={{ marginTop: 6, fontSize: '.98rem' }}>{w.title}</h3>
                  <p className="mut" style={{ fontSize: '.82rem', marginTop: 6, lineHeight: 1.6 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="panel" style={{ display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0 }}>Bring it in today.</h2>
              <p className="mut" style={{ marginTop: 8, fontSize: '.9rem' }}>{s.address} · {s.hours}</p>
            </div>
            <div className="ctaRow" style={{ margin: 0 }}>
              <a className="btn gold" href="#/book">Book a repair</a>
              <a className="btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>
              <a className="btn ghost" href={`tel:${s.phone || ''}`}>📞 {s.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap cols">
          <div>
            <div className="brandLogo" style={{ marginBottom: 12 }}><img src="/img/logo-icon.png" alt="" />{s.shop_name || 'COLDEEN'}</div>
            <p style={{ lineHeight: 1.7 }}>{s.tagline}<br />{s.address}<br />{s.hours}</p>
          </div>
          <div>
            <b style={{ color: 'var(--txt)', display: 'block', marginBottom: 8 }}>Shop</b>
            <a href="#/book">Book a repair</a><br />
            <a href="#track">Track repair</a><br />
            <a href="#devices">Devices</a><br />
            <a href="#work">Our work</a>
          </div>
          <div>
            <b style={{ color: 'var(--txt)', display: 'block', marginBottom: 8 }}>Contact</b>
            <a href={`tel:${s.phone || ''}`}>{s.phone}</a><br />
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp us</a><br />
            <a href="#/portal">Staff console</a>
          </div>
        </div>
        <div className="wrap" style={{ marginTop: 26, fontSize: '.72rem', opacity: .6 }}>© {new Date().getFullYear()} {s.shop_name || 'COLDEEN'} · Built on Coldeen OS</div>
      </footer>

      <div className="mbar">
        <a className="btn gold" href="#/book">Book a repair</a>
        <a className="btn" href="#/track">Track</a>
        <a className="btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">💬</a>
      </div>
    </div>
  );
}

function Flip({ img }) {
  const [on, setOn] = React.useState(false);
  return (
    <div className={'flip' + (on ? ' on' : '')} onClick={() => setOn(!on)} title="Tap to see the back">
      <div className="fi">
        <div className="ff"><img src={img} alt="" /></div>
        <div className="fb"><div className="mini-cam" /><svg viewBox="0 0 24 24"><path d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.1-1.66-.17-3.24.98-4.08.98-.84 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.1 1.35 10.74.9 1.3 1.97 2.75 3.38 2.7 1.36-.05 1.87-.88 3.51-.88 1.64 0 2.1.88 3.54.85 1.46-.02 2.38-1.32 3.27-2.62 1.03-1.5 1.45-2.96 1.48-3.03-.03-.01-2.84-1.09-2.92-4.32zM13.7 4.64c.75-.9 1.25-2.16 1.11-3.4-1.08.04-2.38.72-3.15 1.62-.69.8-1.3 2.08-1.14 3.3 1.2.09 2.42-.61 3.18-1.52z" /></svg></div>
      </div>
      <small>{on ? 'back ↺' : 'tap to flip ↻'}</small>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { api, cedi, STATUS_LABEL } from './api.js';
import Phone3D from './Phone3D.jsx';

const COLS = ['received', 'diagnosing', 'parts', 'repairing', 'ready', 'collected'];
const TECHS = ['Kojo', 'Selorm', 'Ama'];
const today = () => new Date().toISOString().slice(0, 10);
const PH = ['ph-blue', 'ph-pink', 'ph-green', 'ph-purple'];
const imgFor = (j) => '/img/' + PH[(String(j.code || '').replace(/\D/g, '') % PH.length) | 0] + '.jpg';
const TCOL = { Kojo: '#f0cf7a', Selorm: '#7fd1ff', Ama: '#ff9ec7' };
const ago = (d) => { const m = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 60000)); return m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; };
const I = (p) => <svg viewBox="0 0 24 24">{p}</svg>;
const NAV = [
  ['dash', 'Dashboard', I(<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />)],
  ['jobs', 'Jobs', I(<path d="M14.7 6.3a4 4 0 00-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 005.1-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />)],
  ['bookings', 'Bookings', I(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>)],
  ['shop', 'Inventory', I(<path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v9" />)],
  ['services', 'Services', I(<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>)],
  ['work', 'Our work', I(<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" />)],
  ['settings', 'Settings', I(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>)],
];
function Spark({ color, pts }) {
  const w = 200, h = 42, max = Math.max(...pts), min = Math.min(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 10)]);
  const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id={'g' + color.slice(1)} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={d + ` L${w} ${h} L0 ${h} Z`} fill={`url(#g${color.slice(1)})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

async function uploadPhoto(file) {
  // shrink on the phone first, then store as a data URL in the work record
  const bmp = await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
  const max = 900;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.72);
}

export default function Console() {
  const [key, setKey] = useState(localStorage.getItem('col_key') || '');
  const [in_, setIn] = useState(!!localStorage.getItem('col_key'));
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const login = async () => {
    setErr('');
    try { await api.admin(pw, 'list', {}); }
    catch (e) {
      setErr(String(e.message).includes('Invalid admin key') ? 'Wrong access code.' : e.message);
      return;
    }
    localStorage.setItem('col_key', pw); setKey(pw); setIn(true);
  };

  if (!in_) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="panel" style={{ maxWidth: 400, width: '100%' }}>
        <div className="brandLogo" style={{ marginBottom: 14 }}><img src="/img/logo-icon.png" alt="" />COLDEEN</div>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Workshop console</h2>
        <p className="mut" style={{ marginTop: 6, fontSize: '.86rem' }}>Private area. Enter the shop access code.</p>
        <label>Access code</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••" />
        {err && <div className="err">{err}</div>}
        <button className="btn gold" style={{ width: '100%', marginTop: 16, padding: 14 }} onClick={login}>Open console</button>
        <div className="mut" style={{ fontSize: '.72rem', textAlign: 'center', marginTop: 12 }}>This page is not linked from the shop site.</div>
      </div>
    </div>
  );

  return <Board adminKey={key} onLock={() => { localStorage.removeItem('col_key'); setIn(false); setKey(''); }} />;
}

function Board({ adminKey, onLock }) {
  const [tab, setTab] = useState('dash');
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null); // {type:'job'|'phone'|'work'|'jobEdit', data}
  const [techF, setTechF] = useState('');

  const load = async () => {
    try { const r = await api.admin(adminKey, 'list', {}); setD(r); setErr(''); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);

  const act = async (action, data) => { await api.admin(adminKey, action, data); load(); };

  const jobs = (d && d.jobs) || [];
  const shopSet = (d && d.settings) || {};
  const ownerName = (shopSet.owner_name || '').trim() || 'Shop Owner';
  const ownerRole = (shopSet.owner_role || '').trim() || 'Shop Owner';
  const first = ownerName.split(/\s+/)[0] || 'there';
  const hr = new Date().getHours();
  const hello = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const stats = (d && d.stats) || {};
  const bookings = (d && d.bookings) || [];

  return (
    <div className={'console' + (tab === 'dash' ? '' : ' noRight')}>
      <aside className="side">
        <div className="brandLogo"><img src="/img/logo-icon.png" alt="" />COLDEEN</div>
        {NAV.map(([k, l, ic]) => (
          <button key={k} className={'it' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{ic}{l}</button>
        ))}
        <div style={{ display: 'flex', gap: 8, padding: '14px 6px 0' }}>
          <button className="btn sm" onClick={load}>Refresh</button>
          <button className="btn sm" onClick={onLock}>Lock</button>
        </div>
        <div className="sideFoot"><img src="/img/logo-icon.png" alt="" style={{ width: 46, height: 46, borderRadius: 12, marginBottom: 8 }} /><div style={{ letterSpacing: '.18em', fontWeight: 800, color: '#f0cf7a' }}>COLDEEN</div>Phone Repair Shop<br />Fix · Restore · Keep You Connected</div>
      </aside>

      <main className="main">
        {err && <div className="panel err" style={{ marginBottom: 14 }}>{err}</div>}

        {tab === 'dash' && d && (
          <>
            <div className="welcome">
              <div>
                <h2>{hello}, {first} <span className="crown">♛</span></h2>
                <p className="mut" style={{ fontSize: '.86rem', marginTop: 4 }}>Here's what's happening at your shop today.</p>
              </div>
              <div className="who">
                <button className="btn gold sm" onClick={() => setModal({ type: 'job', data: {} })}>+ New job</button>
                <div className="av">{ownerName.charAt(0).toUpperCase()}</div>
                <div><b style={{ fontSize: '.86rem' }}>{ownerName}</b><div className="mut" style={{ fontSize: '.7rem' }}>{ownerRole}</div></div>
              </div>
            </div>

            <div className="kpis">
              <div className="kpi">
                <div className="kh"><div className="ico" style={{ background: 'rgba(240,207,122,.14)', color: '#f0cf7a' }}>₵</div><div className="l">Revenue today</div></div>
                <div className="v">{cedi(stats.revenueToday)}</div>
                <div className="s">{(stats.pipeline || 0) > 0 ? cedi(stats.pipeline) + " still in the works" : "Paid repairs, today"}</div>
                <Spark color="#39c07c" pts={[3, 4, 3, 5, 4, 6, 5, 7, 6, 9, 8, 11]} />
              </div>
              <div className="kpi">
                <div className="kh"><div className="ico" style={{ background: 'rgba(76,141,255,.15)', color: '#7fb0ff' }}>🔧</div><div className="l">Jobs in progress</div></div>
                <div className="v">{stats.active || 0}</div>
                <div className="s">of {jobs.length} total jobs</div>
                <div className="bar"><i style={{ width: Math.round(((stats.active || 0) / (jobs.length || 1)) * 100) + '%', background: '#4c8dff' }} /></div>
              </div>
              <div className="kpi">
                <div className="kh"><div className="ico" style={{ background: 'rgba(240,161,58,.15)', color: '#f0a13a' }}>📦</div><div className="l">Ready for pickup</div></div>
                <div className="v">{stats.ready || 0}</div>
                <div className="s">of {jobs.length} total jobs</div>
                <div className="bar"><i style={{ width: Math.round(((stats.ready || 0) / (jobs.length || 1)) * 100) + '%', background: '#f0a13a' }} /></div>
              </div>
              <div className="kpi">
                <div className="kh"><div className="ico" style={{ background: 'rgba(155,107,255,.16)', color: '#b79bff' }}>▣</div><div className="l">Appointments today</div></div>
                <div className="v">{stats.bookingsToday || 0}</div>
                <div className="s">booked from the website</div>
                <div className="bar"><i style={{ width: Math.min(100, (stats.bookingsToday || 0) * 20) + '%', background: '#9b6bff' }} /></div>
                <Spark color="#9b6bff" pts={[2, 2, 3, 2, 4, 3, 5, 4, 6, 6, 8, 9]} />
              </div>
            </div>

            <div className="boardHead">
              <h3>🔧 Jobs Board</h3>
              <span className="chipS">{jobs.filter(j => !['collected', 'cancelled'].includes(j.status)).length} active jobs</span>
              <select value={techF} onChange={e => setTechF(e.target.value)} style={{ width: 'auto', borderRadius: 999, padding: '8px 14px', fontSize: '.8rem' }}>
                <option value="">All Technicians</option>
                {TECHS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="board">
              {COLS.map(c => {
                const list = jobs.filter(j => j.status === c && (!techF || j.technician === techF));
                return (
                  <div className={'col c-' + c} key={c}>
                    <h4><i className="cd" />{STATUS_LABEL[c]} <span>{list.length}</span></h4>
                    {list.map(j => (
                      <div className="jobCard" key={j.id} onClick={() => setModal({ type: 'jobEdit', data: j })}>
                        <div className="jc">{j.code}</div>
                        <div className="jt">
                          <img src={imgFor(j)} alt="" />
                          <div><div className="jn">{j.device} · {(j.service || '').split(' ')[0]}</div><div className="jm">{j.customer}</div></div>
                        </div>
                        <div className="jp">{cedi(j.quote)}{j.paid ? <span style={{ color: '#39c07c', fontSize: '.62rem', marginLeft: 8 }}>PAID</span> : null}</div>
                        <div className="jf">
                          <div className="tav" style={{ background: TCOL[j.technician] || '#999' }}>{(j.technician || '?')[0]}</div>
                          <div><b style={{ fontSize: '.72rem' }}>{j.technician || 'Unassigned'}</b><small>Technician</small></div>
                          <em>{ago(j.updated_date || j.created_date)} ago</em>
                        </div>
                      </div>
                    ))}
                    {list.length === 0 && <div className="mut" style={{ fontSize: '.72rem', padding: '10px 4px' }}>Nothing here</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'jobs' && d && (
          <>
            <div className="rowBetween">
              <h2 style={{ margin: 0 }}>Repair jobs</h2>
              <button className="btn gold" onClick={() => setModal({ type: 'job', data: {} })}>+ New job</button>
            </div>
            <div className="tableWrap">
              <table>
                <thead><tr><th>Code</th><th>Device</th><th>Customer</th><th>Status</th><th>Tech</th><th>Quote</th><th /></tr></thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td className="mono" style={{ color: 'var(--gold2)', fontWeight: 800 }}>{j.code}</td>
                      <td>{j.device}<div className="mut" style={{ fontSize: '.74rem' }}>{j.service}</div></td>
                      <td>{j.customer}<div className="mut" style={{ fontSize: '.74rem' }}>{j.phone}</div></td>
                      <td><span className={'pill ' + j.status}>{STATUS_LABEL[j.status]}</span></td>
                      <td>{j.technician || '—'}</td>
                      <td style={{ fontWeight: 800 }}>{cedi(j.quote)}</td>
                      <td><button className="btn sm" onClick={() => setModal({ type: 'jobEdit', data: j })}>Open</button></td>
                    </tr>
                  ))}
                  {jobs.length === 0 && <tr><td colSpan={7} className="mut">No jobs yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'bookings' && d && (
          <>
            <div className="rowBetween">
              <h2 style={{ margin: 0 }}>Bookings</h2>
            </div>
            <DayCloser act={act} closedDays={bookings.filter(b => b.status === 'closed').map(b => b.date)} />
            <BookingsTable rows={bookings.filter(b => b.status !== 'closed')} act={act} empty="No bookings yet." />
          </>
        )}

        {tab === 'shop' && d && (
          <>
            <div className="rowBetween">
              <h2 style={{ margin: 0 }}>Shop inventory</h2>
              <button className="btn gold" onClick={() => setModal({ type: 'phone', data: {} })}>+ Add phone</button>
            </div>
            <div className="grid g3" style={{ marginTop: 16 }}>
              {(d.phones || []).map(p => (
                <div className="devCard" key={p.id}>
                  <div className="bm">{p.brand}</div>
                  <div className="md">{p.model} · {p.storage}</div>
                  <div className="mut" style={{ fontSize: '.78rem' }}>{p.condition} · stock {p.stock}</div>
                  <div className="pr">{cedi(p.price)}</div>
                  <div className="ctaRow" style={{ marginTop: 12 }}>
                    <button className="btn sm" onClick={() => setModal({ type: 'phone', data: p })}>Edit</button>
                    <button className="btn sm bad" onClick={() => { if (confirm('Delete ' + p.model + '?')) act('phoneDelete', { id: p.id }); }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'services' && d && (
          <ServicesTab d={d} adminKey={adminKey} onSaved={load} />
        )}

        {tab === 'work' && d && (
          <>
            <div className="rowBetween">
              <h2 style={{ margin: 0 }}>Our work</h2>
              <button className="btn gold" onClick={() => setModal({ type: 'work', data: {} })}>+ Publish a job</button>
            </div>
            <div className="grid g2" style={{ marginTop: 16 }}>
              {(d.work || []).map(w => (
                <div className="workCard" key={w.id}>
                  <div className="workThumb">{w.image_url}</div>
                  <div className="workBody">
                    <b>{w.title}</b>
                    <div className="mut" style={{ fontSize: '.8rem', marginTop: 4 }}>{w.desc}</div>
                    <div className="ctaRow" style={{ marginTop: 12 }}>
                      <button className="btn sm" onClick={() => setModal({ type: 'work', data: w })}>Edit</button>
                      <button className="btn sm bad" onClick={() => { if (confirm('Remove this job from the site?')) act('workDelete', { id: w.id }); }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'settings' && d && <Settings d={d} adminKey={adminKey} onSaved={load} />}
      </main>

      {tab === 'dash' && d && (
        <aside className="rightRail">
          <h3>📅 Today</h3>
          <div className="dt">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className="rowBetween" style={{ marginBottom: 10 }}><b style={{ fontSize: '.88rem' }}>Appointments</b><span className="chipS">{bookings.filter(b => b.date === today() && b.status !== "closed").length}</span></div>
          {bookings.filter(b => b.date === today() && b.status !== "closed").slice(0, 6).map(b => (
            <div className="apt" key={b.id}>
              <div className="at"><span>{b.slot}</span><span className={'st ' + b.status}>{b.status === 'done' ? '✓ Collected' : b.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}</span></div>
              <div className="an">
                <div className="ava" style={{ background: ['#f0cf7a', '#7fd1ff', '#ff9ec7', '#9be3b0'][(b.name || 'A').charCodeAt(0) % 4] }}>{(b.name || '?')[0]}</div>
                <div><b>{b.name}</b><small>{b.service}</small></div>
              </div>
              {b.status === 'confirmed' && (
                <div className="ac">
                  <button onClick={() => act('bookingUpdate', { id: b.id, status: 'done' })}>Done</button>
                  <button onClick={() => act('bookingUpdate', { id: b.id, status: 'cancelled' })}>Cancel</button>
                </div>
              )}
            </div>
          ))}
          {bookings.filter(b => b.date === today()).length === 0 && <div className="mut" style={{ fontSize: '.8rem', padding: '8px 2px' }}>No appointments today.</div>}
          <button className="viewAll" onClick={() => setTab('bookings')}>📅 View all appointments ›</button>
        </aside>
      )}

      {modal && (modal.type === 'job' || modal.type === 'jobEdit') && (
        <JobModal job={modal.data} onClose={() => setModal(null)} act={act} />
      )}
      {modal && modal.type === 'phone' && <PhoneModal item={modal.data} onClose={() => setModal(null)} act={act} />}
      {modal && modal.type === 'work' && <WorkModal item={modal.data} onClose={() => setModal(null)} act={act} />}
    </div>
  );
}

function BookingsTable({ rows, act, empty }) {
  if (!rows.length) return <div className="panel mut" style={{ marginTop: 14 }}>{empty}</div>;
  return (
    <div className="tableWrap">
      <table>
        <thead><tr><th>When</th><th>Customer</th><th>Service</th><th>Status</th><th /></tr></thead>
        <tbody>
          {rows.map(b => (
            <tr key={b.id}>
              <td><b>{b.date}</b><div className="mut" style={{ fontSize: '.74rem' }}>{b.slot}</div></td>
              <td>{b.name}<div className="mut" style={{ fontSize: '.74rem' }}>{b.phone}</div></td>
              <td>{b.service}<div className="mut" style={{ fontSize: '.74rem' }}>{b.note}</div></td>
              <td><span className={'pill ' + b.status}>{b.status}</span></td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {b.status === 'confirmed' && <>
                  <button className="btn sm good" onClick={() => act('bookingUpdate', { id: b.id, status: 'completed' })}>Done</button>{' '}
                  <button className="btn sm bad" onClick={() => act('bookingUpdate', { id: b.id, status: 'cancelled' })}>Cancel</button>
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobModal({ job, onClose, act }) {
  const [f, setF] = useState({
    id: job.id, customer: job.customer || '', phone: job.phone || '', device: job.device || '',
    service: job.service || '', quote: job.quote ?? '', technician: job.technician || '',
    note: job.note || '', status: job.status || 'received', paid: !!job.paid,
  });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    await act('jobSave', f);
    setBusy(false); onClose();
  };
  const setStatus = async (status) => { await act('jobUpdate', { id: job.id, status }); onClose(); };
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modalCard">
        <div className="rowBetween">
          <h3 style={{ margin: 0 }}>{job.id ? (job.code || 'Job') : 'New job'}</h3>
          <button className="btn sm" onClick={onClose}>✕</button>
        </div>

        {job.id && (
          <div className="chipRow" style={{ marginTop: 14 }}>
            {COLS.map(c => (
              <button key={c} className={'chip' + (job.status === c ? ' on' : '')} onClick={() => setStatus(c)}>{STATUS_LABEL[c]}</button>
            ))}
          </div>
        )}

        <label>Customer name</label>
        <input value={f.customer} onChange={e => setF({ ...f, customer: e.target.value })} />
        <label>Phone</label>
        <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} inputMode="tel" />
        <label>Device</label>
        <input value={f.device} onChange={e => setF({ ...f, device: e.target.value })} placeholder="e.g. iPhone 13" />
        <label>Service</label>
        <input value={f.service} onChange={e => setF({ ...f, service: e.target.value })} placeholder="e.g. Screen & display" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label>Quote (GHS)</label><input type="number" value={f.quote} onChange={e => setF({ ...f, quote: e.target.value })} /></div>
          <div><label>Technician</label>
            <select value={f.technician} onChange={e => setF({ ...f, technician: e.target.value })}>
              <option value="">—</option>
              {TECHS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <label>Tech note (customer sees this)</label>
        <textarea rows={2} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />

        {job.id && (
          <div className="rowBetween" style={{ marginTop: 14 }}>
            <label style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', fontSize: '.85rem' }}>
              <input type="checkbox" checked={f.paid} onChange={async e => { setF({ ...f, paid: e.target.checked }); await act('jobUpdate', { id: job.id, paid: e.target.checked }); }} style={{ width: 'auto' }} />
              Paid
            </label>
            <button className="btn sm bad" onClick={async () => { if (confirm('Delete this job?')) { await act('jobDelete', { id: job.id }); onClose(); } }}>Delete job</button>
          </div>
        )}

        <button className="btn gold" style={{ width: '100%', marginTop: 16, padding: 14 }} disabled={busy} onClick={save}>
          {busy ? 'Saving…' : job.id ? 'Save changes' : 'Create job & get code'}
        </button>
        {job.id && <div className="mut center" style={{ fontSize: '.74rem', marginTop: 10 }}>Customer tracks with code <b style={{ color: 'var(--gold2)' }}>{job.code}</b></div>}
      </div>
    </div>
  );
}

function PhoneModal({ item, onClose, act }) {
  const [f, setF] = useState({
    id: item.id, brand: item.brand || '', model: item.model || '', storage: item.storage || '',
    condition: item.condition || 'New', price: item.price ?? '', stock: item.stock ?? 1,
    badge: item.badge || '', note: item.note || '',
  });
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modalCard">
        <div className="rowBetween"><h3 style={{ margin: 0 }}>{item.id ? 'Edit phone' : 'Add phone'}</h3><button className="btn sm" onClick={onClose}>✕</button></div>
        <label>Brand</label><input value={f.brand} onChange={e => setF({ ...f, brand: e.target.value })} />
        <label>Model</label><input value={f.model} onChange={e => setF({ ...f, model: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label>Storage</label><input value={f.storage} onChange={e => setF({ ...f, storage: e.target.value })} placeholder="128GB" /></div>
          <div><label>Condition</label>
            <select value={f.condition} onChange={e => setF({ ...f, condition: e.target.value })}>
              {['New', 'UK-used', 'Used'].map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div><label>Price (GHS)</label><input type="number" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
          <div><label>Stock</label><input type="number" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} /></div>
        </div>
        <label>Badge (optional)</label><input value={f.badge} onChange={e => setF({ ...f, badge: e.target.value })} placeholder="New arrival" />
        <label>Note</label><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Battery 89% · verified original" />
        <button className="btn gold" style={{ width: '100%', marginTop: 16, padding: 14 }} onClick={async () => { await act('phoneSave', f); onClose(); }}>Save</button>
      </div>
    </div>
  );
}

function WorkModal({ item, onClose, act }) {
  const [f, setF] = useState({ id: item.id, title: item.title || '', service: item.service || '', desc: item.desc || '', image_url: item.image_url || '🛠️' });
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modalCard">
        <div className="rowBetween"><h3 style={{ margin: 0 }}>{item.id ? 'Edit job' : 'Publish a job'}</h3><button className="btn sm" onClick={onClose}>✕</button></div>
        <label>Title</label><input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="iPhone 13 · Screen replaced" />
        <label>Service</label><input value={f.service} onChange={e => setF({ ...f, service: e.target.value })} />
        <label>Description</label><textarea rows={2} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} />
        <label>Photo or icon</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={f.image_url} onChange={e => setF({ ...f, image_url: e.target.value })} placeholder="Paste a photo link, or one emoji like 🖥️" />
          <label className="btn sm" style={{ whiteSpace: 'nowrap', cursor: 'pointer', margin: 0 }}>
            📷 Photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              try {
                const up = await uploadPhoto(file);
                setF(x => ({ ...x, image_url: up }));
              } catch (err) { alert('Upload failed: ' + err.message); }
            }} />
          </label>
        </div>
        {/^https?:/.test(f.image_url) && <img src={f.image_url} alt="" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 12, marginTop: 8 }} />}
        <div className="mut" style={{ fontSize: '.74rem' }}>Customers see this photo on the Our work section.</div>
        <button className="btn gold" style={{ width: '100%', marginTop: 16, padding: 14 }} onClick={async () => { await act('workSave', f); onClose(); }}>Save</button>
      </div>
    </div>
  );
}

function Settings({ d, adminKey, onSaved }) {
  const s = d.settings || {};
  const [f, setF] = useState({
    shop_name: s.shop_name || '', tagline: s.tagline || '', phone: s.phone || '',
    whatsapp: s.whatsapp || '', address: s.address || '', hours: s.hours || '',
    warranty: s.warranty || '', technicians: s.technicians || '',
    notice: s.notice || '', map_link: s.map_link || '', booking_open: s.booking_open || '1',
    owner_name: s.owner_name || '', owner_role: s.owner_role || 'Shop Owner',
    showcase_model: s.showcase_model || 'iPhone 13',
    showcase_service: s.showcase_service || 'screen',
    showcase_face: s.showcase_face || 'front',
  });
  const [msg, setMsg] = useState('');
  const save = async () => {
    for (const k of Object.keys(f)) await api.admin(adminKey, 'settingSave', { key: k, value: f[k] });
    setMsg('Saved ✓'); setTimeout(() => setMsg(''), 2000); onSaved();
  };
  return (
    <div className="panel" style={{ maxWidth: 560 }}>
      <h2 style={{ marginTop: 0 }}>Shop details</h2>
      <label>Shop name</label><input value={f.shop_name} onChange={e => setF({ ...f, shop_name: e.target.value })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label>Your name (shown at the top of the console)</label><input value={f.owner_name} onChange={e => setF({ ...f, owner_name: e.target.value })} placeholder="e.g. Sulley Alhassan" /></div>
        <div><label>Your title</label><input value={f.owner_role} onChange={e => setF({ ...f, owner_role: e.target.value })} placeholder="Shop Owner" /></div>
      </div>
      <label>Tagline</label><input value={f.tagline} onChange={e => setF({ ...f, tagline: e.target.value })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label>Phone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
        <div><label>WhatsApp</label><input value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} /></div>
      </div>
      <label>Address</label><input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
      <label>Opening hours</label><input value={f.hours} onChange={e => setF({ ...f, hours: e.target.value })} />
      <label>Warranty line</label><input value={f.warranty} onChange={e => setF({ ...f, warranty: e.target.value })} />
      <label>Google Maps link (for "Open in Maps")</label><input value={f.map_link} onChange={e => setF({ ...f, map_link: e.target.value })} placeholder="https://maps.app.goo.gl/..." />
      <label>Banner notice shown on the homepage (leave empty to hide)</label><textarea rows={2} value={f.notice} onChange={e => setF({ ...f, notice: e.target.value })} placeholder="e.g. We close at 4pm on Saturday" />
      <label>Online booking</label>
      <div className="segRow">
        <button className={'seg' + (f.booking_open === '1' ? ' on' : '')} onClick={() => setF({ ...f, booking_open: '1' })}>Open</button>
        <button className={'seg' + (f.booking_open !== '1' ? ' on' : '')} onClick={() => setF({ ...f, booking_open: '0' })}>Paused</button>
      </div>
      <label>Technicians (comma separated)</label><input value={f.technicians} onChange={e => setF({ ...f, technicians: e.target.value })} />
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 22, paddingTop: 18 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>Homepage phone</h3>
        <p className="mut" style={{ fontSize: '.8rem', margin: '0 0 6px', lineHeight: 1.5 }}>
          This is the phone customers see on your homepage. Only you can change it here.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label>Phone shown</label><input value={f.showcase_model} onChange={e => setF({ ...f, showcase_model: e.target.value })} placeholder="iPhone 13" /></div>
          <div><label>Repair shown</label><input value={f.showcase_service} onChange={e => setF({ ...f, showcase_service: e.target.value })} placeholder="screen" /></div>
        </div>
        <label>Which side customers see</label>
        <div className="segRow">
          <button className={'seg' + (f.showcase_face === 'front' ? ' on' : '')} onClick={() => setF({ ...f, showcase_face: 'front' })}>Front (screen)</button>
          <button className={'seg' + (f.showcase_face === 'back' ? ' on' : '')} onClick={() => setF({ ...f, showcase_face: 'back' })}>Back (cameras)</button>
        </div>
        <div className="miniStage">
          <Phone3D ticket={{ device: f.showcase_model, short: f.showcase_service }} face={f.showcase_face} />
        </div>
        <div className="mut" style={{ fontSize: '.74rem', marginTop: 8 }}>Live preview. Customers can spin it with their finger, but they cannot change which phone it is.</div>
      </div>

      <button className="btn gold" style={{ width: '100%', marginTop: 16, padding: 14 }} onClick={save}>Save settings</button>
      {msg && <div className="center" style={{ color: 'var(--ok)', marginTop: 10, fontSize: '.85rem' }}>{msg}</div>}
    </div>
  );
}


/* ================= Services editor ================= */
function ServicesTab({ d, adminKey, onSaved }) {
  const list = d.services && d.services.length ? d.services : [];
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState('');
  const save = async (item, original) => {
    await api.admin(adminKey, 'serviceSave', { ...item, original });
    setMsg('Saved ✓'); setTimeout(() => setMsg(''), 1800);
    setEdit(null); onSaved();
  };
  const del = async (name) => {
    if (!confirm('Remove "' + name + '" from the website?')) return;
    await api.admin(adminKey, 'serviceDelete', { name });
    onSaved();
  };
  return (
    <div className="panel">
      <div className="rowBetween">
        <h2 style={{ margin: 0 }}>Services &amp; prices</h2>
        <button className="btn gold" onClick={() => setEdit({ name: '', icon: '🛠️', price_from: 0, desc: '' })}>+ Add service</button>
      </div>
      <p className="mut" style={{ fontSize: '.82rem', marginTop: 6 }}>These are the tiles on the homepage. Change the name, icon, starting price and description. The website updates itself right away.</p>
      {msg && <div className="mut" style={{ color: '#34d399', fontWeight: 800 }}>{msg}</div>}
      <div className="grid g2" style={{ marginTop: 14 }}>
        {list.map(sv => (
          <div className="panel" key={sv.name} style={{ padding: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '1.6rem' }}>{sv.icon}</span>
              <div style={{ flex: 1 }}>
                <b style={{ display: 'block' }}>{sv.name}</b>
                <span className="mut" style={{ fontSize: '.76rem' }}>{sv.price_from > 0 ? 'from GH₵' + sv.price_from : 'No fixed price'}</span>
              </div>
            </div>
            <div className="mut" style={{ fontSize: '.76rem', marginTop: 8, lineHeight: 1.5 }}>{sv.desc}</div>
            <div className="ctaRow" style={{ marginTop: 10 }}>
              <button className="btn sm" onClick={() => setEdit(sv)}>Edit</button>
              <button className="btn sm bad" onClick={() => del(sv.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setEdit(null)}>
          <div className="modalCard">
            <div className="rowBetween"><h3 style={{ margin: 0 }}>{edit === null ? '' : (edit.original || list.some(x => x.name === edit.name) ? 'Edit service' : 'Add service')}</h3><button className="btn sm" onClick={() => setEdit(null)}>✕</button></div>
            <label>Name</label><input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} placeholder="Screen & display" />
            <label>Icon (one emoji)</label><input value={edit.icon} maxLength={4} onChange={e => setEdit({ ...edit, icon: e.target.value })} />
            <label>Starting price in cedis (0 = ask in shop)</label><input inputMode="numeric" value={edit.price_from} onChange={e => setEdit({ ...edit, price_from: e.target.value })} />
            <label>Description</label><textarea rows={3} value={edit.desc} onChange={e => setEdit({ ...edit, desc: e.target.value })} />
            <button className="btn gold" style={{ width: '100%', marginTop: 16, padding: 14 }} onClick={() => save(edit, edit.original)}>Save service</button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ================= close a day so nobody can book it ================= */
function DayCloser({ act, closedDays }) {
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const toggle = async (d) => {
    if (!d) return;
    setBusy(true);
    await act('dayToggle', { date: d });
    setBusy(false);
    setDate('');
  };
  return (
    <div className="panel" style={{ marginTop: 14, padding: 14 }}>
      <b style={{ fontSize: '.9rem' }}>Close a day (public holiday, travel, rest)</b>
      <div className="mut" style={{ fontSize: '.76rem', marginTop: 2 }}>A closed day never shows any time slot on the website, so nobody can book it.</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth: 200 }} />
        <button className="btn sm" disabled={!date || busy} onClick={() => toggle(date)}>{busy ? 'Saving…' : 'Close this day'}</button>
      </div>
      {closedDays.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="mut" style={{ fontSize: '.74rem', fontWeight: 800, marginBottom: 6 }}>Closed days</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {closedDays.map(d => (
              <button key={d} className="btn sm" onClick={() => toggle(d)}>{d} ✕ reopen</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

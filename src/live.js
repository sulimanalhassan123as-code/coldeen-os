/* live data hook: renders instantly, then refreshes itself the moment the owner saves a change */
import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

export function useLiveHome(interval = 12000) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [updated, setUpdated] = useState(0); // bumps on every successful change so the UI can flash
  const rev = useRef(null);
  const busy = useRef(false);

  const load = (silent) => {
    if (busy.current) return;
    busy.current = true;
    api.home()
      .then((d) => {
        const changed = rev.current !== null && d.rev !== rev.current;
        rev.current = d.rev;
        setData(d);
        cacheShop(d.settings || {});
        setErr('');
        if (changed && silent) setUpdated(Date.now());
      })
      .catch((e) => { if (!silent) setErr(e.message); })
      .finally(() => { busy.current = false; });
  };

  useEffect(() => {
    load(false);
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      load(true);
    };
    const t = setInterval(tick, interval);
    const onVis = () => { if (document.visibilityState === 'visible') load(true); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    window.addEventListener('online', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
      window.removeEventListener('online', onVis);
    };
  }, [interval]); // eslint-disable-line

  return { data, err, updated, reload: () => load(false) };
}

/* saves the customer's own tickets on this phone so they can never lose a code */
export function saveTicket(t) {
  try {
    const list = JSON.parse(localStorage.getItem('gp_tickets') || '[]');
    const next = [t, ...list.filter(x => x.code !== t.code)].slice(0, 6);
    localStorage.setItem('gp_tickets', JSON.stringify(next));
  } catch (_) { /* private mode */ }
}
export function myTickets() {
  try { return JSON.parse(localStorage.getItem('gp_tickets') || '[]'); } catch (_) { return []; }
}

/* dates that never go stale: recomputed on render, at midnight, and when the phone wakes */
export function useLiveDays(count = 7) {
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    const msToMidnight = () => {
      const n = new Date();
      const m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 30);
      return m - n;
    };
    let t = setTimeout(function tick() { setNonce(x => x + 1); t = setTimeout(tick, msToMidnight()); }, msToMidnight());
    const onVis = () => { if (document.visibilityState === 'visible') setNonce(x => x + 1); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearTimeout(t); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const out = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' }),
      day: d.getDate(),
      mon: d.toLocaleDateString('en-GB', { month: 'short' }),
      dow: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dateObj: d,
    });
  }
  return out; // eslint-disable-line
}

/* the month calendar, so any day next month is reachable instead of only this week */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ d, iso, dateObj: new Date(year, month, d) });
  }
  return cells;
}
export const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const prettyDay = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
};


/* one cached copy of the shop details, so no page has to hardcode a number or a name */
const SHOP_KEY = 'gp_shop_v1';
const readShop = () => { try { return JSON.parse(localStorage.getItem(SHOP_KEY) || 'null'); } catch (_) { return null; } };
export const cacheShop = (set) => {
  try {
    const keep = {
      name: set.shop_name || 'COLDEEN',
      wa: String(set.whatsapp || '233504052487').replace(/[^0-9]/g, ''),
      phone: set.phone || '0504052487',
      warranty: set.warranty || '3-month warranty after you collect',
      turnaround: set.turnaround || 'most repairs within 24 hours',
    };
    localStorage.setItem(SHOP_KEY, JSON.stringify(keep));
  } catch (_) { /* private mode */ }
};
export function useShop() {
  const fallback = { name: 'COLDEEN', wa: '233504052487', phone: '0504052487',
    warranty: '3-month warranty after you collect', turnaround: 'most repairs within 24 hours' };
  const [shop, setShop] = useState(() => readShop() || fallback);
  useEffect(() => {
    const cached = readShop();
    if (cached && cached.name) { setShop(cached); return; }
    api.home().then(d => { cacheShop(d.settings || {}); setShop(readShop() || fallback); }).catch(() => {});
  }, []); // eslint-disable-line
  return shop;
}

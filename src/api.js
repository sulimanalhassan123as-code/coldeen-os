const PUB = 'https://superagent-b0de149e.base44.app/functions/coldeenPublic';
const ADM = 'https://superagent-b0de149e.base44.app/functions/coldeenAdmin';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
/* retries network hiccups and slow cold starts so a customer never sees an empty page */
async function call(url, payload, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch(url, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload || {}), signal: ctl.signal });
      clearTimeout(to);
      const j = await r.json().catch(() => null);
      if (!j) throw new Error('Network problem. Check your connection.');
      if (!r.ok || j.ok === false) {
        const e = new Error(j.error || ('Error ' + r.status));
        e.final = r.status >= 400 && r.status < 500; // real answers (wrong code, slot full) are not retried
        throw e;
      }
      return j;
    } catch (e) {
      last = e;
      if (e.final) break;
      if (i < tries - 1) await sleep(900 * (i + 1));
    }
  }
  throw last && last.name === 'AbortError' ? new Error('The server is slow right now. Please try again.') : last;
}
export const api = {
  home: () => call(PUB, { action: 'home' }),
  rev: () => call(PUB, { action: 'rev' }),
  slots: (date) => call(PUB, { action: 'slots', data: { date } }),
  book: (data) => call(PUB, { action: 'book', data }),
  track: (code) => call(PUB, { action: 'track', data: { code } }),
  admin: (key, action, data) => call(ADM, { key, action, data }),
};
export const cedi = (n) => 'GH₵' + Number(n || 0).toLocaleString('en-GH');
export const STATUS_LABEL = { received: 'Received', diagnosing: 'Diagnosing', parts: 'Awaiting parts', repairing: 'Repairing', ready: 'Ready for pickup', collected: 'Collected', cancelled: 'Cancelled' };
export const STATUS_ORDER = ['received', 'diagnosing', 'parts', 'repairing', 'ready', 'collected'];

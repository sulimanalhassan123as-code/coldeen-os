import React, { useEffect, useState } from 'react';
import './soft.css';

export const THEMES = [
  { id: 'blue', label: 'Midnight', note: 'Soft light' },
  { id: 'emerald', label: 'Emerald', note: 'Deep green' },
  { id: 'violet', label: 'Violet', note: 'Deep purple' },
];

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const t = localStorage.getItem('col_theme');
    return THEMES.some(x => x.id === t) ? t : 'blue';
  });
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-theme', theme);
    localStorage.setItem('col_theme', theme);
    const bg = { blue: '#e4e9f2', emerald: '#0d1b16', violet: '#150f24' }[theme];
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
    document.body.style.background = bg;
  }, [theme]);
  return [theme, setTheme];
}

const WA_ICON = (
  <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>
);

const TABS = [
  { k: 'home', ico: '🏠', label: 'Home', href: '#/' },
  { k: 'book', ico: '📅', label: 'Book', href: '#/book' },
  { k: 'track', ico: '📦', label: 'Track', href: '#/track' },
  { k: 'work', ico: '📸', label: 'Our Work', href: '#/#work' },
  { k: 'contact', ico: '📞', label: 'Contact', href: '#/#contact' },
];

export default function Frame({ active = 'home', theme, setTheme, shopName = 'COLDEEN', wa = '233504052487', phone = '0504052487', children }) {
  const [sheet, setSheet] = useState(false);
  // keep the header readable on small phones: big wordmark = the first word when the name is long
  const words = String(shopName || 'Golden').trim().split(/\s+/);
  const wordmark = words.length > 2 ? words[0] : String(shopName || 'Golden');
  const strapline = words.length > 2 ? words.slice(1).join(' ') : 'Phone Repair & Mobile Shop';

  useEffect(() => {
    document.body.style.overflow = sheet ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheet]);
  useEffect(() => {
    const h = () => setSheet(false);
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const goTab = (e, t) => {
    // in-page anchors on the home screen
    if (t.k === 'work' || t.k === 'contact') {
      e.preventDefault();
      const id = t.k === 'work' ? 'work' : 'contact';
      const scroll = () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      if ((window.location.hash || '#/') !== '#/') { window.location.hash = '#/'; setTimeout(scroll, 450); } else scroll();
    }
  };

  return (
    <div className="soft">
      <div className="s-wrap">
        <header className="s-head neu-flat">
          <a className="s-brand" href="#/">
            <img src="/img/logo-icon.png" alt="" />
            <div>
              <b>{wordmark}<em>.</em></b>
              <small>{strapline}</small>
            </div>
          </a>
          <div className="s-hbtns">
            <button className="s-ic neu-btn" aria-label="Colours" onClick={() => setSheet(true)}>🎨</button>
            <a className="s-ic neu-btn" aria-label="Call" href={'tel:' + phone}>📞</a>
          </div>
        </header>

        {children}
      </div>

      <a className="s-wa" href={'https://wa.me/' + wa} target="_blank" rel="noreferrer" aria-label="WhatsApp">{WA_ICON}</a>

      <nav className="s-tabs neu-flat">
        {TABS.map(t => (
          <a key={t.k} className={'s-tab' + (active === t.k ? ' on' : '')} href={t.href} onClick={(e) => goTab(e, t)}>
            <span className="ti">{t.ico}</span>{t.label}
          </a>
        ))}
      </nav>

      <div className={'s-sheet' + (sheet ? ' on' : '')} onClick={() => setSheet(false)}>
        <div className="s-sheetIn neu-flat" onClick={(e) => e.stopPropagation()}>
          <h3>Choose your colour</h3>
          <p>The whole app changes instantly and remembers your choice.</p>
          <div className="s-opts">
            {THEMES.map(t => (
              <button key={t.id} className={'s-opt neu-btn' + (theme === t.id ? ' on' : '')} onClick={() => { setTheme(t.id); setSheet(false); }}>
                <span className={'dot d-' + t.id} />
                {t.label}
                <small style={{ fontSize: '.62rem', opacity: .7, fontWeight: 700 }}>{t.note}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const THEMES = [
  { id: 'blue', label: 'Midnight' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'violet', label: 'Violet' },
];

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('col_theme') || 'blue');
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'blue') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', theme);
    localStorage.setItem('col_theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'emerald' ? '#04100c' : theme === 'violet' ? '#0a0612' : '#05070f');
  }, [theme]);
  return [theme, setTheme];
}

const LINKS = [
  { href: '#/', icon: '🏠', label: 'Homepage', sub: 'Start here' },
  { href: '#services', icon: '🛠', label: 'Repairs', sub: 'What we fix' },
  { href: '#devices', icon: '📱', label: 'Devices for sale', sub: 'In stock' },
  { href: '#/track', icon: '📦', label: 'Track my repair', sub: 'By ticket code' },
  { href: '#work', icon: '📸', label: 'Our work', sub: 'Real jobs' },
  { href: '#/book', icon: '📅', label: 'Book a repair', sub: 'Pick a slot' },
];

export default function Burger({ theme, setTheme, wa, shopName }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  useEffect(() => {
    const onHash = () => setOpen(false);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <>
      <div className="burgerWrap">
        <a className="btn gold sm hideSm" href="#/book">Book a repair</a>
        <button className={'burger' + (open ? ' on' : '')} onClick={() => setOpen(o => !o)}
          aria-label="Menu" aria-expanded={open}>
          <i /><i /><i />
        </button>
      </div>

      {createPortal(
        <>
        <div className={'mask' + (open ? ' on' : '')} onClick={close} />

        <aside className={'drawer' + (open ? ' on' : '')} aria-hidden={!open}>
          <div className="drawerTop">
            <a className="drawerBrand" href="#/" onClick={close}>
              <img src="/img/logo-icon.png" alt="" />
              {shopName || 'COLDEEN'}
            </a>
            <button className="drawerClose" onClick={close} aria-label="Close">✕</button>
          </div>

          <div className="drawerSec">Menu</div>
          <nav className="drawerNav">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={close}>
                <span className="i">{l.icon}</span>
                {l.label}
                <small>{l.sub}</small>
              </a>
            ))}
          </nav>

          <div className="drawerSec">Colour</div>
          <div className="swRow">
            {THEMES.map((t) => (
              <button key={t.id} className={'sw sw-' + t.id + (theme === t.id ? ' on' : '')}
                onClick={() => setTheme(t.id)}>
                <b />
                {t.label}
              </button>
            ))}
          </div>

          <div className="drawerFoot">
            {wa && <a className="btn gold" href={'https://wa.me/' + wa} target="_blank" rel="noreferrer">💬 Chat on WhatsApp</a>}
            <a className="btn" href="#/portal" onClick={close}>Owner console</a>
          </div>
        </aside>
        </>,
        document.body
      )}
    </>
  );
}

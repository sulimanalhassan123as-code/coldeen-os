import React, { useEffect, useState } from 'react';
import Site from './Site.jsx';
import Book from './Book.jsx';
import Track from './Track.jsx';
import Console from './Console.jsx';
import Guide from './Guide.jsx';
import { useTheme } from './Frame.jsx';

function parse() {
  const h = window.location.hash || '#/';
  const [path, qs] = h.split('?');
  const q = new URLSearchParams(qs || '');
  return { path, q };
}

export default function App() {
  const [route, setRoute] = useState(parse());
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  // the owner console keeps its own dark workshop look
  const isPortal = route.path.startsWith('#/portal');
  useEffect(() => { document.documentElement.classList.toggle('portalMode', isPortal); }, [isPortal]);

  if (isPortal) return <Console />;
  if (route.path.startsWith('#/guide')) return <Guide theme={theme} setTheme={setTheme} />;
  if (route.path.startsWith('#/book')) return <Book theme={theme} setTheme={setTheme} />;
  if (route.path.startsWith('#/track')) return <Track initialCode={route.q.get('code') || ''} theme={theme} setTheme={setTheme} />;
  return <Site theme={theme} setTheme={setTheme} />;
}

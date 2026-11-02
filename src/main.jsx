import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
createRoot(document.getElementById('root')).render(<App />);

/* installable app: the service worker is what lets Android/iOS keep COLDEEN on the home screen */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => { reg.update().catch(() => {}); })
      .catch(() => { /* older phone browsers simply skip it */ });
  });
}

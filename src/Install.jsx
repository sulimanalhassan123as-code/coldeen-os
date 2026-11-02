import React, { useEffect, useState } from 'react';

/* ============================================================
   The install helper. Most people who "cannot install" the app are
   actually inside Telegram or WhatsApp, where install is blocked.
   So this detects the exact phone and speaks plainly.
   ============================================================ */

export function detect() {
  const ua = navigator.userAgent || '';
  const standalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    navigator.standalone === true;
  const inApp = /Telegram|WhatsApp|FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|Twitter|GSA\//i.test(ua);
  const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const iosChrome = /CriOS/.test(ua);
  const iosFirefox = /FxiOS/.test(ua);
  const android = /Android/.test(ua);
  const inName = /Telegram/i.test(ua) ? 'Telegram'
    : /WhatsApp/i.test(ua) ? 'WhatsApp'
    : /FBAN|FBAV|FB_IAB/i.test(ua) ? 'Facebook'
    : /Instagram/i.test(ua) ? 'Instagram'
    : /Line\//i.test(ua) ? 'LINE'
    : /Snapchat/i.test(ua) ? 'Snapchat'
    : /Twitter/i.test(ua) ? 'X (Twitter)'
    : 'this app';
  return { ua, standalone, inApp, inName, ios, iosChrome, iosFirefox, android };
}

const LINK = 'https://coldeen-os.vercel.app';

function Row({ ico, title, text }) {
  return (
    <div className="in-row">
      <span className="in-ico">{ico}</span>
      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}

export default function InstallSheet({ open, onClose }) {
  const [evt, setEvt] = useState(null);
  const [d, setD] = useState(() => detect());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  useEffect(() => { if (open) { setD(detect()); setCopied(false); } }, [open]);
  useEffect(() => {
    const on = () => { if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) setD(detect()); };
    window.addEventListener('appinstalled', on);
    return () => window.removeEventListener('appinstalled', on);
  }, []);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINK);
      setCopied(true);
    } catch (_) {
      const t = document.createElement('textarea');
      t.value = LINK; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); setCopied(true); } catch (e) { /* ignore */ }
      document.body.removeChild(t);
    }
  };

  const doInstall = async () => {
    if (evt && evt.prompt) {
      evt.prompt();
      try { await evt.userChoice; } catch (_) { /* ignore */ }
      setEvt(null);
    }
  };

  let title = '📲 Put COLDEEN on your phone';
  let lead = 'Takes about 15 seconds. No Play Store, no download size, no update screens.';

  if (d.standalone) {
    title = '✅ It is already installed';
    lead = 'COLDEEN is on this phone already. Look for the COLDEEN icon on your home screen or in your apps list — it opens full screen, like WhatsApp.';
  } else if (d.inApp) {
    title = '⚠️ You are inside ' + d.inName;
    lead = 'Telegram, WhatsApp and Facebook open links in their own mini browser. That mini browser cannot add apps to your phone — that is why nothing happened. Open the link in Chrome (Android) or Safari (iPhone) first, then install.';
  }

  return (
    <div className="in-wrap" onClick={onClose}>
      <div className="in-sheet neu-flat" onClick={(e) => e.stopPropagation()}>
        <button className="in-x" onClick={onClose} aria-label="Close">✕</button>
        <h3>{title}</h3>
        <p className="in-lead">{lead}</p>

        {d.standalone && (
          <div className="in-rows">
            <Row ico="🏠" title="On your home screen" text="The COLDEEN icon sits with your other apps. Drag it anywhere you like." />
            <Row ico="🚀" title="Why it is better" text="Opens full screen with no address bar, and the pages you already opened load instantly." />
            <Row ico="🔄" title="Updates itself" text="You never reinstall. Whatever the shop changes appears the next time you open it." />
          </div>
        )}

        {!d.standalone && d.inApp && (
          <>
            <div className="in-rows">
              <Row ico="1️⃣" title={d.android ? 'Tap ⋮ at the top right' : 'Tap the Share box'} text={d.android
                ? 'In this mini browser, open the ⋮ menu and choose “Open in browser” or “Open in Chrome”.'
                : 'Choose “Open in Safari”, then carry on with the steps below.'} />
              <Row ico="2️⃣" title="Install it there" text="Once the page is in Chrome or Safari, come back to this button and it will walk you through it." />
            </div>
            <div className="in-btns">
              {d.android && (
                <a className="btn gold" href={'intent://coldeen-os.vercel.app/#Intent;scheme=https;package=com.android.chrome;end'}>
                  🌐 Open in Chrome
                </a>
              )}
              <button className="btn outl" onClick={copy}>{copied ? '✅ Link copied' : '📋 Copy the link'}</button>
            </div>
            <p className="in-fine">Copy the link, then paste it into Chrome or Safari yourself. That always works.</p>
          </>
        )}

        {!d.standalone && !d.inApp && d.android && (
          <>
            {evt && (
              <button className="btn gold in-big" onClick={doInstall}>📲 Install COLDEEN now</button>
            )}
            <div className="in-rows">
              <Row ico="1️⃣" title="Open the Chrome menu" text="Tap the ⋮ three dots at the top right of Chrome." />
              <Row ico="2️⃣" title="Tap “Install app”" text="Some phones call it “Add to Home screen”. Both are fine." />
              <Row ico="3️⃣" title="Tap Install" text="A COLDEEN icon appears with your other apps. Done." />
            </div>
            <p className="in-fine">If Chrome does not offer it, tap 📋 Copy the link below and open it in Chrome yourself.</p>
            <div className="in-btns"><button className="btn outl" onClick={copy}>{copied ? '✅ Copied' : '📋 Copy the link'}</button></div>
          </>
        )}

        {!d.standalone && !d.inApp && d.ios && (
          <>
            <div className="in-rows">
              <Row ico="1️⃣" title="Use Safari, not Chrome" text={d.iosChrome || d.iosFirefox
                ? 'On iPhone, only Safari can add an app to the home screen. Copy the link and open it in Safari.'
                : 'You are in Safari already, so go straight to step 2.'} />
              <Row ico="2️⃣" title="Tap the Share button" text="The square with an arrow pointing up, at the bottom of the screen." />
              <Row ico="3️⃣" title="Scroll and tap “Add to Home Screen”" text="Then tap Add at the top right. The COLDEEN icon appears on your home screen." />
            </div>
            {(d.iosChrome || d.iosFirefox) && (
              <div className="in-btns"><button className="btn outl" onClick={copy}>{copied ? '✅ Copied' : '📋 Copy the link'}</button></div>
            )}
          </>
        )}

        {!d.standalone && !d.inApp && !d.android && !d.ios && (
          <>
            <div className="in-rows">
              <Row ico="💻" title="On a computer" text="Look at the right end of the address bar for a small install icon (a screen with an arrow, or a ⊕). Click it, then Install." />
              <Row ico="🍎" title="On a Mac" text="Safari: File → “Add to Dock”. Chrome: same icon in the address bar." />
              <Row ico="📱" title="Want it on your phone instead?" text="Open this same link on your phone and use the button there." />
            </div>
            <div className="in-btns"><button className="btn outl" onClick={copy}>{copied ? '✅ Copied' : '📋 Copy the link'}</button></div>
          </>
        )}

        <div className="in-foot">
          <a className="btn outl" href="#/guide" onClick={onClose}>📖 Read the full guide</a>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Frame from './Frame.jsx';

/* ============================================================
   HOW TO USE — a plain-language walkthrough for customers
   and for the shop owner. Nothing here touches the shop data.
   ============================================================ */

const CUSTOMER_STEPS = [
  {
    ico: '📲',
    t: 'Step 1 · Put it on your phone like a real app',
    s: 'You do not need Play Store. It installs from the page itself, in about 15 seconds.',
    rows: [
      ['🤖', 'Android (Chrome)', 'Tap the ⋮ three dots at the top right → “Install app” or “Add to Home screen” → Install.'],
      ['🍎', 'iPhone (Safari)', 'Tap the Share button (square with an arrow) → scroll → “Add to Home Screen” → Add.'],
      ['💻', 'Computer', 'Nothing to install. The link works in any browser.'],
    ],
    after: 'A COLDEEN icon appears with your other apps. Open it like WhatsApp. No typing the link again, no browser bar.',
    warn: 'If you opened this link from Telegram, WhatsApp or Facebook, install will not show up — those mini browsers block it. Tap ⋮ → “Open in browser” first, then come back here.',
  },
  {
    ico: '🛠️',
    t: 'Step 2 · Choose what needs fixing',
    s: 'Tap 📅 Book at the bottom. Then tap the picture card that matches your problem.',
    rows: [
      ['🖥️', 'Screen & display', 'Cracked glass, lines, black screen, touch not working.'],
      ['🔋', 'Battery replacement', 'Phone dies fast, switches off, battery swells.'],
      ['🔌', 'Charging & ports', 'Only charges when the cable is bent, loose charging.'],
      ['💧', 'Water damage', 'Fell in water, was rained on, dropped in a drink.'],
      ['🧠', 'Software & firmware', 'Stuck on a logo, locked, slow, apps crashing.'],
      ['🔍', 'Not sure', 'Tap this one and the technician checks it for you.'],
    ],
    after: 'Not sure which one? Tap 🔍 Not sure, check it for me. Nobody will laugh at you for asking.',
  },
  {
    ico: '🗓️',
    t: 'Step 3 · Pick a day and a time',
    s: 'The next 8 days are shown. Tap the day, then tap the hour you can come.',
    rows: [
      ['🕘', 'The shop is open', 'Monday to Saturday, 9:00am to 7:00pm.'],
      ['⏰', 'Two phones per hour', 'That is why you do not sit and wait all day.'],
      ['🚫', 'If a day shows no times', 'The shop is closed that day. Try another day.'],
    ],
    after: 'The number next to each hour is how many places are still free. If it is full, choose another hour.',
  },
  {
    ico: '✍️',
    t: 'Step 4 · Type your details',
    s: 'Four short boxes. This is the only typing you do.',
    rows: [
      ['🙍', 'Your name', 'Any name the technician can call out.'],
      ['📞', 'Phone number', 'So the shop can call you when it is ready.'],
      ['📱', 'Which phone', 'Example: iPhone 11, Tecno Camon 20. It helps them prepare the part.'],
      ['📝', 'What is wrong', 'Optional. One line, example: “screen cracked at the corner”.'],
    ],
    after: 'Then tap ✅ Confirm booking. That is it. It takes under a minute.',
  },
  {
    ico: '🎫',
    t: 'Step 5 · Keep your ticket code',
    s: 'A code like COL-4831 appears the moment you confirm. That code is your receipt and your tracker.',
    rows: [
      ['📸', 'Save it', 'Screenshot the screen. Or tap the green WhatsApp button in the app and we keep it for you too.'],
      ['🔢', 'Short form works', 'You can type only the numbers (4831) instead of the full code.'],
      ['🙅', 'Lost it?', 'Message the shop on WhatsApp with your name and phone number. They will find your repair.'],
    ],
    after: 'The shop also opens the repair ticket for you straight away, so your repair already shows as “Received”.',
  },
  {
    ico: '📦',
    t: 'Step 6 · Follow the repair from your phone',
    s: 'Tap 📦 Track at the bottom, type your code, and the page shows exactly where your phone is.',
    rows: [
      ['✅', 'Received', 'The shop has your phone.'],
      ['🔍', 'Diagnosing', 'The technician is testing it and preparing the price.'],
      ['📦', 'Awaiting part', 'The correct part has been ordered.'],
      ['🔧', 'Repairing', 'Work is happening right now.'],
      ['🎉', 'Ready', 'Come and collect it.'],
      ['🏁', 'Collected', 'Done and in your hand.'],
    ],
    after: 'You also see the price and the technician’s note, example: “Screen fitted, running the final test.” You do not have to call and ask “how far?”.',
  },
  {
    ico: '💵',
    t: 'Step 7 · Pay when you collect',
    s: 'No money before the work. You pay when the phone is in your hand.',
    rows: [
      ['🧾', 'Receipt', 'Sent to you on WhatsApp.'],
      ['🛡️', 'Warranty', '3-month warranty after you collect. Keep your code for that.'],
      ['💬', 'Any question', 'Tap the green WhatsApp button any time. It is the fastest way.'],
    ],
  },
];

const OWNER_STEPS = [
  {
    ico: '🔐',
    t: 'Step 1 · Open the console and log in',
    s: 'The console is the private control room. Customers never see it.',
    rows: [
      ['🔗', 'Address', 'coldeen-os.vercel.app/#/portal — save it as a bookmark or home-screen icon on your phone.'],
      ['⌨️', 'Your code', 'Type the access code once. The phone remembers you, so next time it opens straight in.'],
      ['🔒', 'Lock button', 'Bottom left of the sidebar. Always lock it before you keep the phone down.'],
      ['⚠️', 'Keep the code private', 'Anybody with the code can change prices and stock. Never send it in a group chat.'],
    ],
  },
  {
    ico: '📊',
    t: 'Step 2 · Read the dashboard (your shop today)',
    s: 'This is the first screen after login. Five numbers, all live, nothing typed by hand.',
    rows: [
      ['💰', 'Revenue today', 'Money marked as paid today. Under it: how much is still in the works.'],
      ['🔧', 'Jobs in progress', 'Phones in the shop that are not collected yet.'],
      ['📦', 'Ready for pickup', 'Finished phones waiting for their owners.'],
      ['📅', 'Appointments today', 'Customers who booked online for today.'],
      ['🗂️', 'Jobs board', 'One column per stage. Every card is a real phone.'],
    ],
    after: 'Everything refreshes by itself. You do not need to reload the page to see a new booking.',
  },
  {
    ico: '➕',
    t: 'Step 3 · A phone walks in — open a job',
    s: 'Tap “+ New job” at the top right. Four boxes, then save.',
    rows: [
      ['🙍', 'Customer name', 'The name you will call out.'],
      ['📱', 'Device', 'iPhone 13, Samsung A54, Tecno Camon 20 …'],
      ['🧰', 'Service', 'Pick from your own service list.'],
      ['💵', 'Quote', 'The price you told the customer. Leave 0 if you have not agreed a price yet.'],
    ],
    after: 'A ticket code is created automatically. Write it on the phone’s bag or send it to the customer. If they booked online, the job is already there and the code already exists.',
  },
  {
    ico: '🔄',
    t: 'Step 4 · Move the job as work happens',
    s: 'Tap any card on the board. Change the stage, the technician, the price, or add a short note.',
    rows: [
      ['✅', 'Received', 'The phone is with you.'],
      ['🔍', 'Diagnosing', 'You are checking it.'],
      ['📦', 'Awaiting parts', 'You are waiting for a part.'],
      ['🔧', 'Repairing', 'Work in progress.'],
      ['🎉', 'Ready for pickup', 'Call or WhatsApp the customer.'],
      ['🏁', 'Collected', 'Phone handed over.'],
    ],
    after: 'The moment you change the stage, the customer’s tracking page changes too. They stop calling to ask “how far?”. Tick “Paid” when you collect the money — that is what feeds Revenue today.',
  },
  {
    ico: '📅',
    t: 'Step 5 · Bookings and closing a day',
    s: 'The Bookings tab lists everyone who booked from the website, with their phone number.',
    rows: [
      ['✅', 'Done', 'They came. The slot is closed.'],
      ['❌', 'Cancel', 'They did not come, or the booking is not real.'],
      ['🚫', 'Close a day', 'Holiday, travel, rest. Pick the date and close it — the website then shows no times for that day at all.'],
      ['↩️', 'Reopen', 'Closed days appear as chips below. Tap one to reopen it.'],
    ],
    after: 'Closing a day is safer than leaving it open and turning people away at the door.',
  },
  {
    ico: '📱',
    t: 'Step 6 · Inventory (phones for sale)',
    s: 'The Inventory tab is the “In stock today” section on the website.',
    rows: [
      ['➕', 'Add a phone', 'Brand, model, storage, condition, price, stock, badge.'],
      ['🏷️', 'Badge', 'Optional label like “New” or “Best value” on the card.'],
      ['🔢', 'Stock', 'Set it to 0 the moment you sell the last one. It disappears from the site.'],
    ],
  },
  {
    ico: '🧰',
    t: 'Step 7 · Services and prices',
    s: 'The Services tab controls the cards customers tap when they book.',
    rows: [
      ['✏️', 'Edit anything', 'Name, icon, “from” price, and the description.'],
      ['⚡', 'Instant', 'Save and the website shows the new price immediately.'],
      ['🧭', 'Keep descriptions honest', 'Say what is included. That reduces arguments at collection.'],
    ],
  },
  {
    ico: '📸',
    t: 'Step 8 · Our work (proof photos)',
    s: 'Real repair photos sell more than any sentence. The Our work tab feeds that section.',
    rows: [
      ['🖼️', 'Add an entry', 'Title like “iPhone 13 · Screen replaced”, the service, a short description and a photo link.'],
      ['🔗', 'Photo link', 'Paste a public image link (for example from your WhatsApp-saved photos uploaded to the web).'],
      ['🧾', 'Keep it current', 'Two or three new photos a week is enough.'],
    ],
  },
  {
    ico: '⚙️',
    t: 'Step 9 · Settings (the shop’s identity)',
    s: 'Everything written on the website comes from this one tab. Change it here, not in the code.',
    rows: [
      ['🏪', 'Shop name, tagline', 'The big words at the top of the site.'],
      ['🙍', 'Your name and title', 'Shown on the dashboard: “Good morning, Sulley”.'],
      ['📞', 'Phone and WhatsApp', 'Every call button and every WhatsApp button uses these numbers.'],
      ['📍', 'Address, hours, map link', 'The Find us block.'],
      ['🛡️', 'Warranty line', 'Shown in the ticker and the Why section.'],
      ['📢', 'Notice banner', 'Type a message (example: “Closed Saturday”) and it appears on the site. Empty it to hide.'],
      ['🚦', 'Booking on / off', 'Switch booking off when you are too full.'],
      ['📲', 'Homepage phone', 'Which phone and which repair shows on the 3D phone on the homepage.'],
    ],
  },
  {
    ico: '🌙',
    t: 'Step 10 · Your daily routine (copy this)',
    s: 'Five minutes in the morning, two minutes per phone, one minute at night.',
    rows: [
      ['🌅', 'Morning', 'Open the console → check Appointments today → check Ready for pickup → message those customers.'],
      ['☀️', 'During the day', 'Every phone you touch, move its card to the true stage. Tick Paid when money enters.'],
      ['🌙', 'Evening', 'Mark collected phones as Collected. Close tomorrow if you are not opening. Lock the console.'],
    ],
    after: 'The rule of thumb: if it is not on the board, it did not happen. The board is the shop’s memory.',
  },
];

const FAQS = [
  ['😵', '“The site is showing old information.”', 'Pull the page down to refresh, or close and reopen the installed app. Changes you make in the console reach the site within about 12 seconds.'],
  ['🎫', '“I lost my ticket code.”', 'Open Track and the code is remembered on that phone. If not, WhatsApp the shop with your name and number.'],
  ['🚫', '“It says that time is full.”', 'Two phones per hour is the limit. Pick the next hour.'],
  ['📵', '“No times show for a day.”', 'The shop closed that day from the console. Choose another day.'],
  ['🔐', '“I forgot the console code.”', 'The owner can reset it. Never share the code with staff who have left.'],
  ['🧾', '“A customer says the price is different.”', 'Update the job’s quote in the console so the tracking page matches what you agreed.'],
];

function Mock({ title, lines, accent }) {
  return (
    <div className="gd-mock">
      <div className="gd-mockBar"><span /><span /><span /><b>{title}</b></div>
      <div className="gd-mockBody">
        {lines.map((l, i) => (
          <div key={i} className={'gd-mockRow' + (accent && i === 0 ? ' hot' : '')}>
            <i>{l[0]}</i><span>{l[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step({ n, step }) {
  return (
    <article className="gd-step neu-flat">
      <div className="gd-stepHead">
        <div className="gd-num">{n}</div>
        <div>
          <h3>{step.ico} {step.t.replace(/^Step \d+ · /, '')}</h3>
          <p className="gd-sub">{step.s}</p>
        </div>
      </div>
      <div className="gd-rows">
        {step.rows.map((r, i) => (
          <div key={i} className="gd-row">
            <span className="gd-rowIco">{r[0]}</span>
            <b>{r[1]}</b>
            <span>{r[2]}</span>
          </div>
        ))}
      </div>
      {step.warn && <div className="gd-warn">⚠️ {step.warn}</div>}
      {step.after && <div className="gd-after">💡 {step.after}</div>}
    </article>
  );
}

export default function Guide({ theme, setTheme }) {
  const [who, setWho] = useState('customer');

  const list = who === 'customer' ? CUSTOMER_STEPS : OWNER_STEPS;

  return (
    <Frame active="guide" theme={theme} setTheme={setTheme} shopName="COLDEEN">
      <div className="gd">
        <header className="gd-hero neu-flat gd-noprint">
          <div className="gd-badge">📖 GUIDE</div>
          <h1>How to use COLDEEN</h1>
          <p className="gd-lead">
            Two guides on one page. One for your <b>customers</b>, one for <b>you the owner</b>.
            Everything here works from an ordinary phone, no computer needed.
          </p>
          <div className="gd-switch">
            <button className={'gd-tab' + (who === 'customer' ? ' on' : '')} onClick={() => setWho('customer')}>🛍️ Customer guide</button>
            <button className={'gd-tab' + (who === 'owner' ? ' on' : '')} onClick={() => setWho('owner')}>🔧 Owner guide</button>
            <button className="gd-tab gd-print" onClick={() => window.print()}>🖨️ Print / save PDF</button>
          </div>
        </header>

        {who === 'customer' ? (
          <section>
            <div className="gd-intro neu-flat">
              <h2>🛍️ For customers: from “my phone is broken” to “collected”</h2>
              <p className="gd-sub">
                Book in under a minute, get a ticket code, and follow your repair live instead of calling the shop.
              </p>
              <Mock
                title="What the customer sees"
                accent
                lines={[
                  ['📲', 'COLDEEN on the home screen'],
                  ['🛠️', 'Tap what needs fixing'],
                  ['🗓️', 'Pick a day and a time'],
                  ['🎫', 'Get code COL-4831'],
                  ['📦', 'Follow it live'],
                ]}
              />
            </div>

            {CUSTOMER_STEPS.map((s, i) => <Step key={i} n={i + 1} step={s} />)}

            <div className="gd-card neu-flat">
              <h3>🎨 Two small things worth knowing</h3>
              <div className="gd-rows">
                <div className="gd-row"><span className="gd-rowIco">🎨</span><b>Colours</b><span>Tap the 🎨 button at the top right to switch between Midnight, Emerald and Violet. Your choice is remembered.</span></div>
                <div className="gd-row"><span className="gd-rowIco">💬</span><b>WhatsApp button</b><span>The green round button follows you on every page. One tap and you are chatting with the shop.</span></div>
              </div>
            </div>
          </section>
        ) : (
          <section>
            <div className="gd-intro neu-flat">
              <h2>🔧 For the owner: your shop, controlled from one screen</h2>
              <p className="gd-sub">
                Ten steps, in the order you will actually use them. Nothing here needs a developer again.
              </p>
              <Mock
                title="What you see after login"
                accent
                lines={[
                  ['💰', 'Revenue today'],
                  ['🔧', 'Jobs in progress'],
                  ['📦', 'Ready for pickup'],
                  ['📅', 'Appointments today'],
                  ['🗂️', 'Jobs board'],
                ]}
              />
            </div>

            {OWNER_STEPS.map((s, i) => <Step key={i} n={i + 1} step={s} />)}

            <div className="gd-card neu-flat">
              <h3>⚡ The 60-second version</h3>
              <p className="gd-sub">If you forget everything else, remember these four lines.</p>
              <div className="gd-rows">
                <div className="gd-row"><span className="gd-rowIco">1️⃣</span><b>Log in</b><span>#/portal → your code → Dashboard.</span></div>
                <div className="gd-row"><span className="gd-rowIco">2️⃣</span><b>Open a job</b><span>“+ New job” for every phone, and give the code to the customer.</span></div>
                <div className="gd-row"><span className="gd-rowIco">3️⃣</span><b>Move it</b><span>Tap the card, change the stage, tick Paid when money enters.</span></div>
                <div className="gd-row"><span className="gd-rowIco">4️⃣</span><b>Lock it</b><span>Lock the console before you drop the phone.</span></div>
              </div>
            </div>
          </section>
        )}

        <div className="gd-card neu-flat">
          <h3>❓ When something looks wrong</h3>
          <div className="gd-rows">
            {FAQS.map((f, i) => (
              <div key={i} className="gd-row"><span className="gd-rowIco">{f[0]}</span><b>{f[1]}</b><span>{f[2]}</span></div>
            ))}
          </div>
        </div>

        <div className="gd-cta neu-flat gd-noprint">
          <h3>👀 See it working right now</h3>
          <p className="gd-sub">Try the real thing, do not just read about it.</p>
          <div className="gd-ctaBtns">
            <a className="btn gold" href="#/book">📅 Try booking</a>
            <a className="btn outl" href="#/track?code=COL-4821">📦 Track a sample ticket</a>
            <a className="btn outl" href="#/portal">🔐 Owner console</a>
          </div>
          <p className="gd-fine">Sample ticket COL-4821 belongs to a demo repair, so it is safe to open and look at.</p>
        </div>

        <div className="gd-sign">COLDEEN · PHONE REPAIR &amp; MOBILE SHOP · ACCRA</div>
      </div>
    </Frame>
  );
}

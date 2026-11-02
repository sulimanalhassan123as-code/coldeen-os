# COLDEEN — Phone Repair & Mobile Shop

Live site: https://coldeen-os.vercel.app
Owner console: https://coldeen-os.vercel.app/#/portal (code: coldeen2026)

## Where to change things (the easy map)

| What you want to change | Open this file | Look for |
|---|---|---|
| Shop name in the header | `src/Frame.jsx` | `shopName = 'COLDEEN'` |
| The small line under the name | `src/Frame.jsx` | `strapline` / `Phone Repair & Mobile Shop` |
| Homepage wording (hero, why us, how it works) | `src/Site.jsx` | the text inside each `<section>` |
| Booking page wording + service list | `src/Book.jsx` | `const SERVICES = [...]` |
| Track page steps | `src/Track.jsx` | `const STEPS = [...]` |
| Colours / themes | `src/soft.css` | `html[data-theme="blue"]`, `emerald`, `violet` |
| Animations | `src/soft.css` | the block marked `ANIMATION LAYER` |
| Phone number / WhatsApp fallback | `src/Frame.jsx` + `src/Site.jsx` | `233504052487`, `0504052487` |
| Backend (data + admin actions) | `functions/coldeenPublic.ts`, `functions/coldeenAdmin.ts` | — |

**Most day to day things do NOT need code.** Open the console at `#/portal` and use:
- **Services** — edit service names, icons, starting prices, descriptions, add or delete
- **Inventory** — add / edit / delete phones with price and stock
- **Our work** — publish a repaired job with a real photo or an emoji
- **Settings** — shop name, tagline, phone, WhatsApp, address, hours, warranty, technicians,
  Maps link, homepage banner notice, and an Open/Paused switch for online booking
- **Jobs** — create tickets, change status, set the quote, mark paid
- **Bookings** — see appointments, mark done, cancel

Everything saved in the console appears on the website by itself within about 12 seconds.
No rebuild, no deploy.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy

The live site is deployed to Vercel (project `coldeen-os`). Push to `main` and deploy,
or run `npx vercel --prod` from this folder after `npm run build`.

## Backend

Two Base44 functions power the data:

- `coldeenPublic` — `home` (site content), `rev` (change stamp for auto refresh), `slots`, `book`, `track`
- `coldeenAdmin` — `list`, `job*`, `booking*`, `phone*`, `work*`, `service*`, `dayToggle`, `settingSave`

Admin key: `coldeen2026` (change it in `coldeenAdmin.ts` and in `src/Console.jsx`).

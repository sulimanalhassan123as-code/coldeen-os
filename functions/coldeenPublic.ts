import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const SLOT_CAP = 2;

const SEED_SETTINGS = [
  { key: "shop_name", value: "COLDEEN" },
  { key: "tagline", value: "Phone repair & mobile shop · Accra" },
  { key: "phone", value: "0504052487" },
  { key: "whatsapp", value: "233504052487" },
  { key: "address", value: "Osu, Oxford Street, Accra" },
  { key: "hours", value: "Mon – Sat · 9:00am – 7:00pm" },
  { key: "warranty", value: "3-month warranty after you collect" },
  { key: "since", value: "2019" },
  { key: "turnaround", value: "most repairs within 24 hours" },
  { key: "technicians", value: "Kojo, Selorm, Ama" },
  { key: "map_link", value: "" },
  { key: "notice", value: "" },
  { key: "booking_open", value: "1" },
];

const SEED_SERVICES = [
  { name: "Screen & display", icon: "🖥️", price_from: 350, desc: "Original-grade OLED and LCD for iPhone, Samsung, Tecno, Infinix and Xiaomi. Fitted, sealed and colour-tested." },
  { name: "Battery replacement", icon: "🔋", price_from: 180, desc: "Genuine cells with real cycle-count readings, not the number in settings." },
  { name: "Charging & ports", icon: "🔌", price_from: 150, desc: "Port cleaning, re-soldering and board-level repair for phones that only charge at an angle." },
  { name: "Water damage", icon: "💧", price_from: 250, desc: "Ultrasonic cleaning and board revival. We tell you honestly when a phone is beyond saving." },
  { name: "Software & firmware", icon: "🧠", price_from: 120, desc: "Flashing, unlocking, dead-boot recovery and fake-Android detection on cloned devices." },
  { name: "Buy & sell devices", icon: "📱", price_from: 0, desc: "New and UK-used devices with a written condition report. Trade-ins accepted after a scan." },
];

const SEED_PHONES = [
  { brand: "Apple", model: "iPhone 13", storage: "128GB", condition: "UK-used", price: 4800, stock: 2, badge: "Best value", note: "Battery 89% · verified original" },
  { brand: "Apple", model: "iPhone 12", storage: "64GB", condition: "UK-used", price: 3900, stock: 1, badge: "", note: "Battery 86% · verified original" },
  { brand: "Samsung", model: "Galaxy S23", storage: "256GB", condition: "New", price: 5200, stock: 1, badge: "New", note: "Sealed, 12-month shop warranty" },
  { brand: "Tecno", model: "Camon 20", storage: "256GB", condition: "New", price: 1850, stock: 3, badge: "", note: "Sealed" },
  { brand: "Infinix", model: "Note 30", storage: "128GB", condition: "New", price: 1650, stock: 2, badge: "", note: "Sealed" },
  { brand: "Xiaomi", model: "Redmi 13", storage: "128GB", condition: "New", price: 1750, stock: 4, badge: "", note: "Sealed" },
];

const SEED_WORK = [
  { title: "iPhone 13 · Screen replaced", service: "Screen & display", desc: "OLED fitted, resealed and tested on 12 checks before the customer paid.", image_url: "🖥️" },
  { title: "Samsung A54 · Battery swapped", service: "Battery replacement", desc: "Cell replaced with a genuine part. Full-day battery confirmed on test.", image_url: "🔋" },
  { title: "Tecno Camon · Water damage revived", service: "Water damage", desc: "Ultrasonic clean and board repair after a full soak. Alive again.", image_url: "💧" },
  { title: "Redmi Note · Charging port rebuilt", service: "Charging & ports", desc: "Micro-soldering on the port. Charges straight now, no more bending the cable.", image_url: "🔌" },
];

const SEED_JOBS = [
  { code: "COL-4821", customer: "Ama Mensah", phone: "0244000111", device: "iPhone 13", service: "Screen & display", quote: 650, status: "repairing", technician: "Kojo", note: "OLED fitted, running the 12-point test", paid: false },
  { code: "COL-4822", customer: "Kwame Boateng", phone: "0209988776", device: "Samsung A54", service: "Battery replacement", quote: 320, status: "diagnosing", technician: "Ama", note: "Waiting on the health reading before quoting", paid: false },
  { code: "COL-4823", customer: "Efua Sarpong", phone: "0551122334", device: "Tecno Camon 20", service: "Charging & ports", quote: 180, status: "ready", technician: "Selorm", note: "Port rebuilt, charging at full speed", paid: false },
  { code: "COL-4824", customer: "Yaw Darko", phone: "0277654321", device: "Infinix Note 30", service: "Water damage", quote: 280, status: "parts", technician: "Kojo", note: "Board clean, ordered a replacement connector", paid: false },
  { code: "COL-4825", customer: "Nana Adu", phone: "0243334455", device: "iPhone 12", service: "Screen & display", quote: 590, status: "collected", technician: "Ama", note: "Collected same day, receipt sent on WhatsApp", paid: true },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch (_) { /* ignore */ }

  const action = String(body.action || "");
  const data = body.data || {};

  const base44 = createClientFromRequest(req);
  const db = (base44 as any).asServiceRole ?? base44;

  const todayStr = () => new Date().toISOString().slice(0, 10);

  try {
    /* ================= PUBLIC: everything the site needs ================= */
    if (action === "home") {
      let settings = await db.entities.ColSetting.list();
      if (!settings || settings.length === 0) {
        for (const s of SEED_SETTINGS) await db.entities.ColSetting.create(s);
        settings = await db.entities.ColSetting.list();
      }
      let phones = await db.entities.ColPhone.list();
      if (!phones || phones.length === 0) {
        for (const p of SEED_PHONES) await db.entities.ColPhone.create(p);
        phones = await db.entities.ColPhone.list();
      }
      let work = await db.entities.ColWork.list();
      if (!work || work.length === 0) {
        for (const w of SEED_WORK) await db.entities.ColWork.create(w);
        work = await db.entities.ColWork.list();
      }
      let jobs = await db.entities.ColJob.list();
      if (!jobs || jobs.length === 0) {
        for (const j of SEED_JOBS) await db.entities.ColJob.create(j);
        jobs = await db.entities.ColJob.list();
      }
      let bookings = await db.entities.ColBooking.list();
      if (!bookings || bookings.length === 0) {
        const t = todayStr();
        const seedB = [
          { name: "Abena Owusu", phone: "0245556677", service: "Screen & display", date: t, slot: "10:00", status: "confirmed", note: "iPhone 11, cracked corner" },
          { name: "Kofi Ansah", phone: "0277711223", service: "Battery replacement", date: t, slot: "11:30", status: "confirmed", note: "" },
        ];
        for (const b of seedB) await db.entities.ColBooking.create(b);
        bookings = await db.entities.ColBooking.list();
      }

      const set: any = {};
      for (const s of settings || []) set[s.key] = s.value;

      // services are editable from the console (stored as JSON in settings)
      let services = SEED_SERVICES;
      try {
        const raw = set.services ? JSON.parse(set.services) : null;
        if (Array.isArray(raw) && raw.length) services = raw;
      } catch (_) { /* keep the seed list if the JSON is broken */ }

      // a change stamp: the site polls this and only redraws when the shop edits something
      const stamps = [
        ...(settings || []).map((x: any) => x.updated_date || ""),
        ...(phones || []).map((x: any) => x.updated_date || ""),
        ...(work || []).map((x: any) => x.updated_date || ""),
        ...(jobs || []).map((x: any) => x.updated_date || ""),
        ...(bookings || []).map((x: any) => x.updated_date || ""),
      ].sort();
      const rev = [
        stamps.length ? stamps[stamps.length - 1] : "0",
        (settings || []).length, (phones || []).length, (work || []).length,
        (jobs || []).length, (bookings || []).length,
      ].join("|");

      return new Response(JSON.stringify({
        ok: true,
        rev,
        server_now: new Date().toISOString(),
        settings: set,
        services,
        phones: (phones || []).sort((a: any, b: any) => (a.price || 0) - (b.price || 0)),
        work: (work || []).slice().sort((a: any, b: any) => String(b.updated_date || "").localeCompare(String(a.updated_date || ""))),
        slots: SLOTS,
        slot_cap: SLOT_CAP,
        stats: {
          jobsActive: (jobs || []).filter((j: any) => !["collected", "cancelled"].includes(j.status)).length,
          ready: (jobs || []).filter((j: any) => j.status === "ready").length,
          today: (bookings || []).filter((b: any) => b.date === todayStr()).length,
        },
      }), { headers: CORS });
    }

    /* ================= PUBLIC: cheap "has anything changed?" ================= */
    if (action === "rev") {
      const settings = await db.entities.ColSetting.list();
      const phones = await db.entities.ColPhone.list();
      const work = await db.entities.ColWork.list();
      const jobs = await db.entities.ColJob.list();
      const bookings = await db.entities.ColBooking.list();
      const stamps = [
        ...(settings || []).map((x: any) => x.updated_date || ""),
        ...(phones || []).map((x: any) => x.updated_date || ""),
        ...(work || []).map((x: any) => x.updated_date || ""),
        ...(jobs || []).map((x: any) => x.updated_date || ""),
        ...(bookings || []).map((x: any) => x.updated_date || ""),
      ].sort();
      const rev = [
        stamps.length ? stamps[stamps.length - 1] : "0",
        (settings || []).length, (phones || []).length, (work || []).length,
        (jobs || []).length, (bookings || []).length,
      ].join("|");
      return new Response(JSON.stringify({ ok: true, rev }), { headers: CORS });
    }

    /* ================= PUBLIC: available slots for a date ================= */
    if (action === "slots") {
      const date = String(data.date || todayStr());
      const bookings = await db.entities.ColBooking.list();
      const taken: any = {};
      for (const b of bookings || []) {
        if (b.date === date && b.status !== "cancelled") taken[b.slot] = (taken[b.slot] || 0) + 1;
      }
      const closed = (bookings || []).some((b: any) => b.date === date && b.status === "closed");
      return new Response(JSON.stringify({
        ok: true,
        date,
        closed,
        closed_days: (bookings || []).filter((b: any) => b.status === "closed").map((b: any) => b.date),
        slots: SLOTS.map(s => ({ slot: s, left: Math.max(0, SLOT_CAP - (taken[s] || 0)), full: (taken[s] || 0) >= SLOT_CAP })),
      }), { headers: CORS });
    }

    /* ================= PUBLIC: book an appointment AND open a real ticket ================= */
    if (action === "book") {
      const name = String(data.name || "").trim().slice(0, 80);
      const phone = String(data.phone || "").trim().slice(0, 20);
      const service = String(data.service || "").trim().slice(0, 80);
      const date = String(data.date || "").slice(0, 10);
      const slot = String(data.slot || "").slice(0, 5);
      const device = String(data.device || "").trim().slice(0, 60);
      if (!name || !phone) return new Response(JSON.stringify({ ok: false, error: "Name and phone number are required." }), { status: 400, headers: CORS });
      if (!/^[+0-9 ]{9,15}$/.test(phone)) return new Response(JSON.stringify({ ok: false, error: "Please enter a valid phone number." }), { status: 400, headers: CORS });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Response(JSON.stringify({ ok: false, error: "Pick a day for your appointment." }), { status: 400, headers: CORS });
      if (!SLOTS.includes(slot)) return new Response(JSON.stringify({ ok: false, error: "Pick a time slot." }), { status: 400, headers: CORS });

      const settingsRaw = await db.entities.ColSetting.list();
      const set: any = {};
      for (const s of settingsRaw || []) set[s.key] = s.value;
      if (String(set.booking_open || "1") === "0") {
        return new Response(JSON.stringify({ ok: false, error: "Online booking is paused right now. Please call or WhatsApp the shop." }), { status: 409, headers: CORS });
      }

      const bookings = await db.entities.ColBooking.list();
      if ((bookings || []).some((b: any) => b.date === date && b.status === "closed")) {
        return new Response(JSON.stringify({ ok: false, error: "The shop is closed on that day. Please pick another day." }), { status: 409, headers: CORS });
      }
      const same = (bookings || []).filter((b: any) => b.date === date && b.slot === slot && b.status !== "cancelled");
      if (same.length >= SLOT_CAP) return new Response(JSON.stringify({ ok: false, error: "That time is full. Please pick another slot." }), { status: 409, headers: CORS });

      const rec = await db.entities.ColBooking.create({
        name, phone, service: service || "General check", date, slot,
        note: String(data.note || "").slice(0, 300),
        status: "confirmed",
      });

      // open the repair ticket straight away so the customer can track from minute one
      const jobs = await db.entities.ColJob.list();
      let maxN = 4830;
      for (const j of jobs || []) {
        const m = /^COL-(\d+)$/.exec(String(j.code || "").toUpperCase());
        if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
      }
      const code = "COL-" + String(maxN + 1);
      const jobNote = `Booked online for ${date} at ${slot}. ` + (data.note ? String(data.note).slice(0, 200) : "Waiting for the phone at the shop.");
      try {
        await db.entities.ColJob.create({
          code,
          customer: name,
          phone,
          device: device || "To be confirmed at drop-off",
          service: service || "General check",
          quote: 0,
          status: "received",
          technician: "",
          note: jobNote.slice(0, 300),
          paid: false,
        });
      } catch (_) { /* the booking still stands even if the ticket could not be opened */ }

      return new Response(JSON.stringify({
        ok: true,
        booking: { id: rec.id, date, slot, name, phone, service, code },
        ticket: { code, status: "received", device: device || "To be confirmed at drop-off", service: service || "General check", quote: 0, note: jobNote },
      }), { headers: CORS });
    }

    /* ================= PUBLIC: track a repair ================= */
    if (action === "track") {
      const code = String(data.code || "").trim().toUpperCase().replace(/\s+/g, "");
      const norm = /^\d{3,8}$/.test(code) ? "COL-" + code : code;
      if (!/^COL-[0-9A-Z]{3,8}$/.test(norm)) {
        return new Response(JSON.stringify({ ok: false, error: "That does not look like a ticket code. It looks like COL-4821 (the code on your receipt)." }), { status: 400, headers: CORS });
      }
      const jobs = await db.entities.ColJob.list();
      const j = (jobs || []).find((x: any) => String(x.code || "").toUpperCase() === norm);
      if (!j) {
        return new Response(JSON.stringify({ ok: false, error: `No repair found with ${norm}. Check the code on your receipt or WhatsApp the shop and we will find it for you.` }), { status: 404, headers: CORS });
      }
      return new Response(JSON.stringify({
        ok: true,
        job: {
          code: j.code,
          customer: j.customer || "",
          device: j.device,
          service: j.service,
          status: j.status,
          technician: j.technician || "",
          quote: j.quote || 0,
          paid: !!j.paid,
          note: j.note || "",
          created_date: j.created_date,
          updated_date: j.updated_date,
        },
      }), { headers: CORS });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown action." }), { status: 400, headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e && e.message) || "Server error." }), { status: 500, headers: CORS });
  }
});

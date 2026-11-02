import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const JOB_STATUS = ["received", "diagnosing", "parts", "repairing", "ready", "collected", "cancelled"];
const BOOK_STATUS = ["confirmed", "completed", "cancelled", "no-show"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch (_) { /* ignore */ }

  if (String(body.key || "") !== "coldeen2026") {
    return new Response(JSON.stringify({ ok: false, error: "Invalid admin key." }), { status: 401, headers: CORS });
  }

  const base44 = createClientFromRequest(req);
  const db = (base44 as any).asServiceRole ?? base44;
  const action = String(body.action || "");
  const data = body.data || {};
  const todayStr = () => new Date().toISOString().slice(0, 10);

  try {
    /* ============ console bootstrap: everything at once ============ */
    if (action === "list") {
      const jobs = await db.entities.ColJob.list();
      const bookings = await db.entities.ColBooking.list();
      const phones = await db.entities.ColPhone.list();
      const work = await db.entities.ColWork.list();
      const settingsRaw = await db.entities.ColSetting.list();
      const set: any = {};
      for (const s of settingsRaw || []) set[s.key] = s.value;

      let services: any[] = [];
      try { services = set.services ? JSON.parse(set.services) : []; } catch (_) { services = []; }

      const sortedJobs = (jobs || []).sort((a: any, b: any) => String(b.updated_date || "").localeCompare(String(a.updated_date || "")));
      const sortedBookings = (bookings || []).sort((a: any, b: any) => String(a.date + a.slot).localeCompare(String(b.date + b.slot)));

      const active = sortedJobs.filter((j: any) => !["collected", "cancelled"].includes(j.status));
      const revenueToday = sortedJobs
        .filter((j: any) => j.paid && String(j.updated_date || "").slice(0, 10) === todayStr())
        .reduce((a: number, j: any) => a + (Number(j.quote) || 0), 0);
      const pipeline = active.reduce((a: number, j: any) => a + (Number(j.quote) || 0), 0);

      return new Response(JSON.stringify({
        ok: true,
        jobs: sortedJobs,
        bookings: sortedBookings,
        phones: phones || [],
        work: work || [],
        services,
        settings: set,
        stats: {
          active: active.length,
          ready: sortedJobs.filter((j: any) => j.status === "ready").length,
          bookingsToday: sortedBookings.filter((b: any) => b.date === todayStr() && b.status === "confirmed").length,
          revenueToday,
          pipeline,
        },
      }), { headers: CORS });
    }

    /* ============ jobs ============ */
    if (action === "jobSave") {
      const patch: any = {
        customer: String(data.customer || "").slice(0, 80),
        phone: String(data.phone || "").slice(0, 20),
        device: String(data.device || "").slice(0, 80),
        service: String(data.service || "").slice(0, 80),
        quote: Math.max(0, Number(data.quote) || 0),
        technician: String(data.technician || "").slice(0, 40),
        note: String(data.note || "").slice(0, 400),
        status: JOB_STATUS.includes(String(data.status)) ? String(data.status) : "received",
      };
      if (!patch.customer || !patch.device) {
        return new Response(JSON.stringify({ ok: false, error: "Customer name and device are required." }), { status: 400, headers: CORS });
      }
      if (data.id) {
        await db.entities.ColJob.update(String(data.id), patch);
        return new Response(JSON.stringify({ ok: true }), { headers: CORS });
      }
      let code = "";
      const all = await db.entities.ColJob.list();
      for (let i = 0; i < 8; i++) {
        code = "COL-" + String(Math.floor(1000 + Math.random() * 9000));
        if (!(all || []).some((j: any) => j.code === code)) break;
      }
      await db.entities.ColJob.create({ ...patch, code, paid: false });
      return new Response(JSON.stringify({ ok: true, code }), { headers: CORS });
    }

    if (action === "jobUpdate") {
      const patch: any = {};
      if (data.status !== undefined) {
        if (!JOB_STATUS.includes(String(data.status))) return new Response(JSON.stringify({ ok: false, error: "Invalid status." }), { status: 400, headers: CORS });
        patch.status = String(data.status);
      }
      if (data.technician !== undefined) patch.technician = String(data.technician || "").slice(0, 40);
      if (data.note !== undefined) patch.note = String(data.note || "").slice(0, 400);
      if (data.quote !== undefined) patch.quote = Math.max(0, Number(data.quote) || 0);
      if (data.paid !== undefined) patch.paid = !!data.paid;
      await db.entities.ColJob.update(String(data.id), patch);
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    if (action === "jobDelete") {
      await db.entities.ColJob.delete(String(data.id));
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    /* ============ bookings ============ */
    if (action === "bookingUpdate") {
      const status = String(data.status || "");
      if (!BOOK_STATUS.includes(status)) return new Response(JSON.stringify({ ok: false, error: "Invalid status." }), { status: 400, headers: CORS });
      await db.entities.ColBooking.update(String(data.id), { status });
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    if (action === "bookingDelete") {
      await db.entities.ColBooking.delete(String(data.id));
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    /* ============ inventory ============ */
    if (action === "phoneSave") {
      const patch: any = {
        brand: String(data.brand || "").slice(0, 40),
        model: String(data.model || "").slice(0, 60),
        storage: String(data.storage || "").slice(0, 20),
        condition: String(data.condition || "New").slice(0, 30),
        price: Math.max(0, Number(data.price) || 0),
        stock: Math.max(0, Number(data.stock) || 0),
        badge: String(data.badge || "").slice(0, 30),
        note: String(data.note || "").slice(0, 200),
      };
      if (!patch.model) return new Response(JSON.stringify({ ok: false, error: "Model is required." }), { status: 400, headers: CORS });
      if (data.id) await db.entities.ColPhone.update(String(data.id), patch);
      else await db.entities.ColPhone.create(patch);
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    if (action === "phoneDelete") {
      await db.entities.ColPhone.delete(String(data.id));
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    /* ============ work gallery ============ */
    if (action === "workSave") {
      const patch: any = {
        title: String(data.title || "").slice(0, 120),
        service: String(data.service || "").slice(0, 80),
        desc: String(data.desc || "").slice(0, 300),
        image_url: (String(data.image_url || "🛠️").startsWith("http")
          ? String(data.image_url).slice(0, 400)
          : String(data.image_url || "🛠️").slice(0, 12)),
      };
      if (!patch.title) return new Response(JSON.stringify({ ok: false, error: "Title is required." }), { status: 400, headers: CORS });
      if (data.id) await db.entities.ColWork.update(String(data.id), patch);
      else await db.entities.ColWork.create(patch);
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    if (action === "workDelete") {
      await db.entities.ColWork.delete(String(data.id));
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    /* ============ services (name, icon, price, description) ============ */
    if (action === "serviceSave" || action === "serviceDelete") {
      const settings = await db.entities.ColSetting.list();
      const rec = (settings || []).find((s: any) => s.key === "services");
      let list: any[] = [];
      try { list = rec && rec.value ? JSON.parse(rec.value) : []; } catch (_) { list = []; }
      if (!Array.isArray(list)) list = [];

      if (action === "serviceDelete") {
        list = list.filter((x: any) => String(x.name) !== String(data.name || ""));
      } else {
        const item = {
          name: String(data.name || "").slice(0, 60),
          icon: String(data.icon || "🛠️").slice(0, 8),
          price_from: Math.max(0, Number(data.price_from) || 0),
          desc: String(data.desc || "").slice(0, 300),
        };
        if (!item.name) return new Response(JSON.stringify({ ok: false, error: "Service name is required." }), { status: 400, headers: CORS });
        const at = list.findIndex((x: any) => String(x.name) === String(data.original || item.name));
        if (at >= 0) list[at] = item; else list.push(item);
      }
      const val = JSON.stringify(list);
      if (rec) await db.entities.ColSetting.update(String(rec.id), { value: val });
      else await db.entities.ColSetting.create({ key: "services", value: val });
      return new Response(JSON.stringify({ ok: true, services: list }), { headers: CORS });
    }

    /* ============ close (or reopen) a whole day for bookings ============ */
    if (action === "dayToggle") {
      const date = String(data.date || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Response(JSON.stringify({ ok: false, error: "Pick a date." }), { status: 400, headers: CORS });
      const bookings = await db.entities.ColBooking.list();
      const existing = (bookings || []).find((b: any) => b.date === date && b.status === "closed");
      if (existing) await db.entities.ColBooking.delete(String(existing.id));
      else await db.entities.ColBooking.create({ name: "Shop closed", phone: "", service: "Closed", date, slot: "00:00", status: "closed", note: "Day closed by the owner" });
      return new Response(JSON.stringify({ ok: true, closed: !existing }), { headers: CORS });
    }

    /* ============ settings ============ */
    if (action === "settingSave") {
      const k = String(data.key || "").slice(0, 40);
      const v = String(data.value || "").slice(0, 4000);
      const settings = await db.entities.ColSetting.list();
      const existing = (settings || []).find((s: any) => s.key === k);
      if (existing) await db.entities.ColSetting.update(String(existing.id), { value: v });
      else await db.entities.ColSetting.create({ key: k, value: v });
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown action." }), { status: 400, headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e && e.message) || "Server error." }), { status: 500, headers: CORS });
  }
});

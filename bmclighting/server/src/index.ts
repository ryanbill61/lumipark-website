import { Hono } from "hono";
import { db, secret, vars } from "edgespark";
import { and, desc, eq, gte } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { leads, leadRate } from "./defs";
import { installBloomeBridge } from "./bloome-bridge";

const app = new Hono();

installBloomeBridge(app);

const ADMIN_USERNAME = "admin";
const SITE_EMAIL = "monica@bmclighting.com";
const SITE_NAME = "BMC Lighting";
// Brand's own domain is verified in Resend + has a real mailbox now.
const FROM_EMAIL = "monica@bmclighting.com";
// Real inbox that receives the internal notification.
const NOTIFY_EMAIL = "monica@bmclighting.com";
const SITE_RATE_KEY: string = "bmc"; // per-site rate-limit dimension
const SESSION_COOKIE = "admin_session";

function adminPassword(): string {
  // TODO(secret): switch to secret.get("ADMIN_PASSWORD") once owner fills the secure value.
  return vars.get("ADMIN_PASSWORD") || "";
}

function sessionSecret(): string {
  return secret.get("BLOOME_BRIDGE_SECRET") || "dev-session-secret";
}

async function signSession(): Promise<string> {
  const key = new TextEncoder().encode(sessionSecret());
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

async function isAdmin(c: { req: { header: (n: string) => string | undefined } }): Promise<boolean> {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  if (!match) return false;
  try {
    await jwtVerify(match[1], new TextEncoder().encode(sessionSecret()));
    return true;
  } catch {
    return false;
  }
}

const setSessionCookie = (token: string, maxAge: number) =>
  `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;

// Inbound inquiry (lead) — public form submission.
async function sendLeadEmail(lead: { name: string | null; email: string; company: string | null; phone: string | null; message: string | null; productSlug: string | null }): Promise<{ ok: boolean; error?: string }> {
  const key = vars.get("RESEND_API_KEY");
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };

  const leadLines = [
    `Name: ${lead.name || "-"}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company || "-"}`,
    `Phone: ${lead.phone || "-"}`,
    `Product: ${lead.productSlug || "-"}`,
    `Message: ${lead.message || "-"}`,
  ].join("\n");

  const post = async (payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 300)}` };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  const notify = await post({
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    reply_to: SITE_EMAIL,
    to: [NOTIFY_EMAIL],
    subject: `New inquiry${lead.name ? ` — ${lead.name}` : ""}`,
    text: leadLines,
  });
  if (!notify.ok) return notify;

  return post({
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    reply_to: SITE_EMAIL,
    to: [lead.email],
    subject: "We received your inquiry",
    text: `Hi ${lead.name || "there"},\n\nThanks for reaching out. Our team will get back to you within 1 business day.\n\n— ${SITE_NAME}`,
  });
}

// --- DB-backed rate limiting (shared across edge instances) ---
async function rateCount(kind: string, ip: string, email: string, windowMs: number): Promise<number> {
  const cutoff = Date.now() - windowMs;
  const rows = await db
    .select({ id: leadRate.id })
    .from(leadRate)
    .where(and(eq(leadRate.kind, kind), eq(leadRate.ip, ip), eq(leadRate.email, email), gte(leadRate.createdAt, cutoff)))
    .limit(100);
  return rows.length;
}
async function rateCountByIp(kind: string, ip: string, windowMs: number): Promise<number> {
  const cutoff = Date.now() - windowMs;
  const rows = await db
    .select({ id: leadRate.id })
    .from(leadRate)
    .where(and(eq(leadRate.kind, kind), eq(leadRate.ip, ip), gte(leadRate.createdAt, cutoff)))
    .limit(100);
  return rows.length;
}
async function sendRateLimitAlert(): Promise<void> {
  const key = vars.get("RESEND_API_KEY");
  if (!key) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        to: [NOTIFY_EMAIL],
        subject: `⚠️ Inquiry rate limit reached — ${SITE_NAME}`,
        text: "Inquiry submissions hit the hourly cap (30/hour). New submissions are still recorded, but notification emails are paused for this hour to protect the inbox.",
      }),
    });
  } catch {
    // alert failure must not break the response
  }
}

app.post("/api/public/leads", async (c) => {
  const ip = clientIp(c);

  let data: Record<string, unknown> = {};
  try {
    data = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const email = typeof data.email === "string" ? data.email.trim() : "";

  // Record every attempt (rate counter, shared across edge instances).
  await db.insert(leadRate).values({ kind: `lead:${SITE_RATE_KEY}`, ip, email: email || "invalid" });

  // 1) IP rate limit — first, before honeypot, so honeypot probes also count.
  if ((await rateCountByIp(`lead:${SITE_RATE_KEY}`, ip, 60_000)) > 5) {
    return c.json({ error: "Too many requests" }, 429);
  }

  // 2) Honeypot — silent discard (no lead stored, no email sent).
  if (typeof data.website === "string" && data.website.trim()) {
    return c.json({ ok: true, id: 0, emailStatus: "skipped" }, 201);
  }

  if (!email) return c.json({ error: "Email is required" }, 400);

  // 3) Email rate limit — second dimension.
  if ((await rateCount(`lead:${SITE_RATE_KEY}`, ip, email, 60_000)) > 5) {
    return c.json({ error: "Too many requests" }, 429);
  }

  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const leadData = {
    name: str(data.name),
    email,
    company: str(data.company),
    phone: str(data.phone),
    message: str(data.message),
    productSlug: str(data.productSlug),
  };

  // 4) Hourly global cap (per site) — 30 leads/hour.
  const hourCutoff = Date.now() - 3600_000;
  const hourRows = await db.select({ id: leads.id }).from(leads).where(gte(leads.createdAt, hourCutoff)).limit(31);
  const capped = hourRows.length >= 30;

  let lead;
  try {
    [lead] = await db
      .insert(leads)
      .values({ brand: "BMC", ip, emailStatus: capped ? "rate_limited" : "pending", ...leadData })
      .returning();
  } catch (e) {
    return c.json({ error: "DB: " + (e instanceof Error ? e.message : String(e)) }, 500);
  }

  // 5) Email only when NOT capped (prevents flooding owner inbox + auto-reply abuse).
  if (capped) {
    const cappedRows = await db
      .select({ id: leads.id })
      .from(leads)
      .where(and(eq(leads.emailStatus, "rate_limited"), gte(leads.createdAt, hourCutoff)))
      .limit(2);
    if (cappedRows.length === 1) await sendRateLimitAlert();
    return c.json({ ok: true, id: lead.id, emailStatus: "rate_limited" }, 201);
  }

  const emailResult = await sendLeadEmail(leadData);
  try {
    await db
      .update(leads)
      .set({ emailStatus: emailResult.ok ? "sent" : "failed", emailError: emailResult.error || null })
      .where(eq(leads.id, lead.id));
  } catch {
    // status write-back must not break the response
  }
  return c.json({ ok: true, id: lead.id, emailStatus: emailResult.ok ? "sent" : "failed" }, 201);
});

app.post("/api/public/admin/leads/:id/resend", async (c) => {
  if (!(await isAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);
  const rows = await db.select().from(leads).where(eq(leads.id, id));
  const lead = rows[0];
  if (!lead) return c.json({ error: "Not found" }, 404);
  const result = await sendLeadEmail({
    name: lead.name,
    email: lead.email,
    company: lead.company,
    phone: lead.phone,
    message: lead.message,
    productSlug: lead.productSlug,
  });
  await db
    .update(leads)
    .set({ emailStatus: result.ok ? "sent" : "failed", emailError: result.error || null })
    .where(eq(leads.id, id));
  return c.json({ ok: result.ok, error: result.error || null });
});

// --- Owner admin (cookie session) ---

const LOGIN_MAX_FAILS = 5;
const LOGIN_LOCK_MS = 60_000;

function clientIp(c: { req: { header: (n: string) => string | undefined } }): string {
  return c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "unknown";
}

// Admin login rate limiting (DB-backed, shared across edge instances).
async function loginFailCount(ip: string): Promise<number> {
  const cutoff = Date.now() - LOGIN_LOCK_MS;
  const rows = await db
    .select({ id: leadRate.id })
    .from(leadRate)
    .where(and(eq(leadRate.kind, `login:${SITE_RATE_KEY}`), eq(leadRate.ip, ip), gte(leadRate.createdAt, cutoff)))
    .limit(100);
  return rows.length;
}

app.post("/api/public/admin/login", async (c) => {
  const ip = clientIp(c);
  if ((await loginFailCount(ip)) >= LOGIN_MAX_FAILS) {
    return c.json({ ok: false, error: "Too many attempts. Try again later." }, 429);
  }
  const body = await c.req.json().catch(() => ({}));
  if (body.username === ADMIN_USERNAME && body.password === adminPassword()) {
    await db.delete(leadRate).where(and(eq(leadRate.kind, `login:${SITE_RATE_KEY}`), eq(leadRate.ip, ip)));
    const token = await signSession();
    c.header("Set-Cookie", setSessionCookie(token, 604800));
    return c.json({ ok: true });
  }
  await db.insert(leadRate).values({ kind: `login:${SITE_RATE_KEY}`, ip, email: "admin" });
  return c.json({ ok: false, error: "Invalid credentials" }, 401);
});

app.post("/api/public/admin/logout", async (c) => {
  c.header("Set-Cookie", setSessionCookie("", 0));
  return c.json({ ok: true });
});

app.get("/api/public/admin/me", async (c) => {
  return c.json({ ok: await isAdmin(c) });
});

app.get("/api/public/admin/leads", async (c) => {
  if (!(await isAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return c.json(rows);
});

app.get("/api/public/admin/leads/export", async (c) => {
  if (!(await isAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  const header = "id,brand,name,email,company,phone,message,product_slug,created_at";
  const lines = rows.map((l) =>
    [l.id, l.brand, l.name, l.email, l.company, l.phone, l.message, l.productSlug, l.createdAt]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header, ...lines].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
});

app.delete("/api/public/admin/leads/:id", async (c) => {
  if (!(await isAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);
  await db.delete(leads).where(eq(leads.id, id));
  return c.json({ ok: true });
});

// Server-side Sanity proxy — whitelisted views + basic rate limit (avoids browser CORS,
// hides the project id, and prevents the endpoint from being used as an open GROQ relay).
const SANITY_PROJECTION = `{
  _id, title, "slug": slug.current, "category": category->title, productType, tagline, description,
  "brand": brand->name, features, applications, warranty,
  "specifications": specifications[]{label, value},
  "mainImage": mainImage.asset._ref, "gallery": gallery[].asset._ref,
  "specSheet": specSheet.asset._ref, "installManual": installManual.asset._ref,
  "iesFile": iesFile.asset._ref, "cutSheet": cutSheet.asset._ref,
  variants[]{ _key, "sku": modelNumber, "power": powerSize, "lumens": luminousFlux, "efficacy": efficacy, "dimensions": dimensions }
}`;

const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_MAX = 60;
const RATE_WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || e.reset < now) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  e.count += 1;
  return e.count > RATE_MAX;
}

// Lead submissions rate limit is DB-backed (see /api/public/leads) — in-memory maps don't
// share across EdgeSpark's edge instances.

app.get("/api/public/sanity", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "unknown";
  if (rateLimited(ip)) return c.json({ error: "Too many requests" }, 429);

  const view = c.req.query("view");
  const brand = c.req.query("brand");
  const slug = c.req.query("slug");

  let query: string;
  if (view === "products") {
    const b = brand === "BMC" || brand === "LEAPPON" ? brand : null;
    const featured = c.req.query("featured") === "true";
    const conditions: string[] = [];
    if (b) conditions.push(`brand->name == ${JSON.stringify(b)}`);
    if (featured) conditions.push("hubFeatured == true");
    const filter = conditions.length ? conditions.join(" && ") : "true";
    query = `*[_type == "product" && ${filter}] | order(hubRank asc, _createdAt asc) ${SANITY_PROJECTION}`;
  } else if (view === "product" && slug) {
    query = `*[_type == "product" && slug.current == ${JSON.stringify(slug)}][0] ${SANITY_PROJECTION}`;
  } else if (view === "settings") {
    const site = c.req.query("site") || "hub";
    const typeMap: Record<string, string> = { hub: "hubSettings", bmc: "bmcSettings", leappon: "leapponSettings" };
    const type = typeMap[site] || "hubSettings";
    query = `*[_type == ${JSON.stringify(type)}][0]`;
  } else {
    return c.json({ error: "Unknown view" }, 400);
  }

  const url = `https://e5lza2t9.api.sanity.io/v2021-06-07/data/query/production?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return c.json({ error: `Sanity error ${res.status}` }, 502);
  const data = await res.json();
  return c.json(data);
});

// --- Dify chatbot proxy ---
const DIFY_BASE = "https://api.dify.ai/v1";

// Fetch a single product's authoritative context from Sanity for PDP question answering.
async function productContextFor(slug: string): Promise<string> {
  const query = `*[_type == "product" && slug.current == ${JSON.stringify(slug)}][0] ${SANITY_PROJECTION}`;
  const url = `https://e5lza2t9.api.sanity.io/v2021-06-07/data/query/production?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const json = (await res.json()) as { result?: Record<string, unknown> | null };
    const p = json.result;
    if (!p) return "";
    const bits: string[] = [
      `Product: ${p.title}`,
      p.brand ? `Brand: ${p.brand}` : "",
      p.category ? `Category: ${p.category}` : "",
      p.productType ? `Product type: ${p.productType}` : "",
      p.description ? `Description: ${String(p.description).slice(0, 400)}` : "",
    ].filter(Boolean);
    const specs = p.specifications as Array<{ label?: string; value?: string }> | undefined;
    if (Array.isArray(specs) && specs.length) {
      bits.push("Specifications: " + specs.map((s) => `${s.label}: ${s.value}`).join("; "));
    }
    const variants = p.variants as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(variants) && variants.length) {
      bits.push(
        "Models/SKUs: " +
          variants
            .map((v) => [v.sku, v.power && `power ${v.power}`, v.lumens && `${v.lumens}lm`, v.efficacy && `efficacy ${v.efficacy}`, v.dimensions].filter(Boolean).join(" — "))
            .join(" | ")
      );
    }
    return bits.join("\n");
  } catch {
    return "";
  }
}

app.get("/api/public/dify/health", (c) => {
  return c.json({ enabled: !!vars.get("DIFY_API_KEY") });
});

app.post("/api/public/dify/chat", async (c) => {
  const key = vars.get("DIFY_API_KEY");
  if (!key) return c.json({ enabled: false }, 503);

  const ip = clientIp(c);
  // Anti-abuse: 30 calls/hour/IP.
  if ((await rateCountByIp(`dify:${SITE_RATE_KEY}`, ip, 3600_000)) >= 30) {
    return c.json({ error: "Too many requests" }, 429);
  }
  await db.insert(leadRate).values({ kind: `dify:${SITE_RATE_KEY}`, ip, email: "dify" });

  let body: Record<string, unknown> = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return c.json({ error: "Query required" }, 400);
  const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";

  // PDP context: inject the product's authoritative data directly into the prompt (not reliant on KB retrieval).
  const productContext = productSlug ? await productContextFor(productSlug) : "";
  const BRAND_GUIDE =
    "LumiPark Group has two brands: BMC (commercial/engineering lighting — bmclighting.com) and LEAPPON (decorative home lighting — leappon.com). " +
    "If a customer asks about a brand or product that does not belong to this site, proactively name the correct brand and point them to its site (bmclighting.com or leappon.com), then guide them to leave an inquiry.";
  const brandHint =
    (SITE_RATE_KEY === "bmc"
      ? "You are on the BMC Lighting website (commercial/industrial lighting). Focus on BMC products; do not pitch LEAPPON home/decorative lighting."
      : SITE_RATE_KEY === "leappon"
        ? "You are on the LEAPPON website (decorative home lighting). Focus on LEAPPON products; do not pitch BMC commercial lighting."
        : "You are on the LumiPark Group hub — you may cover both BMC and LEAPPON.") +
    " " +
    BRAND_GUIDE;
  const fullQuery = productContext
    ? `Product data for the current page (authoritative — answer using it, do not say you lack the specs):\n${productContext}\n\n${brandHint}\n\nUser question: ${query}`
    : `${brandHint}\n\nUser question: ${query}`;

  try {
    const res = await fetch(`${DIFY_BASE}/chat-messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: { site: SITE_RATE_KEY, productSlug, productContext },
        query: fullQuery,
        response_mode: "streaming",
        user: `web-${ip}`,
        ...(conversationId ? { conversation_id: conversationId } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return c.json({ error: `Dify ${res.status}: ${text.slice(0, 200)}` }, 502);
    }

    // Parse SSE stream (Agent apps only support streaming response_mode).
    const raw = await res.text();
    let answer = "";
    let convId = conversationId;
    let msgId = "";
    for (const line of raw.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const evt = JSON.parse(payload) as { event?: string; answer?: string; message?: string; conversation_id?: string; message_id?: string };
        if (evt.event === "message") answer += evt.answer || "";
        else if (evt.event === "message_end") {
          convId = evt.conversation_id || convId;
          msgId = evt.message_id || "";
        } else if (evt.event === "error") {
          return c.json({ error: evt.message || "Dify error" }, 502);
        }
      } catch {
        // ignore malformed SSE frames
      }
    }
    return c.json({ answer, conversationId: convId, messageId: msgId });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "Dify error" }, 502);
  }
});

export default app;

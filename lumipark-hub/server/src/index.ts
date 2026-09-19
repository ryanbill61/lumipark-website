import { Hono } from "hono";
import { db, secret, vars } from "edgespark";
import { desc, eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { leads } from "./defs";
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

app.post("/api/public/leads", async (c) => {
  let data: Record<string, unknown> = {};
  try {
    data = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const email = typeof data.email === "string" ? data.email.trim() : "";
  if (!email) return c.json({ error: "Email is required" }, 400);

  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  const leadData = {
    name: str(data.name),
    email,
    company: str(data.company),
    phone: str(data.phone),
    message: str(data.message),
    productSlug: str(data.productSlug),
  };

  let lead;
  try {
    [lead] = await db
      .insert(leads)
      .values({ brand: "BMC", ...leadData })
      .returning();
  } catch (e) {
    return c.json({ error: "DB: " + (e instanceof Error ? e.message : String(e)) }, 500);
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

// In-memory login rate limiting (best-effort; resets on Worker cold start).
const loginFailMap = new Map<string, { count: number; lockedUntil: number }>();

function loginLocked(ip: string): boolean {
  const e = loginFailMap.get(ip);
  return !!e && e.lockedUntil > Date.now();
}
function recordLoginFail(ip: string): void {
  const now = Date.now();
  const e = loginFailMap.get(ip);
  if (!e || e.lockedUntil <= now) {
    loginFailMap.set(ip, { count: 1, lockedUntil: 0 });
    return;
  }
  e.count += 1;
  if (e.count >= LOGIN_MAX_FAILS) {
    e.lockedUntil = now + LOGIN_LOCK_MS;
    e.count = 0;
  }
}

app.post("/api/public/admin/login", async (c) => {
  const ip = clientIp(c);
  if (loginLocked(ip)) return c.json({ ok: false, error: "Too many attempts. Try again later." }, 429);
  const body = await c.req.json().catch(() => ({}));
  if (body.username === ADMIN_USERNAME && body.password === adminPassword()) {
    loginFailMap.delete(ip);
    const token = await signSession();
    c.header("Set-Cookie", setSessionCookie(token, 604800));
    return c.json({ ok: true });
  }
  recordLoginFail(ip);
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

export default app;

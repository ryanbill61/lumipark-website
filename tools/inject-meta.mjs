// Build-time: read site settings (site_title / meta_description) from Sanity and
// inject into dist/index.html. If Sanity is unavailable or the doc is missing,
// leave the hardcoded fallback in place (never emit empty title/description).
const SITE_TYPE = process.argv[2] || "hub";
const TYPE_MAP = { hub: "hubSettings", bmc: "bmcSettings", leappon: "leapponSettings" };
const type = TYPE_MAP[SITE_TYPE] || "hubSettings";
const query = `*[_type == "${type}"][0]{site_title, meta_description}`;
const url = `https://e5lza2t9.api.sanity.io/v2021-06-07/data/query/production?query=${encodeURIComponent(query)}`;

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

let title = null;
let desc = null;
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (res.ok) {
    const data = await res.json();
    const s = data?.result;
    if (s?.site_title) title = String(s.site_title);
    if (s?.meta_description) desc = String(s.meta_description);
  }
} catch {
  // fallback: leave hardcoded values untouched
}

if (!title && !desc) {
  console.log(`[inject-meta] ${SITE_TYPE}: no settings → keeping hardcoded fallback`);
  process.exit(0);
}

import { readFileSync, writeFileSync } from "node:fs";
let html = readFileSync("dist/index.html", "utf8");
if (title) {
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/>/, `<meta property="og:title" content="${escapeAttr(title)}" />`);
}
if (desc) {
  html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/>/, `<meta name="description" content="${escapeAttr(desc)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/>/, `<meta property="og:description" content="${escapeAttr(desc)}" />`);
}
writeFileSync("dist/index.html", html);
console.log(`[inject-meta] ${SITE_TYPE}: title="${title || "(unchanged)"}" desc="${desc ? desc.slice(0, 40) : "(unchanged)"}"`);

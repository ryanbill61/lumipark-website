#!/usr/bin/env node
// Post-build PDP prerender + product sitemap generator.
// Runs after `vite build` (reads web/dist/index.html shell, injects per-product meta + body + Product JSON-LD).
// Usage (via package.json postbuild or manually, from web/):
//   node ../../tools/prerender.mjs --domain lumiparkgroup.com --site "LumiPark Group" [--brand BMC]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) => (a.startsWith("--") ? [a.slice(2), arr[i + 1]] : null)).filter(Boolean)
);
const DOMAIN = args.domain;
const SITE_NAME = args.site;
const BRAND = args.brand || ""; // empty = all brands (hub)
const WEB_DIR = args["web-dir"] || "."; // default: run from web/ (npm postbuild cwd)

if (!DOMAIN || !SITE_NAME) {
  console.error("usage: node tools/prerender.mjs --domain <d> --site <name> [--brand BMC]");
  process.exit(1);
}

const SANITY_PROJECT = "e5lza2t9";
const brandFilter = BRAND ? ` && brand->name == "${BRAND}"` : "";
const query = `*[_type=="product"${brandFilter}] | order(hubRank asc, _createdAt asc){title, "slug": slug.current, description, tagline, productType, "specs": specifications[]{label,value}, "skus": variants[].modelNumber, "img": mainImage.asset->url, "brandName": brand->name, _updatedAt}`;
const url = `https://${SANITY_PROJECT}.api.sanity.io/v2021-06-07/data/query/production?query=${encodeURIComponent(query)}`;
const res = await fetch(url);
const data = await res.json();
const products = (data.result || []).filter((p) => p.slug);

const distDir = join(WEB_DIR, "dist");
const shell = readFileSync(join(distDir, "index.html"), "utf8");

function esc(s) {
  return (s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function plain(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}
function desc(p) {
  const base = plain(p.description || p.tagline || "");
  if (base) return esc(base.slice(0, 155));
  const specStr = (p.specs || []).slice(0, 4).map((s) => `${s.label}: ${s.value}`).join(", ");
  const parts = [p.title, p.productType, specStr].filter(Boolean).join(" — ");
  return esc(parts.slice(0, 155));
}

function productBodyHtml(p) {
  const specs = (p.specs || []).slice(0, 5)
    .map((s) => `<li style="margin:4px 0"><span style="opacity:.55">${esc(s.label)}:</span> ${esc(s.value)}</li>`)
    .join("");
  const brand = p.brandName ? `<div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.55;margin-bottom:10px">${esc(p.brandName)}</div>` : "";
  const descText = esc(plain(p.description || p.tagline || "").slice(0, 280) || (p.specs || []).slice(0, 5).map((s) => `${s.label}: ${s.value}`).join(" · "));
  return (
    `<div style="max-width:640px;margin:60px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a">` +
    brand +
    `<h1 style="font-size:24px;line-height:1.25;margin:0 0 12px">${esc(p.title)}</h1>` +
    (descText ? `<p style="font-size:15px;line-height:1.6;opacity:.8;margin:0 0 14px">${descText}</p>` : "") +
    (specs ? `<ul style="font-size:14px;line-height:1.5;opacity:.85;list-style:none;padding:0;margin:0">${specs}</ul>` : "") +
    `</div>`
  );
}

function productJsonLd(p) {
  const canonical = `https://${DOMAIN}/products/${p.slug}/`;
  const sku = (p.skus || [])[0] || undefined;
  const product = {
    "@type": "Product",
    name: p.title,
    ...(plain(p.description || p.tagline) ? { description: plain(p.description || p.tagline) } : {}),
    ...(p.img ? { image: p.img } : {}),
    ...(sku ? { sku } : {}),
    brand: { "@type": "Brand", name: p.brandName || SITE_NAME },
    url: canonical,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      itemCondition: "https://schema.org/NewCondition",
      url: canonical,
      description: "Price on request (inquire)",
    },
  };
  return product;
}

function productHtml(p) {
  const title = esc(p.title);
  const description = desc(p);
  const canonical = `https://${DOMAIN}/products/${p.slug}/`;
  const ogImage = p.img ? `<meta property="og:image" content="${esc(p.img)}" />` : "";

  // --- head meta ---
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${title} — ${SITE_NAME}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/, `<meta property="og:type" content="product" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);

  if (p.img) {
    html = html.replace(/<meta\s+property="og:image"[^>]*\/>/, ogImage);
    html = html.replace("</head>", `<meta name="twitter:card" content="summary_large_image" />\n</head>`);
  }

  // --- merge JSON-LD: existing @graph + Product ---
  const ldMatch = html.match(/<script type="application\/ld\+json">(\{[\s\S]*?\})<\/script>/);
  if (ldMatch) {
    let graph = [];
    try {
      const obj = JSON.parse(ldMatch[1]);
      graph = obj["@graph"] || (obj["@type"] ? [obj] : []);
    } catch {
      graph = [];
    }
    graph.push(productJsonLd(p));
    const merged = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    html = html.replace(ldMatch[0], `<script type="application/ld+json">${merged}</script>`);
  }

  // --- body: inject product H1 + desc + specs into the static fallback block ---
  html = html.replace(
    /(<div id="root">)[\s\S]*?(<noscript>)/,
    `$1${productBodyHtml(p)}$2`
  );

  return html;
}

let written = 0;
for (const p of products) {
  const dir = join(distDir, "products", p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), productHtml(p));
  written++;
}

const staticPages = ["/", "/products", "/ecosystem", "/oem-odm", "/technical", "/contact"];
const lastmod = new Date().toISOString().slice(0, 10);
const urls = [
  ...staticPages.map((p) => `  <url><loc>https://${DOMAIN}${p}</loc><lastmod>${lastmod}</lastmod></url>`),
  ...products.map((p) => {
    const lm = (p._updatedAt || "").slice(0, 10) || lastmod;
    return `  <url><loc>https://${DOMAIN}/products/${p.slug}/</loc><lastmod>${lm}</lastmod></url>`;
  }),
];
writeFileSync(
  join(distDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);
console.log(`[prerender] ${DOMAIN}: ${written} products + sitemap written`);

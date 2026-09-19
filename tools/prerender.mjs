#!/usr/bin/env node
// Post-build PDP prerender + product sitemap generator.
// Runs after `vite build` (reads web/dist/index.html shell, injects per-product meta).
// Usage (via package.json postbuild or manually):
//   node tools/prerender.mjs --domain lumiparkgroup.com --site "LumiPark Group" [--brand BMC] [--web-dir web]
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
  console.error("usage: node tools/prerender.mjs --domain <d> --site <name> [--brand BMC] [--web-dir web]");
  process.exit(1);
}

const SANITY_PROJECT = "e5lza2t9";
const brandFilter = BRAND ? ` && brand->name == "${BRAND}"` : "";
const query = `*[_type=="product"${brandFilter}] | order(hubRank asc, _createdAt asc){title, "slug": slug.current, description, tagline, productType, "specs": specifications[]{label,value}, "img": mainImage.asset->url, "brandName": brand->name}`;
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
function desc(p) {
  const base = (p.description || p.tagline || "").replace(/\s+/g, " ").trim();
  if (base) return esc(base.slice(0, 155));
  // fallback: construct from title + productType + key specs
  const specStr = (p.specs || [])
    .slice(0, 4)
    .map((s) => `${s.label}: ${s.value}`)
    .join(", ");
  const parts = [p.title, p.productType, specStr].filter(Boolean).join(" — ");
  return esc(parts.slice(0, 155));
}

function productHtml(p) {
  const title = esc(p.title);
  const description = desc(p);
  const canonical = `https://${DOMAIN}/products/${p.slug}/`;
  const ogImage = p.img ? `<meta property="og:image" content="${esc(p.img)}" />\n    <meta name="twitter:card" content="summary_large_image" />\n    ` : "";
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description || p.tagline || "",
    ...(p.img ? { image: p.img } : {}),
    brand: { "@type": "Brand", name: p.brandName || SITE_NAME },
  });

  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${title} — ${SITE_NAME}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/, `<meta property="og:type" content="product" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);

  if (p.img) {
    html = html.replace(
      /<meta\s+property="og:image"[^>]*\/>/,
      `<meta property="og:image" content="${esc(p.img)}" />`
    );
  }
  html = html.replace("</head>", `<script type="application/ld+json">${ld}</script></head>`);
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
const urls = [
  ...staticPages.map((p) => `  <url><loc>https://${DOMAIN}${p}</loc></url>`),
  ...products.map((p) => `  <url><loc>https://${DOMAIN}/products/${p.slug}/</loc></url>`),
];
writeFileSync(
  join(distDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);
console.log(`[prerender] ${DOMAIN}: ${written} products + sitemap written`);

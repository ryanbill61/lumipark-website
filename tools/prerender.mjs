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
const query = `*[_type=="product"${brandFilter}] | order(hubRank asc, _createdAt asc){title, "slug": slug.current, description, tagline, productType, "category": category->title, "specs": specifications[]{label,value}, features, applications, warranty, "variants": variants[]{modelNumber, variantName, sku, powerSize, luminousFlux, efficacy, dimensions, inStock}, "img": mainImage.asset->url, "galleryImgs": gallery[].asset->url, "specSheetUrl": specSheet.asset->url, "installManualUrl": installManual.asset->url, "iesUrl": iesFile.asset->url, "cutSheetUrl": cutSheet.asset->url, "brandName": brand->name, hubSection, hubRank, seoTitle, seoKeywords, _updatedAt}`;
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
  const sku = (p.variants || []).map((v) => v.sku || v.modelNumber).filter(Boolean)[0] || undefined;
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

  // --- demote the <noscript> slogan <h1> to <p> (keep one H1 per page) ---
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, (block) =>
    block.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/, '<p$1>$2</p>')
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

// --- catalog.json (AI-readable product index) ---
function certifications(p) {
  const certs = new Set();
  const hay = [
    ...(p.features || []),
    ...(p.specs || []).map((s) => `${s.label} ${s.value}`),
    p.warranty || "",
  ].join(" ");
  for (const c of ["UL", "ETL", "DLC", "Energy Star", "CE", "cUL", "RoHS", "IP65", "IP66"]) {
    if (hay.toUpperCase().includes(c.toUpperCase())) certs.add(c);
  }
  return [...certs];
}
const catalog = {
  site: SITE_NAME,
  domain: DOMAIN,
  generatedAt: new Date().toISOString(),
  totalProducts: products.length,
  products: products.map((p) => ({
    slug: p.slug,
    url: `https://${DOMAIN}/products/${p.slug}/`,
    name: p.title,
    series: (p.title.match(/^(\d+\s*[Ss]eries)/) || [])[1] || null,
    brand: p.brandName || null,
    category: p.category || null,
    productType: p.productType || null,
    description: plain(p.description || p.tagline || "") || null,
    features: p.features || [],
    applications: p.applications || [],
    specifications: p.specs || [],
    skus: (p.variants || []).map((v) => ({
      sku: v.sku || v.modelNumber || null,
      model: v.modelNumber || null,
      name: v.variantName || null,
      power: v.powerSize || null,
      lumens: v.luminousFlux || null,
      efficacy: v.efficacy || null,
      dimensions: v.dimensions || null,
      inStock: v.inStock ?? null,
    })),
    images: [p.img, ...(p.galleryImgs || [])].filter(Boolean),
    specSheetUrl: p.specSheetUrl || null,
    installManualUrl: p.installManualUrl || null,
    iesUrl: p.iesUrl || null,
    cutSheetUrl: p.cutSheetUrl || null,
    certifications: certifications(p),
  })),
};
writeFileSync(join(distDir, "catalog.json"), JSON.stringify(catalog));

// --- catalog.md (Dify-knowledge-base-friendly Markdown) ---
function buildCatalogMd(title, prods) {
  const lines = [`# ${title}`, "", `> ${prods.length} products.`, ""];
  for (const p of prods) {
    lines.push(`## ${p.name}`);
    lines.push(`Product: ${p.name}`);
    lines.push(`- Brand: ${p.brand || "-"}`);
    lines.push(`- Category: ${p.category || "-"}`);
    lines.push(`- Product type: ${p.productType || "-"}`);
    if (p.series) lines.push(`- Series: ${p.series}`);
    lines.push(`- URL: ${p.url}`);
    if (p.description) lines.push(`- Description: ${p.description}`);
    if (p.applications.length) lines.push(`- Applications: ${p.applications.join(", ")}`);
    if (p.certifications.length) lines.push(`- Certifications: ${p.certifications.join(", ")}`);
    if (p.specifications.length) {
      lines.push("", "### Specifications");
      for (const s of p.specifications) lines.push(`- ${s.label}: ${s.value}`);
    }
    if (p.skus.length) {
      lines.push("", "### SKUs");
      for (const s of p.skus) {
        const bits = [s.sku, s.power && `power ${s.power}`, s.lumens && `${s.lumens}lm`, s.dimensions].filter(Boolean);
        lines.push(`- ${bits.join(" — ")}`);
      }
    }
    lines.push("", "---", "");
  }
  return lines.join("\n");
}
writeFileSync(join(distDir, "catalog.md"), buildCatalogMd(`${SITE_NAME} — Product Catalog`, catalog.products));

// Per-brand splits (smaller docs → better KB retrieval).
const brandCounts = new Map();
for (const p of catalog.products) {
  const b = p.brand || "Other";
  brandCounts.set(b, (brandCounts.get(b) || 0) + 1);
}
for (const [brand, count] of brandCounts) {
  const bprods = catalog.products.filter((p) => (p.brand || "Other") === brand);
  const fname = `catalog-${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  writeFileSync(join(distDir, fname), buildCatalogMd(`${SITE_NAME} — ${brand} Catalog`, bprods));
}
console.log(`[prerender] ${DOMAIN}: ${written} products + sitemap + catalog.json + catalog.md (+${brandCounts.size} brand splits) written`);

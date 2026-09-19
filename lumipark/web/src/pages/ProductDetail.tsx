import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct } from "@/lib/sanity";
import { client } from "@/lib/edgespark";
import type { Product } from "@/types";
import { Placeholder } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";

function specRow(label: string, value: string | null) {
  if (!value) return null;
  return (
    <div className="rule-bottom py-3 flex items-baseline justify-between gap-6">
      <span className="tabular text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</span>
      <span className="tabular text-sm text-right">{value}</span>
    </div>
  );
}

// stored as a JSON string of image URLs; tolerate a single URL or CSV too
function parseImages(v: string | null): string[] {
  if (!v) return [];
  if (v.trim().startsWith("[") || v.trim().startsWith("{")) {
    try {
      const arr = JSON.parse(v);
      return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function Img({ src, label, className }: { src?: string; label: string; className: string }) {
  if (!src) return <Placeholder label={label} className={className} />;
  return (
    <img
      src={src}
      alt={label}
      loading="lazy"
      className={`object-cover w-full h-full ${className}`}
    />
  );
}

function DownloadGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GALLERY_COUNT = 8;

const GALLERY_LABELS = [
  "Product",
  "Application",
  "Mounting",
  "Size",
  "Optics",
  "Lux",
  "Install",
  "Details",
];

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);

  // download modal state
  const [dlItem, setDlItem] = useState<{ label: string; cta: string; file: string | null } | null>(null);
  const [dlForm, setDlForm] = useState({ name: "", company: "", email: "" });
  const [dlStatus, setDlStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [dlError, setDlError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelected(0);
    setFieldIndex(0);
    fetchProduct(slug)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Product not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  usePageMeta(
    product ? `${product.title} — LumiPark Group` : "Products — LumiPark Group",
    product
      ? `${product.title}${product.brand ? ` by ${product.brand}` : ""} — full spec table, IES files and DLC listing. ${product.tagline || ""}`.trim()
      : "Indoor, outdoor and industrial LED fixtures with full spec tables, IES files and DLC listings.",
  );

  if (loading)
    return <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 text-ink-soft">Loading…</div>;
  if (error || !product)
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24">
        <p className="text-red-700 mb-4">{error || "Product not found"}</p>
        <Link to="/products" className="text-steel underline">← Back to products</Link>
      </div>
    );

  const variants = product.variants || [];
  const rawGallery = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...parseImages(product.gallery),
  ].slice(0, GALLERY_COUNT);
  const galleryImages = Array.from({ length: GALLERY_COUNT }, (_, i) => rawGallery[i] || "");
  const thumbIndices = galleryImages.map((_, i) => i);

  const appImages = parseImages(product.applicationImages);

  const downloads = [
    { label: "IES files", cta: "Download IES files", file: product.iesFile },
    { label: "Spec sheet", cta: "Get the spec sheet", file: product.specSheet },
    { label: "Install manual", cta: "Get the install manual", file: product.installManual },
  ];

  function openDownload(item: { label: string; cta: string; file: string | null }) {
    setDlItem(item);
    setDlStatus("idle");
    setDlError("");
  }

  async function submitDownload(e: React.FormEvent) {
    e.preventDefault();
    if (!dlItem) return;
    if (!dlForm.email) {
      setDlError("Work email is required.");
      return;
    }
    setDlStatus("submitting");
    setDlError("");
    let ok = false;
    try {
      const res = await client.api.fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dlForm.name,
          email: dlForm.email,
          company: dlForm.company,
          message: `Download request: ${dlItem.label} — ${product!.title}`,
          productSlug: product!.slug,
        }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    if (ok) {
      setDlStatus("done");
    } else {
      setDlError("Something went wrong. Please try again.");
      setDlStatus("error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-12 md:pt-16">
      <Link to="/products" className="text-sm text-ink-soft hover:text-ink">
        ← All products
      </Link>

      {/* Main: left = content flow (1fr), right = sticky conversion sidebar (400px) */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* LEFT — content flow */}
        <div className="min-w-0">
          {/* 1. Gallery */}
          <section>
            <div className="rounded-xl overflow-hidden border border-ink/10 bg-[#f5f8fb]">
              <Img
                src={galleryImages[selected]}
                label={`${product.title} — ${GALLERY_LABELS[selected] || "Product Image"}`}
                className="aspect-[4/3] w-full"
              />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-3 mt-4">
              {thumbIndices.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className="group flex flex-col items-stretch"
                  aria-label={`View ${GALLERY_LABELS[i] || `Photo ${i + 1}`}`}
                >
                  <span
                    className={`block aspect-square w-full rounded-lg overflow-hidden border transition-colors ${
                      i === selected ? "border-steel" : "border-transparent group-hover:border-blue/40"
                    }`}
                  >
                    {galleryImages[i] ? (
                      <img
                        src={galleryImages[i]}
                        alt={GALLERY_LABELS[i] || `Photo ${i + 1}`}
                        loading="lazy"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="block w-full h-full bg-ink" />
                    )}
                  </span>
                  <span className="mt-1.5 block text-xs text-center text-ink-soft tabular leading-none">
                    {GALLERY_LABELS[i] || `Photo ${i + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Description */}
          {product.description && (
            <section className="mt-10">
              <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-3">
                About this series
              </div>
              <p className="text-ink-soft leading-relaxed">{product.description}</p>
            </section>
          )}

          {/* 3. Spec table */}
          <section className="mt-10">
            <div className="mb-6">
              <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-2">
                Ordering Information &amp; Specifications
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Select by wattage — each row is an orderable SKU.
              </h2>
            </div>
            {variants.length === 0 ? (
              <div className="border-2 border-dashed border-ink/20 rounded-lg py-10 px-6 text-center">
                <p className="text-sm text-ink-soft">
                  Variant specifications pending update. Please request the spec sheet for details.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="spec-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Power</th>
                      <th className="num">Lumens</th>
                      <th className="num">Efficacy</th>
                      <th>Dimensions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr key={v.id}>
                        <td className="font-medium">{v.sku}</td>
                        <td>{v.power || "—"}</td>
                        <td className="num">{v.lumens || "—"}</td>
                        <td className="num">{v.efficacy || "—"}</td>
                        <td>{v.dimensions || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="md:hidden mt-3 text-xs text-ink-soft">← Scroll for the full specification table →</p>
            <p className="mt-4 text-sm text-ink-soft">
              IES files and spec sheets available on request — use the quote button to request the full
              data package for this series.
            </p>
          </section>

          {/* 4. In the Field — big-image carousel */}
          <section className="mt-10">
            <div className="mb-6">
              <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-2">
                In the Field
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Where these fixtures actually go in.
              </h2>
              <p className="mt-2 text-ink-soft">
                Warehouses, parking garages, storefronts. Real project photos land here as jobs ship.
              </p>
            </div>
            {appImages.length === 0 ? (
              <div className="rounded-xl overflow-hidden border border-ink/10">
                <Placeholder label="In the Field — project photos" className="aspect-video w-full" />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-ink/10 bg-[#f5f8fb]">
                <Img
                  src={appImages[fieldIndex]}
                  label={`${product.title} — application ${fieldIndex + 1}`}
                  className="aspect-video w-full"
                />
                {appImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFieldIndex((i) => (i - 1 + appImages.length) % appImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink/40 text-white hover:bg-ink/60 transition-colors flex items-center justify-center text-lg leading-none"
                      aria-label="Previous application photo"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldIndex((i) => (i + 1) % appImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink/40 text-white hover:bg-ink/60 transition-colors flex items-center justify-center text-lg leading-none"
                      aria-label="Next application photo"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {appImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFieldIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === fieldIndex ? "bg-white" : "bg-white/40"}`}
                          aria-label={`Go to application photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — sticky conversion sidebar */}
        <div className="min-w-0">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-3">
              {product.brand && (
                <span className="tabular text-xs uppercase tracking-[0.18em] text-white bg-steel px-2 py-0.5 rounded">
                  {product.brand}
                </span>
              )}
              <span className="tabular text-xs uppercase tracking-[0.18em] text-steel">
                {product.category}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
              {product.title}
            </h1>
            {product.tagline && <p className="mt-3 text-ink-soft">{product.tagline}</p>}

            <div className="mt-8">
              <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">
                Key specifications
              </div>
              {specRow("CCT", product.cct)}
              {specRow("CRI", product.cri)}
              {specRow("Beam angle", product.beamAngle)}
              {specRow("UGR", product.ugr)}
              {specRow("Input voltage", product.inputVoltage)}
              {specRow("IP rating", product.ipRating)}
              {specRow("Dimming", product.dimming)}
              {specRow("Certifications", product.certifications)}
            </div>

            <div className="mt-8">
              <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-3">
                Downloads
              </div>
              <div className="space-y-2">
                {downloads.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => openDownload(d)}
                    className="w-full flex items-center gap-3 border border-ink/15 rounded-lg px-4 py-3 text-left text-sm hover:border-steel transition-colors"
                  >
                    <span className="text-steel">
                      <DownloadGlyph />
                    </span>
                    <span className="font-medium">{d.label}</span>
                    <span className="ml-auto text-xs text-ink-soft">{d.file ? "Download" : "Request"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Link
                to={`/contact?product=${product.slug}&productTitle=${encodeURIComponent(product.title)}`}
                className="inline-block bg-steel text-white px-5 py-3 text-sm font-medium hover:bg-steel-deep transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Download request modal */}
      {dlItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => {
              setDlItem(null);
              setDlStatus("idle");
              setDlError("");
            }}
          />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            {dlStatus === "done" ? (
              <div className="text-center py-4">
                <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-3">Sent</div>
                <p className="text-ink-soft leading-relaxed">
                  Check your inbox in a minute — if it&apos;s not there, look in your spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDlItem(null);
                    setDlStatus("idle");
                  }}
                  className="mt-6 bg-steel text-white px-5 py-2.5 text-sm font-medium hover:bg-steel-deep transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitDownload} noValidate>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-1">Download</div>
                    <h3 className="text-lg font-semibold tracking-tight">{dlItem.cta}</h3>
                    <p className="text-xs text-ink-soft mt-1">{product.title}</p>
                    <p className="text-sm text-ink-soft mt-3">
                      Tell us where to send it — we&apos;ll email the files and can follow up with pricing on your project.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDlItem(null);
                      setDlStatus("idle");
                      setDlError("");
                    }}
                    className="text-ink-soft hover:text-ink"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1.5" htmlFor="dl-name">Full name</label>
                    <input
                      id="dl-name"
                      type="text"
                      placeholder="Full name"
                      value={dlForm.name}
                      onChange={(e) => setDlForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" htmlFor="dl-company">Company</label>
                    <input
                      id="dl-company"
                      type="text"
                      placeholder="Company"
                      value={dlForm.company}
                      onChange={(e) => setDlForm((f) => ({ ...f, company: e.target.value }))}
                      className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" htmlFor="dl-email">
                      Work email<span className="text-red-700 ml-1" aria-hidden>*</span>
                    </label>
                    <input
                      id="dl-email"
                      type="email"
                      placeholder="Work email"
                      value={dlForm.email}
                      onChange={(e) => setDlForm((f) => ({ ...f, email: e.target.value }))}
                      aria-invalid={!!dlError}
                      className={`w-full bg-white border px-3 py-2.5 text-sm focus:outline-none focus:border-steel ${
                        dlError ? "border-red-700" : "border-ink/15"
                      }`}
                    />
                  </div>
                </div>
                {dlError && <p className="mt-3 text-sm text-red-700">{dlError}</p>}
                <button
                  type="submit"
                  disabled={dlStatus === "submitting"}
                  className="mt-5 w-full bg-steel text-white px-5 py-3 text-sm font-medium hover:bg-steel-deep transition-colors disabled:opacity-60"
                >
                  {dlStatus === "submitting" ? "Sending…" : "Email me the files"}
                </button>
                <p className="mt-3 text-xs text-ink-soft">
                  We only use this to send your files and follow up. No mailing lists.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

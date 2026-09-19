import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/sanity";
import type { Product } from "@/types";
import { Placeholder, SectionHeading } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "commercial", label: "Commercial" },
  { id: "industrial", label: "Industrial" },
  { id: "outdoor", label: "Outdoor" },
];

export default function Products() {
  usePageMeta(
    "Products — LumiPark Group",
    "Indoor, outdoor and industrial LED fixtures with full spec tables, IES files and DLC listings. Request a line card.",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cat, setCat] = useState("all");
  const [ptype, setPtype] = useState("all");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const productTypes = useMemo(() => {
    const seen = new Set<string>();
    for (const p of products) if (p.productType) seen.add(p.productType);
    return Array.from(seen).sort();
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (ptype === "all" || p.productType === ptype),
      ),
    [products, cat, ptype],
  );

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24">
      <SectionHeading
        kicker="Products"
        title="Full specs on every SKU. Factory pricing on every quote."
        lead="Every SKU carries a structured spec table — plus IES files, spec sheets and install manuals. No vague claims."
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-4 py-2 text-sm border transition-colors ${
              cat === c.id
                ? "bg-ink text-bone border-ink"
                : "border-ink/20 text-ink-soft hover:border-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-10 flex-wrap items-center">
        <span className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft">Type</span>
        <button
          onClick={() => setPtype("all")}
          className={`px-3 py-1.5 text-xs border transition-colors ${
            ptype === "all"
              ? "bg-ink text-bone border-ink"
              : "border-ink/20 text-ink-soft hover:border-ink"
          }`}
        >
          All
        </button>
        {productTypes.map((t) => (
          <button
            key={t}
            onClick={() => setPtype(t)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              ptype === t
                ? "bg-ink text-bone border-ink"
                : "border-ink/20 text-ink-soft hover:border-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink-soft">Loading product families…</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="group block rounded-xl border border-[#E0E7ED] shadow-sm bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Placeholder label={p.title} className="mb-5 group-hover:opacity-90 transition-opacity" />
              <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">
                {p.category}
              </div>
              <h3 className="text-xl font-semibold tracking-tight group-hover:text-steel transition-colors">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.tagline}</p>
              <div className="mt-3 tabular text-xs text-steel">
                {p.variants?.length ?? 0} wattage variants →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

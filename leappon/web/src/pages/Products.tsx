import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/sanity";
import type { Product } from "@/types";
import { SectionHeading } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "pendants", label: "Pendants" },
  { id: "sconces", label: "Sconces" },
  { id: "desk-floor", label: "Desk & Floor" },
  { id: "ceiling-fans", label: "Ceiling Fans" },
  { id: "other", label: "Other" },
];

function categoryKey(p: Product): string {
  const hay = `${p.productType || ""} ${p.category || ""}`.toLowerCase();
  if (/(pendant|suspension|chandelier|drop)/.test(hay)) return "pendants";
  if (/(sconce|wall)/.test(hay)) return "sconces";
  if (/(desk|floor|table|task|reading)/.test(hay)) return "desk-floor";
  if (/fan/.test(hay)) return "ceiling-fans";
  return "other";
}

function WarmPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 bg-bone-2 border border-line rounded-xl" style={{ minHeight: 140 }}>
      <span className="tabular text-[11px] uppercase tracking-[0.18em] text-ink-soft px-2 text-center break-words leading-snug">
        [ {label} ]
      </span>
      <span className="tabular text-[9px] uppercase tracking-[0.2em] text-ink-soft/70">
        Photo coming soon
      </span>
    </div>
  );
}

export default function Products() {
  usePageMeta(
    "Collections — LEAPPON",
    "LEAPPON lighting collections — pendants, sconces, desk & floor and ceiling fans for the modern home.",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cat, setCat] = useState("all");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => cat === "all" || categoryKey(p) === cat),
    [products, cat],
  );

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-24">
      <SectionHeading
        kicker="Collections"
        title="Light, designed to live with you."
        lead="Every LEAPPON piece is warm, human-centred and built to be lived with — not just looked at."
      />

      <div className="flex gap-2 mb-10 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              cat === c.id
                ? "bg-steel text-white border-steel"
                : "border-line text-ink-soft hover:border-steel hover:text-steel"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink-soft">Loading collections…</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-ink-soft">No products in this collection yet.</p>
      )}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="card-soft card-hover block p-5"
            >
              <WarmPlaceholder label={p.title} />
              <div className="tabular text-[11px] uppercase tracking-[0.18em] text-ink-soft mt-4 mb-1.5">
                {CATEGORIES.find((c) => c.id === categoryKey(p))?.label ?? "Other"}
              </div>
              <h3 className="text-lg font-medium text-ink group-hover:text-steel transition-colors">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{p.tagline}</p>
              <div className="mt-3 tabular text-xs text-steel">
                {p.variants?.length ?? 0} variants →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

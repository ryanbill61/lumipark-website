import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { SectionHeading, Placeholder } from "@/components/Blocks";
import type { Article } from "@/types";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "technical", label: "Technical" },
  { value: "qc", label: "QC" },
  { value: "production", label: "Production" },
  { value: "management", label: "Management" },
];

const CATEGORY_LABEL: Record<string, string> = {
  technical: "Technical",
  qc: "QC",
  production: "Production",
  management: "Management",
};

export default function Technical() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<Article[]>(`/api/public/articles${category ? `?category=${category}` : ""}`)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category]);

  function selectCategory(value: string) {
    if (value) setSearchParams({ category: value });
    else setSearchParams({});
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24">
      <SectionHeading
        kicker="Technical"
        title="Technical resources & knowledge."
        lead="Whitepapers, QC standards, production processes and management insights — published by the LumiPark engineering team."
      />

      <div className="mt-10 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => selectCategory(c.value)}
            className={`px-4 py-2 text-sm border transition-colors ${
              category === c.value
                ? "bg-ink text-bone border-ink"
                : "border-ink/20 hover:border-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-10 rule-top pt-8">
        {loading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-ink-soft">
            No articles published in this category yet. Check back soon.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((a) => (
              <Link
                key={a.id}
                to={`/technical/${a.slug}`}
                className="group block rounded-xl border border-[#E0E7ED] shadow-sm bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {a.coverImage ? (
                  <img
                    src={a.coverImage}
                    alt={a.title}
                    className="aspect-[16/10] w-full object-cover border border-ink/10"
                  />
                ) : (
                  <Placeholder label={a.title} className="aspect-[16/10]" />
                )}
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="tabular uppercase tracking-[0.14em] text-steel">
                    {CATEGORY_LABEL[a.category] || a.category}
                  </span>
                  <span className="text-ink/30">·</span>
                  <span className="tabular text-ink-soft">
                    {a.publishDate ? new Date(a.publishDate).toLocaleDateString() : ""}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:text-steel transition-colors">
                  {a.title}
                </h2>
                {a.content && (
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                    {a.content.slice(0, 160)}
                    {a.content.length > 160 ? "…" : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

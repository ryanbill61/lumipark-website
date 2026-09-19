import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "@/lib/api";
import type { Article } from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  technical: "Technical",
  qc: "QC",
  production: "Production",
  management: "Management",
};

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setArticle(null);
    apiGet<Article>(`/api/public/articles/${slug}`)
      .then(setArticle)
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-24 pb-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">Article not found.</h1>
        <Link to="/technical" className="text-steel hover:underline">
          ← Back to Technical
        </Link>
      </div>
    );
  }

  if (!article) {
    return <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 text-ink-soft">Loading…</div>;
  }

  const attachments = article.attachments || [];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-24">
      <Link to="/technical" className="text-sm text-ink-soft hover:text-ink">
        ← All technical articles
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="tabular uppercase tracking-[0.14em] text-steel">
            {CATEGORY_LABEL[article.category] || article.category}
          </span>
          <span className="text-ink/30">·</span>
          <span className="tabular text-ink-soft">
            {article.publishDate ? new Date(article.publishDate).toLocaleDateString() : ""}
          </span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
          {article.title}
        </h1>
      </div>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="mt-8 w-full aspect-[16/9] object-cover border border-ink/10"
        />
      )}

      <div className="mt-8 rule-top pt-8 whitespace-pre-wrap text-ink-soft leading-relaxed">
        {article.content || ""}
      </div>

      {attachments.length > 0 && (
        <div className="mt-10 rule-top pt-8">
          <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-4">
            Attachments
          </div>
          <ul className="space-y-3">
            {attachments.map((att, i) => (
              <li key={i}>
                {att.kind === "image" ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-steel hover:underline text-sm"
                  >
                    <span className="tabular text-xs uppercase tracking-wider border border-ink/20 px-1.5 py-0.5 text-ink-soft">
                      IMG
                    </span>
                    {att.name || `Image ${i + 1}`}
                  </a>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-steel hover:underline text-sm"
                  >
                    <span className="tabular text-xs uppercase tracking-wider border border-ink/20 px-1.5 py-0.5 text-ink-soft">
                      PDF
                    </span>
                    {att.name || `Document ${i + 1}`}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

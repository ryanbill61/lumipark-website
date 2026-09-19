import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Article, ArticleAttachment } from "@/types";

const CATEGORIES = ["technical", "qc", "production", "management"] as const;

type ArticleDraft = {
  title: string;
  category: string;
  coverImage: string;
  content: string;
  status: string;
  attachmentsText: string;
};

const EMPTY: ArticleDraft = {
  title: "",
  category: "technical",
  coverImage: "",
  content: "",
  status: "draft",
  attachmentsText: "",
};

function parseAttachmentsText(text: string): ArticleAttachment[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [kind, name, ...rest] = line.split("|").map((s) => s.trim());
      const url = rest.join("|").trim();
      const parsedKind: "pdf" | "image" = kind === "image" ? "image" : "pdf";
      return { kind: parsedKind, name: name || "", url };
    })
    .filter((a) => a.url);
}

function attachmentsToText(attachments: ArticleAttachment[] | null): string {
  return (attachments || []).map((a) => `${a.kind}|${a.name}|${a.url}`).join("\n");
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState<ArticleDraft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiGet<Article[]>("/api/public/admin/articles")
      .then(setArticles)
      .catch(() => {});
  }, []);

  function set<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    if (!draft.title.trim() || !draft.category) {
      setMsg("Title and category are required.");
      return;
    }
    setBusy(true);
    setMsg("");
    const payload = {
      title: draft.title,
      category: draft.category,
      coverImage: draft.coverImage,
      content: draft.content,
      status: draft.status,
      attachments: parseAttachmentsText(draft.attachmentsText),
    };
    try {
      if (editingId) {
        await apiPut(`/api/public/admin/articles/${editingId}`, payload);
      } else {
        await apiPost("/api/public/admin/articles", payload);
      }
      setDraft(EMPTY);
      setEditingId(null);
      const rows = await apiGet<Article[]>("/api/public/admin/articles");
      setArticles(rows);
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this article?")) return;
    await apiDelete(`/api/public/admin/articles/${id}`);
    setArticles((a) => a.filter((x) => x.id !== id));
  }

  async function togglePublish(a: Article) {
    const next = a.status === "published" ? "draft" : "published";
    await apiPut(`/api/public/admin/articles/${a.id}`, { status: next });
    const rows = await apiGet<Article[]>("/api/public/admin/articles");
    setArticles(rows);
  }

  function startEdit(a: Article) {
    setEditingId(a.id);
    setDraft({
      title: a.title,
      category: a.category,
      coverImage: a.coverImage || "",
      content: a.content || "",
      status: a.status || "draft",
      attachmentsText: attachmentsToText(a.attachments),
    });
  }

  return (
    <section className="mt-16 rule-top pt-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-2">
            Technical articles
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Manage articles</h2>
        </div>
        {editingId && (
          <button onClick={() => { setEditingId(null); setDraft(EMPTY); }} className="text-sm text-ink-soft hover:text-ink">
            Cancel edit
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <form
          className="md:col-span-5 space-y-4"
          onSubmit={(e) => { e.preventDefault(); save(); }}
        >
          <div>
            <label className="block text-sm mb-2" htmlFor="a-title">Title</label>
            <input id="a-title" value={draft.title} onChange={(e) => set("title", e.target.value)}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel" />
          </div>
          <div>
            <label className="block text-sm mb-2" htmlFor="a-category">Category</label>
            <select id="a-category" value={draft.category} onChange={(e) => set("category", e.target.value)}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" htmlFor="a-cover">Cover image URL</label>
            <input id="a-cover" value={draft.coverImage} onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://… (or leave empty)"
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel" />
          </div>
          <div>
            <label className="block text-sm mb-2" htmlFor="a-content">Content (markdown / plain text)</label>
            <textarea id="a-content" rows={8} value={draft.content} onChange={(e) => set("content", e.target.value)}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel" />
          </div>
          <div>
            <label className="block text-sm mb-2" htmlFor="a-attach">
              Attachments — one per line: <span className="text-ink-soft">kind|name|url</span> (kind = pdf or image)
            </label>
            <textarea id="a-attach" rows={3} value={draft.attachmentsText} onChange={(e) => set("attachmentsText", e.target.value)}
              placeholder={"pdf|Product Datasheet|https://…\nimage|Lab Photo|https://…"}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel" />
          </div>
          <div>
            <label className="block text-sm mb-2" htmlFor="a-status">Status</label>
            <select id="a-status" value={draft.status} onChange={(e) => set("status", e.target.value)}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {msg && <p className="text-sm text-ink-soft">{msg}</p>}
          <button type="submit" disabled={busy}
            className="bg-steel text-white px-6 py-3 text-sm font-medium hover:bg-steel-deep transition-colors disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Update article" : "Create article"}
          </button>
        </form>

        <div className="md:col-span-7">
          {articles.length === 0 ? (
            <p className="text-ink-soft">No articles yet.</p>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <div key={a.id} className="rule-top pt-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="tabular text-xs uppercase tracking-wider text-steel">{a.category}</span>
                      <span className={`tabular text-xs uppercase tracking-wider px-1.5 py-0.5 border ${a.status === "published" ? "border-steel text-steel" : "border-ink/20 text-ink-soft"}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="font-medium truncate">{a.title}</div>
                  </div>
                  <button onClick={() => togglePublish(a)} className="text-xs border border-ink/20 px-2.5 py-1.5 hover:border-ink whitespace-nowrap">
                    {a.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => startEdit(a)} className="text-xs border border-ink/20 px-2.5 py-1.5 hover:border-ink whitespace-nowrap">
                    Edit
                  </button>
                  <button onClick={() => remove(a.id)} className="text-xs text-red-700 hover:underline whitespace-nowrap">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

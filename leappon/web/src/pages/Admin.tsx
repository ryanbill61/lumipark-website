import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { Lead } from "@/types";
import AdminArticles from "@/components/AdminArticles";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadError, setLoadError] = useState("");
  const [csvText, setCsvText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    apiGet<{ ok: boolean }>("/api/public/admin/me")
      .then((r) => setAuthed(!!r.ok))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed !== true) return;
    apiGet<Lead[]>("/api/public/admin/leads")
      .then(setLeads)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Failed to load leads"));
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const res = await apiPost<{ ok: boolean }>("/api/public/admin/login", {
        username,
        password,
      });
      if (res.ok) {
        setAuthed(true);
        setPassword("");
      }
    } catch (err) {
      setLoginError("Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await apiPost("/api/public/admin/logout", {}).catch(() => {});
    setAuthed(false);
    setLeads([]);
  }

  async function deleteLead(id: string) {
    if (!window.confirm("Delete this inquiry? This cannot be undone.")) return;
    try {
      await apiDelete(`/api/public/admin/leads/${id}`);
      setLeads((ls) => ls.filter((l) => l.id !== id));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function resendLead(id: string) {
    setLoadError("");
    try {
      const res = await apiPost<{ ok: boolean; error?: string | null }>(
        `/api/public/admin/leads/${id}/resend`,
        {},
      );
      if (res.ok) {
        setLeads((ls) =>
          ls.map((l) => (l.id === id ? { ...l, emailStatus: "sent", emailError: null } : l)),
        );
      } else {
        setLoadError(res.error || "Resend failed");
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to resend");
    }
  }

  async function importProducts() {
    if (!csvText.trim()) {
      setImportMsg("Paste your CSV first.");
      return;
    }
    setImporting(true);
    setImportMsg("");
    try {
      const res = await apiPost<{ ok: boolean; imported?: number }>(
        "/api/public/admin/products/import",
        { csv: csvText },
      );
      setImportMsg(`Imported ${res.imported ?? 0} product(s).`);
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  if (authed === null) {
    return <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 text-ink-soft">Checking session…</div>;
  }

  if (authed === false) {
    return (
      <div className="max-w-md mx-auto px-5 pt-24 pb-24">
        <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">Owner</div>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Admin login</h1>
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-sm mb-2" htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel"
              autoComplete="current-password"
            />
          </div>
          {loginError && <p className="text-sm text-red-700">{loginError}</p>}
          <button
            type="submit"
            disabled={busy}
            className="bg-steel text-white px-6 py-3 text-sm font-medium hover:bg-steel-deep transition-colors disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-12 md:pt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-3">Owner dashboard</div>
          <h1 className="text-3xl font-semibold tracking-tight">Inquiries & leads</h1>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/public/admin/leads/export"
            className="border border-ink/20 px-4 py-2.5 text-sm font-medium hover:border-ink transition-colors"
          >
            Export CSV
          </a>
          <button
            onClick={logout}
            className="bg-ink text-bone px-4 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {loadError && <p className="text-red-700 mb-4">{loadError}</p>}

      {leads.length === 0 && !loadError ? (
        <div className="rule-top pt-10 text-ink-soft">No inquiries yet. They will appear here as customers submit the form.</div>
      ) : (
        <div className="overflow-x-auto rule-top">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {["Date", "Name", "Email", "Company", "Phone", "Product", "Message", "Status", "Email", ""].map((h) => (
                  <th key={h} className="tabular text-xs uppercase tracking-[0.1em] text-ink-soft font-normal py-3 pr-4 border-b-2 border-ink/80 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="align-top border-b border-ink/10">
                  <td className="tabular py-3 pr-4 whitespace-nowrap text-ink-soft">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 pr-4">{l.name || "—"}</td>
                  <td className="py-3 pr-4">{l.email || "—"}</td>
                  <td className="py-3 pr-4">{l.company || "—"}</td>
                  <td className="py-3 pr-4">{l.phone || "—"}</td>
                  <td className="py-3 pr-4">{l.productSlug || "—"}</td>
                  <td className="py-3 pr-4 max-w-xs text-ink-soft">{l.message || "—"}</td>
                  <td className="py-3 pr-4">
                    <span className="tabular text-xs uppercase tracking-wider border border-ink/20 px-2 py-0.5">
                      {l.status || "new"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {l.emailStatus === "sent" ? (
                      <span className="text-green-700 text-xs">sent</span>
                    ) : l.emailStatus === "failed" ? (
                      <span className="text-red-700 text-xs" title={l.emailError || ""}>failed</span>
                    ) : (
                      <span className="text-ink-soft text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {l.emailStatus !== "sent" && (
                      <button
                        onClick={() => resendLead(l.id)}
                        className="text-xs text-blue-700 hover:underline whitespace-nowrap"
                      >
                        Resend
                      </button>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteLead(l.id)}
                      className="text-xs text-red-700 hover:underline whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="mt-16 rule-top pt-8">
        <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-2">Products</div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Import products via CSV</h2>
        <p className="text-sm text-ink-soft mb-4">
          One row per SKU. Same <code>product_family</code> groups into one product family. Columns (<b>bold = required</b>):
          <br />
          <code className="text-xs">
            <b>product_family</b>, brand, <b>category</b>, product_type, tagline, description, cct, cri, beam_angle, ugr, ip_rating, dimming, input_voltage, certifications, warranty, features, applications, gallery_images, spec_sheet, install_manual, <b>sku</b>, power_w, lumens, efficacy, dimensions_mm, ies_file, cut_sheet
          </code>
        </p>
        <textarea
          rows={8}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={'product_family,category,sku,power_w,lumens,efficacy,dimensions_mm\nAvalon Panel,commercial,BPHLED14,14,1264,90,295×295×8'}
          className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-steel"
        />
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={importProducts}
            disabled={importing}
            className="bg-steel text-white px-5 py-2.5 text-sm font-medium hover:bg-steel-deep transition-colors disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import products"}
          </button>
          {importMsg && <span className="text-sm text-ink-soft">{importMsg}</span>}
        </div>
      </section>

      <AdminArticles />
    </div>
  );
}


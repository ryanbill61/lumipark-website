import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { client } from "@/lib/edgespark";
import { SectionHeading } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: false },
  { name: "company", label: "Company", type: "text", required: false },
  { name: "email", label: "Work email", type: "email", required: true },
] as const;

const CATEGORIES = ["Commercial", "Industrial", "Outdoor", "OEM-ODM", "Other"];

const FAQ = [
  {
    q: "What is your MOQ?",
    a: "Standard MOQ is 100–500 units per SKU depending on the series. Mixed-container MOQs are negotiable for new accounts — we consolidate across 50+ factories in one shipment.",
  },
  {
    q: "Can I get samples?",
    a: "Standard samples ship in about 7 days; customized prototypes are quoted per project timeline. Every sample ships with its photometric report.",
  },
  {
    q: "What are your lead times and trade terms?",
    a: "Mass production runs 25–30 days after deposit and approval. EXW, FOB, CIF and DDP to US/Canadian addresses, including duty-paid DDP programs.",
  },
  {
    q: "What certifications do you hold?",
    a: "Core families carry UL or ETL listings (UL 1598/8750), DLC, FCC Part 15 and RoHS; many indoor SKUs are ENERGY STAR. Our in-house lab issues LM-79/LM-80 reports and IES/LDT files.",
  },
  {
    q: "Payment and warranty?",
    a: "We&rsquo;ll spell out payment terms in the quote. All products carry a 5-year warranty, honored by our export brand with advance-replacement programs for distributors.",
  },
];

export default function Contact() {
  usePageMeta(
    "Contact — LumiPark Group",
    "Send a BOM or a competitor's cut sheet — pricing, IES files and lead times back within 48 hours.",
  );
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get("product") || "";
  const productTitle = searchParams.get("productTitle") || "";
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function update(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.email) next.email = "Work email is required.";
    if (!form.category) next.category = "Please select a product category.";
    setErrors(next);
    if (Object.keys(next).length) {
      setError("Please complete the required fields below.");
      return;
    }
    setStatus("submitting");
    setError("");
    let ok = false;
    const message = [
      form.message,
      form.category ? `Product category: ${form.category}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const res = await client.api.fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          message,
          productSlug,
        }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    if (ok) {
      setStatus("done");
    } else {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-24 pb-24 text-center">
        <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">Received</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Inquiry received.
        </h1>
        <p className="mt-4 text-ink-soft">
          Thanks — a category specialist will reply within 24 hours. Check your inbox for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24">
      <SectionHeading
        kicker="Contact / RFQ"
        title="Talk to a category specialist — not a sales queue."
        lead="Your inquiry routes directly to the team that runs the relevant park. Expect pricing, IES files and a lead-time plan within 48 hours."
      />

      {productTitle && (
        <div className="mb-8 flex items-center gap-3">
          <span className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft">
            Inquiring about
          </span>
          <span className="bg-bone-2 px-3 py-1.5 text-sm font-medium">{productTitle}</span>
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-12">
        <form className="md:col-span-7" onSubmit={submit} noValidate>
          <div className="grid sm:grid-cols-2 gap-5">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label className="block text-sm mb-2" htmlFor={f.name}>
                  {f.label}
                  {f.required && <span className="text-red-700 ml-1" aria-hidden>*</span>}
                </label>
                <input
                  id={f.name}
                  type={f.type}
                  value={form[f.name] || ""}
                  onChange={(e) => update(f.name, e.target.value)}
                  aria-invalid={!!errors[f.name]}
                  className={`w-full bg-white border px-3 py-2.5 text-sm focus:outline-none focus:border-steel ${
                    errors[f.name] ? "border-red-700" : "border-ink/15"
                  }`}
                />
                {errors[f.name] && (
                  <p className="mt-1.5 text-xs text-red-700">{errors[f.name]}</p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm mb-2" htmlFor="category">
                Product category
                <span className="text-red-700 ml-1" aria-hidden>*</span>
              </label>
              <select
                id="category"
                value={form.category || ""}
                onChange={(e) => update("category", e.target.value)}
                aria-invalid={!!errors.category}
                className={`w-full bg-white border px-3 py-2.5 text-sm focus:outline-none focus:border-steel ${
                  errors.category ? "border-red-700" : "border-ink/15"
                }`}
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-xs text-red-700">{errors.category}</p>
              )}
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm mb-2" htmlFor="message">
              Message / requirements
            </label>
            <textarea
              id="message"
              rows={6}
              value={form.message || ""}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Send a BOM or a competitor's cut sheet — we'll reply with pricing, IES files and lead times."
              className="w-full bg-white border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-steel"
            />
          </div>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-6 bg-steel text-white px-6 py-3 text-sm font-medium hover:bg-steel-deep transition-colors disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Submit inquiry"}
          </button>
        </form>

        <aside className="md:col-span-5 rule-top md:border-t-0 pt-6 md:pt-0 md:border-l md:border-ink/15 md:pl-12 text-sm text-ink-soft space-y-6">
          <div>
            <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">Headquarters</div>
            <p>Pearl River Delta, Guangdong, China — three parks, one visit, full audit itineraries.</p>
          </div>
          <div>
            <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">North America hours</div>
            <p>Overlap coverage 8:00–11:00 AM ET for live calls.</p>
          </div>
          <div>
            <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">Certifications</div>
            <p>UL 1598/8750 · ETL · DLC · Energy Star · FCC · RoHS · ISO 9001 · LM-79/80</p>
          </div>
          <div>
            <div className="tabular text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">Business terms</div>
            <p>MOQ 100–500 · 5-year warranty · EXW / FOB / CIF / DDP</p>
          </div>
        </aside>
      </div>

      <section className="mt-20 max-w-3xl">
        <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">FAQ</div>
        <h2 className="text-2xl font-semibold tracking-tight mb-8">Buyers ask us these first.</h2>
        <div className="space-y-6">
          {FAQ.map((f) => (
            <div key={f.q} className="rule-top pt-5">
              <h3 className="font-semibold mb-2">{f.q}</h3>
              <p className="text-ink-soft leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

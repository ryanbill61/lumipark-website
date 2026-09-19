import { Link } from "react-router-dom";
import { SectionHeading, Stat } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";

const STATS = [
  { value: "48h", label: "Quotation with full BOM & DFM notes" },
  { value: "50+", label: "Partner factories, no capacity ceiling" },
  { value: "25–30-day", label: "Mass production after approval" },
  { value: "95%", label: "On-time delivery across the parks (2025)" },
];

const WORKFLOW = [
  {
    title: "Discovery & NDA",
    body: "Requirements, target price and compliance scope — under NDA from day one.",
  },
  {
    title: "DFM & Quotation",
    body: "Engineering review within 48h: thermal, optics, driver and cost-down options.",
  },
  {
    title: "Prototyping",
    body: "CNC/3D-printed prototypes, built and photometric-tested in-house.",
  },
  {
    title: "Test & Certify",
    body: "In-house LM-79 + reliability; UL/ETL/DLC submissions managed for you.",
  },
  {
    title: "Mass Production",
    body: "25–30 days, 100% aging, consolidated QC and loading across categories.",
  },
];

const VERTICAL = [
  {
    stage: "Stage 01 · Park C",
    title: "Die-Casting & Metalworking",
    body: "Aluminum die-casting, extrusion and stamping inside the park.",
  },
  {
    stage: "Stage 02 · Park C",
    title: "CNC & Powder Coating",
    body: "Precision machining plus powder-coat lines — custom RAL finishes without outsourcing.",
  },
  {
    stage: "Stage 03 · Park C → A/B",
    title: "Drivers, Optics & SMT",
    body: "Driver programming, lens optics and SMT lines feed the assembly campuses directly.",
  },
  {
    stage: "Stage 04 · Park A/B",
    title: "Assembly & Aging",
    body: "Final assembly, 100% burn-in, photometric sampling and export packing under one roof.",
  },
];

const MATRIX = [
  ["Photometrics", "CCT 2200K–6500K · CRI 70/80/90+ · beam angle swaps · UGR-optimized optics", "+0–5 days"],
  ["Electrical", "0–10V / DALI-2 / Triac · sensor integration · emergency packs · 347/480V", "+0–7 days"],
  ["Housing & Finish", "Custom RAL powder coat · anodizing · modified brackets & mounting", "+5–10 days"],
  ["Tooling (New Housing)", "New die-cast or extrusion tooling via Park C metalworking factories", "Quoted per project"],
  ["Branding", "Private label · laser-marked logos · custom cartons & manuals", "+0–3 days"],
  ["Smart Controls", "NEMA/Zhaga nodes · photocells · motion/daylight sensors · app ecosystems", "+5–10 days"],
] as const;

const DIFFERENCE = [
  {
    title: "No capacity ceiling",
    body: "When one line fills, volume shifts to sister factories inside the parks.",
  },
  {
    title: "No vendor telephone",
    body: "Housings, drivers and optics are made by neighbors under our QC, not strangers.",
  },
  {
    title: "Cost-down built in",
    body: "The BOM is sourced inside the cluster, so custom doesn't carry a premium price.",
  },
  {
    title: "IP protection",
    body: "NDAs, segregated tooling storage and serialized mold ownership records.",
  },
];

export default function OEM() {
  usePageMeta(
    "OEM / ODM — LumiPark Group",
    "Custom LED lighting built inside our parks — DFM in 48h, in-house LM-79, UL/ETL/DLC handled for you.",
  );
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24">
      <div className="max-w-3xl">
        <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">
          OEM / ODM & Capabilities
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          Your custom program, built on an entire supply chain.
        </h1>
        <p className="mt-5 text-ink-soft text-lg leading-relaxed">
          When your supplier owns the industrial park, &ldquo;custom&rdquo; stops meaning
          &ldquo;slow.&rdquo; All the metalwork, drivers and optics are made in the parks, so a
          custom job doesn&rsquo;t bounce between five vendors and three cities.
        </p>
      </div>

      <section className="mt-16 rule-top pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
          {STATS.map((s) => (
            <Stat key={s.value} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="The workflow"
          title="From spec sheet to container in five steps."
          lead="A dedicated program manager runs your project across all three parks — one contact, one timeline, one QC standard."
        />
        <div className="mt-12 grid md:grid-cols-5 gap-4">
          {WORKFLOW.map((w, i) => (
            <div key={w.title} className="bg-bone p-6 rounded-xl shadow-sm border border-[#E0E7ED]">
              <div className="tabular text-xs text-steel mb-3">0{i + 1}</div>
              <h3 className="text-base font-semibold mb-2">{w.title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="In-park vertical chain"
          title="Why custom is fast here."
          lead="Every stage of a luminaire lives inside the parks — no cross-country outsourcing, no lost weeks between vendors."
        />
        <div className="mt-12 space-y-4">
          {VERTICAL.map((v) => (
            <div key={v.title} className="bg-bone p-6 rounded-xl shadow-sm border border-[#E0E7ED] grid md:grid-cols-12 gap-4 items-baseline">
              <div className="md:col-span-3 tabular text-xs uppercase tracking-[0.16em] text-ink-soft">
                {v.stage}
              </div>
              <div className="md:col-span-4 text-lg font-semibold">{v.title}</div>
              <div className="md:col-span-5 text-ink-soft leading-relaxed">{v.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="Customization matrix"
          title="What we can modify — and what it costs you in time."
          lead="Typical lead-time impact on top of standard production. Combinations quoted case-by-case."
        />
        <div className="mt-12 overflow-x-auto rule-top rule-bottom">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left">
                <th className="py-3 pr-6 tabular text-xs uppercase tracking-[0.14em] text-ink-soft">
                  Customization area
                </th>
                <th className="py-3 pr-6 tabular text-xs uppercase tracking-[0.14em] text-ink-soft">
                  Options
                </th>
                <th className="py-3 tabular text-xs uppercase tracking-[0.14em] text-ink-soft text-right">
                  Typical lead impact
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row[0]} className="rule-top">
                  <td className="py-4 pr-6 font-semibold align-top">{row[0]}</td>
                  <td className="py-4 pr-6 text-ink-soft align-top">{row[1]}</td>
                  <td className="py-4 text-right tabular whitespace-nowrap align-top">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="The park-owner difference"
          title="Why brands OEM with us instead of a single factory."
        />
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {DIFFERENCE.map((d) => (
            <div key={d.title} className="bg-bone p-8 rounded-xl shadow-sm border border-[#E0E7ED]">
              <h3 className="text-lg font-semibold mb-3">{d.title}</h3>
              <p className="text-ink-soft leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-20 rule-top pt-10">
        <SectionHeading
          kicker="Start a program"
          title="Send us a drawing, a sample, or a competitor's cut sheet."
          lead="We'll return a DFM review, unit pricing and a prototype plan within 48 hours — under NDA."
        />
        <Link
          to="/contact"
          className="inline-block bg-steel text-white px-5 py-3 text-sm font-medium hover:bg-steel-deep transition-colors"
        >
          Start your OEM program
        </Link>
      </div>
    </div>
  );
}

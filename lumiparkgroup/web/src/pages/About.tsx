import { Link } from "react-router-dom";
import { SectionHeading, Placeholder } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";

const MILESTONES = [
  { value: "1990", label: "Founded" },
  { value: "30+", label: "Years of lighting manufacturing" },
  { value: "30+", label: "Years in North America" },
  { value: "ISO 9001:2015", label: "Certified facilities" },
];

const PARKS = [
  {
    name: "Park A — Commercial",
    area: "12,000 m²",
    factories: "10",
    focus: "The indoor-lighting park — troffers, panels, downlights, track and linear systems.",
  },
  {
    name: "Park B — Outdoor",
    area: "18,000 m²",
    factories: "15",
    focus: "Roadway, area, flood and landscape luminaires — photometry verified on every family in our in-house lab.",
  },
  {
    name: "Park C — Components",
    area: "53,000 m²",
    factories: "25",
    focus: "The components park — housings, drivers, optics and poles that feed Parks A and B.",
  },
];

const MANUFACTURING = [
  {
    title: "In-house photometric lab",
    body: "Integrating sphere + goniophotometer — LM-79 reports and IES/LDT files issued in-house.",
  },
  {
    title: "Reliability testing",
    body: "Thermal, IP/IK, salt-spray, vibration and switch-cycle testing on-site.",
  },
  {
    title: "2 R&D centers, 40+ engineers",
    body: "Optics, thermal management, drivers and smart controls.",
  },
  {
    title: "Certification support",
    body: "UL/ETL witness testing coordination, DLC submissions handled for you.",
  },
];

const QC_GATES = [
  {
    title: "IQC",
    body: "Incoming inspection on LEDs, drivers, housings and optics — supplier lot traceability.",
  },
  {
    title: "SMT & IPQC",
    body: "AOI after reflow; in-process checks at every assembly station.",
  },
  {
    title: "100% Aging",
    body: "4–8 hour burn-in at full load on every luminaire — not a sample.",
  },
  {
    title: "Photometric Sampling",
    body: "Integrating sphere & gonio verification against published IES data per lot.",
  },
  {
    title: "FQC / OQC",
    body: "Final and outgoing inspection with AQL sampling before container loading.",
  },
];

const CERTS =
  "UL 1598/8750 · ETL Listed · DLC · ENERGY STAR · FCC Part 15 · RoHS · ISO 9001:2015 · LM-79/LM-80";

export default function About() {
  usePageMeta(
    "Our Ecosystem — LumiPark Group",
    "Inside LumiPark's three lighting parks — 100,000 m², 50+ resident factories, one ISO 9001 QC standard from IQC to OQC.",
  );
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24">
      <div className="max-w-3xl">
        <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">
          About / Our Ecosystem
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          Three Parks, 50+ Factories, One QC Standard
        </h1>
        <p className="mt-5 text-ink-soft text-lg leading-relaxed">
          Three specialized industrial parks. 50+ resident factories. One in-house manufacturing
          core. One quality standard across all of it.
        </p>
      </div>

      <section className="mt-14 rule-top rule-bottom py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
          {MILESTONES.map((m) => (
            <div key={m.value}>
              <div className="text-2xl md:text-3xl font-semibold tabular tracking-tight">
                {m.value}
              </div>
              <div className="mt-1 text-xs text-ink-soft uppercase tracking-[0.14em]">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="The brand story"
          title="We didn't join the cluster. We built it."
        />
        <div className="mt-8 max-w-3xl space-y-5 text-ink-soft leading-relaxed">
          <p>
            LumiPark began as a single lighting factory in 1990. Thirty-six years of manufacturing
            later, one conviction has only grown stronger — the biggest risk in offshore sourcing
            isn&rsquo;t price, it&rsquo;s fragmentation.
          </p>
          <p>
            So over the years we built out three parks in the Pearl River Delta and brought in
            resident factories that agreed to run our QC and paperwork standards — the ones that
            couldn&rsquo;t, we didn&rsquo;t keep.
          </p>
          <p>
            Today the parks host 50+ factories across 100,000 m² — while our own manufacturing core
            still builds the hero SKUs our brand is known for. For buyers, the result is unusual:
            the depth of an entire industry cluster, with a single contract, a single QC regime, and
            a single accountable name on the label. Today our lighting reaches the market under two
            brands — LEAPPON and BMC — both built on the LumiPark manufacturing system.
          </p>
          <p>
            Our commitment to North America is simple, and it is 30+ years old: brand-level
            documentation, honest photometrics, and capacity that scales with your roll-outs — not
            against them.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="The brands"
          title="One Group. Multiple Brands."
          lead="LumiPark Group is the manufacturing system — three parks, 50+ factories, one QC standard. LEAPPON and BMC are the brands that take it to market, with more to come."
        />
        <div className="mt-8 flex items-center gap-4 flex-wrap">
          <span className="tabular text-sm uppercase tracking-[0.14em] text-ink-soft">LumiPark Group</span>
          <span className="text-steel">→</span>
          <span className="bg-steel text-white px-4 py-2 text-sm font-medium">LEAPPON</span>
          <span className="bg-steel text-white px-4 py-2 text-sm font-medium">BMC</span>
          <span className="border border-dashed border-ink/30 px-4 py-2 text-sm text-ink-soft">Future brands</span>
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="Manufacturing power"
          title="An in-house lab behind every claim."
        />
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {MANUFACTURING.map((m) => (
            <div key={m.title} className="bg-bone p-8 rounded-xl shadow-sm border border-[#E0E7ED]">
              <h3 className="text-lg font-semibold mb-3">{m.title}</h3>
              <p className="text-ink-soft leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          kicker="Unified quality control"
          title="One QC standard — ours and every resident factory's."
          lead="The same five gates apply to our own lines and to all 50+ partner factories inside the parks. Audited to ISO 9001:2015."
        />
        <div className="mt-12 space-y-4">
          {QC_GATES.map((g, i) => (
            <div key={g.title} className="bg-bone p-6 rounded-xl shadow-sm border border-[#E0E7ED] grid md:grid-cols-12 gap-4 items-baseline">
              <div className="md:col-span-2 tabular text-xs text-steel">0{i + 1}</div>
              <div className="md:col-span-4 text-lg font-semibold">{g.title}</div>
              <div className="md:col-span-6 text-ink-soft leading-relaxed">{g.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <SectionHeading
          kicker="The industrial parks"
          title="Three parks. Three specializations. One standard."
          lead="Every resident factory is audited against our QC and export-documentation requirements — the parks are our supply base, and yours."
        />
        <div className="grid md:grid-cols-3 gap-8">
          {PARKS.map((p) => (
            <div key={p.name} className="rule-top pt-6">
              <Placeholder label={`${p.name} — imagery`} className="mb-6" />
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="tabular text-sm text-ink-soft mb-3 mt-2">
                {p.area} · {p.factories} factories
              </div>
              <p className="text-ink-soft leading-relaxed">{p.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rule-top pt-10">
        <SectionHeading
          kicker="North America-ready"
          title="Documentation that survives a spec review."
          lead="LM-79 reports, IES/LDT files, UL/ETL certificates and DLC QPL listings — issued with every quotation, not on request after the fact."
        />
        <p className="mt-8 tabular text-sm text-ink-soft leading-relaxed">{CERTS}</p>
      </section>

      <div className="mt-20 rule-top pt-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <p className="text-ink-soft max-w-xl">
          Book an on-site park tour or a live video audit — walk the lines, meet the QC team, and
          check the lab data in real time.
        </p>
        <Link
          to="/contact"
          className="bg-steel text-white px-5 py-3 text-sm font-medium hover:bg-steel-deep transition-colors"
        >
          Book an Audit
        </Link>
      </div>
    </div>
  );
}

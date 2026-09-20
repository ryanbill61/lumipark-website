import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SectionHeading, Stat } from "@/components/Blocks";
import { usePageMeta } from "@/lib/usePageMeta";
import { fetchFeaturedProducts, fetchSiteSettings } from "@/lib/sanity";
import type { Product } from "@/types";
import type { SiteSettings } from "@/lib/sanity";

const TRUST = ["UL", "ETL", "DLC", "Energy Star", "FCC", "RoHS", "ISO 9001"];

const STATS = [
  { value: "3", label: "Specialized lighting industrial parks" },
  { value: "100,000 m²", label: "Total park & facility area" },
  { value: "50+", label: "Resident partner factories" },
  { value: "30+", label: "Years in manufacturing" },
];

type StatItem = { value?: string; label?: string };
type CardItem = { title?: string; body?: string };

const ECOSYSTEM = [
  {
    title: "Source your whole BOM inside one cluster",
    body: "Drivers, optics, housings and boards are all made in the parks, so you pay factory prices without the middleman freight legs.",
  },
  {
    title: "Mix categories in one container",
    body: "Indoor, outdoor, industrial and components ship together. When one line is full, we move the order to a sister factory — your roll-out doesn't wait.",
  },
  {
    title: "Same QC on every factory, ours or not",
    body: "IQC → in-process → 100% aging → photometric sampling → OQC. The resident factories run it too, or they don't stay in the park.",
  },
];

const MANUFACTURING = [
  {
    title: "2 R&D centers, 40+ engineers",
    body: "Optics, thermals, drivers and smart controls designed in-house.",
  },
  {
    title: "In-house photometric lab",
    body: "Integrating sphere + goniophotometer — IES/LDT files issued with every quote.",
  },
  {
    title: "100% aging test",
    body: "4–8 h burn-in on every luminaire before packing, no sampling shortcuts.",
  },
  {
    title: "Vertical chain on-site",
    body: "Die-casting, CNC, powder coating, SMT and assembly within the parks.",
  },
];

export default function Home() {
  usePageMeta(
    "LumiPark Group — LED Lighting, Made Across Three Industrial Parks",
    "LumiPark Group runs three LED lighting industrial parks in Guangdong with 50+ factories, 100,000 m² of production space, in-house photometrics, and 30+ years of manufacturing. UL, ETL, DLC.",
  );
  const [featured, setFeatured] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    fetchFeaturedProducts().then(setFeatured).catch(() => {});
    fetchSiteSettings("hub").then(setSettings).catch(() => setSettings(null));
  }, []);
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-28 pb-16">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">
              LumiPark Group — Lighting Supply Chain Owner
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              {settings?.hero_h1 || "LED lighting, made across three industrial parks we own and run."}
            </h1>
          </div>
          <div className="md:col-span-4 md:border-l md:border-ink/15 md:pl-8">
            <p className="text-ink-soft text-lg leading-relaxed">
              {settings?.hero_sub ||
                "3 industrial parks. 100,000㎡ of production space. Over 50 factories. 30+ years on the manufacturing floor. We power lighting projects across North America, Europe, and Asia."}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/ecosystem"
                className="bg-steel text-white px-5 py-3 text-sm font-medium hover:bg-steel-deep transition-colors"
              >
                Explore the Ecosystem
              </Link>
              <Link
                to="/contact"
                className="border border-ink/20 px-5 py-3 text-sm font-medium hover:border-ink transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 rule-top rule-bottom py-5 flex flex-wrap items-center gap-x-10 gap-y-3">
          <span className="text-xs text-ink-soft uppercase tracking-[0.18em]">Trusted certifications</span>
          {TRUST.map((t) => (
            <span key={t} className="tabular text-lg font-medium">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Scale */}
      <section className="bg-bone-2">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <SectionHeading
            kicker="Our Scale"
            title="Manufacturing depth without bottlenecks."
            lead="Owning the parks — not just a factory — means capacity and product-line breadth are not constraints for your program."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {((settings?.stats as StatItem[] | undefined) || STATS).map((s) => (
              <Stat key={s.label} value={s.value || ""} label={s.label || ""} />
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <SectionHeading
          kicker="The Ecosystem"
          title="Landlord, manufacturer, and the brand on the box — all us."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {((settings?.ecosystem_cards as CardItem[] | undefined) || ECOSYSTEM).map((e) => (
            <div key={e.title} className="bg-bone p-8 rounded-xl shadow-sm border border-[#E0E7ED]">
              <h3 className="text-lg font-semibold mb-3">{e.title}</h3>
              <p className="text-ink-soft leading-relaxed">{e.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manufacturing Power */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <SectionHeading
          kicker="Manufacturing Power"
          title={settings?.mfg_h2 || "Core products, built in-house. Everything else, built next door."}
          lead={settings?.mfg_lead ||
            "Direct from our own factories — 50+ facilities across three wholly-owned industrial parks, giving you direct control over quality and lead times. Our own lines run the volume and hero SKUs; the surrounding park ecosystem covers the long tail — all under one QC regime."}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {((settings?.manufacturing_cards as CardItem[] | undefined) || MANUFACTURING).map((m) => (
            <div key={m.title} className="bg-bone p-8 rounded-xl shadow-sm border border-[#E0E7ED]">
              <h3 className="text-lg font-semibold mb-3">{m.title}</h3>
              <p className="text-ink-soft leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured & New (母舰精选橱窗) */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <SectionHeading
          kicker="Featured & New"
          title={settings?.brands_h2 || "A curated look at what we make."}
          lead={settings?.brands_copy ||
            "A hand-picked selection from our brands. Full catalogs, specs and IES downloads live on each brand site."}
        />
        {featured.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://bmclighting.com"
              className="bg-[#f5f5f7] p-8 rounded-xl shadow-sm border border-[#d1d1d1] group"
            >
              <div className="tabular text-xs uppercase tracking-[0.2em] text-[#2556B6] mb-3">BMC</div>
              <h3 className="text-xl font-semibold">Commercial & Architectural</h3>
              <p className="mt-2 text-ink-soft">Full catalog, spec tables, IES downloads.</p>
              <span className="inline-block mt-4 text-sm text-[#2556B6]">Explore BMC →</span>
            </a>
            <a
              href="https://leappon.com"
              className="bg-[#FAF9F7] p-8 rounded-2xl shadow-sm border border-[#E4DFD7] group"
            >
              <div className="tabular text-xs uppercase tracking-[0.2em] text-[#8C7861] mb-3">LEAPPON</div>
              <h3 className="text-xl font-semibold">Design & Residential</h3>
              <p className="mt-2 text-ink-soft">Warm, human-centred lighting for the home.</p>
              <span className="inline-block mt-4 text-sm text-[#8C7861]">Explore LEAPPON →</span>
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <a
                key={p.id}
                href={`https://${p.brand === "LEAPPON" ? "leappon.com" : "bmclighting.com"}/products/${p.slug}`}
                className="bg-bone p-6 rounded-xl shadow-sm border border-[#E0E7ED] hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="tabular text-xs uppercase tracking-[0.18em] text-steel mb-2">
                  {p.brand}
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.tagline}</p>
                <span className="inline-block mt-3 tabular text-xs text-steel">View details →</span>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Product teaser */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-8">
        <div className="rule-top pt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-3">Products</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {settings?.terms_h2 || "Engineered spec sheets, not shopping carts."}
            </h2>
            <p className="mt-3 text-ink-soft max-w-xl">
              {settings?.terms_copy ||
                "Every product ships with a structured Ordering Information table — wattage variants, photometric specs, and IES / spec-sheet downloads for contractors and designers."}
            </p>
          </div>
          <Link
            to="/products"
            className="bg-ink text-bone px-5 py-3 text-sm font-medium hover:bg-ink/80 transition-colors self-start md:self-auto"
          >
            View product families
          </Link>
        </div>
      </section>
    </div>
  );
}

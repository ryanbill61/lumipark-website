import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePageMeta } from "@/lib/usePageMeta";
import { fetchSiteSettings } from "@/lib/sanity";
import type { SiteSettings } from "@/lib/sanity";

const SYSTEMS = [
  {
    num: "01",
    tag: "MAGNETIC",
    title: "Magnetic Track Systems",
    body: "DC48V low-voltage systems. Flexible, safe, and customizable for dynamic retail and gallery environments.",
  },
  {
    num: "02",
    tag: "TRACK & FLOODLIGHT",
    title: "Commercial Track & Floodlight",
    body: "High CRI, precise beam control, and low glare (UGR<19) for architectural and commercial spaces.",
  },
  {
    num: "03",
    tag: "GRILLE & LINEAR",
    title: "Grille & Linear Lighting",
    body: "Seamless integration and uniform illumination. Surface-mounted, recessed, and suspended profiles.",
  },
];

const APPLICATIONS = [
  { title: "Retail & Showrooms", body: "Highlight textures and colors with CRI >90 optics." },
  { title: "Galleries & Exhibitions", body: "Flexible track positioning with precise beam angles." },
  { title: "Corporate & Hospitality", body: "Low-glare ambient lighting for sustained visual comfort." },
];

const RESOURCES = [
  "IES Photometric Files",
  "Product Spec Sheets (PDF)",
  "Installation Guides",
  "2026 BMC Full Catalog",
];

export default function Home() {
  usePageMeta(
    "BMC Lighting — Precision Lighting for Architectural Spaces",
    "Magnetic track ecosystems and commercial downlights. Engineered for retail, exhibition, and high-end interiors.",
  );
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    fetchSiteSettings("bmc").then(setSettings);
  }, []);
  return (
    <div>
      {/* Split Hero */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 border border-[#D1D1D1] bg-white overflow-hidden">
          <div className="p-8 md:p-14 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-[0.2em] text-steel font-semibold mb-6">
              B2B Supply Chain
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              {settings?.hero_h1 || "Light for Modern Spaces."}
            </h1>
            <p className="mt-6 text-base md:text-lg text-ink-soft leading-relaxed max-w-md">
              {settings?.hero_sub ||
                "Precision fixtures manufactured for architectural and commercial environments."}
            </p>
            <div className="mt-10">
              <Link
                to="/products"
                className="inline-block bg-steel text-white px-8 py-4 text-sm uppercase tracking-[0.18em] hover:bg-steel-deep transition-colors"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
          <div className="min-h-[260px] md:min-h-[360px] bg-[#EBEBEB] flex items-center justify-center text-[#999] text-xs uppercase tracking-widest">
            [ Hero Environment Image ]
          </div>
        </div>
      </section>

      {/* Numbered Systems */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">Our Systems</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {SYSTEMS.map((s) => (
            <Link
              key={s.num}
              to="/products"
              className="group bg-white p-8 border-t-4 border-steel shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-transform"
            >
              <div className="text-xs font-bold tracking-[0.18em] text-ink-soft mb-4">
                {s.num} / {s.tag}
              </div>
              <h3 className="text-lg font-semibold tracking-tight group-hover:text-steel transition-colors">
                {s.title}
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">{s.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Applications */}
      <section className="bg-white border-y border-[#D1D1D1]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Engineered for the demanding space.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {APPLICATIONS.map((a) => (
              <div key={a.title} className="border-t border-[#D1D1D1] pt-6">
                <h3 className="text-base font-semibold tracking-tight">{a.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Technical Resources</h2>
        <p className="mt-3 text-sm text-ink-soft max-w-xl">
          Everything you need for lighting calculation and project specification.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCES.map((r) => (
            <Link
              key={r}
              to="/technical"
              className="block bg-white border border-[#D1D1D1] p-5 text-sm font-medium hover:border-steel transition-colors"
            >
              {r}
            </Link>
          ))}
        </div>
      </section>

      {/* Quote CTA */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-24">
        <div className="bg-white border border-[#D1D1D1] p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Get a Factory Quote</h2>
            <p className="mt-2 text-sm text-ink-soft">Volume pricing for verified partners.</p>
          </div>
          <Link
            to="/contact"
            className="inline-block border border-steel text-steel px-8 py-4 text-sm uppercase tracking-[0.18em] hover:bg-steel hover:text-white transition-colors"
          >
            Request Quote →
          </Link>
        </div>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePageMeta } from "@/lib/usePageMeta";
import { fetchSiteSettings } from "@/lib/sanity";
import type { SiteSettings } from "@/lib/sanity";

const CATEGORIES = [
  {
    tag: "PENDANT",
    title: "Pendants",
    body: "Sculptural, warm suspensions that anchor a room.",
  },
  {
    tag: "SCONCE",
    title: "Sconces",
    body: "Soft pools of light for walls, corridors and corners.",
  },
  {
    tag: "DESK & FLOOR",
    title: "Desk & Floor",
    body: "Personal, focused and ambient companions for living.",
  },
  {
    tag: "CEILING FAN",
    title: "Ceiling Fans",
    body: "Air and light in balance, designed for quiet comfort.",
  },
];

export default function Home() {
  usePageMeta(
    "LEAPPON — Light that lives with you",
    "LEAPPON designs warm, human-centred lighting for the home — pendants, sconces, desk & floor and ceiling fans."
  );
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    fetchSiteSettings("leappon").then(setSettings);
  }, []);

  return (
    <div className="bg-bone-2">
      {/* Hero — centered card */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-10">
        <div className="card-soft text-center px-6 md:px-16 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
            LEAPPON · Lighting for Living
          </p>
          <h1 className="mt-6 text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-ink">
            {settings?.hero_h1 || "Light that lives with you."}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-ink-soft leading-relaxed">
            {settings?.hero_sub ||
              "Warm, human-centred lighting for the modern home — designed to feel effortless, and to make every room a little softer."}
          </p>
          <Link
            to="/products"
            className="inline-block mt-9 px-8 py-3.5 rounded-full bg-steel text-white font-medium hover:bg-steel-deep transition-colors"
          >
            View Collections
          </Link>
        </div>
      </section>

      {/* Four categories */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.tag}
              to="/products"
              className="card-soft card-hover block p-6"
            >
              <div className="h-36 rounded-xl bg-bone-2 flex items-center justify-center">
                <span className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                  [ {c.tag} ]
                </span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-ink">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{c.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 pb-20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink">
          {settings?.story_h2 || "Designed for the way we live"}
        </h2>
        <p className="mt-5 text-ink-soft leading-relaxed">
          {settings?.story_copy || "LEAPPON is the home-lighting line of LumiPark Group — a lighting supply chain built on our own factories and industrial parks. We pair honest engineering with a warm, human aesthetic, so the light in your home feels as good as it looks."}
        </p>
        <Link
          to="/contact"
          className="inline-block mt-8 px-8 py-3 rounded-full border border-steel text-steel font-medium hover:bg-steel hover:text-white transition-colors"
        >
          Get in touch
        </Link>
      </section>
    </div>
  );
}

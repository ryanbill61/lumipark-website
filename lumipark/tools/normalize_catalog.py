#!/usr/bin/env python3
"""Normalize Iris's 10-col BMC extraction → canonical 22-col CSV.

The 22-column header is frozen by the pilot (11# series) and matches what
tools/csv_to_sanity.py consumes. This mapper absorbs the mechanical mapping so
transcribers don't need to re-do files:

  power -> power_w        size -> dimensions_mm      ip -> ip_rating
  category -> "commercial" (default)                 optical/spec cols -> empty

It also applies the approved CRI auto-fix heuristic: a value in the `ip`
column that looks like CRI (">xx") is moved back into `cri`, and `ip_rating`
is left empty.

Family split (bare series -> series+type) and product_type taxonomy come from
a separate 归位表 delivered by the transcriber; pass it as a JSON map of
{"old family": "new family"} via --family-map. Rows not present in the map
keep their family name unchanged.

Usage:
  python3 normalize_catalog.py input.csv output.csv [--family-map family_map.json]
"""
import csv, json, sys

CANONICAL = [
    "product_family", "brand", "category", "product_type", "tagline", "description",
    "cct", "cri", "beam_angle", "ugr", "ip_rating", "dimming", "input_voltage",
    "certifications", "warranty", "features", "applications", "sku", "power_w",
    "lumens", "efficacy", "dimensions_mm",
]


def load_family_map(path):
    if not path:
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def normalize(inp, outp, family_map=None):
    fam = family_map or {}
    rows = list(csv.DictReader(open(inp, newline="", encoding="utf-8-sig")))
    out = []
    for raw in rows:
        # Transcribed files carry a space after each comma in the header, so
        # DictReader keys arrive as " power" / " sku" etc. Normalize defensively.
        r = {k.strip(): (v or "").strip() for k, v in raw.items()}
        cri = r.get("cri")
        ip = r.get("ip")
        # CRI auto-fix: ">90" landed in ip column (260CG series) — move it back.
        if ip.startswith(">"):
            if not cri:
                cri = ip
            ip = ""
        old_fam = (r.get("product_family") or "").strip()
        out.append({
            "product_family": fam.get(old_fam, old_fam),
            "brand": (r.get("brand") or "BMC").strip(),
            "category": "commercial",
            "product_type": (r.get("product_type") or "").strip(),
            "tagline": "",
            "description": "",
            "cct": (r.get("cct") or "").strip(),
            "cri": cri,
            "beam_angle": "",
            "ugr": "",
            "ip_rating": ip,
            "dimming": "",
            "input_voltage": "",
            "certifications": "",
            "warranty": "",
            "features": "",
            "applications": "",
            "sku": (r.get("sku") or "").strip(),
            "power_w": (r.get("power") or "").strip(),
            "lumens": "",
            "efficacy": "",
            "dimensions_mm": (r.get("size") or "").strip(),
        })
    with open(outp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANONICAL)
        w.writeheader()
        w.writerows(out)
    print(f"Normalized {len(out)} rows → {outp}")
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    fm = None
    fm_path = None
    if "--family-map" in args:
        i = args.index("--family-map")
        fm_path = args[i + 1]
        args = args[:i] + args[i + 2:]
    if fm_path:
        fm = load_family_map(fm_path)
    normalize(args[0], args[1], family_map=fm)

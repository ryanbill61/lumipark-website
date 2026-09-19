#!/usr/bin/env python3
"""Regroup cleaned BMC fixtures into series+type families (controlled vocabulary).

Reads the clean 22-col CSV produced by clean_bmc.py, normalizes product_type to a
canonical vocabulary, normalizes the series part of the family name, and rebuilds
product_family = "<series> <type>". Writes a regrouped CSV + a mapping report.

Usage:
  python3 regroup_bmc.py clean.csv regrouped.csv
"""
import csv, sys, re, collections

CANONICAL = [
    "product_family", "brand", "category", "product_type", "tagline", "description",
    "cct", "cri", "beam_angle", "ugr", "ip_rating", "dimming", "input_voltage",
    "certifications", "warranty", "features", "applications", "sku", "power_w",
    "lumens", "efficacy", "dimensions_mm",
]

# Canonical fixture-type vocabulary (key = lowercased raw, value = canonical).
TYPE_VOCAB = {
    'linear light': 'Linear Light', 'led linear': 'Linear Light', 'linear': 'Linear Light',
    'batten light': 'Batten Light', 'batten fixture': 'Batten Light',
    'track light': 'Track Light', 'surface mounted led track light': 'Track Light',
    'magnetic linear light': 'Magnetic Linear Light',
    'panel light': 'Panel Light', 'led panel light': 'Panel Light',
    'ceiling light': 'Ceiling Lamp', 'ceiling lamp': 'Ceiling Lamp',
    'spotlight': 'Spot Light',
    'floodlight': 'Floodlight',
    'grille light': 'Grille Light', 'line grill light': 'Grille Light',
    'downlight': 'Downlight', 'led downlight': 'Downlight', 'down light': 'Downlight',
    'led tube': 'LED Tube', 'tube': 'LED Tube', 'tube light': 'LED Tube',
    'led module': 'LED Module', 'led strip': 'LED Strip',
    'surface mounted linear light': 'Surface Mounted Linear Light',
    'surface mounted light': 'Surface Mounted Light',
    'linear downlight': 'Linear Downlight',
    'circular floodlight': 'Circular Floodlight',
    'folding spotlight': 'Folding Spotlight',
    'folding grille spotlight': 'Folding Grille Spotlight',
    'square mounted spotlight': 'Square Mounted Spotlight',
    'd floodlight': 'D Floodlight', 'd grille light': 'D Grille Light',
    'track spot light': 'Track Spot Light',
    'grille spotlight': 'Grille Spotlight',
    'sign light': 'Sign Light',
    'radar induction ceiling light': 'Radar Ceiling Lamp',
    'pendant light': 'Pendant Light', 'hanging wire lamp': 'Pendant Light',
    'long strip wall wash light': 'Wall Washer',
    'b grille spotlight': 'B Grille Spotlight', 'b floodlight': 'B Floodlight',
    'square wall washer grille light': 'Square Wall Washer Grille Light',
    'circular wall washer grille light': 'Circular Wall Washer Grille Light',
    'b folding spotlight grille spotlight': 'B Folding Spotlight Grille',
    'b folding spotlight floodlight': 'B Folding Spotlight Floodlight',
    'magnetic spotlight': 'Magnetic Spotlight',
    'classroom light': 'Classroom Light',
    'tri-proof light': 'Tri-proof Light',
    'radar tube light': 'Radar Tube Light',
    'emergency t8 led tube': 'Emergency LED Tube',
    't5 pc led lighting fixture': 'T5 PC LED Fixture',
    'magnetic dome light': 'Magnetic Dome Light',
    'magnetic exit sign': 'Magnetic Exit Sign',
}


def norm_series(fam):
    s = fam.strip()
    s = re.sub(r'\s+#', '#', s)
    s = re.sub(r'\bSurface mounted\b', 'Surface Mounted', s)
    s = re.sub(r'\bSurface Mounted series\b', 'Surface Mounted Series', s)
    s = re.sub(r'\bSurface/recessed\b', 'Surface/Recessed', s)
    s = re.sub(r'\b60s\b', '60S', s)
    s = re.sub(r'-A$', ' A', s)
    s = s.replace('series-A', 'Series A').replace('series-B', 'Series B').replace('series-C', 'Series C')
    return s


# Families whose name IS a type (not a series code) -> collapse to canonical family.
FAMILY_OVERRIDE = {
    'led linear': 'Linear Light',
    'led downlight': 'Downlight',
    'led panel light': 'Panel Light',
    'led tri-proof light': 'Tri-proof Light',
    'led track light': 'Track Light',
    'led ceiling lamp': 'Ceiling Lamp',
    'classroom light': 'Classroom Light',
    'led module': 'LED Module',
    'emergency led ceiling lamp': 'Emergency Ceiling Lamp',
    'emergency led downlight': 'Emergency Downlight',
    'emergency t8 led tube': 'Emergency LED Tube',
    'emergency t8 led glass tube': 'Emergency LED Tube',
    'radar motion sensor led ceiling lamp': 'Radar Ceiling Lamp',
    'radar motion sensor led downlight': 'Radar Downlight',
    'radar motion sensor t8 led tube': 'Radar Tube Light',
    'radar motion sensor t8 led fixture': 'Radar Tube Light',
    't8 led glass tube': 'LED Tube',
    't5 glass led tube': 'LED Tube',
    't5 pc led lighting fixture toggle switch': 'T5 PC LED Fixture',
    't8 smart lighting solution of wireless sensor network': 'LED Tube',
    'pp led downlight': 'Downlight',
}


def canonical_type(t):
    return TYPE_VOCAB.get(t.strip().lower(), t.strip())


def main(inp, outp):
    rows = list(csv.DictReader(open(inp, newline="", encoding="utf-8")))
    mapping = {}
    for r in rows:
        raw = r["product_type"].strip()
        ct = canonical_type(raw)
        mapping[raw] = ct
        r["product_type"] = ct
        series = norm_series(r["product_family"])
        override = FAMILY_OVERRIDE.get(series.lower())
        if override:
            new_fam = override
        elif series.lower() == ct.lower() or series.lower().endswith(" " + ct.lower()):
            new_fam = series
        else:
            new_fam = f"{series} {ct}".strip()
        r["product_family"] = new_fam

    with open(outp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANONICAL)
        w.writeheader()
        w.writerows(rows)

    rep = outp.rsplit(".", 1)[0] + ".md"
    fam_count = collections.Counter(r["product_family"] for r in rows)
    with open(rep, "w", encoding="utf-8") as f:
        f.write("# BMC batch5-8 family 归组报告（受控词表）\n\n")
        f.write(f"- 归组后 family 数: {len(fam_count)}\n")
        f.write(f"- 归组后 SKU 数: {len(rows)}\n\n")
        f.write("## Type 词表映射（raw → canonical）\n\n")
        for raw, ct in sorted(mapping.items(), key=lambda x: x[1].lower()):
            mark = "" if raw == ct else f"`{raw}` → "
            f.write(f"- {mark}`{ct}`\n")
        f.write("\n## Family 分布（归组后）\n\n")
        for fam, c in fam_count.most_common():
            f.write(f"- {c:3d}  {fam}\n")

    print(f"regrouped {len(rows)} rows -> {outp}  ({len(fam_count)} families)")
    print(f"report -> {rep}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

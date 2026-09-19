#!/usr/bin/env python3
"""Apply Iris's adjudication table to the cleaned BMC fixtures CSV.

Row-level fixes (from the 18:01 adjudication, QC'd by Mira):
  1. CRI normalize: 90 / >=90 / ≥90 -> >90  (final tiers: >80, >90 only)
  2. CLA*: unify family -> CLA; dims per SKU (018->H80, Φ->Ø, /BD·/B·/3C keep H95)
  3. 26BFL12L/18L: family 20BAB -> 26BAB Surface Mounted Series
  (LEDT8 18B/09E and BT8FH*-LD are already correct after dedup — no action)

Usage:
  python3 adjudicate_bmc.py clean.csv adjudicated.csv
"""
import csv, sys, re

CANONICAL = [
    "product_family", "brand", "category", "product_type", "tagline", "description",
    "cct", "cri", "beam_angle", "ugr", "ip_rating", "dimming", "input_voltage",
    "certifications", "warranty", "features", "applications", "sku", "power_w",
    "lumens", "efficacy", "dimensions_mm",
]

CLA_DIMS = {
    "CLA018": "Ø265xH80mm",
    "CLA018-LD": "Ø265xH80mm",
    "CLA024-LD": "Ø330xH100mm",
    "CLA036-LD": "Ø385xH110mm",
}


def norm_cri(v):
    v = (v or "").strip()
    v = v.replace(" ", "").replace("\u2265", ">=").replace("\u00a0", "")
    if v in ("90", ">=90", ">90", "> 90", "≥90"):
        return ">90"
    return v  # >80 or empty stay


def main(inp, outp):
    rows = list(csv.DictReader(open(inp, newline="", encoding="utf-8")))
    for r in rows:
        sku = r["sku"].strip()
        # 1. CRI normalize
        r["cri"] = norm_cri(r["cri"])
        # 2. CLA: unify family + fix dims
        if sku.startswith("CLA"):
            r["product_family"] = "CLA"
            if sku in CLA_DIMS:
                r["dimensions_mm"] = CLA_DIMS[sku]
            else:
                r["dimensions_mm"] = r["dimensions_mm"].replace("\u03a6", "\u00d8")  # Φ -> Ø
        # 3. 26BFL -> 26BAB
        if sku.startswith("26BFL"):
            r["product_family"] = "26BAB Surface Mounted Series"
        # general Φ -> Ø for all dims (cosmetic normalization)
        r["dimensions_mm"] = r["dimensions_mm"].replace("\u03a6", "\u00d8")

    with open(outp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANONICAL)
        w.writeheader()
        w.writerows(rows)
    print(f"adjudicated {len(rows)} rows -> {outp}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

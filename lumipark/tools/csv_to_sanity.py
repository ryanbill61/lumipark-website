#!/usr/bin/env python3
"""Convert the frozen 27-col product CSV → Sanity NDJSON (dataset import format).

Usage:
  python3 csv_to_sanity.py input.csv output.ndjson
"""
import csv, json, sys, re

def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

SPEC_COLUMNS = [
    ("cct", "CCT"),
    ("cri", "CRI"),
    ("beam_angle", "Beam Angle"),
    ("ugr", "UGR"),
    ("ip_rating", "IP Rating"),
    ("dimming", "Dimming"),
    ("input_voltage", "Input Voltage"),
    ("certifications", "Certifications"),
]

def split_list(v: str):
    if not v:
        return []
    return [x.strip() for x in re.split(r"[;\n]", v) if x.strip()]

def main(inp, outp, products_only=False):
    with open(inp, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    # group by product_family
    groups = {}
    for r in rows:
        fam = (r.get("product_family") or "").strip()
        if not fam:
            continue
        groups.setdefault(fam, []).append(r)

    brands = {}
    categories = {}
    products = []

    for fam, grp in groups.items():
        first = grp[0]
        slug = slugify(fam)
        brand = (first.get("brand") or "").strip()
        category = (first.get("category") or "").strip()

        if brand:
            brands[brand] = slugify(brand)
        if category:
            categories[category] = slugify(category)

        specs = []
        for idx, (col, label) in enumerate(SPEC_COLUMNS):
            v = (first.get(col) or "").strip()
            if v:
                specs.append({"_key": f"spec{idx:02d}", "label": label, "value": v})

        variants = []
        for i, r in enumerate(grp):
            sku = (r.get("sku") or "").strip()
            if not sku:
                continue
            variants.append({
                "_key": f"v{i:02d}",
                "_type": "variant",
                "modelNumber": sku,
                "variantName": sku,
                "powerSize": (r.get("power_w") or "").strip() or None,
                "luminousFlux": (r.get("lumens") or "").strip() or None,
                "efficacy": (r.get("efficacy") or "").strip() or None,
                "dimensions": (r.get("dimensions_mm") or "").strip() or None,
                "inStock": True,
            })

        doc = {
            "_id": f"product-{slug}",
            "_type": "product",
            "title": fam,
            "slug": {"_type": "slug", "current": slug},
            "category": {"_type": "reference", "_ref": f"category-{categories.get(category) or 'uncategorized'}"} if category else None,
            "brand": {"_type": "reference", "_ref": f"brand-{brands[brand]}"} if brand else None,
            "productType": (first.get("product_type") or "").strip() or None,
            "tagline": (first.get("tagline") or "").strip() or None,
            "description": (first.get("description") or "").strip() or None,
            "features": split_list(first.get("features") or ""),
            "applications": split_list(first.get("applications") or ""),
            "warranty": (first.get("warranty") or "").strip() or None,
            "specifications": specs,
            "variants": variants,
        }
        products.append(doc)

    out = []
    if not products_only:
        for name, bslug in brands.items():
            out.append({"_id": f"brand-{bslug}", "_type": "brand", "name": name, "slug": {"_type": "slug", "current": bslug}})
        for name, cslug in categories.items():
            out.append({"_id": f"category-{cslug}", "_type": "category", "title": name, "slug": {"_type": "slug", "current": cslug}})
    out.extend(products)

    with open(outp, "w", encoding="utf-8") as f:
        for d in out:
            f.write(json.dumps(d, ensure_ascii=False) + "\n")

    print(f"Wrote {len(out)} docs → {outp}")
    if not products_only:
        print(f"  brands: {list(brands)}")
        print(f"  categories: {list(categories)}")
    print(f"  products: {len(products)}")

if __name__ == "__main__":
    products_only = "--products-only" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--products-only"]
    main(args[0], args[1], products_only=products_only)

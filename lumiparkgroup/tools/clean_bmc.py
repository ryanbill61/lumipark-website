#!/usr/bin/env python3
"""Clean Iris's v2 fixtures CSV (already 22-col) → clean 22-col CSV + cleaning report.

Steps (mirroring Mira's 2026-09-09 ruling):
  1. strip all keys/values (transcribed files carry stray whitespace)
  2. drop no-SKU rows (section headers / residual lines)
  3. normalize vocab: category -> commercial, brand -> BMC, CRI notation
  4. dedup by SKU keep-first; family-name-conflicting dup blocks -> UNRESOLVED
  5. family audit (multi-type families + SKU-prefix/family mismatch) -> UNRESOLVED

Outputs:
  <out>.csv   clean 22-col CSV
  <out>.md    cleaning report (弃行 / 去重 / UNRESOLVED)

Usage:
  python3 clean_bmc.py input.csv output.csv
"""
import csv, sys, re, collections

CANONICAL = [
    "product_family", "brand", "category", "product_type", "tagline", "description",
    "cct", "cri", "beam_angle", "ugr", "ip_rating", "dimming", "input_voltage",
    "certifications", "warranty", "features", "applications", "sku", "power_w",
    "lumens", "efficacy", "dimensions_mm",
]


def norm_cri(v):
    v = (v or "").strip()
    if not v:
        return ""
    v = v.replace(" ", "").replace("\u2265", ">=").replace("\u00a0", "")
    return v


def norm_brand(v):
    v = (v or "").strip().upper()
    if v.startswith("BMC"):
        return "BMC"
    if not v:
        return "BMC"
    return v


def sku_prefix(sku):
    m = re.match(r'^([A-Za-z0-9#\(\)\.\-/]+?)(?=\d|$)', sku)
    return m.group(1) if m else ""


def main(inp, outp):
    raw = [{k.strip(): (v or "").strip() for k, v in r.items()}
           for r in csv.DictReader(open(inp, newline="", encoding="utf-8-sig"))]

    dropped = []      # no-SKU rows
    deduped = []      # duplicate SKU rows dropped (same family)
    unresolved = []   # family-conflict dupes + family granularity issues

    # ---- 1. drop no-SKU rows ----
    rows = []
    for i, r in enumerate(raw, start=2):  # 1-indexed line + header = 2
        if not r.get("sku"):
            dropped.append({"line": i, "family": r.get("product_family"),
                            "type": r.get("product_type"), "reason": "empty SKU"})
        else:
            rows.append(r)

    # ---- 2. normalize vocab ----
    for r in rows:
        r["category"] = r.get("category", "").strip().lower() or "commercial"
        r["brand"] = norm_brand(r.get("brand"))
        r["cri"] = norm_cri(r.get("cri"))
        r["product_type"] = (r.get("product_type") or "").strip()

    # ---- 3.5 empty-family rows: derive placeholder (series+type) + flag ----
    for r in rows:
        if not r["product_family"]:
            p = sku_prefix(r["sku"])
            derived = f"{p} {r['product_type']}".strip()
            unresolved.append({
                "kind": "empty-family", "sku": r["sku"],
                "family": "(empty)", "derived": derived,
                "note": "empty family; assigned placeholder from SKU prefix + type — confirm on page",
            })
            r["product_family"] = derived

    # ---- 4. dedup by SKU keep-first; family conflict -> UNRESOLVED ----
    by_sku = collections.OrderedDict()
    for r in rows:
        by_sku.setdefault(r["sku"], []).append(r)

    clean = []
    for sku, grp in by_sku.items():
        clean.append(grp[0])
        if len(grp) > 1:
            families = {g["product_family"] for g in grp}
            if len(families) > 1:
                unresolved.append({
                    "kind": "dup-sku-family-conflict", "sku": sku,
                    "families": sorted(families),
                    "dims": sorted({g["dimensions_mm"] for g in grp}),
                    "note": "same SKU under multiple family names (or conflicting dims) — needs page check",
                })
            else:
                deduped.append({
                    "sku": sku, "family": grp[0]["product_family"],
                    "dropped": len(grp) - 1,
                })

    # ---- 4. family audit: multi-type families + SKU-prefix/family mismatch ----
    fam_types = collections.defaultdict(set)
    fam_skus = collections.defaultdict(list)
    for r in clean:
        fam_types[r["product_family"]].add(r["product_type"])
        fam_skus[r["product_family"]].append(r["sku"])

    for fam, types in sorted(fam_types.items()):
        if len(types) > 1:
            unresolved.append({
                "kind": "multi-type-family", "family": fam,
                "types": sorted(types),
                "skus": len(fam_skus[fam]),
                "note": "family spans multiple fixture types — split by series+type before import",
            })

    # SKU-prefix/family mismatch: leading 2-digit series in SKU vs family
    for r in clean:
        fam = r["product_family"]
        sku = r["sku"]
        msku = re.match(r'^(?:JK)?(\d{2})', sku)
        mfam = re.match(r'^(\d{2})', fam)
        if msku and mfam and msku.group(1) != mfam.group(1):
            unresolved.append({
                "kind": "sku-family-series-mismatch", "sku": sku,
                "family": fam, "sku_series": msku.group(1),
                "family_series": mfam.group(1),
                "note": "SKU series digit does not match family series digit",
            })

    # ---- write clean CSV ----
    with open(outp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANONICAL)
        w.writeheader()
        w.writerows(clean)

    # ---- write report ----
    rep = outp.rsplit(".", 1)[0] + ".md"
    n_dedup_rows = sum(d["dropped"] for d in deduped)
    with open(rep, "w", encoding="utf-8") as f:
        f.write("# BMC batch5-8 清洗报告\n\n")
        f.write(f"- 输入行数: {len(raw)}\n")
        f.write(f"- 弃行（无 SKU）: {len(dropped)}\n")
        f.write(f"- 去重（同 SKU 同 family）: {len(deduped)} 组 / 弃 {n_dedup_rows} 行\n")
        f.write(f"- UNRESOLVED: {len(unresolved)} 项\n")
        f.write(f"- 干净行数: {len(clean)}\n\n")

        f.write("## ① 弃行（无 SKU）\n\n")
        if not dropped:
            f.write("（无）\n")
        for d in dropped:
            f.write(f"- L{d['line']} `{d['family']}` / `{d['type']}` — {d['reason']}\n")

        f.write("\n## ② 去重（同 SKU 同 family，留首行）\n\n")
        if not deduped:
            f.write("（无）\n")
        for d in deduped:
            f.write(f"- `{d['sku']}` ×{d['dropped']+1} → 留 1，弃 {d['dropped']}（`{d['family']}`）\n")

        f.write("\n## ③ UNRESOLVED（需回页定夺，勿静默吞）\n\n")
        if not unresolved:
            f.write("（无）\n")
        for u in unresolved:
            f.write(f"- **[{u['kind']}]** {u.get('sku') or u.get('family')} — {u['note']}")
            if u.get("families"):
                f.write(f" — families: {u['families']}")
            if u.get("dims"):
                f.write(f" — dims: {u['dims']}")
            if u.get("types"):
                f.write(f" — types: {u['types']}")
            f.write("\n")

    print(f"input {len(raw)} rows")
    print(f"dropped(no-SKU) {len(dropped)}  deduped {len(deduped)} groups/{n_dedup_rows} rows  unresolved {len(unresolved)}")
    print(f"clean {len(clean)} rows → {outp}")
    print(f"report → {rep}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

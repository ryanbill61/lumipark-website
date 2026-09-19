#!/usr/bin/env python3
"""Finalize BMC fixtures: apply near-duplicate family merge (Mira 18:10 ruling).

Series-level merges (规范名以 Iris 页表印刷标题为准):
  26CD / 26C(D) / 26CD Surface/Recessed Series  ->  26CD
  35# / 35# Series                               ->  35 Series
  35# Surface Mounted LED Track Lights           ->  35 Series Surface Mounted LED Track Light
  60S / 60B / 60E  —— 不合并（60# 系下不同子线）

Usage:
  python3 finalize_bmc.py final.csv final_v3.csv
"""
import csv, sys, re

CANONICAL = [
    "product_family", "brand", "category", "product_type", "tagline", "description",
    "cct", "cri", "beam_angle", "ugr", "ip_rating", "dimming", "input_voltage",
    "certifications", "warranty", "features", "applications", "sku", "power_w",
    "lumens", "efficacy", "dimensions_mm",
]


def merge_series(fam):
    s = fam
    if s.startswith("35# Surface Mounted LED Track Lights"):
        s = s.replace("35# Surface Mounted LED Track Lights", "35 Series Surface Mounted LED Track Light", 1)
        # drop a redundant trailing " Track Light" (type already embedded in series name)
        s = re.sub(r' Track Light$', '', s)
    elif s.startswith("35# Series"):
        s = s.replace("35# Series", "35 Series", 1)
    elif s.startswith("35#"):
        s = s.replace("35#", "35 Series", 1)
    elif s.startswith("26CD Surface/Recessed Series"):
        s = s.replace("26CD Surface/Recessed Series", "26CD", 1)
    elif s.startswith("26C(D) Series"):
        s = s.replace("26C(D) Series", "26CD", 1)
    elif s.startswith("26C(D)"):
        s = s.replace("26C(D)", "26CD", 1)
    return s


def main(inp, outp):
    rows = list(csv.DictReader(open(inp, newline="", encoding="utf-8")))
    merges = {}
    for r in rows:
        old = r["product_family"]
        new = merge_series(old)
        if new != old:
            merges[old] = new
        r["product_family"] = new

    with open(outp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANONICAL)
        w.writeheader()
        w.writerows(rows)

    rep = outp.rsplit(".", 1)[0] + ".md"
    fams = {}
    for r in rows:
        fams[r["product_family"]] = fams.get(r["product_family"], 0) + 1
    with open(rep, "w", encoding="utf-8") as f:
        f.write("# BMC batch5-8 终版归组报告（v3，含近重名合并）\n\n")
        f.write(f"- 终版 family 数: {len(fams)}\n")
        f.write(f"- 终版 SKU 数: {len(rows)}\n\n")
        f.write("## 近重名 family 合并规则\n\n")
        for old, new in sorted(merges.items()):
            f.write(f"- `{old}` → `{new}`\n")
        f.write("\n## 终版 family 分布\n\n")
        for fam, c in sorted(fams.items(), key=lambda x: -x[1]):
            f.write(f"- {c:3d}  {fam}\n")

    print(f"finalized {len(rows)} rows -> {outp}  ({len(fams)} families, {len(merges)} merged)")
    print(f"report -> {rep}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

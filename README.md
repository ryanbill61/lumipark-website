# LumiPark Group — 三站代码库（私有）

母舰 / BMC / LEAPPON 三个 EdgeSpark 全栈站的源码 + 文档 + 产品数据。

## 结构
- `lumiparkgroup/` — 母舰 Hub（lumiparkgroup.com）
- `bmclighting/` — BMC 独立站（bmclighting.com）
- `leappon/` — LEAPPON 独立站（leappon.com）
- `products/products.json` — Sanity 产品数据全量（147 款 / 500 SKU，非隐私）
- `docs/` — DNS 记录 / 文案稿 / logo
- `tools/` — 部署辅助脚本（prerender / CSV→Sanity 等）

## 目录名 ↔ EdgeSpark alias 映射（重要）
| 仓库目录 | EdgeSpark alias | 站点 |
|---|---|---|
| `lumiparkgroup/` | `lumipark` | 母舰 Hub |
| `bmclighting/` | `lumipark-hub` | BMC 独立站 |
| `leappon/` | `leappon` | LEAPPON 独立站 |

> alias 未改（改会断 EdgeSpark 运行时注入），只在仓库层用域名一致的目录名。

## 说明
- **询盘（leads）不进此仓库**（含客户邮箱/电话 PII），只留在本地月度备份包。
- 线上部署唯一执行人 = Mike（EdgeSpark 串行单线）。
- 品牌邮箱：母舰 ryan@lumiparkgroup.com / BMC monica@bmclighting.com / LEAPPON ryan@leappon.com

## 备份
- 每月 1 号 10:00（北京时间）打包（含 PII leads），存本地/群工作区，**不推 Git**。

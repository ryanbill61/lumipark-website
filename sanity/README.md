# Sanity Studio 源文件（原始）

> 这是**原始 Studio 工程源码**（非重建），从 `/tmp/studio-src/studio` 找回并入库。
> 含 schemaTypes + structure.ts + sanity.config.ts + package.json。

## 项目信息
- Sanity projectId: `e5lza2t9`，dataset: `production`
- Studio 挂载：`bmclighting.com/studio`（`sanity build` → 产物 `dist/` 复制到三站 `web/public/studio`）

## 当前文档类型（live 使用的 7 个）
| type | 说明 |
|---|---|
| `product` | 产品族（family 通用字段 + 内嵌 variants） |
| `category` | 产品分类 |
| `brand` | 品牌（BMC / LEAPPON / HUB） |
| `project` | 案例 |
| `newArrival` | 新品发布配置 |
| `hubSettings` / `bmcSettings` / `leapponSettings` | 三站文案/配置（hero/cta/footer/seo） |

## 已废弃 / 未使用的类型（owner 早期 structure.ts 曾引用）
- `article`（技术文章）—— 早期有 `article.ts`，后续版本已从 schemaTypes 移除，**当前未使用**
- `accessory`（配件）—— 同上，已移除
- ⚠️ 若早期 structure.ts 里引用了这两个类型，属于历史遗留，当前 desk structure 已不再挂载它们

## desk structure（当前 structure.ts）
侧边栏顺序：**站点文案（分组）→ 产品目录 → 案例 → 营销中心**（与 owner 早期版的顺序略有不同，以本目录 structure.ts 为准）

## 构建（从源码重建 studio）
```bash
npm install          # 依赖见 package.json（sanity ^6.9.1 / react 19）
npm run build        # 产出 dist/
# 把 dist/ 内容复制到三站 web/public/studio（覆盖静态挂载）
```

> ⚠️ **构建环境要求**：sanity ^6.9.1 要求 **Node.js >= 22.12**（当前沙箱是 v20.20.2，需切 Node 22+ 才能 build）。源码本身可构建，只是环境 Node 版本偏低。

# Sanity Studio 源文件（原始）

> 这是**原始 Studio 工程源码**（非重建），从 `/tmp/studio-src/studio` 找回并入库。
> 含 schemaTypes + structure.ts + sanity.config.ts + package.json。

## 项目信息
- Sanity projectId: `e5lza2t9`，dataset: `production`
- Studio 挂载：`bmclighting.com/studio`（`sanity build` → 复制到 web/public/studio）

## 文档类型
`product` / `category` / `brand` / `project`（案例）/ `newArrival`（新品）/ `hubSettings` / `bmcSettings` / `leapponSettings`

## 构建命令
```bash
npm install
npm run build    # 产物在 dist/，复制到三站 web/public/studio
```

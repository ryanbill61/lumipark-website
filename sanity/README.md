# Sanity Schema（内容模型源文件）

> ⚠️ **本目录是「重建版」**，非原始 Studio 工程逐字节备份。
> 原始 schema 源（schemaTypes/*.ts）在更早环节构建后未落盘到我工作区，此处按**线上数据模型 + 服务端 GROQ 查询 + OWNER 数据模型**反推重建，字段名与线上数据一致。

## 项目信息
- Sanity projectId: `e5lza2t9`，dataset: `production`
- Studio 挂载：`bmclighting.com/studio`（静态构建）

## 文档类型
| type | 说明 |
|---|---|
| `product` | 产品族（family 通用字段 + 内嵌 variants） |
| `productVariant` | SKU 行（object：modelNumber/powerSize/luminousFlux/efficacy/dimensions） |
| `brand` | 品牌（name：BMC / LEAPPON / HUB） |
| `category` | 分类（title） |
| `hubSettings` / `bmcSettings` / `leapponSettings` | 三站文案/配置（heroTitle / heroSubtitle） |

## 待核对
- 用 owner 早期 `structure.ts` 比对结构（desk structure）
- 核对各字段 type / validation / options 是否与原始一致

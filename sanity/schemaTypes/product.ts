import { defineType, defineField } from "sanity";

// Product 族（family 通用字段）+ 内嵌 variants（SKU 行）
export const product = defineType({
  name: "product",
  type: "document",
  title: "Product",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "title", maxLength: 96 } }),
    defineField({ name: "brand", type: "reference", to: [{ type: "brand" }], title: "Brand" }),
    defineField({ name: "category", type: "reference", to: [{ type: "category" }], title: "Category" }),
    defineField({ name: "productType", type: "string", title: "Product Type" }),
    defineField({ name: "tagline", type: "string", title: "Tagline" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({ name: "features", type: "array", of: [{ type: "string" }], title: "Features" }),
    defineField({ name: "applications", type: "array", of: [{ type: "string" }], title: "Applications" }),
    defineField({ name: "warranty", type: "string", title: "Warranty" }),
    defineField({
      name: "specifications",
      type: "array",
      of: [
        {
          type: "object",
          name: "specItem",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "value", type: "string", title: "Value" },
          ],
        },
      ],
      title: "Specifications",
    }),
    defineField({ name: "mainImage", type: "image", title: "Main Image" }),
    defineField({ name: "gallery", type: "array", of: [{ type: "image" }], title: "Gallery" }),
    defineField({ name: "specSheet", type: "file", title: "Spec Sheet (PDF)" }),
    defineField({ name: "installManual", type: "file", title: "Install Manual" }),
    defineField({ name: "iesFile", type: "file", title: "IES File" }),
    defineField({ name: "cutSheet", type: "file", title: "Cut Sheet" }),
    defineField({ name: "hubRank", type: "number", title: "Hub Rank" }),
    defineField({ name: "hubFeatured", type: "boolean", title: "Hub Featured", initialValue: false }),
    defineField({ name: "variants", type: "array", of: [{ type: "productVariant" }], title: "Variants (SKU)" }),
  ],
});

// SKU 行（product_variants）
export const productVariant = defineType({
  name: "productVariant",
  type: "object",
  title: "Product Variant (SKU)",
  fields: [
    defineField({ name: "modelNumber", type: "string", title: "SKU / Model Number" }),
    defineField({ name: "powerSize", type: "string", title: "Power" }),
    defineField({ name: "luminousFlux", type: "string", title: "Lumens" }),
    defineField({ name: "efficacy", type: "string", title: "Efficacy" }),
    defineField({ name: "dimensions", type: "string", title: "Dimensions" }),
  ],
});

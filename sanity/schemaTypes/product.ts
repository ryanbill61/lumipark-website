import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Information' },
    { name: 'media', title: 'Media & Visuals' },
    { name: 'details', title: 'Specifications & Variants' },
    { name: 'hub', title: '母舰展示 (Hub Showcase)' },
    { name: 'seo', title: 'SEO & GEO Optimization' },
  ],
  fields: [
    // ================= Basic Information =================
    defineField({
      name: 'title',
      title: 'Product Name',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'basic',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{ type: 'brand' }],
      group: 'basic',
      description: 'BMC / LEAPPON. Leave empty for group-level content.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'basic',
    }),
    defineField({
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      group: 'basic',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'basic',
    }),

    // ================= Media & Visuals =================
    defineField({
      name: 'mainImage',
      title: 'Main Product Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Product Gallery (Carousel)',
      type: 'array',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'specSheet',
      title: 'Spec Sheet (PDF)',
      type: 'file',
      group: 'media',
    }),
    defineField({
      name: 'installManual',
      title: 'Install Manual (PDF)',
      type: 'file',
      group: 'media',
    }),
    defineField({
      name: 'iesFile',
      title: 'IES File',
      type: 'file',
      group: 'media',
    }),
    defineField({
      name: 'cutSheet',
      title: 'Cut Sheet (PDF)',
      type: 'file',
      group: 'media',
    }),

    // ================= Specifications & Variants =================
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      group: 'details',
      rows: 3,
    }),
    defineField({
      name: 'features',
      title: 'Key Features & Selling Points',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'applications',
      title: 'Applications',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'warranty',
      title: 'Warranty',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'specifications',
      title: 'Technical Specifications Table',
      type: 'array',
      group: 'details',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Parameter Name (e.g., CRI)', type: 'string' },
            { name: 'value', title: 'Parameter Value (e.g., Ra>90)', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'variants',
      title: 'Product Variants / Models',
      type: 'array',
      group: 'details',
      description: 'Add different models under this product (wattages, sizes, CCT, finishes)',
      of: [
        {
          type: 'object',
          name: 'variant',
          title: 'Variant Item',
          fields: [
            { name: 'modelNumber', title: 'Model Number', type: 'string' },
            { name: 'variantName', title: 'Variant Name', type: 'string' },
            { name: 'sku', title: 'SKU', type: 'string' },
            { name: 'powerSize', title: 'Wattage', type: 'string' },
            { name: 'luminousFlux', title: 'Luminous Flux (lm)', type: 'string' },
            { name: 'efficacy', title: 'Luminous Efficacy (lm/W)', type: 'string' },
            { name: 'dimensions', title: 'Dimensions', type: 'string' },
            { name: 'inStock', title: 'In Stock', type: 'boolean', initialValue: true },
          ],
          preview: {
            select: { title: 'modelNumber', subtitle: 'variantName' },
          },
        },
      ],
    }),

    // ================= 母舰展示 (Hub Showcase) =================
    defineField({
      name: 'hubFeatured',
      title: '上母舰 (Featured on Hub)',
      type: 'boolean',
      group: 'hub',
      initialValue: false,
      description: '勾选后此产品才会出现在 LumiPark 母舰首页。',
    }),
    defineField({
      name: 'hubSection',
      title: '母舰区块 (Hub Section)',
      type: 'string',
      group: 'hub',
      options: {
        list: [
          { title: 'Hero 主推', value: 'hero' },
          { title: '精选 Featured', value: 'featured' },
          { title: '新品 New', value: 'new' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'hubRank',
      title: '母舰排序 (越小越靠前)',
      type: 'number',
      group: 'hub',
      initialValue: 0,
    }),

    // ================= SEO & GEO Optimization =================
    defineField({
      name: 'seoTitle',
      title: 'Meta Title',
      type: 'string',
      group: 'seo',
      description: 'Falls back to the Product Name if left empty.',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'Meta Keywords',
      type: 'array',
      group: 'seo',
      of: [{ type: 'string' }],
      description: 'Press Enter to add keywords.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      description: 'Snippet displayed in Google search results.',
    }),
    defineField({
      name: 'geoRegion',
      title: 'GEO Region Tag',
      type: 'string',
      group: 'seo',
      initialValue: 'Global',
    }),
    defineField({
      name: 'geoPlacename',
      title: 'GEO Placename',
      type: 'string',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'mainImage', subtitle: 'category.title' },
  },
})

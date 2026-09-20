import { defineArrayMember, defineField, defineType } from 'sanity'

const heroFields = (
  h1: string,
  sub: string,
) => [
  defineField({
    name: 'hero_h1',
    title: 'Hero 大标题 (Slogan)',
    type: 'string',
    group: 'hero',
    initialValue: h1,
  }),
  defineField({
    name: 'hero_sub',
    title: 'Hero 副标题 (Subtext)',
    type: 'text',
    group: 'hero',
    rows: 3,
    initialValue: sub,
  }),
  defineField({
    name: 'cta_text',
    title: 'CTA 按钮文字',
    type: 'string',
    group: 'hero',
  }),
]

const footerFields = [
  defineField({ name: 'footer_email', title: '联系邮箱 (Contact Email)', type: 'string', group: 'footer' }),
  defineField({ name: 'footer_address', title: '公司地址 (Address)', type: 'text', group: 'footer', rows: 2 }),
]

const seoFields = [
  defineField({ name: 'site_title', title: '站点标题 (Site Title)', type: 'string', group: 'seo' }),
  defineField({ name: 'meta_description', title: 'Meta Description', type: 'text', group: 'seo', rows: 3 }),
  defineField({ name: 'og_image', title: 'OG 分享图 (og:image)', type: 'image', group: 'seo', options: { hotspot: true } }),
]

const sharedGroups = [
  { name: 'hero', title: '首页核心 (Hero)' },
  { name: 'sections', title: '页面区块 (Page Sections)' },
  { name: 'footer', title: '页脚与联系 (Footer & Contact)' },
  { name: 'seo', title: 'SEO & Meta' },
]

export const hubSettings = defineType({
  name: 'hubSettings',
  title: 'LumiPark Hub 文案',
  type: 'document',
  groups: sharedGroups,
  fields: [
    ...heroFields(
      'LED lighting, made across three industrial parks we own and run.',
      '3 industrial parks. 100,000㎡ of production space. Over 50 factories. 30+ years on the manufacturing floor. We power lighting projects across North America, Europe, and Asia.',
    ),
    defineField({ name: 'stat_parks', title: '数字 · 园区', type: 'string', group: 'sections', initialValue: '3' }),
    defineField({ name: 'stat_factories', title: '数字 · 工厂', type: 'string', group: 'sections', initialValue: '50+' }),
    defineField({ name: 'stat_years', title: '数字 · 年份', type: 'string', group: 'sections', initialValue: '30+' }),
    defineField({ name: 'trust_bar_text', title: '认证底色带文字', type: 'string', group: 'sections', initialValue: 'Trusted certifications' }),
    defineField({ name: 'mfg_h2', title: '制造实力 H2', type: 'string', group: 'sections', initialValue: 'Core products, built in-house. Everything else, built next door.' }),
    defineField({ name: 'mfg_lead', title: '制造实力导语', type: 'text', group: 'sections', rows: 3, initialValue: 'Direct from our own factories — 50+ facilities across three wholly-owned industrial parks, giving you direct control over quality and lead times. Our own lines run the volume and hero SKUs; the surrounding park ecosystem covers the long tail — all under one QC regime.' }),
    defineField({ name: 'brands_h2', title: '品牌分流 H2', type: 'string', group: 'sections', initialValue: 'A curated look at what we make.' }),
    defineField({ name: 'brands_copy', title: '品牌分流文案', type: 'text', group: 'sections', rows: 3, initialValue: 'A hand-picked selection from our brands. Full catalogs, specs and IES downloads live on each brand site.' }),
    defineField({ name: 'terms_h2', title: 'B2B 条款 H2', type: 'string', group: 'sections', initialValue: 'Engineered spec sheets, not shopping carts.' }),
    defineField({ name: 'terms_copy', title: 'B2B 条款文案', type: 'text', group: 'sections', rows: 3, initialValue: 'Every product ships with a structured Ordering Information table — wattage variants, photometric specs, and IES / spec-sheet downloads for contractors and designers.' }),
    defineField({
      name: 'stats',
      title: '规模数字（Stats）',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: '数值', type: 'string' }),
            defineField({ name: 'label', title: '标签', type: 'string' }),
          ],
        }),
      ],
      initialValue: [
        { value: '3', label: 'Specialized lighting industrial parks' },
        { value: '100,000 m²', label: 'Total park & facility area' },
        { value: '50+', label: 'Resident partner factories' },
        { value: '30+', label: 'Years in manufacturing' },
      ],
    }),
    defineField({
      name: 'ecosystem_cards',
      title: '生态卡片（Ecosystem）',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ecosystem_card',
          fields: [
            defineField({ name: 'title', title: '标题', type: 'string' }),
            defineField({ name: 'body', title: '正文', type: 'text', rows: 3 }),
          ],
        }),
      ],
      initialValue: [
        { title: 'Source your whole BOM inside one cluster', body: 'Drivers, optics, housings and boards are all made in the parks, so you pay factory prices without the middleman freight legs.' },
        { title: 'Mix categories in one container', body: 'Indoor, outdoor, industrial and components ship together. When one line is full, we move the order to a sister factory — your roll-out doesn\u2019t wait.' },
        { title: 'Same QC on every factory, ours or not', body: 'IQC → in-process → 100% aging → photometric sampling → OQC. The resident factories run it too, or they don\u2019t stay in the park.' },
      ],
    }),
    defineField({
      name: 'manufacturing_cards',
      title: '制造卡片（Manufacturing）',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'manufacturing_card',
          fields: [
            defineField({ name: 'title', title: '标题', type: 'string' }),
            defineField({ name: 'body', title: '正文', type: 'text', rows: 3 }),
          ],
        }),
      ],
      initialValue: [
        { title: '2 R&D centers, 40+ engineers', body: 'Optics, thermals, drivers and smart controls designed in-house.' },
        { title: 'In-house photometric lab', body: 'Integrating sphere + goniophotometer — IES/LDT files issued with every quote.' },
        { title: '100% aging test', body: '4–8 h burn-in on every luminaire before packing, no sampling shortcuts.' },
        { title: 'Vertical chain on-site', body: 'Die-casting, CNC, powder coating, SMT and assembly within the parks.' },
      ],
    }),
    ...footerFields,
    ...seoFields,
  ],
})

export const bmcSettings = defineType({
  name: 'bmcSettings',
  title: 'BMC Lighting 文案',
  type: 'document',
  groups: sharedGroups,
  fields: [
    ...heroFields(
      'Light for Modern Spaces.',
      'Precision fixtures manufactured for architectural and commercial environments.',
    ),
    defineField({ name: 'systems_h2', title: '系统 H2', type: 'string', group: 'sections', initialValue: 'Our Systems' }),
    defineField({ name: 'apps_h2', title: '应用场景 H2', type: 'string', group: 'sections', initialValue: 'Engineered for the demanding space.' }),
    defineField({ name: 'downloads_h2', title: '技术资源 H2', type: 'string', group: 'sections', initialValue: 'Technical Resources' }),
    defineField({ name: 'quote_h2', title: '报价段 H2', type: 'string', group: 'sections', initialValue: 'Get a Factory Quote' }),
    defineField({ name: 'quote_copy', title: '报价段文案', type: 'text', group: 'sections', rows: 3, initialValue: 'Volume pricing for verified partners.' }),
    ...footerFields,
    ...seoFields,
  ],
})

export const leapponSettings = defineType({
  name: 'leapponSettings',
  title: 'LEAPPON 文案',
  type: 'document',
  groups: sharedGroups,
  fields: [
    ...heroFields(
      'Light that lives with you.',
      'Warm, human-centred lighting for the modern home — designed to feel effortless, and to make every room a little softer.',
    ),
    defineField({ name: 'story_h2', title: '品牌故事 H2', type: 'string', group: 'sections', initialValue: 'Designed for the way we live' }),
    defineField({ name: 'story_copy', title: '品牌故事正文', type: 'text', group: 'sections', rows: 4, initialValue: 'LEAPPON is the home-lighting line of LumiPark Group — a lighting supply chain built on our own factories and industrial parks. We pair honest engineering with a warm, human aesthetic, so the light in your home feels as good as it looks.' }),
    defineField({ name: 'collections_h2', title: 'Collections H2', type: 'string', group: 'sections' }),
    defineField({ name: 'audience_h2', title: 'Audience H2', type: 'string', group: 'sections' }),
    defineField({ name: 'contact_h2', title: 'Contact H2', type: 'string', group: 'sections' }),
    defineField({ name: 'contact_copy', title: 'Contact 文案', type: 'text', group: 'sections', rows: 3 }),
    ...footerFields,
    ...seoFields,
  ],
})

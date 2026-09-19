import { defineField, defineType } from 'sanity'

export const newArrival = defineType({
  name: 'newArrival',
  title: '新品发布模块',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '模块主标题', type: 'string', initialValue: 'New Product Arrival' }),
    defineField({ name: 'subtitle', title: '副标题/文案', type: 'text', rows: 2 }),
    defineField({ name: 'bannerImage', title: '新品发布海报图', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'featuredProduct',
      title: '当前主推产品',
      type: 'reference',
      to: [{ type: 'product' }],
      description: '点击海报后跳转到的具体产品'
    }),
  ]
})
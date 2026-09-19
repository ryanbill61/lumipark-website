import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Projects (Leappon 案例管理)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '案例名称',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: '案例 URL 标识 (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: '案例主图',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: '案例描述',
      type: 'text',
    }),
  ],
})
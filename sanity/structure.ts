import { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('LumiPark 内容后台')
    .items([
      // 1. 站点文案（三个固定配置文档）
      S.listItem()
        .id('site-settings')
        .title('⚙️ 站点文案 (Site Settings)')
        .child(
          S.list()
            .id('site-settings-list')
            .title('站点文案管理')
            .items([
              S.listItem()
                .id('hub-settings')
                .title('母舰 LumiPark Hub')
                .child(S.document().schemaType('hubSettings').documentId('hubSettings').title('母舰 LumiPark Hub 文案')),
              S.listItem()
                .id('bmc-settings')
                .title('BMC Lighting')
                .child(S.document().schemaType('bmcSettings').documentId('bmcSettings').title('BMC Lighting 文案')),
              S.listItem()
                .id('leappon-settings')
                .title('LEAPPON')
                .child(S.document().schemaType('leapponSettings').documentId('leapponSettings').title('LEAPPON 文案')),
            ])
        ),
      S.divider(),

      // 2. 产品目录
      S.listItem()
        .id('catalog-menu')
        .title('产品目录 (Catalog)')
        .child(
          S.list()
            .id('catalog-list')
            .title('目录管理')
            .items([
              S.documentTypeListItem('product').title('📦 所有产品'),
              S.documentTypeListItem('brand').title('🏷️ 品牌 (Brand)'),
              S.documentTypeListItem('category').title('📁 产品分类'),
            ])
        ),

      // 3. 案例管理
      S.documentTypeListItem('project').title('🏗️ 案例管理'),

      // 4. 营销
      S.listItem()
        .id('marketing-menu')
        .title('营销中心 (Marketing)')
        .child(
          S.list()
            .id('marketing-list')
            .title('营销模块')
            .items([
              S.listItem()
                .id('new-arrival-item')
                .title('✨ 新品发布配置')
                .child(
                  S.document()
                    .schemaType('newArrival')
                    .documentId('newArrival')
                    .title('新品发布配置')
                ),
            ])
        ),
    ])

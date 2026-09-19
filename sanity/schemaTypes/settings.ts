import { defineType, defineField } from "sanity";

// 三站文案/配置文档（hero 标题/副标题等；前端缺值回落旧文案）
const settingsFields = [
  defineField({ name: "heroTitle", type: "string", title: "Hero Title" }),
  defineField({ name: "heroSubtitle", type: "string", title: "Hero Subtitle" }),
];

export const hubSettings = defineType({
  name: "hubSettings",
  type: "document",
  title: "Hub Settings",
  fields: settingsFields,
});

export const bmcSettings = defineType({
  name: "bmcSettings",
  type: "document",
  title: "BMC Settings",
  fields: settingsFields,
});

export const leapponSettings = defineType({
  name: "leapponSettings",
  type: "document",
  title: "LEAPPON Settings",
  fields: settingsFields,
});

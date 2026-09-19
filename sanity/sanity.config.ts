import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "lumipark",
  title: "LumiPark Group",
  projectId: "e5lza2t9",
  dataset: "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});

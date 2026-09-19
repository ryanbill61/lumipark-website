import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'e5lza2t9',
    dataset: 'production',
  },
  project: {
    basePath: '/studio/',
  },
})

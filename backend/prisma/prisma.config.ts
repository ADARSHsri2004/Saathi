import { defineConfig } from '@prisma/integration'

export default defineConfig({
  datasource: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

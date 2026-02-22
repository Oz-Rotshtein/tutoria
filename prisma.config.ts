// prisma.config.ts
import 'dotenv/config'; // <--- THIS IS THE KEY LINE
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma', // Explicitly tell it where your schema is
  datasource: {
    // 'env' is a helper that reads from the loaded process.env
    url: env('DATABASE_URL'), 
  },
});
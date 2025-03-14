import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schemas/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `${process.env.DATABASE_URL}?sslmode=verify-full&sslrootcert=${process.env.SSL_CA_PATH}`,
    // url: process.env.DATABASE_URL,
  },
  introspect: {
    casing: 'camel',
  },
});

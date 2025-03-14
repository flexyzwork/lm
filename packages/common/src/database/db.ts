import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg'; // for esm
import fs from 'fs';
import * as schema from '../schemas';

import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.SSL_CA_PATH || '/etc/ssl/certs/global-bundle.pem').toString(),
  },
});

export const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

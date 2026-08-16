import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (isProd) {
    throw new Error('FATAL: A variável de ambiente DATABASE_URL é obrigatória em produção.');
  } else if (isTest) {
    connectionString = 'postgresql://postgres:postgres@localhost:5432/product_os_test';
  } else {
    connectionString = '';
  }
}

export const pool = new pg.Pool(
  connectionString
    ? {
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
      }
    : {}
);

export const db = drizzle(pool, { schema });

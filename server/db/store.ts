import { PostgresStore } from './postgresStore.js';
import { MemoryStore } from './memoryStore.js';
import { BusinessRuleError } from '../utils/errors.js';

export { PostgresStore, MemoryStore, BusinessRuleError };

// Primary database store:
// If DATABASE_URL is present or in production, instantiate PostgresStore.
// In local/test fallback mode without a PostgreSQL instance, fallback to MemoryStore.
const usePostgres = Boolean(process.env.DATABASE_URL) || process.env.NODE_ENV === 'production';

export const dbStore: PostgresStore | MemoryStore = usePostgres
  ? new PostgresStore()
  : new MemoryStore();

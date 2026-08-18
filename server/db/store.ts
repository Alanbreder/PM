import { PostgresStore } from './postgresStore.js';
import { MemoryStore } from './memoryStore.js';
import { BusinessRuleError } from '../utils/errors.js';

export { PostgresStore, MemoryStore, BusinessRuleError };

// Primary database store:
// PostgresStore is the REAL persistent store of the application.
// No silent fallback to MemoryStore is permitted.
export const dbStore: PostgresStore = new PostgresStore();


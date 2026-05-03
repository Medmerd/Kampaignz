import type { Migration } from './migration-types';
import { migration001Init } from './001_init';

export const migrations: Migration[] = [migration001Init];

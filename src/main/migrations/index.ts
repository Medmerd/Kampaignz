import type { Migration } from './migration-types';
import { migration001Init } from './001_init';
import { migration002CreatePlayers } from './002_create_players';

export const migrations: Migration[] = [migration001Init, migration002CreatePlayers];

import type { Migration } from './migration-types';
import { migration001Init } from './001_init';
import { migration002CreatePlayers } from './002_create_players';
import { migration003CreateMessages } from './003_create_messages';
import { migration004AddMessageConfig } from './004_add_message_config';

export const migrations: Migration[] = [
  migration001Init,
  migration002CreatePlayers,
  migration003CreateMessages,
  migration004AddMessageConfig,
];

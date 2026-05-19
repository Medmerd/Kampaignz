import type { Migration } from './migration-types';
import { migration001Init } from './001_init';
import { migration006AddCampaignFields } from './006_add_campaign_fields';
import { migration007CreateSteps } from './007_create_steps';
import { migration008CreateSessionMatchTables } from './008_create_session_match_tables';

export const migrations: Migration[] = [
  migration001Init,
  migration006AddCampaignFields,
  migration007CreateSteps,
  migration008CreateSessionMatchTables,
];

import type { Migration } from './migration-types';
import { migration001Init } from './001_init';
import { migration006AddCampaignFields } from './006_add_campaign_fields';
import { migration007CreateSteps } from './007_create_steps';

export const migrations: Migration[] = [
  migration001Init,
  migration006AddCampaignFields,
  migration007CreateSteps,
];

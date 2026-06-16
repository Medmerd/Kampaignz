"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
const _001_init_1 = require("./001_init");
const _006_add_campaign_fields_1 = require("./006_add_campaign_fields");
const _007_create_steps_1 = require("./007_create_steps");
const _008_create_session_match_tables_1 = require("./008_create_session_match_tables");
const _009_create_army_rules_1 = require("./009_create_army_rules");
exports.migrations = [
    _001_init_1.migration001Init,
    _006_add_campaign_fields_1.migration006AddCampaignFields,
    _007_create_steps_1.migration007CreateSteps,
    _008_create_session_match_tables_1.migration008CreateSessionMatchTables,
    _009_create_army_rules_1.migration009CreateArmyRules,
];
//# sourceMappingURL=index.js.map
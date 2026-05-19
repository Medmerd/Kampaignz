const schema = 'kampaignz';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    const schemaBuilder = isSqlite ? knex.schema : knex.schema.withSchema(schema);

    return schemaBuilder
        .createTable('campaigns', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.integer('expectedSessions').notNullable().defaultTo(1);
            table.json('config').notNullable().defaultTo('{}');
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        })
        .createTable('players', (table) => {
            table.increments('id').primary();
            table.integer('campaign_id').notNullable().index('idx_players_campaign_id');
            table.string('playerName').notNullable();
            table.string('army').notNullable();
            table.string('notes').notNullable().defaultTo('');
            table.json('config').notNullable().defaultTo('{}');
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.foreign('campaign_id').references('id').inTable('campaigns').onDelete('CASCADE');
        })
        .createTable('messages', (table) => {
            table.increments('id').primary();
            table.integer('campaign_id').notNullable().index('idx_messages_campaign_id');
            table.string('content').notNullable().defaultTo('');
            table.json('config').notNullable().defaultTo('{}');
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.foreign('campaign_id').references('id').inTable('campaigns').onDelete('CASCADE');
        })
        .createTable('message_players', (table) => {
            table.integer('message_id').notNullable();
            table.integer('player_id').notNullable().index('idx_message_players_player_id');
            table.primary(['message_id', 'player_id']);
            table.foreign('message_id').references('id').inTable('messages').onDelete('CASCADE');
            table.foreign('player_id').references('id').inTable('players').onDelete('CASCADE');
        })
        .createTable('missions', (table) => {
            table.increments('id').primary();
            table.integer('campaign_id').notNullable().index('idx_missions_campaign_id');
            table.string('title').notNullable();
            table.json('config').notNullable().defaultTo('{}');
            table.string('missionDetails').notNullable().defaultTo('');
            table.string('map').notNullable().defaultTo('');
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.foreign('campaign_id').references('id').inTable('campaigns').onDelete('CASCADE');
        })
        .createTable('steps', (table) => {
            table.increments('id').primary();
            table.integer('campaign_id').notNullable().index('idx_steps_campaign_id');
            table.string('title').notNullable();
            table.json('config').notNullable().defaultTo('{}');
            table.string('stepDetails').notNullable().defaultTo('');
            table.string('map').notNullable().defaultTo('');
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.foreign('campaign_id').references('id').inTable('campaigns').onDelete('CASCADE');
        })
        .createTable('step_players', (table) => {
            table.integer('step_id').notNullable();
            table.integer('player_id').notNullable().index('idx_step_players_player_id');
            table.primary(['step_id', 'player_id']);
            table.foreign('step_id').references('id').inTable('steps').onDelete('CASCADE');
            table.foreign('player_id').references('id').inTable('players').onDelete('CASCADE');
        })
        .createTable('step_missions', (table) => {
            table.integer('step_id').notNullable();
            table.integer('mission_id').notNullable().index('idx_step_missions_mission_id');
            table.primary(['step_id', 'mission_id']);
            table.foreign('step_id').references('id').inTable('steps').onDelete('CASCADE');
            table.foreign('mission_id').references('id').inTable('missions').onDelete('CASCADE');
        })
        .createTable('step_messages', (table) => {
            table.integer('step_id').notNullable();
            table.integer('message_id').notNullable().index('idx_step_messages_message_id');
            table.primary(['step_id', 'message_id']);
            table.foreign('step_id').references('id').inTable('steps').onDelete('CASCADE');
            table.foreign('message_id').references('id').inTable('messages').onDelete('CASCADE');
        })
        .createTable('missionMatchTypes', (table) => {
            table.integer('typeId').primary();
            table.string('type').notNullable().unique();
        })
        .createTable('missionMatchTeam', (table) => {
            table.integer('matchId').primary();
            table.integer('missionId').notNullable();
            table.integer('teamAId').notNullable();
            table.integer('teamBId').notNullable();
            table.integer('matchType').notNullable();
            table.foreign('missionId').references('id').inTable('missions').onDelete('CASCADE');
            table.foreign('matchType').references('typeId').inTable('missionMatchTypes').onDelete('CASCADE');
        })
        .createTable('missionMatch', (table) => {
            table.integer('teamAId').notNullable();
            table.integer('teamBId').notNullable();
            table.integer('playerAId').notNullable();
            table.integer('playerBId').notNullable();
            table.primary(['teamAId', 'teamBId', 'playerAId', 'playerBId']);
            table.foreign('playerAId').references('id').inTable('players').onDelete('CASCADE');
            table.foreign('playerBId').references('id').inTable('players').onDelete('CASCADE');
        }).then(() => console.log("Table created successfully!"))
        .catch(err => {
            console.error("Error creating table:", err);
            throw err;
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    const schemaBuilder = isSqlite ? knex.schema : knex.schema.withSchema(schema);

    await schemaBuilder.dropTableIfExists('step_players')
    await schemaBuilder.dropTableIfExists('step_messages');
    await schemaBuilder.dropTableIfExists('step_missions');
    await schemaBuilder.dropTableIfExists('message_players');
    await schemaBuilder.dropTableIfExists('messages');
    await schemaBuilder.dropTableIfExists('missionMatch');
    await schemaBuilder.dropTableIfExists('players');
    await schemaBuilder.dropTableIfExists('missionMatchTeam');
    await schemaBuilder.dropTableIfExists('missionMatchTypes');
    await schemaBuilder.dropTableIfExists('steps')
    await schemaBuilder.dropTableIfExists('missions')
    await schemaBuilder.dropTableIfExists('campaigns');

    return knex.schema;
};

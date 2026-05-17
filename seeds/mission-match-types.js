/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {

  // Deletes ALL existing entries
  await knex.withSchema('kampaignz').into('missionMatchTypes').del()
  await knex.withSchema('kampaignz').into('missionMatchTypes').insert([
    {
      typeId: 1,
      type: '1v1'
    },
    {
      typeId: 2,
      type: '2v2'
    },
    {
      typeId: 4,
      type: '4v4'
    }
  ]);
};

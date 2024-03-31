/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
	await knex.schema.alterTable('todos', (table) => {
		table
			.enum('priority', ['low', 'medium', 'high'])
			.notNullable()
			.defaultTo('low');
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
	await knex.schema.alterTable('todos', (table) => {
		table.dropColumn('priority');
	});
};

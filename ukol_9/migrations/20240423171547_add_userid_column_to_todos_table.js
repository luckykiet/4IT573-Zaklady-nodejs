/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.alterTable("todos", (table) => {
    table.integer("user_id")
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable("todos", (table) => {
    table.dropColumn("user_id")
  })
}

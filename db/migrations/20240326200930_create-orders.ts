import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('numero_item').notNullable();
    table.string('codigo_produto').notNullable();
    table.integer('quantidade_produto').notNullable();
    table.decimal('valor_unitario_produto', 10, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders');
}


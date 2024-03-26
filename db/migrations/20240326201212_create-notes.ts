import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notes', (table) => {
    table.increments('id').primary();
    table.integer('pedido_id').unsigned().notNullable(); // Referência ao pedido associado
    table.foreign('pedido_id').references('orders.id'); // Referenciando 'orders.id'
    table.integer('numero_item').notNullable();
    table.integer('quantidade_produto').notNullable();
    // Add here any other necessary fields for the notes
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notes');
}
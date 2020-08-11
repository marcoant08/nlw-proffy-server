import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("classes", (table) => {
    table.increments("id").primary();
    table.string("materia").notNullable();
    table.string("custo").notNullable();
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("usuarios")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("classes");
}

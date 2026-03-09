exports.up = async function up(knex) {
    // Tabela dos usuarios
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable().defaultTo("user");
    table.timestamps(true, true);
  });
   // Tabela dos refresh tokens
  await knex.schema.createTable("refresh_tokens", (table) => {
    table.string("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("token_hash").notNullable().unique();
    table.dateTime("expires_at").notNullable();
    table.dateTime("revoked_at").nullable();
    table.timestamps(true, true);
  });
  // Tabela dos itens
  await knex.schema.createTable("items", (table) => {
    table.increments("product_id").primary();
    table.integer("order_id").notNullable().defaultTo(0);
    table.decimal("price", 14, 2).notNullable().defaultTo(0);
    table.integer("quantity").notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
 // Tabela das vendas
  await knex.schema.createTable("sales", (table) => {
    table.string("order_id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.decimal("value", 6, 2).notNullable().defaultTo(0);
    table.dateTime("CreationDate").notNullable();
    table.timestamps(true, true);
  });
 // Tabela dos itens vendidos
  await knex.schema.createTable("items_sale", (table) => {
    table.increments("id").primary();
    table
      .string("order_id")
      .notNullable()
      .references("order_id")
      .inTable("sales")
      .onDelete("CASCADE");
    table
      .integer("product_id")
      .unsigned()
      .notNullable()
      .references("product_id")
      .inTable("items")
      .onDelete("RESTRICT");
    table.integer("quantity").notNullable();
    table.timestamps(true, true);
    table.unique(["order_id", "product_id"]);
  });
};


exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("refresh_tokens");
  await knex.schema.dropTableIfExists("items");
  await knex.schema.dropTableIfExists("sales");
  await knex.schema.dropTableIfExists("items_sale");
};
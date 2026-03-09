const db = require("../../../config/db");

async function ensureUsersTable(executor) {
  const exists = await executor.schema.hasTable("users");
  if (exists) return;

  await executor.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable().defaultTo("user");
    table.timestamps(true, true);
  });
}

async function ensureItemsTable(executor) {
  const exists = await executor.schema.hasTable("items");
  if (exists) return;

  await executor.schema.createTable("items", (table) => {
    table.increments("product_id").primary();
    table.integer("order_id").notNullable().defaultTo(0);
    table.decimal("price", 14, 2).notNullable().defaultTo(0);
    table.integer("quantity").notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
}

async function ensureSalesTable(executor) {
  const exists = await executor.schema.hasTable("sales");
  if (exists) return;

  await executor.schema.createTable("sales", (table) => {
    table.string("order_id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.decimal("value", 14, 2).notNullable().defaultTo(0);
    table.dateTime("CreationDate").notNullable();
    table.timestamps(true, true);
  });
}

async function ensureItemsSaleTable(executor) {
  const exists = await executor.schema.hasTable("items_sale");
  if (exists) return;

  await executor.schema.createTable("items_sale", (table) => {
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
}

async function ensureRefreshTokensTable(executor) {
  const exists = await executor.schema.hasTable("refresh_tokens");
  if (exists) return;

  await executor.schema.createTable("refresh_tokens", (table) => {
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
}

async function ensureDatabaseSchema(executor = db) {
  await ensureUsersTable(executor);
  await ensureItemsTable(executor);
  await ensureSalesTable(executor);
  await ensureItemsSaleTable(executor);
  await ensureRefreshTokensTable(executor);
}

module.exports = {
  ensureDatabaseSchema
};

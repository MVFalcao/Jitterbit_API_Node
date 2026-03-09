const bcrypt = require("bcryptjs");

const DEFAULT_NAME = "Admin";
const DEFAULT_EMAIL = "admin@gmail.com";
const DEFAULT_PASSWORD = "senha123";

/**
 * @param {import('knex')} knex
 */
exports.seed = async function seed(knex) {
  const adminName = (process.env.ADMIN_SEED_NAME || DEFAULT_NAME).trim();
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || DEFAULT_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const existing = await knex("users").where({ email: adminEmail }).first();

  if (!existing) {
    await knex("users").insert({
      name: adminName,
      email: adminEmail,
      password_hash: passwordHash,
      role: "admin"
    });
    return;
  }

  await knex("users").where({ id: existing.id }).update({
    name: adminName,
    password_hash: passwordHash,
    role: "admin",
    updated_at: knex.fn.now()
  });
};

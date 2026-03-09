require("dotenv").config();

const dbClient = process.env.DB_CLIENT || "better-sqlite3";
const dbFilename = process.env.DB_FILENAME || "./dev.sqlite3";

function isSqliteClient(client) {
  return client === "sqlite3" || client === "better-sqlite3";
}

function buildConnection(client, filenameFallback) {
  if (isSqliteClient(client)) {
    return { filename: filenameFallback };
  }

  return process.env.DATABASE_URL || "";
}

function buildConfig(envName, filenameFallback) {
  const client = process.env.DB_CLIENT || dbClient;

  return {
    client,
    connection: buildConnection(client, filenameFallback),
    useNullAsDefault: isSqliteClient(client),
    migrations: { directory: "./migrations" },
    seeds: { directory: "./seeds" },
    pool: envName === "production" ? { min: 2, max: 10 } : { min: 1, max: 5 }
  };
}

module.exports = {
  development: buildConfig("development", dbFilename),
  test: buildConfig("test", "./test.sqlite3"),
  production: buildConfig("production", dbFilename)
};

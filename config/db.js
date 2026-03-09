const knex = require("knex");
const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";
const selectedConfig = knexConfig[environment] || knexConfig.development;

const db = knex(selectedConfig);

module.exports = db;

require("dotenv").config();

const app = require("./app");
const { ensureDatabaseSchema } = require("./modules/schemas/database.schema");

const port = Number(process.env.PORT || 3000);

async function startServer() {
  await ensureDatabaseSchema();

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

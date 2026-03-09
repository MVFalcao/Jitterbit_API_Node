const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("../src/modules/routes");
const ApiError = require("../utils/apiError");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", routes);

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found."));
});

app.use((error, req, res, next) => {
  const statusCode = Number(error && error.statusCode) || 500;
  const isServerError = statusCode >= 500;
  const message = isServerError
    ? "Internal server error."
    : error.message || "Unexpected error.";

  if (isServerError && process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
});

module.exports = app;

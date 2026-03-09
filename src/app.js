const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const routes = require("./modules/routes");
const swaggerSpec = require("./swagger");
const ApiError = require("../utils/apiError");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use(
  "/docs",
  (req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https:; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true
    }
  })
);

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

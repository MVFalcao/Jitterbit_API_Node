const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const routesGlob = path.resolve(__dirname, "modules/routes/*.js").replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Jitterbit API",
      version: "1.0.0",
      description: "Node.js API de gerenciamento de pedidos."
    },
    servers: [
      {
        url: `http://localhost:${Number(process.env.PORT || 3000)}`
      }
    ]
  },
  apis: [routesGlob]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

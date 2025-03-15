const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for our project.",
    },
    servers: [
      {
        url: "http://localhost:5000", // Update to your live server URL if applicable
      },
    ],
  },
  apis: ["./routes/*.js", "./routes/withdraw/*.js"], // Include subdirectories
};

const swaggerSpecs = swaggerJsdoc(options);

module.exports = swaggerSpecs;

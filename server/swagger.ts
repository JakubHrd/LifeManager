// server/swagger.ts

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express"; // DŮLEŽITÉ: Application, ne Express!

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "LifeManager API",
    version: "1.0.0",
    description: "API documentation for LifeManager",
  },
  servers: [
    {
      url: "http://localhost:5000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Optional, for clarity
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};


const options = {
  swaggerDefinition,
  apis: ["./routes/**/*.ts", "./controllers/**/*.ts"], // sem dej cesty, kde má hledat anotace
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

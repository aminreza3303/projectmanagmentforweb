import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import projectsRouter from "./routes/projects";
import tasksRouter from "./routes/tasks";
import resourcesRouter from "./routes/resources";
import reportsRouter from "./routes/reports";
import notificationsRouter from "./routes/notifications";
import filesRouter from "./routes/files";
import budgetRouter from "./routes/budget";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const openapiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Project Management API",
      version: "1.0.0"
    },
    servers: [{ url: "http://localhost:4000" }],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "OK" } }
        }
      }
    }
  };

  // Simple root handler to avoid "Cannot GET /" responses
  app.get("/", (_req, res) => {
    res.json({
      name: "Project Management API",
      status: "ok",
      docs: "/docs",
      health: "/health"
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api", tasksRouter);
  app.use("/api", resourcesRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/budget", budgetRouter);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", issues: err.issues });
      }
      return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  );

  return app;
};

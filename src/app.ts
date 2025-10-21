import "express-async-errors";

import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";

import { errorHandler, handler404 } from "./controllers/ErrorController";
import { audittrailRouter } from "./routes/AuditTrail";
import { billingRouter } from "./routes/BillingRoute";
import { I9userRouter } from "./routes/I9UserRoute";
import { initiationMetadataRouter } from "./routes/InitiationMetadataRoute";
import { notificationRouter } from "./routes/NotificationRoute";
import { teamRouter } from "./routes/TeamRoute";
import { todoRouter } from "./routes/TodoRoute";
import { translatorRouter } from "./routes/TranslatorRoute";
import uploadRouter from "./routes/upload";
import { userRouter } from "./routes/UserRoute";
import { Env } from "./utils/Env";

const app = express();
// Needed to secure the Stripe webhook
app.use("/billing/webhook", express.raw({ type: "application/json" }));

// Load Express middlewares
app.use(json());
app.use(helmet());
app.use(
  cors({
    origin: Env.getValue("FRONTEND_DOMAIN_URL"),
  })
);

// Create a health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ server: "ok" });
});

// Load Express routers
app.use(userRouter);
app.use(todoRouter);
app.use(billingRouter);
app.use(teamRouter);
app.use(I9userRouter);
app.use(notificationRouter);
app.use(uploadRouter);
app.use(initiationMetadataRouter);
app.use(audittrailRouter);
app.use(translatorRouter);

// Error handler
app.use(handler404);
app.use(errorHandler);

export { app };

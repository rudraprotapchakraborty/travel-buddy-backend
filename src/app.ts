import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorMiddleware } from "./core/error-middleware";
import { PaymentController } from "./modules/payments/payment.controller";

const app = express();

// Webhook route must use raw body parser and be mounted BEFORE any JSON body parser
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    return PaymentController.stripeWebhook(req, res);
  }
);

// Now mount the usual JSON parser and other middleware/routes
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mount API routers (note: remove or comment out the webhook route inside payments.routes.ts
// if it exists, to avoid duplicate handling)
app.use("/api", routes);

app.get("/", (_req, res) => {
  res.send("Travel Buddy Backend Running.");
});

app.use(errorMiddleware);

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { env } from "./config/env";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./core/error-middleware";
import { PaymentController } from "./modules/payments/payment.controller";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = env.CLIENT_URL.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (no Origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);

app.use(morgan(env.isProduction ? "combined" : "dev"));

// Stripe needs the raw body to verify signatures, so this route must be
// registered before express.json().
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.send("Travel Buddy Backend Running.");
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

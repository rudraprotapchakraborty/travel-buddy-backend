import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorMiddleware } from "./core/error-middleware";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.send("Travel Buddy Backend Running.");
});

app.use(errorMiddleware);

export default app;

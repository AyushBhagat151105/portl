import { auth } from "@portl/auth";
import { env } from "@portl/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { openapiSpec } from "./docs/openapi";
import societyRouter from "./routes/society.routes";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/openapi.json", (c) => c.json(openapiSpec));
app.get("/reference", Scalar({ url: "/openapi.json" }));

app.route("/api/society", societyRouter);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
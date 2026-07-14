import { auth } from "@portl/auth";
import { env } from "@portl/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { openapiSpec } from "./docs/openapi";

// Import new split routers
import commonRouter from "./routes/society/common.routes";
import adminRouter from "./routes/society/admin.routes";
import guardRouter from "./routes/society/guard.routes";
import residentRouter from "./routes/society/resident.routes";

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

// Better Auth endpoint handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Scalar OpenAPI specs reference
app.get("/openapi.json", (c) => c.json(openapiSpec));
app.get("/reference", Scalar({ url: "/openapi.json" }));

// Mount role-specific society routes
app.route("/api/society/admin", adminRouter);
app.route("/api/society/guard", guardRouter);
app.route("/api/society/resident", residentRouter);
app.route("/api/society", commonRouter);

// Support both /api/notifications and /api/society/notifications for token registration
app.route("/api", commonRouter); // will route /api/notifications/register-token

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
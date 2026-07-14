import type { Context } from "hono";

export function successResponse(c: Context, data: unknown, status = 200) {
  return c.json(
    {
      success: true,
      data,
    },
    status as any
  );
}

export function errorResponse(
  c: Context,
  message: string,
  code = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) {
  return c.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    status as any
  );
}

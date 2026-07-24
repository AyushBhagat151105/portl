import { auth } from "@portl/auth";
import prisma from "@portl/db";
import type { Context, Next } from "hono";
import { errorResponse } from "../lib/api-response";

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return errorResponse(c, "Unauthorized", "UNAUTHORIZED", 401);
  }
  c.set("session", session);
  await next();
}

export function roleMiddleware(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    let session = c.get("session");
    if (!session) {
      session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) {
        return errorResponse(c, "Unauthorized", "UNAUTHORIZED", 401);
      }
      c.set("session", session);
    }

    // Determine active society/organization
    let activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      // Auto-fallback to first joined society if not explicitly active
      const firstMember = await prisma.member.findFirst({
        where: { userId: session.user.id },
      });
      if (firstMember) {
        activeOrgId = firstMember.organizationId;
      }
    }

    if (!activeOrgId) {
      return errorResponse(c, "No active society/organization found", "NO_ACTIVE_SOCIETY", 400);
    }

    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: activeOrgId,
      },
    });

    if (!member) {
      return errorResponse(c, "You are not a member of this society", "FORBIDDEN", 403);
    }

    // Role validation (case-insensitive checks)
    const userRole = member.role.toLowerCase();
    const userRoles = [userRole];
    if (userRole === "owner") {
      userRoles.push("admin");
    }
    if (userRole === "member") {
      userRoles.push("resident");
    }

    const hasRole = allowedRoles.some((role) => userRoles.includes(role.toLowerCase()));

    if (!hasRole) {
      return errorResponse(c, `Forbidden: Requires one of [${allowedRoles.join(", ")}] roles`, "FORBIDDEN", 403);
    }

    c.set("societyId", activeOrgId);
    c.set("memberRole", member.role);
    c.set("userId", session.user.id);
    await next();
  };
}

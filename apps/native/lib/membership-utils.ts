import { api } from "@/lib/api";
import { router } from "expo-router";

export type RoleType = "admin" | "resident" | "guard";

export async function syncUserMembershipAndNavigate(
  routerInstance: typeof router,
  setRole: (role: RoleType) => void
): Promise<boolean> {
  try {
    let memberRes;
    try {
      memberRes = await api.get("/api/society/my-membership");
    } catch {
      // Retry once after brief delay if cookie/token was still hydrating right after sign-in
      await new Promise((resolve) => setTimeout(resolve, 300));
      memberRes = await api.get("/api/society/my-membership");
    }

    const membership = memberRes.data?.data;

    if (membership) {
      const serverRole = membership.role?.toLowerCase();
      let mappedRole: RoleType = "resident";
      if (serverRole === "admin" || serverRole === "owner") {
        mappedRole = "admin";
      } else if (serverRole === "guard") {
        mappedRole = "guard";
      } else {
        mappedRole = "resident";
      }

      setRole(mappedRole);

      if (mappedRole === "admin") {
        routerInstance.replace("/(drawer)/admin/dashboard");
      } else if (mappedRole === "guard") {
        routerInstance.replace("/(drawer)/guard/dashboard");
      } else {
        routerInstance.replace("/(drawer)/resident/dashboard");
      }
      return true;
    }
  } catch {
    // Membership not found or error occurred
  }

  routerInstance.replace("/onboarding");
  return false;
}

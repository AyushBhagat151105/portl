import { api } from "@/lib/api";
import { router } from "expo-router";

export type RoleType = "admin" | "resident" | "guard";

export async function syncUserMembershipAndNavigate(
  routerInstance: typeof router,
  setRole: (role: RoleType) => void
): Promise<boolean> {
  try {
    const memberRes = await api.get("/api/society/my-membership");
    const membership = memberRes.data?.data;

    if (membership) {
      const serverRole = membership.role?.toLowerCase();
      if (
        serverRole === "admin" ||
        serverRole === "owner" ||
        serverRole === "resident" ||
        serverRole === "guard"
      ) {
        const mappedRole: RoleType = serverRole === "owner" ? "admin" : (serverRole as RoleType);
        setRole(mappedRole);
      }

      if (serverRole === "admin" || serverRole === "owner") {
        routerInstance.replace("/(drawer)/admin/dashboard");
      } else if (serverRole === "guard") {
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

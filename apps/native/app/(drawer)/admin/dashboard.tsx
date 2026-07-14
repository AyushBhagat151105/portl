import React from "react";
import { AdminDashboardView } from "@/components/society/admin-dashboard-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <AdminDashboardView />;
}

export default withRole(Page, "admin");

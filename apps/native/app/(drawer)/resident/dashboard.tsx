import React from "react";
import { ResidentDashboardView } from "@/components/society/resident-dashboard-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ResidentDashboardView />;
}

export default withRole(Page, "resident");

import React from "react";
import { GuardDashboardView } from "@/components/society/guard-dashboard-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <GuardDashboardView />;
}

export default withRole(Page, "guard");

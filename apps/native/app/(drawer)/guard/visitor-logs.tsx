import React from "react";
import { VisitorLogsView } from "@/components/society/visitor-logs-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <VisitorLogsView />;
}

export default withRole(Page, "guard");

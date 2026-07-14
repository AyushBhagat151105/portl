import React from "react";
import { HelpdeskView } from "@/components/society/helpdesk-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <HelpdeskView />;
}

export default withRole(Page, "resident");

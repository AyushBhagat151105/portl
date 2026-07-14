import React from "react";
import { ManageResidentsView } from "@/components/society/manage-residents-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ManageResidentsView />;
}

export default withRole(Page, "admin");

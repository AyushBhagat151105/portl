import React from "react";
import { ManageStructureView } from "@/components/society/manage-structure-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ManageStructureView />;
}

export default withRole(Page, "admin");

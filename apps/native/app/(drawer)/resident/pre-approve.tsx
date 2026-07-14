import React from "react";
import { PreApproveView } from "@/components/society/pre-approve-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <PreApproveView />;
}

export default withRole(Page, "resident");

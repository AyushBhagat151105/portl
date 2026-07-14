import React from "react";
import { ManageStaffView } from "@/components/society/manage-staff-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ManageStaffView />;
}

export default withRole(Page, "admin");

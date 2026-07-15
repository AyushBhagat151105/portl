import React from "react";
import { ResidentDuesView } from "@/components/society/resident-dues-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ResidentDuesView />;
}

export default withRole(Page, "resident");

import React from "react";
import { AdminDuesView } from "@/components/society/admin-dues-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <AdminDuesView />;
}

export default withRole(Page, "admin");

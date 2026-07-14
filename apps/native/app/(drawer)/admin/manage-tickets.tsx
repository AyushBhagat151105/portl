import React from "react";
import { ManageTicketsView } from "@/components/society/manage-tickets-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ManageTicketsView />;
}

export default withRole(Page, "admin");

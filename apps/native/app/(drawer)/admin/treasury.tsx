import React from "react";
import { TreasuryView } from "@/components/society/treasury-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <TreasuryView />;
}

export default withRole(Page, "admin");

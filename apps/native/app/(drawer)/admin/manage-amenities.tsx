import React from "react";
import { ManageAmenitiesView } from "@/components/society/manage-amenities-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ManageAmenitiesView />;
}

export default withRole(Page, "admin");

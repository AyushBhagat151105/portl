import React from "react";
import { ManageBookingsView } from "../../../components/society/manage-bookings-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ManageBookingsView />;
}

export default withRole(Page, "admin");

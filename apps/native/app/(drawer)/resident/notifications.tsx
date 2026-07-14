import React from "react";
import { NotificationsView } from "@/components/society/notifications-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <NotificationsView />;
}

export default withRole(Page, "resident");

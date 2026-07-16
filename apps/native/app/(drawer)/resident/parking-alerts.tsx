import React from "react";
import { ParkingAlertsView } from "../../../components/society/parking-alerts-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ParkingAlertsView />;
}

export default withRole(Page, "resident");

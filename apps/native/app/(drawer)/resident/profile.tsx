import React from "react";
import { ProfileView } from "../../../components/society/profile-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <ProfileView />;
}

export default withRole(Page, "resident");

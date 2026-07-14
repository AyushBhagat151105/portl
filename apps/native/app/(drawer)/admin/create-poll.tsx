import React from "react";
import { CreatePollView } from "@/components/society/create-poll-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <CreatePollView />;
}

export default withRole(Page, "admin");

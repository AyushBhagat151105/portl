import React from "react";
import { CreateNoticeView } from "@/components/society/create-notice-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <CreateNoticeView />;
}

export default withRole(Page, "admin");

import React from "react";
import { CheckPasscodeView } from "@/components/society/check-passcode-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <CheckPasscodeView />;
}

export default withRole(Page, "guard");

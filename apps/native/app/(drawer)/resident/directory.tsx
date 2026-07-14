import React from "react";
import { DirectoryView } from "@/components/society/directory-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <DirectoryView />;
}

export default withRole(Page, "resident");

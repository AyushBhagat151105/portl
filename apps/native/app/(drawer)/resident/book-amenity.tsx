import React from "react";
import { BookAmenityView } from "@/components/society/book-amenity-view";
import { withRole } from "@/components/role-guard";

function Page() {
  return <BookAmenityView />;
}

export default withRole(Page, "resident");

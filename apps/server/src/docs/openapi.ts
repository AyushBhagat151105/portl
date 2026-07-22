import { adminPaths } from "./paths/admin.paths";
import { commonPaths } from "./paths/common.paths";
import { guardPaths } from "./paths/guard.paths";
import { residentPaths } from "./paths/resident.paths";
import { treasuryPaths } from "./paths/treasury.paths";
import { apkPaths } from "./paths/apk.paths";

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Portl API Reference",
    version: "1.0.0",
    description: "Documentation for the Portl Smart Society Operations Platform APIs. Guard, Resident, Admin, and APK Release operations.",
  },
  servers: [
    {
      url: "https://portl-api.ayushbhagat.com",
      description: "Production API Server",
    },
  ],
  tags: [
    { name: "APK Releases", description: "Android APK metadata inspection and direct binary package downloads" },
    { name: "Setup", description: "Admin operations to initialize society structures" },
    { name: "Residents", description: "Resident search for guard operations" },
    { name: "Visitors", description: "Visitor check-ins, pre-approvals, entries, exits and gate calls" },
    { name: "Notices", description: "Society Notice board updates" },
    { name: "Polls", description: "Interactive community voting polls" },
    { name: "Complaints", description: "Helpdesk support complaint tickets" },
    { name: "Amenities", description: "Amenity schedules and reservations" },
    { name: "Staff", description: "Society staff and service provider registry" },
    { name: "Notifications", description: "Device push tokens registration and in-app alert history logs" },
    { name: "Dues", description: "Maintenance dues generation and Razorpay payment integrations" },
    { name: "Treasury", description: "Budget tracking, expense logging and community event scheduling" },
    { name: "Media", description: "Secure image uploads and document attachments" }
  ],
  paths: {
    ...apkPaths,
    ...adminPaths,
    ...commonPaths,
    ...guardPaths,
    ...residentPaths,
    ...treasuryPaths,
  }
};

import type { Context } from "hono";
import { successResponse, errorResponse } from "../../../lib/api-response";
import { ResidentVehicleService } from "../../../services/society/resident/resident-vehicle.service";


export class ResidentVehicleController {
  // Search vehicle plate
  static async searchVehicle(c: Context) {
    try {
      const societyId = c.get("societyId");
      const plateNumber = c.req.query("plateNumber") || "";
      const result = await ResidentVehicleService.searchVehicle(societyId, plateNumber);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }

  // Send blocking alert
  static async notifyVehicleBlocking(c: Context) {
    try {
      const societyId = c.get("societyId");
      const userId = c.get("userId");
      const vehicleId = c.req.param("id")!;
      const result = await ResidentVehicleService.notifyVehicleBlocking(societyId, userId, vehicleId);
      return successResponse(c, result);
    } catch (err: any) {
      return errorResponse(c, err.message, "INTERNAL_ERROR", 500);
    }
  }
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// 1. Create notice announcement
export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await api.post("/api/society/admin/notices", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

// 2. Launch community poll
export function useCreatePollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { question: string; options: string[] }) => {
      const res = await api.post("/api/society/admin/polls", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// 3. Update support ticket status
export function useUpdateComplaintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ complaintId, status }: { complaintId: string; status: "PENDING" | "IN_PROGRESS" | "RESOLVED" }) => {
      const res = await api.patch(`/api/society/admin/complaints/${complaintId}`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

// 4. Get all society members registry
export function useMembersQuery() {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await api.get("/api/society/admin/members");
      return res.data?.data ?? [];
    },
  });
}

// 5. Assign resident flat
export function useAssignFlatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; flatId: string }) => {
      const res = await api.patch("/api/society/admin/residents/assign-flat", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// 6. Create amenity configuration
export function useCreateAmenityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; location?: string; capacity?: number }) => {
      const res = await api.post("/api/society/admin/amenities", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

// 7. Create staff provider directory contact
export function useCreateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; role: string; code?: string }) => {
      const res = await api.post("/api/society/admin/staff", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

// 8. Delete staff directory contact
export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.delete(`/api/society/admin/staff/${staffId}`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

// 9. Setup or modify society structure config (Merges post-setup configurations)
export function useSetupStructureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { towers: { name: string; flats: string[] }[] }) => {
      const res = await api.post("/api/society/admin/setup", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towers"] });
    },
  });
}

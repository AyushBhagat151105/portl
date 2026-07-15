import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys, type DuesFilters } from "./keys";

// 1. Create notice announcement
export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await api.post("/api/society/admin/notices", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.notices() });
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.polls() });
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
      // Invalidate all complaint variants (with any filter)
      return queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

// 4. Get all society members registry
export function useMembersQuery() {
  return useQuery({
    queryKey: queryKeys.members(),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/members");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5min — member list changes slowly
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.members() });
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.amenities() });
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
    },
  });
}

// 9. Setup or modify society structure config
export function useSetupStructureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { towers: { name: string; flats: string[] }[] }) => {
      const res = await api.post("/api/society/admin/setup", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.towers() });
    },
  });
}

// 10. Get all society dues logs (with optional month/status filter)
export function useAdminDuesQuery(filters?: DuesFilters) {
  return useQuery<{ data: any[]; nextCursor: string | null }>({
    queryKey: queryKeys.dues.admin(filters),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/dues", { params: filters });
      return res.data?.data ?? { data: [], nextCursor: null };
    },
    staleTime: 1000 * 30, // 30s — due status changes on payment/reconciliation
  });
}

// 11. Generate maintenance dues for all flats
export function useGenerateDuesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; month: string; dueDate: string }) => {
      const res = await api.post("/api/society/admin/dues/generate", data);
      return res.data?.data;
    },
    onSuccess: () => {
      // Invalidate all dues.admin variants regardless of filter
      return queryClient.invalidateQueries({ queryKey: ["dues", "admin"] });
    },
  });
}

// 12. Mark due paid offline
export function useMarkDuePaidMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dueId: string) => {
      const res = await api.patch(`/api/society/admin/dues/${dueId}/mark-paid`);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["dues"] });
    },
  });
}

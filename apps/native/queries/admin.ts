import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys, type DuesFilters } from "./keys";

// 1. Create notice announcement
export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      banner?: string | null;
      bannerPublicId?: string | null;
      endDate?: string | null;
    }) => {
      const res = await api.post("/api/society/admin/notices", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.notices() });
    },
  });
}

// Delete notice announcement
export function useDeleteNoticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noticeId: string) => {
      const res = await api.delete(`/api/society/admin/notices/${noticeId}`);
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

// 2b. Close community poll
export function useClosePollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pollId: string) => {
      const res = await api.patch(`/api/society/admin/polls/${pollId}/close`);
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
    mutationFn: async (data: {
      name: string;
      phone: string;
      role: string;
      code?: string;
      aadharNumber?: string;
      aadharPublicId?: string;
      vehicleNumber?: string;
      avatar?: string;
    }) => {
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

// 13. Update Staff details
export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ staffId, data }: { staffId: string; data: any }) => {
      const res = await api.put(`/api/society/admin/staff/${staffId}`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
    },
  });
}

// 14. Create Resident Manually
export function useCreateResidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password?: string; phone?: string; aadharNumber?: string; image?: string; aadharPublicId?: string }) => {
      const res = await api.post("/api/society/admin/residents", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.members() });
    },
  });
}

// 15. Update Resident Profile (Admin)
export function useUpdateResidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const res = await api.put(`/api/society/admin/residents/${userId}`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.members() });
    },
  });
}

// 16. Delete/Remove Resident
export function useDeleteResidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/api/society/admin/residents/${userId}`);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.members() });
    },
  });
}

// 17. Allocate Flat occupancy & counts
export function useAllocateFlatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      flatId: string;
      ownerId?: string | null;
      occupancyStatus: "VACANT" | "OWNER_OCCUPIED" | "RENTED";
      memberCount?: number;
      vehicleMemberCount?: number;
      residentIds?: string[];
    }) => {
      const res = await api.put("/api/society/admin/flats/allocate", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.towers() });
    },
  });
}

// 18. Update Razorpay Payment configuration
export function usePaymentConfigQuery() {
  return useQuery({
    queryKey: ["paymentConfig"],
    queryFn: async () => {
      const res = await api.get("/api/society/admin/payment/config");
      return res.data?.data;
    },
  });
}

export function useUpdatePaymentConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { razorpayKeyId: string; razorpayKeySecret: string }) => {
      const res = await api.put("/api/society/admin/payment/config", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["paymentConfig"] });
    },
  });
}

// 19. Retrieve event booking requests (Admin)
export function useAdminBookingsQuery() {
  return useQuery({
    queryKey: queryKeys.bookings(),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/bookings");
      return res.data?.data ?? [];
    },
  });
}

// 20. Respond to event bookings request
export function useRespondBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: "APPROVED" | "REJECTED" | "CANCELLED" }) => {
      const res = await api.patch(`/api/society/admin/bookings/${bookingId}/respond`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
    },
  });
}

// 21. Treasury Budgets
export function useBudgetsQuery() {
  return useQuery({
    queryKey: queryKeys.treasury.budgets(),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/treasury/budgets");
      return res.data?.data ?? [];
    },
  });
}

export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; allocatedAmount: number; startDate: string; endDate: string }) => {
      const res = await api.post("/api/society/admin/treasury/budgets", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["treasury"] });
    },
  });
}

// 22. Treasury Expenses
export function useExpensesQuery(category?: string) {
  return useQuery({
    queryKey: queryKeys.treasury.expenses(category),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/treasury/expenses", { params: { category } });
      return res.data?.data ?? [];
    },
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; amount: number; category: string; description?: string; date: string; budgetId?: string }) => {
      const res = await api.post("/api/society/admin/treasury/expenses", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["treasury"] });
    },
  });
}

// 23. Treasury Festivals
export function useFestivalsQuery() {
  return useQuery({
    queryKey: queryKeys.treasury.festivals(),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/treasury/festivals");
      return res.data?.data ?? [];
    },
  });
}

export function useCreateFestivalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; date: string; allocatedBudget?: number }) => {
      const res = await api.post("/api/society/admin/treasury/festivals", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["treasury"] });
    },
  });
}

// Staff Aadhar signed URL query
export function useStaffAadharSignedUrlQuery(staffId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["staff", staffId, "aadhar-url"],
    queryFn: async () => {
      if (!staffId) return null;
      const res = await api.get(`/api/society/admin/staff/${staffId}/aadhar-url`);
      return res.data?.data?.url ?? null;
    },
    enabled: enabled && !!staffId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

// Resident Aadhar signed URL query (Admin)
export function useResidentAadharSignedUrlQuery(residentId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["residents", residentId, "aadhar-url"],
    queryFn: async () => {
      if (!residentId) return null;
      const res = await api.get(`/api/society/admin/residents/${residentId}/aadhar-url`);
      return res.data?.data?.url ?? null;
    },
    enabled: enabled && !!residentId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

// Delete staff avatar mutation
export function useDeleteStaffAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.delete(`/api/society/admin/staff/${staffId}/avatar`);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
    },
  });
}

// Delete staff Aadhar mutation
export function useDeleteStaffAadharMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.delete(`/api/society/admin/staff/${staffId}/aadhar`);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
    },
  });
}

// 23. Fixed Deposits Query & Mutations
export function useFixedDepositsQuery() {
  return useQuery({
    queryKey: queryKeys.treasury.fds(),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/treasury/fds");
      return res.data?.data ?? [];
    },
  });
}

export function useCreateFixedDepositMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bankName: string;
      amount: number;
      interestRate?: number;
      startDate: string;
      maturityDate?: string;
    }) => {
      const res = await api.post("/api/society/admin/treasury/fds", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["treasury"] });
    },
  });
}

export function useDeleteFixedDepositMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/society/admin/treasury/fds/${id}`);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["treasury"] });
    },
  });
}

// 24. Block Summaries Query
export function useBlockSummariesQuery() {
  return useQuery({
    queryKey: queryKeys.treasury.blockSummaries(),
    queryFn: async () => {
      const res = await api.get("/api/society/admin/treasury/reports/blocks");
      return res.data?.data ?? [];
    },
  });
}



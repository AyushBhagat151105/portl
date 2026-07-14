import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// ── Guard & Admin ─────────────────────────────────────────────────────────────

// 1. Search residents (Guard)
export function useSearchResidentsQuery(search: string) {
  return useQuery({
    queryKey: ["residents", search],
    queryFn: async () => {
      const res = await api.get("/api/society/search-residents", { params: { search } });
      return res.data?.data ?? [];
    },
    enabled: search.length >= 2,
  });
}

// 2. Active logs (Guard & Admin)
export function useActiveVisitorsQuery() {
  return useQuery({
    queryKey: ["visitors", "active"],
    queryFn: async () => {
      const res = await api.get("/api/society/visitors/active");
      return res.data?.data ?? [];
    },
    refetchInterval: 10000, // refresh every 10s
  });
}

// 3. Register visitor (Guard)
export function useRegisterVisitorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; purpose?: string; type: "GUEST" | "DELIVERY" | "CAB" | "STAFF"; flatId: string }) => {
      const res = await api.post("/api/society/visitors", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
    },
  });
}

// 4. Verify guest passcode (Guard)
export function useVerifyPasscodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post("/api/society/visitors/verify-code", { code });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
    },
  });
}

// 5. Mark visitor checkout (Guard)
export function useMarkExitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitorId: string) => {
      const res = await api.patch(`/api/society/visitors/${visitorId}/exit`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
      queryClient.invalidateQueries({ queryKey: ["visitors", "history"] });
    },
  });
}

// 5.5 Get resident flats
export function useMyFlatsQuery() {
  return useQuery({
    queryKey: ["my-flats"],
    queryFn: async () => {
      const res = await api.get("/api/society/my-flats");
      return res.data?.data ?? [];
    },
  });
}

// 6. Resident pending gate calls
export function usePendingGateCallsQuery() {
  return useQuery({
    queryKey: ["visitors", "pending"],
    queryFn: async () => {
      const res = await api.get("/api/society/visitors/pending");
      return res.data?.data ?? [];
    },
    refetchInterval: 5000, // refresh every 5s for responsive gate calls!
  });
}

// 7. Resident respond to gate call (Approve/Reject)
export function useRespondVisitorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ visitorId, status }: { visitorId: string; status: "APPROVED" | "REJECTED" }) => {
      const res = await api.patch(`/api/society/visitors/${visitorId}/respond`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "pending"] });
    },
  });
}

// 8. Resident pre-approve guest
export function usePreApproveGuestMutation() {
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; purpose?: string; flatId: string }) => {
      const res = await api.post("/api/society/visitors/pre-approve", data);
      return res.data?.data; // contains preApprovedCode
    },
  });
}

// 9. Notices board
export function useNoticesQuery() {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await api.get("/api/society/notices");
      return res.data?.data ?? [];
    },
  });
}

export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await api.post("/api/society/notices", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

// 10. Polls
export function usePollsQuery() {
  return useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      const res = await api.get("/api/society/polls");
      return res.data?.data ?? [];
    },
  });
}

export function useVotePollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      const res = await api.post(`/api/society/polls/${pollId}/vote`, { optionIndex });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function useCreatePollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { question: string; options: string[] }) => {
      const res = await api.post("/api/society/polls", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// 11. Helpdesk complaints
export function useComplaintsQuery() {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const res = await api.get("/api/society/complaints");
      return res.data?.data ?? [];
    },
  });
}

export function useRaiseComplaintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; flatId?: string }) => {
      const res = await api.post("/api/society/complaints", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

export function useUpdateComplaintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ complaintId, status }: { complaintId: string; status: "PENDING" | "IN_PROGRESS" | "RESOLVED" }) => {
      const res = await api.patch(`/api/society/complaints/${complaintId}`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

// 12. Amenities booking
export function useAmenitiesQuery() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const res = await api.get("/api/society/amenities");
      return res.data?.data ?? [];
    },
  });
}

export function useBookAmenityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amenityId: string; date: string; timeslot: string }) => {
      const res = await api.post("/api/society/amenities/book", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

// 13. Staff Directory
export function useStaffQuery() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get("/api/society/staff");
      return res.data?.data ?? [];
    },
  });
}

// 14. Push notifications registration
export function useRegisterPushTokenMutation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post("/api/notifications/register-token", { token });
      return res.data?.data;
    },
  });
}

// 15. In-app Alert logs
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/api/society/notifications");
      return res.data?.data ?? [];
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await api.patch(`/api/society/notifications/${notificationId}/read`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// 16. Current user society membership (for onboarding gate)
export function useMyMembershipQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-membership"],
    queryFn: async () => {
      const res = await api.get("/api/society/my-membership");
      return res.data?.data ?? null;
    },
    enabled,
    retry: false,
    staleTime: 1000 * 30,
  });
}

// 17. Join a society by slug
export function useJoinSocietyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { slug: string; role: "resident" | "guard" }) => {
      const res = await api.post("/api/society/join", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-membership"] });
    },
  });
}

// 18. Get all towers with flats (Admin & Resident)
export function useTowersQuery() {
  return useQuery({
    queryKey: ["towers"],
    queryFn: async () => {
      const res = await api.get("/api/society/towers");
      return res.data?.data ?? [];
    },
  });
}

// 19. Get all society members (Admin)
export function useMembersQuery() {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await api.get("/api/society/members");
      return res.data?.data ?? [];
    },
  });
}

// 20. Assign resident to a flat (Admin)
export function useAssignFlatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; flatId: string }) => {
      const res = await api.patch("/api/society/residents/assign-flat", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// 21. Create an amenity (Admin)
export function useCreateAmenityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; location?: string; capacity?: number }) => {
      const res = await api.post("/api/society/amenities", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

// 22. Create a staff provider (Admin)
export function useCreateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; role: string; code?: string }) => {
      const res = await api.post("/api/society/staff", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

// 23. Delete a staff provider (Admin)
export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.delete(`/api/society/staff/${staffId}`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

// 24. Get visitor history — EXITED + REJECTED (Guard & Admin)
export function useVisitorHistoryQuery() {
  return useQuery({
    queryKey: ["visitors", "history"],
    queryFn: async () => {
      const res = await api.get("/api/society/visitors/history");
      return res.data?.data ?? [];
    },
  });
}

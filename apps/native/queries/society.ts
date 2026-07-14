import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// 1. Search residents (Guard)
export function useSearchResidentsQuery(search: string) {
  return useQuery({
    queryKey: ["residents", search],
    queryFn: async () => {
      const res = await api.get("/api/society/search-residents", { params: { search } });
      return res.data;
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
      return res.data;
    },
    refetchInterval: 10000, // refresh every 10s
  });
}

// 3. Register visitor (Guard)
export function useRegisterVisitorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; purpose?: string; type: "GUEST" | "DELIVERY" | "CAB" | "STAFF"; flatId: string }) => {
      return await api.post("/api/society/visitors", data);
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
      return await api.post("/api/society/visitors/verify-code", { code });
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
      return await api.patch(`/api/society/visitors/${visitorId}/exit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
    },
  });
}

// 5.5 Get resident flats
export function useMyFlatsQuery() {
  return useQuery({
    queryKey: ["my-flats"],
    queryFn: async () => {
      const res = await api.get("/api/society/my-flats");
      return res.data;
    },
  });
}

// 6. Resident pending gate calls
export function usePendingGateCallsQuery() {
  return useQuery({
    queryKey: ["visitors", "pending"],
    queryFn: async () => {
      const res = await api.get("/api/society/visitors/pending");
      return res.data;
    },
    refetchInterval: 5000, // refresh every 5s for responsive gate calls!
  });
}

// 7. Resident respond to gate call (Approve/Reject)
export function useRespondVisitorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ visitorId, status }: { visitorId: string; status: "APPROVED" | "REJECTED" }) => {
      return await api.patch(`/api/society/visitors/${visitorId}/respond`, { status });
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
      return res.data; // contains preApprovedCode
    },
  });
}

// 9. Notices board
export function useNoticesQuery() {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await api.get("/api/society/notices");
      return res.data;
    },
  });
}

export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return await api.post("/api/society/notices", data);
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
      return res.data;
    },
  });
}

export function useVotePollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      return await api.post(`/api/society/polls/${pollId}/vote`, { optionIndex });
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
      return await api.post("/api/society/polls", data);
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
      return res.data;
    },
  });
}

export function useRaiseComplaintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; flatId?: string }) => {
      return await api.post("/api/society/complaints", data);
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
      return await api.patch(`/api/society/complaints/${complaintId}`, { status });
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
      return res.data;
    },
  });
}

export function useBookAmenityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amenityId: string; date: string; timeslot: string }) => {
      return await api.post("/api/society/amenities/book", data);
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
      return res.data;
    },
  });
}

// 14. Push notifications registration
export function useRegisterPushTokenMutation() {
  return useMutation({
    mutationFn: async (token: string) => {
      return await api.post("/api/notifications/register-token", { token });
    },
  });
}

// 15. In-app Alert logs
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/api/society/notifications");
      return res.data;
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return await api.patch(`/api/society/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

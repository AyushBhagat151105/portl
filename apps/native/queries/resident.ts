import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// 1. Get resident's registered flats
export function useMyFlatsQuery() {
  return useQuery({
    queryKey: ["my-flats"],
    queryFn: async () => {
      const res = await api.get("/api/society/resident/my-flats");
      return res.data?.data ?? [];
    },
  });
}

// 2. Get active/pending gate entry alerts
export function usePendingGateCallsQuery() {
  return useQuery({
    queryKey: ["visitors", "pending"],
    queryFn: async () => {
      const res = await api.get("/api/society/resident/visitors/pending");
      return res.data?.data ?? [];
    },
    refetchInterval: 5000, // refresh every 5s for responsive gate calls!
  });
}

// 3. Respond to entry check alert (Approve / Reject)
export function useRespondVisitorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ visitorId, status }: { visitorId: string; status: "APPROVED" | "REJECTED" }) => {
      const res = await api.patch(`/api/society/resident/visitors/${visitorId}/respond`, { status });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "pending"] });
    },
  });
}

// 4. Resident pre-approve invitation code generation
export function usePreApproveGuestMutation() {
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; purpose?: string; flatId: string }) => {
      const res = await api.post("/api/society/resident/visitors/pre-approve", data);
      return res.data?.data; // contains preApprovedCode
    },
  });
}

// 5. Vote in active community poll
export function useVotePollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      const res = await api.post(`/api/society/resident/polls/${pollId}/vote`, { optionIndex });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

// 6. Raise helpdesk complaint ticket
export function useRaiseComplaintMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; flatId?: string }) => {
      const res = await api.post("/api/society/resident/complaints", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

// 7. Book society amenity timeslot
export function useBookAmenityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amenityId: string; date: string; timeslot: string }) => {
      const res = await api.post("/api/society/resident/amenities/book", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "./keys";
import { useIsAppActive } from "../hooks/useIsAppActive";

// 1. Get resident's registered flats
export function useMyFlatsQuery() {
  return useQuery({
    queryKey: queryKeys.myFlats(),
    queryFn: async () => {
      const res = await api.get("/api/society/resident/my-flats");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5min — flat assignments change rarely
  });
}

// 2. Get active/pending gate entry alerts
export function usePendingGateCallsQuery() {
  const isAppActive = useIsAppActive();
  return useQuery({
    queryKey: queryKeys.visitors.pending(),
    queryFn: async () => {
      const res = await api.get("/api/society/resident/visitors/pending");
      return res.data?.data ?? [];
    },
    refetchInterval: isAppActive ? 5000 : false, // pause polling when app is backgrounded
    staleTime: 0, // always fresh for live gate alerts
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.visitors.pending() });
    },
  });
}

// 4. Resident pre-approve invitation code generation
export function usePreApproveGuestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; purpose?: string; flatId: string }) => {
      const res = await api.post("/api/society/resident/visitors/pre-approve", data);
      return res.data?.data; // contains preApprovedCode
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.visitors.pending() });
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.polls() });
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.complaints() });
    },
  });
}

// 7. Book society amenity timeslot
export function useBookAmenityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amenityId: string; date: string; timeslot: string; purpose?: string }) => {
      const res = await api.post("/api/society/resident/amenities/book", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.amenities() });
    },
  });
}

// 8. Get resident's dues and bills
export function useResidentDuesQuery() {
  return useQuery({
    queryKey: queryKeys.dues.resident(),
    queryFn: async () => {
      const res = await api.get("/api/society/resident/dues");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 30, // 30s — due status can change after payment
  });
}

// 9. Generate Razorpay order for due payment
export function useCreateRazorpayOrderMutation() {
  return useMutation({
    mutationFn: async (dueId: string) => {
      const res = await api.post(`/api/society/resident/dues/${dueId}/order`);
      return res.data?.data;
    },
  });
}

// 10. Verify payment and mark due PAID
export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      dueId: string;
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      const res = await api.post(`/api/society/resident/dues/${data.dueId}/verify-payment`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["dues"] });
    },
  });
}

// 10b. Get resident profile
export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/api/society/resident/profile");
      return res.data?.data;
    },
  });
}

// 11. Update resident profile
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name?: string;
      email?: string;
      phone?: string | null;
      aadharNumber?: string | null;
      image?: string | null;
      aadharPublicId?: string | null;
      vehicles?: { plateNumber: string; makeModel?: string | null; type: "CAR" | "BIKE" }[];
    }) => {
      const res = await api.put("/api/society/resident/profile", data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.membership() });
      queryClient.invalidateQueries({ queryKey: queryKeys.members() });
    },
  });
}

// 12. Search vehicle plate
export function useSearchVehicleQuery(plateNumber: string) {
  return useQuery({
    queryKey: ["vehicles", "search", plateNumber],
    queryFn: async () => {
      if (!plateNumber) return null;
      const res = await api.get("/api/society/resident/vehicles/search", { params: { plateNumber } });
      return res.data?.data ?? null;
    },
    enabled: plateNumber.length >= 3,
  });
}

// 13. Send vehicle blocking alert
export function useNotifyVehicleBlockingMutation() {
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const res = await api.post(`/api/society/resident/vehicles/${vehicleId}/notify-blocking`);
      return res.data?.data;
    },
  });
}

// 14. Get temporary signed download URL for Aadhar card
export function useAadharSignedUrlQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["profile", "aadhar-url"],
    queryFn: async () => {
      const res = await api.get("/api/society/media/aadhar-url");
      return res.data?.data?.url ?? null;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

// 15. Delete profile picture avatar
export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete("/api/society/media/avatar");
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.membership() });
      queryClient.invalidateQueries({ queryKey: queryKeys.members() });
    },
  });
}

// 16. Delete Aadhar card file
export function useDeleteAadharMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete("/api/society/media/aadhar");
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "aadhar-url"] });
    },
  });
}

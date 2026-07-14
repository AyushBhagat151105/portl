import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// 1. Notices list board lookup
export function useNoticesQuery() {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await api.get("/api/society/notices");
      return res.data?.data ?? [];
    },
  });
}

// 2. Polls list board lookup
export function usePollsQuery() {
  return useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      const res = await api.get("/api/society/polls");
      return res.data?.data ?? [];
    },
  });
}

// 3. Helpdesk complaints ticket logs lookup
export function useComplaintsQuery() {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const res = await api.get("/api/society/complaints");
      return res.data?.data ?? [];
    },
  });
}

// 4. Amenities list lookup
export function useAmenitiesQuery() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const res = await api.get("/api/society/amenities");
      return res.data?.data ?? [];
    },
  });
}

// 5. Staff Directory contacts lookup
export function useStaffQuery() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get("/api/society/staff");
      return res.data?.data ?? [];
    },
  });
}

// 6. Register FCM Push token
export function useRegisterPushTokenMutation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post("/api/notifications/register-token", { token });
      return res.data?.data;
    },
  });
}

// 7. Get in-app notification alerts history
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/api/society/notifications");
      return res.data?.data ?? [];
    },
  });
}

// 8. Mark in-app notification read
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

// 9. Current user active society membership check (onboarding gate)
export function useMyMembershipQuery(userId?: string, enabled = true) {
  return useQuery({
    queryKey: ["my-membership"],
    queryFn: async () => {
      const res = await api.get("/api/society/my-membership");
      return res.data?.data ?? null;
    },
    enabled,
    retry: 1,
    staleTime: 1000 * 30,
  });
}

// 10. Join a society by slug
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

// 11. Get society structure towers with flats
export function useTowersQuery() {
  return useQuery({
    queryKey: ["towers"],
    queryFn: async () => {
      const res = await api.get("/api/society/towers");
      return res.data?.data ?? [];
    },
  });
}

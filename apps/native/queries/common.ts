import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "./keys";

// 1. Notices list board lookup
export function useNoticesQuery() {
  return useQuery({
    queryKey: queryKeys.notices(),
    queryFn: async () => {
      const res = await api.get("/api/society/notices");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60, // 60s — notices are updated infrequently
  });
}

// 2. Polls list board lookup
export function usePollsQuery(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.polls(),
    queryFn: async () => {
      const res = await api.get("/api/society/polls");
      return res.data?.data ?? [];
    },
    staleTime: options?.refetchInterval ? 0 : 1000 * 30, // 30s — vote counts change as members vote
    ...options,
  });
}

// 3. Helpdesk complaints ticket logs lookup
export function useComplaintsQuery() {
  return useQuery({
    queryKey: queryKeys.complaints(),
    queryFn: async () => {
      const res = await api.get("/api/society/complaints");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 30, // 30s — status changes on admin action
  });
}

// 4. Amenities list lookup
export function useAmenitiesQuery() {
  return useQuery({
    queryKey: queryKeys.amenities(),
    queryFn: async () => {
      const res = await api.get("/api/society/amenities");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5min — amenity configs rarely change
  });
}

// 5. Staff Directory contacts lookup
export function useStaffQuery() {
  return useQuery({
    queryKey: queryKeys.staff(),
    queryFn: async () => {
      const res = await api.get("/api/society/staff");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10min — staff directory is very stable
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
  return useQuery<{ data: any[]; nextCursor: string | null }>({
    queryKey: queryKeys.notifications(),
    queryFn: async () => {
      const res = await api.get("/api/society/notifications");
      return res.data?.data ?? { data: [], nextCursor: null };
    },
    staleTime: 1000 * 20, // 20s — fresh enough for notification badge
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });
}

// 9. Current user active society membership check (onboarding gate)
export function useMyMembershipQuery(userId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.membership(userId),
    queryFn: async () => {
      const res = await api.get("/api/society/my-membership");
      return res.data?.data ?? null;
    },
    enabled: enabled && !!userId,
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
      return queryClient.invalidateQueries({ queryKey: queryKeys.membership() });
    },
  });
}

// 11. Get society structure towers with flats
export function useTowersQuery() {
  return useQuery({
    queryKey: queryKeys.towers(),
    queryFn: async () => {
      const res = await api.get("/api/society/towers");
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10min — tower/flat structure is very stable
  });
}

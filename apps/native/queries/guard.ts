import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "./keys";
import { useIsAppActive } from "../hooks/useIsAppActive";

// 1. Search resident flat directory
export function useSearchResidentsQuery(search: string) {
  return useQuery({
    queryKey: queryKeys.residents(search),
    queryFn: async () => {
      const res = await api.get("/api/society/guard/search-residents", { params: { search } });
      return res.data?.data ?? [];
    },
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 2, // 2min — flat/resident assignments change rarely
  });
}

// 2. Get active visitors currently inside gates (Active / Pending)
export function useActiveVisitorsQuery() {
  const isAppActive = useIsAppActive();
  return useQuery({
    queryKey: queryKeys.visitors.active(),
    queryFn: async () => {
      const res = await api.get("/api/society/guard/visitors/active");
      return res.data?.data ?? [];
    },
    refetchInterval: isAppActive ? 10000 : false, // pause when app is backgrounded
    staleTime: 0, // always fresh for live gate data
  });
}

// 3. Register a visitor check-in
export function useRegisterVisitorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; purpose?: string; type: "GUEST" | "DELIVERY" | "CAB" | "STAFF"; flatId: string }) => {
      const res = await api.post("/api/society/guard/visitors", data);
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.visitors.active() });
    },
  });
}

// 4. Verify passcode check-in
export function useVerifyPasscodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post("/api/society/guard/visitors/verify-code", { code });
      return res.data?.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.visitors.active() });
    },
  });
}

// 5. Mark visitor checkout exit
export function useMarkExitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitorId: string) => {
      const res = await api.patch(`/api/society/guard/visitors/${visitorId}/exit`);
      return res.data?.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.visitors.active() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.visitors.history() });
    },
  });
}

// 6. Get visitor history logs (Exited + Rejected)
export function useVisitorHistoryQuery() {
  return useQuery<{ data: any[]; nextCursor: string | null }>({
    queryKey: queryKeys.visitors.history(),
    queryFn: async () => {
      const res = await api.get("/api/society/guard/visitors/history");
      return res.data?.data ?? { data: [], nextCursor: null };
    },
    staleTime: 1000 * 60 * 2, // 2min — history doesn't change rapidly
  });
}

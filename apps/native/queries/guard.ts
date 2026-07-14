import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// 1. Search resident flat directory
export function useSearchResidentsQuery(search: string) {
  return useQuery({
    queryKey: ["residents", search],
    queryFn: async () => {
      const res = await api.get("/api/society/guard/search-residents", { params: { search } });
      return res.data?.data ?? [];
    },
    enabled: search.length >= 2,
  });
}

// 2. Get active visitors currently inside gates (Active / Pending)
export function useActiveVisitorsQuery() {
  return useQuery({
    queryKey: ["visitors", "active"],
    queryFn: async () => {
      const res = await api.get("/api/society/guard/visitors/active");
      return res.data?.data ?? [];
    },
    refetchInterval: 10000, // refresh every 10s
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
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
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
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors", "active"] });
      queryClient.invalidateQueries({ queryKey: ["visitors", "history"] });
    },
  });
}

// 6. Get visitor history logs (Exited + Rejected)
export function useVisitorHistoryQuery() {
  return useQuery({
    queryKey: ["visitors", "history"],
    queryFn: async () => {
      const res = await api.get("/api/society/guard/visitors/history");
      return res.data?.data ?? [];
    },
  });
}

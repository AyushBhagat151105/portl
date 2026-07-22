import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "../keys";

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

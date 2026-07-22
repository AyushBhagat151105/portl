import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "../keys";

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

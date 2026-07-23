import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";


export function useNotificationHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
  Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      queryClient.invalidateQueries();

      
      if (data?.url && typeof data.url === "string") {
        router.push(data.url as any);
      }
    });

    return () => subscription.remove();
  }, [queryClient]);
}

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  console.log("🔔 [Push Notification] registerForPushNotificationsAsync called");

  if (Platform.OS === "web") {
    console.log("🔔 [Push Notification] Aborted: Platform is web");
    return null;
  }

  if (Platform.OS === "android") {
    console.log("🔔 [Push Notification] Setting up default notification channel");
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (!Device.isDevice) {
    console.log("🔔 [Push Notification] Aborted: Running on emulator, not a physical device");
    return null;
  }

  const existing = (await Notifications.getPermissionsAsync()) as {
    granted?: boolean;
    status?: string;
  };
  const existingGranted = existing.granted ?? existing.status === "granted";
  console.log("🔔 [Push Notification] Existing permission granted status:", existingGranted);

  const requested = existingGranted
    ? existing
    : ((await Notifications.requestPermissionsAsync()) as {
        granted?: boolean;
        status?: string;
      });
  const finalStatus = (requested.granted ?? requested.status === "granted") ? "granted" : "denied";
  console.log("🔔 [Push Notification] Final permission status:", finalStatus);

  if (finalStatus !== "granted") {
    console.log("🔔 [Push Notification] Aborted: Permission not granted");
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  console.log("🔔 [Push Notification] EAS Project ID:", projectId);
  if (!projectId) {
    console.warn("🔔 [Push Notification] EAS project ID not found in app config");
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("🔔 [Push Notification] Generated Expo Token successfully:", token.data);
    return token.data;
  } catch (error) {
    console.warn("🔔 [Push Notification] Failed to get Expo push token:", error);
    return null;
  }
}

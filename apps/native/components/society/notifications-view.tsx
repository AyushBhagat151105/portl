import React from "react";
import { Text, View, Pressable, useColorScheme } from "react-native";
import { useNotificationsQuery, useMarkNotificationReadMutation } from "../../queries/society";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

export function NotificationsView() {
  const { data: notifications, isLoading } = useNotificationsQuery();
  const readMutation = useMarkNotificationReadMutation();
  const colorScheme = useColorScheme();

  if (isLoading) {
    return <Loader />;
  }

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";
  const borderColorDefault = colorScheme === "dark" ? "#44403c" : "#e4d9bc";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
        In-App Notification Logs
      </Text>

      {!notifications || notifications.length === 0 ? (
        <Card className="items-center p-6">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
            No notification alerts logged.
          </Text>
        </Card>
      ) : (
        notifications.map((not: any) => (
          <Card
            key={not.id}
            className="mb-3"
            style={{
              borderColor: not.read ? borderColorDefault : primaryColor,
              borderWidth: 1,
            }}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <CardTitle>{not.title}</CardTitle>
                <CardDescription>{not.body}</CardDescription>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-2.5">
                  {new Date(not.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} @{" "}
                  {new Date(not.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>

              {!not.read && (
                <Pressable
                  disabled={readMutation.isPending}
                  onPress={() => readMutation.mutate(not.id)}
                  className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 px-2 py-1 rounded-md active:opacity-75"
                >
                  <Text className="text-primary-light dark:text-primary-dark text-xxs font-semibold">Mark Read</Text>
                </Pressable>
              )}
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}
export default NotificationsView;

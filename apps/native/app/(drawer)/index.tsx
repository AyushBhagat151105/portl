import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";

export default function Index() {
  const { data: session, isPending } = authClient.useSession();
  const { currentRole } = useSocietyStore();

  if (isPending) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (currentRole === "resident") {
    return <Redirect href="/(drawer)/resident/dashboard" />;
  } else if (currentRole === "guard") {
    return <Redirect href="/(drawer)/guard/dashboard" />;
  } else {
    return <Redirect href="/(drawer)/admin/dashboard" />;
  }
}

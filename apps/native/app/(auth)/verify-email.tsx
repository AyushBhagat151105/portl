import { Text, View, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { VerifyEmail as VerifyEmailForm } from "@/components/verify-email";
import { ScreenContainer } from "@/components/ui/screen-container";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const token = typeof params.token === "string" ? params.token : undefined;
  const email = typeof params.email === "string" ? params.email : undefined;

  return (
    <ScreenContainer contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, justifyContent: "center" }}>
      <View className="py-6 items-center">
        <Ionicons name="mail-open-outline" size={48} color="#b45309" />
        <Text className="text-3xl font-extrabold text-foreground-light dark:text-foreground-dark mt-3 text-center">
          Portl Gate
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center mt-1.5 px-4">
          Email verification status.
        </Text>
      </View>

      <View className="gap-6">
        <VerifyEmailForm token={token} email={email} />

        <View className="flex-row justify-center items-center mt-2">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Back to </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}

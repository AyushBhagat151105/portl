import { Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ForgotPassword as ForgotPasswordForm } from "@/components/forgot-password";
import { ScreenContainer } from "@/components/ui/screen-container";

export default function ForgotPasswordScreen() {
  return (
    <ScreenContainer contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, justifyContent: "center" }}>
      <View className="py-6 items-center">
        <Ionicons name="lock-open-outline" size={48} color="#b45309" />
        <Text className="text-3xl font-extrabold text-foreground-light dark:text-foreground-dark mt-3 text-center">
          Portl Gate
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center mt-1.5 px-4">
          Recover access to your account.
        </Text>
      </View>

      <View className="gap-6">
        <ForgotPasswordForm />

        <View className="flex-row justify-center items-center mt-2">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Remembered your password? </Text>
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

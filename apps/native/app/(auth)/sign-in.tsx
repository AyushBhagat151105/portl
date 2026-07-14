import { Text, View, Pressable } from "react-native";
import { Link, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SignIn as SignInForm } from "@/components/sign-in";
import { authClient } from "@/lib/auth-client";
import { ScreenContainer } from "@/components/ui/screen-container";

export default function SignInScreen() {
  const { data: session } = authClient.useSession();

  if (session) {
    return <Redirect href="/(drawer)" />;
  }

  return (
    <ScreenContainer contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, justifyContent: "center" }}>
      <View className="py-8 items-center">
        <Ionicons name="key-outline" size={48} color="#b45309" />
        <Text className="text-3xl font-extrabold text-foreground-light dark:text-foreground-dark mt-3 text-center">
          Portl Gate
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center mt-1.5 px-4">
          Smart Society Operations, Visitor Verification, Helpdesk & Community Bookings.
        </Text>
      </View>

      <View className="gap-6">
        <SignInForm />
        
        <View className="flex-row justify-center items-center mt-4">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}

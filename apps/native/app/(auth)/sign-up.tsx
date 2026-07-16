import { Text, View, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SignUp as SignUpForm } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useEffect, useRef } from "react";

export default function SignUpScreen() {
  const { data: session } = authClient.useSession();
  const isSubmittingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if session is present and we did not just submit the form
    if (session && !isSubmittingRef.current) {
      router.replace("/(drawer)");
    }
  }, [session]);

  return (
    <ScreenContainer contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, justifyContent: "center" }}>
      <View className="py-8 items-center">
        <Ionicons name="person-add-outline" size={48} color="#b45309" />
        <Text className="text-3xl font-extrabold text-foreground-light dark:text-foreground-dark mt-3 text-center">
          Portl Gate
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center mt-1.5 px-4">
          Join your society community workspace.
        </Text>
      </View>

      <View className="gap-6">
        <SignUpForm isSubmittingRef={isSubmittingRef} />
        
        <View className="flex-row justify-center items-center mt-4">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Already have an account? </Text>
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

import { Text, View, Pressable } from "react-native";
import { Link, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SignUp as SignUpForm } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function SignUpScreen() {
  const { data: session } = authClient.useSession();

  if (session) {
    return <Redirect href="/(drawer)" />;
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950 px-6 py-8"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="py-12 items-center">
        <Ionicons name="person-add-outline" size={48} color="#f59e0b" />
        <Text className="text-3xl font-extrabold text-white mt-3 text-center">Portl Gate</Text>
        <Text className="text-zinc-500 text-xs text-center mt-1.5 px-4">
          Join your society community workspace.
        </Text>
      </View>

      <View className="gap-6">
        <SignUpForm />
        
        <View className="flex-row justify-center items-center mt-4">
          <Text className="text-zinc-500 text-xs">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="text-amber-500 text-xs font-bold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}



import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#09090b" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700", color: "#ffffff" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#09090b" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Get Started", headerShown: false }} />
      <Stack.Screen name="create-society" options={{ title: "Create Society", headerShown: false }} />
      <Stack.Screen name="join-society" options={{ title: "Join Society", headerShown: false }} />
      <Stack.Screen
        name="setup-structure"
        options={{
          title: "Setup Structure",
          headerShown: true,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}

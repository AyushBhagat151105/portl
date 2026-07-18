import React, { useState } from "react";
import { Text, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { useVerifyPasscodeMutation } from "@/queries/society";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "@/components/ui/screen-container";
import { Card } from "@/components/ui/card";
import { CameraScanner } from "@/components/society/guard/camera-scanner";
import { ManualCodeCard } from "@/components/society/guard/manual-code-card";

export function ScanQRView() {
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const verifyMutation = useVerifyPasscodeMutation();
  const { showToast } = useToastStore();
  const [permission, requestPermission] = useCameraPermissions();

  const handleVerify = async (code: string) => {
    if (code.length !== 6) {
      showToast("Please enter a valid 6-digit passcode", "error");
      return;
    }

    try {
      await verifyMutation.mutateAsync(code);
      showToast("Access granted! Guest checked in.", "success");
      setScanned(false);
    } catch (err: any) {
      showToast(err.message || "Invalid or expired passcode", "error");
      setScanned(false);
    }
  };

  // Camera permission fallback screen
  if (!permission) {
    return (
      <ScreenContainer contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, justifyContent: "center", flex: 1 }}>
        <Card className="items-center p-6 border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5">
          <Ionicons name="camera-outline" size={48} color="#78716c" />
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-lg mt-4 mb-2">
            Camera Permission Needed
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm text-center mb-5">
            Allow camera access to scan guest QR codes at the gate.
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-primary-light dark:bg-primary-dark py-3 px-6 rounded-xl active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel="Enable device camera access"
          >
            <Text className="text-white font-bold text-sm">Enable Camera</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("manual")}
            className="mt-3 py-2"
            accessibilityRole="button"
            accessibilityLabel="Switch to enter passcode manually"
          >
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
              Or enter code manually
            </Text>
          </Pressable>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      {/* Mode Switcher Toggle */}
      <View className="flex-row mx-4 mt-4 mb-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-1 gap-1">
        {(["camera", "manual"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-90"
            style={{
              backgroundColor: mode === m ? "#b45309" : "transparent",
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === m }}
          >
            <Ionicons
              name={m === "camera" ? "scan-outline" : "keypad-outline"}
              size={14}
              color={mode === m ? "#ffffff" : "#78716c"}
            />
            <Text
              className="text-xs font-semibold capitalize"
              style={{ color: mode === m ? "#ffffff" : "#78716c" }}
            >
              {m === "camera" ? "Scan QR" : "Type Code"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "camera" ? (
        <CameraScanner
          onScan={(data) => {
            setScanned(true);
            handleVerify(data);
          }}
          scanned={scanned}
          isVerifying={verifyMutation.isPending}
        />
      ) : (
        <ManualCodeCard
          onVerify={handleVerify}
          isVerifying={verifyMutation.isPending}
        />
      )}
    </ScreenContainer>
  );
}

export default ScanQRView;

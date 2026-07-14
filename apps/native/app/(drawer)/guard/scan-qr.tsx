import React, { useState } from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useVerifyPasscodeMutation } from "@/queries/society";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "@/components/ui/screen-container";
import { Card } from "@/components/ui/card";

export function ScanQRView() {
  const [manualCode, setManualCode] = useState("");
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
      setManualCode("");
      setScanned(false);
    } catch (err: any) {
      showToast(err.message || "Invalid or expired passcode", "error");
      setScanned(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || verifyMutation.isPending) return;
    setScanned(true);
    handleVerify(data);
  };

  // Camera permission screen
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
        <Card className="items-center p-6">
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
          >
            <Text className="text-white font-bold text-sm">Enable Camera</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("manual")}
            className="mt-3 py-2"
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
      {/* Mode Toggle */}
      <View className="flex-row mx-4 mt-4 mb-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-1 gap-1">
        {(["camera", "manual"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: mode === m ? "#b45309" : "transparent",
            }}
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
        /* Camera Scanner */
        <View className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden bg-black">
          <CameraView
            style={{ flex: 1 }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          {/* Scanner Overlay */}
          <View className="absolute inset-0 items-center justify-center">
            <View
              className="w-56 h-56 border-2 border-white/40 rounded-3xl"
              style={{
                backgroundColor: "transparent",
                shadowColor: "#f59e0b",
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }}
            />
            <Text className="text-white text-xs font-semibold mt-4 bg-black/50 px-4 py-2 rounded-full">
              Point camera at guest's QR code
            </Text>
          </View>

          {verifyMutation.isPending && (
            <View className="absolute inset-0 bg-black/60 items-center justify-center">
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text className="text-white text-sm font-semibold mt-3">Verifying passcode...</Text>
            </View>
          )}
        </View>
      ) : (
        /* Manual Code Entry */
        <View className="flex-1 mx-4 mb-4">
          <Card className="gap-4">
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-2 uppercase tracking-wider font-medium">
                Enter 6-Digit Passcode
              </Text>
              <TextInput
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="e.g. 123456"
                placeholderTextColor="#78716c"
                keyboardType="number-pad"
                maxLength={6}
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-4 text-center text-3xl font-extrabold tracking-widest focus:border-primary-light dark:focus:border-primary-dark"
              />
            </View>

            <Pressable
              disabled={verifyMutation.isPending || manualCode.length !== 6}
              onPress={() => handleVerify(manualCode)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 items-center justify-center active:opacity-90 disabled:opacity-50"
            >
              {verifyMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Verify & Grant Access</Text>
              )}
            </Pressable>
          </Card>
        </View>
      )}
    </ScreenContainer>
  );
}

export default ScanQRView;

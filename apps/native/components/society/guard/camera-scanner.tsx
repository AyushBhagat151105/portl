import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { CameraView } from "expo-camera";

interface CameraScannerProps {
  onScan: (data: string) => void;
  scanned: boolean;
  isVerifying: boolean;
}

export function CameraScanner({ onScan, scanned, isVerifying }: CameraScannerProps) {
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || isVerifying) return;
    onScan(data);
  };

  return (
    <View className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden bg-black">
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {/* Scanner Target Bounds Overlay */}
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

      {isVerifying && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-white text-sm font-semibold mt-3">Verifying passcode...</Text>
        </View>
      )}
    </View>
  );
}
export default CameraScanner;

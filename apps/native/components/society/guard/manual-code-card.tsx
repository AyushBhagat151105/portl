import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Card } from "../../ui/card";

interface ManualCodeCardProps {
  onVerify: (code: string) => Promise<void>;
  isVerifying: boolean;
}

export function ManualCodeCard({ onVerify, isVerifying }: ManualCodeCardProps) {
  const [manualCode, setManualCode] = useState("");

  const handleVerify = () => {
    if (manualCode.length !== 6) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onVerify(manualCode);
  };

  return (
    <View className="flex-1 mx-4 mb-4">
      <Card className="gap-4 border border-border-light dark:border-border-dark shadow-sm">
        <View>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-2 uppercase tracking-wider font-bold">
            Enter 6-Digit Passcode
          </Text>
          <TextInput
            value={manualCode}
            onChangeText={(val) => setManualCode(val.replace(/\D/g, "").slice(0, 6))}
            placeholder="e.g. 123456"
            placeholderTextColor="#78716c"
            keyboardType="number-pad"
            maxLength={6}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-4 text-center text-3xl font-bold tracking-widest focus:border-primary-light dark:focus:border-primary-dark font-mono"
          />
        </View>

        <Pressable
          disabled={isVerifying || manualCode.length !== 6}
          onPress={handleVerify}
          className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 items-center justify-center active:opacity-90 disabled:opacity-50"
          accessibilityRole="button"
          accessibilityLabel="Verify and check in visitor"
        >
          {isVerifying ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">Verify & Grant Access</Text>
          )}
        </Pressable>
      </Card>
    </View>
  );
}
export default ManualCodeCard;

import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormModal } from "../../ui/form-modal";

interface PaymentConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: { keyId: string; keySecret: string }) => Promise<void>;
  isSaving: boolean;
  currentConfig?: {
    razorpayKeyId?: string;
    hasSecret?: boolean;
  } | null;
}

export function PaymentConfigModal({
  visible,
  onClose,
  onSave,
  isSaving,
  currentConfig,
}: PaymentConfigModalProps) {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (visible) {
      setKeyId(currentConfig?.razorpayKeyId || "");
      setKeySecret(currentConfig?.hasSecret ? "••••••••••••••••" : "");
    }
  }, [visible, currentConfig]);

  const handleSave = () => {
    onSave({
      keyId,
      keySecret,
    });
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Payment Gateway Config"
      onSubmit={handleSave}
      isSubmitting={isSaving}
      submitLabel="Save Credentials"
      maxHeight={360}
    >
      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1">
        Configure Razorpay credentials to allow residents to securely pay society maintenance bills in-app.
      </Text>

      {/* Razorpay Key ID */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Razorpay Key ID
        </Text>
        <TextInput
          value={keyId}
          onChangeText={setKeyId}
          placeholder="rzp_live_..."
          placeholderTextColor="#78716c"
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
        />
      </View>

      {/* Razorpay Secret Key */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Razorpay Secret Key
        </Text>
        <View className="relative justify-center">
          <TextInput
            value={keySecret}
            onChangeText={setKeySecret}
            secureTextEntry={!showSecret}
            placeholder="Key Secret"
            placeholderTextColor="#78716c"
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono"
          />
          <Pressable
            onPress={() => setShowSecret((s) => !s)}
            className="absolute right-3 p-1"
          >
            <Ionicons
              name={showSecret ? "eye-off-outline" : "eye-outline"}
              size={16}
              color="#78716c"
            />
          </Pressable>
        </View>
      </View>
    </FormModal>
  );
}
export default PaymentConfigModal;

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "@/store/useToastStore";
import { Card } from "../ui/card";

export function ChangeEmailCard() {
  const { data: session } = authClient.useSession();
  const { showToast } = useToastStore();
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      showToast("New email is required", "error");
      return;
    }
    setUpdatingEmail(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail,
      });
      if (error) throw new Error(error.message);
      showToast("Verification link sent to new email!", "success");
      setNewEmail("");
    } catch (err: any) {
      showToast(err.message || "Failed to initiate email change", "error");
    } finally {
      setUpdatingEmail(false);
    }
  };

  return (
    <Card>
      <Text className="text-sm font-semibold text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider mb-4">
        Change Email Address
      </Text>

      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Current Email</Text>
          <TextInput
            value={session?.user?.email}
            editable={false}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-muted-foreground-light dark:text-muted-foreground-dark text-sm px-4 py-3 rounded-xl opacity-60"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">New Email</Text>
          <TextInput
            value={newEmail}
            onChangeText={setNewEmail}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-primary-light dark:focus:border-primary-dark"
            placeholder="new.email@example.com"
            placeholderTextColor="#78716c"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          onPress={handleUpdateEmail}
          disabled={updatingEmail}
          className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center mt-2 flex-row justify-center gap-2"
        >
          {updatingEmail ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="mail-outline" size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold">Update Email</Text>
            </>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

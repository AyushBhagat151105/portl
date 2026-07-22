import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "@/store/useToastStore";
import { Card } from "../ui/card";

export function ChangePasswordCard() {
  const { showToast } = useToastStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      showToast("Both current and new passwords are required", "error");
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
      showToast("Password updated successfully!", "success");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <Card>
      <Text className="text-sm font-semibold text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider mb-4">
        Change Password
      </Text>

      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Current Password</Text>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-primary-light dark:focus:border-primary-dark"
            placeholder="••••••••"
            placeholderTextColor="#78716c"
            autoCapitalize="none"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-primary-light dark:focus:border-primary-dark"
            placeholder="••••••••"
            placeholderTextColor="#78716c"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          onPress={handleUpdatePassword}
          disabled={updatingPassword}
          className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center mt-2 flex-row justify-center gap-2"
        >
          {updatingPassword ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold">Update Password</Text>
            </>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

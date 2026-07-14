import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "../lib/auth-client";
import { useToastStore } from "../store/useToastStore";
import { ScreenContainer } from "./ui/screen-container";
import { Card } from "./ui/card";

export function SettingsView() {
  const { data: session } = authClient.useSession();
  const { showToast } = useToastStore();

  const [name, setName] = useState(session?.user?.name || "");
  const [profileImage, setProfileImage] = useState(session?.user?.image || "");
  const [newEmail, setNewEmail] = useState("");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    setUpdatingProfile(true);
    try {
      const { error } = await authClient.updateUser({
        name,
        image: profileImage || undefined,
      });
      if (error) throw new Error(error.message);
      showToast("Profile details updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

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
    <ScreenContainer contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text className="text-xl font-bold text-foreground-light dark:text-foreground-dark mt-2">
        Account Settings
      </Text>

      {/* ── PROFILE SECTION ── */}
      <Card>
        <Text className="text-sm font-semibold text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider mb-4">
          Profile Details
        </Text>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-primary-light dark:focus:border-primary-dark"
              placeholder="Your Name"
              placeholderTextColor="#78716c"
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Avatar URL (Optional)</Text>
            <TextInput
              value={profileImage}
              onChangeText={setProfileImage}
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-primary-light dark:focus:border-primary-dark"
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor="#78716c"
            />
          </View>

          <Pressable
            onPress={handleUpdateProfile}
            disabled={updatingProfile}
            className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center mt-2 flex-row justify-center gap-2"
          >
            {updatingProfile ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={16} color="#ffffff" />
                <Text className="text-white text-xs font-bold">Save Details</Text>
              </>
            )}
          </Pressable>
        </View>
      </Card>

      {/* ── CHANGE EMAIL SECTION ── */}
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

      {/* ── CHANGE PASSWORD SECTION ── */}
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
    </ScreenContainer>
  );
}
export default SettingsView;

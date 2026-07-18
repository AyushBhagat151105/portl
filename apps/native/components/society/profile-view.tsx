import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, View, Pressable, TextInput, useColorScheme, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useDeleteAvatarMutation,
  useDeleteAadharMutation,
  useAadharSignedUrlQuery,
} from "../../queries/society";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";
import { AvatarPicker } from "./profile/avatar-picker";
import { AadharWidget } from "./profile/aadhar-widget";
import { VehicleManager, type Vehicle } from "./profile/vehicle-manager";

export function ProfileView() {
  const { data: profile, isLoading, refetch } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const deleteAadharMutation = useDeleteAadharMutation();

  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [avatar, setAvatar] = useState("");
  const [aadharPublicId, setAadharPublicId] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Secure URL fetch config
  const [shouldFetchSignedUrl, setShouldFetchSignedUrl] = useState(false);
  const { refetch: fetchSignedAadharUrl } = useAadharSignedUrlQuery(shouldFetchSignedUrl);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Sync profile data when query loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAadharNumber(profile.aadharNumber || "");
      setAvatar(profile.image || "");
      setAadharPublicId(profile.aadharPublicId || "");
      setVehicles(profile.vehicles || []);
    }
  }, [profile]);

  const handleAvatarChange = async (url: string) => {
    try {
      setAvatar(url);
      await updateProfileMutation.mutateAsync({
        name,
        email,
        aadharNumber: aadharNumber || null,
        image: url,
        aadharPublicId: aadharPublicId || null,
        vehicles: vehicles,
      });
      showToast("Profile photo updated successfully!", "success");
      refetch();
      await authClient.getSession();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile picture", "error");
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      setAvatar("");
      showToast("Profile photo deleted successfully!", "success");
      refetch();
      await authClient.getSession();
    } catch (err: any) {
      showToast(err.message || "Failed to delete photo", "error");
    }
  };

  const handleAadharChange = async (publicId: string) => {
    try {
      setAadharPublicId(publicId);
      await updateProfileMutation.mutateAsync({
        name,
        email,
        aadharNumber: aadharNumber || null,
        image: avatar || null,
        aadharPublicId: publicId,
        vehicles: vehicles,
      });
      showToast("Aadhar document uploaded successfully!", "success");
      refetch();
    } catch (err: any) {
      showToast(err.message || "Failed to save Aadhar document", "error");
    }
  };

  const handleAadharDelete = async () => {
    try {
      await deleteAadharMutation.mutateAsync();
      setAadharPublicId("");
      showToast("Aadhar card file removed successfully!", "success");
      refetch();
    } catch (err: any) {
      showToast(err.message || "Failed to remove document file", "error");
    }
  };

  const handleViewAadhar = async () => {
    try {
      setShouldFetchSignedUrl(true);
      // Wait for state to bind
      setTimeout(async () => {
        const res = await fetchSignedAadharUrl();
        if (res.data) {
          await Linking.openURL(res.data);
        } else {
          showToast("Failed to retrieve secure view URL", "error");
        }
        setShouldFetchSignedUrl(false);
      }, 0);
    } catch (err: any) {
      showToast(err.message || "Could not open document link", "error");
      setShouldFetchSignedUrl(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (aadharNumber && aadharNumber.length !== 12) {
      showToast("Aadhar Card must be exactly 12 digits", "error");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        email: email,
        aadharNumber: aadharNumber || null,
        image: avatar || null,
        aadharPublicId: aadharPublicId || null,
        vehicles: vehicles,
      });
      showToast("Profile updated successfully", "success");
      refetch();
      await authClient.getSession();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Personal Profile</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
          Keep your contact information, vehicles, and secure details updated
        </Text>
      </View>

      <View className="gap-5">
        {/* Profile Avatar Picker */}
        <AvatarPicker
          avatar={avatar}
          name={name}
          onAvatarChange={handleAvatarChange}
          onAvatarDelete={handleAvatarDelete}
          primaryColor={primaryColor}
        />

        {/* Personal Details */}
        <Card>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Basic contact details</CardDescription>

          <View className="gap-4 mt-4">
            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
                Email Address
              </Text>
              <TextInput
                value={email}
                editable={false}
                placeholder="Enter email address"
                placeholderTextColor="#78716c"
                className="bg-muted-light/50 dark:bg-muted-dark/50 border border-border-light dark:border-border-dark text-muted-foreground-light dark:text-muted-foreground-dark rounded-xl px-4 py-3 text-sm"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
                Aadhar Card Number (12 Digits)
              </Text>
              <TextInput
                value={aadharNumber}
                onChangeText={(val) => setAadharNumber(val.replace(/\D/g, "").slice(0, 12))}
                keyboardType="numeric"
                secureTextEntry={true}
                placeholder="Enter 12 digit Aadhar"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark font-mono"
              />
              {aadharNumber.length > 0 && (
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-mono mt-0.5">
                  Masked: XXXX-XXXX-{aadharNumber.slice(-4)}
                </Text>
              )}
            </View>

            {/* Aadhar Private Decrypted Upload widget */}
            <AadharWidget
              aadharPublicId={aadharPublicId}
              onAadharChange={handleAadharChange}
              onAadharDelete={handleAadharDelete}
              onAadharView={handleViewAadhar}
              isViewing={shouldFetchSignedUrl}
              primaryColor={primaryColor}
            />
          </View>
        </Card>

        {/* Vehicles Sub-editor */}
        <VehicleManager
          vehicles={vehicles}
          onVehiclesChange={setVehicles}
          primaryColor={primaryColor}
          isDark={isDark}
        />

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={updateProfileMutation.isPending}
          className="bg-primary-light dark:bg-primary-dark py-4 rounded-xl items-center active:opacity-90 mt-2"
          accessibilityRole="button"
          accessibilityLabel="Save profile settings changes"
        >
          {updateProfileMutation.isPending ? (
            <Loader fullscreen={false} />
          ) : (
            <Text className="text-white font-bold text-sm">Save Profile Changes</Text>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

export default ProfileView;

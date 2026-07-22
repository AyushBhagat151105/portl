import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "@/store/useToastStore";
import { Card } from "../ui/card";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

export function ProfileDetailsCard() {
  const { data: session } = authClient.useSession();
  const { showToast } = useToastStore();

  const [name, setName] = useState(session?.user?.name || "");
  const [profileImage, setProfileImage] = useState(session?.user?.image || "");
  const [phone, setPhone] = useState((session?.user as any)?.phoneNumber || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const { upload, isUploading: uploadingAvatar } = useCloudinaryUpload({
    folder: "portl/avatars",
    type: "public",
    aspect: [1, 1],
  });

  const handleUploadAvatar = async () => {
    const res = await upload();
    if (res?.url) {
      setProfileImage(res.url);
      showToast("Avatar uploaded! Remember to save changes.", "success");
    }
  };

  const handleRemoveAvatar = () => {
    setProfileImage("");
    showToast("Avatar removed! Remember to save changes.", "info");
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    setUpdatingProfile(true);
    try {
      const { error } = await (authClient.updateUser as any)({
        name,
        image: profileImage || undefined,
        phoneNumber: phone || undefined,
      });
      if (error) throw new Error(error.message);
      showToast("Profile details updated successfully!", "success");
      await authClient.getSession();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
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

        <View className="gap-2">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Profile Picture</Text>
          <View className="flex-row items-center gap-4 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark p-3.5 rounded-xl">
            <View className="w-14 h-14 rounded-full bg-zinc-800 border border-amber-500/30 overflow-hidden items-center justify-center">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={28} color="#a1a1aa" />
              )}
            </View>

            <View className="flex-1 flex-row gap-2">
              <Pressable
                onPress={handleUploadAvatar}
                disabled={uploadingAvatar}
                className="flex-1 bg-amber-500/10 border border-amber-500/30 py-2.5 rounded-lg items-center justify-center flex-row gap-1.5 active:opacity-80 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#f59e0b" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color="#f59e0b" />
                    <Text className="text-amber-500 font-bold text-xs">Upload Photo</Text>
                  </>
                )}
              </Pressable>

              {profileImage ? (
                <Pressable
                  onPress={handleRemoveAvatar}
                  className="bg-rose-500/10 border border-rose-500/30 py-2.5 px-3 rounded-lg items-center justify-center flex-row gap-1 active:opacity-80"
                >
                  <Ionicons name="trash-outline" size={16} color="#f43f5e" />
                  <Text className="text-rose-500 font-bold text-xs">Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-primary-light dark:focus:border-primary-dark"
            placeholder="+919876543210"
            placeholderTextColor="#78716c"
            keyboardType="phone-pad"
            autoCapitalize="none"
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
  );
}

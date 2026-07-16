import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView, Image, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth-client";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useAadharSignedUrlQuery,
  useDeleteAvatarMutation,
  useDeleteAadharMutation,
} from "../../queries/resident";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

type VehicleInput = {
  plateNumber: string;
  makeModel: string;
  type: "CAR" | "BIKE";
};

export function ProfileView() {
  const { data: profile, isLoading, refetch } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteAvatarMutation = useDeleteAvatarMutation();
  const deleteAadharMutation = useDeleteAadharMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [avatar, setAvatar] = useState("");
  const [aadharPublicId, setAadharPublicId] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);
  const [shouldFetchSignedUrl, setShouldFetchSignedUrl] = useState(false);

  // Fetch signed URL on-demand
  const { refetch: fetchSignedAadharUrl } = useAadharSignedUrlQuery(shouldFetchSignedUrl);

  // Vehicles state
  const [vehicles, setVehicles] = useState<VehicleInput[]>([]);
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newType, setNewType] = useState<"CAR" | "BIKE">("CAR");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAadharNumber(profile.aadharNumber || "");
      setAvatar(profile.image || "");
      setAadharPublicId(profile.aadharPublicId || "");
      setVehicles(
        profile.vehicles?.map((v: any) => ({
          plateNumber: v.plateNumber,
          makeModel: v.makeModel || "",
          type: v.type,
        })) || []
      );
    }
  }, [profile]);

  const pickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access photo library is required!", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0]!;
      setIsUploadingAvatar(true);

      // 1. Fetch upload signature
      const sigRes = await api.get("/api/society/media/signature", {
        params: { folder: "profiles", type: "public" },
      });
      const { signature, timestamp, apiKey, cloudName, folder, type } = sigRes.data.data;

      // 2. Upload file to Cloudinary
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || "avatar.jpg";
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("type", type);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudRes = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const secureUrl = cloudRes.data?.secure_url;
      if (secureUrl) {
        setAvatar(secureUrl);
        // Save immediately to DB
        await updateProfileMutation.mutateAsync({
          name,
          email,
          aadharNumber: aadharNumber || null,
          image: secureUrl,
          aadharPublicId: aadharPublicId || null,
          vehicles: vehicles,
        });
        showToast("Profile photo updated successfully!", "success");
        refetch();
        await authClient.getSession();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      if (avatar) {
        await deleteAvatarMutation.mutateAsync();
        setAvatar("");
        showToast("Profile photo deleted successfully!", "success");
        refetch();
        await authClient.getSession();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete photo", "error");
    }
  };

  const pickAadhar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access photo library is required!", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0]!;
      setIsUploadingAadhar(true);

      // 1. Fetch private upload signature
      const sigRes = await api.get("/api/society/media/signature", {
        params: { folder: "documents", type: "private" },
      });
      const { signature, timestamp, apiKey, cloudName, folder, type } = sigRes.data.data;

      // 2. Upload file to Cloudinary
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || "aadhar.jpg";
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("type", type);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudRes = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const publicId = cloudRes.data?.public_id;
      if (publicId) {
        setAadharPublicId(publicId);
        // Save immediately to DB
        await updateProfileMutation.mutateAsync({
          name,
          email,
          aadharNumber: aadharNumber || null,
          image: avatar || null,
          aadharPublicId: publicId,
          vehicles: vehicles,
        });
        showToast("Aadhar document uploaded and saved successfully!", "success");
        refetch();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload document", "error");
    } finally {
      setIsUploadingAadhar(false);
    }
  };

  const handleDeleteAadhar = async () => {
    try {
      if (aadharPublicId) {
        await deleteAadharMutation.mutateAsync();
        setAadharPublicId("");
        showToast("Aadhar card file removed successfully!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to remove document file", "error");
    }
  };

  const handleViewAadhar = async () => {
    try {
      setShouldFetchSignedUrl(true);
      const res = await fetchSignedAadharUrl();
      if (res.data) {
        await Linking.openURL(res.data);
      } else {
        showToast("Failed to retrieve secure view URL", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Could not open document link", "error");
    }
  };

  const handleAddVehicle = () => {
    if (!newPlate.trim()) {
      showToast("Plate number is required", "error");
      return;
    }
    const cleanPlate = newPlate.toUpperCase().trim();
    if (vehicles.some((v) => v.plateNumber === cleanPlate)) {
      showToast("Vehicle already added", "error");
      return;
    }
    setVehicles([...vehicles, { plateNumber: cleanPlate, makeModel: newModel.trim(), type: newType }]);
    setNewPlate("");
    setNewModel("");
  };

  const handleRemoveVehicle = (plate: string) => {
    setVehicles(vehicles.filter((v) => v.plateNumber !== plate));
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
        name,
        email,
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
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Personal Profile</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
          Keep your contact information, vehicles, and secure details updated
        </Text>
      </View>

      <View className="gap-5">
        {/* Profile Avatar Widget */}
        <Card className="items-center py-6">
          <View className="relative">
            <View className="w-24 h-24 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark justify-center items-center">
              {isUploadingAvatar ? (
                <ActivityIndicator color={primaryColor} size="large" />
              ) : avatar ? (
                <Image source={{ uri: avatar }} className="w-full h-full" />
              ) : (
                <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black">{initials}</Text>
              )}
            </View>
            <Pressable
              onPress={pickAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center border-2 border-card-light dark:border-card-dark active:scale-95"
            >
              <Ionicons name="camera" size={14} color="#ffffff" />
            </Pressable>
          </View>

          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={pickAvatar}
              className="px-4 py-1.5 rounded-lg border border-border-light dark:border-border-dark active:opacity-75"
            >
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Upload Photo</Text>
            </Pressable>
            {avatar ? (
              <Pressable
                onPress={handleDeleteAvatar}
                className="px-4 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 active:opacity-75"
              >
                <Text className="text-rose-500 text-xs font-bold">Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>

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
                onChangeText={setEmail}
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

            {/* Aadhar Photo Document Upload Section */}
            <View className="gap-2.5 mt-2 bg-muted-light/25 dark:bg-muted-dark/25 p-3 rounded-2xl border border-border-light dark:border-border-dark">
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-semibold">
                Aadhar Card Document Attachment
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs leading-3 mb-1">
                Aadhar documents are securely encrypted on a private CDN and only accessible via signed 10-minute temporary sessions.
              </Text>

              {isUploadingAadhar ? (
                <View className="flex-row items-center justify-center p-3 gap-2">
                  <ActivityIndicator color={primaryColor} size="small" />
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold">Uploading document...</Text>
                </View>
              ) : aadharPublicId ? (
                <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-3 rounded-xl">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                    <Text className="text-emerald-500 font-bold text-xs">Document Uploaded</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleViewAadhar}
                      className="px-2.5 py-1.5 bg-muted-light dark:bg-muted-dark rounded-lg active:opacity-75 border border-border-light dark:border-border-dark"
                    >
                      <Text className="text-foreground-light dark:text-foreground-dark text-xxs font-bold">View</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleDeleteAadhar}
                      className="p-1.5 bg-rose-500/10 rounded-lg active:opacity-75 border border-rose-500/20"
                    >
                      <Ionicons name="trash-outline" size={12} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={pickAadhar}
                  className="border border-dashed border-border-light dark:border-border-dark py-3.5 rounded-xl justify-center items-center flex-row gap-2 active:bg-muted-light/40 dark:active:bg-muted-dark/40"
                >
                  <Ionicons name="cloud-upload-outline" size={16} color={primaryColor} />
                  <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">
                    Upload Aadhar Photo
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Card>

        {/* Assigned Flats */}
        <Card>
          <CardTitle>Assigned Flats</CardTitle>
          <CardDescription>Your registered units in this society</CardDescription>

          <View className="mt-3 gap-2">
            {profile?.flats && profile.flats.length > 0 ? (
              profile.flats.map((f: any) => (
                <View
                  key={f.id}
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl p-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="home-outline" size={16} color={primaryColor} />
                    <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                      {f.tower?.name} — {f.number}
                    </Text>
                  </View>
                  <View className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-2.5 py-0.5 rounded-md">
                    <Text className="text-primary-light dark:text-primary-dark text-xs uppercase tracking-wider font-semibold">
                      {f.occupancyStatus || "Resident"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs py-2">
                No flats assigned yet. Contact your society administrator.
              </Text>
            )}
          </View>
        </Card>

        {/* Vehicles Details */}
        <Card>
          <CardTitle>My Registered Vehicles</CardTitle>
          <CardDescription>Used for parking lookup and notifications</CardDescription>

          {/* Add Vehicle Section */}
          <View className="mt-4 gap-3 bg-muted-light/30 dark:bg-muted-dark/30 border border-border-light dark:border-border-dark p-3.5 rounded-2xl">
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs uppercase tracking-wider">
              Add a Vehicle
            </Text>

            <View className="flex-row gap-2.5">
              <View className="flex-1 gap-1">
                <TextInput
                  value={newPlate}
                  onChangeText={setNewPlate}
                  placeholder="e.g. MH12AB1234"
                  placeholderTextColor="#78716c"
                  autoCapitalize="characters"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-sm"
                />
              </View>
              <View className="flex-1 gap-1">
                <TextInput
                  value={newModel}
                  onChangeText={setNewModel}
                  placeholder="e.g. White City"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-sm"
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-1">
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setNewType("CAR")}
                  className={`px-3 py-1.5 rounded-lg border flex-row items-center gap-1.5 ${
                    newType === "CAR"
                      ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                      : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                  }`}
                >
                  <Ionicons name="car-outline" size={14} color={newType === "CAR" ? primaryColor : "#78716c"} />
                  <Text className={`text-xs ${newType === "CAR" ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                    Car
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setNewType("BIKE")}
                  className={`px-3 py-1.5 rounded-lg border flex-row items-center gap-1.5 ${
                    newType === "BIKE"
                      ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                      : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                  }`}
                >
                  <Ionicons name="bicycle-outline" size={14} color={newType === "BIKE" ? primaryColor : "#78716c"} />
                  <Text className={`text-xs ${newType === "BIKE" ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                    Bike
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleAddVehicle}
                className="bg-primary-light dark:bg-primary-dark px-4 py-2 rounded-xl flex-row items-center gap-1 active:opacity-90"
              >
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text className="text-white font-bold text-xs">Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Vehicles List */}
          <View className="mt-4 gap-2">
            {vehicles.length === 0 ? (
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs py-2">
                No vehicles registered. Register your vehicles to receive blocker alerts.
              </Text>
            ) : (
              vehicles.map((v) => (
                <View
                  key={v.plateNumber}
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl p-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 items-center justify-center">
                      <Ionicons
                        name={v.type === "CAR" ? "car" : "bicycle"}
                        size={16}
                        color={primaryColor}
                      />
                    </View>
                    <View>
                      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm font-mono">
                        {v.plateNumber}
                      </Text>
                      {v.makeModel ? (
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                          {v.makeModel}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleRemoveVehicle(v.plateNumber)}
                    className="p-1 rounded-lg bg-rose-500/10 active:opacity-75"
                  >
                    <Ionicons name="trash-outline" size={14} color="#f43f5e" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </Card>

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={updateProfileMutation.isPending}
          className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3.5 rounded-2xl items-center flex-row justify-center gap-2 mt-2 shadow-sm"
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#ffffff" />
              <Text className="text-white font-bold text-sm">Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
export default ProfileView;

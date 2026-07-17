import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  useColorScheme,
  ScrollView,
  Modal,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { api } from "@/lib/api";
import {
  useStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "@/queries/society";
import {
  useStaffAadharSignedUrlQuery,
  useDeleteStaffAvatarMutation,
  useDeleteStaffAadharMutation,
} from "@/queries/admin";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";

const STAFF_ROLES = ["MAID", "DRIVER", "PLUMBER", "COOK", "ELECTRICIAN", "GARDENER", "SECURITY", "OTHER"];

type StaffMember = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  code?: string;
  aadharNumber?: string;
  aadharPublicId?: string;
  vehicleNumber?: string;
  avatar?: string;
};

export function ManageStaffView() {
  const { data: staff = [], isLoading, refetch } = useStaffQuery();
  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const deleteMutation = useDeleteStaffMutation();
  const deleteAvatarMutation = useDeleteStaffAvatarMutation();
  const deleteAadharMutation = useDeleteStaffAadharMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Modal visibility
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("MAID");
  const [code, setCode] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharPublicId, setAadharPublicId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [avatar, setAvatar] = useState("");
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Attachment upload loading indicators
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);

  // Query signed URL on-demand for the selected staff member
  const [viewingAadharStaffId, setViewingAadharStaffId] = useState<string | null>(null);
  const { refetch: fetchSignedAadharUrl } = useStaffAadharSignedUrlQuery(
    viewingAadharStaffId,
    !!viewingAadharStaffId
  );

  const handleCreateStaff = async () => {
    if (!name.trim() || !phone.trim() || !role) {
      showToast("Name, Phone and Role are required", "error");
      return;
    }
    if (aadharNumber && aadharNumber.length !== 12) {
      showToast("Aadhar must be exactly 12 digits", "error");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        role: role,
        code: code.trim() || undefined,
        aadharNumber: aadharNumber.trim() || undefined,
        aadharPublicId: aadharPublicId.trim() || undefined,
        vehicleNumber: vehicleNumber.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      showToast(`${name} has been added successfully!`, "success");
      clearForm();
      setCreateModalVisible(false);
      refetch();
    } catch (err: any) {
      showToast(err.message || "Failed to add staff", "error");
    }
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaffId(member.id);
    setName(member.name);
    setPhone(member.phone);
    setRole(member.role);
    setCode(member.code || "");
    setAadharNumber(member.aadharNumber || "");
    setAadharPublicId(member.aadharPublicId || "");
    setVehicleNumber(member.vehicleNumber || "");
    setAvatar(member.avatar || "");
    setEditModalVisible(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaffId) return;
    if (aadharNumber && aadharNumber.length !== 12) {
      showToast("Aadhar must be exactly 12 digits", "error");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        staffId: editingStaffId,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          role: role,
          code: code.trim() || null,
          aadharNumber: aadharNumber.trim() || null,
          aadharPublicId: aadharPublicId.trim() || null,
          vehicleNumber: vehicleNumber.trim() || null,
          avatar: avatar.trim() || null,
        },
      });
      showToast("Staff updated successfully", "success");
      setEditModalVisible(false);
      setEditingStaffId(null);
      clearForm();
      refetch();
    } catch (err: any) {
      showToast(err.message || "Failed to update staff", "error");
    }
  };

  const handleDelete = (staffMember: StaffMember) => {
    Alert.alert(
      "Remove Staff",
      `Remove ${staffMember.name} from the directory?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(staffMember.id);
              showToast(`${staffMember.name} removed from directory`, "success");
              refetch();
            } catch (err: any) {
              showToast(err.message || "Failed to remove staff", "error");
            }
          },
        },
      ]
    );
  };

  // Secure Cloudinary uploads
  const handleUploadAvatar = async () => {
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

      // 1. Get signed upload signature
      const sigRes = await api.get("/api/society/media/signature", {
        params: { folder: "profiles", type: "public" },
      });
      const { signature, timestamp, apiKey, cloudName, folder, type } = sigRes.data.data;

      // 2. Upload file to Cloudinary
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || "staff_avatar.jpg";
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
        // If we are editing, update database immediately
        if (editingStaffId) {
          await updateMutation.mutateAsync({
            staffId: editingStaffId,
            data: { avatar: secureUrl },
          });
          refetch();
        }
        showToast("Staff photo uploaded successfully!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload photo", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      if (editingStaffId && avatar) {
        await deleteAvatarMutation.mutateAsync(editingStaffId);
        setAvatar("");
        refetch();
        showToast("Staff photo deleted successfully", "success");
      } else {
        setAvatar("");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete staff photo", "error");
    }
  };

  const handleUploadAadhar = async () => {
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
      const fileName = fileUri.split("/").pop() || "staff_aadhar.jpg";
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
        // If we are editing, update database immediately
        if (editingStaffId) {
          await updateMutation.mutateAsync({
            staffId: editingStaffId,
            data: { aadharPublicId: publicId },
          });
          refetch();
        }
        showToast("Staff Aadhar card secure document saved!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload document", "error");
    } finally {
      setIsUploadingAadhar(false);
    }
  };

  const handleDeleteAadhar = async () => {
    try {
      if (editingStaffId && aadharPublicId) {
        await deleteAadharMutation.mutateAsync(editingStaffId);
        setAadharPublicId("");
        setAadharNumber("");
        refetch();
        showToast("Staff Aadhar document deleted", "success");
      } else {
        setAadharPublicId("");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete Aadhar document", "error");
    }
  };

  const handleViewAadhar = async (staffId: string) => {
    try {
      setViewingAadharStaffId(staffId);
      const res = await fetchSignedAadharUrl();
      if (res.data) {
        await Linking.openURL(res.data);
      } else {
        showToast("Failed to retrieve secure URL for Aadhar card", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Could not retrieve signed file", "error");
    } finally {
      setViewingAadharStaffId(null);
    }
  };

  const clearForm = () => {
    setName("");
    setPhone("");
    setRole("MAID");
    setCode("");
    setAadharNumber("");
    setAadharPublicId("");
    setVehicleNumber("");
    setAvatar("");
  };

  const roleColors: Record<string, string> = {
    MAID: "#f59e0b",
    DRIVER: "#38bdf8",
    PLUMBER: "#a78bfa",
    COOK: "#fb923c",
    ELECTRICIAN: "#facc15",
    GARDENER: "#34d399",
    SECURITY: "#f43f5e",
    OTHER: "#6b7280",
  };

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Staff Directory</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            {(staff as StaffMember[]).length} staff providers registered
          </Text>
        </View>
        <Pressable
          onPress={() => {
            clearForm();
            setCreateModalVisible(true);
          }}
          className="bg-primary-light dark:bg-primary-dark rounded-xl px-4 py-2.5 flex-row items-center gap-2 active:opacity-90"
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="text-white font-bold text-xs">Add Staff</Text>
        </Pressable>
      </View>

      {/* Staff list */}
      {isLoading ? (
        <Loader fullscreen={false} />
      ) : (staff as StaffMember[]).length === 0 ? (
        <Card className="p-10 items-center">
          <Ionicons name="person-outline" size={40} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3">
            No staff providers added
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1 text-center">
            Add maids, drivers, and other service staff to the directory
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {(staff as StaffMember[]).map((member) => {
            const isSelected = selectedStaffId === member.id;
            const color = roleColors[member.role.toUpperCase()] || "#6b7280";
            return (
              <View
                key={member.id}
                className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden"
              >
                <Pressable
                  onPress={() => setSelectedStaffId(isSelected ? null : member.id)}
                  className="p-4 flex-row items-center gap-3"
                >
                  <View className="w-11 h-11 rounded-xl items-center justify-center border overflow-hidden" style={{ borderColor: `${color}40` }}>
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} className="w-full h-full" />
                    ) : (
                      <View className="w-full h-full items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                        <Text className="font-bold text-base" style={{ color }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm">
                      {member.name}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                      {member.phone}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1.5">
                      <View
                        className="px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <Text className="text-xs font-semibold text-[10px] uppercase tracking-wider" style={{ color }}>
                          {member.role}
                        </Text>
                      </View>
                      {member.code && (
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-mono">
                          #{member.code}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Ionicons
                    name={isSelected ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#78716c"
                  />
                </Pressable>

                {/* Expanded Card Details */}
                {isSelected && (
                  <View className="border-t border-border-light dark:border-border-dark p-4 gap-3 bg-muted-light/20 dark:bg-muted-dark/20">
                    <View className="flex-row justify-between text-xs border-b border-border-light/40 dark:border-border-dark/40 pb-2">
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider font-semibold text-[10px]">Aadhar number</Text>
                      <Text className="text-foreground-light dark:text-foreground-dark font-mono">{member.aadharNumber ? `XXXX-XXXX-${member.aadharNumber.slice(-4)}` : "Not provided"}</Text>
                    </View>
                    <View className="flex-row justify-between text-xs border-b border-border-light/40 dark:border-border-dark/40 pb-2">
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider font-semibold text-[10px]">Vehicle plate</Text>
                      <Text className="text-foreground-light dark:text-foreground-dark font-mono">{member.vehicleNumber || "None"}</Text>
                    </View>
                    
                    {member.aadharPublicId && (
                      <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-2.5 rounded-xl mt-1">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                          <Text className="text-emerald-500 font-bold text-[10px]">Aadhar Document Uploaded</Text>
                        </View>
                        {viewingAadharStaffId === member.id ? (
                          <ActivityIndicator color={primaryColor} size="small" />
                        ) : (
                          <Pressable
                            onPress={() => handleViewAadhar(member.id)}
                            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark px-2.5 py-1 rounded-lg active:opacity-75"
                          >
                            <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-bold">Secure View</Text>
                          </Pressable>
                        )}
                      </View>
                    )}

                    <View className="flex-row justify-end gap-2 mt-1">
                      <Pressable
                        onPress={() => handleOpenEdit(member)}
                        className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:opacity-75"
                      >
                        <Ionicons name="create-outline" size={14} color={primaryColor} />
                        <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Edit Details</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(member)}
                        className="bg-rose-500/10 border border-rose-500/25 px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:opacity-75"
                      >
                        <Ionicons name="trash-outline" size={14} color="#f43f5e" />
                        <Text className="text-rose-500 text-xs font-bold">Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* CREATE MODAL */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center bg-black/60 px-4"
        >
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Add Staff</Text>
              <Pressable onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[380px] gap-3">
              {/* Profile Pic Upload Widget */}
              <View className="items-center mb-2">
                <View className="relative">
                  <View className="w-16 h-16 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark justify-center items-center">
                    {isUploadingAvatar ? (
                      <ActivityIndicator color={primaryColor} size="small" />
                    ) : avatar ? (
                      <Image source={{ uri: avatar }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="person" size={24} color="#78716c" />
                    )}
                  </View>
                  <Pressable
                    onPress={handleUploadAvatar}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center border border-card-light dark:border-card-dark active:scale-95"
                  >
                    <Ionicons name="camera" size={10} color="#ffffff" />
                  </Pressable>
                </View>
                {avatar ? (
                  <Pressable onPress={handleDeleteAvatar} className="mt-1">
                    <Text className="text-rose-500 text-[10px] font-bold">Remove photo</Text>
                  </Pressable>
                ) : null}
              </View>

              <View className="gap-1.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Phone *</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Role *</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {STAFF_ROLES.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      className={`px-2 py-1 rounded-lg border ${
                        role === r
                          ? "bg-primary-light/10 dark:bg-primary-dark/10"
                          : "bg-muted-light dark:bg-muted-dark"
                      }`}
                      style={{
                        borderColor: role === r ? roleColors[r] : (colorScheme === "dark" ? "#44403c" : "#e4d9bc"),
                      }}
                    >
                      <Text
                        className="text-[10px] font-bold capitalize"
                        style={{ color: role === r ? roleColors[r] : "#78716c" }}
                      >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Badge / Code</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Card or ID number"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Aadhar Number</Text>
                <TextInput
                  value={aadharNumber}
                  onChangeText={(val) => setAadharNumber(val.replace(/\D/g, "").slice(0, 12))}
                  keyboardType="numeric"
                  placeholder="12 Digit Aadhar"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              {/* Aadhar Photo Attachment */}
              <View className="gap-1.5 mt-2 bg-muted-light/30 dark:bg-muted-dark/30 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
                <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-semibold">Aadhar Attachment</Text>
                {isUploadingAadhar ? (
                  <View className="flex-row items-center justify-center p-2 gap-1.5">
                    <ActivityIndicator color={primaryColor} size="small" />
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px]">Uploading...</Text>
                  </View>
                ) : aadharPublicId ? (
                  <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-2 rounded-lg">
                    <Text className="text-emerald-500 font-bold text-[10px]">Aadhar document set</Text>
                    <Pressable onPress={handleDeleteAadhar} className="p-1 rounded bg-rose-500/10 border border-rose-500/20">
                      <Ionicons name="trash-outline" size={10} color="#ef4444" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleUploadAadhar}
                    className="border border-dashed border-border-light dark:border-border-dark py-2.5 rounded-lg justify-center items-center flex-row gap-1.5 active:bg-muted-light/50 dark:active:bg-muted-dark/50"
                  >
                    <Ionicons name="cloud-upload-outline" size={12} color={primaryColor} />
                    <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-bold">Attach document photo</Text>
                  </Pressable>
                )}
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Vehicle number</Text>
                <TextInput
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  placeholder="e.g. MH12AB1234"
                  placeholderTextColor="#78716c"
                  autoCapitalize="characters"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleCreateStaff}
              disabled={createMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center mt-2"
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Staff</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center bg-black/60 px-4"
        >
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Edit Details</Text>
              <Pressable
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingStaffId(null);
                  clearForm();
                }}
              >
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[380px] gap-3">
              {/* Profile Pic Upload Widget */}
              <View className="items-center mb-2">
                <View className="relative">
                  <View className="w-16 h-16 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark justify-center items-center">
                    {isUploadingAvatar ? (
                      <ActivityIndicator color={primaryColor} size="small" />
                    ) : avatar ? (
                      <Image source={{ uri: avatar }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="person" size={24} color="#78716c" />
                    )}
                  </View>
                  <Pressable
                    onPress={handleUploadAvatar}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center border border-card-light dark:border-card-dark active:scale-95"
                  >
                    <Ionicons name="camera" size={10} color="#ffffff" />
                  </Pressable>
                </View>
                {avatar ? (
                  <Pressable onPress={handleDeleteAvatar} className="mt-1">
                    <Text className="text-rose-500 text-[10px] font-bold">Remove photo</Text>
                  </Pressable>
                ) : null}
              </View>

              <View className="gap-1.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ramesh Kumar"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Phone *</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Role *</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {STAFF_ROLES.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      className={`px-2 py-1 rounded-lg border ${
                        role === r
                          ? "bg-primary-light/10 dark:bg-primary-dark/10"
                          : "bg-muted-light dark:bg-muted-dark"
                      }`}
                      style={{
                        borderColor: role === r ? roleColors[r] : (colorScheme === "dark" ? "#44403c" : "#e4d9bc"),
                      }}
                    >
                      <Text
                        className="text-[10px] font-bold capitalize"
                        style={{ color: role === r ? roleColors[r] : "#78716c" }}
                      >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Badge / Code</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Card number"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Aadhar Number</Text>
                <TextInput
                  value={aadharNumber}
                  onChangeText={(val) => setAadharNumber(val.replace(/\D/g, "").slice(0, 12))}
                  keyboardType="numeric"
                  placeholder="12 Digit Aadhar"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              {/* Aadhar Photo Attachment */}
              <View className="gap-1.5 mt-2 bg-muted-light/30 dark:bg-muted-dark/30 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
                <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-semibold">Aadhar Attachment</Text>
                {isUploadingAadhar ? (
                  <View className="flex-row items-center justify-center p-2 gap-1.5">
                    <ActivityIndicator color={primaryColor} size="small" />
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px]">Uploading...</Text>
                  </View>
                ) : aadharPublicId ? (
                  <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-2 rounded-lg">
                    <Text className="text-emerald-500 font-bold text-[10px]">Aadhar document set</Text>
                    <Pressable onPress={handleDeleteAadhar} className="p-1 rounded bg-rose-500/10 border border-rose-500/20">
                      <Ionicons name="trash-outline" size={10} color="#ef4444" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleUploadAadhar}
                    className="border border-dashed border-border-light dark:border-border-dark py-2.5 rounded-lg justify-center items-center flex-row gap-1.5 active:bg-muted-light/50 dark:active:bg-muted-dark/50"
                  >
                    <Ionicons name="cloud-upload-outline" size={12} color={primaryColor} />
                    <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-bold">Attach document photo</Text>
                  </Pressable>
                )}
              </View>

              <View className="gap-1.5 mt-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Vehicle number</Text>
                <TextInput
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  placeholder="e.g. MH12AB1234"
                  placeholderTextColor="#78716c"
                  autoCapitalize="characters"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleUpdateStaff}
              disabled={updateMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center mt-2"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Changes</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}
export default ManageStaffView;

import React, { useState } from "react";
import { Text, View, Pressable, Alert, ActivityIndicator, TextInput, useColorScheme, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation } from "@/queries/society";
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
  vehicleNumber?: string;
  avatar?: string;
};

export function ManageStaffView() {
  const { data: staff = [], isLoading, refetch } = useStaffQuery();
  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const deleteMutation = useDeleteStaffMutation();
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
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [avatar, setAvatar] = useState("");
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const handleCreateStaff = async () => {
    if (!name.trim() || !phone.trim() || !role) {
      showToast("Name, Phone and Role are required", "error");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        role: role,
        code: code.trim() || undefined,
        aadharNumber: aadharNumber.trim() || undefined,
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
    setVehicleNumber(member.vehicleNumber || "");
    setAvatar(member.avatar || "");
    setEditModalVisible(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaffId) return;
    try {
      await updateMutation.mutateAsync({
        staffId: editingStaffId,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          role: role,
          code: code.trim() || null,
          aadharNumber: aadharNumber.trim() || null,
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

  const clearForm = () => {
    setName("");
    setPhone("");
    setRole("MAID");
    setCode("");
    setAadharNumber("");
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
          onPress={() => { clearForm(); setCreateModalVisible(true); }}
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
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center border"
                    style={{ backgroundColor: `${color}18`, borderColor: `${color}40` }}
                  >
                    <Text className="font-bold text-base" style={{ color }}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
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
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Add Staff</Text>
              <Pressable onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[380px] gap-3">
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

              <View className="gap-1.5 mt-2 mb-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Avatar Image URL</Text>
                <TextInput
                  value={avatar}
                  onChangeText={setAvatar}
                  placeholder="https://image-url..."
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleCreateStaff}
              disabled={createMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Staff</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Edit Details</Text>
              <Pressable onPress={() => { setEditModalVisible(false); setEditingStaffId(null); }}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[380px] gap-3">
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

              <View className="gap-1.5 mt-2 mb-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Avatar Image URL</Text>
                <TextInput
                  value={avatar}
                  onChangeText={setAvatar}
                  placeholder="https://image-url..."
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleUpdateStaff}
              disabled={updateMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
export default ManageStaffView;

import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  Pressable,
  Alert,
  useColorScheme,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "@/queries/society";
import {
  useStaffAadharSignedUrlQuery,
} from "@/queries/admin";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { StaffCard, type StaffMember } from "./staff/staff-card";
import { StaffFormModal } from "./staff/staff-form-modal";
import { type CreateStaffFormData } from "@/lib/form-schemas";

export function ManageStaffView() {
  const { data: staff = [], isLoading, refetch } = useStaffQuery();
  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const deleteMutation = useDeleteStaffMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Query signed URL on-demand for the selected staff member
  const [viewingAadharStaffId, setViewingAadharStaffId] = useState<string | null>(null);
  const { refetch: fetchSignedAadharUrl } = useStaffAadharSignedUrlQuery(
    viewingAadharStaffId,
    !!viewingAadharStaffId
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormModalVisible(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingMember(member);
    setFormModalVisible(true);
  };

  const handleFormSubmit = async (data: CreateStaffFormData) => {
    try {
      if (editingMember) {
        // Edit flow
        await updateMutation.mutateAsync({
          staffId: editingMember.id,
          data: {
            name: data.name.trim(),
            phone: data.phone.trim(),
            role: data.role,
            code: data.code?.trim() || null,
            aadharNumber: data.aadharNumber?.trim() || null,
            aadharPublicId: data.aadharPublicId?.trim() || null,
            vehicleNumber: data.vehicleNumber?.trim() || null,
            avatar: data.avatar?.trim() || null,
          },
        });
        showToast("Staff updated successfully", "success");
      } else {
        // Create flow
        await createMutation.mutateAsync({
          name: data.name.trim(),
          phone: data.phone.trim(),
          role: data.role,
          code: data.code?.trim() || undefined,
          aadharNumber: data.aadharNumber?.trim() || undefined,
          aadharPublicId: data.aadharPublicId?.trim() || undefined,
          vehicleNumber: data.vehicleNumber?.trim() || undefined,
          avatar: data.avatar?.trim() || undefined,
        });
        showToast(`${data.name} has been added successfully!`, "success");
      }
      setFormModalVisible(false);
      setEditingMember(null);
      refetch();
    } catch (err: any) {
      showToast(err.message || "Failed to save staff member", "error");
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

  const handleViewAadhar = async (staffId: string) => {
    try {
      setViewingAadharStaffId(staffId);
      // Wait for React to update state before refetching
      setTimeout(async () => {
        const res = await fetchSignedAadharUrl();
        if (res.data) {
          await Linking.openURL(res.data);
        } else {
          showToast("Failed to retrieve secure URL for Aadhar card", "error");
        }
        setViewingAadharStaffId(null);
      }, 0);
    } catch (err: any) {
      showToast(err.message || "Could not retrieve signed file", "error");
      setViewingAadharStaffId(null);
    }
  };

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Staff Directory</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            {(staff as StaffMember[]).length} staff providers registered
          </Text>
        </View>
        <Pressable
          onPress={handleOpenCreate}
          className="bg-primary-light dark:bg-primary-dark rounded-xl px-4 py-2.5 flex-row items-center gap-2 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Add new staff member"
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
          {(staff as StaffMember[]).map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              isSelected={selectedStaffId === member.id}
              onToggle={() => setSelectedStaffId(selectedStaffId === member.id ? null : member.id)}
              onEdit={() => handleOpenEdit(member)}
              onDelete={() => handleDelete(member)}
              onSecureView={() => handleViewAadhar(member.id)}
              isViewingAadhar={viewingAadharStaffId === member.id}
              primaryColor={primaryColor}
            />
          ))}
        </View>
      )}

      {/* Form Modal */}
      <StaffFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        defaultValues={editingMember}
        title={editingMember ? "Edit Details" : "Add Staff"}
        primaryColor={primaryColor}
        isDark={isDark}
      />
    </ScreenContainer>
  );
}

export default ManageStaffView;

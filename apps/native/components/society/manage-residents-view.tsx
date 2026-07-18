import React, { useState, useCallback } from "react";
import { ScrollView, Text, View, Pressable, Alert, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useMembersQuery,
  useTowersQuery,
  useCreateResidentMutation,
  useUpdateResidentMutation,
  useDeleteResidentMutation,
  useAllocateFlatMutation,
} from "@/queries/society";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { SectionHeader } from "../ui/section-header";
import { SearchInput } from "../ui/search-input";
import { ResidentCard, type Member } from "./residents/resident-card";
import { ResidentFormModal } from "./residents/resident-form-modal";
import { FlatAllocationModal } from "./residents/flat-allocation-modal";
import { type AllocateFlatFormData } from "@/lib/form-schemas";

export function ManageResidentsView() {
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useMembersQuery();
  const { data: towers = [], isLoading: towersLoading, refetch: refetchTowers } = useTowersQuery();
  
  const createResidentMutation = useCreateResidentMutation();
  const updateResidentMutation = useUpdateResidentMutation();
  const deleteResidentMutation = useDeleteResidentMutation();
  const allocateFlatMutation = useAllocateFlatMutation();

  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modals visibility
  const [residentFormModalVisible, setResidentFormModalVisible] = useState(false);
  const [residentFormMode, setResidentFormMode] = useState<"create" | "edit">("create");
  const [editingResident, setEditingResident] = useState<any | null>(null);
  const [allocationModalVisible, setAllocationModalVisible] = useState(false);

  // Flat Allocation state
  const [selectedFlatAllocation, setSelectedFlatAllocation] = useState<any | null>(null);

  const residents = (members as Member[]).filter((m) => m.role.toLowerCase() === "resident");
  const filteredResidents = residents.filter((m) =>
    m.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMembers(), refetchTowers()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchMembers, refetchTowers]);

  const handleOpenCreate = () => {
    setResidentFormMode("create");
    setEditingResident(null);
    setResidentFormModalVisible(true);
  };

  const handleOpenEdit = (member: Member) => {
    setResidentFormMode("edit");
    setEditingResident({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      aadharNumber: member.user.aadharNumber || "",
      image: member.user.image || "",
      aadharPublicId: member.user.aadharPublicId || "",
    });
    setResidentFormModalVisible(true);
  };

  const handleResidentSubmit = async (data: any) => {
    try {
      if (residentFormMode === "create") {
        await createResidentMutation.mutateAsync({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          aadharNumber: data.aadharNumber?.trim() || undefined,
          image: data.image?.trim() || undefined,
          aadharPublicId: data.aadharPublicId?.trim() || undefined,
        });
        showToast("Resident account registered!", "success");
      } else {
        await updateResidentMutation.mutateAsync({
          userId: editingResident.id,
          data: {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            aadharNumber: data.aadharNumber?.trim() || null,
            image: data.image?.trim() || null,
            aadharPublicId: data.aadharPublicId?.trim() || null,
          },
        });
        showToast("Profile updated successfully", "success");
      }
      setResidentFormModalVisible(false);
      setEditingResident(null);
      refetchMembers();
    } catch (err: any) {
      showToast(err.message || "Failed to save resident profile", "error");
    }
  };

  const handleDeleteResident = (userId: string, userName: string) => {
    Alert.alert(
      "Remove Resident",
      `Remove ${userName} from the society? This will revoke their access and flat associations.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteResidentMutation.mutateAsync(userId);
              showToast("Resident removed from society successfully", "success");
              refetchMembers();
            } catch (err: any) {
              showToast(err.message || "Failed to delete resident", "error");
            }
          },
        },
      ]
    );
  };

  const handleOpenAllocation = (flat: any) => {
    setSelectedFlatAllocation({
      flatId: flat.id,
      occupancyStatus: flat.occupancyStatus || "VACANT",
      ownerId: flat.ownerId || null,
      memberCount: String(flat.memberCount || 0),
      vehicleMemberCount: String(flat.vehicleMemberCount || 0),
      residentIds: flat.residents?.map((r: any) => r.id) || [],
    });
    setAllocationModalVisible(true);
  };

  const handleAllocateFlatSubmit = async (data: AllocateFlatFormData) => {
    if (!selectedFlatAllocation) return;
    try {
      await allocateFlatMutation.mutateAsync({
        flatId: selectedFlatAllocation.flatId,
        ownerId: data.ownerId || null,
        occupancyStatus: data.occupancyStatus,
        memberCount: parseInt(data.memberCount) || 0,
        vehicleMemberCount: parseInt(data.vehicleMemberCount) || 0,
        residentIds: data.residentIds,
      });
      showToast("Flat allocations saved successfully", "success");
      setAllocationModalVisible(false);
      setSelectedFlatAllocation(null);
      refetchTowers();
      refetchMembers();
    } catch (err: any) {
      showToast(err.message || "Failed to save allocations", "error");
    }
  };

  if (membersLoading || towersLoading) {
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
      <View className="mb-5 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Resident Directory</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Manage society flat occupancies and member credentials
          </Text>
        </View>
        <Pressable
          onPress={handleOpenCreate}
          className="bg-primary-light dark:bg-primary-dark px-3 py-2 rounded-xl flex-row items-center gap-1 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Add new resident to society"
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="text-white font-bold text-xs">Add Resident</Text>
        </Pressable>
      </View>

      {/* Search Bar using SearchInput with debounce */}
      <SearchInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search residents..."
        className="mb-5"
      />

      <View className="gap-6">
        {/* Residents list */}
        <View className="gap-3">
          <SectionHeader title="Members list" />
          {filteredResidents.length === 0 ? (
            <Card className="items-center py-8">
              <Ionicons name="people-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 text-center">No residents found</Text>
            </Card>
          ) : (
            filteredResidents.map((member) => (
              <ResidentCard
                key={member.id}
                member={member}
                isSelected={selectedMemberId === member.id}
                onToggle={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
                onEdit={() => handleOpenEdit(member)}
                onDelete={() => handleDeleteResident(member.user.id, member.user.name)}
                primaryColor={primaryColor}
              />
            ))
          )}
        </View>

        {/* Flat Allocation Grid Registry */}
        <View className="gap-3 mt-2">
          <SectionHeader title="Flats Allocation Registry" />
          {towers.map((tower: any) => (
            <Card key={tower.id} className="gap-3">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">{tower.name}</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {tower.flats.map((flat: any) => {
                  let occupancyColor = "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark text-muted-foreground-light";
                  if (flat.occupancyStatus === "OWNER_OCCUPIED") {
                    occupancyColor = "bg-emerald-500/10 border-emerald-500/25 text-emerald-600";
                  } else if (flat.occupancyStatus === "RENTED") {
                    occupancyColor = "bg-sky-500/10 border-sky-500/25 text-sky-600";
                  }

                  return (
                    <Pressable
                      key={flat.id}
                      onPress={() => handleOpenAllocation(flat)}
                      className={`border rounded-xl p-3 items-center min-w-[80px] ${occupancyColor}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Flat number ${flat.number}, occupancy status ${flat.occupancyStatus || "VACANT"}`}
                    >
                      <Text className="text-xxs font-bold uppercase tracking-wider">
                        {flat.occupancyStatus || "VACANT"}
                      </Text>
                      <Text className="text-sm font-black font-mono mt-0.5">
                        {flat.number}
                      </Text>
                      {flat.memberCount > 0 && (
                        <Text className="text-[9px] font-medium mt-1">
                          👤 {flat.memberCount} | 🚗 {flat.vehicleMemberCount}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Resident Form Modal (Handles Create and Edit) */}
      <ResidentFormModal
        visible={residentFormModalVisible}
        onClose={() => setResidentFormModalVisible(false)}
        onSubmit={handleResidentSubmit}
        isSubmitting={createResidentMutation.isPending || updateResidentMutation.isPending}
        defaultValues={editingResident}
        mode={residentFormMode}
        title={residentFormMode === "create" ? "Register Resident" : "Edit Profile"}
      />

      {/* Flat Allocation config modal */}
      <FlatAllocationModal
        visible={allocationModalVisible}
        onClose={() => setAllocationModalVisible(false)}
        onSubmit={handleAllocateFlatSubmit}
        isSubmitting={allocateFlatMutation.isPending}
        defaultValues={selectedFlatAllocation}
        residents={residents}
      />
    </ScreenContainer>
  );
}

export default ManageResidentsView;

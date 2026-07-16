import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
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

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    aadharNumber?: string;
    vehicleNumber?: string;
    flats: {
      id: string;
      number: string;
      occupancyStatus: string;
      memberCount: number;
      vehicleMemberCount: number;
      tower: { name: string };
    }[];
  };
};

type Flat = {
  id: string;
  number: string;
  occupancyStatus: string;
  memberCount: number;
  vehicleMemberCount: number;
  ownerId?: string | null;
  residents: { id: string; name: string }[];
};

type Tower = {
  id: string;
  name: string;
  flats: Flat[];
};

export function ManageResidentsView() {
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useMembersQuery();
  const { data: towers = [], isLoading: towersLoading, refetch: refetchTowers } = useTowersQuery();
  
  const createResidentMutation = useCreateResidentMutation();
  const updateResidentMutation = useUpdateResidentMutation();
  const deleteResidentMutation = useDeleteResidentMutation();
  const allocateFlatMutation = useAllocateFlatMutation();

  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Modals visibility
  const [residentModalVisible, setResidentModalVisible] = useState(false);
  const [editResidentModalVisible, setEditResidentModalVisible] = useState(false);
  const [allocationModalVisible, setAllocationModalVisible] = useState(false);

  // Resident Form state
  const [residentName, setResidentName] = useState("");
  const [residentEmail, setResidentEmail] = useState("");
  const [residentAadhar, setResidentAadhar] = useState("");
  const [residentAvatar, setResidentAvatar] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Flat Allocation state
  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);
  const [flatOccupancyStatus, setFlatOccupancyStatus] = useState<"VACANT" | "OWNER_OCCUPIED" | "RENTED">("VACANT");
  const [flatOwnerId, setFlatOwnerId] = useState<string | null>(null);
  const [flatMemberCount, setFlatMemberCount] = useState("0");
  const [flatVehicleMemberCount, setFlatVehicleMemberCount] = useState("0");
  const [flatResidentIds, setFlatResidentIds] = useState<string[]>([]);

  const residents = (members as Member[]).filter((m) => m.role.toLowerCase() === "resident");
  const filteredResidents = residents.filter((m) =>
    m.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCreateResident = async () => {
    if (!residentName.trim() || !residentEmail.trim()) {
      showToast("Name and Email are required", "error");
      return;
    }
    try {
      await createResidentMutation.mutateAsync({
        name: residentName.trim(),
        email: residentEmail.trim().toLowerCase(),
        aadharNumber: residentAadhar.trim() || undefined,
        image: residentAvatar.trim() || undefined,
      });
      showToast("Resident account registered!", "success");
      setResidentName("");
      setResidentEmail("");
      setResidentAadhar("");
      setResidentAvatar("");
      setResidentModalVisible(false);
      refetchMembers();
    } catch (err: any) {
      showToast(err.message || "Failed to create resident", "error");
    }
  };

  const handleOpenEdit = (member: Member) => {
    setEditingUserId(member.user.id);
    setResidentName(member.user.name);
    setResidentEmail(member.user.email);
    setResidentAadhar(member.user.aadharNumber || "");
    setResidentAvatar(member.user.image || "");
    setEditResidentModalVisible(true);
  };

  const handleUpdateResident = async () => {
    if (!editingUserId) return;
    try {
      await updateResidentMutation.mutateAsync({
        userId: editingUserId,
        data: {
          name: residentName.trim(),
          aadharNumber: residentAadhar.trim() || null,
          image: residentAvatar.trim() || null,
        },
      });
      showToast("Profile updated successfully", "success");
      setEditResidentModalVisible(false);
      setEditingUserId(null);
      refetchMembers();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  const handleDeleteResident = async (userId: string) => {
    try {
      await deleteResidentMutation.mutateAsync(userId);
      showToast("Resident removed from society successfully", "success");
      refetchMembers();
    } catch (err: any) {
      showToast(err.message || "Failed to delete resident", "error");
    }
  };

  const handleOpenAllocation = (flat: any, towerName: string) => {
    setSelectedFlatId(flat.id);
    setFlatOccupancyStatus(flat.occupancyStatus as any || "VACANT");
    setFlatOwnerId(flat.ownerId || null);
    setFlatMemberCount(String(flat.memberCount || 0));
    setFlatVehicleMemberCount(String(flat.vehicleMemberCount || 0));
    setFlatResidentIds(flat.residents?.map((r: any) => r.id) || []);
    setAllocationModalVisible(true);
  };

  const handleAllocateFlat = async () => {
    if (!selectedFlatId) return;
    try {
      await allocateFlatMutation.mutateAsync({
        flatId: selectedFlatId,
        ownerId: flatOwnerId || null,
        occupancyStatus: flatOccupancyStatus,
        memberCount: parseInt(flatMemberCount) || 0,
        vehicleMemberCount: parseInt(flatVehicleMemberCount) || 0,
        residentIds: flatResidentIds,
      });
      showToast("Flat allocations saved successfully", "success");
      setAllocationModalVisible(false);
      refetchTowers();
      refetchMembers();
    } catch (err: any) {
      showToast(err.message || "Failed to save allocations", "error");
    }
  };

  const toggleFlatResident = (userId: string) => {
    if (flatResidentIds.includes(userId)) {
      setFlatResidentIds(flatResidentIds.filter((id) => id !== userId));
    } else {
      setFlatResidentIds([...flatResidentIds, userId]);
    }
  };

  if (membersLoading || towersLoading) {
    return <Loader />;
  }

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-5 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Resident Directory</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Manage society flat occupancies and member credentials
          </Text>
        </View>
        <Pressable
          onPress={() => setResidentModalVisible(true)}
          className="bg-primary-light dark:bg-primary-dark px-3 py-2 rounded-xl flex-row items-center gap-1 active:opacity-90"
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="text-white font-bold text-xs">Add Resident</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2.5 flex-row items-center gap-2 mb-5">
        <Ionicons name="search-outline" size={16} color="#78716c" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search residents..."
          placeholderTextColor="#78716c"
          className="flex-1 text-foreground-light dark:text-foreground-dark text-sm"
        />
      </View>

      {/* Toggle View Section */}
      <View className="gap-6">
        {/* Residents list */}
        <View className="gap-3">
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Members list</Text>
          {filteredResidents.length === 0 ? (
            <Card className="items-center py-8">
              <Ionicons name="people-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 text-center">No residents found</Text>
            </Card>
          ) : (
            filteredResidents.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const currentFlats = member.user.flats;

              return (
                <View
                  key={member.id}
                  className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden"
                >
                  <Pressable
                    onPress={() => setSelectedMemberId(isSelected ? null : member.id)}
                    className="p-4 flex-row items-center gap-3"
                  >
                    <View className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 items-center justify-center border border-primary-light/20">
                      <Text className="text-primary-light dark:text-primary-dark font-bold text-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm">{member.user.name}</Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">{member.user.email}</Text>
                      {currentFlats.length > 0 ? (
                        <View className="flex-row flex-wrap gap-1 mt-1.5">
                          {currentFlats.map((f) => (
                            <View key={f.id} className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 rounded-md px-2 py-0.5">
                              <Text className="text-primary-light dark:text-primary-dark text-[10px] font-bold font-mono">
                                {f.tower.name} — {f.number} ({f.occupancyStatus})
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] mt-1 italic">No flat occupied</Text>
                      )}
                    </View>
                    <Ionicons
                      name={isSelected ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#78716c"
                    />
                  </Pressable>

                  {/* Expanded Actions */}
                  {isSelected && (
                    <View className="border-t border-border-light dark:border-border-dark p-3.5 gap-2 bg-muted-light/20 dark:bg-muted-dark/20 flex-row justify-end">
                      <Pressable
                        onPress={() => handleOpenEdit(member)}
                        className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-3 py-2 rounded-xl flex-row items-center gap-1 active:opacity-75"
                      >
                        <Ionicons name="create-outline" size={14} color={primaryColor} />
                        <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Edit Profile</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteResident(member.user.id)}
                        className="bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-xl flex-row items-center gap-1 active:opacity-75"
                      >
                        <Ionicons name="trash-outline" size={14} color="#f43f5e" />
                        <Text className="text-rose-500 text-xs font-bold">Remove</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Flexible flat allocation section */}
        <View className="gap-3 mt-2">
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Flats Allocation Registry</Text>
          {towers.map((tower: Tower) => (
            <Card key={tower.id} className="gap-3">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">{tower.name}</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {tower.flats.map((flat) => {
                  let occupancyColor = "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark text-muted-foreground-light";
                  if (flat.occupancyStatus === "OWNER_OCCUPIED") {
                    occupancyColor = "bg-emerald-500/10 border-emerald-500/25 text-emerald-600";
                  } else if (flat.occupancyStatus === "RENTED") {
                    occupancyColor = "bg-sky-500/10 border-sky-500/25 text-sky-600";
                  }

                  return (
                    <Pressable
                      key={flat.id}
                      onPress={() => handleOpenAllocation(flat, tower.name)}
                      className={`border rounded-xl p-3 items-center min-w-[80px] ${occupancyColor}`}
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

      {/* CREATE RESIDENT MODAL */}
      <Modal visible={residentModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Register Resident</Text>
              <Pressable onPress={() => setResidentModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[360px] gap-4">
              <View className="gap-1.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Full Name
                </Text>
                <TextInput
                  value={residentName}
                  onChangeText={setResidentName}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Email Address
                </Text>
                <TextInput
                  value={residentEmail}
                  onChangeText={setResidentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. rahul@gmail.com"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Aadhar Number
                </Text>
                <TextInput
                  value={residentAadhar}
                  onChangeText={(val) => setResidentAadhar(val.replace(/\D/g, "").slice(0, 12))}
                  keyboardType="numeric"
                  placeholder="12 Digit Aadhar"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              <View className="gap-1.5 mt-3 mb-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Avatar Image URL
                </Text>
                <TextInput
                  value={residentAvatar}
                  onChangeText={setResidentAvatar}
                  placeholder="https://image-url..."
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleCreateResident}
              disabled={createResidentMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {createResidentMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Resident</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* EDIT RESIDENT MODAL */}
      <Modal visible={editResidentModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Edit Profile</Text>
              <Pressable onPress={() => { setEditResidentModalVisible(false); setEditingUserId(null); }}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[360px] gap-4">
              <View className="gap-1.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Full Name
                </Text>
                <TextInput
                  value={residentName}
                  onChangeText={setResidentName}
                  placeholder="Rahul Sharma"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Aadhar Number
                </Text>
                <TextInput
                  value={residentAadhar}
                  onChangeText={(val) => setResidentAadhar(val.replace(/\D/g, "").slice(0, 12))}
                  keyboardType="numeric"
                  placeholder="12 Digit Aadhar"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              <View className="gap-1.5 mt-3 mb-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Avatar Image URL
                </Text>
                <TextInput
                  value={residentAvatar}
                  onChangeText={setResidentAvatar}
                  placeholder="https://image-url..."
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleUpdateResident}
              disabled={updateResidentMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {updateResidentMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Update Profile</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* FLAT ALLOCATION MODAL */}
      <Modal visible={allocationModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Flat Configuration</Text>
              <Pressable onPress={() => setAllocationModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[380px] gap-4">
              {/* Occupancy selection */}
              <View className="gap-1.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Occupancy Status
                </Text>
                <View className="flex-row gap-1.5">
                  {(["VACANT", "OWNER_OCCUPIED", "RENTED"] as const).map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => setFlatOccupancyStatus(status)}
                      className={`flex-1 py-1.5 rounded-lg border items-center ${
                        flatOccupancyStatus === status
                          ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                          : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                      }`}
                    >
                      <Text className={`text-[10px] font-bold ${flatOccupancyStatus === status ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Owner assignee */}
              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Select Flat Owner
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  <Pressable
                    onPress={() => setFlatOwnerId(null)}
                    className={`px-2.5 py-1.5 rounded-lg border ${
                      flatOwnerId === null
                        ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                        : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                    }`}
                  >
                    <Text className={`text-xxs ${flatOwnerId === null ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                      No Owner
                    </Text>
                  </Pressable>
                  {residents.map((r) => (
                    <Pressable
                      key={r.user.id}
                      onPress={() => setFlatOwnerId(r.user.id)}
                      className={`px-2.5 py-1.5 rounded-lg border ${
                        flatOwnerId === r.user.id
                          ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                          : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                      }`}
                    >
                      <Text className={`text-xxs ${flatOwnerId === r.user.id ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                        {r.user.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Resident(s) assignee (Tenants / Occupants) */}
              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Select Occupying Residents (Tenants)
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {residents.map((r) => {
                    const isResSelected = flatResidentIds.includes(r.user.id);
                    return (
                      <Pressable
                        key={r.user.id}
                        onPress={() => toggleFlatResident(r.user.id)}
                        className={`px-2.5 py-1.5 rounded-lg border ${
                          isResSelected
                            ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                            : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                        }`}
                      >
                        <Text className={`text-xxs ${isResSelected ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                          {r.user.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* memberCount and vehicleMemberCount fields */}
              <View className="flex-row gap-3 mt-3 mb-2">
                <View className="flex-1 gap-1">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                    Total Residents
                  </Text>
                  <TextInput
                    value={flatMemberCount}
                    onChangeText={(val) => setFlatMemberCount(val.replace(/\D/g, ""))}
                    keyboardType="numeric"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                    Vehicle Users
                  </Text>
                  <TextInput
                    value={flatVehicleMemberCount}
                    onChangeText={(val) => setFlatVehicleMemberCount(val.replace(/\D/g, ""))}
                    keyboardType="numeric"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={handleAllocateFlat}
              disabled={allocateFlatMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {allocateFlatMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Flat Setup</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
export default ManageResidentsView;

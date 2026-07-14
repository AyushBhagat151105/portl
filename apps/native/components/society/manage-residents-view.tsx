import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useMembersQuery, useTowersQuery, useAssignFlatMutation } from "@/queries/society";

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    flats: { id: string; number: string; tower: { name: string } }[];
  };
};

type Flat = {
  id: string;
  number: string;
  residents: { id: string; name: string }[];
};

type Tower = {
  id: string;
  name: string;
  flats: Flat[];
};

export function ManageResidentsView() {
  const { data: members = [], isLoading: membersLoading } = useMembersQuery();
  const { data: towers = [], isLoading: towersLoading } = useTowersQuery();
  const assignFlatMutation = useAssignFlatMutation();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);
  const [showFlatPicker, setShowFlatPicker] = useState(false);
  const [searchText, setSearchText] = useState("");

  const residents = (members as Member[]).filter((m) => m.role.toLowerCase() === "resident");
  const filteredResidents = residents.filter((m) =>
    m.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedMemberId || !selectedFlatId) {
      Alert.alert("Error", "Please select a member and a flat");
      return;
    }
    const member = (members as Member[]).find((m) => m.id === selectedMemberId);
    if (!member) return;

    try {
      await assignFlatMutation.mutateAsync({ userId: member.user.id, flatId: selectedFlatId });
      Alert.alert("Success", `Flat assigned to ${member.user.name}`);
      setSelectedMemberId(null);
      setSelectedFlatId(null);
      setShowFlatPicker(false);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to assign flat");
    }
  };

  if (membersLoading || towersLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const allFlats = (towers as Tower[]).flatMap((t) => t.flats.map((f) => ({ ...f, towerName: t.name })));

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="mb-5">
        <Text className="text-white text-xl font-bold">Resident Management</Text>
        <Text className="text-zinc-500 text-xs mt-1">Assign residents to their flats</Text>
      </View>

      {/* Search */}
      <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex-row items-center gap-2 mb-5">
        <Ionicons name="search-outline" size={16} color="#52525b" />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search residents..."
          placeholderTextColor="#52525b"
          className="flex-1 text-white text-sm"
        />
      </View>

      {/* Residents list */}
      <View className="gap-3">
        {filteredResidents.length === 0 && (
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 items-center">
            <Ionicons name="people-outline" size={32} color="#3f3f46" />
            <Text className="text-zinc-500 text-sm mt-3 text-center">No residents found</Text>
          </View>
        )}

        {filteredResidents.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const currentFlats = member.user.flats;

          return (
            <View
              key={member.id}
              className="bg-zinc-900 border rounded-2xl overflow-hidden"
              style={{ borderColor: isSelected ? "#f59e0b" : "#27272a" }}
            >
              <Pressable
                onPress={() => {
                  setSelectedMemberId(isSelected ? null : member.id);
                  setShowFlatPicker(false);
                  setSelectedFlatId(null);
                }}
                className="p-4 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
                  <Text className="text-amber-400 font-bold text-sm">
                    {member.user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{member.user.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">{member.user.email}</Text>
                  {currentFlats.length > 0 ? (
                    <View className="flex-row flex-wrap gap-1 mt-1.5">
                      {currentFlats.map((f) => (
                        <View key={f.id} className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5">
                          <Text className="text-emerald-400 text-xs font-mono">
                            {f.tower.name} — {f.number}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-zinc-600 text-xs mt-1">No flat assigned</Text>
                  )}
                </View>
                <Ionicons
                  name={isSelected ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={isSelected ? "#f59e0b" : "#52525b"}
                />
              </Pressable>

              {/* Flat picker (expanded) */}
              {isSelected && (
                <View className="border-t border-zinc-800 p-4 gap-3">
                  <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    Assign Flat
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    <View className="flex-row gap-2">
                      {allFlats.map((flat) => {
                        const flatSelected = selectedFlatId === flat.id;
                        return (
                          <Pressable
                            key={flat.id}
                            onPress={() => setSelectedFlatId(flatSelected ? null : flat.id)}
                            className="border rounded-lg px-3 py-2 items-center"
                            style={{
                              backgroundColor: flatSelected ? "rgba(245,158,11,0.1)" : "#09090b",
                              borderColor: flatSelected ? "#f59e0b" : "#3f3f46",
                              minWidth: 72,
                            }}
                          >
                            <Text className="text-xs text-zinc-400">{flat.towerName}</Text>
                            <Text
                              className="text-sm font-bold font-mono mt-0.5"
                              style={{ color: flatSelected ? "#f59e0b" : "#ffffff" }}
                            >
                              {flat.number}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>

                  <Pressable
                    onPress={handleAssign}
                    disabled={!selectedFlatId || assignFlatMutation.isPending}
                    className="bg-amber-500 rounded-xl py-3 items-center"
                    style={{ opacity: !selectedFlatId || assignFlatMutation.isPending ? 0.5 : 1 }}
                  >
                    {assignFlatMutation.isPending ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text className="text-black font-bold text-sm">Assign Flat</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </KeyboardAwareScrollView>
  );
}

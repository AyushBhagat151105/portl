import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useMembersQuery, useTowersQuery, useAssignFlatMutation } from "@/queries/society";
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
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const residents = (members as Member[]).filter((m) => m.role.toLowerCase() === "resident");
  const filteredResidents = residents.filter((m) =>
    m.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedMemberId || !selectedFlatId) {
      showToast("Please select a member and a flat", "error");
      return;
    }
    const member = (members as Member[]).find((m) => m.id === selectedMemberId);
    if (!member) return;

    try {
      await assignFlatMutation.mutateAsync({ userId: member.user.id, flatId: selectedFlatId });
      showToast(`Flat assigned to ${member.user.name} successfully!`, "success");
      setSelectedMemberId(null);
      setSelectedFlatId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to assign flat", "error");
    }
  };

  if (membersLoading || towersLoading) {
    return <Loader />;
  }

  const allFlats = (towers as Tower[]).flatMap((t) => t.flats.map((f) => ({ ...f, towerName: t.name })));
  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-5">
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Resident Management</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">Assign residents to their flats</Text>
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

      {/* Residents list */}
      <View className="gap-3">
        {filteredResidents.length === 0 && (
          <Card className="items-center py-8">
            <Ionicons name="people-outline" size={32} color="#78716c" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 text-center">No residents found</Text>
          </Card>
        )}

        {filteredResidents.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const currentFlats = member.user.flats;

          return (
            <View
              key={member.id}
              className="bg-card-light dark:bg-card-dark border rounded-2xl overflow-hidden"
              style={{ borderColor: isSelected ? primaryColor : "transparent", borderWidth: 1 }}
            >
              <Pressable
                onPress={() => {
                  setSelectedMemberId(isSelected ? null : member.id);
                  setSelectedFlatId(null);
                }}
                className="p-4 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-full bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark items-center justify-center">
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
                          <Text className="text-primary-light dark:text-primary-dark text-xs font-mono">
                            {f.tower.name} — {f.number}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">No flat assigned</Text>
                  )}
                </View>
                <Ionicons
                  name={isSelected ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={isSelected ? primaryColor : "#78716c"}
                />
              </Pressable>

              {/* Flat picker (expanded) */}
              {isSelected && (
                <View className="border-t border-border-light dark:border-border-dark p-4 gap-3 bg-muted-light/30 dark:bg-muted-dark/30">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
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
                            className={`border rounded-lg px-3 py-2 items-center min-w-[72px] ${
                              flatSelected
                                ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                                : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                            }`}
                          >
                            <Text className={`text-xs ${flatSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                              {flat.towerName}
                            </Text>
                            <Text className={`text-sm font-bold font-mono mt-0.5 ${flatSelected ? "text-primary-light dark:text-primary-dark" : "text-foreground-light dark:text-foreground-dark"}`}>
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
                    className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 rounded-xl py-3 items-center flex-row justify-center gap-2"
                  >
                    {assignFlatMutation.isPending ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="link-outline" size={16} color="#ffffff" />
                        <Text className="text-white font-bold text-sm">Assign Flat</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
export default ManageResidentsView;

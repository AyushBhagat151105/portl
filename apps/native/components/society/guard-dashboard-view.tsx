import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSearchResidentsQuery, useRegisterVisitorMutation } from "../../queries/society";

export function GuardDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlat, setSelectedFlat] = useState<{ id: string; number: string; towerName: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState<"GUEST" | "DELIVERY" | "CAB" | "STAFF">("DELIVERY");

  const { data: searchResults, isLoading: searchLoading } = useSearchResidentsQuery(searchQuery);
  const registerMutation = useRegisterVisitorMutation();

  const handleRegister = async () => {
    if (!selectedFlat || !name || !phone) {
      Alert.alert("Error", "Please search and select a Flat, and fill in visitor Name & Phone");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name,
        phone,
        purpose,
        type,
        flatId: selectedFlat.id,
      });

      Alert.alert(
        "Gate Call Sent 🔔",
        `Requested entry check for Flat ${selectedFlat.towerName} - ${selectedFlat.number}. Resident has been notified.`
      );

      setName("");
      setPhone("");
      setPurpose("");
      setSelectedFlat(null);
      setSearchQuery("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to register visitor");
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950 px-6 py-4"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Flat Selector Directory Search */}
      <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl mb-5">
        <Text className="text-white text-lg font-bold mb-3">1. Select Target Flat</Text>
        {selectedFlat ? (
          <View className="bg-zinc-950 border border-amber-500/30 p-4 rounded-xl flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-base">
                Flat {selectedFlat.towerName} - {selectedFlat.number}
              </Text>
              <Text className="text-zinc-500 text-xs mt-0.5">Selected flat registry</Text>
            </View>
            <Pressable onPress={() => setSelectedFlat(null)} className="p-1 active:opacity-75">
              <Text className="text-rose-500 text-sm font-semibold">Change</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Search Resident by Name, Email or Flat Number</Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="e.g. Flat 101 or Ayush"
                placeholderTextColor="#52525b"
                className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800 flex-1 focus:border-amber-500/50"
              />
            </View>

            {searchLoading ? (
              <ActivityIndicator size="small" color="#f59e0b" className="my-2" />
            ) : searchResults && searchResults.length > 0 ? (
              <View className="max-h-56 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-1">
                <ScrollView nestedScrollEnabled>
                  {searchResults.map((resident: any) =>
                    resident.flats.map((f: any) => (
                      <Pressable
                        key={f.id}
                        onPress={() =>
                          setSelectedFlat({
                            id: f.id,
                            number: f.number,
                            towerName: f.tower.name,
                          })
                        }
                        className="py-3 px-4 border-b border-zinc-900 flex-row justify-between items-center active:bg-zinc-900"
                      >
                        <View>
                          <Text className="text-white text-sm font-semibold">
                            Flat {f.tower.name} - {f.number}
                          </Text>
                          <Text className="text-zinc-400 text-xs">{resident.name}</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={16} color="#52525b" />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            ) : searchQuery.length >= 2 ? (
              <Text className="text-zinc-500 text-xs italic text-center py-2">No matching flat records found.</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Visitor details inputs */}
      <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <Text className="text-white text-lg font-bold mb-4">2. Enter Visitor Details</Text>

        <View className="gap-4">
          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Visitor Type</Text>
            <View className="flex-row gap-2">
              {(["DELIVERY", "CAB", "GUEST", "STAFF"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  className="flex-1 py-2 px-1 rounded-lg border items-center"
                  style={{
                    backgroundColor: type === t ? "rgba(245, 158, 11, 0.1)" : "#09090b",
                    borderColor: type === t ? "#f59e0b" : "#27272a",
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color: type === t ? "#f59e0b" : "#a1a1aa",
                      fontWeight: type === t ? "600" : "400",
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Visitor Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Delivery Partner"
              placeholderTextColor="#52525b"
              className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
            />
          </View>

          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Visitor Phone *</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#52525b"
              keyboardType="phone-pad"
              className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
            />
          </View>

          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Purpose (Optional)</Text>
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g. Swiggy delivery"
              placeholderTextColor="#52525b"
              className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
            />
          </View>

          <Pressable
            disabled={registerMutation.isPending}
            onPress={handleRegister}
            className="bg-amber-600 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-80"
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Send Resident Alert</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}



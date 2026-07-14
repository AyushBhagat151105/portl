import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSearchResidentsQuery, useRegisterVisitorMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";

export function GuardDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlat, setSelectedFlat] = useState<{ id: string; number: string; towerName: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState<"GUEST" | "DELIVERY" | "CAB" | "STAFF">("DELIVERY");

  const { data: searchResults, isLoading: searchLoading } = useSearchResidentsQuery(searchQuery);
  const registerMutation = useRegisterVisitorMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    if (!selectedFlat || !name || !phone) {
      showToast("Please search/select a Flat, and fill in visitor Name & Phone", "error");
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

      showToast(`Gate call request sent for Flat ${selectedFlat.towerName} - ${selectedFlat.number}`, "success");
      setName("");
      setPhone("");
      setPurpose("");
      setSelectedFlat(null);
      setSearchQuery("");
    } catch (err: any) {
      showToast(err.message || "Failed to register visitor", "error");
    }
  };

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {/* Flat Selector Directory Search */}
      <Card className="mb-5">
        <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold mb-3">
          1. Select Target Flat
        </Text>
        {selectedFlat ? (
          <View className="bg-muted-light dark:bg-muted-dark border border-primary-light/30 dark:border-primary-dark/30 p-4 rounded-xl flex-row justify-between items-center">
            <View>
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base">
                Flat {selectedFlat.towerName} - {selectedFlat.number}
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                Selected flat registry
              </Text>
            </View>
            <Pressable onPress={() => setSelectedFlat(null)} className="p-1 active:opacity-75">
              <Text className="text-rose-500 text-sm font-semibold">Change</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Search Resident by Name, Email or Flat Number
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="e.g. Flat 101 or Ayush"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 flex-1 focus:border-primary-light dark:focus:border-primary-dark"
              />
            </View>

            {searchLoading ? (
              <ActivityIndicator size="small" color={primaryColor} className="my-2" />
            ) : searchResults && searchResults.length > 0 ? (
              <View className="max-h-56 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden mt-1">
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
                        className="py-3 px-4 border-b border-border-light dark:border-border-dark flex-row justify-between items-center active:opacity-70"
                      >
                        <View>
                          <Text className="text-foreground-light dark:text-foreground-dark text-sm font-semibold">
                            Flat {f.tower.name} - {f.number}
                          </Text>
                          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                            {resident.name}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={16} color="#78716c" />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            ) : searchQuery.length >= 2 ? (
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs italic text-center py-2">
                No matching flat records found.
              </Text>
            ) : null}
          </View>
        )}
      </Card>

      {/* Visitor details inputs */}
      <Card>
        <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold mb-4">
          2. Enter Visitor Details
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Visitor Type
            </Text>
            <View className="flex-row gap-2">
              {(["DELIVERY", "CAB", "GUEST", "STAFF"] as const).map((t) => {
                const isSelected = type === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    className={`flex-1 py-2 px-1 rounded-lg border items-center ${
                      isSelected
                        ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                        : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"
                      }`}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Visitor Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Delivery Partner"
              placeholderTextColor="#78716c"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
            />
          </View>

          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Visitor Phone *
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#78716c"
              keyboardType="phone-pad"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
            />
          </View>

          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Purpose (Optional)
            </Text>
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g. Swiggy delivery"
              placeholderTextColor="#78716c"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
            />
          </View>

          <Pressable
            disabled={registerMutation.isPending}
            onPress={handleRegister}
            className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Send Resident Alert</Text>
            )}
          </Pressable>
        </View>
      </Card>
    </ScreenContainer>
  );
}
export default GuardDashboardView;

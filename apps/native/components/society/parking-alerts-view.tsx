import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useSearchVehicleQuery, useNotifyVehicleBlockingMutation } from "@/queries/resident";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";

export function ParkingAlertsView() {
  const [searchText, setSearchText] = useState("");
  const { data: vehicle, isFetching, error } = useSearchVehicleQuery(searchText.trim());
  const notifyBlockingMutation = useNotifyVehicleBlockingMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const handleNotify = async () => {
    if (!vehicle) return;
    try {
      await notifyBlockingMutation.mutateAsync(vehicle.id);
      showToast(`Alert notification sent to ${vehicle.owner.name}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send notification", "error");
    }
  };

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Parking Helper</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
          Search for a vehicle blocking your way and notify the owner instantly
        </Text>
      </View>

      {/* Search Bar */}
      <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-4 gap-2 mb-5">
        <Text className="text-foreground-light dark:text-foreground-dark text-sm font-semibold">
          Enter Vehicle Plate Number
        </Text>
        <View className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2.5 flex-row items-center gap-2">
          <Ionicons name="search-outline" size={16} color="#78716c" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="e.g. MH12AB1234"
            placeholderTextColor="#78716c"
            autoCapitalize="characters"
            className="flex-1 text-foreground-light dark:text-foreground-dark text-sm font-mono"
          />
          {isFetching && <ActivityIndicator size="small" color={primaryColor} />}
        </View>
      </View>

      {/* Search Results */}
      {searchText.trim().length >= 3 ? (
        isFetching ? (
          <Card className="items-center py-10">
            <ActivityIndicator size="large" color={primaryColor} />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3">
              Searching vehicle registry...
            </Text>
          </Card>
        ) : vehicle ? (
          <Card className="gap-4">
            <View className="flex-row items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 items-center justify-center">
                  <Ionicons
                    name={vehicle.type === "CAR" ? "car" : "bicycle"}
                    size={20}
                    color={primaryColor}
                  />
                </View>
                <View>
                  <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-base font-mono">
                    {vehicle.plateNumber}
                  </Text>
                  {vehicle.makeModel ? (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                      {vehicle.makeModel}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="bg-primary-light/10 dark:bg-primary-dark/10 px-2 py-0.5 rounded border border-primary-light/25 dark:border-primary-dark/25">
                <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold uppercase tracking-wider">
                  Registered
                </Text>
              </View>
            </View>

            {/* Owner details */}
            <View className="gap-3">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
                Owner Details
              </Text>

              <View className="bg-muted-light/40 dark:bg-muted-dark/40 border border-border-light dark:border-border-dark rounded-xl p-3 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 items-center justify-center border border-primary-light/20">
                  <Text className="text-primary-light dark:text-primary-dark font-bold text-sm">
                    {vehicle.owner?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm">
                    {vehicle.owner?.name}
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                    {vehicle.owner?.email}
                  </Text>
                  {vehicle.owner?.phoneNumber && (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                      {vehicle.owner.phoneNumber}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Flat details */}
            {vehicle.flat ? (
              <View className="gap-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
                  Location
                </Text>
                <View className="bg-muted-light/40 dark:bg-muted-dark/40 border border-border-light dark:border-border-dark rounded-xl p-3 flex-row items-center gap-2">
                  <Ionicons name="home-outline" size={16} color={primaryColor} />
                  <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                    Flat {vehicle.flat.number} — {vehicle.flat.tower?.name}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Actions */}
            <View className="gap-2 mt-2">
              <Pressable
                onPress={handleNotify}
                disabled={notifyBlockingMutation.isPending}
                className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
              >
                {notifyBlockingMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="notifications-outline" size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-sm">Send Parking Alert</Text>
                  </>
                )}
              </Pressable>

              {vehicle.owner?.phoneNumber && (
                <Pressable
                  onPress={() => {
                    Linking.openURL(`tel:${vehicle.owner.phoneNumber}`);
                  }}
                  className="bg-emerald-500/10 border border-emerald-500/20 active:opacity-75 py-3 rounded-2xl items-center flex-row justify-center gap-2"
                >
                  <Ionicons name="call-outline" size={16} color="#10b981" />
                  <Text className="text-emerald-500 font-bold text-xs">Call Owner</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  Linking.openURL(`mailto:${vehicle.owner?.email}`);
                }}
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark active:opacity-75 py-3 rounded-2xl items-center flex-row justify-center gap-2"
              >
                <Ionicons name="mail-outline" size={16} color={primaryColor} />
                <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs">Email Owner</Text>
              </Pressable>
            </View>
          </Card>
        ) : (
          <Card className="items-center py-10">
            <Ionicons name="alert-circle-outline" size={32} color="#78716c" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 text-center">
              No matching vehicle found in society registry
            </Text>
          </Card>
        )
      ) : searchText.trim().length > 0 ? (
        <Card className="items-center py-8">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center">
            Type at least 3 characters to search...
          </Text>
        </Card>
      ) : (
        <Card className="items-center py-8">
          <Ionicons name="search" size={24} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2 text-center">
            Enter the blocker's license plate number above
          </Text>
        </Card>
      )}
    </ScreenContainer>
  );
}

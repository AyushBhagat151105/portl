import React, { useState } from "react";
import { Text, View, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useAmenitiesQuery, useCreateAmenityMutation } from "@/queries/society";

type Amenity = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  capacity?: number;
  bookings?: any[];
};

export function ManageAmenitiesView() {
  const { data: amenities = [], isLoading } = useAmenitiesQuery();
  const createMutation = useCreateAmenityMutation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Amenity name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        capacity: capacity ? Number(capacity) : undefined,
      });
      Alert.alert("Success", `${name} has been added`);
      setName("");
      setDescription("");
      setLocation("");
      setCapacity("");
      setShowForm(false);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to create amenity");
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-white text-xl font-bold">Amenities</Text>
          <Text className="text-zinc-500 text-xs mt-1">{amenities.length} amenities available</Text>
        </View>
        <Pressable
          onPress={() => setShowForm((v) => !v)}
          className="bg-amber-500 rounded-xl px-4 py-2.5 flex-row items-center gap-2"
        >
          <Ionicons name={showForm ? "close" : "add"} size={16} color="#000" />
          <Text className="text-black font-bold text-xs">{showForm ? "Cancel" : "Add Amenity"}</Text>
        </Pressable>
      </View>

      {/* Create Form */}
      {showForm && (
        <View className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-5 gap-4">
          <Text className="text-white font-semibold text-sm mb-1">New Amenity</Text>

          {[
            { label: "Name *", value: name, setter: setName, placeholder: "e.g. Swimming Pool" },
            { label: "Description", value: description, setter: setDescription, placeholder: "Brief description..." },
            { label: "Location", value: location, setter: setLocation, placeholder: "e.g. Ground Floor, Block B" },
          ].map((field) => (
            <View key={field.label} className="gap-1.5">
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{field.label}</Text>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor="#52525b"
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
              />
            </View>
          ))}

          <View className="gap-1.5">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Capacity</Text>
            <TextInput
              value={capacity}
              onChangeText={setCapacity}
              placeholder="e.g. 20"
              placeholderTextColor="#52525b"
              keyboardType="number-pad"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
            />
          </View>

          <Pressable
            onPress={handleCreate}
            disabled={createMutation.isPending}
            className="bg-amber-500 rounded-xl py-3.5 items-center"
            style={{ opacity: createMutation.isPending ? 0.6 : 1 }}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-bold text-sm">Create Amenity</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Amenities list */}
      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (amenities as Amenity[]).length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 items-center">
          <Ionicons name="basketball-outline" size={40} color="#3f3f46" />
          <Text className="text-zinc-500 text-sm mt-3 text-center">No amenities yet</Text>
          <Text className="text-zinc-600 text-xs mt-1 text-center">Add your first amenity to allow residents to book it</Text>
        </View>
      ) : (
        <View className="gap-3">
          {(amenities as Amenity[]).map((amenity) => (
            <View key={amenity.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 items-center justify-center">
                  <Ionicons name="star-outline" size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{amenity.name}</Text>
                  {amenity.description && (
                    <Text className="text-zinc-500 text-xs mt-0.5">{amenity.description}</Text>
                  )}
                  <View className="flex-row gap-3 mt-2">
                    {amenity.location && (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={11} color="#52525b" />
                        <Text className="text-zinc-600 text-xs">{amenity.location}</Text>
                      </View>
                    )}
                    {amenity.capacity && (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="people-outline" size={11} color="#52525b" />
                        <Text className="text-zinc-600 text-xs">Cap: {amenity.capacity}</Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="calendar-outline" size={11} color="#52525b" />
                      <Text className="text-zinc-600 text-xs">
                        {amenity.bookings?.length ?? 0} upcoming bookings
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

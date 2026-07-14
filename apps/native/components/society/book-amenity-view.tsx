import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Card } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useAmenitiesQuery, useBookAmenityMutation } from "../../queries/society";

export function BookAmenityView() {
  const { data: amenities, isLoading } = useAmenitiesQuery();
  const bookMutation = useBookAmenityMutation();

  const [bookingAmenityId, setBookingAmenityId] = useState<string | null>(null);
  const [timeslot, setTimeslot] = useState("10:00 AM - 12:00 PM");
  const [date, setDate] = useState("2026-07-15");

  const handleBook = async () => {
    if (!bookingAmenityId) return;

    try {
      await bookMutation.mutateAsync({
        amenityId: bookingAmenityId,
        date,
        timeslot,
      });
      setBookingAmenityId(null);
      Alert.alert("Success", "Amenity timeslot booked successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to book amenity");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-white text-xl font-bold mb-4">Society Amenities</Text>

      {bookingAmenityId ? (
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-bold">Book Timeslot</Text>
            <Pressable onPress={() => setBookingAmenityId(null)}>
              <Ionicons name="close-circle-outline" size={24} color="#a1a1aa" />
            </Pressable>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-zinc-400 text-xs mb-1.5">Booking Date (YYYY-MM-DD)</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-07-15"
                placeholderTextColor="#52525b"
                className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
              />
            </View>

            <View>
              <Text className="text-zinc-400 text-xs mb-1.5">Select Slot</Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "08:00 AM - 10:00 AM",
                  "10:00 AM - 12:00 PM",
                  "02:00 PM - 04:00 PM",
                  "04:00 PM - 06:00 PM",
                  "06:00 PM - 08:00 PM",
                ].map((slot) => (
                  <Pressable
                    key={slot}
                    onPress={() => setTimeslot(slot)}
                    className="py-2.5 px-3 rounded-lg border"
                    style={{
                      backgroundColor: timeslot === slot ? "rgba(245, 158, 11, 0.1)" : "#09090b",
                      borderColor: timeslot === slot ? "#f59e0b" : "#27272a",
                    }}
                  >
                    <Text
                      className="text-xs"
                      style={{
                        color: timeslot === slot ? "#f59e0b" : "#a1a1aa",
                        fontWeight: timeslot === slot ? "600" : "400",
                      }}
                    >
                      {slot.replace(" AM", "").replace(" PM", "")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              disabled={bookMutation.isPending}
              onPress={handleBook}
              className="bg-amber-600 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-80"
            >
              {bookMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Confirm Booking</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : !amenities || amenities.length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 items-center">
          <Text className="text-zinc-500 text-sm">No amenities registered.</Text>
        </View>
      ) : (
        amenities.map((am: any) => (
          <Card key={am.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-2">
                <Text className="text-white text-base font-bold">{am.name}</Text>
                {am.description && <Text className="text-zinc-400 text-xs mt-1">{am.description}</Text>}
                {am.location && <Text className="text-zinc-500 text-xxs mt-1">Location: {am.location}</Text>}
              </View>
              <Pressable
                onPress={() => setBookingAmenityId(am.id)}
                className="bg-amber-600 px-4 py-2 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-xs">Book</Text>
              </Pressable>
            </View>

            <View className="border-t border-zinc-800/80 pt-3 mt-3">
              <Text className="text-zinc-500 font-medium text-xxs mb-1.5 uppercase tracking-wider">Bookings Logs</Text>
              {am.bookings && am.bookings.length > 0 ? (
                am.bookings.slice(0, 3).map((b: any) => (
                  <View key={b.id} className="flex-row justify-between items-center py-1">
                    <Text className="text-zinc-400 text-xxs">
                      {new Date(b.date).toLocaleDateString([], { month: "short", day: "numeric" })} @ {b.timeslot}
                    </Text>
                    <Text className="text-zinc-500 text-xxs">By {b.bookedBy.name}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-zinc-600 text-xxs">No upcoming slots booked.</Text>
              )}
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

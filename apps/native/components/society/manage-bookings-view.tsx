import React from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useAdminBookingsQuery, useRespondBookingMutation } from "@/queries/admin";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

export function ManageBookingsView() {
  const { data: bookings = [], isLoading, refetch } = useAdminBookingsQuery();
  const respondBookingMutation = useRespondBookingMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const handleRespond = async (bookingId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await respondBookingMutation.mutateAsync({ bookingId, status });
      showToast(`Booking request ${status.toLowerCase()} successfully!`, "success");
      refetch();
    } catch (err: any) {
      showToast(err.message || "Failed to update booking status", "error");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  const pendingBookings = bookings.filter((b: any) => b.status === "PENDING");
  const pastBookings = bookings.filter((b: any) => b.status !== "PENDING");

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Booking Approvals</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
          Review and approve community hall and function hosting requests
        </Text>
      </View>

      {/* Pending Requests Section */}
      <View className="gap-4">
        <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
          Pending Requests ({pendingBookings.length})
        </Text>

        {pendingBookings.length === 0 ? (
          <Card className="items-center py-8">
            <Ionicons name="checkmark-circle-outline" size={32} color="#78716c" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-3">
              All bookings caught up! No pending requests.
            </Text>
          </Card>
        ) : (
          pendingBookings.map((b: any) => (
            <Card key={b.id} className="gap-3">
              <View className="flex-row items-center justify-between pb-2 border-b border-border-light dark:border-border-dark">
                <View>
                  <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm">
                    {b.amenity?.name}
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 font-mono">
                    {new Date(b.date).toLocaleDateString()} • {b.timeslot}
                  </Text>
                </View>
                <View className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  <Text className="text-amber-500 text-xxs uppercase tracking-wider font-bold">Pending</Text>
                </View>
              </View>

              {/* Applicant details */}
              <View className="bg-muted-light/30 dark:bg-muted-dark/30 rounded-xl p-2.5 gap-1">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs uppercase tracking-wider font-semibold">
                  Requested By
                </Text>
                <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs">
                  {b.bookedBy?.name} ({b.bookedBy?.email})
                </Text>
              </View>

              {/* Function purpose */}
              {b.purpose ? (
                <View className="gap-1.5 bg-primary-light/5 dark:bg-primary-dark/5 p-2.5 rounded-xl border border-primary-light/10 dark:border-primary-dark/10">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                    Event details / Function Purpose
                  </Text>
                  <Text className="text-foreground-light dark:text-foreground-dark text-xs font-semibold">
                    {b.purpose}
                  </Text>
                </View>
              ) : null}

              {/* Action buttons */}
              <View className="flex-row gap-2 mt-1">
                <Pressable
                  onPress={() => handleRespond(b.id, "APPROVED")}
                  disabled={respondBookingMutation.isPending}
                  className="flex-1 bg-primary-light dark:bg-primary-dark rounded-xl py-2.5 items-center flex-row justify-center gap-1.5 active:opacity-90 disabled:opacity-50"
                >
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                  <Text className="text-white font-bold text-xs">Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleRespond(b.id, "REJECTED")}
                  disabled={respondBookingMutation.isPending}
                  className="flex-1 bg-rose-500/10 border border-rose-500/25 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5 active:opacity-90 disabled:opacity-50"
                >
                  <Ionicons name="close" size={14} color="#f43f5e" />
                  <Text className="text-rose-500 font-bold text-xs">Reject</Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* History Log Section */}
      <View className="gap-4 mt-6">
        <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
          Approval History ({pastBookings.length})
        </Text>

        {pastBookings.length === 0 ? (
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs py-2">
            No historical approvals logged yet.
          </Text>
        ) : (
          pastBookings.map((b: any) => {
            const isApproved = b.status === "APPROVED";
            const badgeColor = isApproved
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-rose-500/10 border-rose-500/20 text-rose-500";
            return (
              <Card key={b.id} className="gap-2 p-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                      {b.amenity?.name}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-mono mt-0.5">
                      {new Date(b.date).toLocaleDateString()} • {b.timeslot}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded border ${badgeColor}`}>
                    <Text className="text-xxs uppercase tracking-wider font-bold">{b.status}</Text>
                  </View>
                </View>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                  Requested by: {b.bookedBy?.name} {b.purpose ? `• Purpose: ${b.purpose}` : ""}
                </Text>
              </Card>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}
export default ManageBookingsView;

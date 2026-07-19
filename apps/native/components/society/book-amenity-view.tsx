import React from "react";
import { Text, View, Pressable, ActivityIndicator, TextInput, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { useAmenitiesQuery, useBookAmenityMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";
import { DateChips } from "../ui/date-chips";
import { TimeSlotChips } from "../ui/time-slot-chips";
import { bookAmenitySchema, type BookAmenityFormData } from "@/lib/form-schemas";

export function BookAmenityView() {
  const { data: amenities, isLoading } = useAmenitiesQuery();
  const bookMutation = useBookAmenityMutation();
  const { showToast } = useToastStore();

  const [bookingAmenityId, setBookingAmenityId] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BookAmenityFormData>({
    resolver: zodResolver(bookAmenitySchema),
    mode: "onTouched",
    defaultValues: { date: "", timeslot: "", purpose: "" },
  });

  const onSubmit = async (data: BookAmenityFormData) => {
    if (!bookingAmenityId) return;

    try {
      await bookMutation.mutateAsync({
        amenityId: bookingAmenityId,
        date: data.date,
        timeslot: data.timeslot,
        purpose: data.purpose,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setBookingAmenityId(null);
      reset();
      showToast("Amenity timeslot requested successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to book amenity", "error");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
        Society Amenities
      </Text>

      {bookingAmenityId ? (
        <Card className="mb-4 gap-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">Request Timeslot</Text>
            <Pressable onPress={() => setBookingAmenityId(null)}>
              <Ionicons name="close-circle-outline" size={24} color="#78716c" />
            </Pressable>
          </View>

          <View className="gap-4">
            {/* Date Picker Chips */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-2 uppercase tracking-wider font-medium">
                Select Date
              </Text>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DateChips value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.date && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1.5">
                  {errors.date.message}
                </FieldError>
              )}
            </View>

            {/* Time Slot Chips */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-2 uppercase tracking-wider font-medium">
                Select Time Slot
              </Text>
              <Controller
                control={control}
                name="timeslot"
                render={({ field }) => (
                  <TimeSlotChips value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.timeslot && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1.5">
                  {errors.timeslot.message}
                </FieldError>
              )}
            </View>

            {/* Purpose input */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-2 uppercase tracking-wider font-medium">
                Purpose / Function Details
              </Text>
              <Controller
                control={control}
                name="purpose"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="e.g. Hosting Family Gathering"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
            </View>

            <Pressable
              disabled={bookMutation.isPending}
              onPress={handleSubmit(onSubmit)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
            >
              {bookMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Request Booking Now</Text>
              )}
            </Pressable>
          </View>
        </Card>
      ) : null}

      {!amenities || amenities.length === 0 ? (
        <Card className="items-center p-6">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
            No amenities registered in society.
          </Text>
        </Card>
      ) : (
        amenities.map((am: any) => (
          <Card key={am.id} className="mb-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <CardTitle>{am.name}</CardTitle>
                <CardDescription>{am.description}</CardDescription>
                {am.location && (
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                    Location: {am.location}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setBookingAmenityId(am.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 px-4 py-2.5 rounded-xl active:opacity-85"
              >
                <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold">Book Slot</Text>
              </Pressable>
            </View>

            <View className="border-t border-border-light dark:border-border-dark pt-3 mt-3">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark font-medium text-xxs mb-1.5 uppercase tracking-wider">
                Bookings Logs
              </Text>
              {am.bookings && am.bookings.length > 0 ? (
                am.bookings.slice(0, 5).map((b: any) => {
                  let badgeCol = "text-amber-500 bg-amber-500/10 border border-amber-500/20";
                  if (b.status === "APPROVED") badgeCol = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
                  if (b.status === "REJECTED" || b.status === "CANCELLED") badgeCol = "text-rose-500 bg-rose-500/10 border border-rose-500/20";
                  return (
                    <View key={b.id} className="flex-row justify-between items-center py-1.5 border-b border-border-light/40 dark:border-border-dark/40 last:border-0">
                      <View className="flex-1 mr-2">
                        <Text className="text-foreground-light dark:text-foreground-dark text-xs font-medium">
                          {new Date(b.date).toLocaleDateString([], { month: "short", day: "numeric" })} @ {b.timeslot}
                        </Text>
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                          By {b.bookedBy?.name} {b.purpose ? `(${b.purpose})` : ""}
                        </Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded ${badgeCol}`}>
                        <Text className="text-[10px] font-bold uppercase tracking-wider">{b.status}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs italic">
                  No upcoming slots booked.
                </Text>
              )}
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}
export default BookAmenityView;

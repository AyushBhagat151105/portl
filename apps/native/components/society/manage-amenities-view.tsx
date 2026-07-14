import React from "react";
import { Text, View, Pressable, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { useAmenitiesQuery, useCreateAmenityMutation } from "@/queries/society";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { createAmenitySchema, type CreateAmenityFormData } from "@/lib/form-schemas";

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
  const { showToast } = useToastStore();

  const [showForm, setShowForm] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateAmenityFormData>({
    resolver: zodResolver(createAmenitySchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: CreateAmenityFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        location: data.location?.trim() || undefined,
        capacity: data.capacity ? Number(data.capacity) : undefined,
      });
      showToast(`${data.name} has been added successfully!`, "success");
      reset();
      setShowForm(false);
    } catch (err: any) {
      showToast(err.message || "Failed to create amenity", "error");
    }
  };

  const AMENITY_FIELDS = [
    { name: "name" as const, label: "Name *", placeholder: "e.g. Swimming Pool" },
    { name: "description" as const, label: "Description", placeholder: "Brief description..." },
    { name: "location" as const, label: "Location", placeholder: "e.g. Ground Floor, Block B" },
  ] as const;

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Amenities</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            {amenities.length} amenities available
          </Text>
        </View>
        <Pressable
          onPress={() => setShowForm((v) => !v)}
          className="bg-primary-light dark:bg-primary-dark rounded-xl px-4 py-2.5 flex-row items-center gap-2 active:opacity-90"
        >
          <Ionicons name={showForm ? "close" : "add"} size={16} color="#ffffff" />
          <Text className="text-white font-bold text-xs">{showForm ? "Cancel" : "Add Amenity"}</Text>
        </Pressable>
      </View>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-5 gap-4">
          <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm mb-1">
            New Amenity
          </Text>

          {AMENITY_FIELDS.map((f) => (
            <View key={f.name} className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
                {f.label}
              </Text>
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => (
                  <TextInput
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={f.placeholder}
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors[f.name] && (
                <FieldError isInvalid className="text-rose-500 text-xs">
                  {errors[f.name]?.message}
                </FieldError>
              )}
            </View>
          ))}

          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
              Capacity
            </Text>
            <Controller
              control={control}
              name="capacity"
              render={({ field }) => (
                <TextInput
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. 20"
                  placeholderTextColor="#78716c"
                  keyboardType="number-pad"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
                />
              )}
            />
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
            className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-sm">Create Amenity</Text>
            )}
          </Pressable>
        </Card>
      )}

      {/* Amenities list */}
      {isLoading ? (
        <Loader fullscreen={false} />
      ) : (amenities as Amenity[]).length === 0 ? (
        <Card className="p-10 items-center">
          <Ionicons name="basketball-outline" size={40} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 text-center">
            No amenities yet
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1 text-center">
            Add your first amenity to allow residents to book it
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {(amenities as Amenity[]).map((amenity) => (
            <Card key={amenity.id}>
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 items-center justify-center">
                  <Ionicons name="star-outline" size={18} color="#b45309" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm">
                    {amenity.name}
                  </Text>
                  {amenity.description && (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                      {amenity.description}
                    </Text>
                  )}
                  <View className="flex-row gap-3 mt-2 flex-wrap">
                    {amenity.location && (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={11} color="#78716c" />
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                          {amenity.location}
                        </Text>
                      </View>
                    )}
                    {amenity.capacity && (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="people-outline" size={11} color="#78716c" />
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                          Cap: {amenity.capacity}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="calendar-outline" size={11} color="#78716c" />
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                        {amenity.bookings?.length ?? 0} bookings
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
export default ManageAmenitiesView;

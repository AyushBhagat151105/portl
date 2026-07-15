import React from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { useComplaintsQuery, useRaiseComplaintMutation, useMyFlatsQuery } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";
import { raiseComplaintSchema, type RaiseComplaintFormData } from "@/lib/form-schemas";

export function HelpdeskView() {
  const { data: complaints, isLoading: complaintsLoading } = useComplaintsQuery();
  const raiseComplaintMutation = useRaiseComplaintMutation();
  const { data: flats, isLoading: flatsLoading } = useMyFlatsQuery();
  const { showToast } = useToastStore();

  const [isRaising, setIsRaising] = React.useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<RaiseComplaintFormData>({
    resolver: zodResolver(raiseComplaintSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      category: "PLUMBING",
      flatId: "",
    },
  });

  React.useEffect(() => {
    if (flats && flats.length > 0) {
      setValue("flatId", flats[0].id);
    }
  }, [flats, setValue]);

  if (complaintsLoading || flatsLoading) {
    return <Loader />;
  }

  if (flats && flats.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, justifyContent: "center", flexGrow: 1 }}>
        <Card className="p-8 items-center border border-amber-500/20 bg-amber-500/5">
          <Ionicons name="warning-outline" size={48} color="#d97706" style={{ marginBottom: 16 }} />
          <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold mb-2 text-center">
            No Flat Associated
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm text-center leading-relaxed">
            Your profile is not linked to any flat in this society yet. Please contact the society administrator/owner to assign you to a flat.
          </Text>
        </Card>
      </ScreenContainer>
    );
  }

  const onSubmit = async (data: RaiseComplaintFormData) => {
    try {
      await raiseComplaintMutation.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        flatId: data.flatId,
      });
      reset({ title: "", description: "", category: "PLUMBING", flatId: flats?.[0]?.id ?? "" });
      setIsRaising(false);
      showToast("Complaint ticket registered successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to raise ticket", "error");
    }
  };

  const CATEGORIES = ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"] as const;

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {isRaising ? (
        <Card className="gap-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
              Raise New Complaint
            </Text>
            <Pressable onPress={() => setIsRaising(false)}>
              <Ionicons name="close-circle-outline" size={24} color="#78716c" />
            </Pressable>
          </View>

          <View className="gap-4">
            {/* Category */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Category
              </Text>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = field.value === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => field.onChange(cat)}
                          className={`py-2 px-3 rounded-lg border ${
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
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Title */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Issue Title *
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. Lift not working"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors.title && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.title.message}
                </FieldError>
              )}
            </View>

            {/* Description */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Details / Description *
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Describe the issue in detail"
                    placeholderTextColor="#78716c"
                    multiline
                    numberOfLines={3}
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 h-24 focus:border-primary-light dark:focus:border-primary-dark"
                    style={{ textAlignVertical: "top" }}
                  />
                )}
              />
              {errors.description && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.description.message}
                </FieldError>
              )}
            </View>

            <Pressable
              disabled={raiseComplaintMutation.isPending}
              onPress={handleSubmit(onSubmit)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
            >
              {raiseComplaintMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Submit Complaint</Text>
              )}
            </Pressable>
          </View>
        </Card>
      ) : (
        <View>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
              Helpdesk Tickets
            </Text>
            <Pressable
              onPress={() => setIsRaising(true)}
              className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 px-3 py-1.5 rounded-lg active:opacity-85"
            >
              <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold">+ Raise Issue</Text>
            </Pressable>
          </View>

          {complaintsLoading ? (
            <Loader fullscreen={false} />
          ) : !complaints || complaints.length === 0 ? (
            <Card className="p-6 items-center">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
                No complaints logged yet.
              </Text>
            </Card>
          ) : (
            complaints.map((comp: any) => (
              <Card key={comp.id} className="mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <CardTitle>{comp.title}</CardTitle>
                    <CardDescription>{comp.description}</CardDescription>
                  </View>
                  <View className="items-end">
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        comp.status === "RESOLVED"
                          ? "success"
                          : comp.status === "IN_PROGRESS"
                          ? "accent"
                          : "warning"
                      }
                    >
                      <Chip.Label>{comp.status}</Chip.Label>
                    </Chip>
                  </View>
                </View>

                <View className="flex-row justify-between items-center border-t border-border-light dark:border-border-dark pt-2.5 mt-2">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                    Category: {comp.category}
                  </Text>
                  {comp.flat && (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                      Flat: {comp.flat.tower.name} - {comp.flat.number}
                    </Text>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
export default HelpdeskView;

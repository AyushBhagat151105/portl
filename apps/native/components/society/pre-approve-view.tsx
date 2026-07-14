import React from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { usePreApproveGuestMutation, useMyFlatsQuery } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { preApproveGuestSchema, type PreApproveGuestFormData } from "@/lib/form-schemas";

export function PreApproveView() {
  const { data: flats } = useMyFlatsQuery();
  const preApproveMutation = usePreApproveGuestMutation();
  const { showToast } = useToastStore();

  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PreApproveGuestFormData>({
    resolver: zodResolver(preApproveGuestSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", purpose: "", flatId: "" },
  });

  React.useEffect(() => {
    if (flats && flats.length > 0) {
      setValue("flatId", flats[0].id);
    }
  }, [flats, setValue]);

  const onSubmit = async (data: PreApproveGuestFormData) => {
    try {
      const visitor = await preApproveMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        flatId: data.flatId,
      });
      setGeneratedCode(visitor.preApprovedCode);
      showToast("Guest invitation code generated successfully!", "success");
      reset({ name: "", phone: "", purpose: "" });
    } catch (err: any) {
      showToast(err.message || "Failed to generate pass", "error");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24 }}>
      <Card>
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
          Pre-Approve a Guest
        </Text>

        {generatedCode ? (
          <View className="items-center py-6">
            <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 mb-1">
              Share this 6-digit passcode with your guest:
            </Text>
            <View className="bg-muted-light dark:bg-muted-dark border border-primary-light/30 dark:border-primary-dark/30 px-6 py-4 rounded-xl mt-2 mb-4">
              <Text className="text-primary-light dark:text-primary-dark text-3xl font-extrabold tracking-widest">
                {generatedCode}
              </Text>
            </View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center px-4 mb-4">
              The guard will verify this code at the gate to grant instant entry.
            </Text>
            <Pressable
              onPress={() => setGeneratedCode(null)}
              className="bg-primary-light dark:bg-primary-dark py-3 px-6 rounded-xl active:opacity-90"
            >
              <Text className="text-white font-semibold">Generate Another Pass</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Guest Name *
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors.name && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.name.message}
                </FieldError>
              )}
            </View>

            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Guest Phone *
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#78716c"
                    keyboardType="phone-pad"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors.phone && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.phone.message}
                </FieldError>
              )}
            </View>

            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Purpose (Optional)
              </Text>
              <Controller
                control={control}
                name="purpose"
                render={({ field }) => (
                  <TextInput
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. Dinner Guest"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
            </View>

            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Your Flat *
              </Text>
              {flats && flats.length > 0 ? (
                <Controller
                  control={control}
                  name="flatId"
                  render={({ field }) => (
                    <View className="flex-row gap-2 flex-wrap">
                      {flats.map((f: any) => {
                        const isSelected = field.value === f.id;
                        return (
                          <Pressable
                            key={f.id}
                            onPress={() => field.onChange(f.id)}
                            className={`py-2.5 px-4 rounded-xl border ${
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
                              {f.tower.name} - {f.number}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />
              ) : (
                <Text className="text-rose-500 text-xs">No registered flats found</Text>
              )}
              {errors.flatId && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.flatId.message}
                </FieldError>
              )}
            </View>

            <Pressable
              disabled={preApproveMutation.isPending}
              onPress={handleSubmit(onSubmit)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
            >
              {preApproveMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Generate Passcode</Text>
              )}
            </Pressable>
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
}
export default PreApproveView;

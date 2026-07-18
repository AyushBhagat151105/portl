import React from "react";
import { View, Pressable, Text, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { TextField, Label, Input, FieldError } from "heroui-native";
import { authClient } from "@/lib/auth-client";
import { ScreenContainer } from "../ui/screen-container";
import { FormInput } from "../ui/form-input";
import { BackButton } from "./back-button";
import { createSocietySchema, type CreateSocietyFormData } from "@/lib/form-schemas";

export function CreateSocietyView() {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<CreateSocietyFormData>({
    resolver: zodResolver(createSocietySchema),
    mode: "onTouched",
    defaultValues: { name: "", slug: "" },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  const handleSlugFromName = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateSocietyFormData) => {
    try {
      await authClient.organization.create({
        name: data.name.trim(),
        slug: data.slug.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["my-membership"] });
      router.replace("/onboarding/setup-structure");
    } catch (err: any) {
      const msg = err?.message || "Failed to create society. The code may already be taken.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
      {/* Back button */}
      <BackButton />

      {/* Header */}
      <View className="mb-8">
        <View className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 items-center justify-center mb-4">
          <Ionicons name="business-outline" size={28} color="#f59e0b" />
        </View>
        <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-extrabold mb-1">Create Your Society</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm leading-relaxed">
          You'll be the admin. After creating, you can set up towers, flats, and invite members.
        </Text>
      </View>

      {/* Form */}
      <View className="gap-5">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState: { error } }) => (
            <TextField className="gap-1.5">
              <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                Society Name
              </Label>
              <Input
                value={field.value}
                onChangeText={(val) => {
                  field.onChange(val);
                  handleSlugFromName(val);
                }}
                onBlur={field.onBlur}
                placeholder="e.g. Sunshine Apartments"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
              />
              {error?.message && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {error.message}
                </FieldError>
              )}
            </TextField>
          )}
        />

        <FormInput
          control={control}
          name="slug"
          label="Society Code"
          placeholder="e.g. sunshine-apts"
          autoCapitalize="none"
        />

        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs -mt-3">
          Members will use this code to join. Use lowercase letters, numbers, and hyphens only.
        </Text>

        {/* Preview */}
        {slugValue.length > 0 && (
          <View className="bg-muted-light/60 dark:bg-muted-dark/60 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 flex-row items-center gap-3">
            <Ionicons name="link-outline" size={16} color="#78716c" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-mono flex-1" numberOfLines={1}>
              Join code: <Text className="text-primary-light dark:text-primary-dark font-bold">{slugValue}</Text>
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !nameValue}
          className="bg-primary-light dark:bg-primary-dark rounded-xl py-4 items-center mt-2 active:opacity-90 disabled:opacity-50"
          accessibilityRole="button"
          accessibilityLabel="Create society"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-sm">Create Society</Text>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

export default CreateSocietyView;

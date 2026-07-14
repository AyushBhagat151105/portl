import React from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePollMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { createPollSchema, type CreatePollFormData } from "@/lib/form-schemas";
import { FieldError } from "heroui-native";

export function CreatePollView() {
  const pollMutation = useCreatePollMutation();
  const { showToast } = useToastStore();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    mode: "onTouched",
    defaultValues: {
      question: "",
      options: [{ value: "Yes" }, { value: "No" }],
    },
  });

  const { fields: optionFields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const handleAddOption = () => {
    if (optionFields.length >= 5) {
      showToast("A maximum of 5 options are allowed.", "error");
      return;
    }
    append({ value: "" });
  };

  const onSubmit = async (data: CreatePollFormData) => {
    const cleanOptions = data.options
      .map((opt) => opt.value.trim())
      .filter((opt) => opt !== "");

    if (cleanOptions.length < 2) {
      showToast("At least 2 non-empty options are required", "error");
      return;
    }

    try {
      await pollMutation.mutateAsync({ question: data.question, options: cleanOptions });
      showToast("Community poll created successfully!", "success");
      reset({ question: "", options: [{ value: "Yes" }, { value: "No" }] });
    } catch (err: any) {
      showToast(err.message || "Failed to create poll", "error");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24 }}>
      <Card>
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
          Create Community Poll
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Question *
            </Text>
            <Controller
              control={control}
              name="question"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. Paint tower gates blue?"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                />
              )}
            />
            {errors.question && (
              <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                {errors.question.message}
              </FieldError>
            )}
          </View>

          <View className="gap-2.5">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                Poll Options
              </Text>
              <Pressable onPress={handleAddOption} className="active:opacity-75">
                <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold">
                  + Add Option
                </Text>
              </Pressable>
            </View>

            {optionFields.map((field, idx) => (
              <View key={field.id} className="flex-row gap-2 items-center">
                <Controller
                  control={control}
                  name={`options.${idx}.value`}
                  render={({ field: inputField }) => (
                    <TextInput
                      value={inputField.value}
                      onChangeText={inputField.onChange}
                      onBlur={inputField.onBlur}
                      placeholder={`Option ${idx + 1}`}
                      placeholderTextColor="#78716c"
                      className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-2.5 px-4 focus:border-primary-light dark:focus:border-primary-dark flex-1 text-sm"
                    />
                  )}
                />
                {optionFields.length > 2 && (
                  <Pressable onPress={() => remove(idx)} className="p-1.5 active:opacity-75">
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Pressable>
                )}
              </View>
            ))}
            {errors.options?.message && (
              <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                {errors.options.message}
              </FieldError>
            )}
          </View>

          <Pressable
            disabled={pollMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
          >
            {pollMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Launch Poll</Text>
            )}
          </Pressable>
        </View>
      </Card>
    </ScreenContainer>
  );
}
export default CreatePollView;

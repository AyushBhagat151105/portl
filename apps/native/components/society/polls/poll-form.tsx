import React, { useEffect } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FieldError } from "heroui-native";
import { Card } from "../../ui/card";
import { createPollSchema, type CreatePollFormData } from "../../../lib/form-schemas";

interface PollFormProps {
  onSubmit: (data: CreatePollFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PollForm({ onSubmit, isSubmitting }: PollFormProps) {
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
      alert("A maximum of 5 options are allowed.");
      return;
    }
    append({ value: "" });
  };

  return (
    <Card>
      <Text className="text-foreground-light dark:text-foreground-dark text-base font-bold mb-4">
        Launch New Poll
      </Text>

      <View className="gap-4">
        {/* Question */}
        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
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
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark text-sm"
              />
            )}
          />
          {errors.question && (
            <FieldError isInvalid className="text-rose-500 text-xs mt-1">
              {errors.question.message}
            </FieldError>
          )}
        </View>

        {/* Dynamic Options List */}
        <View className="gap-2.5">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
              Poll Options
            </Text>
            <Pressable onPress={handleAddOption} className="active:opacity-75" accessibilityRole="button" accessibilityLabel="Add new option field">
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
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-2.5 px-4 focus:border-primary-light dark:focus:border-primary-dark flex-1 text-sm font-semibold"
                  />
                )}
              />
              {optionFields.length > 2 && (
                <Pressable onPress={() => remove(idx)} className="p-1.5 active:opacity-75" accessibilityRole="button" accessibilityLabel={`Delete option ${idx + 1}`}>
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

        {/* Submit */}
        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90 disabled:opacity-50"
          accessibilityRole="button"
          accessibilityLabel="Launch poll"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">Launch Poll</Text>
          )}
        </Pressable>
      </View>
    </Card>
  );
}
export default PollForm;

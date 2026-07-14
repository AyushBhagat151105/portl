import React from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { useCreateNoticeMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { createNoticeSchema, type CreateNoticeFormData } from "@/lib/form-schemas";

export function CreateNoticeView() {
  const noticeMutation = useCreateNoticeMutation();
  const { showToast } = useToastStore();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateNoticeFormData>({
    resolver: zodResolver(createNoticeSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: CreateNoticeFormData) => {
    try {
      await noticeMutation.mutateAsync({ title: data.title, content: data.content });
      showToast("Notice announcement published successfully!", "success");
      reset();
    } catch (err: any) {
      showToast(err.message || "Failed to publish notice", "error");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24 }}>
      <Card>
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
          Publish Notice
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Notice Title *
            </Text>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. Lift Maintenance Schedule"
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

          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
              Notice Body Content *
            </Text>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Announce details to all residents..."
                  placeholderTextColor="#78716c"
                  multiline
                  numberOfLines={4}
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 h-28 focus:border-primary-light dark:focus:border-primary-dark"
                  style={{ textAlignVertical: "top" }}
                />
              )}
            />
            {errors.content && (
              <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                {errors.content.message}
              </FieldError>
            )}
          </View>

          <Pressable
            disabled={noticeMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
          >
            {noticeMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Announce & Broadcast</Text>
            )}
          </Pressable>
        </View>
      </Card>
    </ScreenContainer>
  );
}
export default CreateNoticeView;

import React, { useState } from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator, useColorScheme, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePollMutation, useClosePollMutation } from "../../queries/admin";
import { usePollsQuery } from "../../queries/common";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { createPollSchema, type CreatePollFormData } from "@/lib/form-schemas";
import { FieldError } from "heroui-native";
import { Loader } from "../ui/loader";

export function CreatePollView() {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const pollMutation = useCreatePollMutation();
  const closeMutation = useClosePollMutation();
  const { data: polls = [], isLoading: pollsLoading } = usePollsQuery();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      setActiveTab("manage");
    } catch (err: any) {
      showToast(err.message || "Failed to create poll", "error");
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await closeMutation.mutateAsync(pollId);
      showToast("Poll closed successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to close poll", "error");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {/* Page Title & Back Button */}
      <View className="flex-row items-center mb-6 justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black">
            Community Polls
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
            Admin voting workspace
          </Text>
        </View>
        <Ionicons name="bar-chart" size={24} color={isDark ? "#f97316" : "#b45309"} />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-muted-light dark:bg-muted-dark p-1 rounded-xl mb-6">
        <Pressable
          onPress={() => setActiveTab("create")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "create" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "create" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            Create Poll
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("manage")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "manage" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "manage" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            Manage Polls ({polls.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === "create" ? (
        <Card>
          <Text className="text-foreground-light dark:text-foreground-dark text-base font-bold mb-4">
            Launch New Poll
          </Text>

          <View className="gap-4">
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-semibold">
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

            <View className="gap-2.5">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
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
      ) : (
        <View className="gap-3.5">
          {pollsLoading && <Loader fullscreen={false} />}
          {!pollsLoading && polls.length === 0 && (
            <Card className="p-6 items-center justify-center">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                No community polls created yet.
              </Text>
            </Card>
          )}

          {polls.map((poll: any) => {
            const isClosed = poll.status === "CLOSED";

            return (
              <Card key={poll.id} className="gap-3">
                <View className="flex-row justify-between items-center mb-0.5">
                  <View className="bg-muted-light dark:bg-muted-dark px-2 py-0.5 rounded border border-border-light dark:border-border-dark">
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] uppercase tracking-wider font-bold">
                      {isClosed ? "Closed" : "Active"}
                    </Text>
                  </View>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-mono">
                    Total: {poll.totalVotes} votes
                  </Text>
                </View>

                <Text className="text-foreground-light dark:text-foreground-dark text-sm font-bold">
                  {poll.question}
                </Text>

                <View className="gap-2">
                  {poll.options.map((opt: string, idx: number) => {
                    const votes = poll.results[idx] || 0;
                    const pct = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;

                    return (
                      <View
                        key={idx}
                        className="rounded-xl overflow-hidden border border-border-light dark:border-border-dark bg-muted-light/40 dark:bg-muted-dark/40"
                      >
                        {/* Percentage bar background */}
                        <View
                          className="absolute top-0 bottom-0 left-0 bg-primary-light/10 dark:bg-primary-dark/10"
                          style={{ width: `${pct}%` }}
                        />

                        <View className="flex-row justify-between items-center py-2.5 px-3.5">
                          <Text className="text-xs font-semibold text-foreground-light dark:text-foreground-dark">
                            {opt}
                          </Text>
                          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold">
                            {pct}% ({votes})
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {!isClosed && (
                  <View className="flex-row justify-end mt-2">
                    <Pressable
                      onPress={() => handleClosePoll(poll.id)}
                      disabled={closeMutation.isPending}
                      className="bg-rose-500/10 border border-rose-500/25 px-3.5 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
                    >
                      <Ionicons name="power" size={13} color="#f43f5e" />
                      <Text className="text-rose-500 text-xs font-bold">End Poll</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
export default CreatePollView;

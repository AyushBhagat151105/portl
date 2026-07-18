import React, { useState } from "react";
import { Text, View, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCreatePollMutation, useClosePollMutation } from "../../queries/admin";
import { usePollsQuery } from "../../queries/common";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";
import { PollForm } from "./polls/poll-form";
import { type CreatePollFormData } from "@/lib/form-schemas";

export function CreatePollView() {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const pollMutation = useCreatePollMutation();
  const closeMutation = useClosePollMutation();
  const { data: polls = [], isLoading: pollsLoading, refetch: refetchPolls } = usePollsQuery();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLaunchSubmit = async (data: CreatePollFormData) => {
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
      setActiveTab("manage");
      refetchPolls();
    } catch (err: any) {
      showToast(err.message || "Failed to create poll", "error");
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await closeMutation.mutateAsync(pollId);
      showToast("Poll closed successfully!", "success");
      refetchPolls();
    } catch (err: any) {
      showToast(err.message || "Failed to close poll", "error");
    }
  };

  const primaryColor = isDark ? "#f97316" : "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {/* Page Title & Header */}
      <View className="flex-row items-center mb-6 justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black">
            Community Polls
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
            Admin voting workspace
          </Text>
        </View>
        <Ionicons name="bar-chart" size={24} color={primaryColor} />
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
        /* Stateful Decomposed Poll Form */
        <PollForm
          onSubmit={handleLaunchSubmit}
          isSubmitting={pollMutation.isPending}
        />
      ) : (
        /* Manage Polls list */
        <View className="gap-3.5">
          {pollsLoading && <Loader fullscreen={false} />}
          {!pollsLoading && polls.length === 0 && (
            <Card className="py-12 items-center justify-center border border-border-light dark:border-border-dark">
              <Ionicons name="bar-chart-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2.5 font-medium">
                No polls created yet.
              </Text>
            </Card>
          )}
          {!pollsLoading &&
            polls.map((poll: any) => {
              const isClosed = poll.status === "CLOSED";
              return (
                <Card key={poll.id} className="border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5 p-4 gap-3">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-2">
                      <CardTitle className="text-sm font-extrabold">{poll.question}</CardTitle>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                        Created: {new Date(poll.createdAt).toLocaleDateString()} • {poll.totalVotes || 0} total votes
                      </Text>
                    </View>
                    <View className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark px-2 py-0.5 rounded">
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] uppercase font-mono font-bold">
                        {poll.status}
                      </Text>
                    </View>
                  </View>

                  {/* Options display with votes */}
                  <View className="gap-2 mt-1">
                    {poll.options.map((opt: string, index: number) => {
                      const votes = poll.results?.[index] || 0;
                      const percentage = poll.totalVotes > 0 ? (votes / poll.totalVotes) * 100 : 0;
                      return (
                        <View key={`${opt}_${index}`} className="gap-1">
                          <View className="flex-row justify-between text-xxs font-semibold">
                            <Text className="text-foreground-light dark:text-foreground-dark text-[11px]">{opt}</Text>
                            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px]">
                              {votes} ({percentage.toFixed(0)}%)
                            </Text>
                          </View>
                          <View className="h-1.5 w-full bg-muted-light dark:bg-muted-dark rounded-full overflow-hidden">
                            <View
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {!isClosed && (
                    <Pressable
                      disabled={closeMutation.isPending}
                      onPress={() => handleClosePoll(poll.id)}
                      className="bg-rose-500/10 border border-rose-500/25 py-2.5 rounded-xl items-center mt-2 active:opacity-75 disabled:opacity-50"
                      accessibilityRole="button"
                      accessibilityLabel="Close poll voting session"
                    >
                      <Text className="text-rose-500 text-xs font-bold">Close Poll Session</Text>
                    </Pressable>
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

import React from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, useColorScheme } from "react-native";
import { Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import {
  usePendingGateCallsQuery,
  useRespondVisitorMutation,
  useNoticesQuery,
  usePollsQuery,
  useVotePollMutation,
} from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

export function ResidentDashboardView() {
  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {/* Active Gate Calls (Overlay Alerts at top) */}
      <GateCallsSection />

      {/* Notices Board Section */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <Ionicons name="megaphone-outline" size={20} color="#b45309" style={{ marginRight: 8 }} />
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
            Notice Board
          </Text>
        </View>
        <NoticesList />
      </View>

      {/* Community Polls Section */}
      <View>
        <View className="flex-row items-center mb-4">
          <Ionicons name="bar-chart-outline" size={20} color="#b45309" style={{ marginRight: 8 }} />
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
            Active Polls
          </Text>
        </View>
        <PollsList />
      </View>
    </ScreenContainer>
  );
}

function GateCallsSection() {
  const { data: pendingCalls, isLoading } = usePendingGateCallsQuery();
  const respondMutation = useRespondVisitorMutation();
  const colorScheme = useColorScheme();

  if (isLoading || !pendingCalls || pendingCalls.length === 0) return null;

  const warningBorderColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <View className="mb-6">
      <Text className="text-primary-light dark:text-primary-dark font-semibold mb-3 flex-row items-center">
        <Ionicons name="notifications-outline" size={16} /> Active Gate Entry Requests ({pendingCalls.length})
      </Text>
      {pendingCalls.map((call: any) => (
        <Card
          key={call.id}
          className="mb-3 shadow-md"
          style={{ borderColor: warningBorderColor, borderWidth: 1 }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
                {call.name}
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                Phone: {call.phone}
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
                Purpose: {call.purpose || "N/A"}
              </Text>
              <Chip size="sm" variant="soft" color="warning" className="mt-2">
                <Chip.Label>{call.type}</Chip.Label>
              </Chip>
            </View>
            <View className="items-end">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                Flat {call.flat.tower.name} - {call.flat.number}
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-1">
                {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3 mt-1">
            <Pressable
              disabled={respondMutation.isPending}
              onPress={() => respondMutation.mutate({ visitorId: call.id, status: "APPROVED" })}
              className="flex-1 bg-emerald-600 rounded-xl py-3 items-center active:opacity-90"
            >
              <Text className="text-white font-bold text-sm">Approve Entry</Text>
            </Pressable>
            <Pressable
              disabled={respondMutation.isPending}
              onPress={() => respondMutation.mutate({ visitorId: call.id, status: "REJECTED" })}
              className="flex-1 bg-rose-600 rounded-xl py-3 items-center active:opacity-90"
            >
              <Text className="text-white font-bold text-sm">Deny Entry</Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </View>
  );
}

function NoticesList() {
  const { data: notices, isLoading } = useNoticesQuery();

  if (isLoading) return <Loader fullscreen={false} />;
  if (!notices || notices.length === 0) {
    return (
      <Card className="p-5 items-center">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
          No notice announcements published.
        </Text>
      </Card>
    );
  }

  return notices.map((not: any) => (
    <Card key={not.id} className="mb-3">
      <CardTitle>{not.title}</CardTitle>
      <CardDescription>{not.content}</CardDescription>
      <View className="flex-row justify-between items-center border-t border-border-light dark:border-border-dark pt-2.5 mt-2">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
          By {not.author.name}
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
          {new Date(not.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </Text>
      </View>
    </Card>
  ));
}

function PollsList() {
  const { data: polls, isLoading } = usePollsQuery();
  const voteMutation = useVotePollMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await voteMutation.mutateAsync({ pollId, optionIndex });
      showToast("Your vote has been recorded!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to vote in poll", "error");
    }
  };

  if (isLoading) return <Loader fullscreen={false} />;
  if (!polls || polls.length === 0) {
    return (
      <Card className="p-5 items-center">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
          No active community polls.
        </Text>
      </Card>
    );
  }

  return polls.map((poll: any) => {
    const hasVoted = poll.userVotedIndex !== null;

    return (
      <Card key={poll.id} className="mb-3">
        <Text className="text-foreground-light dark:text-foreground-dark text-base font-bold mb-3">
          {poll.question}
        </Text>
        <View className="gap-2.5">
          {poll.options.map((opt: string, idx: number) => {
            const votes = poll.results[idx] || 0;
            const pct = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
            const isSelected = poll.userVotedIndex === idx;

            return (
              <Pressable
                key={idx}
                disabled={hasVoted || voteMutation.isPending}
                onPress={() => handleVote(poll.id, idx)}
                className={`rounded-xl overflow-hidden border ${
                  isSelected
                    ? "border-primary-light dark:border-primary-dark"
                    : "border-border-light dark:border-border-dark"
                } bg-muted-light/50 dark:bg-muted-dark/50`}
              >
                {hasVoted && (
                  <View
                    className="absolute top-0 bottom-0 left-0 bg-primary-light/10 dark:bg-primary-dark/10"
                    style={{ width: `${pct}%` }}
                  />
                )}

                <View className="flex-row justify-between items-center py-3 px-4">
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"
                    }`}
                  >
                    {opt}
                  </Text>
                  {hasVoted && (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold">
                      {pct}% ({votes})
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-3 text-right">
          Total Votes: {poll.totalVotes}
        </Text>
      </Card>
    );
  });
}
export default ResidentDashboardView;

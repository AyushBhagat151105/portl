import React from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, useColorScheme, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "heroui-native";
import {
  useNoticesQuery,
  usePollsQuery,
  useVotePollMutation,
  usePendingGateCallsQuery,
  useRespondVisitorMutation,
  useDeleteNoticeMutation,
} from "../../queries/society";
import { useClosePollMutation } from "../../queries/admin";
import { useSocietyStore } from "@/store/useSocietyStore";
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
  const colorScheme = useColorScheme();
  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";
  const deleteMutation = useDeleteNoticeMutation();
  const { currentRole } = useSocietyStore();
  const { showToast } = useToastStore();

  const handleDelete = async (noticeId: string) => {
    try {
      await deleteMutation.mutateAsync(noticeId);
      showToast("Notice deleted successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete notice", "error");
    }
  };

  if (isLoading) return <Loader fullscreen={false} />;
  if (!notices || notices.length === 0) {
    return (
      <Card className="p-6 items-center border border-border-light dark:border-border-dark">
        <Ionicons name="notifications-off-outline" size={24} color="#78716c" />
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2">
          No notice announcements published.
        </Text>
      </Card>
    );
  }

  return notices.map((not: any) => (
    <Card key={not.id} className="mb-4 overflow-hidden border border-border-light dark:border-border-dark p-0">
      {not.banner ? (
        <Image source={{ uri: not.banner }} className="w-full h-36 object-cover" />
      ) : null}
      <View className="p-4 gap-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm flex-1 mr-2 leading-snug">
            {not.title}
          </Text>
          <View className="flex-row items-center gap-2">
            {currentRole === "admin" && (
              <Pressable
                disabled={deleteMutation.isPending}
                onPress={() => handleDelete(not.id)}
                className="w-6 h-6 rounded-full bg-rose-500/10 items-center justify-center active:scale-95"
              >
                <Ionicons name="trash" size={13} color="#f43f5e" />
              </Pressable>
            )}
            <Ionicons name="volume-medium-outline" size={16} color={primaryColor} />
          </View>
        </View>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs leading-relaxed">
          {not.content}
        </Text>
        <View className="flex-row justify-between items-center border-t border-border-light/60 dark:border-border-dark/60 pt-3 mt-1.5">
          <View className="flex-row items-center gap-1.5">
            {not.author?.image ? (
              <Image source={{ uri: not.author.image }} className="w-4 h-4 rounded-full" />
            ) : (
              <View className="w-4 h-4 rounded-full bg-muted-light dark:bg-muted-dark items-center justify-center">
                <Ionicons name="person" size={8} color="#78716c" />
              </View>
            )}
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold">
              {not.author?.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={10} color="#78716c" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-medium">
              {new Date(not.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  ));
}

function PollsList() {
  const { data: polls, isLoading } = usePollsQuery();
  const voteMutation = useVotePollMutation();
  const closeMutation = useClosePollMutation();
  const { currentRole } = useSocietyStore();
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

  const handleClosePoll = async (pollId: string) => {
    try {
      await closeMutation.mutateAsync(pollId);
      showToast("Poll closed successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to close poll", "error");
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

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return polls.map((poll: any) => {
    const hasVoted = poll.userVotedIndex !== null;
    const isClosed = poll.status === "CLOSED";
    const showResults = hasVoted || currentRole === "admin" || isClosed;

    return (
      <Card key={poll.id} className="mb-3.5 gap-2.5">
        <View className="flex-row justify-between items-center mb-1">
          <View className="bg-muted-light dark:bg-muted-dark px-2 py-0.5 rounded border border-border-light dark:border-border-dark">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] uppercase tracking-wider font-bold">
              {isClosed ? "Closed" : "Active"}
            </Text>
          </View>
          {isClosed && (
            <Ionicons name="lock-closed-outline" size={14} color="#ef4444" />
          )}
        </View>

        <Text className="text-foreground-light dark:text-foreground-dark text-base font-bold mb-1">
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
                disabled={hasVoted || isClosed || voteMutation.isPending}
                onPress={() => handleVote(poll.id, idx)}
                className={`rounded-xl overflow-hidden border ${
                  isSelected
                    ? "border-primary-light dark:border-primary-dark"
                    : "border-border-light dark:border-border-dark"
                } bg-muted-light/50 dark:bg-muted-dark/50`}
              >
                {showResults && (
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
                  {showResults && (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold">
                      {pct}% ({votes})
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row justify-between items-center mt-2.5">
          {currentRole === "admin" && !isClosed ? (
            <Pressable
              onPress={() => handleClosePoll(poll.id)}
              disabled={closeMutation.isPending}
              className="bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
            >
              <Ionicons name="power" size={12} color="#f43f5e" />
              <Text className="text-rose-500 text-xs font-bold">End Poll</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-mono">
            Total Votes: {poll.totalVotes}
          </Text>
        </View>
      </Card>
    );
  });
}
export default ResidentDashboardView;

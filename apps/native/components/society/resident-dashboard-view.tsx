import React from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { Card, Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import {
  usePendingGateCallsQuery,
  useRespondVisitorMutation,
  useNoticesQuery,
  usePollsQuery,
  useVotePollMutation,
} from "../../queries/society";

export function ResidentDashboardView() {
  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Active Gate Calls (Overlay Alerts at top) */}
      <GateCallsSection />

      {/* Notices Board Section */}
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4 flex-row items-center">
          <Ionicons name="megaphone-outline" size={20} style={{ marginRight: 8 }} /> Notice Board
        </Text>
        <NoticesList />
      </View>

      {/* Community Polls Section */}
      <View>
        <Text className="text-white text-xl font-bold mb-4 flex-row items-center">
          <Ionicons name="bar-chart-outline" size={20} style={{ marginRight: 8 }} /> Active Polls
        </Text>
        <PollsList />
      </View>
    </ScrollView>
  );
}

function GateCallsSection() {
  const { data: pendingCalls, isLoading } = usePendingGateCallsQuery();
  const respondMutation = useRespondVisitorMutation();

  if (isLoading || !pendingCalls || pendingCalls.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="text-amber-500 font-semibold mb-3 flex-row items-center">
        <Ionicons name="notifications-outline" size={16} /> Active Gate Entry Requests ({pendingCalls.length})
      </Text>
      {pendingCalls.map((call: any) => (
        <Card key={call.id} className="border border-amber-500/50 bg-zinc-900 p-4 rounded-2xl mb-3 shadow-md">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-white text-lg font-bold">{call.name}</Text>
              <Text className="text-zinc-400 text-xs">Phone: {call.phone}</Text>
              <Text className="text-zinc-400 text-xs">Purpose: {call.purpose || "N/A"}</Text>
              <Chip size="sm" variant="soft" color="warning" className="mt-2">
                <Chip.Label>{call.type}</Chip.Label>
              </Chip>
            </View>
            <View className="items-end">
              <Text className="text-zinc-300 font-bold text-sm">
                Flat {call.flat.tower.name} - {call.flat.number}
              </Text>
              <Text className="text-zinc-500 text-xxs mt-1">
                {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3 mt-1">
            <Pressable
              disabled={respondMutation.isPending}
              onPress={() => respondMutation.mutate({ visitorId: call.id, status: "APPROVED" })}
              className="flex-1 bg-emerald-600 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white font-bold text-sm">Approve Entry</Text>
            </Pressable>
            <Pressable
              disabled={respondMutation.isPending}
              onPress={() => respondMutation.mutate({ visitorId: call.id, status: "REJECTED" })}
              className="flex-1 bg-rose-600 rounded-xl py-3 items-center active:opacity-80"
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

  if (isLoading) return <ActivityIndicator color="#f59e0b" className="my-3" />;
  if (!notices || notices.length === 0) {
    return (
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 items-center">
        <Text className="text-zinc-500 text-xs">No notice announcements published.</Text>
      </View>
    );
  }

  return notices.map((not: any) => (
    <Card key={not.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
      <Text className="text-white text-base font-bold">{not.title}</Text>
      <Text className="text-zinc-400 text-xs mt-1.5 mb-3">{not.content}</Text>
      <View className="flex-row justify-between items-center border-t border-zinc-800/80 pt-2.5">
        <Text className="text-zinc-500 text-xxs">By {not.author.name}</Text>
        <Text className="text-zinc-500 text-xxs">
          {new Date(not.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </Text>
      </View>
    </Card>
  ));
}

function PollsList() {
  const { data: polls, isLoading } = usePollsQuery();
  const voteMutation = useVotePollMutation();

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await voteMutation.mutateAsync({ pollId, optionIndex });
      Alert.alert("Success", "Your vote has been recorded!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to vote in poll");
    }
  };

  if (isLoading) return <ActivityIndicator color="#f59e0b" className="my-3" />;
  if (!polls || polls.length === 0) {
    return (
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 items-center">
        <Text className="text-zinc-500 text-xs">No active community polls.</Text>
      </View>
    );
  }

  return polls.map((poll: any) => {
    const hasVoted = poll.userVotedIndex !== null;

    return (
      <Card key={poll.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
        <Text className="text-white text-base font-bold mb-3">{poll.question}</Text>
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
                className="rounded-xl overflow-hidden border bg-zinc-950/50"
                style={{
                  borderColor: isSelected ? "#f59e0b" : "#27272a",
                }}
              >
                {hasVoted && (
                  <View
                    className="absolute top-0 bottom-0 left-0 bg-amber-500/10"
                    style={{ width: `${pct}%` }}
                  />
                )}

                <View className="flex-row justify-between items-center py-3 px-4">
                  <Text
                    className="text-xs"
                    style={{
                      color: isSelected ? "#f59e0b" : "#a1a1aa",
                      fontWeight: isSelected ? "600" : "400",
                    }}
                  >
                    {opt}
                  </Text>
                  {hasVoted && (
                    <Text className="text-zinc-500 text-xxs font-semibold">
                      {pct}% ({votes})
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text className="text-zinc-500 text-xxs mt-3 text-right">
          Total Votes: {poll.totalVotes}
        </Text>
      </Card>
    );
  });
}

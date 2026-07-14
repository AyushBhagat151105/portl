import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useActiveVisitorsQuery, useMarkExitMutation, useVisitorHistoryQuery } from "../../queries/society";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: "rgba(52,211,153,0.1)", text: "#34d399", border: "rgba(52,211,153,0.2)" },
  PENDING:  { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  EXITED:   { bg: "rgba(113,113,122,0.1)", text: "#71717a", border: "rgba(113,113,122,0.2)" },
  REJECTED: { bg: "rgba(244,63,94,0.1)",  text: "#f43f5e", border: "rgba(244,63,94,0.2)" },
};

type Visitor = {
  id: string;
  name: string;
  phone: string;
  type: string;
  status: string;
  createdAt: string;
  exitedAt?: string;
  flat: { number: string; tower: { name: string } };
};

function VisitorCard({
  log,
  showCheckout = false,
  onCheckout,
  exitPending = false,
}: {
  log: Visitor;
  showCheckout?: boolean;
  onCheckout?: () => void;
  exitPending?: boolean;
}) {
  const statusStyle = STATUS_COLORS[log.status] ?? STATUS_COLORS.PENDING;

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white text-base font-bold">{log.name}</Text>
          <Text className="text-zinc-400 text-xs mt-0.5">{log.phone}</Text>
          <Text className="text-zinc-500 text-xs">
            Flat {log.flat.tower.name} — {log.flat.number}
          </Text>
          <View
            className="self-start mt-2 px-2 py-0.5 rounded-md"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "#27272a" }}
          >
            <Text className="text-zinc-500 text-xs">{log.type.toLowerCase()}</Text>
          </View>
        </View>
        <View className="items-end gap-1.5">
          <View
            className="px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: statusStyle.bg, borderWidth: 1, borderColor: statusStyle.border }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusStyle.text }}>
              {log.status}
            </Text>
          </View>
          <Text className="text-zinc-600 text-xs">
            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {log.exitedAt && (
            <Text className="text-zinc-600 text-xs">
              Out: {new Date(log.exitedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
        </View>
      </View>

      {showCheckout && log.status === "APPROVED" && (
        <Pressable
          disabled={exitPending}
          onPress={onCheckout}
          className="bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 items-center active:opacity-80"
        >
          <Text className="text-rose-500 font-semibold text-xs">Mark Exit / Check-out</Text>
        </Pressable>
      )}
      {log.status === "PENDING" && (
        <View className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl items-center">
          <Text className="text-amber-500/80 text-xs font-medium italic">
            Awaiting resident approval…
          </Text>
        </View>
      )}
    </View>
  );
}

export function VisitorLogsView() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const { data: activeLogs = [], isLoading: activeLoading } = useActiveVisitorsQuery();
  const { data: historyLogs = [], isLoading: historyLoading } = useVisitorHistoryQuery();
  const exitMutation = useMarkExitMutation();

  const handleCheckout = async (visitorId: string) => {
    try {
      await exitMutation.mutateAsync(visitorId);
      Alert.alert("Success", "Visitor marked as checked out.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to log checkout");
    }
  };

  const isLoading = activeTab === "active" ? activeLoading : historyLoading;
  const logs: Visitor[] = activeTab === "active" ? (activeLogs as Visitor[]) : (historyLogs as Visitor[]);

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Tab Switcher */}
      <View className="flex-row mx-4 mt-4 mb-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1">
        {(["active", "history"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: activeTab === tab ? "#f59e0b" : "transparent",
            }}
          >
            <Ionicons
              name={tab === "active" ? "people-outline" : "journal-outline"}
              size={14}
              color={activeTab === tab ? "#000" : "#a1a1aa"}
            />
            <Text
              className="text-xs font-semibold capitalize"
              style={{ color: activeTab === tab ? "#000" : "#a1a1aa" }}
            >
              {tab === "active" ? "Active" : "History"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-zinc-500 text-xs mb-3">
            {activeTab === "active" ? `${logs.length} inside / pending` : `${logs.length} historical records`}
          </Text>

          {logs.length === 0 ? (
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 items-center">
              <Ionicons
                name={activeTab === "active" ? "people-outline" : "journal-outline"}
                size={36}
                color="#3f3f46"
              />
              <Text className="text-zinc-500 text-sm mt-3 text-center">
                {activeTab === "active" ? "No visitors currently inside" : "No visitor history yet"}
              </Text>
            </View>
          ) : (
            logs.map((log) => (
              <VisitorCard
                key={log.id}
                log={log}
                showCheckout={activeTab === "active"}
                onCheckout={() => handleCheckout(log.id)}
                exitPending={exitMutation.isPending}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

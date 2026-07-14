import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useActiveVisitorsQuery, useMarkExitMutation, useVisitorHistoryQuery } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.2)" },
  PENDING:  { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  EXITED:   { bg: "rgba(120,113,108,0.1)", text: "#78716c", border: "rgba(120,113,108,0.2)" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",  text: "#ef4444", border: "rgba(239,68,68,0.2)" },
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
    <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-4 mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-foreground-light dark:text-foreground-dark text-base font-bold">{log.name}</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">{log.phone}</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
            Flat {log.flat.tower.name} — {log.flat.number}
          </Text>
          <View className="self-start mt-2 px-2 py-0.5 rounded-md bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">{log.type.toLowerCase()}</Text>
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
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {log.exitedAt && (
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs">
              Out: {new Date(log.exitedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
        </View>
      </View>

      {showCheckout && log.status === "APPROVED" && (
        <Pressable
          disabled={exitPending}
          onPress={onCheckout}
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 items-center active:opacity-80"
        >
          <Text className="text-rose-500 font-semibold text-xs">Mark Exit / Check-out</Text>
        </Pressable>
      )}
      {log.status === "PENDING" && (
        <View className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark p-2.5 rounded-xl items-center">
          <Text className="text-amber-600 dark:text-amber-500 text-xs font-medium italic">
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
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const handleCheckout = async (visitorId: string) => {
    try {
      await exitMutation.mutateAsync(visitorId);
      showToast("Visitor checked out successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to log checkout", "error");
    }
  };

  const isLoading = activeTab === "active" ? activeLoading : historyLoading;
  const logs: Visitor[] = activeTab === "active" ? (activeLogs as Visitor[]) : (historyLogs as Visitor[]);

  const activeTabColor = colorScheme === "dark" ? "#f97316" : "#b45309";
  const inactiveTabColor = colorScheme === "dark" ? "#a8a29e" : "#78716c";

  return (
    <ScreenContainer scrollable={false}>
      {/* Tab Switcher */}
      <View className="flex-row mx-4 mt-4 mb-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-1 gap-1">
        {(["active", "history"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: activeTab === tab ? activeTabColor : "transparent",
            }}
          >
            <Ionicons
              name={tab === "active" ? "people-outline" : "journal-outline"}
              size={14}
              color={activeTab === tab ? "#ffffff" : inactiveTabColor}
            />
            <Text
              className="text-xs font-semibold capitalize"
              style={{ color: activeTab === tab ? "#ffffff" : inactiveTabColor }}
            >
              {tab === "active" ? "Active" : "History"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <Loader fullscreen={false} />
      ) : (
        <ScrollView className="flex-grow px-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-3">
            {activeTab === "active" ? `${logs.length} inside / pending` : `${logs.length} historical records`}
          </Text>

          {logs.length === 0 ? (
            <Card className="p-10 items-center">
              <Ionicons
                name={activeTab === "active" ? "people-outline" : "journal-outline"}
                size={36}
                color="#78716c"
              />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 text-center">
                {activeTab === "active" ? "No visitors currently inside" : "No visitor history yet"}
              </Text>
            </Card>
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
    </ScreenContainer>
  );
}
export default VisitorLogsView;

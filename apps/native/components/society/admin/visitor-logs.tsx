import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useActiveVisitorsQuery, useVisitorHistoryQuery } from "../../../queries/society";
import { Card } from "../../ui/card";
import { Loader } from "../../ui/loader";
import { SearchInput } from "../../ui/search-input";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.2)" },
  PENDING:  { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  EXITED:   { bg: "rgba(120,113,108,0.1)", text: "#78716c", border: "rgba(120,113,108,0.2)" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",  text: "#ef4444", border: "rgba(239,68,68,0.2)" },
};

export function VisitorLogs() {
  const { data: activeVisitors = [], isLoading: activeLoading } = useActiveVisitorsQuery();
  const { data: historyVisitorsData, isLoading: historyLoading } = useVisitorHistoryQuery();
  const historyVisitors = historyVisitorsData?.data ?? [];

  const [visitorTab, setVisitorTab] = useState<"active" | "history">("active");
  const [visitorSearch, setVisitorSearch] = useState("");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentVisitors = visitorTab === "active" ? activeVisitors : historyVisitors;
  const visitorsLoading = visitorTab === "active" ? activeLoading : historyLoading;

  const activeTabColor = isDark ? "#f97316" : "#b45309";
  const inactiveTabColor = isDark ? "#a8a29e" : "#78716c";

  // Filter visitors logs based on query input
  const filteredVisitors = currentVisitors.filter((v: any) =>
    v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
    v.phone.includes(visitorSearch) ||
    `${v.flat?.tower?.name}-${v.flat?.number}`.toLowerCase().includes(visitorSearch.toLowerCase())
  );

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3.5 mt-2">
        <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold uppercase tracking-wider">
          Gate Visitors Monitor Logs
        </Text>
        
        {/* Toggle Switcher */}
        <View className="flex-row bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark p-0.5 rounded-lg gap-0.5">
          <Pressable
            onPress={() => setVisitorTab("active")}
            className="px-2.5 py-1.5 rounded-md"
            style={{
              backgroundColor: visitorTab === "active" ? activeTabColor : "transparent",
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: visitorTab === "active" }}
            accessibilityLabel="Active visitors tab"
          >
            <Text
              className="text-xxs font-bold uppercase tracking-wider"
              style={{ color: visitorTab === "active" ? "#ffffff" : inactiveTabColor }}
            >
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVisitorTab("history")}
            className="px-2.5 py-1.5 rounded-md"
            style={{
              backgroundColor: visitorTab === "history" ? activeTabColor : "transparent",
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: visitorTab === "history" }}
            accessibilityLabel="Visitor logs history tab"
          >
            <Text
              className="text-xxs font-bold uppercase tracking-wider"
              style={{ color: visitorTab === "history" ? "#ffffff" : inactiveTabColor }}
            >
              History
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Real-time visitor search bar using SearchInput */}
      <SearchInput
        value={visitorSearch}
        onChangeText={setVisitorSearch}
        placeholder="Search logs by visitor, flat, or phone..."
        className="mb-4"
      />

      {visitorsLoading ? (
        <Loader fullscreen={false} />
      ) : filteredVisitors.length === 0 ? (
        <Card className="py-12 items-center border border-border-light dark:border-border-dark">
          <Ionicons name="journal-outline" size={32} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2.5 italic text-center font-medium">
            {visitorSearch ? "No matching visitor logs found" : visitorTab === "active" ? "No active guests currently inside" : "No guest log history yet"}
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {filteredVisitors.map((visitor: any) => {
            const statusStyle = STATUS_COLORS[visitor.status] ?? STATUS_COLORS.PENDING;
            return (
              <Card key={visitor.id} className="border border-border-light dark:border-border-dark p-4 bg-muted-light/5 dark:bg-muted-dark/5">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="text-foreground-light dark:text-foreground-dark text-sm font-bold">
                      {visitor.name}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                      Phone: {visitor.phone}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                      Target flat: {visitor.flat?.tower?.name} - {visitor.flat?.number}
                    </Text>
                    <View className="self-start mt-2 px-2 py-0.5 rounded bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark">
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs uppercase font-mono font-bold">
                        {visitor.type}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end gap-1">
                    <View
                      className="px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      }}
                      accessibilityLabel={`Visitor status: ${visitor.status}`}
                    >
                      <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: statusStyle.text }}>
                        {visitor.status}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold mt-1">
                      In: {new Date(visitor.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    {visitor.exitedAt && (
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold">
                        Out: {new Date(visitor.exitedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
}

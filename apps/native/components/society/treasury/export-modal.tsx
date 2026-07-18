import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormModal } from "../../ui/form-modal";

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (config: {
    format: "pdf" | "csv";
    scope: "all" | "expenses" | "budgets";
    dateRange: "all" | "month" | "year" | "custom";
    startDate: string;
    endDate: string;
    category: string;
  }) => Promise<void>;
  isExporting: boolean;
}

export function ExportModal({
  visible,
  onClose,
  onExport,
  isExporting,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [exportScope, setExportScope] = useState<"all" | "expenses" | "budgets">("all");
  const [exportDateRange, setExportDateRange] = useState<"all" | "month" | "year" | "custom">("all");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportCategory, setExportCategory] = useState("ALL");

  const handleTriggerExport = () => {
    onExport({
      format: exportFormat,
      scope: exportScope,
      dateRange: exportDateRange,
      startDate: exportStartDate,
      endDate: exportEndDate,
      category: exportCategory,
    });
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Export Report"
      onSubmit={handleTriggerExport}
      isSubmitting={isExporting}
      submitLabel="Export Report"
      maxHeight={360}
    >
      {/* Format selection */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Format</Text>
        <View className="flex-row gap-2">
          {(["pdf", "csv"] as const).map((fmt) => (
            <Pressable
              key={fmt}
              onPress={() => setExportFormat(fmt)}
              className={`flex-1 py-2 rounded-xl border items-center ${
                exportFormat === fmt
                  ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                  : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: exportFormat === fmt }}
            >
              <Text className={`text-xs font-bold uppercase ${exportFormat === fmt ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                {fmt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Scope selection */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Scope</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {[
            { key: "all", label: "Full Statement" },
            { key: "expenses", label: "Expenses Log" },
            { key: "budgets", label: "Budgets List" },
          ].map((sc) => (
            <Pressable
              key={sc.key}
              onPress={() => setExportScope(sc.key as any)}
              className={`px-3 py-2 rounded-xl border items-center ${
                exportScope === sc.key
                  ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                  : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: exportScope === sc.key }}
            >
              <Text className={`text-xxs font-bold ${exportScope === sc.key ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                {sc.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Date Filter selection */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Date Period</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {[
            { key: "all", label: "All Time" },
            { key: "month", label: "This Month" },
            { key: "year", label: "This Year" },
            { key: "custom", label: "Custom" },
          ].map((dt) => (
            <Pressable
              key={dt.key}
              onPress={() => setExportDateRange(dt.key as any)}
              className={`px-3 py-2 rounded-xl border items-center ${
                exportDateRange === dt.key
                  ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                  : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: exportDateRange === dt.key }}
            >
              <Text className={`text-xxs font-bold ${exportDateRange === dt.key ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                {dt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Custom Date Ranges */}
      {exportDateRange === "custom" && (
        <View className="flex-row gap-2">
          <View className="flex-1 gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-semibold uppercase tracking-wider">Start Date</Text>
            <TextInput
              value={exportStartDate}
              onChangeText={setExportStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#78716c"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xxs font-mono"
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-semibold uppercase tracking-wider">End Date</Text>
            <TextInput
              value={exportEndDate}
              onChangeText={setExportEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#78716c"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xxs font-mono"
            />
          </View>
        </View>
      )}

      {/* Category Filter (Expenses specific) */}
      {(exportScope === "all" || exportScope === "expenses") && (
        <View className="gap-1.5 mb-2">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">Expense Category</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {["ALL", "MAINTENANCE", "UTILITIES", "SALARIES", "FESTIVAL", "REPAIRS", "OTHERS"].map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setExportCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg border ${
                  exportCategory === cat
                    ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                    : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: exportCategory === cat }}
              >
                <Text className={`text-[10px] font-bold ${exportCategory === cat ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </FormModal>
  );
}
export default ExportModal;

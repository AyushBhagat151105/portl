import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormModal } from "../../ui/form-modal";

interface ExportDuesModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (config: {
    format: "pdf" | "csv";
    month: string | null;
  }) => Promise<void>;
  isExporting: boolean;
  dues: any[];
}

export function ExportDuesModal({
  visible,
  onClose,
  onExport,
  isExporting,
  dues,
}: ExportDuesModalProps) {
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Extract unique months from dues history
  const uniqueMonths = Array.from(new Set(dues.map((d: any) => d.month)));

  useEffect(() => {
    if (visible) {
      setFormat("pdf");
      setSelectedMonth(null);
    }
  }, [visible]);

  const handleExport = () => {
    onExport({
      format,
      month: selectedMonth,
    });
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Export Billing Report"
      onSubmit={handleExport}
      isSubmitting={isExporting}
      submitLabel="Export Data"
      maxHeight={360}
    >
      {/* Format Picker */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Export Format
        </Text>
        <View className="flex-row gap-2">
          {(["pdf", "csv"] as const).map((fmt) => (
            <Pressable
              key={fmt}
              onPress={() => setFormat(fmt)}
              className={`flex-1 py-2 rounded-xl border items-center ${
                format === fmt
                  ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                  : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: format === fmt }}
            >
              <Text className={`text-xs font-bold uppercase ${format === fmt ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                {fmt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Month Filter */}
      <View className="gap-1.5 mt-2">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Filter by Billing Month (Optional)
        </Text>
        <Pressable
          onPress={() => setShowMonthPicker(true)}
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 flex-row justify-between items-center"
        >
          <Text className={selectedMonth ? "text-foreground-light dark:text-foreground-dark text-sm" : "text-zinc-500 text-sm"}>
            {selectedMonth || "All Months"}
          </Text>
          <Ionicons name="funnel-outline" size={14} color="#78716c" />
        </Pressable>
      </View>

      {/* Internal Month Picker Sheet */}
      <Modal visible={showMonthPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-card-light dark:bg-card-dark rounded-t-3xl p-5 max-h-[300px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Select Filter Month</Text>
              <Pressable onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-2 pb-6">
                <Pressable
                  onPress={() => {
                    setSelectedMonth(null);
                    setShowMonthPicker(false);
                  }}
                  className="p-3 bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark"
                >
                  <Text className="text-foreground-light dark:text-foreground-dark text-sm text-center font-bold">All Months</Text>
                </Pressable>
                {uniqueMonths.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setSelectedMonth(m);
                      setShowMonthPicker(false);
                    }}
                    className="p-3 bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark"
                  >
                    <Text className="text-foreground-light dark:text-foreground-dark text-sm text-center">{m}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </FormModal>
  );
}
export default ExportDuesModal;

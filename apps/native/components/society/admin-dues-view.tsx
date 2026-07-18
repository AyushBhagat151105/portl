import React, { useState, useCallback } from "react";
import { ScrollView, Text, View, Pressable, Alert, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "heroui-native";
import {
  useAdminDuesQuery,
  useGenerateDuesMutation,
  useMarkDuePaidMutation,
  usePaymentConfigQuery,
  useUpdatePaymentConfigMutation,
} from "../../queries/admin";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { SectionHeader } from "../ui/section-header";
import { exportDuesAsCSV, exportDuesAsPDF, type DueRecord } from "@/lib/dues-export";
import { GenerateDuesModal } from "./dues/generate-dues-modal";
import { PaymentConfigModal } from "./dues/payment-config-modal";
import { ExportDuesModal } from "./dues/export-dues-modal";
import { type GenerateDuesFormData } from "@/lib/form-schemas";

export function AdminDuesView() {
  const { data: duesData, isLoading, refetch: refetchDues } = useAdminDuesQuery();
  const dues = duesData?.data ?? [];
  const generateMutation = useGenerateDuesMutation();
  const markPaidMutation = useMarkDuePaidMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const { data: paymentConfig, refetch: refetchPaymentConfig } = usePaymentConfigQuery();
  const updatePaymentConfig = useUpdatePaymentConfigMutation();

  // Modals Visibility
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchDues(), refetchPaymentConfig()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchDues, refetchPaymentConfig]);

  const handleGenerateDuesSubmit = async (data: GenerateDuesFormData) => {
    try {
      const res = await generateMutation.mutateAsync({
        amount: Number(data.amount),
        month: data.month,
        dueDate: data.dueDate,
      });
      showToast(`Billing generated successfully for ${res.generatedCount} flats! 💳`, "success");
      setShowGenerateModal(false);
      refetchDues();
    } catch (err: any) {
      showToast(err.message || "Failed to generate billing dues", "error");
    }
  };

  const handleSavePaymentConfig = async (config: { keyId: string; keySecret: string }) => {
    if (!config.keyId.trim() || !config.keySecret.trim()) {
      showToast("Please fill in both key ID and secret key", "error");
      return;
    }
    try {
      await updatePaymentConfig.mutateAsync({
        razorpayKeyId: config.keyId.trim(),
        razorpayKeySecret: config.keySecret.trim(),
      });
      showToast("Razorpay credentials saved successfully!", "success");
      refetchPaymentConfig();
      setShowPaymentConfig(false);
    } catch (err: any) {
      showToast(err.message || "Failed to update payment keys", "error");
    }
  };

  const handleMarkPaid = (dueId: string, residentName: string, flatNumber: string) => {
    Alert.alert(
      "Reconcile Bill",
      `Mark maintenance bill for ${residentName} (Flat ${flatNumber}) as Paid? This will record manual collection status in registry.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Paid",
          style: "default",
          onPress: async () => {
            try {
              await markPaidMutation.mutateAsync(dueId);
              showToast("Payment status reconciled successfully!", "success");
              refetchDues();
            } catch (err: any) {
              showToast(err.message || "Failed to reconcile status", "error");
            }
          },
        },
      ]
    );
  };

  const handleExportSubmit = async (config: {
    format: "pdf" | "csv";
    month: string | null;
  }) => {
    if (!dues || dues.length === 0) {
      showToast("No dues data to export.", "info");
      return;
    }
    const filtered: DueRecord[] = config.month
      ? dues.filter((d: any) => d.month === config.month)
      : dues;

    if (filtered.length === 0) {
      showToast(`No dues found for ${config.month}.`, "info");
      return;
    }

    setIsExporting(true);
    try {
      if (config.format === "csv") {
        await exportDuesAsCSV(filtered);
      } else {
        await exportDuesAsPDF(filtered);
      }
      showToast("Data exported successfully! 📄", "success");
      setShowExportModal(false);
    } catch (err: any) {
      showToast(err.message || "Export failed", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <ScreenContainer
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Dues & Billings</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Generate monthly bills, setup payment gateways, and reconcile statuses
          </Text>
        </View>
        <Ionicons name="card-outline" size={24} color={primaryColor} />
      </View>

      {/* Overview Cards (Actions block) */}
      <View className="flex-row gap-3 mb-6">
        <Pressable
          onPress={() => setShowGenerateModal(true)}
          className="flex-1 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Generate new billing dues"
        >
          <Card className="items-center py-4 bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light/20">
            <Ionicons name="add-circle-outline" size={22} color={primaryColor} />
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs mt-1 text-center">
              Generate Dues
            </Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => setShowPaymentConfig(true)}
          className="flex-1 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Configure payment gateway keys"
        >
          <Card className="items-center py-4 bg-muted-light/10 dark:bg-muted-dark/10 border-border-light dark:border-border-dark">
            <Ionicons name="settings-outline" size={22} color="#78716c" />
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs mt-1 text-center">
              Payment Gateway
            </Text>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => setShowExportModal(true)}
          className="flex-1 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Export dues invoices report"
        >
          <Card className="items-center py-4 bg-muted-light/10 dark:bg-muted-dark/10 border-border-light dark:border-border-dark">
            <Ionicons name="download-outline" size={22} color="#78716c" />
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs mt-1 text-center">
              Export Registry
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Dues History list */}
      <View className="gap-4">
        <SectionHeader title="Dues History Registry Log" />
        
        {dues.length === 0 ? (
          <Card className="items-center py-10">
            <Ionicons name="receipt-outline" size={36} color="#78716c" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-3">
              No bills generated yet
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 text-center">
              Tap "Generate Dues" at the top to roll out bills to flats
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {dues.map((due: any) => {
              const statusColor = due.status === "PAID" ? "success" : "warning";
              const isPaid = due.status === "PAID";
              return (
                <Card
                  key={due.id}
                  className="border border-border-light dark:border-border-dark p-4 bg-muted-light/5 dark:bg-muted-dark/5"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-2">
                      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                        {due.user?.name || "Unassigned Resident"}
                      </Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                        Tower {due.flat?.tower?.name} — Flat {due.flat?.number}
                      </Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold mt-1">
                        Billing Month: {due.month}
                      </Text>
                      {due.dueDate && (
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                          Due Date: {new Date(due.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    <View className="items-end gap-1.5">
                      <Chip
                        color={statusColor}
                        size="sm"
                        accessibilityLabel={`Status: ${due.status}`}
                      >
                        {due.status}
                      </Chip>
                      <Text className="text-foreground-light dark:text-foreground-dark font-black text-sm font-mono mt-1">
                        ₹{due.amount.toLocaleString()}
                      </Text>
                      
                      {!isPaid && (
                        <Pressable
                          onPress={() => handleMarkPaid(due.id, due.user?.name || "Unassigned Resident", due.flat?.number)}
                          className="bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg mt-1 active:opacity-75"
                          accessibilityRole="button"
                          accessibilityLabel={`Mark bill for Flat ${due.flat?.number} as Paid`}
                        >
                          <Text className="text-emerald-500 text-[10px] font-bold">Mark Paid</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Generate Dues Form Modal */}
      <GenerateDuesModal
        visible={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSubmit={handleGenerateDuesSubmit}
        isSubmitting={generateMutation.isPending}
      />

      {/* Razorpay Configurations Modal */}
      <PaymentConfigModal
        visible={showPaymentConfig}
        onClose={() => setShowPaymentConfig(false)}
        onSave={handleSavePaymentConfig}
        isSaving={updatePaymentConfig.isPending}
        currentConfig={paymentConfig}
      />

      {/* PDF/CSV Exporter Modal */}
      <ExportDuesModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportSubmit}
        isExporting={isExporting}
        dues={dues}
      />
    </ScreenContainer>
  );
}

export default AdminDuesView;

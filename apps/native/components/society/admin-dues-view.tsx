import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Modal, Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAdminDuesQuery,
  useGenerateDuesMutation,
  useMarkDuePaidMutation,
} from "../../queries/admin";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { generateDuesSchema, type GenerateDuesFormData } from "@/lib/form-schemas";
import { exportDuesAsCSV, exportDuesAsPDF, type DueRecord } from "@/lib/dues-export";

export function AdminDuesView() {
  const { data: duesData, isLoading } = useAdminDuesQuery();
  const dues = duesData?.data ?? [];
  const generateMutation = useGenerateDuesMutation();
  const markPaidMutation = useMarkDuePaidMutation();
  const { showToast } = useToastStore();

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showExportFilterModal, setShowExportFilterModal] = useState(false);
  const [selectedExportMonth, setSelectedExportMonth] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GenerateDuesFormData>({
    resolver: zodResolver(generateDuesSchema),
    mode: "onTouched",
  });

  const selectedMonth = watch("month");

  const getUpcomingMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const mStr = date.toLocaleString("en-US", { month: "long", year: "numeric" });
      months.push(mStr);
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  const getDaysInMonth = (monthStr: string) => {
    let year = new Date().getFullYear();
    let monthIndex = new Date().getMonth();
    
    if (monthStr) {
      const parts = monthStr.split(" ");
      if (parts.length === 2) {
        const m = parts[0];
        const y = parseInt(parts[1], 10);
        if (!isNaN(y)) year = y;
        
        const monthsList = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const idx = monthsList.indexOf(m);
        if (idx !== -1) monthIndex = idx;
      }
    }

    const numDays = new Date(year, monthIndex + 1, 0).getDate();
    return {
      year,
      monthIndex,
      days: Array.from({ length: numDays }, (_, i) => i + 1),
    };
  };

  const onSubmit = async (data: GenerateDuesFormData) => {
    try {
      const res = await generateMutation.mutateAsync({
        amount: Number(data.amount),
        month: data.month,
        dueDate: data.dueDate,
      });
      showToast(`Billing generated successfully for ${res.generatedCount} flats! 💳`, "success");
      reset();
    } catch (err: any) {
      showToast(err.message || "Failed to generate billing dues", "error");
    }
  };

  const handleMarkPaid = async (dueId: string) => {
    try {
      await markPaidMutation.mutateAsync(dueId);
      showToast("Payment status reconciled successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reconcile status", "error");
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (!dues || dues.length === 0) {
      showToast("No dues data to export.", "info");
      return;
    }
    const filtered: DueRecord[] = selectedExportMonth
      ? dues.filter((d: any) => d.month === selectedExportMonth)
      : dues;

    if (filtered.length === 0) {
      showToast(`No dues found for ${selectedExportMonth}.`, "info");
      return;
    }

    setIsExporting(true);
    try {
      if (format === "csv") await exportDuesAsCSV(filtered, selectedExportMonth ?? undefined);
      else await exportDuesAsPDF(filtered, selectedExportMonth ?? undefined);
      showToast(`Exported ${filtered.length} records as ${format.toUpperCase()}! 📄`, "success");
    } catch (err: any) {
      showToast(err.message || "Export failed", "error");
    } finally {
      setIsExporting(false);
      setShowExportFilterModal(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const outstandingCount = dues?.filter((d: any) => d.status === "PENDING").length ?? 0;
  const collectedCount = dues?.filter((d: any) => d.status === "PAID").length ?? 0;

  return (
    <>
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      {/* 1. Header Dues Stats Panel */}
      <View className="flex-row gap-4 mb-6">
        <Card className="flex-1 p-4 border border-amber-500/20 bg-amber-500/5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold uppercase tracking-wider">
            Pending Bills
          </Text>
          <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black mt-1">
            {outstandingCount}
          </Text>
        </Card>
        <Card className="flex-1 p-4 border border-emerald-500/20 bg-emerald-500/5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold uppercase tracking-wider">
            Reconciled Dues
          </Text>
          <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black mt-1">
            {collectedCount}
          </Text>
        </Card>
      </View>

      {/* 2. Billing Generator Section */}
      <Card className="mb-6">
        <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold mb-4">
          Generate Flat Maintenance Bills
        </Text>

        <View className="gap-4">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-semibold">
                Amount (INR) *
              </Text>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. 2500"
                    placeholderTextColor="#78716c"
                    keyboardType="numeric"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors.amount && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.amount.message}
                </FieldError>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-semibold">
                Billing Month *
              </Text>
              <Controller
                control={control}
                name="month"
                render={({ field }) => (
                  <Pressable
                    onPress={() => setShowMonthModal(true)}
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3.5 px-4 flex-row justify-between items-center active:opacity-90"
                  >
                    <Text className={field.value ? "text-foreground-light dark:text-foreground-dark font-medium" : "text-stone-500"}>
                      {field.value || "Select Month"}
                    </Text>
                    <Ionicons name="calendar-outline" size={16} color="#78716c" />
                  </Pressable>
                )}
              />
              {errors.month && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.month.message}
                </FieldError>
              )}
            </View>
          </View>

          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-semibold">
              Due Date *
            </Text>
            <Controller
              control={control}
              name="dueDate"
              render={({ field }) => (
                <Pressable
                  onPress={() => {
                    if (!selectedMonth) {
                      showToast("Please select Billing Month first", "info");
                      return;
                    }
                    setShowDateModal(true);
                  }}
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3.5 px-4 flex-row justify-between items-center active:opacity-90"
                >
                  <Text className={field.value ? "text-foreground-light dark:text-foreground-dark font-medium" : "text-stone-500"}>
                    {field.value || "Select Due Date"}
                  </Text>
                  <Ionicons name="today-outline" size={16} color="#78716c" />
                </Pressable>
              )}
            />
            {errors.dueDate && (
              <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                {errors.dueDate.message}
              </FieldError>
            )}
          </View>

          <Pressable
            disabled={generateMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="bg-amber-700 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90 border border-amber-800"
          >
            {generateMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-sm">Generate & Send Bills</Text>
            )}
          </Pressable>
        </View>
      </Card>

      {/* 3. Dues logs section */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
          Bills & Dues Audit Logs
        </Text>
        <Pressable
          onPress={() => setShowExportFilterModal(true)}
          className="flex-row items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 py-2 px-3 rounded-xl active:opacity-70"
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#f59e0b" />
          ) : (
            <Ionicons name="download-outline" size={14} color="#f59e0b" />
          )}
          <Text className="text-amber-600 dark:text-amber-500 text-xs font-bold">Export</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {!dues || dues.length === 0 ? (
          <Card className="p-8 items-center border border-dashed">
            <Ionicons name="receipt-outline" size={32} color="#71717a" style={{ marginBottom: 12 }} />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center">
              No bills generated. Use the panel above to dispatch society maintenance charges.
            </Text>
          </Card>
        ) : (
          dues.map((due: any) => (
            <Card key={due.id} className="mb-3.5 p-4.5">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                    {due.month} Bill
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold mt-1">
                    Flat {due.flat.tower.name} - {due.flat.number}
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                    Resident: {due.flat.residents.map((r: any) => r.name).join(", ") || "No active resident"}
                  </Text>
                  {due.status === "PENDING" ? (
                    <Text className="text-amber-600 dark:text-amber-500 text-xxs font-semibold mt-0.5">
                      Due by: {new Date(due.dueDate).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text className="text-emerald-600 dark:text-emerald-500 text-xxs font-semibold mt-0.5">
                      Paid: {new Date(due.paidAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-foreground-light dark:text-foreground-dark font-black text-base">
                    ₹{due.amount.toLocaleString()}
                  </Text>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={due.status === "PENDING" ? "warning" : "success"}
                    className="mt-2"
                  >
                    <Chip.Label>{due.status}</Chip.Label>
                  </Chip>
                </View>
              </View>

              {due.status === "PENDING" && (
                <Pressable
                  disabled={markPaidMutation.isPending}
                  onPress={() => handleMarkPaid(due.id)}
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark py-2.5 rounded-xl mt-3.5 items-center justify-center active:opacity-80"
                >
                  {markPaidMutation.isPending ? (
                    <ActivityIndicator size="small" color="#b45309" />
                  ) : (
                    <Text className="text-amber-700 dark:text-amber-500 font-bold text-xs">
                      Reconcile Paid Offline
                    </Text>
                  )}
                </Pressable>
              )}

              {due.status === "PAID" && (
                <View className="bg-zinc-100 dark:bg-zinc-800/40 p-2.5 rounded-lg mt-3 border border-zinc-200/50 dark:border-zinc-800/50 flex-row justify-between items-center">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                    Reference ID: {due.razorpayPaymentId || "OFFLINE"}
                  </Text>
                  <Ionicons name="checkmark-circle-outline" size={12} color="#10b981" />
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      {/* 4. Billing Month Picker Modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <Pressable className="flex-1 bg-black/60 justify-center items-center p-6" onPress={() => setShowMonthModal(false)}>
          <Pressable className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm" onPress={(e) => e.stopPropagation()}>
            <Text className="text-white text-lg font-bold mb-4">Select Billing Month</Text>
            <ScrollView className="max-h-80">
              <View className="gap-2">
                {getUpcomingMonths().map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setValue("month", m, { shouldValidate: true });
                      setValue("dueDate", ""); // Clear dueDate since month changed!
                      setShowMonthModal(false);
                    }}
                    className="bg-zinc-800/40 border border-zinc-800/60 p-3.5 rounded-xl flex-row justify-between items-center active:bg-zinc-800"
                  >
                    <Text className="text-zinc-200 font-semibold">{m}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#71717a" />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 5. Due Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <Pressable className="flex-1 bg-black/60 justify-center items-center p-6" onPress={() => setShowDateModal(false)}>
          <Pressable className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm" onPress={(e) => e.stopPropagation()}>
            <Text className="text-white text-lg font-bold mb-1">Select Due Date</Text>
            <Text className="text-zinc-500 text-xs mb-4">For billing period {selectedMonth}</Text>
            
            <ScrollView className="max-h-80">
              <View className="flex-row flex-wrap gap-2.5 justify-center py-2">
                {getDaysInMonth(selectedMonth).days.map((day) => {
                  const { year, monthIndex } = getDaysInMonth(selectedMonth);
                  const yyyy = year;
                  const mm = String(monthIndex + 1).padStart(2, "0");
                  const dd = String(day).padStart(2, "0");
                  const dateStr = `${yyyy}-${mm}-${dd}`;
                  
                  return (
                    <Pressable
                      key={day}
                      onPress={() => {
                        setValue("dueDate", dateStr, { shouldValidate: true });
                        setShowDateModal(false);
                      }}
                      className="w-10 h-10 bg-zinc-800/40 border border-zinc-800/80 rounded-lg items-center justify-center active:bg-amber-600 active:border-amber-700"
                    >
                      <Text className="text-zinc-200 font-bold text-xs">{day}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Pressable 
              onPress={() => setShowDateModal(false)}
              className="mt-6 border border-zinc-800 py-3 rounded-xl items-center active:bg-zinc-800"
            >
              <Text className="text-zinc-400 font-bold text-xs">Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>

      {/* 6. Export Modal */}
      <Modal
        visible={showExportFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportFilterModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setShowExportFilterModal(false)}
        >
          <Pressable
            className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-white text-lg font-bold">Export Dues Report</Text>
              <Pressable onPress={() => setShowExportFilterModal(false)} className="p-1">
                <Ionicons name="close" size={20} color="#71717a" />
              </Pressable>
            </View>

            {/* Month filter */}
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Filter by Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2 pb-1">
                <Pressable
                  onPress={() => setSelectedExportMonth(null)}
                  className={`px-4 py-2 rounded-xl border ${!selectedExportMonth ? "bg-amber-600 border-amber-700" : "bg-zinc-800/40 border-zinc-800"}`}
                >
                  <Text className={`text-xs font-bold ${!selectedExportMonth ? "text-white" : "text-zinc-400"}`}>All Months</Text>
                </Pressable>
                {Array.from(new Set((dues ?? []).map((d: any) => d.month))).map((m: any) => (
                  <Pressable
                    key={m}
                    onPress={() => setSelectedExportMonth(m)}
                    className={`px-4 py-2 rounded-xl border ${selectedExportMonth === m ? "bg-amber-600 border-amber-700" : "bg-zinc-800/40 border-zinc-800"}`}
                  >
                    <Text className={`text-xs font-bold ${selectedExportMonth === m ? "text-white" : "text-zinc-400"}`}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Format buttons */}
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Choose Format</Text>
            <View className="gap-3">
              <Pressable
                onPress={() => handleExport("pdf")}
                disabled={isExporting}
                className="flex-row items-center gap-3 bg-rose-600/10 border border-rose-600/30 p-4 rounded-2xl active:opacity-70"
              >
                <View className="w-9 h-9 bg-rose-600/20 rounded-xl items-center justify-center">
                  <Ionicons name="document-text-outline" size={18} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">PDF Report</Text>
                  <Text className="text-zinc-500 text-xs">Print-ready with summary table</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#71717a" />
              </Pressable>

              <Pressable
                onPress={() => handleExport("csv")}
                disabled={isExporting}
                className="flex-row items-center gap-3 bg-sky-600/10 border border-sky-600/30 p-4 rounded-2xl active:opacity-70"
              >
                <View className="w-9 h-9 bg-sky-600/20 rounded-xl items-center justify-center">
                  <Ionicons name="code-slash-outline" size={18} color="#38bdf8" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">CSV File</Text>
                  <Text className="text-zinc-500 text-xs">Raw data, universally compatible</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#71717a" />
              </Pressable>
            </View>

            <View className="h-6" />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
export default AdminDuesView;

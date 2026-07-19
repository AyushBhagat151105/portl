import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import * as Haptics from "expo-haptics";
import {
  useBudgetsQuery,
  useCreateBudgetMutation,
  useExpensesQuery,
  useCreateExpenseMutation,
  useFestivalsQuery,
  useCreateFestivalMutation,
  useAdminDuesQuery,
  useFixedDepositsQuery,
  useCreateFixedDepositMutation,
  useDeleteFixedDepositMutation,
  useBlockSummariesQuery,
} from "@/queries/admin";
import { useToastStore } from "@/store/useToastStore";
import { useTreasuryStore } from "@/store/useTreasuryStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { SectionHeader } from "../ui/section-header";
import { TreasuryCharts } from "./treasury-chart";
import { exportTreasuryReport } from "../../lib/treasury-export";
import { BudgetFormModal } from "./treasury/budget-form-modal";
import { ExpenseFormModal } from "./treasury/expense-form-modal";
import { FestivalFormModal } from "./treasury/festival-form-modal";
import { ExportModal } from "./treasury/export-modal";
import { FdFormModal } from "./treasury/fd-form-modal";
import { type CreateBudgetFormData, type CreateExpenseFormData, type CreateFestivalFormData } from "@/lib/form-schemas";

export function TreasuryView() {
  const { data: budgets = [], isLoading: budgetsLoading, refetch: refetchBudgets } = useBudgetsQuery();
  const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = useExpensesQuery();
  const { data: festivals = [], isLoading: festivalsLoading, refetch: refetchFestivals } = useFestivalsQuery();
  const { data: duesData, isLoading: duesLoading, refetch: refetchDues } = useAdminDuesQuery();
  const { data: fds = [], isLoading: fdsLoading, refetch: refetchFds } = useFixedDepositsQuery();
  const { data: blockSummaries = [], isLoading: blocksLoading, refetch: refetchBlocks } = useBlockSummariesQuery();

  const dues = duesData?.data || [];

  const createBudgetMutation = useCreateBudgetMutation();
  const createExpenseMutation = useCreateExpenseMutation();
  const createFestivalMutation = useCreateFestivalMutation();
  const createFdMutation = useCreateFixedDepositMutation();
  const deleteFdMutation = useDeleteFixedDepositMutation();

  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { activeTab, setActiveTab, ledgerFilter, setLedgerFilter } = useTreasuryStore();

  const triggerLightHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Modal States
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [festivalModalVisible, setFestivalModalVisible] = useState(false);
  const [fdModalVisible, setFdModalVisible] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBudgets(),
        refetchExpenses(),
        refetchFestivals(),
        refetchDues(),
        refetchFds(),
        refetchBlocks(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBudgets, refetchExpenses, refetchFestivals, refetchDues, refetchFds, refetchBlocks]);

  const handleCreateBudget = async (data: CreateBudgetFormData) => {
    try {
      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      await createBudgetMutation.mutateAsync({
        title: data.title.trim(),
        allocatedAmount: parseFloat(data.allocatedAmount),
        startDate: now.toISOString(),
        endDate: endOfYear.toISOString(),
      });
      showToast("Budget allocated successfully", "success");
      setBudgetModalVisible(false);
      refetchBudgets();
    } catch (err: any) {
      showToast(err.message || "Failed to create budget", "error");
    }
  };

  const handleCreateExpense = async (data: CreateExpenseFormData) => {
    try {
      await createExpenseMutation.mutateAsync({
        title: data.title.trim(),
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description?.trim() || undefined,
        date: new Date().toISOString(),
        budgetId: data.budgetId || undefined,
      });
      showToast("Expense logged successfully", "success");
      setExpenseModalVisible(false);
      refetchExpenses();
      refetchBudgets();
    } catch (err: any) {
      showToast(err.message || "Failed to log expense", "error");
    }
  };

  const handleCreateFestival = async (data: CreateFestivalFormData) => {
    try {
      await createFestivalMutation.mutateAsync({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        date: new Date().toISOString(),
        allocatedBudget: data.budget ? parseFloat(data.budget) : undefined,
      });
      showToast("Festival planned successfully", "success");
      setFestivalModalVisible(false);
      refetchFestivals();
      refetchBudgets();
    } catch (err: any) {
      showToast(err.message || "Failed to schedule festival", "error");
    }
  };

  const handleCreateFd = async (data: {
    bankName: string;
    amount: string;
    interestRate?: string;
    startDate: string;
    maturityDate?: string;
  }) => {
    try {
      await createFdMutation.mutateAsync({
        bankName: data.bankName,
        amount: parseFloat(data.amount),
        interestRate: data.interestRate ? parseFloat(data.interestRate) : undefined,
        startDate: data.startDate,
        maturityDate: data.maturityDate,
      });
      showToast("Fixed Deposit registered successfully", "success");
      setFdModalVisible(false);
      refetchFds();
    } catch (err: any) {
      showToast(err.message || "Failed to create Fixed Deposit", "error");
    }
  };

  const handleDeleteFd = async (id: string) => {
    try {
      await deleteFdMutation.mutateAsync(id);
      showToast("Fixed Deposit liquidated successfully", "success");
      refetchFds();
    } catch (err: any) {
      showToast(err.message || "Failed to liquidate Fixed Deposit", "error");
    }
  };

  const handleTriggerExport = async (config: {
    format: "pdf" | "csv";
    scope: "all" | "expenses" | "budgets";
    dateRange: "all" | "month" | "year" | "custom";
    startDate: string;
    endDate: string;
    category: string;
  }) => {
    if (config.dateRange === "custom" && (!config.startDate || !config.endDate)) {
      showToast("Please provide both start and end dates", "error");
      return;
    }
    setIsExporting(true);
    try {
      await exportTreasuryReport(budgets, expenses, festivals, fds, dues, {
        format: config.format,
        scope: config.scope,
        dateRange: config.dateRange,
        startDate: config.startDate || undefined,
        endDate: config.endDate || undefined,
        category: config.category || undefined,
      });
      showToast("Data exported successfully! 📄", "success");
      setShowExportModal(false);
    } catch (err: any) {
      showToast(err.message || "Export failed", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (budgetsLoading || expensesLoading || festivalsLoading || duesLoading || fdsLoading || blocksLoading) {
    return <Loader />;
  }

  // Summary Metrics Calculation
  const totalBudgeted = budgets.reduce((acc: number, b: any) => acc + b.allocatedAmount, 0);
  const totalSpent = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const remainingFunds = totalBudgeted - totalSpent;

  // Real Balance Sheet Metrics
  const openingDue = dues.find((d: any) => d.month && d.month.includes("Opening Balance"));
  const openingBalanceAmount = openingDue ? openingDue.amount : 1045966;

  const normalPaidDues = dues.filter((d: any) => d.status === "PAID" && !(d.month && d.month.includes("Opening Balance")));
  const normalUnpaidDues = dues.filter((d: any) => d.status !== "PAID" && !(d.month && d.month.includes("Opening Balance")));

  const totalDuesCollected = normalPaidDues.reduce((acc: number, d: any) => acc + d.amount, 0);
  const totalDuesReceivable = normalUnpaidDues.reduce((acc: number, d: any) => acc + d.amount, 0);

  const totalFds = fds.reduce((acc: number, f: any) => acc + f.amount, 0);
  const liquidReserves = (openingBalanceAmount + totalDuesCollected) - totalSpent - totalFds;
  const totalReserves = liquidReserves + totalFds;

  // General Ledger: Chronologically merge Paid Dues (inflow) and Logged Expenses (outflow)
  const generalLedger = [
    ...dues.filter((d: any) => d.status === "PAID").map((d: any) => ({
      id: d.id,
      date: d.paidAt || d.updatedAt || d.createdAt,
      title: "Maintenance Collected",
      details: `${d.flat?.tower?.name || "Tower"} - ${d.flat?.number || "Flat"} (${d.month})`,
      type: "INFLOW" as const,
      amount: d.amount,
      category: "MAINTENANCE",
    })),
    ...expenses.map((e: any) => ({
      id: e.id,
      date: e.date,
      title: e.title,
      details: e.description || "Debit from treasury funds",
      type: "OUTFLOW" as const,
      amount: e.amount,
      category: e.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = generalLedger.filter((tx) => {
    if (ledgerFilter === "INFLOW") return tx.type === "INFLOW";
    if (ledgerFilter === "OUTFLOW") return tx.type === "OUTFLOW";
    return true;
  });

  const primaryColor = isDark ? "#f97316" : "#b45309";

  return (
    <ScreenContainer
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Treasury & Budgets</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Society trial balance sheets, cash inflow ledgers, and budgets
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => setShowExportModal(true)}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark px-3 py-1.5 rounded-xl active:opacity-75 flex-row items-center justify-center gap-1.5"
            accessibilityRole="button"
            accessibilityLabel="Export treasury report"
          >
            <Ionicons name="download-outline" size={14} color={primaryColor} />
            <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Export</Text>
          </Pressable>
          <Ionicons name="wallet-outline" size={24} color={primaryColor} />
        </View>
      </View>

      {/* Real ERP Balance Sheet Summary Cards */}
      <View className="flex-row gap-4 mb-6">
        <Card className="flex-1 bg-emerald-500/10 border border-emerald-500/25 p-4 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-bold uppercase tracking-wider">
            Total Income
          </Text>
          <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-1 font-mono">
            ₹{totalDuesCollected.toLocaleString()}
          </Text>
        </Card>
        <Card className="flex-1 bg-rose-500/10 border border-rose-500/25 p-4 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-bold uppercase tracking-wider">
            Total Outflow
          </Text>
          <Text className="text-rose-500 dark:text-rose-400 font-bold text-sm mt-1 font-mono">
            ₹{totalSpent.toLocaleString()}
          </Text>
        </Card>
        <Card className="flex-1 bg-amber-500/10 border border-amber-500/25 p-4 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-bold uppercase tracking-wider">
            Total Reserves
          </Text>
          <Text className={`${totalReserves >= 0 ? "text-amber-600 dark:text-amber-500" : "text-rose-500"} font-bold text-sm mt-1 font-mono`}>
            {totalReserves < 0 ? "-" : ""}₹{Math.abs(totalReserves).toLocaleString()}
          </Text>
        </Card>
      </View>

      {/* Tabs */}
      <View className="mb-6 bg-muted-light dark:bg-muted-dark p-1 rounded-xl">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", gap: 4 }}
        >
          {(["balance-sheet", "blocks", "fds", "overview", "expenses"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const displayNames = {
              "balance-sheet": "Balance Sheet",
              "blocks": "Block Income",
              "fds": "Fixed Deposits",
              "overview": "Budgets",
              "expenses": "Expenses",
            };
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  triggerLightHaptic();
                  setActiveTab(tab);
                }}
                className={`h-11 justify-center items-center px-4 rounded-lg ${isSelected ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className={`text-[10px] font-bold text-center ${isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                  {displayNames[tab]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Panel 1: Balance Sheet Statement & General Ledger */}
      {activeTab === "balance-sheet" && (
        <View className="gap-6">
          {/* Balance Sheet Statement */}
          <Card className="border border-border-light dark:border-border-dark p-5 bg-card-light dark:bg-card-dark gap-4">
            <View className="flex-row justify-between items-center border-b border-border-light/60 dark:border-border-dark/60 pb-2">
              <View className="flex-1 pr-2">
                <Text className="text-foreground-light dark:text-white font-extrabold text-xs uppercase tracking-wider" numberOfLines={1}>
                  Statement of Financial Position
                </Text>
                <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-bold uppercase tracking-wide mt-0.5" numberOfLines={1}>
                  General Trial Balance (FY 2025-2026)
                </Text>
              </View>
              <View className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex-shrink-0">
                <Text className="text-amber-700 dark:text-amber-500 text-[8px] font-extrabold uppercase">Balanced Ledger</Text>
              </View>
            </View>

            {/* Inflow & Outflow T-Ledger Grid */}
            <View className="flex-row gap-3">
              {/* Left Column: Inflows (Receipts) */}
              <View className="flex-1 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/15 justify-between">
                <View className="space-y-4">
                  <Text className="text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider border-b border-emerald-500/20 pb-2 mb-3">
                    RECEIPTS
                  </Text>
                  
                  <View className="mb-3.5">
                    <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                      Opening Balance
                    </Text>
                    <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                      Cash: ₹2,900 • Bank: ₹10,43,066
                    </Text>
                    <Text className="text-xs font-black font-mono text-foreground-light dark:text-white mt-1">
                      ₹1,045,966
                    </Text>
                  </View>

                  <View className="border-t border-emerald-500/10 pt-3.5">
                    <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                      Maintenance Deposits
                    </Text>
                    <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                      Towers Block B-J & Shops
                    </Text>
                    <Text className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹{totalDuesCollected.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View className="border-t border-emerald-500/20 pt-4 flex-row justify-between items-center mt-6">
                  <Text className="text-[9px] font-black text-emerald-800 dark:text-emerald-400 uppercase">Total Inflow</Text>
                  <Text className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-400">
                    ₹{(1045966 + totalDuesCollected).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Right Column: Outflows (Payments & Reserves) */}
              <View className="flex-1 bg-zinc-500/5 dark:bg-zinc-800/10 p-3.5 rounded-2xl border border-border-light dark:border-zinc-800/60 justify-between">
                <View className="space-y-4">
                  <Text className="text-foreground-light dark:text-white font-black text-[10px] uppercase tracking-wider border-b border-border-light/20 dark:border-zinc-800 pb-2 mb-3">
                    PAYMENTS
                  </Text>

                  <View className="mb-3.5">
                    <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                      FD Placement
                    </Text>
                    <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                      Reserves at KDCC Bank
                    </Text>
                    <Text className="text-xs font-black font-mono text-foreground-light dark:text-white mt-1">
                      ₹{totalFds.toLocaleString()}
                    </Text>
                  </View>

                  <View className="border-t border-border-light/40 dark:border-zinc-800/60 pt-3.5">
                    <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                      Operating Expenses
                    </Text>
                    <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                      Watchman, electricity, repairs
                    </Text>
                    <Text className="text-xs font-black font-mono text-rose-500 mt-1">
                      ₹{totalSpent.toLocaleString()}
                    </Text>
                  </View>

                  <View className="border-t border-border-light/40 dark:border-zinc-800/60 pt-3.5">
                    <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                      Closing Balance
                    </Text>
                    <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                      Cash: ₹1,653 • Bank: ₹{((1045966 + totalDuesCollected) - totalSpent - totalFds - 1653).toLocaleString()}
                    </Text>
                    <Text className="text-xs font-black font-mono text-foreground-light dark:text-white mt-1">
                      ₹{((1045966 + totalDuesCollected) - totalSpent - totalFds).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View className="border-t border-border-light/60 dark:border-zinc-800 pt-4 flex-row justify-between items-center mt-6">
                  <Text className="text-[9px] font-black text-foreground-light dark:text-white uppercase">Total Outflow</Text>
                  <Text className="text-xs font-black font-mono text-foreground-light dark:text-white">
                    ₹{(1045966 + totalDuesCollected).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* General Ledger Transactions Feed */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <SectionHeader title="Chronological General Ledger" />
              {/* Type Switcher Chips */}
              <View className="flex-row bg-muted-light dark:bg-muted-dark p-1 rounded-lg border border-border-light/50 dark:border-border-dark/50 gap-1">
                {(["ALL", "INFLOW", "OUTFLOW"] as const).map((filter) => {
                  const isActive = ledgerFilter === filter;
                  const filterLabels = { ALL: "All", INFLOW: "Dr", OUTFLOW: "Cr" };
                  return (
                    <Pressable
                      key={filter}
                      onPress={() => setLedgerFilter(filter)}
                      className={`px-2 py-1 rounded ${isActive ? "bg-card-light dark:bg-card-dark" : ""}`}
                      accessibilityRole="button"
                    >
                      <Text className={`text-[10px] font-bold ${isActive ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                        {filterLabels[filter]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {filteredTransactions.length === 0 ? (
              <Card className="items-center py-10">
                <Ionicons name="receipt-outline" size={32} color="#78716c" />
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-3">No ledger records match filters</Text>
              </Card>
            ) : (
              filteredTransactions.map((tx: any) => {
                const isInflow = tx.type === "INFLOW";
                return (
                  <Card key={tx.id} className="flex-row items-center gap-3 bg-card-light dark:bg-card-dark border border-border-light/40 dark:border-border-dark/40 py-3.5">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isInflow ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                      <Ionicons
                        name={isInflow ? "arrow-down-outline" : "arrow-up-outline"}
                        size={15}
                        color={isInflow ? "#10b981" : "#ef4444"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xs">
                        {tx.title}
                      </Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-semibold mt-0.5" numberOfLines={1}>
                        {tx.details}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className={`${isInflow ? "text-emerald-500 font-extrabold" : "text-rose-500 font-bold"} text-xs font-mono`}>
                        {isInflow ? "+" : "-"}₹{tx.amount.toLocaleString()}
                      </Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[8px] font-medium uppercase font-mono">
                        {new Date(tx.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </Text>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </View>
      )}

      {/* Tab Panel: Block Income (Radhekrishan Park Page 2) */}
      {activeTab === "blocks" && (
        <View className="gap-5">
          <SectionHeader title="Block-wise Maintenance Collections" />
          {blockSummaries.length === 0 ? (
            <Card className="items-center py-10">
              <Ionicons name="business-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-zinc-400 text-xs mt-3">No block collections recorded yet</Text>
            </Card>
          ) : (
            <Card className="p-0 border border-border-light dark:border-border-dark overflow-hidden">
              <View className="flex-row bg-muted-light dark:bg-zinc-800 px-4 py-3 border-b border-border-light dark:border-zinc-700">
                <Text className="flex-1 text-xxs font-extrabold uppercase tracking-wider text-muted-foreground-light dark:text-zinc-400">Block / Shop Name</Text>
                <Text className="text-xxs font-extrabold uppercase tracking-wider text-muted-foreground-light dark:text-zinc-400 text-right font-mono">Amount Collected</Text>
              </View>
              {blockSummaries.map((b: any, index: number) => (
                <View key={b.blockName} className={`flex-row px-4 py-3.5 items-center border-b border-border-light/40 dark:border-zinc-800/40 ${index % 2 === 1 ? "bg-muted-light/10 dark:bg-zinc-800/10" : ""}`}>
                  <Text className="flex-1 text-foreground-light dark:text-white text-xs font-bold">{b.blockName}</Text>
                  <Text className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs font-mono">₹{b.amount.toLocaleString()}</Text>
                </View>
              ))}
              <View className="flex-row bg-emerald-500/5 px-4 py-4 items-center">
                <Text className="flex-1 text-emerald-800 dark:text-emerald-500 text-xs font-black uppercase tracking-wider">Total Collection</Text>
                <Text className="text-emerald-800 dark:text-emerald-500 font-black text-sm font-mono">₹{totalDuesCollected.toLocaleString()}</Text>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Tab Panel: Fixed Deposits (Radhekrishan Park Page 3) */}
      {activeTab === "fds" && (
        <View className="gap-5">
          <SectionHeader
            title="Fixed Deposit Ledger"
            rightElement={
              <Pressable
                onPress={() => setFdModalVisible(true)}
                className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel="Log new FD asset"
              >
                <Ionicons name="add" size={14} color={primaryColor} />
                <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Log FD Asset</Text>
              </Pressable>
            }
          />

          <Card className="bg-amber-500/10 border border-amber-500/25 p-4 flex-row justify-between items-center mb-1">
            <View>
              <Text className="text-amber-800 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider">Total FD Investments</Text>
              <Text className="text-amber-800 dark:text-amber-500 font-black text-lg mt-1 font-mono">₹{totalFds.toLocaleString()}</Text>
            </View>
            <Ionicons name="server-outline" size={28} color={primaryColor} />
          </Card>

          {fds.length === 0 ? (
            <Card className="items-center py-10">
              <Ionicons name="folder-open-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-zinc-400 text-xs mt-3">No Fixed Deposits registered yet</Text>
            </Card>
          ) : (
            fds.map((f: any) => (
              <Card key={f.id} className="flex-row items-center justify-between border border-border-light dark:border-border-dark py-4">
                <View className="flex-1 pr-3">
                  <Text className="text-foreground-light dark:text-white font-extrabold text-sm">{f.bankName}</Text>
                  <Text className="text-muted-foreground-light dark:text-zinc-400 text-xxs mt-1 font-mono">
                    Opened: {new Date(f.startDate).toLocaleDateString()}
                    {f.maturityDate ? ` • Matures: ${new Date(f.maturityDate).toLocaleDateString()}` : ""}
                  </Text>
                  {f.interestRate ? (
                    <View className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mt-2 rounded-lg self-start">
                      <Text className="text-amber-700 dark:text-amber-500 text-[10px] font-bold font-mono">Rate: {f.interestRate}% p.a.</Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-row items-center gap-4">
                  <Text className="text-foreground-light dark:text-white font-black text-sm font-mono">₹{f.amount.toLocaleString()}</Text>
                  <Pressable
                    onPress={() => handleDeleteFd(f.id)}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 active:opacity-75"
                    accessibilityRole="button"
                    accessibilityLabel="Liquidate Fixed Deposit"
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {/* Tab Panel 2: Budgets Breakdown (Visual Charts & Lists) */}
      {activeTab === "overview" && (
        <View className="gap-5">
          <TreasuryCharts budgets={budgets} expenses={expenses} />

          <SectionHeader
            title="Active Budgets"
            rightElement={
              <Pressable
                onPress={() => setBudgetModalVisible(true)}
                className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel="Create new budget"
              >
                <Ionicons name="add" size={14} color={primaryColor} />
                <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">New Budget</Text>
              </Pressable>
            }
          />

          {budgets.length === 0 ? (
            <Card className="items-center py-10">
              <Ionicons name="list" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-3">No budgets allocated yet</Text>
            </Card>
          ) : (
            budgets.map((b: any) => {
              const spentPercentage = Math.min((b.spentAmount / b.allocatedAmount) * 100, 100);
              return (
                <Card key={b.id} className="gap-3.5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                        {b.title}
                      </Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                        Yearly allocation
                      </Text>
                    </View>
                    <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm font-mono">
                      ₹{b.allocatedAmount.toLocaleString()}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="gap-1.5">
                    <View className="h-2 w-full bg-muted-light dark:bg-muted-dark rounded-full overflow-hidden">
                      <View
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${spentPercentage}%` }}
                      />
                    </View>
                    <View className="flex-row justify-between text-xxs mt-0.5">
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                        Spent: ₹{b.spentAmount.toLocaleString()} ({spentPercentage.toFixed(0)}%)
                      </Text>
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                        Left: ₹{(b.allocatedAmount - b.spentAmount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      )}

      {/* Tab Panel 3: Expenses list */}
      {activeTab === "expenses" && (
        <View className="gap-5">
          <SectionHeader
            title="Expenses Log"
            rightElement={
              <Pressable
                onPress={() => setExpenseModalVisible(true)}
                className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel="Log new expense"
              >
                <Ionicons name="add" size={14} color={primaryColor} />
                <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Log Expense</Text>
              </Pressable>
            }
          />

          {expenses.length === 0 ? (
            <Card className="items-center py-10">
              <Ionicons name="receipt-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-3">No expenses logged yet</Text>
            </Card>
          ) : (
            expenses.map((e: any) => {
              let catColor = "bg-zinc-500/10 border-zinc-500/20 text-zinc-500";
              if (e.category === "SALARIES") catColor = "bg-sky-500/10 border-sky-500/20 text-sky-500";
              if (e.category === "FESTIVAL") catColor = "bg-amber-500/10 border-amber-500/20 text-amber-500";
              if (e.category === "REPAIRS") catColor = "bg-rose-500/10 border-rose-500/20 text-rose-500";
              if (e.category === "UTILITIES") catColor = "bg-purple-500/10 border-purple-500/20 text-purple-500";

              return (
                <Card key={e.id} className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                      {e.title}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                      {new Date(e.date).toLocaleDateString()} {e.description ? `• ${e.description}` : ""}
                    </Text>
                    <View className="flex-row gap-1 mt-1.5">
                      <View className={`px-2 py-0.5 rounded border ${catColor}`}>
                        <Text className="text-xxs font-bold uppercase tracking-wider">{e.category}</Text>
                      </View>
                      {e.budget && (
                        <View className="px-2 py-0.5 rounded border border-border-light dark:border-border-dark bg-muted-light dark:bg-muted-dark">
                          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-mono">{e.budget.title}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text className="text-rose-500 dark:text-foreground-dark font-extrabold text-sm font-mono">
                    -₹{e.amount.toLocaleString()}
                  </Text>
                </Card>
              );
            })
          )}
        </View>
      )}


      {/* Form Modals */}
      <BudgetFormModal
        visible={budgetModalVisible}
        onClose={() => setBudgetModalVisible(false)}
        onSubmit={handleCreateBudget}
        isSubmitting={createBudgetMutation.isPending}
      />

      <ExpenseFormModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        onSubmit={handleCreateExpense}
        isSubmitting={createExpenseMutation.isPending}
        budgets={budgets}
      />

      <FestivalFormModal
        visible={festivalModalVisible}
        onClose={() => setFestivalModalVisible(false)}
        onSubmit={handleCreateFestival}
        isSubmitting={createFestivalMutation.isPending}
      />

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleTriggerExport}
        isExporting={isExporting}
      />

      <FdFormModal
        visible={fdModalVisible}
        onClose={() => setFdModalVisible(false)}
        onSubmit={handleCreateFd}
      />
    </ScreenContainer>
  );
}

export default TreasuryView;

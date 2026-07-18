import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import {
  useBudgetsQuery,
  useCreateBudgetMutation,
  useExpensesQuery,
  useCreateExpenseMutation,
  useFestivalsQuery,
  useCreateFestivalMutation,
  useAdminDuesQuery,
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
import { type CreateBudgetFormData, type CreateExpenseFormData, type CreateFestivalFormData } from "@/lib/form-schemas";

export function TreasuryView() {
  const { data: budgets = [], isLoading: budgetsLoading, refetch: refetchBudgets } = useBudgetsQuery();
  const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = useExpensesQuery();
  const { data: festivals = [], isLoading: festivalsLoading, refetch: refetchFestivals } = useFestivalsQuery();
  const { data: duesData, isLoading: duesLoading, refetch: refetchDues } = useAdminDuesQuery();

  const dues = duesData?.data || [];

  const createBudgetMutation = useCreateBudgetMutation();
  const createExpenseMutation = useCreateExpenseMutation();
  const createFestivalMutation = useCreateFestivalMutation();

  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { activeTab, setActiveTab, ledgerFilter, setLedgerFilter } = useTreasuryStore();

  // Modal States
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [festivalModalVisible, setFestivalModalVisible] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchBudgets(), refetchExpenses(), refetchFestivals(), refetchDues()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBudgets, refetchExpenses, refetchFestivals, refetchDues]);

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
      await exportTreasuryReport(budgets, expenses, festivals, {
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

  if (budgetsLoading || expensesLoading || festivalsLoading || duesLoading) {
    return <Loader />;
  }

  // Summary Metrics Calculation
  const totalBudgeted = budgets.reduce((acc: number, b: any) => acc + b.allocatedAmount, 0);
  const totalSpent = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const remainingFunds = totalBudgeted - totalSpent;

  // Real Balance Sheet Metrics
  const paidDues = dues.filter((d: any) => d.status === "PAID");
  const unpaidDues = dues.filter((d: any) => d.status !== "PAID");

  const totalDuesCollected = paidDues.reduce((acc: number, d: any) => acc + d.amount, 0);
  const totalDuesReceivable = unpaidDues.reduce((acc: number, d: any) => acc + d.amount, 0);

  const retainedSurplus = totalDuesCollected - totalSpent;

  // General Ledger: Chronologically merge Paid Dues (inflow) and Logged Expenses (outflow)
  const generalLedger = [
    ...paidDues.map((d: any) => ({
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
      <View className="flex-row gap-3 mb-6">
        <Card className="flex-1 bg-emerald-500/10 border border-emerald-500/25 p-3.5 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-bold uppercase tracking-wider">
            Total Income
          </Text>
          <Text className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm mt-1 font-mono">
            ₹{totalDuesCollected.toLocaleString()}
          </Text>
        </Card>
        <Card className="flex-1 bg-rose-500/10 border border-rose-500/25 p-3.5 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-bold uppercase tracking-wider">
            Total Outflow
          </Text>
          <Text className="text-rose-500 dark:text-rose-400 font-extrabold text-sm mt-1 font-mono">
            ₹{totalSpent.toLocaleString()}
          </Text>
        </Card>
        <Card className="flex-1 bg-amber-500/10 border border-amber-500/25 p-3.5 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-bold uppercase tracking-wider">
            Net Surplus
          </Text>
          <Text className={`${retainedSurplus >= 0 ? "text-amber-600 dark:text-amber-500" : "text-rose-500"} font-extrabold text-sm mt-1 font-mono`}>
            {retainedSurplus < 0 ? "-" : ""}₹{Math.abs(retainedSurplus).toLocaleString()}
          </Text>
        </Card>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-muted-light dark:bg-muted-dark p-1 rounded-xl mb-6">
        {(["balance-sheet", "overview", "expenses", "festivals"] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const displayNames = {
            "balance-sheet": "Balance Sheet",
            "overview": "Budgets Dept",
            "expenses": "Expenses",
            "festivals": "Festivals",
          };
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-lg items-center ${isSelected ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <Text className={`text-xs font-extrabold ${isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                {displayNames[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab Panel 1: Balance Sheet Statement & General Ledger */}
      {activeTab === "balance-sheet" && (
        <View className="gap-6">
          {/* Balance Sheet Statement */}
          <Card className="border border-border-light dark:border-border-dark p-5 bg-card-light dark:bg-card-dark gap-4">
            <Text className="text-foreground-light dark:text-white font-extrabold text-sm uppercase tracking-wider border-b border-border-light/60 dark:border-border-dark/60 pb-2">
              Statement of Financial Position
            </Text>

            {/* Inflows/Assets */}
            <View className="gap-2.5">
              <Text className="text-muted-foreground-light dark:text-zinc-400 text-xxs font-bold uppercase tracking-wider">
                Sources of Funds (Cash Inflow)
              </Text>
              <View className="flex-row justify-between text-xs font-semibold">
                <Text className="text-foreground-light dark:text-zinc-300">Maintenance Collections</Text>
                <Text className="text-foreground-light dark:text-white font-mono">₹{totalDuesCollected.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between text-xs font-semibold">
                <Text className="text-foreground-light dark:text-zinc-300">Outstanding Receivables (Unpaid)</Text>
                <Text className="text-muted-foreground-light dark:text-zinc-500 font-mono">₹{totalDuesReceivable.toLocaleString()}</Text>
              </View>
            </View>

            {/* Outflows/Liabilities */}
            <View className="gap-2.5 border-t border-border-light/40 dark:border-border-dark/40 pt-3">
              <Text className="text-muted-foreground-light dark:text-zinc-400 text-xxs font-bold uppercase tracking-wider">
                Application of Funds (Cash Outflow)
              </Text>
              <View className="flex-row justify-between text-xs font-semibold">
                <Text className="text-foreground-light dark:text-zinc-300">Logged Departmental Expenses</Text>
                <Text className="text-rose-500 font-mono">₹{totalSpent.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between text-xs font-semibold">
                <Text className="text-foreground-light dark:text-zinc-300">Earmarked Dept Budgets (Allocated)</Text>
                <Text className="text-foreground-light dark:text-white font-mono">₹{totalBudgeted.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between text-xs font-semibold">
                <Text className="text-foreground-light dark:text-zinc-300">Budget Overrun / Variance</Text>
                <Text className={`${remainingFunds >= 0 ? "text-emerald-500" : "text-rose-500"} font-mono`}>
                  {remainingFunds >= 0 ? "+" : ""}₹{remainingFunds.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Total Balance */}
            <View className="flex-row justify-between border-t border-border-light/60 dark:border-border-dark/60 pt-3.5 mt-1 font-bold">
              <Text className="text-foreground-light dark:text-white text-xs font-extrabold uppercase tracking-wider">
                Net Retained Reserves
              </Text>
              <Text className={`${retainedSurplus >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"} text-sm font-black font-mono`}>
                {retainedSurplus < 0 ? "-" : ""}₹{Math.abs(retainedSurplus).toLocaleString()}
              </Text>
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

      {/* Tab Panel 4: Festivals list */}
      {activeTab === "festivals" && (
        <View className="gap-5">
          <SectionHeader
            title="Festival Plans"
            rightElement={
              <Pressable
                onPress={() => setFestivalModalVisible(true)}
                className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel="Plan new festival"
              >
                <Ionicons name="add" size={14} color={primaryColor} />
                <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Plan Festival</Text>
              </Pressable>
            }
          />

          {festivals.length === 0 ? (
            <Card className="items-center py-10">
              <Ionicons name="calendar-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-3">No festivals planned yet</Text>
            </Card>
          ) : (
            festivals.map((f: any) => (
              <Card key={f.id} className="gap-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                      {f.name}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                      Date: {new Date(f.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="sparkles-outline" size={18} color="#eab308" />
                </View>

                {f.description ? (
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs bg-muted-light/30 dark:bg-muted-dark/30 p-2.5 rounded-xl border border-border-light/40 dark:border-border-dark/40">
                    {f.description}
                  </Text>
                ) : null}

                {f.budget ? (
                  <View className="flex-row justify-between items-center bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                    <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold">Allocated Budget</Text>
                    <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xs font-mono">
                      ₹{f.budget.allocatedAmount.toLocaleString()} (Spent: ₹{f.budget.spentAmount.toLocaleString()})
                    </Text>
                  </View>
                ) : (
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs italic">
                    No budget linked to this festival
                  </Text>
                )}
              </Card>
            ))
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
    </ScreenContainer>
  );
}

export default TreasuryView;

import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import {
  useBudgetsQuery,
  useCreateBudgetMutation,
  useExpensesQuery,
  useCreateExpenseMutation,
  useFestivalsQuery,
  useCreateFestivalMutation,
} from "@/queries/admin";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";
import { TreasuryCharts } from "./treasury-chart";

export function TreasuryView() {
  const { data: budgets = [], isLoading: budgetsLoading, refetch: refetchBudgets } = useBudgetsQuery();
  const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = useExpensesQuery();
  const { data: festivals = [], isLoading: festivalsLoading, refetch: refetchFestivals } = useFestivalsQuery();

  const createBudgetMutation = useCreateBudgetMutation();
  const createExpenseMutation = useCreateExpenseMutation();
  const createFestivalMutation = useCreateFestivalMutation();

  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "festivals">("overview");

  // Modal States
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [festivalModalVisible, setFestivalModalVisible] = useState(false);

  // Form Fields
  const [budgetTitle, setBudgetTitle] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<"MAINTENANCE" | "UTILITIES" | "SALARIES" | "FESTIVAL" | "REPAIRS" | "OTHERS">("MAINTENANCE");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseBudgetId, setExpenseBudgetId] = useState("");

  const [festivalName, setFestivalName] = useState("");
  const [festivalDesc, setFestivalDesc] = useState("");
  const [festivalBudget, setFestivalBudget] = useState("");

  const handleCreateBudget = async () => {
    if (!budgetTitle.trim() || !budgetAmount) {
      showToast("Please fill in all fields", "error");
      return;
    }
    try {
      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      await createBudgetMutation.mutateAsync({
        title: budgetTitle.trim(),
        allocatedAmount: parseFloat(budgetAmount),
        startDate: now.toISOString(),
        endDate: endOfYear.toISOString(),
      });
      showToast("Budget allocated successfully", "success");
      setBudgetTitle("");
      setBudgetAmount("");
      setBudgetModalVisible(false);
      refetchBudgets();
    } catch (err: any) {
      showToast(err.message || "Failed to create budget", "error");
    }
  };

  const handleCreateExpense = async () => {
    if (!expenseTitle.trim() || !expenseAmount) {
      showToast("Please fill in title and amount", "error");
      return;
    }
    try {
      await createExpenseMutation.mutateAsync({
        title: expenseTitle.trim(),
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription.trim() || undefined,
        date: new Date().toISOString(),
        budgetId: expenseBudgetId || undefined,
      });
      showToast("Expense logged successfully", "success");
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseBudgetId("");
      setExpenseModalVisible(false);
      refetchExpenses();
      refetchBudgets();
    } catch (err: any) {
      showToast(err.message || "Failed to log expense", "error");
    }
  };

  const handleCreateFestival = async () => {
    if (!festivalName.trim()) {
      showToast("Festival name is required", "error");
      return;
    }
    try {
      await createFestivalMutation.mutateAsync({
        name: festivalName.trim(),
        description: festivalDesc.trim() || undefined,
        date: new Date().toISOString(),
        allocatedBudget: festivalBudget ? parseFloat(festivalBudget) : undefined,
      });
      showToast("Festival planned successfully", "success");
      setFestivalName("");
      setFestivalDesc("");
      setFestivalBudget("");
      setFestivalModalVisible(false);
      refetchFestivals();
      refetchBudgets();
    } catch (err: any) {
      showToast(err.message || "Failed to schedule festival", "error");
    }
  };

  if (budgetsLoading || expensesLoading || festivalsLoading) {
    return <Loader />;
  }

  // Summary Metrics
  const totalBudgeted = budgets.reduce((acc: number, b: any) => acc + b.allocatedAmount, 0);
  const totalSpent = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const remainingFunds = totalBudgeted - totalSpent;

  const primaryColor = colorScheme === "dark" ? "#f97316" : "#b45309";
  const primaryLight = colorScheme === "dark" ? "#44403c" : "#e8e5dc";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Treasury & Budgets</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Track budgets, log expenditures, and manage festivals
          </Text>
        </View>
        <Ionicons name="wallet-outline" size={28} color={primaryColor} />
      </View>

      {/* Overview Cards */}
      <View className="flex-row gap-3 mb-6">
        <Card className="flex-1 bg-amber-500/10 border border-amber-500/25 p-3.5 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold uppercase tracking-wider">
            Total Allocated
          </Text>
          <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-base mt-1">
            ₹{totalBudgeted.toLocaleString()}
          </Text>
        </Card>
        <Card className="flex-1 bg-rose-500/10 border border-rose-500/25 p-3.5 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold uppercase tracking-wider">
            Total Spent
          </Text>
          <Text className="text-rose-500 dark:text-foreground-dark font-extrabold text-base mt-1">
            ₹{totalSpent.toLocaleString()}
          </Text>
        </Card>
        <Card className="flex-1 bg-emerald-500/10 border border-emerald-500/25 p-3.5 items-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold uppercase tracking-wider">
            Remaining
          </Text>
          <Text className="text-emerald-500 dark:text-foreground-dark font-extrabold text-base mt-1">
            ₹{remainingFunds.toLocaleString()}
          </Text>
        </Card>
      </View>

      {/* Visual Graphs & Charts Breakdown */}
      <TreasuryCharts budgets={budgets} expenses={expenses} />

      {/* Tabs */}
      <View className="flex-row bg-muted-light dark:bg-muted-dark p-1 rounded-xl mb-6">
        <Pressable
          onPress={() => setActiveTab("overview")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "overview" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "overview" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            Overview
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("expenses")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "expenses" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "expenses" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            Expenses
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("festivals")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "festivals" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "festivals" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            Festivals
          </Text>
        </Pressable>
      </View>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <View className="gap-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Active Budgets</Text>
            <Pressable
              onPress={() => setBudgetModalVisible(true)}
              className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
            >
              <Ionicons name="add" size={14} color={primaryColor} />
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">New Budget</Text>
            </Pressable>
          </View>

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

      {activeTab === "expenses" && (
        <View className="gap-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Expenses Log</Text>
            <Pressable
              onPress={() => setExpenseModalVisible(true)}
              className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
            >
              <Ionicons name="add" size={14} color={primaryColor} />
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Log Expense</Text>
            </Pressable>
          </View>

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

      {activeTab === "festivals" && (
        <View className="gap-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Festival Plans</Text>
            <Pressable
              onPress={() => setFestivalModalVisible(true)}
              className="bg-primary-light/10 dark:bg-primary-dark/10 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-75"
            >
              <Ionicons name="add" size={14} color={primaryColor} />
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Plan Festival</Text>
            </Pressable>
          </View>

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

      {/* BUDGET MODAL */}
      <Modal visible={budgetModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Allocate Budget</Text>
              <Pressable onPress={() => setBudgetModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                Budget Title
              </Text>
              <TextInput
                value={budgetTitle}
                onChangeText={setBudgetTitle}
                placeholder="e.g. Festival Season 2026"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                Allocated Amount (INR)
              </Text>
              <TextInput
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="numeric"
                placeholder="e.g. 50000"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
              />
            </View>

            <Pressable
              onPress={handleCreateBudget}
              disabled={createBudgetMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {createBudgetMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Budget</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* EXPENSE MODAL */}
      <Modal visible={expenseModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Log Expense</Text>
              <Pressable onPress={() => setExpenseModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[360px] gap-4">
              <View className="gap-1.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Expense Title
                </Text>
                <TextInput
                  value={expenseTitle}
                  onChangeText={setExpenseTitle}
                  placeholder="e.g. Electric Bill July"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>

              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Amount (INR)
                </Text>
                <TextInput
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="numeric"
                  placeholder="e.g. 1500"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
                />
              </View>

              {/* Category selector */}
              <View className="gap-1.5 mt-3">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {(["MAINTENANCE", "UTILITIES", "SALARIES", "FESTIVAL", "REPAIRS", "OTHERS"] as const).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setExpenseCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg border ${
                        expenseCategory === cat
                          ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                          : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                      }`}
                    >
                      <Text className={`text-xxs uppercase tracking-wider ${expenseCategory === cat ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Budget connector */}
              {budgets.length > 0 && (
                <View className="gap-1.5 mt-3">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                    Link to Budget (Optional)
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    <Pressable
                      onPress={() => setExpenseBudgetId("")}
                      className={`px-2.5 py-1.5 rounded-lg border ${
                        expenseBudgetId === ""
                          ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                          : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                      }`}
                    >
                      <Text className={`text-xxs ${expenseBudgetId === "" ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                        None
                      </Text>
                    </Pressable>
                    {budgets.map((b: any) => (
                      <Pressable
                        key={b.id}
                        onPress={() => setExpenseBudgetId(b.id)}
                        className={`px-2.5 py-1.5 rounded-lg border ${
                          expenseBudgetId === b.id
                            ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                            : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                        }`}
                      >
                        <Text className={`text-xxs ${expenseBudgetId === b.id ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                          {b.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <View className="gap-1.5 mt-3 mb-2">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                  Description
                </Text>
                <TextInput
                  value={expenseDescription}
                  onChangeText={setExpenseDescription}
                  placeholder="e.g. Main gate lights repairs"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
                />
              </View>
            </ScrollView>

            <Pressable
              onPress={handleCreateExpense}
              disabled={createExpenseMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {createExpenseMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Expense</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* FESTIVAL MODAL */}
      <Modal visible={festivalModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Plan Festival Event</Text>
              <Pressable onPress={() => setFestivalModalVisible(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                Festival Name
              </Text>
              <TextInput
                value={festivalName}
                onChangeText={setFestivalName}
                placeholder="e.g. Diwali Festivities 2026"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                Description
              </Text>
              <TextInput
                value={festivalDesc}
                onChangeText={setFestivalDesc}
                placeholder="Details of celebration & events"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
                Allocate Budget (Optional)
              </Text>
              <TextInput
                value={festivalBudget}
                onChangeText={setFestivalBudget}
                keyboardType="numeric"
                placeholder="e.g. 20000 (auto-creates linked budget)"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-mono"
              />
            </View>

            <Pressable
              onPress={handleCreateFestival}
              disabled={createFestivalMutation.isPending}
              className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            >
              {createFestivalMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Plan</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

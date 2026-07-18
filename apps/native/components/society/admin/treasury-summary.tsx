import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBudgetsQuery, useExpensesQuery } from "../../../queries/admin";
import { Card } from "../../ui/card";

export function TreasurySummary() {
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery();
  const { data: expenses = [], isLoading: expensesLoading } = useExpensesQuery();

  const totalBudgeted = budgets.reduce((acc: number, b: any) => acc + b.allocatedAmount, 0);
  const totalSpent = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const remainingFunds = totalBudgeted - totalSpent;

  return (
    <View className="mb-6">
      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mb-3 uppercase tracking-wider">
        Treasury Statement
      </Text>
      <Card className="p-4 border border-border-light dark:border-border-dark bg-muted-light/5 dark:bg-muted-dark/5 gap-3.5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-bold uppercase tracking-wider">
              Available Cash Balance
            </Text>
            <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black font-mono mt-0.5">
              ₹{budgetsLoading || expensesLoading ? "—" : remainingFunds.toLocaleString()}
            </Text>
          </View>
          <View className="bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20">
            <Ionicons name="stats-chart" size={18} color="#10b981" />
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-border-light/40 dark:border-border-dark/40">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-bold uppercase tracking-wider">
              Total Budgeted
            </Text>
            <Text className="text-foreground-light dark:text-foreground-dark text-xs font-extrabold font-mono mt-0.5">
              ₹{budgetsLoading ? "—" : totalBudgeted.toLocaleString()}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-bold uppercase tracking-wider">
              Total Expenditures
            </Text>
            <Text className="text-rose-500 text-xs font-extrabold font-mono mt-0.5">
              ₹{expensesLoading ? "—" : totalSpent.toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";

interface TreasurySummaryCardsProps {
  openingBalanceAmount: number;
  totalDuesCollected: number;
  totalSpent: number;
  totalFds: number;
  liquidReserves: number;
  totalReserves: number;
  totalDuesReceivable: number;
  totalBudgeted: number;
}

export function TreasurySummaryCards({
  openingBalanceAmount,
  totalDuesCollected,
  totalSpent,
  totalFds,
  liquidReserves,
  totalReserves,
  totalDuesReceivable,
  totalBudgeted,
}: TreasurySummaryCardsProps) {
  return (
    <>
      {/* Liquid Reserves & Total Reserves Metric Cards */}
      <View className="flex-row gap-3">
        <Card className="flex-1 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
              Liquid Reserves
            </Text>
            <Ionicons name="wallet" size={16} color="#f59e0b" />
          </View>
          <Text className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono">
            ₹{liquidReserves.toLocaleString()}
          </Text>
          <Text className="text-[9px] text-amber-600/80 dark:text-amber-400/70 font-semibold mt-1">
            Cash & Bank Balance
          </Text>
        </Card>

        <Card className="flex-1 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
              Total Reserves
            </Text>
            <Ionicons name="stats-chart" size={16} color="#10b981" />
          </View>
          <Text className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
            ₹{totalReserves.toLocaleString()}
          </Text>
          <Text className="text-[9px] text-emerald-600/80 dark:text-emerald-400/70 font-semibold mt-1">
            Liquid + Fixed Deposits
          </Text>
        </Card>
      </View>

      {/* Secondary Metrics */}
      <View className="flex-row gap-3">
        <View className="flex-1 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl flex-row items-center gap-2">
          <Ionicons name="arrow-down-circle-outline" size={18} color="#10b981" />
          <View>
            <Text className="text-[9px] text-zinc-500 font-bold uppercase">Pending Dues</Text>
            <Text className="text-xs font-bold text-zinc-200 font-mono">
              ₹{totalDuesReceivable.toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl flex-row items-center gap-2">
          <Ionicons name="pie-chart-outline" size={18} color="#38bdf8" />
          <View>
            <Text className="text-[9px] text-zinc-500 font-bold uppercase">Total Budgeted</Text>
            <Text className="text-xs font-bold text-zinc-200 font-mono">
              ₹{totalBudgeted.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Real Balance Sheet (Receipts & Outflows) */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
        <View className="flex-row items-center justify-between border-b border-border-light dark:border-zinc-800 pb-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="document-text-outline" size={18} color="#f59e0b" />
            <Text className="text-xs font-bold text-foreground-light dark:text-white uppercase tracking-wider">
              Financial Balance Sheet
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 pt-1">
          {/* Left Column: Inflows (Receipts) */}
          <View className="flex-1 bg-emerald-500/5 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-500/20 justify-between">
            <View className="space-y-4">
              <Text className="text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider border-b border-emerald-500/20 pb-2 mb-3">
                RECEIPTS
              </Text>

              <View className="mb-3.5">
                <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                  Opening Balance
                </Text>
                <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                  Initial Cash & Bank
                </Text>
                <Text className="text-xs font-black font-mono text-foreground-light dark:text-white mt-1">
                  ₹{openingBalanceAmount.toLocaleString()}
                </Text>
              </View>

              <View className="border-t border-emerald-500/20 pt-3.5">
                <Text className="text-[10px] font-bold text-foreground-light dark:text-zinc-300">
                  Maintenance Dues
                </Text>
                <Text className="text-[9px] text-muted-foreground-light dark:text-zinc-500 font-semibold mt-0.5">
                  Collected from Residents
                </Text>
                <Text className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  +₹{totalDuesCollected.toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="border-t border-emerald-500/20 pt-4 flex-row justify-between items-center mt-6">
              <Text className="text-[9px] font-black text-emerald-800 dark:text-emerald-400 uppercase">Total Inflow</Text>
              <Text className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-400">
                ₹{(openingBalanceAmount + totalDuesCollected).toLocaleString()}
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
                  Reserves at Bank
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
                  Bank Reserves
                </Text>
                <Text className="text-xs font-black font-mono text-foreground-light dark:text-white mt-1">
                  ₹{((openingBalanceAmount + totalDuesCollected) - totalSpent - totalFds).toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="border-t border-border-light/60 dark:border-zinc-800 pt-4 flex-row justify-between items-center mt-6">
              <Text className="text-[9px] font-black text-foreground-light dark:text-white uppercase">Total Outflow</Text>
              <Text className="text-xs font-black font-mono text-foreground-light dark:text-white">
                ₹{(openingBalanceAmount + totalDuesCollected).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </>
  );
}

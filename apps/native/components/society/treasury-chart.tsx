import React from "react";
import { View, Text, useColorScheme } from "react-native";
import Svg, { Rect, Text as SvgText, G, Line, Circle } from "react-native-svg";
import { Card, CardTitle, CardDescription } from "../ui/card";

type TreasuryChartProps = {
  budgets: any[];
  expenses: any[];
};

export function TreasuryCharts({ budgets, expenses }: TreasuryChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primaryColor = isDark ? "#f97316" : "#b45309";
  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const textColor = isDark ? "#a1a1aa" : "#71717a";

  // 1. Calculate overall budget utilization percentage
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = totalBudgeted - totalSpent;
  const utilizedPercent = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;

  // Donut chart math
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (utilizedPercent / 100) * circumference;

  // 2. Calculate category breakdown for Bar Chart
  const categories = [
    { key: "MAINTENANCE", label: "Maint", color: "#38bdf8" },
    { key: "UTILITIES", label: "Util", color: "#a78bfa" },
    { key: "SALARIES", label: "Salary", color: "#34d399" },
    { key: "FESTIVAL", label: "Fest", color: "#fb923c" },
    { key: "REPAIRS", label: "Repair", color: "#f43f5e" },
    { key: "OTHERS", label: "Other", color: "#71717a" },
  ];

  const categoryData = categories.map((cat) => {
    const amount = expenses
      .filter((e) => e.category === cat.key)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, amount };
  });

  const maxAmount = Math.max(...categoryData.map((d) => d.amount), 1000);

  // Bar Chart Math
  const chartHeight = 110;
  const chartWidth = 260;
  const barWidth = 18;
  const spacing = 22;
  const startX = 40;
  const startY = 10;

  return (
    <View className="gap-5 mb-5">
      {/* Visual Charts Container */}
      <View className="flex-col md:flex-row gap-4">
        {/* Utilization Donut */}
        <Card className="flex-1 items-center justify-center py-5">
          <CardTitle className="text-center mb-1">Utilization Status</CardTitle>
          <CardDescription className="text-center mb-4">Total budget usage</CardDescription>

          <View className="items-center justify-center">
            <Svg width="110" height="110" viewBox="0 0 100 100">
              <G rotation="-90" origin="50, 50">
                {/* Background Circle */}
                <Circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={isDark ? "#27272a" : "#f1f1f0"}
                  strokeWidth={strokeWidth}
                />
                {/* Foreground Progress Circle */}
                {totalBudgeted > 0 && (
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={utilizedPercent > 80 ? "#f43f5e" : primaryColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                )}
              </G>
            </Svg>

            {/* Absolute Centered Text */}
            <View className="absolute items-center justify-center">
              <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm">
                {utilizedPercent.toFixed(0)}%
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] uppercase font-bold tracking-wider">
                Used
              </Text>
            </View>
          </View>

          <View className="flex-row gap-5 mt-4">
            <View className="items-center">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-semibold uppercase tracking-wider">
                Budget
              </Text>
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mt-0.5">
                ₹{(totalBudgeted / 1000).toFixed(1)}k
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-rose-500 text-[11px] font-semibold uppercase tracking-wider">
                Spent
              </Text>
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mt-0.5">
                ₹{(totalSpent / 1000).toFixed(1)}k
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-emerald-500 text-[11px] font-semibold uppercase tracking-wider">
                Remaining
              </Text>
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mt-0.5">
                ₹{(remaining / 1000).toFixed(1)}k
              </Text>
            </View>
          </View>
        </Card>

        {/* Expenses Bar Chart */}
        <Card className="flex-1 py-5">
          <CardTitle className="mb-1 pl-1">Category Breakdown</CardTitle>
          <CardDescription className="mb-4 pl-1">Expenditures per department</CardDescription>

          <View className="items-center justify-center">
            <Svg width={chartWidth} height={chartHeight + 30}>
              <G>
                {/* Horizontal Grid lines & Y Axis Labels */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = startY + chartHeight - ratio * chartHeight;
                  const labelAmount = (ratio * maxAmount / 1000).toFixed(0);
                  return (
                    <G key={idx}>
                      <Line
                        x1={startX}
                        y1={y}
                        x2={chartWidth - 10}
                        y2={y}
                        stroke={gridColor}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <SvgText
                        x={startX - 8}
                        y={y + 4}
                        fill={textColor}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        ₹{labelAmount}k
                      </SvgText>
                    </G>
                  );
                })}

                {/* Draw Columns */}
                {categoryData.map((d, idx) => {
                  const x = startX + idx * (barWidth + spacing) + 10;
                  const barHeight = (d.amount / maxAmount) * chartHeight;
                  const y = startY + chartHeight - barHeight;

                  return (
                    <G key={d.key}>
                      {/* Interactive Bar */}
                      <Rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={d.amount > 0 ? d.color : (isDark ? "#27272a" : "#f4f4f5")}
                        rx="3"
                        ry="3"
                      />

                      {/* X Axis Labels */}
                      <SvgText
                        x={x + barWidth / 2}
                        y={startY + chartHeight + 15}
                        fill={textColor}
                        fontSize="8.5"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {d.label}
                      </SvgText>
                    </G>
                  );
                })}

                {/* X Axis Line */}
                <Line
                  x1={startX - 5}
                  y1={startY + chartHeight}
                  x2={chartWidth - 10}
                  y2={startY + chartHeight}
                  stroke={gridColor}
                  strokeWidth="1.5"
                />
              </G>
            </Svg>
          </View>
        </Card>
      </View>
    </View>
  );
}
export default TreasuryCharts;

import React from "react";
import { ScrollView, Text, Pressable, View } from "react-native";

interface DateChipsProps {
  value: string; // ISO date string "YYYY-MM-DD"
  onChange: (date: string) => void;
  daysToShow?: number;
}

function getUpcomingDays(count: number) {
  const days: { label: string; shortDay: string; date: string; dayNum: number }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const dayNum = d.getDate();
    const shortDay = d.toLocaleDateString("en-US", { weekday: "short" });
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${shortDay} ${dayNum}`;

    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

    days.push({ label, shortDay: `${shortDay}\n${dayNum}`, date: iso, dayNum });
  }

  return days;
}

export function DateChips({ value, onChange, daysToShow = 14 }: DateChipsProps) {
  const days = React.useMemo(() => getUpcomingDays(daysToShow), [daysToShow]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {days.map((day) => {
        const isSelected = value === day.date;
        const isToday = day.date === days[0].date;

        return (
          <Pressable
            key={day.date}
            onPress={() => onChange(day.date)}
            className={`items-center py-2.5 px-3.5 rounded-xl border min-w-[52px] ${
              isSelected
                ? "bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark"
                : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
            }`}
          >
            <Text
              className={`text-[10px] font-medium uppercase ${
                isSelected
                  ? "text-white"
                  : isToday
                  ? "text-primary-light dark:text-primary-dark"
                  : "text-muted-foreground-light dark:text-muted-foreground-dark"
              }`}
            >
              {day.label === "Today" || day.label === "Tomorrow"
                ? day.label.slice(0, 3).toUpperCase()
                : day.shortDay.split("\n")[0].toUpperCase()}
            </Text>
            <Text
              className={`text-base font-bold mt-0.5 ${
                isSelected
                  ? "text-white"
                  : isToday
                  ? "text-primary-light dark:text-primary-dark"
                  : "text-foreground-light dark:text-foreground-dark"
              }`}
            >
              {day.dayNum}
            </Text>
            {isSelected && (
              <View className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

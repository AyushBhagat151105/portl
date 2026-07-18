import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FormModal } from "../../ui/form-modal";
import { FormInput } from "../../ui/form-input";
import { generateDuesSchema, type GenerateDuesFormData } from "../../../lib/form-schemas";

interface GenerateDuesModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateDuesFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function GenerateDuesModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: GenerateDuesModalProps) {
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<GenerateDuesFormData>({
    resolver: zodResolver(generateDuesSchema),
    mode: "onTouched",
    defaultValues: {
      amount: "",
      month: "",
      dueDate: "",
    },
  });

  const selectedMonth = watch("month");
  const selectedDueDate = watch("dueDate");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      reset({
        amount: "",
        month: "",
        dueDate: "",
      });
    }
  }, [visible, reset]);

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

  const handleSelectMonth = (month: string) => {
    setValue("month", month, { shouldValidate: true });
    setValue("dueDate", ""); // Clear due date since it depends on the month
    setShowMonthModal(false);
  };

  const handleSelectDay = (day: number) => {
    if (!selectedMonth) return;
    const { year, monthIndex } = getDaysInMonth(selectedMonth);
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setValue("dueDate", dateStr, { shouldValidate: true });
    setShowDateModal(false);
  };

  const upcomingMonths = getUpcomingMonths();
  const { days = [] } = selectedMonth ? getDaysInMonth(selectedMonth) : {};

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Generate Society Dues"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Generate Dues"
      maxHeight={460}
    >
      {/* Amount Input */}
      <FormInput
        control={control}
        name="amount"
        label="Monthly Maintenance Amount (INR)"
        placeholder="e.g. 2500"
        keyboardType="numeric"
      />

      {/* Month Selector */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
          Billing Month
        </Text>
        <Pressable
          onPress={() => setShowMonthModal(true)}
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 flex-row justify-between items-center"
        >
          <Text className={selectedMonth ? "text-foreground-light dark:text-foreground-dark text-sm" : "text-zinc-500 text-sm"}>
            {selectedMonth || "Select target month"}
          </Text>
          <Ionicons name="calendar-outline" size={16} color="#78716c" />
        </Pressable>
      </View>

      {/* Due Date Selector */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
          Payment Due Date
        </Text>
        <Pressable
          onPress={() => {
            if (!selectedMonth) {
              alert("Please select a billing month first.");
              return;
            }
            setShowDateModal(true);
          }}
          disabled={!selectedMonth}
          className={`bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 flex-row justify-between items-center ${!selectedMonth ? "opacity-50" : ""}`}
        >
          <Text className={selectedDueDate ? "text-foreground-light dark:text-foreground-dark text-sm" : "text-zinc-500 text-sm"}>
            {selectedDueDate ? new Date(selectedDueDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "Select due date"}
          </Text>
          <Ionicons name="time-outline" size={16} color="#78716c" />
        </Pressable>
      </View>

      {/* Internal Month Picker Modal */}
      <Modal visible={showMonthModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-card-light dark:bg-card-dark rounded-t-3xl p-5 max-h-[400px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Select Billing Month</Text>
              <Pressable onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-2 pb-6">
                {upcomingMonths.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => handleSelectMonth(m)}
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

      {/* Internal Date Picker Modal */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-card-light dark:bg-card-dark rounded-t-3xl p-5 max-h-[400px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">Select Payment Due Date</Text>
              <Pressable onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={20} color="#78716c" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap gap-2.5 justify-center pb-6">
                {days.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => handleSelectDay(day)}
                    className="w-12 h-12 justify-center items-center bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark"
                  >
                    <Text className="text-foreground-light dark:text-foreground-dark text-sm font-bold">{day}</Text>
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
export default GenerateDuesModal;

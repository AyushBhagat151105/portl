import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "../../ui/form-modal";
import { FormInput } from "../../ui/form-input";
import { createExpenseSchema, type CreateExpenseFormData } from "../../../lib/form-schemas";

interface ExpenseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseFormData) => Promise<void>;
  isSubmitting: boolean;
  budgets: any[];
}

export function ExpenseFormModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  budgets,
}: ExpenseFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: "",
      amount: "",
      category: "MAINTENANCE",
      description: "",
      budgetId: "",
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        title: "",
        amount: "",
        category: "MAINTENANCE",
        description: "",
        budgetId: "",
      });
    }
  }, [visible, reset]);

  const category = watch("category");
  const budgetId = watch("budgetId");

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Log Expense"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save Expense"
      maxHeight={460}
    >
      <FormInput
        control={control}
        name="title"
        label="Expense Title"
        placeholder="e.g. Electric Bill July"
      />

      <FormInput
        control={control}
        name="amount"
        label="Amount (INR)"
        placeholder="e.g. 1500"
        keyboardType="numeric"
      />

      {/* Category selector */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Category
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {(["MAINTENANCE", "UTILITIES", "SALARIES", "FESTIVAL", "REPAIRS", "OTHERS"] as const).map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setValue("category", cat)}
                className={`px-2.5 py-1.5 rounded-lg border ${
                  isSelected
                    ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                    : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className={`text-xxs uppercase tracking-wider ${isSelected ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Budget connector */}
      {budgets.length > 0 && (
        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
            Link to Budget (Optional)
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            <Pressable
              onPress={() => setValue("budgetId", "")}
              className={`px-2.5 py-1.5 rounded-lg border ${
                budgetId === ""
                  ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                  : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: budgetId === "" }}
            >
              <Text className={`text-xxs ${budgetId === "" ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                None
              </Text>
            </Pressable>
            {budgets.map((b: any) => {
              const isSelected = budgetId === b.id;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => setValue("budgetId", b.id)}
                  className={`px-2.5 py-1.5 rounded-lg border ${
                    isSelected
                      ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                      : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text className={`text-xxs ${isSelected ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                    {b.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <FormInput
        control={control}
        name="description"
        label="Description"
        placeholder="e.g. Main gate lights repairs"
      />
    </FormModal>
  );
}
export default ExpenseFormModal;

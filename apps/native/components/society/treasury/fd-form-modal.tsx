import React, { useState } from "react";
import { View, Text, Modal, Pressable, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FdFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    bankName: string;
    amount: string;
    interestRate?: string;
    startDate: string;
    maturityDate?: string;
  }) => void;
}

export function FdFormModal({ visible, onClose, onSubmit }: FdFormModalProps) {
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureYears, setTenureYears] = useState(1);

  const handleSubmit = () => {
    if (!bankName.trim() || !amount.trim()) return;

    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setFullYear(startDate.getFullYear() + tenureYears);

    onSubmit({
      bankName: bankName.trim(),
      amount: amount.trim(),
      interestRate: interestRate.trim() || undefined,
      startDate: startDate.toISOString(),
      maturityDate: maturityDate.toISOString(),
    });

    // Reset form
    setBankName("");
    setAmount("");
    setInterestRate("");
    setTenureYears(1);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-card-light dark:bg-zinc-900 rounded-t-3xl max-h-[90%] p-6 border-t border-border-light dark:border-zinc-800">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-foreground-light dark:text-white font-extrabold text-lg">Log Fixed Deposit (FD)</Text>
            <Pressable onPress={onClose} className="p-1 rounded-full bg-muted-light dark:bg-zinc-800">
              <Ionicons name="close" size={20} color="#78716c" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            <View>
              <Text className="text-muted-foreground-light dark:text-zinc-400 text-xs font-bold mb-1.5 uppercase tracking-wide">
                Bank / Institution Name
              </Text>
              <TextInput
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. KDCC Bank Mahemdavad"
                placeholderTextColor="#78716c"
                className="bg-muted-light dark:bg-zinc-800 border border-border-light dark:border-zinc-700 px-4 py-3 rounded-xl text-foreground-light dark:text-white text-sm font-semibold"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-muted-foreground-light dark:text-zinc-400 text-xs font-bold mb-1.5 uppercase tracking-wide">
                  Principal Amount (₹)
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 700000"
                  keyboardType="numeric"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-zinc-800 border border-border-light dark:border-zinc-700 px-4 py-3 rounded-xl text-foreground-light dark:text-white text-sm font-semibold font-mono"
                />
              </View>
              <View className="flex-1">
                <Text className="text-muted-foreground-light dark:text-zinc-400 text-xs font-bold mb-1.5 uppercase tracking-wide">
                  Interest Rate (% p.a.)
                </Text>
                <TextInput
                  value={interestRate}
                  onChangeText={setInterestRate}
                  placeholder="e.g. 7.5"
                  keyboardType="numeric"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-zinc-800 border border-border-light dark:border-zinc-700 px-4 py-3 rounded-xl text-foreground-light dark:text-white text-sm font-semibold font-mono"
                />
              </View>
            </View>

            {/* Tenure selection chips instead of complex date pickers */}
            <View>
              <Text className="text-muted-foreground-light dark:text-zinc-400 text-xs font-bold mb-2 uppercase tracking-wide">
                Tenure / Investment Period
              </Text>
              <View className="flex-row gap-2">
                {([1, 2, 3, 5] as const).map((years) => {
                  const isActive = tenureYears === years;
                  return (
                    <Pressable
                      key={years}
                      onPress={() => setTenureYears(years)}
                      className={`flex-1 py-3.5 rounded-xl items-center border ${
                        isActive
                          ? "bg-amber-500/10 border-amber-500"
                          : "bg-muted-light dark:bg-zinc-800 border-border-light dark:border-zinc-700"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isActive ? "text-amber-600 dark:text-amber-500" : "text-foreground-light dark:text-zinc-400"
                        }`}
                      >
                        {years} {years === 1 ? "Year" : "Years"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-muted-foreground-light dark:text-zinc-500 text-[10px] mt-1.5 font-medium">
                Note: Start date will be registered as today, and maturity will be automatically calculated.
              </Text>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!bankName.trim() || !amount.trim()}
              className="bg-amber-600 dark:bg-amber-700 disabled:opacity-40 py-3.5 rounded-xl items-center mt-6 active:opacity-90"
            >
              <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Log Fixed Deposit</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { usePreApproveGuestMutation, useMyFlatsQuery } from "../../queries/society";

export function PreApproveView() {
  const { data: flats } = useMyFlatsQuery();
  const preApproveMutation = usePreApproveGuestMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [flatId, setFlatId] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  React.useEffect(() => {
    if (flats && flats.length > 0 && !flatId) {
      setFlatId(flats[0].id);
    }
  }, [flats]);

  const handlePreApprove = async () => {
    if (!name || !phone || !flatId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const visitor = await preApproveMutation.mutateAsync({
        name,
        phone,
        purpose,
        flatId,
      });
      setGeneratedCode(visitor.preApprovedCode);
      setName("");
      setPhone("");
      setPurpose("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate pass");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <Text className="text-white text-xl font-bold mb-4">Pre-Approve a Guest</Text>

          {generatedCode ? (
            <View className="items-center py-6">
              <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
              <Text className="text-zinc-300 text-sm mt-3 mb-1">Share this 6-digit passcode with your guest:</Text>
              <View className="bg-zinc-950 border border-amber-500/30 px-6 py-4 rounded-xl mt-2 mb-4">
                <Text className="text-amber-500 text-3xl font-extrabold tracking-widest">{generatedCode}</Text>
              </View>
              <Text className="text-zinc-500 text-xs text-center px-4 mb-4">
                The guard will verify this code at the gate to grant instant entry.
              </Text>
              <Pressable
                onPress={() => setGeneratedCode(null)}
                className="bg-zinc-800 border border-zinc-700 py-3 px-6 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold">Generate Another Pass</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              <View>
                <Text className="text-zinc-400 text-xs mb-1.5">Guest Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#52525b"
                  className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800 focus:border-amber-500/50"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-xs mb-1.5">Guest Phone *</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#52525b"
                  keyboardType="phone-pad"
                  className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800 focus:border-amber-500/50"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-xs mb-1.5">Purpose (Optional)</Text>
                <TextInput
                  value={purpose}
                  onChangeText={setPurpose}
                  placeholder="e.g. Dinner Guest"
                  placeholderTextColor="#52525b"
                  className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800 focus:border-amber-500/50"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-xs mb-1.5">Your Flat *</Text>
                {flats && flats.length > 0 ? (
                  <View className="flex-row gap-2 flex-wrap">
                    {flats.map((f: any) => (
                      <Pressable
                        key={f.id}
                        onPress={() => setFlatId(f.id)}
                        className="py-2.5 px-4 rounded-xl border"
                        style={{
                          backgroundColor: flatId === f.id ? "rgba(245, 158, 11, 0.1)" : "#09090b",
                          borderColor: flatId === f.id ? "#f59e0b" : "#27272a",
                        }}
                      >
                        <Text
                          style={{
                            color: flatId === f.id ? "#f59e0b" : "#a1a1aa",
                            fontWeight: flatId === f.id ? "600" : "400",
                          }}
                        >
                          {f.tower.name} - {f.number}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text className="text-rose-500 text-xs">No registered flats found</Text>
                )}
              </View>

              <Pressable
                disabled={preApproveMutation.isPending}
                onPress={handlePreApprove}
                className="bg-amber-600 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-80"
              >
                {preApproveMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Generate Passcode</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useCreatePollMutation } from "../../queries/society";

export function CreatePollView() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["Yes", "No"]);
  const pollMutation = useCreatePollMutation();

  const handleAddOption = () => {
    if (options.length >= 5) {
      Alert.alert("Limit Reached", "A maximum of 5 options are allowed.");
      return;
    }
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      Alert.alert("Limit Reached", "At least 2 options are required.");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (text: string, index: number) => {
    const nextOptions = [...options];
    nextOptions[index] = text;
    setOptions(nextOptions);
  };

  const handleCreatePoll = async () => {
    if (!question) {
      Alert.alert("Error", "Please fill in the poll question");
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter((opt) => opt !== "");
    if (cleanOptions.length < 2) {
      Alert.alert("Error", "At least 2 non-empty options are required");
      return;
    }

    try {
      await pollMutation.mutateAsync({ question, options: cleanOptions });
      Alert.alert("Success ✅", "Community poll created successfully!");
      setQuestion("");
      setOptions(["Yes", "No"]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create poll");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <Text className="text-white text-xl font-bold mb-4">Create Community Poll</Text>

          <View className="gap-4">
            <View>
              <Text className="text-zinc-400 text-xs mb-1.5">Question *</Text>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="e.g. Paint tower gates blue?"
                placeholderTextColor="#52525b"
                className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
              />
            </View>

            <View className="gap-2.5">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-zinc-400 text-xs">Poll Options</Text>
                <Pressable onPress={handleAddOption} className="active:opacity-75">
                  <Text className="text-amber-500 text-xs font-semibold">+ Add Option</Text>
                </Pressable>
              </View>

              {options.map((opt, idx) => (
                <View key={idx} className="flex-row gap-2 items-center">
                  <TextInput
                    value={opt}
                    onChangeText={(text) => handleUpdateOption(text, idx)}
                    placeholder={`Option ${idx + 1}`}
                    placeholderTextColor="#52525b"
                    className="bg-zinc-950 text-white rounded-xl py-2.5 px-4 border border-zinc-800 flex-1 text-sm"
                  />
                  <Pressable onPress={() => handleRemoveOption(idx)} className="p-1.5 active:opacity-75">
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>

            <Pressable
              disabled={pollMutation.isPending}
              onPress={handleCreatePoll}
              className="bg-amber-600 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-80"
            >
              {pollMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Launch Poll</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


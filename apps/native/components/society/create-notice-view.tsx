import React, { useState } from "react";
import { Text, View, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useCreateNoticeMutation } from "../../queries/society";

export function CreateNoticeView() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const noticeMutation = useCreateNoticeMutation();

  const handleAnnounce = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Please fill in all notice fields");
      return;
    }

    try {
      await noticeMutation.mutateAsync({ title, content });
      Alert.alert("Success ✅", "Notice announcement published and broadcasted to all residents!");
      setTitle("");
      setContent("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to publish notice");
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950 px-6 py-4"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <Text className="text-white text-xl font-bold mb-4">Publish Notice</Text>

        <View className="gap-4">
          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Notice Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Lift Maintenance Schedule"
              placeholderTextColor="#52525b"
              className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
            />
          </View>

          <View>
            <Text className="text-zinc-400 text-xs mb-1.5">Notice Body Content *</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Announce details to all residents..."
              placeholderTextColor="#52525b"
              multiline
              numberOfLines={4}
              className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800 h-28 text-align-vertical-top"
            />
          </View>

          <Pressable
            disabled={noticeMutation.isPending}
            onPress={handleAnnounce}
            className="bg-amber-600 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-80"
          >
            {noticeMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Announce & Broadcast</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}


